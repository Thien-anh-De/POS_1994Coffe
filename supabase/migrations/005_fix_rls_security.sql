-- Migration 005: Fix RLS Security Policies
-- Chặn truy cập vô danh (unauthenticated/anon) vào dữ liệu nhạy cảm: hóa đơn, thanh toán, hồ sơ nhân viên

-- 1. Chỉ tài khoản đã đăng nhập mới được xem hóa đơn
DROP POLICY IF EXISTS "orders_select" ON orders;
CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 2. Chỉ tài khoản đã đăng nhập mới được xem chi tiết món trong hóa đơn
DROP POLICY IF EXISTS "order_items_select" ON order_items;
CREATE POLICY "order_items_select" ON order_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 3. Chỉ tài khoản đã đăng nhập mới được xem thanh toán và doanh thu
DROP POLICY IF EXISTS "payments_select" ON payments;
CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 4. Chỉ tài khoản đã đăng nhập mới được xem danh sách hồ sơ nhân viên
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);
