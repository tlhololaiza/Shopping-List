// src/pages/Home/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import { ShoppingCart } from 'lucide-react';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <ShoppingCart size={48} />
          </div>
          <h1 className="hero-title">
            Shopping made <span className="highlight">simple</span>
          </h1>
          <p className="hero-subtitle">
            Organize your groceries, track your purchases, and never forget an item
            again. The smartest way to manage your shopping lists.
          </p>
          <div className="hero-buttons">
            <Link to={isAuthenticated ? "/shopping-lists" : "/register"} className="btn-primary">
              Get Started Free →
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

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
            <div className="feature-icon">☰</div>
            <h3 className="feature-title">Multiple Lists</h3>
            <p className="feature-description">
              Create and manage multiple shopping lists for different occasions.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✓</div>
            <h3 className="feature-title">Track Progress</h3>
            <p className="feature-description">
              Mark items as complete and see your shopping progress at a glance.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">Quick Search</h3>
            <p className="feature-description">
              Find items instantly with powerful search and filtering.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
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
          <Link to="/register" className="btn-cta">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2024 ShopList. Made with ❤️ for smart shoppers.</p>
      </footer>
    </div>
  );
};

export default Home;