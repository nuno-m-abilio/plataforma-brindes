# Convenções do código

- Back-end e front-end usam ES Modules (import/export).
- Camadas do back: routes -> service -> repository. SQL só no repository.
- Operações que alteram saldo ou estoque usam `withTransaction` (db.js).
- Erros de negócio: `throw new AppError(status, 'CODIGO', 'Mensagem')`.
- Rotas protegidas: `authenticate` e, se for admin, `authorize('ADMIN')`.
- Regras numéricas (1 ponto por R$ 100 etc.) ficam em `config.js`, nunca no meio do código.
- Telefones sempre só com dígitos e DDI (ex.: 5544999990001).
- Front: use sempre `textContent` (nunca `innerHTML` com dados do servidor) e acesse via http://localhost:3000.
- Nomes de arquivos: camelCase para JS, minúsculo com hífen para HTML.
