-- =====================================================
-- Plataforma de Brindes - Schema MySQL 8
-- =====================================================
DROP DATABASE IF EXISTS brindes;
CREATE DATABASE brindes
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE brindes;

-- -----------------------------------------------------
-- Lojas parceiras
-- -----------------------------------------------------
CREATE TABLE stores (
  id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name   VARCHAR(120) NOT NULL,
  email  VARCHAR(160) NOT NULL,
  active BOOLEAN      NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Clientes (carregados via CSV ou cadastro)
-- -----------------------------------------------------
CREATE TABLE customers (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(120) NOT NULL,
  phone          VARCHAR(20)  NOT NULL,
  email          VARCHAR(160) NULL,
  store_id       INT UNSIGNED NULL,
  points_balance INT          NOT NULL DEFAULT 0,
  active         BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_customers_phone (phone),
  CONSTRAINT fk_customers_store
    FOREIGN KEY (store_id) REFERENCES stores (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT ck_customers_balance CHECK (points_balance >= 0),
  CONSTRAINT ck_customers_phone   CHECK (phone REGEXP '^[0-9]{10,15}$')
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Administradores
-- -----------------------------------------------------
CREATE TABLE admins (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  active        BOOLEAN      NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Brindes (catálogo)
-- -----------------------------------------------------
CREATE TABLE rewards (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  description TEXT         NULL,
  image_url   VARCHAR(255) NULL,
  points_cost INT UNSIGNED NOT NULL,
  stock       INT          NOT NULL DEFAULT 0,
  active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rewards_active (active),
  CONSTRAINT ck_rewards_cost  CHECK (points_cost > 0),
  CONSTRAINT ck_rewards_stock CHECK (stock >= 0)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Lotes de importação de CSV
-- -----------------------------------------------------
CREATE TABLE import_batches (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id      INT UNSIGNED NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  file_hash     CHAR(64)     NOT NULL,
  rows_total    INT UNSIGNED NOT NULL DEFAULT 0,
  rows_accepted INT UNSIGNED NOT NULL DEFAULT 0,
  rows_rejected INT UNSIGNED NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_import_batches_hash (file_hash),
  CONSTRAINT fk_batches_admin
    FOREIGN KEY (admin_id) REFERENCES admins (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Resgates
-- -----------------------------------------------------
CREATE TABLE redemptions (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(12)  NOT NULL,
  customer_id INT UNSIGNED NOT NULL,
  reward_id   INT UNSIGNED NOT NULL,
  store_id    INT UNSIGNED NOT NULL,
  points_cost INT UNSIGNED NOT NULL,
  status      ENUM('PENDENTE','RETIRADO','CANCELADO') NOT NULL DEFAULT 'PENDENTE',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_redemptions_code (code),
  KEY idx_redemptions_customer (customer_id, created_at),
  KEY idx_redemptions_status (status),
  CONSTRAINT fk_redemptions_customer
    FOREIGN KEY (customer_id) REFERENCES customers (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_redemptions_reward
    FOREIGN KEY (reward_id) REFERENCES rewards (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_redemptions_store
    FOREIGN KEY (store_id) REFERENCES stores (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Ledger de pontos
-- -----------------------------------------------------
CREATE TABLE point_movements (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id     INT UNSIGNED    NOT NULL,
  type            ENUM('CREDIT_IMPORT','DEBIT_REDEMPTION',
                       'REFUND_REDEMPTION','ADJUSTMENT') NOT NULL,
  points          INT             NOT NULL,
  external_id     VARCHAR(80)     NULL,
  purchase_amount DECIMAL(10,2)   NULL,
  import_batch_id INT UNSIGNED    NULL,
  redemption_id   INT UNSIGNED    NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_movements_external (external_id),
  KEY idx_movements_customer (customer_id, created_at),
  CONSTRAINT fk_movements_customer
    FOREIGN KEY (customer_id) REFERENCES customers (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_movements_batch
    FOREIGN KEY (import_batch_id) REFERENCES import_batches (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_movements_redemption
    FOREIGN KEY (redemption_id) REFERENCES redemptions (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_movements_points CHECK (points <> 0),
  CONSTRAINT ck_movements_sign CHECK (
    (type IN ('CREDIT_IMPORT','REFUND_REDEMPTION') AND points > 0) OR
    (type = 'DEBIT_REDEMPTION' AND points < 0) OR
    (type = 'ADJUSTMENT')
  ),
  CONSTRAINT ck_movements_amount CHECK (purchase_amount IS NULL OR purchase_amount >= 0)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Códigos OTP
-- -----------------------------------------------------
CREATE TABLE otp_codes (
  id          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  customer_id INT UNSIGNED     NOT NULL,
  code_hash   CHAR(64)         NOT NULL,
  expires_at  DATETIME         NOT NULL,
  attempts    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  used        BOOLEAN          NOT NULL DEFAULT FALSE,
  created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_otp_customer (customer_id, created_at),
  CONSTRAINT fk_otp_customer
    FOREIGN KEY (customer_id) REFERENCES customers (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Log de e-mails (simulação de envio)
-- -----------------------------------------------------
CREATE TABLE email_log (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  redemption_id INT UNSIGNED NULL,
  to_email      VARCHAR(160) NOT NULL,
  subject       VARCHAR(200) NOT NULL,
  body          TEXT         NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_email_redemption
    FOREIGN KEY (redemption_id) REFERENCES redemptions (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Configurações parametrizáveis
-- -----------------------------------------------------
CREATE TABLE settings (
  key_name    VARCHAR(60)  NOT NULL,
  value       VARCHAR(255) NOT NULL,
  description VARCHAR(255) NULL,
  PRIMARY KEY (key_name)
) ENGINE=InnoDB;

INSERT INTO settings (key_name, value, description) VALUES
  ('points_per_brl_step',     '100',  'Valor em R$ necessário para ganhar 1 ponto'),
  ('otp_quota_total',         '1000', 'Franquia total de disparos de OTP'),
  ('otp_quota_used',          '0',    'Disparos de OTP já consumidos'),
  ('otp_alert_threshold_pct', '20',   'Alerta ao admin quando o saldo restante chegar a este percentual'),
  ('pickup_deadline_days',    '30',   'Prazo em dias para retirada do brinde');