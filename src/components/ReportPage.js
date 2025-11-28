import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api/reports/daily";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Filter states
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReports = async (query = "") => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReports(response.data.data);
      setError(null);
    } catch (err) {
      setReports([]);
      setError(
        err.response && err.response.status === 403
          ? "Akses Ditolak: Halaman ini hanya untuk Admin."
          : (err.response ? err.response.data.message : "Gagal mengambil data")
      );
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (searchName) params.append("email", searchName);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const query = params.toString() ? `?${params.toString()}` : "";
    fetchReports(query);
  };

  const handleResetFilter = () => {
    setSearchName("");
    setStartDate("");
    setEndDate("");
    fetchReports();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-lavender-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* JUDUL */}
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-800">
          📊 Laporan Presensi (Admin)
        </h1>

        {/* FILTER SECTION */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cari Nama */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cari Nama
                </label>
                <input
                  type="text"
                  placeholder="Nama mahasiswa..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                />
              </div>

              {/* Dari Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                />
              </div>

              {/* Sampai Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Tombol Filter & Reset */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-purple-500 hover:to-purple-700 transition-all duration-300"
              >
                🔍 Filter Data
              </button>
              <button
                type="button"
                onClick={handleResetFilter}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-200 transition-all duration-300"
              >
                🔄 Reset
              </button>
            </div>
          </form>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        {/* TABLE */}
        {!error && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                {/* Header Tabel Background Ungu */}
                <thead className="bg-gradient-to-r from-purple-400 to-purple-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold uppercase text-xs tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-left font-semibold uppercase text-xs tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left font-semibold uppercase text-xs tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-4 text-left font-semibold uppercase text-xs tracking-wider">
                      Check Out
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.length > 0 ? (
                    reports.map((presensi, index) => (
                      <tr
                        key={index}
                        className="hover:bg-purple-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-gray-800 font-medium">
                          {presensi.user ? presensi.user.email : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(presensi.checkIn).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-600 font-semibold">
                            {new Date(presensi.checkIn).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {presensi.checkOut ? (
                            <span className="text-red-600 font-semibold">
                              {new Date(presensi.checkOut).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">
                              Belum
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <span className="text-5xl">📭</span>
                          <p className="text-lg">
                            Tidak ada data laporan yang ditemukan.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportPage;