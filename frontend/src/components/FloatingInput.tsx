import React, { useState } from "react";
import styled from "styled-components";
import { Eye, EyeOff } from "lucide-react";

interface FloatingInputProps {
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  type = "text",
  name,
  value,
  onChange,
  label,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <StyledWrapper>
      <div className="input-container">
        <input
          type={inputType}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder=" "
        />
        <label htmlFor={name} className="label">
          {label}
        </label>
        <div className="underline" />
        
        {isPassword && (
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="eye-icon" />
            ) : (
              <Eye className="eye-icon" />
            )}
          </button>
        )}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .input-container {
    position: relative;
    width: 100%;
  }

  .input-container input {
    font-size: 16px;
    width: 100%;
    border: none;
    border-bottom: 2px solid #ccc;
    padding: 10px 40px 10px 0;
    background-color: transparent;
    outline: none;
  }

  .input-container .label {
    position: absolute;
    top: 10px;
    left: 0;
    color: #aaa;
    font-size: 16px;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  .input-container input:focus ~ .label,
  .input-container input:not(:placeholder-shown) ~ .label {
    top: -12px;
    font-size: 13px;
    color: #2563eb;
  }

  .input-container .underline {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 100%;
    background-color: #2563eb;
    transform: scaleX(0);
    transition: all 0.3s ease;
  }

  .input-container input:focus ~ .underline,
  .input-container input:not(:placeholder-shown) ~ .underline {
    transform: scaleX(1);
  }

  .toggle-password {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    transition: color 0.2s ease;
  }

  .toggle-password:hover {
    color: #2563eb;
  }

  .toggle-password:focus {
    outline: none;
    color: #2563eb;
  }

  .eye-icon {
    width: 20px;
    height: 20px;
  }

  /* Ensure button is visible on mobile */
  @media (max-width: 640px) {
    .toggle-password {
      padding: 12px;
    }
    
    .eye-icon {
      width: 22px;
      height: 22px;
    }
  }
`;

export default FloatingInput;