-- Create database and tables for ChocoExpress
CREATE DATABASE IF NOT EXISTS chocoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chocoapp;

-- Drop tables if they exist (dev only)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS offers;
DROP TABLE IF EXISTS developers;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  weight VARCHAR(50) DEFAULT '100g',
  img VARCHAR(500) NULL,
  category_id INT NOT NULL,
  CONSTRAINT fk_prod_cat FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300) NOT NULL,
  badge VARCHAR(50) NOT NULL,
  target_sort VARCHAR(50) NULL,
  target_category VARCHAR(100) NULL
);

CREATE TABLE developers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  role VARCHAR(100) NOT NULL,
  github VARCHAR(300) NULL,
  img VARCHAR(500) NULL
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  date VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  total DECIMAL(10,2) NOT NULL
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  qty INT NOT NULL,
  CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Seed data
INSERT INTO categories (name) VALUES ('Dark'), ('Milk'), ('Nuts'), ('Caramel');

INSERT INTO products (name, description, price, weight, img, category_id)
SELECT 'Dark Truffle', 'Rich dark chocolate truffle', 129.00, '100g', NULL, id FROM categories WHERE name='Dark';
INSERT INTO products (name, description, price, weight, img, category_id)
SELECT 'Milk Caramel', 'Creamy milk with caramel', 99.00, '100g', NULL, id FROM categories WHERE name='Milk';
INSERT INTO products (name, description, price, weight, img, category_id)
SELECT '70% Cacao Bar', 'Intense dark 70% cacao', 149.00, '100g', NULL, id FROM categories WHERE name='Dark';
INSERT INTO products (name, description, price, weight, img, category_id)
SELECT 'Hazelnut Praline', 'Nutty praline center', 141.00, '100g', NULL, id FROM categories WHERE name='Nuts';
INSERT INTO products (name, description, price, weight, img, category_id)
SELECT 'Almond Crunch', 'Crunchy almond bits', 129.00, '100g', NULL, id FROM categories WHERE name='Nuts';

INSERT INTO offers (title, subtitle, badge, target_sort, target_category) VALUES
  ('Buy 1 Get 1', 'Dark Truffle BOGO this week', 'New', NULL, 'Dark'),
  ('15% Off', 'Orders over ₱500', 'Save', 'priceAsc', NULL),
  ('Nutty Deals', 'Best picks with nuts', 'Yum', NULL, 'Nuts'),
  ('Premium Picks', 'Top-rated treats', 'Hot', 'popular', NULL);

INSERT INTO developers (name, role, github, img) VALUES
  ('John Reex O. Aspiras', 'Fullstack Developer', 'https://github.com/Mazt08', 'https://github.com/Mazt08.png'),
  ('Kurt Justine A. Avenido', 'No Role', NULL, NULL),
  ('Railey Modrigo', 'No Roles', NULL, NULL);

INSERT INTO orders (id, date, status, total) VALUES
  (1024, 'Oct 1, 2025', 'Delivered', 399.00),
  (1025, 'Oct 7, 2025', 'Processing', 228.00);

INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES
  (1024, 1, 'Dark Truffle', 129.00, 2),
  (1024, 4, 'Hazelnut Praline', 141.00, 1),
  (1025, 2, 'Milk Caramel', 99.00, 1),
  (1025, 5, 'Almond Crunch', 129.00, 1);
