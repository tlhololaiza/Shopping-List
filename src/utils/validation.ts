import type { RegisterData } from './types';

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateRegistration = (data: RegisterData): { isValid: boolean, message: string } => {
  if (!data.name || !data.surname || !data.email || !data.password || !data.cellNumber) {
    return { isValid: false, message: 'All fields are required.' };
  }

  if (!isValidEmail(data.email)) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }

  if (!isValidPassword(data.password)) {
    return { isValid: false, message: 'Password must be at least 6 characters long.' };
  }

  return { isValid: true, message: '' };
};

export const validateLogin = (email: string, password: string): { isValid: boolean, message: string } => {
  if (!email || !password) {
    return { isValid: false, message: 'Email and password are required.' };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }

  return { isValid: true, message: '' };
};

export const validateProfileUpdate = (data: { email?: string; password?: string; confirmPassword?: string }): { isValid: boolean, message: string } => {
  if (data.email && !isValidEmail(data.email)) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }

  if (data.password || data.confirmPassword) {
    if (data.password !== data.confirmPassword) {
      return { isValid: false, message: 'Passwords do not match.' };
    }
    if (data.password && !isValidPassword(data.password)) {
      return { isValid: false, message: 'Password must be at least 6 characters long.' };
    }
  }

  return { isValid: true, message: '' };
};
