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
O backend aceita arquivos de até 25 MB por upload; o limite da requisição multipart é 26 MB.

No CRUD de personagens, também é possível relacionar o personagem a filmes e séries cadastrados e enviar uma imagem específica para cada aparição. Os arquivos são salvos em `movies/{movieId}/{characterId}/` ou `series/{seriesId}/{characterId}/`. O upload autenticado usa `POST /character-appearances/media?characterId={characterId}&contentId={contentId}`, com o arquivo no campo `file`; a relação é criada em seguida por `POST /character-appearances`.

## Upload de mídia de personagens

No CRUD de personagens, envie a imagem de fundo obrigatória e, se desejar, a imagem das polaroids. Os arquivos são salvos em `characters/{nome-do-personagem}/`; os espaços do nome viram `_` e caracteres incompatíveis com nomes de pasta são substituídos por `_`. O endpoint autenticado `POST /characters/{id}/media?field=background` (ou `field=verticalmage`) recebe o arquivo no campo multipart `file`.
