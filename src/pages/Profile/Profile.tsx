import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { updateUser, getUserByEmail } from '../../api/jsonServer';
import { login } from '../../redux/authSlice';
import { encryptData } from '../../utils/encryption';
import { validateProfileUpdate } from '../../utils/validation';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import type { User } from '../../utils/types';
import './Profile.css';

const Profile: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    surname: '',
    email: '',
    cellNumber: '',
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    if (confirmPassword.length > 0 && password.length > 0) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        surname: user.surname,
        email: user.email,
        cellNumber: user.cellNumber,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('User data not found.');
      return;
    }

    const validationResult = validateProfileUpdate({
      ...formData,
      password: password,
      confirmPassword: confirmPassword,
    });
    
    if (!validationResult.isValid) {
      setError(validationResult.message);
      return;
    }

    try {

      if (formData.email !== user.email) {
        const existingUser = await getUserByEmail(formData.email as string);
        if (existingUser && existingUser.id !== user.id) {
          setError('This email is already taken.');
          return;
        }
      }

      let updatedData = { ...formData };
      
      if (password) {
        updatedData.password = encryptData(password);
      }

      const updatedUser = await updateUser(user.id, updatedData);
      
      dispatch(login(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');

    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {user ? (
        <form onSubmit={handleUpdate}>
          <Input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name || ''}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="surname"
            placeholder="Surname"
            value={formData.surname || ''}
            onChange={handleChange}
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email || ''}
            onChange={handleChange}
          />
          <Input
            type="tel"
            name="cellNumber"
            placeholder="Cell Number"
            value={formData.cellNumber || ''}
            onChange={handleChange}
          />
          <hr />
          <p>Update Password (optional)</p>
          <Input
            type="password"
            name="password"
            placeholder="New Password (min 6 characters)"
            value={password}
            onChange={handlePasswordChange}
          />
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={!passwordsMatch ? 'highlight-mismatch' : ''}
          />
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <Button onClick={() => {}}>Update Profile</Button>
        </form>
      ) : (
        <p>Loading profile data...</p>
      )}
    </div>
  );
};

export default Profile;
