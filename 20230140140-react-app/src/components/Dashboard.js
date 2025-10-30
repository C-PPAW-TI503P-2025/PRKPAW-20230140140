import React from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-lg text-center">

        <h1 className="text-4xl font-bold text-blue-600 mb-3">
          Dashboard
        </h1>
        <p className="text-gray-700 text-lg mb-8">
          Selamat datang! Kamu berhasil login dan berada di halaman Dashboard.
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg shadow-md"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
