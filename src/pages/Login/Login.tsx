import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/authSlice';
import { getUserByEmail } from '../../api/jsonServer';
import { decryptData } from '../../utils/encryption';
import { validateLogin } from '../../utils/validation';
import { ShoppingCart, Mail, Lock } from 'lucide-react';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { toast } from 'react-toastify';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationResult = validateLogin(email, password);
    if (!validationResult.isValid) {
      toast.error(validationResult.message);
      return;
    }

    try {
      const user = await getUserByEmail(email);

      if (!user) {
        toast.error('User not found. Please register.');
        return;
      }

      // Decrypt the password from the database and compare
      const decryptedPassword = decryptData(user.password as string);
      if (decryptedPassword !== password) {
        toast.error('Invalid credentials.');
        return;
      }

      // Handle "stay logged in" feature by saving user data
      localStorage.setItem('user', JSON.stringify(user));

      // Dispatch the login action with user data
      dispatch(login(user));
      toast.success('Login successful!');
      navigate('/'); // Correctly redirects to the home page

    } catch (err) {
      toast.error('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <ShoppingCart size={40} />
        </div>
        <h2>Welcome back</h2>
        <p className="login-subtitle">Sign in to manage your shopping lists</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <Input
                type="email"
                name="email"
                placeholder="your@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit">Sign in</Button>
        </form>
        <div className="login-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
