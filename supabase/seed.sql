-- ============================================================
-- POS 1994 Coffee — Seed Data
-- Run this AFTER schema and RLS are set up
-- Creates sample categories, products, and tables
-- NOTE: Users should be created via Supabase Auth
-- ============================================================

-- ── Categories ────────────────────────────────────────────────
INSERT INTO categories (name, sort_order) VALUES
  ('Cà phê',       1),
  ('Trà',          2),
  ('Đá xay',       3),
  ('Nước ép',      4),
  ('Bánh & Snack', 5);

-- ── Products ──────────────────────────────────────────────────
-- Cà phê
INSERT INTO products (category_id, name, price) VALUES
  ((SELECT id FROM categories WHERE name = 'Cà phê'), 'Cà phê đen',    25000),
  ((SELECT id FROM categories WHERE name = 'Cà phê'), 'Cà phê sữa',   30000),
  ((SELECT id FROM categories WHERE name = 'Cà phê'), 'Bạc xỉu',      35000),
  ((SELECT id FROM categories WHERE name = 'Cà phê'), 'Cappuccino',    45000),
  ((SELECT id FROM categories WHERE name = 'Cà phê'), 'Latte',         45000),
  ((SELECT id FROM categories WHERE name = 'Cà phê'), 'Espresso',      35000),
  ((SELECT id FROM categories WHERE name = 'Cà phê'), 'Americano',     40000);

-- Trà
INSERT INTO products (category_id, name, price) VALUES
  ((SELECT id FROM categories WHERE name = 'Trà'), 'Trà đào cam sả',  40000),
  ((SELECT id FROM categories WHERE name = 'Trà'), 'Trà vải',         38000),
  ((SELECT id FROM categories WHERE name = 'Trà'), 'Trà sen',         35000),
  ((SELECT id FROM categories WHERE name = 'Trà'), 'Trà oolong',      35000),
  ((SELECT id FROM categories WHERE name = 'Trà'), 'Hồng trà sữa',   38000);

-- Đá xay
INSERT INTO products (category_id, name, price) VALUES
  ((SELECT id FROM categories WHERE name = 'Đá xay'), 'Chocolate đá xay',  50000),
  ((SELECT id FROM categories WHERE name = 'Đá xay'), 'Matcha đá xay',     50000),
  ((SELECT id FROM categories WHERE name = 'Đá xay'), 'Cookie đá xay',     52000);

-- Nước ép
INSERT INTO products (category_id, name, price) VALUES
  ((SELECT id FROM categories WHERE name = 'Nước ép'), 'Nước ép cam',    40000),
  ((SELECT id FROM categories WHERE name = 'Nước ép'), 'Nước ép dưa hấu', 35000),
  ((SELECT id FROM categories WHERE name = 'Nước ép'), 'Sinh tố bơ',     45000);

-- Bánh & Snack
INSERT INTO products (category_id, name, price) VALUES
  ((SELECT id FROM categories WHERE name = 'Bánh & Snack'), 'Bánh mì',        25000),
  ((SELECT id FROM categories WHERE name = 'Bánh & Snack'), 'Croissant',      35000),
  ((SELECT id FROM categories WHERE name = 'Bánh & Snack'), 'Bánh flan',      20000);

-- ── Tables ────────────────────────────────────────────────────
INSERT INTO tables (name, sort_order) VALUES
  ('Bàn 01',  1),
  ('Bàn 02',  2),
  ('Bàn 03',  3),
  ('Bàn 04',  4),
  ('Bàn 05',  5),
  ('Bàn 06',  6),
  ('Bàn 07',  7),
  ('Bàn 08',  8),
  ('Bàn 09',  9),
  ('Bàn 10', 10);
