import React, { useState } from "react";
import { useNavigate } from "react-router";
import './styles.css';  // Import the CSS file

export default function TlogUploader() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // State to track the loading status
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".tlog")) {
      setFile(selectedFile);
    } else {
      setMessage("Please select a valid .tlog file");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files[0];
    if (selectedFile && selectedFile.name.endsWith(".tlog")) {
      setFile(selectedFile);
      setMessage(""); // Clear any previous error message
    } else {
      setMessage("Please drop a valid .tlog file");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Set loading state to true before the upload starts
    setLoading(true);
    // TODO - Dynamic Base URL
    try {
      const response = await fetch("http://127.0.0.1:5000/upload-tlog", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Upload successful: " + data.file_path);
        // Redirect to the map screen after successful upload
        navigate("/map");
      } else {
        setMessage("Upload failed: " + data.error);
      }
    } catch (error) {
      setMessage("Error uploading file");
    } finally {
     
      setLoading(false);
    }
  };

  const handleAreaClick = () => {
    document.getElementById("file-input").click(); 
  };

  return (
    <div className="uploader-container">
      <h2 className="uploader-header">Upload TLOG File</h2>

      <div
        className="file-drop-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleAreaClick} 
      >
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept=".tlog"
        />
        {file ? (
          <p className="file-name">{file.name}</p>
        ) : (
          <p className="placeholder-text">Drag & drop a .tlog file here or click to select</p>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', width: "100%", flexDirection: 'column', alignItems: 'center' }}>
        <button
          onClick={handleUpload}
          className="upload-button"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}

        {message && (
          <p className="upload-message">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
