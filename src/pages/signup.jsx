
import { useState } from 'react'

function Signup({ onSignupSuccess, onGoToLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'https://shipsure-api.onrender.com/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password
          })
        }
      )

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('This email is already registered.')
        }
        throw new Error('Registration failed. Please try again.')
      }

      onSignupSuccess()
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Cannot connect to the server.'
          : err.message
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
          Create your merchant account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              placeholder="Enter business name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="merchant@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            className="continue-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="login-footer">
          Already have an account?{' '}
          <button
            type="button"
            className="auth-link"
            onClick={onGoToLogin}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

export default Signup
