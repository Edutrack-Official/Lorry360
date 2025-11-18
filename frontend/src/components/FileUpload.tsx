import React, { useState } from "react";
import styled from "styled-components";

interface FileUploadProps {
    label?: string;
    onFileSelect?: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
    label = "Click to upload file",
    onFileSelect,
}) => {
    const [fileName, setFileName] = useState<string>("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFileName(file ? file.name : "");
        if (onFileSelect) {
            onFileSelect(file);
        }
    };

    return (
        <StyledWrapper>
            <label className="custum-file-upload" htmlFor="file">
                <div className="icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M10 1C9.73 1 9.48 1.11 9.29 1.29L3.29 7.29C3.11 7.48 3 7.73 3 8V20C3 21.66 4.34 23 6 23H7C7.55 23 8 22.55 8 22C8 21.45 7.55 21 7 21H6C5.45 21 5 20.55 5 20V9H10C10.55 9 11 8.55 11 8V3H18C18.55 3 19 3.45 19 4V9C19 9.55 19.45 10 20 10C20.55 10 21 9.55 21 9V4C21 2.34 19.66 1 18 1H10ZM9 7H6.41L9 4.41V7ZM14 15.5C14 14.12 15.12 13 16.5 13C17.88 13 19 14.12 19 15.5V16V17H20C21.1 17 22 17.9 22 19C22 20.1 21.1 21 20 21H13C11.9 21 11 20.1 11 19C11 17.9 11.9 17 13 17H14V16V15.5ZM16.5 11C14.14 11 12.21 12.81 12.02 15.12C10.28 15.56 9 17.13 9 19C9 21.21 10.79 23 13 23H20C22.21 23 24 21.21 24 19C24 17.13 22.72 15.56 20.98 15.12C20.79 12.81 18.86 11 16.5 11Z"
                        />
                    </svg>
                </div>
                <div className="text">
                    <span>{fileName || label}</span>
                </div>
                <input id="file" type="file" onChange={handleFileChange} />
            </label>
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
  .custum-file-upload {
    height: 200px;
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border: 2px dashed #cacaca;
    background-color: #fff;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0px 48px 35px -48px rgba(0, 0, 0, 0.1);
    transition: border 0.3s ease, background 0.3s ease;
  }

  .custum-file-upload:hover {
    border-color: royalblue;
    background-color: rgba(65, 105, 225, 0.05);
  }

  .custum-file-upload .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custum-file-upload .icon svg {
    height: 80px;
    fill: rgba(75, 85, 99, 1);
  }

  .custum-file-upload .text {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custum-file-upload .text span {
    font-weight: 500;
    color: rgba(55, 65, 81, 1);
    text-align: center;
  }

  .custum-file-upload input {
    display: none;
  }
`;

export default FileUpload;