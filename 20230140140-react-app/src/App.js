import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import DashboardPage from "./components/DashboardPage";
import Navbar from "./components/Navbar";
import PresensiPage from "./components/PresensiPage.js";
import ReportPage from "./components/ReportPage.js"; // ✅ Import ReportPage
import SensorPage from './components/SensorPage.js';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";




function App() {
  const token = localStorage.getItem("token");

  let user = null;
  if (token) {
    try {
      user = jwtDecode(token);
    } catch (err) {
      console.error("Token tidak valid");
    }
  }

  // ✅ Fungsi logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Redirect ke login
  };

  return (
    <Router>
      {/* ✅ Pass user dan handleLogout ke Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={<DashboardPage user={user} token={token} />}
        />

        <Route
          path="/presensi"
          element={<PresensiPage user={user} token={token} />}
        />
        {/* Di dalam <Routes> */}
        <Route path="/sensor" element={<SensorPage />} />
        {/* ✅ Tambahkan route reports */}
        <Route
          path="/reports"
          element={<ReportPage user={user} token={token} />}
        />
      </Routes>
    </Router>
  );
}

export default App;