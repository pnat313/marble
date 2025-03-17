import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import TlogUploader from "./components/TlogUploader";
import PolyLine from "./components/Map";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TlogUploader />} />
        <Route path="/map" element={<PolyLine />} />
      </Routes>
    </Router>
  );
}

export default App;
