BEGIN;
CREATE TEMP TABLE temp_categories (
  name TEXT,
  sort_order INT
) ON COMMIT DROP;

INSERT INTO temp_categories (name, sort_order) VALUES
  ('Cà phê',              1),
  ('Latte & Sữa',         2),
  ('Cacao - Socola',      3),
  ('Trà',                 4),
  ('Sinh tố',             5),
  ('Đá xay',              6),
  ('Yakult',              7),
  ('Nước ép',             8),
  ('Sữa chua',            9),
  ('Sữa chua dẻo',       10),
  ('Ăn vặt & Mì trộn',   11),
  ('Topping',             12);
-- 1.1 Cập nhật danh mục đã có
UPDATE categories c
SET name = tc.name,
    sort_order = tc.sort_order,
    active = true
FROM temp_categories tc
WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(tc.name));

-- 1.2 Thêm danh mục mới nếu chưa có
INSERT INTO categories (name, sort_order, active)
SELECT tc.name, tc.sort_order, true
FROM temp_categories tc
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(tc.name))
);
-- 1.3 Ẩn các danh mục cũ không còn dùng (giữ nguyên để không ảnh hưởng món cũ)
UPDATE categories
SET active = false
WHERE LOWER(TRIM(name)) NOT IN (SELECT LOWER(TRIM(name)) FROM temp_categories);
-- 2. TABLES (BÀN)
CREATE TEMP TABLE temp_tables (
  name TEXT,
  sort_order INT
) ON COMMIT DROP;

INSERT INTO temp_tables (name, sort_order) VALUES
  ('Bàn 01-T1',          1),
  ('Bàn 02-T1',          2),
  ('Bàn 03-T1',          3),
  ('Bàn dài',            4),
  ('Bàn trái',           5),
  ('Bàn gần ban công',   6),
  ('Mang về',             7);
-- 2.1 Cập nhật bàn đã có
UPDATE tables t
SET name = tt.name,
    sort_order = tt.sort_order,
    active = true
FROM temp_tables tt
WHERE LOWER(TRIM(t.name)) = LOWER(TRIM(tt.name));
-- 2.2 Thêm bàn mới nếu chưa có
INSERT INTO tables (name, sort_order, status, active)
SELECT tt.name, tt.sort_order, 'AVAILABLE', true
FROM temp_tables tt
WHERE NOT EXISTS (
  SELECT 1 FROM tables t WHERE LOWER(TRIM(t.name)) = LOWER(TRIM(tt.name))
);
-- 2.3 Ẩn các bàn cũ không còn dùng (giữ nguyên để không lỗi hóa đơn cũ liên kết đến bàn)
UPDATE tables
SET active = false
WHERE LOWER(TRIM(name)) NOT IN (SELECT LOWER(TRIM(name)) FROM temp_tables);
-- 3. PRODUCTS (MÓN ĂN / ĐỒ UỐNG)
CREATE TEMP TABLE temp_products (
  category_name TEXT,
  name TEXT,
  price NUMERIC(12, 0)
) ON COMMIT DROP;

INSERT INTO temp_products (category_name, name, price) VALUES
  -- CÀ PHÊ
  ('Cà phê', 'Cà phê phin', 25000),
  ('Cà phê', 'Cà phê nâu', 35000),
  ('Cà phê', 'Nâu lắc đá', 35000),
  ('Cà phê', 'Bạc xỉu', 35000),
  ('Cà phê', 'Bạc xỉu nóng', 40000),
  ('Cà phê', 'Espresso', 35000),
  ('Cà phê', 'Latte', 35000),
  ('Cà phê', 'Capuchino', 35000),
  ('Cà phê', 'Americano', 40000),
  ('Cà phê', 'Cafe cốt dừa', 40000),
  ('Cà phê', 'Cold brew', 45000),
  ('Cà phê', 'Cafe kem dẻo Ban Mê', 40000),
  ('Cà phê', 'Cà phê muối', 35000),
  ('Cà phê', 'Cà phê trứng', 35000),

  -- LATTE & SỮA
  ('Latte & Sữa', 'Matcha Latte nóng', 45000),
  ('Latte & Sữa', 'Matcha Latte đá', 40000),
  ('Latte & Sữa', 'Matcha Latte kem muối', 40000),
  ('Latte & Sữa', 'Sữa tươi', 25000),
  ('Latte & Sữa', 'Bột sắn dây', 25000),
  ('Latte & Sữa', 'Latte đào', 30000),
  ('Latte & Sữa', 'Latte xoài', 30000),
  ('Latte & Sữa', 'Latte dâu tây', 30000),
  ('Latte & Sữa', 'Latte việt quất', 30000),

  -- CACAO - SOCOLA
  ('Cacao - Socola', 'Hot Cacao Marshmallow', 35000),
  ('Cacao - Socola', 'Cacao kem muối', 35000),
  ('Cacao - Socola', 'Cacao', 30000),
  ('Cacao - Socola', 'Hot Socola Marshmallow', 35000),
  ('Cacao - Socola', 'Socola kem muối', 35000),
  ('Cacao - Socola', 'Socola', 30000),

  -- TRÀ
  ('Trà', 'Trà Lipton', 25000),
  ('Trà', 'Trà nhài', 25000),
  ('Trà', 'Trà hoa cúc', 25000),
  ('Trà', 'Trà hoa cúc đường phèn', 30000),
  ('Trà', 'Trà gừng', 25000),
  ('Trà', 'Trà táo', 25000),
  ('Trà', 'Trà dâu', 25000),
  ('Trà', 'Trà tắc (quất)', 25000),
  ('Trà', 'Trà chanh mật ong', 30000),
  ('Trà', 'Trà đào', 30000),
  ('Trà', 'Trà đào cam sả', 35000),
  ('Trà', 'Trà thảo mộc', 30000),
  ('Trà', 'Trà đậu biếc hạt chia', 30000),
  ('Trà', 'Trà mạn (một ấm)', 30000),
  ('Trà', 'Trà dưỡng nhan', 35000),
  ('Trà', 'Trà Detox', 30000),
  ('Trà', 'Trà hoa gạo lứt', 30000),
  ('Trà', 'Trà dứa chanh leo', 30000),
  ('Trà', 'Trà nhài nhãn', 30000),
  ('Trà', 'Trà quất nha đam', 30000),
  ('Trà', 'Trà nhài nha đam', 30000),
  ('Trà', 'Coco matcha', 40000),
  ('Trà', 'Trà hoa quả nhiệt đới', 35000),

  -- SINH TỐ
  ('Sinh tố', 'Sinh tố bơ', 40000),
  ('Sinh tố', 'Sinh tố mãng cầu', 40000),
  ('Sinh tố', 'Sinh tố dâu tây', 40000),
  ('Sinh tố', 'Sinh tố xoài', 35000),
  ('Sinh tố', 'Sinh tố dưa hấu', 30000),
  ('Sinh tố', 'Sinh tố thanh long', 30000),
  ('Sinh tố', 'Sinh tố mây trời', 35000),

  -- ĐÁ XAY
  ('Đá xay', 'Cốt dừa đá xay', 35000),
  ('Đá xay', 'Cốt dừa cafe', 40000),
  ('Đá xay', 'Cốt dừa cacao', 40000),
  ('Đá xay', 'Cốt dừa socola', 40000),
  ('Đá xay', 'Cốt dừa việt quất', 40000),
  ('Đá xay', 'Cốt dừa xoài', 40000),
  ('Đá xay', 'Cốt dừa dâu tây', 40000),
  ('Đá xay', 'Cốt dừa kiwi', 40000),
  ('Đá xay', 'Chanh tuyết', 40000),
  ('Đá xay', 'Chanh leo tuyết', 40000),
  ('Đá xay', 'Matcha đá xay', 40000),

  -- YAKULT
  ('Yakult', 'Yakult xoài', 30000),
  ('Yakult', 'Yakult dâu tây', 30000),
  ('Yakult', 'Yakult việt quất', 30000),
  ('Yakult', 'Yakult thanh long', 30000),
  ('Yakult', 'Yakult thanh long xoài', 30000),

  -- NƯỚC ÉP
  ('Nước ép', 'Ép chanh tươi', 25000),
  ('Nước ép', 'Ép chanh muối', 30000),
  ('Nước ép', 'Ép chanh leo', 30000),
  ('Nước ép', 'Ép dưa hấu', 30000),
  ('Nước ép', 'Ép ổi', 30000),
  ('Nước ép', 'Ép dứa', 30000),
  ('Nước ép', 'Ép cam', 40000),
  ('Nước ép', 'Ép táo', 40000),
  ('Nước ép', 'Ép dưa leo', 40000),
  ('Nước ép', 'Ép cà rốt', 40000),

  -- SỮA CHUA
  ('Sữa chua', 'Sữa chua đánh đá', 25000),
  ('Sữa chua', 'Sữa chua cà phê', 30000),
  ('Sữa chua', 'Sữa chua cacao', 30000),
  ('Sữa chua', 'Sữa chua socola', 30000),
  ('Sữa chua', 'Sữa chua việt quất', 30000),
  ('Sữa chua', 'Sữa chua kiwi', 30000),
  ('Sữa chua', 'Sữa chua đào', 30000),
  ('Sữa chua', 'Sữa chua matcha', 30000),
  ('Sữa chua', 'Sữa chua xoài', 30000),
  ('Sữa chua', 'Sữa chua dâu tây', 30000),
  ('Sữa chua', 'Sữa chua nha đam', 30000),
  ('Sữa chua', 'Sữa chua hoa quả', 40000),

  -- SỮA CHUA DẺO
  ('Sữa chua dẻo', 'Sữa chua dẻo', 30000),
  ('Sữa chua dẻo', 'Sữa chua dẻo dâu tây', 35000),
  ('Sữa chua dẻo', 'Sữa chua dẻo việt quất', 35000),
  ('Sữa chua dẻo', 'Sữa chua dẻo matcha', 35000),

  -- ĂN VẶT & MÌ TRỘN
  ('Ăn vặt & Mì trộn', 'Khô gà', 30000),
  ('Ăn vặt & Mì trộn', 'Khô bò', 30000),
  ('Ăn vặt & Mì trộn', 'Khô heo cháy tỏi', 30000),
  ('Ăn vặt & Mì trộn', 'Ngô cay giòn', 20000),
  ('Ăn vặt & Mì trộn', 'Hướng dương mộc', 15000),
  ('Ăn vặt & Mì trộn', 'Hướng dương vị', 15000),
  ('Ăn vặt & Mì trộn', 'Mì trộn thường', 20000),
  ('Ăn vặt & Mì trộn', 'Mì trộn trứng', 25000),
  ('Ăn vặt & Mì trộn', 'Mì trộn xúc xích', 25000),

  -- TOPPING
  ('Topping', 'Nha đam', 5000),
  ('Topping', 'Kem cheese', 5000),
  ('Topping', 'Hạt chia', 5000),
  ('Topping', 'Dừa khô', 5000),
  ('Topping', 'Trân châu trắng', 5000);

-- 3.1 Cập nhật món đã có (khớp theo tên, tự động cập nhật giá mới & danh mục mới)
UPDATE products p
SET name = tp.name,
    category_id = c.id,
    price = tp.price,
    active = true,
    updated_at = now()
FROM temp_products tp
JOIN categories c ON LOWER(TRIM(c.name)) = LOWER(TRIM(tp.category_name))
WHERE LOWER(TRIM(p.name)) = LOWER(TRIM(tp.name));

-- 3.2 Thêm món mới chưa từng có trong hệ thống
INSERT INTO products (category_id, name, price, active)
SELECT c.id, tp.name, tp.price, true
FROM temp_products tp
JOIN categories c ON LOWER(TRIM(c.name)) = LOWER(TRIM(tp.category_name))
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE LOWER(TRIM(p.name)) = LOWER(TRIM(tp.name))
);

-- 3.3 Ẩn các món cũ không còn trong menu mới (soft-delete để giữ nguyên lịch sử bán hàng)
UPDATE products
SET active = false,
    updated_at = now()
WHERE LOWER(TRIM(name)) NOT IN (SELECT LOWER(TRIM(name)) FROM temp_products);

COMMIT;

-- KIỂM TRA KẾT QUẢ SAU KHI CẬP NHẬT
SELECT 'Categories đang hoạt động' AS loai, COUNT(*) AS so_luong FROM categories WHERE active = true
UNION ALL
SELECT 'Products đang hoạt động', COUNT(*) FROM products WHERE active = true
UNION ALL
SELECT 'Products ngừng bán (đã ẩn)', COUNT(*) FROM products WHERE active = false
UNION ALL
SELECT 'Tables đang hoạt động', COUNT(*) FROM tables WHERE active = true;
