# Universo DC

Enciclopédia do universo DC feita com **Java + React**: personagens, filmes, séries, jogos, planetas, equipes de heróis, sagas e linha do tempo, com painel administrativo, contas de usuário e upload de mídia para o Amazon S3. A aplicação está publicada na AWS, com o banco de dados no Neon.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React, Vite, Node.js 22 |
| Backend | Java 21, Spring Boot, Spring Data JPA/Hibernate, autenticação JWT |
| Banco de dados | PostgreSQL (Neon em produção) |
| Armazenamento de mídia | Amazon S3 |
| Infraestrutura | AWS (CloudFront, S3, EC2, ECR, IAM), Docker, Terraform |

## Funcionalidades

- **Catálogo público:** personagens, filmes, séries, jogos, planetas, equipes e sagas, cada um com listagem e página de detalhes.
- **Personagens com aparições:** cada personagem pode ser ligado a filmes, séries e jogos, com uma imagem específica para cada aparição, exibida na página do personagem.
- **Equipes de heróis:** grupos como a Liga da Justiça e os Jovens Titãs, com os personagens que os integram.
- **Sagas e HQs:** sagas como New 52 e Era de Ouro, com as HQs em ordem de leitura, cada uma com ano, descrição e capa.
- **Linha do tempo e destaques:** marcos do universo DC e slides de destaque da página inicial, ordenáveis e publicáveis.
- **Galerias de imagens:** filmes, séries, jogos e planetas têm banner e galeria.
- **Contas de usuário:** cadastro e login com JWT. Cada usuário tem uma pasta própria no S3 para as suas mídias.
- **Painel administrativo:** CRUD completo de todos os conteúdos, com upload de imagens direto para o S3. As operações de escrita exigem autenticação.

## Arquitetura

```mermaid
flowchart LR
    U[Usuário] --> CF[CloudFront]
    CF -- "/*" --> S3F[(S3 frontend)]
    CF -- "/api/*" --> EC2[EC2 + Docker<br/>API Spring Boot]
    EC2 --> NEON[(Neon PostgreSQL)]
    EC2 --> S3M[(S3 mídia)]
    ECR[(ECR)] -. imagem Docker .-> EC2
```

O frontend e a API ficam atrás do mesmo domínio do CloudFront, o que evita problemas de CORS e de conteúdo misto (HTTP dentro de página HTTPS).

## Como foi feito o deploy

O objetivo foi um deploy **econômico**, sem servidores gerenciados caros, mas com infraestrutura reproduzível e sem segredos no código.

**Frontend: S3 + CloudFront.** O build do React é um conjunto de arquivos estáticos publicado em um bucket S3 privado. O CloudFront entrega o conteúdo por HTTPS e com cache global, e é o único com acesso ao bucket.

**API: EC2 + Docker + ECR.** O backend é empacotado em uma imagem Docker (`dc/Dockerfile`), enviada para o Amazon ECR e executada em uma instância EC2 com reinício automático. O health check é `/actuator/health`.

**Um único domínio para tudo.** O CloudFront encaminha `/api/*` para a EC2 e o restante para o S3 do frontend. Uma CloudFront Function remove o prefixo `/api` antes de repassar a requisição, então a API continua com as rotas originais (`/characters`, `/users/login`, etc.) e o frontend só precisa chamar `/api/...`.

**Banco de dados: Neon PostgreSQL.** O banco é serverless e gerenciado, sem uma instância de banco para operar. A API conecta por JDBC com SSL.

**Mídia em um bucket separado.** As imagens enviadas pelo painel e pelos usuários ficam em um bucket S3 próprio, distinto do bucket do frontend, e organizadas por recurso (veja abaixo). Assim dá para recriar a infraestrutura sem perder as imagens.

**Sem chaves de acesso.**
- A EC2 acessa o ECR e o bucket de mídia por uma **IAM Role** da instância, então não existe access key no código, na imagem Docker ou no GitHub.
- A integração com o GitHub usa **OIDC**, o que permite pipelines sem credenciais fixas.
- Segredos (banco, `JWT_SECRET`) devem ficar no AWS Systems Manager Parameter Store como um parâmetro `SecureString`. O workflow informa o nome do parâmetro (`SSM_ENV_PARAMETER`) e a EC2 o baixa durante o deploy. O arquivo `.env` local continua útil apenas para desenvolvimento.

**Infraestrutura como código.** A infraestrutura AWS deve ser mantida em Terraform, incluindo EC2, ECR, buckets, CloudFront, Security Group, IAM Roles, OIDC do GitHub e o parâmetro seguro do SSM.

### Deploy de produção

Os workflows usam secrets do repositório em **Settings → Secrets and variables → Actions → Repository secrets**. Eles não usam GitHub Environment, portanto não adicione `environment: production` aos jobs.

Secrets necessários:

- `AWS_DEPLOY_ROLE_ARN`
- `AWS_REGION`
- `FRONTEND_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `VITE_API_URL`
- `ECR_REPOSITORY_URL`
- `EC2_INSTANCE_ID`
- `SSM_ENV_PARAMETER` (nome do parâmetro `SecureString` com o `.env` da API)

`AWS_DEPLOY_ROLE_ARN` deve apontar para uma role exclusiva do GitHub Actions, por exemplo:

```text
arn:aws:iam::156041418997:role/github-actions-deploy-role
```

Essa role precisa confiar no provider OIDC `token.actions.githubusercontent.com`, com audiência `sts.amazonaws.com` e sujeito restrito a `repo:CaioLira18/java-react-universeDC:ref:refs/heads/main`. Ela deve ter permissões para publicar no ECR, sincronizar o bucket do frontend, invalidar a distribuição CloudFront e executar comandos SSM na EC2. A role da EC2 (`dc-universe-ec2-role`) é diferente e não deve ser usada em `AWS_DEPLOY_ROLE_ARN`.

O backend é publicado com a tag imutável do SHA do commit. A EC2 mantém a imagem anterior para rollback: se o health check de `/actuator/health` falhar, o container anterior é restaurado. A role da EC2 precisa de `ecr:GetAuthorizationToken`, permissões de pull no repositório ECR e `ssm:GetParameter`/`ssm:DescribeParameters` para o parâmetro de produção.

O deploy automático ocorre em pushes para `main` quando há alterações em `front/**` ou `dc/**`. Para rollback manual, execute o workflow **Deploy backend to EC2** em **Actions → Run workflow** e informe a tag SHA de uma imagem existente no ECR.

Antes do primeiro deploy, confirme:

1. A EC2 está registrada no Systems Manager e aceita comandos pelo SSM.
2. O parâmetro `/dc/production/env` existe como `SecureString`.
3. A role da EC2 pode ler esse parâmetro e baixar imagens do ECR.
4. O CloudFront encaminha `/api/*` para a EC2 e remove o prefixo `/api`.
5. `VITE_API_URL` está definido como `https://d1hr7n8x1j89do.cloudfront.net/api` (ou o domínio público equivalente).

## Organização das mídias no S3

Cada recurso tem sua pasta, e cada usuário tem uma pasta exclusiva com o seu id:

| Recurso | Pasta no S3 |
| --- | --- |
| Usuários | `users/{userId}/` |
| Personagens | `characters/{nome-do-personagem}/` |
| Aparições em filmes e séries | `movies/{movieId}/{characterId}/` e `series/{seriesId}/{characterId}/` |
| Filmes e séries | `movies/{movieId}/` e `series/{seriesId}/` |
| Jogos e personagens em jogos | `games/{gameId}/` e `games/{gameId}/Personagens/{characterId}/` |
| Planetas | `planets/{planetId}/` |
| Equipes | `groups/{groupId}/` |
| Sagas e HQs | `sagas/{sagaId}/` e `sagas/{sagaId}/comics/{comicId}/` |
| Destaques da Home | `home-slides/{slideId}/` |
| Linha do tempo | `timelines/{timelineId}/` |

Os uploads aceitam arquivos de até 25 MB e são feitos por endpoints autenticados que recebem o arquivo em um campo multipart `file`.

## Executando localmente

Requisitos: Java 21, Node.js 22, PostgreSQL e um bucket S3.

1. Copie `dc/.env.example` para `dc/.env` e preencha o banco e a AWS.
2. No backend (`dc/`), execute `./mvnw spring-boot:run` (no Windows, `.\mvnw.cmd spring-boot:run`).
3. No frontend (`front/`), copie `front/.env.example` para `front/.env` e execute:
   ```bash
   npm install
   npm run dev
   ```

O frontend usa a variável `VITE_API_URL` para localizar a API.

## Estrutura do repositório

```text
.
├── dc/                  # API Spring Boot
├── front/               # Aplicação React/Vite
├── deploy/aws/          # Terraform da infraestrutura
├── .github/workflows/   # CI/CD
└── README.md
```

## Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE`.
