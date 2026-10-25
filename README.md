# java-react-universeDC

## Upload de mídia por usuário no S3

As configurações do backend ficam em `dc/.env`. O arquivo é carregado ao iniciar a API e está ignorado pelo Git para evitar o envio de credenciais. O `dc/.env.example` mostra os nomes das variáveis sem conter segredos.

Preencha `DB_URL`, `DB_USERNAME` e `DB_PASSWORD` com as credenciais do PostgreSQL, além de `AWS_S3_BUCKET`, `AWS_S3_REGION`, `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`. `AWS_S3_ENDPOINT` só é necessário para um serviço compatível com S3 que use endpoint próprio.

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
