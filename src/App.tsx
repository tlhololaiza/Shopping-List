import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { login } from './redux/authSlice';
import type { User } from './utils/types';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    // Check for a logged-in user in local storage when the app loads
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        // If a user is found, dispatch the login action to update the Redux state
        store.dispatch(login(user));
      } catch (error) {
        console.error("Failed to parse user data from local storage", error);
        localStorage.removeItem('user'); // Clear corrupted data
      }
    }
  }, []); // The empty dependency array ensures this runs only once on mount

  return (
    <div className="App">
      {/* The Redux Provider makes the store available to all components */}
      <Provider store={store}>
        {/* Router enables client-side routing */}
        <Router>
          {/* Navbar is a shared component that appears on all pages */}
          <Navbar />
          {/* Routes define the paths and the components to render */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* ProtectedRoute wraps the routes that require authentication.
              If the user is not logged in, they will be redirected.
            */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </Provider>
    </div>
  );
};

export default App;