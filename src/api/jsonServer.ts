// src/api/jsonServer.ts
import type { User, RegisterData } from '../utils/types'; // Assume you have a types file

const API_BASE_URL = 'http://localhost:5000';

export const registerUser = async (userData: RegisterData): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Registration failed: ${errorText}`);
  }

  return response.json();
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const response = await fetch(`${API_BASE_URL}/users?email=${email}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }

  const users: User[] = await response.json();
  return users.length > 0 ? users[0] : null;
};

export const updateUser = async (userId: number, updatedData: Partial<User>): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  return response.json();
};
