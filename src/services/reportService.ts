import { supabase } from '@/lib/supabase'
import type { RevenueData, TopProduct, MonthlyRevenue } from '@/types'

export const reportService = {
  async getRevenue(from: string, to: string): Promise<RevenueData> {
    const { data, error } = await supabase
      .from('orders')
      .select('total')
      .eq('status', 'PAID')
      .gte('paid_at', from)
      .lte('paid_at', to)

    if (error) throw new Error(error.message)

    const orders = data ?? []
    const total_revenue = orders.reduce((sum, o) => sum + o.total, 0)
    const total_orders = orders.length
    const avg_order_value = total_orders > 0 ? total_revenue / total_orders : 0

    return { total_revenue, total_orders, avg_order_value }
  },

  async getTodayRevenue(): Promise<RevenueData> {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
    return this.getRevenue(start, end)
  },

  async getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]> {
    const results: MonthlyRevenue[] = []

    for (let month = 1; month <= 12; month++) {
      const start = new Date(year, month - 1, 1).toISOString()
      const end = new Date(year, month, 1).toISOString()

      const { data } = await supabase
        .from('orders')
        .select('total')
        .eq('status', 'PAID')
        .gte('paid_at', start)
        .lte('paid_at', end)

      const orders = data ?? []
      results.push({
        month,
        year,
        total_revenue: orders.reduce((sum, o) => sum + o.total, 0),
        total_orders: orders.length,
      })
    }

    return results
  },

  async getYearlyRevenue(year: number): Promise<RevenueData> {
    const start = new Date(year, 0, 1).toISOString()
    const end = new Date(year + 1, 0, 1).toISOString()
    return this.getRevenue(start, end)
  },

  async getTopProducts(from: string, to: string, limit = 10): Promise<TopProduct[]> {
    // Get all paid order IDs in date range
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'PAID')
      .gte('paid_at', from)
      .lte('paid_at', to)

    if (!orders || orders.length === 0) return []

    const orderIds = orders.map((o) => o.id)

    // Get order items for these orders
    const { data: items } = await supabase
      .from('order_items')
      .select('product_name, quantity, subtotal')
      .in('order_id', orderIds)

    if (!items) return []

    // Aggregate by product_name
    const map = new Map<string, { quantity: number; revenue: number }>()
    for (const item of items) {
      const existing = map.get(item.product_name) ?? { quantity: 0, revenue: 0 }
      existing.quantity += item.quantity
      existing.revenue += item.subtotal
      map.set(item.product_name, existing)
    }

    const results: TopProduct[] = []
    for (const [name, val] of map.entries()) {
      results.push({
        product_name: name,
        total_quantity: val.quantity,
        total_revenue: val.revenue,
      })
    }

    results.sort((a, b) => b.total_quantity - a.total_quantity)
    return results.slice(0, limit)
  },
}
