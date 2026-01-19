import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/authSlice';
import Button from '../Button/Button';
import './Navbar.css';
import { ShoppingCart, Home, List, User, LogIn, UserPlus, LogOut, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('user');
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <ShoppingCart size={24} />
          <span className="logo-text">ShopList</span>
        </Link>
      </div>
      
      <button 
        className="mobile-menu-toggle" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <ul className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
         {isAuthenticated && user ? (
          <>
            <li>
              <span className="user-greeting">
                Hello, {user.name}
              </span>
            </li>
            <li>
                <Link to="/home" className="nav-link" onClick={closeMobileMenu}>
                  <Home size={16} />
                  <span>Home</span>
                </Link>
            </li>
            <li>
              <Link to="/shopping-lists" className="nav-link" onClick={closeMobileMenu}>
                <List size={16} />
                <span>Shopping Lists</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="nav-link" onClick={closeMobileMenu}>
                <User size={16} />
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <Button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-link-text" onClick={closeMobileMenu}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="nav-btn-primary" onClick={closeMobileMenu}>
                Get Started
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;