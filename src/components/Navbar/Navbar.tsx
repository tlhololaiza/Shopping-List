import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/authSlice';
import './Navbar.css';
import { ShoppingCart, Home, List, User, LogIn, UserPlus, LogOut } from 'lucide-react'; // Import Lucide icons

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('user'); // Clear "stay logged in" data
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <ShoppingCart size={24} />
          <span className="logo-text">ShopList</span>
        </Link>
      </div>
      <ul className="navbar-links">
         {isAuthenticated && user ? (
          <>
            <li>
              <span className="user-greeting">
                Hello, {user.name}
              </span>
            </li>
            <li>
                <Link to="/home" className="nav-link">
                  <Home size={16} />
                  <span>Home</span>
                </Link>
            </li>
            <li>
              <Link to="/shopping-lists" className="nav-link">
                <List size={16} />
                <span>Shopping Lists</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="nav-link">
                <User size={16} />
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-link-text">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="nav-btn-primary">
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