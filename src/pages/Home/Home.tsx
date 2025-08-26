// src/pages/Home/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <div className="home-container">
      {isAuthenticated ? (
        <>
          <h2>Welcome, {user?.name}!</h2>
          <p>
            Welcome to your personal shopping list manager. Here you can add, view, edit, and delete your shopping lists.
            You can also search for items by name and sort your lists by various criteria.
          </p>
          <p>
            To begin, click on the **Shopping Lists** link in the navigation bar or <Link to="/shopping-lists">click here</Link> to create and manage your lists.
          </p>
        </>
      ) : (
        <>
          <h2>Welcome to the Shopping List App!</h2>
          <p>
            This app helps you create, manage, and organize your shopping lists with ease.
            You can add items with details like name, quantity, category, notes, and even images.
          </p>
          <p>
            To start organizing your shopping, please **log in** or **register** to create your account.
          </p>
        </>
      )}
    </div>
  );
};

export default Home;