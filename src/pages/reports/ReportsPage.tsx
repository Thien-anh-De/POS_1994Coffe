import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/useToast'
import { reportService } from '@/services/reportService'
import { ToastContainer, LoadingSpinner } from '@/components/ui'
import { formatCurrency } from '@/utils/helpers'
import type { RevenueData, TopProduct, MonthlyRevenue } from '@/types'
import {
  BarChart3,
  TrendingUp,
  Receipt,
  DollarSign,
  Calendar,
  Trophy,
  ArrowUpRight,
} from 'lucide-react'

type ReportTab = 'today' | 'range' | 'monthly' | 'yearly'

export default function ReportsPage() {
  const { toasts, error: toastError, removeToast } = useToast()
  const [activeTab, setActiveTab] = useState<ReportTab>('today')
  const [loading, setLoading] = useState(false)

  // Data
  const [todayData, setTodayData] = useState<RevenueData | null>(null)
  const [rangeData, setRangeData] = useState<RevenueData | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([])
  const [yearlyData, setYearlyData] = useState<RevenueData | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])

  // Filters
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const loadToday = useCallback(async () => {
    setLoading(true)
    try {
      const data = await reportService.getTodayRevenue()
      setTodayData(data)

      // Also load top products for today
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
      const top = await reportService.getTopProducts(start, end)
      setTopProducts(top)
    } catch {
      toastError('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [toastError])

  const loadRange = useCallback(async () => {
    if (!dateFrom || !dateTo) return
    setLoading(true)
    try {
      const from = new Date(dateFrom).toISOString()
      const to = new Date(dateTo + 'T23:59:59').toISOString()
      const [data, top] = await Promise.all([
        reportService.getRevenue(from, to),
        reportService.getTopProducts(from, to),
      ])
      setRangeData(data)
      setTopProducts(top)
    } catch {
      toastError('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, toastError])

  const loadMonthly = useCallback(async () => {
    setLoading(true)
    try {
      const data = await reportService.getMonthlyRevenue(selectedYear)
      setMonthlyData(data)
    } catch {
      toastError('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [selectedYear, toastError])

  const loadYearly = useCallback(async () => {
    setLoading(true)
    try {
      const [data, top] = await Promise.all([
        reportService.getYearlyRevenue(selectedYear),
        reportService.getTopProducts(
          new Date(selectedYear, 0, 1).toISOString(),
          new Date(selectedYear + 1, 0, 1).toISOString()
        ),
      ])
      setYearlyData(data)
      setTopProducts(top)
    } catch {
      toastError('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [selectedYear, toastError])

  useEffect(() => {
    if (activeTab === 'today') loadToday()
  }, [activeTab, loadToday])

  const tabs: { key: ReportTab; label: string; icon: typeof BarChart3 }[] = [
    { key: 'today', label: 'Hôm nay', icon: TrendingUp },
    { key: 'range', label: 'Theo ngày', icon: Calendar },
    { key: 'monthly', label: 'Theo tháng', icon: BarChart3 },
    { key: 'yearly', label: 'Theo năm', icon: DollarSign },
  ]

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ]

  const renderRevenueSummary = (data: RevenueData | null) => {
    if (!data) return null
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
        className="stagger-children"
      >
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <DollarSign size={16} color="var(--color-coffee-400)" />
            <span className="stat-label">Doanh thu</span>
          </div>
          <div className="stat-value">{formatCurrency(data.total_revenue)}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Receipt size={16} color="var(--color-success)" />
            <span className="stat-label">Số hóa đơn</span>
          </div>
          <div className="stat-value">{data.total_orders}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ArrowUpRight size={16} color="var(--color-info)" />
            <span className="stat-label">Giá trị TB</span>
          </div>
          <div className="stat-value">{formatCurrency(data.avg_order_value)}</div>
        </div>
      </div>
    )
  }

  const renderTopProducts = () => {
    if (topProducts.length === 0) return null
    return (
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Trophy size={16} color="var(--color-warning)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Top món bán chạy</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên món</th>
              <th style={{ textAlign: 'right' }}>Số lượng</th>
              <th style={{ textAlign: 'right' }}>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => (
              <tr key={p.product_name}>
                <td>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background:
                        i === 0
                          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                          : i === 1
                          ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                          : i === 2
                          ? 'linear-gradient(135deg, #cd7f32, #a0522d)'
                          : 'var(--color-surface)',
                      color: i < 3 ? 'white' : 'var(--color-text-muted)',
                      border: i >= 3 ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    {i + 1}
                  </span>
                </td>
                <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{p.product_name}</td>
                <td style={{ textAlign: 'right' }}>{p.total_quantity}</td>
                <td style={{ textAlign: 'right', color: 'var(--color-coffee-400)', fontWeight: 500 }}>
                  {formatCurrency(p.total_revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="page-header">
        <h1 className="page-title">Doanh thu</h1>
        <p className="page-subtitle">Thống kê và báo cáo bán hàng</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <LoadingSpinner size={32} />
        </div>
      )}

      {/* TODAY */}
      {activeTab === 'today' && !loading && (
        <div>
          {renderRevenueSummary(todayData)}
          {renderTopProducts()}
        </div>
      )}

      {/* DATE RANGE */}
      {activeTab === 'range' && !loading && (
        <div>
          <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div style={{ flex: '0 1 200px' }}>
                <label className="input-label">Từ ngày</label>
                <input className="input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div style={{ flex: '0 1 200px' }}>
                <label className="input-label">Đến ngày</label>
                <input className="input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={loadRange}>
                Xem báo cáo
              </button>
            </div>
          </div>
          {renderRevenueSummary(rangeData)}
          {renderTopProducts()}
        </div>
      )}

      {/* MONTHLY */}
      {activeTab === 'monthly' && !loading && (
        <div>
          <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div>
                <label className="input-label">Năm</label>
                <select className="select" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={loadMonthly}>Xem</button>
            </div>
          </div>

          {monthlyData.length > 0 && (
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tháng</th>
                    <th style={{ textAlign: 'right' }}>Số hóa đơn</th>
                    <th style={{ textAlign: 'right' }}>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m) => (
                    <tr key={m.month}>
                      <td style={{ fontWeight: 500 }}>{monthNames[m.month - 1]}</td>
                      <td style={{ textAlign: 'right' }}>{m.total_orders}</td>
                      <td style={{ textAlign: 'right', color: 'var(--color-coffee-400)', fontWeight: 600 }}>
                        {formatCurrency(m.total_revenue)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 700 }}>
                    <td>Tổng cộng</td>
                    <td style={{ textAlign: 'right' }}>{monthlyData.reduce((s, m) => s + m.total_orders, 0)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-coffee-300)' }}>
                      {formatCurrency(monthlyData.reduce((s, m) => s + m.total_revenue, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Simple Bar Chart */}
          {monthlyData.length > 0 && (
            <div className="glass-card" style={{ padding: '1.25rem', marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Biểu đồ doanh thu</h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 200 }}>
                {monthlyData.map((m) => {
                  const max = Math.max(...monthlyData.map((d) => d.total_revenue), 1)
                  const pct = (m.total_revenue / max) * 100
                  return (
                    <div
                      key={m.month}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: `${Math.max(pct, 2)}%`,
                          background: m.total_revenue > 0
                            ? 'linear-gradient(180deg, var(--color-coffee-400), var(--color-coffee-700))'
                            : 'var(--color-border)',
                          borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                          transition: 'height 0.5s ease',
                        }}
                        title={formatCurrency(m.total_revenue)}
                      />
                      <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                        T{m.month}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* YEARLY */}
      {activeTab === 'yearly' && !loading && (
        <div>
          <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div>
                <label className="input-label">Năm</label>
                <select className="select" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={loadYearly}>Xem</button>
            </div>
          </div>
          {renderRevenueSummary(yearlyData)}
          {renderTopProducts()}
        </div>
      )}
    </div>
  )
}
