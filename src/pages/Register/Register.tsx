import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/jsonServer';
import { encryptData } from '../../utils/encryption';
import { validateRegistration } from '../../utils/validation';
import type { RegisterData } from '../../utils/types';
import { ShoppingCart, User, Mail, Lock } from 'lucide-react';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import './Register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    surname: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const validationResult = validateRegistration(formData);
    if (!validationResult.isValid) {
      setError(validationResult.message);
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const encryptedData = { ...formData, password: encryptData(formData.password) };
      await registerUser(encryptedData);
      alert('Registration successful! You can now log in.');
      navigate('/home'); 

    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-icon">
          <ShoppingCart size={40} />
        </div>
        <h2>Create account</h2>
        <p className="register-subtitle">Start organizing your shopping today</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <Input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Confirm password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <Input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
            </div>
          </div>
          <Button type="submit">Create account</Button>
        </form>
        <div className="register-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
