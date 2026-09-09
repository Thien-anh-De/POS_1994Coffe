/* ============================================================
   POS 1994 Coffee — Type Definitions
   ============================================================ */

// ── Roles & Auth ──────────────────────────────────────────────
export type UserRole = 'OWNER' | 'MANAGER' | 'CASHIER'
export type ProfileStatus = 'active' | 'disabled'

export interface Profile {
  id: string
  name: string
  email?: string
  role: UserRole
  status: ProfileStatus
  created_at: string
}

// ── Categories ────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  sort_order: number
  active: boolean
  created_at: string
}

// ── Products ──────────────────────────────────────────────────
export interface Product {
  id: string
  category_id: string
  name: string
  price: number
  active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

// ── Tables ────────────────────────────────────────────────────
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'DISABLED'

export interface CoffeeTable {
  id: string
  name: string
  status: TableStatus
  sort_order: number
  active: boolean
  created_at: string
}

// ── Orders ────────────────────────────────────────────────────
export type OrderStatus = 'OPEN' | 'PAID' | 'CANCELLED'

export interface Order {
  id: string
  table_id: string
  cashier_id: string
  invoice_number: string
  status: OrderStatus
  subtotal: number
  discount: number
  total: number
  note?: string
  created_at: string
  paid_at: string | null
  cancelled_at: string | null
  cancelled_by: string | null
  cancel_reason: string | null
  table?: CoffeeTable
  cashier?: Profile
  items?: OrderItem[]
  payment?: Payment
}

// ── Order Items ───────────────────────────────────────────────
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  unit_price: number
  quantity: number
  subtotal: number
}

// ── Payments ──────────────────────────────────────────────────
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER'

export interface Payment {
  id: string
  order_id: string
  method: PaymentMethod
  amount: number
  paid_at: string
  cashier_id: string
}

// ── Audit Logs ────────────────────────────────────────────────
export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  details?: string
  created_at: string
  user?: Profile
}

// ── Revenue/Report Types ──────────────────────────────────────
export interface RevenueData {
  total_revenue: number
  total_orders: number
  avg_order_value: number
}

export interface TopProduct {
  product_name: string
  total_quantity: number
  total_revenue: number
}

export interface MonthlyRevenue {
  month: number
  year: number
  total_revenue: number
  total_orders: number
}

// ── UI / Cart ─────────────────────────────────────────────────
export interface CartItem {
  product_id: string
  product_name: string
  unit_price: number
  quantity: number
  subtotal: number
}
