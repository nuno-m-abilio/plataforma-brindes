# Plataforma de Brindes

Plataforma web de fidelidade (acúmulo e resgate de brindes).
Trabalho final de Gerenciamento de Projeto de Software (9796/1) - UEM.

## Pré-requisitos
- Node.js LTS
- MySQL 8.0.16 ou superior, rodando localmente

## Instalação
    cd backend
    npm install
    cp .env.example .env        (e preencha DB_PASSWORD com a senha do seu MySQL)
    npm run db:setup            (cria o banco, as tabelas e os dados de teste)

As dependências estão listadas em backend/requirements.txt (o npm usa o package.json).

## Execução
    cd backend
    npm run dev

Acesse http://localhost:3000 (sempre por essa porta, o Express serve o front).
Teste da API e do banco: http://localhost:3000/api/health

## Acessos de teste (criados pelo db:setup)
- Admin: admin@brindes.local / senha definida em ADMIN_PASSWORD no .env
- Clientes: telefones 5544999990001, 5544999990002, 5544999990003

## Estrutura
- frontend/  páginas HTML/CSS/JS puro
- backend/   API Node.js + Express + MySQL
- docs/      documentação, contrato da API e convenções

## Equipe
Eduardo, Nuno, Thiago Calvi, Vitor, Leonardo, Thiago Silva
