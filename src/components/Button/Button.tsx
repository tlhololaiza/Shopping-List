import React from 'react';
import './Button.css';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  type = 'button',
  className = '',
  disabled = false,
  style
}) => {
  return (
    <button 
      onClick={onClick} 
      type={type}
      className={`custom-button ${className}`}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;