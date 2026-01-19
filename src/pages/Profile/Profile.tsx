import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { updateUser, getUserByEmail } from '../../api/jsonServer';
import { login } from '../../redux/authSlice';
import { encryptData } from '../../utils/encryption';
import { validateProfileUpdate } from '../../utils/validation';
import { User as UserIcon, Mail, Lock } from 'lucide-react';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import type { User } from '../../utils/types';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    surname: '',
    email: '',
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

    if (!user) {
      toast.error('User data not found.');
      return;
    }

    const validationResult = validateProfileUpdate({
      ...formData,
      password: password,
      confirmPassword: confirmPassword,
    });
    
    if (!validationResult.isValid) {
      toast.error(validationResult.message);
      return;
    }

    try {

      if (formData.email !== user.email) {
        const existingUser = await getUserByEmail(formData.email as string);
        if (existingUser && existingUser.id !== user.id) {
          toast.error('This email is already taken.');
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
      toast.success('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');

    } catch {
      toast.error('Failed to update profile.');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-icon">
          <UserIcon size={40} />
        </div>
        <h2>Profile</h2>
        <p className="profile-subtitle">Update your account information</p>
        {user ? (
          <>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Name</label>
                <div className="input-wrapper">
                  <UserIcon className="input-icon" size={18} />
                  <Input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Surname</label>
                <div className="input-wrapper">
                  <UserIcon className="input-icon" size={18} />
                  <Input
                    type="text"
                    name="surname"
                    placeholder="Surname"
                    value={formData.surname || ''}
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
                    placeholder="your@mail.com"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <hr />
              <h3 className="section-title">Change Password (optional)</h3>
              <div className="form-group">
                <label>New password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Confirm new password</label>
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
              {!passwordsMatch && confirmPassword && (
                <p className="highlight-mismatch">Passwords do not match</p>
              )}
              <Button type="submit">Update Profile</Button>
            </form>
          </>
        ) : (
          <p>Loading profile data...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
