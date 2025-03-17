# Simple Flight Replay Player

This project provides a simple flight replay player, allowing users to visualize flight data from TLOG files.

## Overview

The application consists of two main components:

* **Backend (Misc folder):**
    * A Flask-based API for uploading and parsing TLOG files.
    * Uses `pymavlink` to extract flight data from TLOGs.
    * Provides an endpoint to retrieve parsed flight data.
* **Frontend (FE folder):**
    * A React-based web application for visualizing flight data.
    * Utilizes Leaflet for map display and flight path rendering.
    * Consumes the backend API to fetch flight data.

## Technologies Used

* **Backend:**
    * Python
    * Flask
    * pymavlink
* **Frontend:**
    * React
    * Leaflet
    * Javascript
    * HTML
    * CSS

## Getting Started

### Backend Setup (Misc folder)

1.  **Navigate to the `Misc` directory:**
    ```bash
    cd Misc
    ```
2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    ```
3.  **Activate the virtual environment:**
    * On Windows: `venv\Scripts\activate`
    * On macOS/Linux: `source venv/bin/activate`
4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
5.  **Run the Flask application:**
    ```bash
    python app.py
    ```

### Frontend Setup (FE folder)

1.  **Navigate to the `FE` directory:**
    ```bash
    cd FE
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the React application:**
    ```bash
    npm start
    ```

### Usage

1.  **Upload TLOG:**
    * Open the React application in your browser.
    * Use the provided upload interface to upload a TLOG file.
2.  **View Flight Data:**
    * The application will fetch and display the flight path on the Leaflet map.
    * The player will show the flight progress over the map.

## Requirements

* Python 3.6+
* Node.js and npm

## Dependencies

* See `Misc/requirements.txt` for backend dependencies.
* See `FE/package.json` for frontend dependencies.