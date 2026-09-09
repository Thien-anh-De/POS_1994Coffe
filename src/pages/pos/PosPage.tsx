import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { tableService } from '@/services/tableService'
import { categoryService } from '@/services/categoryService'
import { productService } from '@/services/productService'
import { orderService } from '@/services/orderService'
import { ToastContainer, LoadingSpinner, EmptyState, Modal } from '@/components/ui'
import { formatCurrency } from '@/utils/helpers'
import type { CoffeeTable, Category, Product, Order, OrderItem, CartItem } from '@/types'
import {
  Coffee,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  Banknote,
  X,
  ShoppingBag,
  Check,
  Percent,
} from 'lucide-react'

export default function PosPage() {
  const { user } = useAuth()
  const { toasts, success, error: toastError, removeToast } = useToast()

  const [tables, setTables] = useState<CoffeeTable[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Current POS state
  const [selectedTable, setSelectedTable] = useState<CoffeeTable | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [showPayment, setShowPayment] = useState(false)

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [t, c, p] = await Promise.all([
        tableService.getActive(),
        categoryService.getActive(),
        productService.getActive(),
      ])
      setTables(t)
      setCategories(c)
      setProducts(p)
      if (c.length > 0 && !activeCategory) setActiveCategory(c[0].id)
    } catch {
      toastError('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [activeCategory, toastError])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Select table → load or create order
  const handleSelectTable = async (table: CoffeeTable) => {
    if (table.status === 'DISABLED') return
    setSelectedTable(table)

    try {
      const existing = await orderService.getOpenByTable(table.id)
      if (existing) {
        setCurrentOrder(existing)
        setOrderItems(existing.items ?? [])
        setDiscount(existing.discount)
      } else {
        // Create new order
        if (!user) return
        const newOrder = await orderService.create(table.id, user.id)
        setCurrentOrder(newOrder)
        setOrderItems([])
        setDiscount(0)
        // Refresh tables
        loadData()
      }
    } catch {
      toastError('Không thể mở order')
    }
  }

  // Add product to order
  const handleAddProduct = async (product: Product) => {
    if (!selectedTable) {
      toastError('Vui lòng bấm chọn một bàn (ở cột bên trái) trước khi chọn món!')
      return
    }
    if (!currentOrder) {
      toastError('Chưa mở được order cho bàn này, vui lòng bấm chọn lại bàn')
      return
    }
    try {
      const cartItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        quantity: 1,
        subtotal: product.price,
      }
      await orderService.addItem(currentOrder.id, cartItem)
      // Refresh order
      const updated = await orderService.getOpenByTable(currentOrder.table_id)
      if (updated) {
        setCurrentOrder(updated)
        setOrderItems(updated.items ?? [])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể thêm món'
      toastError(msg)
    }
  }

  // Update quantity
  const handleQtyChange = async (item: OrderItem, delta: number) => {
    if (!currentOrder) return
    const newQty = item.quantity + delta
    try {
      await orderService.updateItemQuantity(item.id, currentOrder.id, newQty)
      const updated = await orderService.getOpenByTable(currentOrder.table_id)
      if (updated) {
        setCurrentOrder(updated)
        setOrderItems(updated.items ?? [])
      }
    } catch {
      toastError('Không thể cập nhật')
    }
  }

  // Remove item
  const handleRemoveItem = async (item: OrderItem) => {
    if (!currentOrder) return
    try {
      await orderService.removeItem(item.id, currentOrder.id)
      const updated = await orderService.getOpenByTable(currentOrder.table_id)
      if (updated) {
        setCurrentOrder(updated)
        setOrderItems(updated.items ?? [])
      }
    } catch {
      toastError('Không thể xóa món')
    }
  }

  // Set discount
  const handleSetDiscount = async () => {
    if (!currentOrder) return
    try {
      await orderService.setDiscount(currentOrder.id, discount)
      const updated = await orderService.getOpenByTable(currentOrder.table_id)
      if (updated) {
        setCurrentOrder(updated)
      }
      success('Đã áp dụng giảm giá')
    } catch {
      toastError('Lỗi khi giảm giá')
    }
  }

  // Pay
  const handlePay = async (method: 'CASH' | 'BANK_TRANSFER') => {
    if (!currentOrder || !user) return
    try {
      await orderService.pay(currentOrder.id, method, currentOrder.total, user.id)
      success(`Thanh toán thành công — ${method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}`)
      setShowPayment(false)
      setSelectedTable(null)
      setCurrentOrder(null)
      setOrderItems([])
      setDiscount(0)
      loadData()
    } catch {
      toastError('Thanh toán thất bại')
    }
  }

  // Back to table selection
  const handleBack = () => {
    setSelectedTable(null)
    setCurrentOrder(null)
    setOrderItems([])
    setDiscount(0)
  }

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products

  const subtotal = currentOrder?.subtotal ?? orderItems.reduce((s, i) => s + i.subtotal, 0)
  const total = Math.max(0, subtotal - discount)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <LoadingSpinner size={32} />
      </div>
    )
  }

  // ── TABLE SELECTION VIEW ────────────────────────────────────
  if (!selectedTable) {
    return (
      <div className="animate-fade-in">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="page-header">
          <h1 className="page-title">Bán hàng</h1>
          <p className="page-subtitle">Chọn bàn để bắt đầu order</p>
        </div>

        <div
          className="stagger-children"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '1rem',
          }}
        >
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleSelectTable(table)}
              disabled={table.status === 'DISABLED'}
              className={`glass-card ${
                table.status === 'AVAILABLE'
                  ? 'table-available'
                  : table.status === 'OCCUPIED'
                  ? 'table-occupied'
                  : 'table-disabled'
              }`}
              style={{
                padding: '1.25rem',
                cursor: table.status === 'DISABLED' ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                border: '2px solid',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                {table.name}
              </div>
              <span
                className={`badge ${
                  table.status === 'AVAILABLE'
                    ? 'badge-success'
                    : table.status === 'OCCUPIED'
                    ? 'badge-warning'
                    : 'badge-info'
                }`}
              >
                {table.status === 'AVAILABLE' ? 'Trống' : table.status === 'OCCUPIED' ? 'Đang dùng' : 'Tắt'}
              </span>
            </button>
          ))}
        </div>

        {tables.length === 0 && (
          <EmptyState
            icon={<Coffee size={48} />}
            title="Chưa có bàn nào"
            description="Vui lòng thêm bàn trong mục Quản lý bàn"
          />
        )}
      </div>
    )
  }

  // ── ORDER VIEW ──────────────────────────────────────────────
  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 3rem)' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* LEFT: Menu */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header with back button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleBack}>
            <X size={18} />
          </button>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
            {selectedTable.name}
          </h2>
          <span className="badge badge-coffee">{currentOrder?.invoice_number}</span>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`btn btn-sm ${activeCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '0.75rem',
            alignContent: 'start',
          }}
        >
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleAddProduct(product)}
              className="glass-card"
              style={{
                padding: '1rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{product.name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-coffee-400)', fontWeight: 500 }}>
                {formatCurrency(product.price)}
              </div>
            </button>
          ))}

          {filteredProducts.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <p>Chưa có món trong danh mục này</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Order Summary */}
      <div
        className="glass-card"
        style={{
          width: 360,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShoppingBag size={18} color="var(--color-coffee-400)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Đơn hàng</h3>
          <span className="badge badge-coffee" style={{ marginLeft: 'auto' }}>
            {orderItems.length} món
          </span>
        </div>

        {/* Order Items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {orderItems.length === 0 ? (
            <EmptyState title="Chưa có món" description="Chọn món từ menu bên trái" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-light)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.125rem' }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {formatCurrency(item.unit_price)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleQtyChange(item, -1)} style={{ padding: '0.25rem' }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleQtyChange(item, 1)} style={{ padding: '0.25rem' }}>
                      <Plus size={14} />
                    </button>
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: 80, textAlign: 'right', color: 'var(--color-coffee-300)' }}>
                    {formatCurrency(item.subtotal)}
                  </div>

                  <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveItem(item)} style={{ padding: '0.25rem', color: 'var(--color-danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discount */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Percent size={14} color="var(--color-text-muted)" />
            <input
              className="input"
              type="number"
              placeholder="Giảm giá (VNĐ)"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              style={{ flex: 1, fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
            />
            <button className="btn btn-secondary btn-sm" onClick={handleSetDiscount}>
              <Check size={14} />
            </button>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
              <span>Tạm tính</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
                <span>Giảm giá</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <hr className="divider" style={{ margin: '0.25rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.125rem' }}>
              <span>Tổng cộng</span>
              <span style={{ color: 'var(--color-coffee-300)' }}>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={orderItems.length === 0}
            onClick={() => setShowPayment(true)}
          >
            Thanh toán
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)} title="Chọn phương thức thanh toán">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
          <div
            style={{
              textAlign: 'center',
              padding: '1rem',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Tổng thanh toán</div>
            <div className="stat-value">{formatCurrency(total)}</div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={() => handlePay('CASH')}
            style={{ width: '100%' }}
          >
            <Banknote size={20} />
            Tiền mặt
          </button>

          <button
            className="btn btn-secondary btn-lg"
            onClick={() => handlePay('BANK_TRANSFER')}
            style={{ width: '100%' }}
          >
            <CreditCard size={20} />
            Chuyển khoản
          </button>
        </div>
      </Modal>
    </div>
  )
}
