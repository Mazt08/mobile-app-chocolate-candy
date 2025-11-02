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
DROP TABLE IF EXISTS users;

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

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(200) NOT NULL UNIQUE,
  password VARCHAR(200) NOT NULL,
  role ENUM('admin','staff','user') NOT NULL DEFAULT 'user'
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  date VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  user_id INT NULL,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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
INSERT INTO categories (name) VALUES
 ('Signature Chocolate Bars'),
 ('Caramel Chocolate Creations'),
 ('Decadent Truffles'),
 ('Chocolate Covered Treats'),
 ('Gourmet Gift Boxes'),
 ('Seasonal Specialties');

-- Products: Signature Chocolate Bars
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 1001, 'Midnight Espresso Dark (85%)', 'Intense dark chocolate with fine espresso beans.', 480.00, '100g', 'assets/images/midnight-espresso.jpg', id FROM categories WHERE name='Signature Chocolate Bars';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 1002, 'Creamy Milk Chocolate Delight', 'Velvety smooth 38% cocoa milk chocolate.', 420.00, '100g', 'assets/images/creamy-milk.jpg', id FROM categories WHERE name='Signature Chocolate Bars';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 1003, 'Orange Zest Dark Chocolate (70%)', 'Dark chocolate with crystallized orange peel.', 460.00, '100g', 'assets/images/orange-zest.jpg', id FROM categories WHERE name='Signature Chocolate Bars';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 1004, 'Pure Ivory White Chocolate', 'Luxurious white chocolate with real vanilla.', 440.00, '100g', 'assets/images/ivory-white.jpg', id FROM categories WHERE name='Signature Chocolate Bars';

-- Caramel Chocolate Creations
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 2001, 'Salted Caramel Dark Bar', 'Dark chocolate with a flowing river of salted caramel.', 540.00, '85g', 'assets/images/salt-caramel.jpg', id FROM categories WHERE name='Caramel Chocolate Creations';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 2002, 'Caramel Crunch Milk Chocolate', 'Milk chocolate with crispy caramelized bits.', 510.00, '90g', 'assets/images/caramel-crunch.jpg', id FROM categories WHERE name='Caramel Chocolate Creations';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 2003, 'Double Caramel Swirl', 'Marbled white and milk chocolate with caramel.', 570.00, '95g', 'assets/images/double-caramel.jpg', id FROM categories WHERE name='Caramel Chocolate Creations';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 2004, 'Himalayan Salt Caramel Block', 'Artisanal chocolate with caramel and pink salt.', 680.00, '150g', 'assets/images/himalayan-salt.jpg', id FROM categories WHERE name='Caramel Chocolate Creations';

-- Decadent Truffles
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 3001, 'Salted Caramel Truffles', 'Dark chocolate shells with liquid caramel centers.', 850.00, '300g', 'assets/images/caramel-truffle.jpg', id FROM categories WHERE name='Decadent Truffles';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 3002, 'Caramel Macchiato Truffles', 'Coffee-infused chocolate with espresso caramel.', 780.00, '250g', 'assets/images/caramel-macchiato.jpg', id FROM categories WHERE name='Decadent Truffles';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 3003, 'Dark Chocolate Ganache Truffles', 'Classic dark chocolate with velvety ganache.', 720.00, '200g', 'assets/images/dark-ganache.jpg', id FROM categories WHERE name='Decadent Truffles';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 3004, 'Raspberry Rose Truffles', 'White chocolate with raspberry and rose.', 750.00, '220g', 'assets/images/raspberry-rose.jpg', id FROM categories WHERE name='Decadent Truffles';

-- Chocolate Covered Treats
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 4001, 'Chocolate Covered Almonds', 'Roasted almonds in dark chocolate.', 520.00, '200g', 'assets/images/chocolate-covered-almonds.jpg', id FROM categories WHERE name='Chocolate Covered Treats';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 4002, 'Salted Caramel Pecan Clusters', 'Caramel and pecans in dark chocolate.', 580.00, '180g', 'assets/images/salted-caramel-pecan.jpg', id FROM categories WHERE name='Chocolate Covered Treats';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 4003, 'Milk Chocolate Honeycomb', 'Airy honeycomb in creamy milk chocolate.', 490.00, '150g', 'assets/images/milk-chocolate-honeycomb.jpg', id FROM categories WHERE name='Chocolate Covered Treats';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 4004, 'Chocolate Covered Coffee Beans', 'Arabica beans in intense dark chocolate.', 450.00, '120g', 'assets/images/chocolate-covered-coffee-beans.jpg', id FROM categories WHERE name='Chocolate Covered Treats';

-- Gourmet Gift Boxes
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 5001, 'The World Tour Collection', '5 single-origin dark chocolate bars.', 2100.00, '425g', 'assets/images/world-tour-collection.jpg', id FROM categories WHERE name='Gourmet Gift Boxes';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 5002, 'Ultimate Caramel Lover''s Box', 'Assorted caramel chocolates and truffles.', 1850.00, '500g', 'assets/images/ultimate-caramel-lovers-box.jpg', id FROM categories WHERE name='Gourmet Gift Boxes';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 5003, 'Truffle Taster''s Premium Box', '16 gourmet truffles in 4 flavors.', 1600.00, '400g', 'assets/images/truffle-tasters-premium-box.jpg', id FROM categories WHERE name='Gourmet Gift Boxes';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 5004, 'Create-Your-Own Chocolate Box', 'Personalized selection of chocolates.', 1200.00, '300g', 'assets/images/create-your-own-box.jpg', id FROM categories WHERE name='Gourmet Gift Boxes';

-- Seasonal Specialties
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 6001, 'Pumpkin Spice Caramel Bites', 'White chocolate with spiced pumpkin caramel.', 650.00, '150g', 'assets/images/pumpkin-spice-caramel.jpg', id FROM categories WHERE name='Seasonal Specialties';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 6002, 'Peppermint Bark', 'Dark and white chocolate with candy canes.', 590.00, '200g', 'assets/images/peppermint-bark.jpg', id FROM categories WHERE name='Seasonal Specialties';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 6003, 'Mango Caramel White Chocolate', 'White chocolate with mango-caramel swirl.', 560.00, '100g', 'assets/images/mango-caramel-white.jpg', id FROM categories WHERE name='Seasonal Specialties';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 6004, 'Easter Egg Hunt Kit', 'Foil-wrapped chocolate eggs.', 880.00, '300g', 'assets/images/easter-egg-hunt-kit.jpg', id FROM categories WHERE name='Seasonal Specialties';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 6005, 'Valentine''s Heart Collection', 'Heart-shaped chocolates and truffles.', 1250.00, '350g', 'assets/images/valentines-heart-collection.jpg', id FROM categories WHERE name='Seasonal Specialties';
INSERT INTO products (id, name, description, price, weight, img, category_id)
SELECT 6006, 'Spicy Maya Hot Chocolate Blocks', 'Dark chocolate with cinnamon and chili for drinking.', 620.00, '150g (3 blocks)', 'assets/images/spicy-maya-hot-chocolate.jpg', id FROM categories WHERE name='Seasonal Specialties';

INSERT INTO offers (title, subtitle, badge, target_sort, target_category) VALUES
  ('Signature Bestsellers', 'Top picks from our signature bars', 'Hot', NULL, 'Signature Chocolate Bars'),
  ('Caramel Lovers', 'Sweet caramel creations on promo', 'Yum', NULL, 'Caramel Chocolate Creations'),
  ('Truffle Treats', 'Save on decadent truffles', 'Save', 'priceAsc', NULL),
  ('Seasonal Highlights', 'Limited-time seasonal items', 'New', NULL, 'Seasonal Specialties');

INSERT INTO developers (name, role, github, img) VALUES
  ('John Reex O. Aspiras', 'Fullstack Developer', 'https://github.com/Mazt08', 'https://github.com/Mazt08.png'),
  ('Kurt Justine A. Avenido', 'No Role', NULL, NULL),
  ('Railey Modrigo', 'No Roles', NULL, NULL);

INSERT INTO orders (id, date, status, total) VALUES
  (1024, 'Oct 1, 2025', 'Delivered', 1200.00),
  (1025, 'Oct 7, 2025', 'Processing', 910.00);

INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES
  (1024, 1001, 'Midnight Espresso Dark (85%)', 480.00, 1),
  (1024, 3003, 'Dark Chocolate Ganache Truffles', 720.00, 1),
  (1025, 1002, 'Creamy Milk Chocolate Delight', 420.00, 1),
  (1025, 4003, 'Milk Chocolate Honeycomb', 490.00, 1);
