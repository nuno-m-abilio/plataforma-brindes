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
| GET | /admin/otp/balance | Admin | Saldo da franquia de SMS |

## Formatos (preencher conforme cada módulo for implementado)

### Auth
O cliente não tem senha: receber o código por SMS é o login. O token vale 2 h.

**POST /auth/otp/request** — body `{ "phone": "5544999990001" }` (aceita máscara; só os dígitos são usados)
→ `200 { "message": "Código enviado por SMS.", "devCode": "123456" }` (`devCode` só com `DEV_SHOW_OTP=true`)

| Status | code | Quando |
|---|---|---|
| 400 | INVALID_PHONE | Telefone sem 10 a 15 dígitos |
| 404 | PHONE_NOT_FOUND | Telefone fora da base (orientar a procurar uma loja) |
| 429 | OTP_RATE_LIMIT | 3 pedidos em 10 min para o mesmo telefone |
| 503 | OTP_QUOTA_EXHAUSTED | Franquia de SMS zerada |
| 503 | SMS_UNAVAILABLE | Falha no envio do SMS |

**POST /auth/otp/verify** — body `{ "phone": "...", "code": "123456" }` → `200 { "token": "...", "role": "CUSTOMER" }`

| Status | code | Quando |
|---|---|---|
| 400 | INVALID_PHONE | Telefone mal formatado |
| 400 | OTP_INVALID | Código errado, expirado (5 min), já usado ou telefone sem código (mensagem genérica) |
| 429 | OTP_BLOCKED | 3 tentativas erradas; é preciso pedir novo código |

**POST /auth/admin/login** — body `{ "email": "...", "password": "..." }` → `200 { "token": "...", "role": "ADMIN" }`
Erro: `401 INVALID_CREDENTIALS` "E-mail ou senha inválidos." (o mesmo para e-mail inexistente e senha errada).

**GET /admin/otp/balance** → `200 { "total": 1000, "used": 800, "remaining": 200, "alert": true }`
`alert` fica `true` quando restam 20% ou menos da franquia.
