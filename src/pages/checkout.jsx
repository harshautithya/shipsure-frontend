
import { useState } from 'react'

function Checkout() {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [assessment, setAssessment] = useState(null)

  const handleContinue = async (event) => {
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
        `https://shipsure-api.onrender.com/api/risk/checkout?phone=${encodeURIComponent(phone)}`
      )

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'Customer not found. Please check your mobile number.'
            : 'Unable to assess risk. Please try again.'
        )
      }

      const data = await response.json()
      setAssessment(data)
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          'Unable to connect. Please try again in a moment.'
        )
      } else {
        setError(err.message || 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getRecommendation = (recommendation) => {
    switch (recommendation) {
      case 'COD_ALLOWED':
        return 'Cash on Delivery is available.'
      case 'PARTIAL_PAYMENT':
        return 'Pay 20% now and the remaining 80% on delivery.'
      case 'PREPAID_ONLY':
        return 'Prepaid payment is required.'
      default:
        return 'Please contact the store for payment options.'
    }
  }

  const getRiskClass = (level) => {
    if (level === 'LOW') return 'risk-low'
    if (level === 'MEDIUM') return 'risk-medium'
    return 'risk-high'
  }

  return (
    <main className="simple-checkout">
      <section className="checkout-card">
        <h1>Checkout</h1>

        <p className="checkout-subtitle">
          Review your order and continue to payment.
        </p>

        <div className="product-row">
          <div className="product-image">🎧</div>

          <div className="product-details">
            <strong>Wireless Headphones</strong>
            <p>Black · Quantity: 1</p>
          </div>

          <strong>₹1,999</strong>
        </div>

        <div className="order-total">
          <span>Total</span>
          <strong>₹1,999</strong>
        </div>

        <form onSubmit={handleContinue}>
          <div className="form-group">
            <label htmlFor="phone">Mobile number</label>

            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="Enter 10-digit mobile number"
              value={phone}
              maxLength={10}
              required
              onChange={(event) => {
                const digits = event.target.value
                  .replace(/\D/g, '')
                  .slice(0, 10)

                setPhone(digits)
                setError('')
                setAssessment(null)
              }}
            />

            <p className="field-hint">
              Enter your mobile number to continue.
            </p>
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <button
            className="continue-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Continue to payment'}
          </button>
        </form>

        {assessment && (
          <section
            className="assessment-result"
            aria-live="polite"
          >
            <p className="eyebrow">
              SHIPSURE RISK ASSESSMENT
            </p>

            <div className="assessment-heading">
              <h2>Assessment result</h2>

              <span
                className={`risk-badge ${getRiskClass(
                  assessment.riskLevel
                )}`}
              >
                {assessment.riskLevel}
              </span>
            </div>

            <p className="risk-score">
              Risk score:{' '}
              <strong>{assessment.riskScore}/100</strong>
            </p>

            <div className="recommendation">
              <strong>Recommended payment method</strong>

              <p>
                {getRecommendation(assessment.recommendation)}
              </p>
            </div>

            {assessment.recommendation === 'COD_ALLOWED' && (
              <div className="payment-option">
                Cash on Delivery — ₹1,999
              </div>
            )}

            {assessment.recommendation === 'PARTIAL_PAYMENT' && (
              <>
                <div className="payment-option">
                  Pay now (20%) — ₹399.80
                </div>

                <div className="payment-option">
                  Pay on delivery (80%) — ₹1,599.20
                </div>
              </>
            )}

            {assessment.recommendation === 'PREPAID_ONLY' && (
              <div className="payment-option">
                Prepaid payment — ₹1,999
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  )
}

export default Checkout
