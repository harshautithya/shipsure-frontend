
import { useEffect, useState } from 'react'

function Dashboard({ merchant, onCheckout }) {
  const [phone, setPhone] = useState('')
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [analytics, setAnalytics] = useState(null)
  const [analyticsError, setAnalyticsError] = useState('')

  const [recentOrders, setRecentOrders] = useState([])
  const [ordersError, setOrdersError] = useState('')
  const [ordersLoading, setOrdersLoading] = useState(true)

  // Fetch merchant analytics
  useEffect(() => {
    const controller = new AbortController()

    const fetchAnalytics = async () => {
      setAnalytics(null)
      setAnalyticsError('')

      try {
        const response = await fetch(
          'http://localhost:8080/api/analytics/merchant',
          {
            headers: {
              Authorization: `Bearer ${merchant.token}`
            },
            signal: controller.signal
          }
        )

        if (!response.ok) {
          throw new Error('Unable to load merchant analytics.')
        }

        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setAnalyticsError(err.message)
        }
      }
    }

    fetchAnalytics()

    return () => controller.abort()
  }, [merchant.token])

  // Fetch recent orders for the logged-in merchant
  useEffect(() => {
    const controller = new AbortController()

    const fetchRecentOrders = async () => {
      setOrdersLoading(true)
      setOrdersError('')
      setRecentOrders([])

      try {
        const response = await fetch(
          'http://localhost:8080/api/orders/recent',
          {
            headers: {
              Authorization: `Bearer ${merchant.token}`
            },
            signal: controller.signal
          }
        )

        if (!response.ok) {
          throw new Error('Unable to load recent orders.')
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Invalid orders response.')
        }

        setRecentOrders(data)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setOrdersError(err.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setOrdersLoading(false)
        }
      }
    }

    fetchRecentOrders()

    return () => controller.abort()
  }, [merchant.token])

  // Customer risk assessment
  const checkRisk = async (event) => {
    event.preventDefault()

    setError('')
    setAssessment(null)

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `http://localhost:8080/api/risk/checkout?phone=${encodeURIComponent(phone)}`
      )

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'Customer not found.'
            : 'Unable to check customer risk.'
        )
      }

      const data = await response.json()
      setAssessment(data)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const riskClass = (level) => {
    if (level === 'LOW') return 'risk-low'
    if (level === 'MEDIUM') return 'risk-medium'
    return 'risk-high'
  }

  // Analytics calculations
  const total = analytics?.totalOrders ?? 0
  const delivered = analytics?.deliveredOrders ?? 0
  const rto = analytics?.rtoOrders ?? 0

  const other = Math.max(total - delivered - rto, 0)

  const percentage = (value) => {
    return total > 0 ? (value / total) * 100 : 0
  }

  // Dashboard statistics
  const stats = [
    {
      label: 'Total Orders',
      value: analytics ? total : '—',
      icon: '📦',
      color: 'blue',
      description: 'All recorded orders'
    },
    {
      label: 'Delivered Orders',
      value: analytics ? delivered : '—',
      icon: '✓',
      color: 'green',
      description: 'Successfully delivered'
    },
    {
      label: 'RTO Orders',
      value: analytics ? rto : '—',
      icon: '↩',
      color: 'red',
      description: 'Returned shipments'
    },
    {
      label: 'RTO Rate',
      value: analytics ? `${analytics.rtoRate}%` : '—',
      icon: '%',
      color: 'purple',
      description: 'Return-to-origin percentage'
    }
  ]

  return (
    <main className="ss-dashboard">

      {/* WELCOME SECTION */}
      <div className="ss-dashboard-top">
        <div>
          <span className="ss-eyebrow">
            MERCHANT DASHBOARD
          </span>

          <h1>
            Welcome back, {merchant.name} 👋
          </h1>

          <p>
            Here's an overview of your store's delivery performance.
          </p>
        </div>

        <button
          className="ss-primary-btn"
          onClick={onCheckout}
        >
          Open Demo Checkout ↗
        </button>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="ss-stats-grid">
        {stats.map((stat) => (
          <div className="ss-stat-card" key={stat.label}>
            <div className="ss-stat-top">
              <span>{stat.label}</span>

              <span
                className={`ss-stat-icon ss-${stat.color}`}
              >
                {stat.icon}
              </span>
            </div>

            <h2>{stat.value}</h2>
            <p>{stat.description}</p>
          </div>
        ))}
      </div>

      {analyticsError && (
        <p className="error-message">
          {analyticsError}
        </p>
      )}

      {/* PERFORMANCE AND INTELLIGENCE */}
      <div className="ss-content-grid">

        <section className="ss-card ss-performance">
          <div className="ss-card-heading">
            <div>
              <h2>Delivery Performance</h2>
              <p>
                Distribution of recorded order outcomes
              </p>
            </div>

            <span className="ss-small-tag">
              Overview
            </span>
          </div>

          <div className="ss-performance-summary">
            <div>
              <span className="ss-performance-number">
                {analytics ? total : '—'}
              </span>
              <p>Total Orders</p>
            </div>

            <div className="ss-performance-rate">
              <span>
                {analytics
                  ? `${analytics.rtoRate}%`
                  : '—'}
              </span>
              <p>RTO Rate</p>
            </div>
          </div>

          <div className="ss-progress-bar">
            <div
              className="ss-progress-delivered"
              style={{
                width: `${percentage(delivered)}%`
              }}
            />

            <div
              className="ss-progress-rto"
              style={{
                width: `${percentage(rto)}%`
              }}
            />

            <div
              className="ss-progress-other"
              style={{
                width: `${percentage(other)}%`
              }}
            />
          </div>

          <div className="ss-chart-legend">
            <div>
              <span className="ss-dot ss-dot-green" />
              Delivered
              <strong>
                {analytics ? delivered : '—'}
              </strong>
            </div>

            <div>
              <span className="ss-dot ss-dot-red" />
              RTO
              <strong>
                {analytics ? rto : '—'}
              </strong>
            </div>

            <div>
              <span className="ss-dot ss-dot-yellow" />
              Other
              <strong>
                {analytics ? other : '—'}
              </strong>
            </div>
          </div>
        </section>

        <section className="ss-card ss-intelligence">
          <div className="ss-intelligence-icon">
            🛡️
          </div>

          <span className="ss-eyebrow">
            SHIPSURE INTELLIGENCE
          </span>

          <h2>
            Smarter decisions. Fewer returns.
          </h2>

          <p>
            Analyze customer delivery history and identify
            potential COD risks before dispatching orders.
          </p>

          <div className="ss-intelligence-footer">
            <span>
              ✓ Risk-based recommendations
            </span>

            <span>
              ✓ Historical order analysis
            </span>
          </div>
        </section>
      </div>

      {/* CUSTOMER RISK ANALYZER */}
      <section className="ss-card ss-risk-section">
        <div className="ss-card-heading">
          <div>
            <h2>Customer Risk Analyzer</h2>
            <p>
              Enter a customer's mobile number to assess
              their delivery risk.
            </p>
          </div>

          <span className="ss-small-tag">
            Risk Engine
          </span>
        </div>

        <form
          className="ss-risk-form"
          onSubmit={checkRisk}
        >
          <div className="ss-input-wrapper">
            <span>+91</span>

            <input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={phone}
              maxLength={10}
              onChange={(event) => {
                setPhone(
                  event.target.value
                    .replace(/\D/g, '')
                    .slice(0, 10)
                )

                setAssessment(null)
                setError('')
              }}
            />
          </div>

          <button
            className="ss-primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Analyzing...'
              : 'Analyze Customer →'}
          </button>
        </form>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {assessment && (
          <div className="ss-risk-result">
            <div className="ss-risk-score-block">
              <span>RISK SCORE</span>

              <h3>
                {assessment.riskScore}
                <small>/100</small>
              </h3>

              <p>
                Customer ID: {assessment.customerId}
              </p>
            </div>

            <div className="ss-risk-details">
              <span
                className={`risk-badge ${riskClass(
                  assessment.riskLevel
                )}`}
              >
                {assessment.riskLevel} RISK
              </span>

              <h3>
                Checkout Recommendation
              </h3>

              <p>
                {assessment.recommendation}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* RECENT ORDERS TABLE */}
      <section className="ss-card ss-orders-section">
        <div className="ss-card-heading">
          <div>
            <h2>Recent Orders</h2>
            <p>
              Latest customer orders and delivery statuses
            </p>
          </div>

          <span className="ss-small-tag">
            Latest 10
          </span>
        </div>

        {ordersError && (
          <p className="error-message">
            {ordersError}
          </p>
        )}

        <div className="ss-table-wrapper">
          <table className="ss-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {ordersLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="ss-empty-orders"
                  >
                    Loading recent orders...
                  </td>
                </tr>
              ) : ordersError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="ss-empty-orders"
                  >
                    Could not load orders.
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="ss-empty-orders"
                  >
                    No orders available.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="ss-order-id">
                      #{order.id}
                    </td>

                    <td>
                      {order.customerName}
                    </td>

                    <td>
                      ₹{Number(order.amount)
                        .toLocaleString('en-IN')}
                    </td>

                    <td>
                      {order.paymentMethod}
                    </td>

                    <td>
                      <span
                        className={`ss-order-status ${
                          order.status === 'DELIVERED'
                            ? 'ss-status-delivered'
                            : order.status === 'RTO'
                            ? 'ss-status-rto'
                            : 'ss-status-other'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* FOOTER */}
      <p className="ss-dashboard-footer">
        ShipSure • Intelligent COD Risk Management
      </p>

    </main>
  )
}

export default Dashboard
