import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/authSlice';
import { getUserByEmail } from '../../api/jsonServer';
import { decryptData } from '../../utils/encryption';
import { validateLogin } from '../../utils/validation';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const validationResult = validateLogin(email, password);
    if (!validationResult.isValid) {
      setError(validationResult.message);
      return;
    }

    try {
      const user = await getUserByEmail(email);

      if (!user) {
        setError('User not found. Please register.');
        return;
      }

      // Decrypt the password from the database and compare
      const decryptedPassword = decryptData(user.password as string);
      if (decryptedPassword !== password) {
        setError('Invalid credentials.');
        return;
      }

      // Handle "stay logged in" feature by saving user data
      localStorage.setItem('user', JSON.stringify(user));

      // Dispatch the login action with user data
      dispatch(login(user));
      navigate('/'); // Correctly redirects to the home page

    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <h2>Log In</h2>
      <form onSubmit={handleLogin}>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error-message">{error}</p>}
        <Button onClick={() => {}}>Log In</Button>
      </form>
    </div>
  );
};

export default Login;
