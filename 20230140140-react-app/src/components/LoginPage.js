import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password,
      });

      const token = response.data.token;
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div className="min-h-screen bg-purple-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-purple-200">
        <h2 className="text-3xl font-extrabold text-center text-purple-600 mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            Login 
          </button>
        </form>

        {error && <p className="text-red-600 text-center mt-4">{error}</p>}

        <p className="mt-4 text-center text-sm">
          Belum punya akun?{" "}
          <a href="/register" className="text-purple-600 font-semibold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;