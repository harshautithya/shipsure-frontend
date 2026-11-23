
import { useState } from 'react'

function Login({ onLogin, onGoToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'https://shipsure-api.onrender.com/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim(),
            password
          })
        }
      )

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid email or password.')
        }

        throw new Error('Login failed. Please try again.')
      }

      const data = await response.json()

      if (!data.token) {
        throw new Error('No authentication token received.')
      }

      onLogin(data)

    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Unable to connect to the server.'
          : err.message || 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-brand">
          <span className="brand-icon">🛡️</span>
          <h1>ShipSure</h1>
        </div>

        <p className="login-tagline">
  Merchant Login
</p>

        <p className="login-description">
          Sign in to manage orders and analyze customer COD risk.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="continue-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        <p className="login-footer">
          Don't have an account?{' '}
          <button
            type="button"
            className="auth-link"
            onClick={onGoToSignup}
          >
            Sign Up
          </button>
        </p>

      </div>
    </div>
  )
}

export default Login
