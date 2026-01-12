import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    // Background jadi purple-600
    <nav className="bg-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <button 
              onClick={() => user ? navigate('/dashboard') : navigate('/login')}
              // Hover effect jadi purple-200
              className="text-2xl font-bold hover:text-purple-200 transition"
            >
              PresensiApp
            </button>
            
            {/* Menu untuk user yang sudah login */}
            {user && (
              <>
                {/* Menu Dashboard - Selalu tampil */}
                <button 
                  onClick={() => navigate('/dashboard')}
                  className={`hover:text-purple-200 transition flex items-center space-x-1 ${
                    location.pathname === '/dashboard' ? 'text-purple-200 font-bold' : ''
                  }`}
                >
                  <span>🏠</span>
                  <span>Dashboard</span>
                </button>
                {/* Menu Presensi - Selalu tampil */}
                <button 
                  onClick={() => navigate('/presensi')}
                  className={`hover:text-purple-200 transition flex items-center space-x-1 ${
                    location.pathname === '/presensi' ? 'text-purple-200 font-bold' : ''
                  }`}
                >
                  <span>📋</span>
                  <span>Presensi</span>
                </button>

                {/* --- TAMBAHKAN MENU INI --- */}
                <button 
                  onClick={() => navigate('/sensor')}
                  className={`hover:text-purple-200 transition flex items-center space-x-1 ${
                    location.pathname === '/sensor' ? 'text-purple-200 font-bold' : ''
                  }`}
                >
                  <span>🌡️</span>
                  <span>Monitoring IoT</span>
                </button>
                {/* Menu Laporan Admin - Hanya untuk admin, selalu tampil */}
                {user.role === 'admin' && (
                  <button 
                    onClick={() => navigate('/reports')}
                    className={`hover:text-purple-200 transition flex items-center space-x-1 ${
                      location.pathname === '/reports' ? 'text-purple-200 font-bold' : ''
                    }`}
                  >
                    <span>📊</span>
                    <span>Laporan Admin</span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Background info user jadi purple-700 (lebih gelap dari navbar) */}
                <div className="flex items-center space-x-2 bg-purple-700 px-4 py-2 rounded-xl shadow-sm">
                  <span className="text-sm font-medium">
                    {user.email}
                  </span>
                  {/* Badge role tetap warna standar untuk pembeda (Kuning/Hijau) */}
                  <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                    user.role === 'admin' 
                      ? 'bg-yellow-400 text-yellow-900' 
                      : 'bg-green-400 text-green-900'
                  }`}>
                    {user.role === 'admin' ? '👑 Admin' : '👤 Mahasiswa'}
                  </span>
                </div>
                
                {/* Tombol Logout - Tetap Merah tapi sedikit diperhalus border radiusnya */}
                <button
                  onClick={onLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition flex items-center space-x-2 shadow-md"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              // Tombol Login (saat belum login)
              <button
                onClick={() => navigate('/login')}
                // Jadi Putih teks Purple agar kontras dengan background Navbar
                className="bg-white text-purple-600 font-bold hover:bg-purple-50 px-6 py-2 rounded-xl transition shadow-md"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;