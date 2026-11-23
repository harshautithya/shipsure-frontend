
import { useState } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Checkout from './pages/Checkout'
import './App.css'

function App() {
  const [merchant, setMerchant] = useState(null)
  const [authPage, setAuthPage] = useState('login')
  const [currentPage, setCurrentPage] = useState('dashboard')

  const handleLogin = (data) => {
    setMerchant(data)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setMerchant(null)
    setAuthPage('login')
    setCurrentPage('dashboard')
  }

  if (!merchant) {
    if (authPage === 'signup') {
      return (
        <Signup
          onSignupSuccess={() => setAuthPage('login')}
          onGoToLogin={() => setAuthPage('login')}
        />
      )
    }

    return (
      <Login
        onLogin={handleLogin}
        onGoToSignup={() => setAuthPage('signup')}
      />
    )
  }

  return (
    <div>
      <header className="app-header">
        <div className="app-brand">ShipSure</div>

        <div className="header-actions">
          <span>Welcome, {merchant.name}</span>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {currentPage === 'dashboard' ? (
        <Dashboard
          merchant={merchant}
          onCheckout={() => setCurrentPage('checkout')}
        />
      ) : (
        <div>
          <div className="checkout-navigation">
            <button
              className="back-button"
              onClick={() => setCurrentPage('dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>

          <Checkout />
        </div>
      )}
    </div>
  )
}

export default App
