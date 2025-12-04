import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api/reports/daily";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ⭐ Modal Foto
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchReports = async (query = "") => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const res = await axios.get(`${API_URL}${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data.data);
      setError(null);
    } catch (err) {
      setReports([]);
      setError(
        err.response?.status === 403
          ? "Akses Ditolak: Halaman ini hanya untuk Admin."
          : err.response?.data?.message || "Gagal mengambil data"
      );
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchName) params.append("email", searchName);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const query = params.toString() ? `?${params}` : "";
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

        <h1 className="text-4xl font-bold text-center mb-8 text-purple-800">
          📊 Laporan Presensi (Admin)
        </h1>

        {/* FILTER */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cari Nama
                </label>
                <input
                  type="text"
                  placeholder="Nama mahasiswa..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400"
                />
              </div>

            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-md hover:bg-purple-700"
              >
                🔍 Filter Data
              </button>

              <button
                type="button"
                onClick={handleResetFilter}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-200"
              >
                🔄 Reset
              </button>
            </div>
          </form>
        </div>

        {/* ERROR */}
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

                <thead className="bg-gradient-to-r from-purple-400 to-purple-500 text-white">
                  <tr>
                    <th className="px-6 py-4">Nama</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Check In</th>
                    <th className="px-6 py-4">Check Out</th>
                    <th className="px-6 py-4 text-center">Bukti Foto</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {reports.length > 0 ? (
                    reports.map((p, i) => (
                      <tr key={i} className="hover:bg-purple-50 transition">

                        <td className="px-6 py-4">{p.user?.email || "N/A"}</td>

                        <td className="px-6 py-4">
                          {new Date(p.checkIn).toLocaleDateString("id-ID")}
                        </td>

                        <td className="px-6 py-4 text-green-600 font-semibold">
                          {new Date(p.checkIn).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        <td className="px-6 py-4">
                          {p.checkOut ? (
                            <span className="text-red-600 font-semibold">
                              {new Date(p.checkOut).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Belum</span>
                          )}
                        </td>

                        {/* ✅ FOTO - Pakai buktiFoto dari database */}
                        <td className="px-6 py-4 text-center">
                          {!p.buktiFoto ? (
                            <span className="text-gray-400 italic">
                              Tidak ada foto
                            </span>
                          ) : (
                            <img
                              src={`http://localhost:3001/${p.buktiFoto}`}
                              alt="Bukti Foto"
                              className="h-16 w-16 object-cover rounded-lg shadow cursor-pointer hover:opacity-90 transition mx-auto"
                              onClick={() =>
                                setSelectedImage(
                                  `http://localhost:3001/${p.buktiFoto}`
                                )
                              }
                            />
                          )}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <span className="text-5xl">📭</span>
                        <p className="text-lg">Tidak ada data laporan ditemukan.</p>
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>
        )}

        {/* ⭐ MODAL PREVIEW FOTO */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative">
              <button
                className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded-full shadow-lg"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>

              <img
                src={selectedImage}
                className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                alt="Preview"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ReportPage;