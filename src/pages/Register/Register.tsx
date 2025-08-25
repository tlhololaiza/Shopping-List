import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/jsonServer';
import { encryptData } from '../../utils/encryption';
import { validateRegistration } from '../../utils/validation';
import type { RegisterData } from '../../utils/types';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './Register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    surname: '',
    email: '',
    password: '',
    cellNumber: '',
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
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
        <Input
          type="text"
          name="surname"
          placeholder="Surname"
          value={formData.surname}
          onChange={handleChange}
        />
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <Input
          type="password"
          name="password"
          placeholder="Password (min 6 characters)"
          value={formData.password}
          onChange={handleChange}
        />
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
        />
        <Input
          type="tel"
          name="cellNumber"
          placeholder="Cell Number"
          value={formData.cellNumber}
          onChange={handleChange}
        />
        {error && <p className="error-message">{error}</p>}
        <Button onClick={() => {}}>Register</Button>
      </form>
    </div>
  );
};

export default Register;
