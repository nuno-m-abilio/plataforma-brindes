-- O admin NÃO é criado aqui: o scripts/setupDb.js gera o hash da senha com bcrypt.
USE brindes;

INSERT INTO stores (name, email) VALUES
  ('Loja Centro',   'centro@loja-exemplo.com'),
  ('Loja Shopping', 'shopping@loja-exemplo.com');

INSERT INTO customers (name, phone, email, store_id, points_balance) VALUES
  ('Maria Silva', '5544999990001', 'maria@exemplo.com', 1, 10),
  ('João Souza',  '5544999990002', 'joao@exemplo.com',  1, 3),
  ('Ana Pereira', '5544999990003', NULL,                2, 0);

INSERT INTO rewards (name, description, points_cost, stock) VALUES
  ('Caneca Personalizada', 'Caneca de cerâmica 300 ml', 5, 20),
  ('Ecobag',               'Bolsa de algodão cru',      3, 30),
  ('Garrafa Térmica',      'Garrafa de inox 500 ml',   10, 10);

-- Ledger coerente com os saldos acima
INSERT INTO point_movements (customer_id, type, points) VALUES
  (1, 'ADJUSTMENT', 10),
  (2, 'ADJUSTMENT', 3);
