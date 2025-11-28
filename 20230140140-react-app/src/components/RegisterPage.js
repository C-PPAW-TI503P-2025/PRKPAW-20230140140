import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [role, setRole] = useState("mahasiswa");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await axios.post("http://localhost:3001/api/auth/register", {
        role,
        email,
        password,
      });

      setSuccessMsg(true);
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registrasi gagal — cek kembali input dan server."
      );
    }
  };

  return (
    <div className="min-h-screen bg-purple-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-purple-200">
        <h2 className="text-3xl font-extrabold text-center text-purple-600 mb-6">
          Register
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-700">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-purple-400 focus:border-purple-400"
            >
              <option value="mahasiswa">Mahasiswa</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-purple-400 focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-purple-400 focus:border-purple-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-purple-500 text-white font-semibold rounded-xl shadow-md hover:bg-purple-600 transition"
          >
            Register 
          </button>
        </form>

        {error && (
          <p className="text-red-600 mt-4 text-center font-medium">{error}</p>
        )}

        <p className="mt-4 text-center text-sm">
          Sudah punya akun?{" "}
          <a href="/login" className="text-purple-600 font-semibold">
            Login
          </a>
        </p>
      </div>

      {successMsg && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-300 text-center animate-bounce">
            <h3 className="text-2xl font-bold text-purple-600">
              Registrasi Berhasil! 
            </h3>
            <p className="mt-2 text-gray-600">Mengalihkan ke halaman login...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;