# Contrato da API

Prefixo `/api`. Respostas em JSON. Erros: `{ "error": { "code": "...", "message": "..." } }`.
Rotas protegidas exigem o header `Authorization: Bearer <token>`.

| Método | Endpoint | Perfil | Descrição |
|---|---|---|---|
| POST | /auth/otp/request | Público | Solicita OTP por telefone |
| POST | /auth/otp/verify | Público | Valida OTP e devolve JWT |
| POST | /auth/admin/login | Público | Login do admin |
| GET | /me | Cliente | Dados e saldo |
| GET | /me/points/history | Cliente | Extrato de pontos |
| GET | /rewards | Cliente | Vitrine (apenas ativos) |
| POST | /redemptions | Cliente | Realiza resgate |
| GET | /me/redemptions | Cliente | Meus resgates |
| GET | /admin/rewards | Admin | Lista brindes (inclui inativos) |
| POST | /admin/rewards | Admin | Cria brinde |
| PUT | /admin/rewards/:id | Admin | Atualiza brinde/estoque |
| DELETE | /admin/rewards/:id | Admin | Exclusão lógica |
| POST | /admin/points/import | Admin | Upload de CSV (multipart, campo "file") |
| GET | /admin/redemptions | Admin | Lista resgates |
| PATCH | /admin/redemptions/:id/status | Admin | RETIRADO ou CANCELADO |

## Formatos (preencher conforme cada módulo for implementado)
- POST /auth/otp/request -> body: { "phone": "5544999990001" }
- POST /auth/otp/verify -> body: { "phone": "...", "code": "123456" } -> { "token": "...", "role": "CUSTOMER" }
- POST /auth/admin/login -> body: { "email": "...", "password": "..." } -> { "token": "...", "role": "ADMIN" }
