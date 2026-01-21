import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import { ShoppingCart, ListChecks, CheckCircle, Search, ShieldCheck, NotebookPen, UserCog, Sparkles } from 'lucide-react';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <ShoppingCart size={48} />
          </div>
          {isAuthenticated && user ? (
            <p className="hero-subtitle" style={{ marginBottom: '8px', fontWeight: 600 }}>
              Welcome back, {user.name}!
            </p>
          ) : null}
          <h1 className="hero-title">
            Shopping made <span className="highlight">simple</span>
          </h1>
          <p className="hero-subtitle">
            Organize your groceries, track your purchases, and never forget an item
            again. The smartest way to manage your shopping lists.
          </p>
          <div className="hero-buttons">
            <Link to={isAuthenticated ? "/shopping-lists" : "/register"} className="btn-primary">
              {isAuthenticated ? 'Go to your lists →' : 'Get Started Free →'}
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      {isAuthenticated && user && (
        <section className="features-section" style={{ paddingTop: '24px' }}>
          <div className="features-header">
            <h2 className="features-title">Welcome, {user.name}</h2>
            <p className="features-subtitle">
              Pick up where you left off or tune your preferences.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true"><NotebookPen size={22} /></div>
              <h3 className="feature-title">Your shopping lists</h3>
              <p className="feature-description">
                View and manage all your lists in one place.
              </p>
              <Link to="/shopping-lists" className="btn-secondary" style={{ display: 'inline-block', marginTop: '8px' }}>
                Open lists
              </Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true"><UserCog size={22} /></div>
              <h3 className="feature-title">Profile & settings</h3>
              <p className="feature-description">
                Update your name, email, and password anytime.
              </p>
              <Link to="/profile" className="btn-secondary" style={{ display: 'inline-block', marginTop: '8px' }}>
                Edit profile
              </Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true"><Sparkles size={22} /></div>
              <h3 className="feature-title">Keep things tidy</h3>
              <p className="feature-description">
                Archive old lists and stay focused on what matters now.
              </p>
              <Link to="/shopping-lists" className="btn-secondary" style={{ display: 'inline-block', marginTop: '8px' }}>
                Manage now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2 className="features-title">Everything you need</h2>
          <p className="features-subtitle">
            Powerful features to help you stay organized and efficient.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true"><ListChecks size={22} /></div>
            <h3 className="feature-title">Multiple Lists</h3>
            <p className="feature-description">
              Create and manage multiple shopping lists for different occasions.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true"><CheckCircle size={22} /></div>
            <h3 className="feature-title">Track Progress</h3>
            <p className="feature-description">
              Mark items as complete and see your shopping progress at a glance.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true"><Search size={22} /></div>
            <h3 className="feature-title">Quick Search</h3>
            <p className="feature-description">
              Find items instantly with powerful search and filtering.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true"><ShieldCheck size={22} /></div>
            <h3 className="feature-title">Secure & Private</h3>
            <p className="feature-description">
              Your data is encrypted and only accessible by you.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to get organized?</h2>
          <p className="cta-subtitle">
            Join thousands of users who are already shopping smarter.
          </p>
          {!isAuthenticated ? (
            <Link to="/register" className="btn-cta">
              Create Free Account
            </Link>
          ) : (
            <Link to="/shopping-lists" className="btn-cta">
              Go to my lists
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2025 ShopList. Made by Tlholo for smart shoppers.</p>
      </footer>
    </div>
  );
};

export default Home;