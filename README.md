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
