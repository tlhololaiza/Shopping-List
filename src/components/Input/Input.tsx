import React from 'react';
import './Input.css';

interface InputProps {
  type: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  min?: string;
  error?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  type, 
  name, 
  placeholder, 
  value, 
  onChange,
  required = false,
  disabled = false,
  className = '',
  onBlur,
  autoFocus = false,
  min,
  error = false
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
      className={`custom-input ${className}${error ? ' input-error' : ''}`}
      onBlur={onBlur}
      autoFocus={autoFocus}
      min={min}
      style={error ? { borderColor: '#dc3545', boxShadow: '0 0 0 3px rgba(220, 53, 69, 0.1)' } : {}}
    />
  );
};

export default Input;