import React from 'react';
import './Input.css';

interface InputProps {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({ 
  type, 
  name, 
  placeholder, 
  value, 
  onChange,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`custom-input ${className}`}
    />
  );
};

export default Input;