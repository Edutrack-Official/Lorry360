
import React from "react";
import styled from "styled-components";

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
  return (
    <StyledWrapper>
      <div className="input-container">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder=" "  // 👈 important for :placeholder-shown trick
        />
        <label htmlFor={name} className="label">
          {label}
        </label>
        <div className="underline" />
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
    padding: 10px 0;
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

  /* 👇 Fix floating issue: works when not empty OR focused */
  .input-container input:focus ~ .label,
  .input-container input:not(:placeholder-shown) ~ .label {
    top: -12px;
    font-size: 13px;
    color: #2563eb; /* Tailwind blue-600 */
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
`;

export default FloatingInput;
