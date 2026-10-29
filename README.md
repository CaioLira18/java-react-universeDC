# java-react-universeDC

## Executando localmente

Requisitos: Java 21, Node.js 22, PostgreSQL e um bucket S3.

1. Copie `dc/.env.example` para `dc/.env` e preencha o banco e a AWS.
2. No backend, execute `.\mvnw.cmd spring-boot:run`.
3. No frontend, copie `front/.env.example` para `front/.env` e execute `npm install` e `npm run dev`.

O frontend usa `VITE_API_URL` para localizar a API. Em produção, o health check do backend fica em
`/actuator/health`.

### Imagens da timeline

Os marcos ficam disponíveis no CRUD **Linha do tempo** do painel administrativo. O upload das imagens
é enviado para `timelines/{timelineId}/` no S3. A página pública usa `GET /timelines` e os detalhes
usam `GET /timelines/{id}`.

### Deploy

O deploy econômico usa:

- Amazon S3 + CloudFront para o frontend;
- uma instância EC2 com Docker para a API;
- Amazon ECR para armazenar a imagem Docker;
- Neon PostgreSQL para o banco;
- S3 separado para as imagens dos CRUDs;
- CloudFront Function para remover o prefixo `/api` antes de encaminhar as requisições para a API.

Nenhum segredo deve ser commitado. Não use access keys no código, no GitHub ou na
imagem Docker. Na EC2, use a IAM Role da instância para acessar o ECR e o bucket de
mídia. O arquivo `terraform.tfvars`, o state do Terraform e os arquivos `.env` ficam
ignorados pelo Git.

#### 1. Provisionar a infraestrutura

O Terraform fica em [`deploy/aws/`](./deploy/aws/). O processo pode ser executado pelo
AWS CloudShell, que já possui uma sessão autenticada na conta:

```bash
cd ~
git clone https://github.com/CaioLira18/java-react-universeDC.git
cd java-react-universeDC/deploy/aws
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
```

Confirme pelo menos:

```hcl
aws_region        = "us-east-1"
project_name      = "dc-universe"
environment       = "production"
github_repository = "CaioLira18/java-react-universeDC"
ec2_ssh_cidr      = ""
```

Inicialize e valide:

```bash
terraform init
terraform fmt
terraform validate
terraform plan -var-file="terraform.tfvars"
```

Se o plano estiver correto:

```bash
terraform apply -var-file="terraform.tfvars"
```

O Terraform cria uma VPC pública pequena, EC2, ECR, buckets, CloudFront, Security
Group, IAM Roles e integração OIDC. Se a conta não possuir uma Default VPC, isso não
impede o deploy, pois a configuração cria sua própria VPC.

Guarde os outputs:

```bash
terraform output
```

Os valores importantes são `frontend_bucket`, `media_bucket`,
`cloudfront_distribution_id`, `cloudfront_domain_name`, `ecr_repository_url` e
`ec2_instance_id`.

#### 2. Configurar a API na EC2

Acesse a instância pelo **EC2 > Instances > Connect > Session Manager**. Crie o
arquivo `/opt/dc-api/.env`:

```bash
sudo mkdir -p /opt/dc-api
sudo nano /opt/dc-api/.env
sudo chmod 600 /opt/dc-api/.env
```

Use os valores reais do Neon e dos outputs do Terraform:

```env
ECR_IMAGE=URL_DO_OUTPUT_ECR/dc-universe-api:latest
DB_URL=jdbc:postgresql://SEU_HOST_NEON/neondb?sslmode=require
DB_USERNAME=SEU_USUARIO_NEON
DB_PASSWORD=SUA_SENHA_NEON
AWS_S3_BUCKET=BUCKET_DE_MEDIA
AWS_S3_REGION=us-east-1
AWS_S3_ENDPOINT=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
JWT_SECRET=UMA_CHAVE_ALEATORIA_LONGA
```

Gere o segredo JWT no CloudShell:

```bash
openssl rand -base64 64
```

Para AWS S3, `AWS_S3_ENDPOINT`, `AWS_ACCESS_KEY_ID` e
`AWS_SECRET_ACCESS_KEY` devem permanecer vazios quando a EC2 estiver usando IAM
Role. O bucket de mídia é diferente do bucket que contém os arquivos do frontend.

#### 3. Construir e enviar a imagem da API

No CloudShell, na raiz do projeto:

```bash
cd ~/java-react-universeDC
git pull
ECR="URL_DO_OUTPUT_ECR"
IMAGE="$ECR:latest"
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  "$(echo "$ECR" | cut -d/ -f1)"
docker build -t "$IMAGE" ./dc
docker push "$IMAGE"
```

Se a alteração estiver apenas no computador local, faça commit e `git push` antes
de executar o build no CloudShell, ou envie o projeto manualmente.

#### 4. Iniciar ou atualizar o container da API

Pelo Session Manager, na EC2:

```bash
sudo docker pull URL_DO_OUTPUT_ECR:latest
sudo docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}\t{{.Status}}"
sudo docker rm --force dc-api 2>/dev/null || true
sudo docker run --detach \
  --restart unless-stopped \
  --name dc-api \
  --env-file /opt/dc-api/.env \
  --publish 8080:8080 \
  URL_DO_OUTPUT_ECR:latest
```

Verifique:

```bash
sudo docker ps
sudo docker logs --tail 100 dc-api
curl -i http://localhost:8080/actuator/health
```

O health check esperado é `HTTP/1.1 200` com `{"status":"UP"}`. Se a porta 8080
já estiver ocupada, remova o container antigo que aparece em `docker ps` antes de
executar o novo `docker run`.

#### 5. Publicar o frontend no S3

No CloudShell, dentro de `front/`, configure a URL pública usada pelo frontend:

```bash
cd ~/java-react-universeDC/front
export VITE_API_URL="https://SEU_DOMINIO_CLOUDFRONT/api"
npm ci
npm run build
aws s3 sync ./dist s3://BUCKET_DO_FRONTEND --delete --region us-east-1
```

O bucket deve conter `index.html` e `assets/` diretamente na raiz; não envie a
pasta `dist` como uma subpasta.

Se preferir usar o DNS público da EC2 durante o primeiro teste, a URL pode ser
`http://DNS_PUBLICO_DA_EC2:8080`, mas uma API HTTP acessada por um frontend HTTPS
pode ser bloqueada pelo navegador por mixed content. Para produção, use HTTPS na API.

#### 6. Configurar o comportamento `/api/*` no CloudFront

Crie uma origem apontando para o DNS público da EC2 na porta 8080, com protocolo
**HTTP only**, e um comportamento:

```text
Path pattern: /api/*
Origin: EC2
Viewer protocol policy: Redirect HTTP to HTTPS
```

Associe uma CloudFront Function no evento **Viewer request** para remover `/api`:

```javascript
function handler(event) {
    var request = event.request;

    if (request.uri.startsWith('/api/')) {
        request.uri = request.uri.substring(4);
    }

    return request;
}
```

Publique a função. Alterações em **Development** não entram em produção até clicar
em **Publish**. Depois crie uma invalidação:

```text
/*
```

#### 7. Configurar CORS e testar

Adicione o domínio final do CloudFront às origens permitidas no backend, publique
uma nova imagem da API e reinicie o container. Teste:

```text
https://SEU_DOMINIO_CLOUDFRONT/actuator/health
https://SEU_DOMINIO_CLOUDFRONT/api/users/register
```

O frontend deve chamar `/api/users/register`; a função remove o prefixo antes de
enviar `/users/register` para o Spring Boot. Verifique no DevTools do navegador se
a requisição está indo para o CloudFront e se o comportamento `/api/*` está sendo
usado.

#### 8. Deploy manual sem GitHub Actions

O GitHub Actions é opcional. Para publicar manualmente:

1. Faça `npm run build` no frontend.
2. Envie `front/dist` com `aws s3 sync`.
3. Faça a imagem Docker da API com `docker build`.
4. Envie a imagem com `docker push`.
5. Reinicie o container na EC2.
6. Invalide o CloudFront com `/*`.

Nunca copie `.env` para o bucket frontend, ECR ou repositório.

#### 9. Remover a infraestrutura sem apagar as imagens

Antes de `terraform destroy`, retire o bucket de mídia do state para preservá-lo:

```bash
terraform state rm aws_s3_bucket.media
terraform state rm aws_s3_bucket_public_access_block.media
terraform state rm aws_s3_bucket_versioning.media
terraform plan -destroy -var-file="terraform.tfvars"
terraform destroy -var-file="terraform.tfvars"
```

Revise o plano antes de confirmar. O bucket de mídia e seus objetos não devem
aparecer como recursos a destruir.

## Upload de mídia por usuário no S3

As configurações do backend ficam em `dc/.env`. O arquivo é carregado ao iniciar a API e está ignorado pelo Git para evitar o envio de credenciais. O `dc/.env.example` mostra os nomes das variáveis sem conter segredos.

Preencha `DB_URL`, `DB_USERNAME` e `DB_PASSWORD` com as credenciais do PostgreSQL, além de
`AWS_S3_BUCKET` e `AWS_S3_REGION`. Para AWS S3, deixe `AWS_S3_ENDPOINT` vazio: o SDK usa o
endpoint regional automaticamente. `AWS_S3_ENDPOINT` só deve ser preenchido para um serviço
compatível com S3 que use endpoint próprio. Em EC2, prefira a IAM Role e deixe
`AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` vazios.

A cada upload, o arquivo será salvo em:

```text
users/{userId}/{uuid}-{nome-do-arquivo}
```

O endpoint para envio é:

```http
POST /users/{id}/media
Content-Type: multipart/form-data
```

Com o arquivo enviado no campo `file`.

## Personagens em jogos

No painel administrativo, cadastre jogos na aba **Jogos**. O logo ou capa enviado no formulário é salvo no S3 em `games/{gameId}/`. Ao editar um personagem, associe um jogo e informe a URL da imagem daquela aparição ou envie o arquivo pelo painel; as imagens enviadas para a aparição são salvas em `games/{gameId}/Personagens/{characterId}/`. As artes relacionadas são exibidas na página pública do personagem.

O envio do logo ou capa do jogo usa `POST /games/{id}/media`. A imagem de um personagem em um jogo usa `POST /games/{gameId}/characters/{characterId}/media`. Ambos recebem o arquivo no campo `file` e exigem autenticação JWT.

No CRUD de séries, o logo pode ser enviado como arquivo e é armazenado no S3 em `series/{seriesId}/`. O upload autenticado usa `POST /series/{id}/media`, com o arquivo no campo `file`.

No CRUD de filmes, o pôster enviado é armazenado no S3 em `movies/{movieId}/`. O upload autenticado usa `POST /movies/{id}/media`, com o arquivo no campo `file`. A página do filme exibe somente o pôster, sem logo.

Jogos, filmes e séries têm descrição, um banner estático e uma galeria de imagens. Envie o banner e várias imagens pelos campos de mídia do painel; os arquivos são armazenados na pasta S3 do respectivo item (`games/{id}/`, `movies/{id}/` ou `series/{id}/`). Os URLs da galeria ficam persistidos nas entidades e são exibidos nas páginas individuais. Hibernate atualiza o esquema para incluir os campos e tabelas das galerias.

## Destaques da página inicial

O painel administrativo permite criar, editar, ordenar, publicar e remover destaques da Home. Cada slide pode ter chamada, título, descrição, botão e imagem de fundo, armazenada no S3 em `home-slides/{slideId}/`. O endpoint público `GET /home-slides` retorna apenas os slides ativos; `GET /home-slides/admin` lista todos e exige autenticação. O upload autenticado usa `POST /home-slides/{id}/media`, com o arquivo no campo `file`.

## Sagas da DC

O painel administrativo permite cadastrar, editar, ordenar, publicar e remover sagas, com nome, descrição, anos de publicação e banner. Há preenchimentos rápidos para New 52, Universo Absolute e Era de Ouro; as principais HQs do New 52 e da Era de Ouro também podem ser adicionadas em lote. As capas das HQs do lote devem ser enviadas no painel. Os banners são armazenados no S3 em `sagas/{sagaId}/`. `GET /sagas` lista as sagas ativas; `GET /sagas/admin` lista todas e exige autenticação. O upload autenticado usa `POST /sagas/{id}/media`, com o arquivo no campo `file`.

A página `/sagas` exibe as sagas publicadas com banner, período e descrição, consumindo a lista pública `GET /sagas`. Cada saga tem uma página de detalhes em `/sagas/{id}`, com HQs exibidas em ordem de leitura. No painel, cada HQ tem nome, ano de lançamento, descrição e capa; os dados são persistidos como entidades relacionadas na tabela `saga_hqs`, e as capas ficam no S3 em `sagas/{sagaId}/comics/{comicId}/`. O upload autenticado usa `POST /sagas/{id}/comics/{comicId}/media`, com o arquivo no campo `file`.

## Equipes de heróis

Na aba **Equipes** do painel, cadastre e edite equipes como a Liga da Justiça e os Jovens Titãs. Cada registro inclui descrição, tipo, universo, base de operações, ano de formação, primeira aparição, ordem de exibição, publicação, banner e personagens selecionados entre os já cadastrados. A relação com os personagens é persistida em `hero_group_characters`; os banners ficam em `groups/{groupId}/` no S3.

`GET /groups` lista equipes publicadas e `GET /groups/{id}` retorna os detalhes públicos, incluindo seus integrantes. `GET /groups/admin` lista todas as equipes e exige autenticação. Criar, editar, excluir e enviar banners também exigem autenticação; o upload usa `POST /groups/{id}/media` com o arquivo no campo `file`. No site, `/groups` mostra a listagem geral e `/groups/{id}` os detalhes da equipe.

## Imagens dos planetas

Na aba **Planetas** do painel, cadastre ou edite os dados do planeta, envie a imagem principal e adicione várias imagens à galeria. Todos os arquivos ficam no S3 em `planets/{planetId}/`; o URL da imagem principal é salvo no planeta e os URLs da galeria na tabela `planet_images`. A imagem principal é enviada por `POST /planets/{id}/primary-media`; as imagens da galeria são enviadas por `POST /planets/{id}/media`. Ambos os endpoints recebem o arquivo no campo `file` e exigem autenticação.

O backend aceita arquivos de até 25 MB por upload; o limite da requisição multipart é 26 MB.

No CRUD de personagens, também é possível relacionar o personagem a filmes e séries cadastrados e enviar uma imagem específica para cada aparição. Os arquivos são salvos em `movies/{movieId}/{characterId}/` ou `series/{seriesId}/{characterId}/`. O upload autenticado usa `POST /character-appearances/media?characterId={characterId}&contentId={contentId}`, com o arquivo no campo `file`; a relação é criada em seguida por `POST /character-appearances`.

## Upload de mídia de personagens

No CRUD de personagens, envie a imagem de fundo obrigatória e, se desejar, a imagem das polaroids. Os arquivos são salvos em `characters/{nome-do-personagem}/`; os espaços do nome viram `_` e caracteres incompatíveis com nomes de pasta são substituídos por `_`. O endpoint autenticado `POST /characters/{id}/media?field=background` (ou `field=verticalmage`) recebe o arquivo no campo multipart `file`.
