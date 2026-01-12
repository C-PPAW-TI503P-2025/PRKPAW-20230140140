import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Registrasi ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function DashboardPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Pengguna");
  const [role, setRole] = useState("");

  // State untuk IoT (Modul 14)
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [latestData, setLatestData] = useState({ suhu: 0, kelembaban: 0, cahaya: 0 });

  // 1. Fungsi Ambil Data dari Backend
  const fetchIoTData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/iot/history");
      const dataSensor = response.data.data;

      if (dataSensor.length > 0) {
        // Ambil data terbaru untuk Card
        setLatestData(dataSensor[dataSensor.length - 1]);

        // Siapkan data untuk Grafik
        const labels = dataSensor.map((item) => new Date(item.createdAt).toLocaleTimeString("id-ID"));
        const dataSuhu = dataSensor.map((item) => item.suhu);
        const dataLembab = dataSensor.map((item) => item.kelembaban);
        const dataCahaya = dataSensor.map((item) => item.cahaya);

        setChartData({
          labels,
          datasets: [
            { label: "Suhu (°C)", data: dataSuhu, borderColor: "#ef4444", backgroundColor: "#ef4444", tension: 0.3 },
            { label: "Lembab (%)", data: dataLembab, borderColor: "#3b82f6", backgroundColor: "#3b82f6", tension: 0.3 },
            { label: "Cahaya (LDR)", data: dataCahaya, borderColor: "#eab308", backgroundColor: "#eab308", tension: 0.3 },
          ],
        });
      }
    } catch (err) {
      console.error("Gagal mengambil data IoT:", err);
    }
  };

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const decoded = jwtDecode(token);
      setUserName(decoded.email || "Pengguna");
      setRole(decoded.role);
    } catch (e) {
      navigate("/login");
    }

    // IoT Data Polling (Refresh tiap 5 detik)
    fetchIoTData();
    const interval = setInterval(fetchIoTData, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Welcome Card (Kiri) */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-purple-100 flex-1 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-2xl font-extrabold text-gray-800">Selamat Datang,</h1>
              <p className="text-purple-600 font-bold text-lg mb-4">{userName}</p>
              <div className="inline-block bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                {role === "admin" ? "👑 Admin" : "🎓 Mahasiswa"}
              </div>
              <button onClick={handleLogout} className="mt-6 block text-red-500 font-bold hover:underline text-sm">
                Log Out dari sistem
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">👋</div>
          </div>

          {/* Real-time Indicator Cards (Kanan - TUGAS 2 MODUL 14) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-[2]">
            <div className="bg-red-500 p-6 rounded-3xl shadow-lg text-white">
              <p className="text-sm opacity-80 uppercase font-bold">Suhu</p>
              <h2 className="text-4xl font-black">{latestData.suhu}°C</h2>
            </div>
            <div className="bg-blue-500 p-6 rounded-3xl shadow-lg text-white">
              <p className="text-sm opacity-80 uppercase font-bold">Lembab</p>
              <h2 className="text-4xl font-black">{latestData.kelembaban}%</h2>
            </div>
            <div className="bg-yellow-500 p-6 rounded-3xl shadow-lg text-white">
              <p className="text-sm opacity-80 uppercase font-bold">Cahaya</p>
              <h2 className="text-4xl font-black">{latestData.cahaya}</h2>
            </div>
          </div>
        </div>

        {/* Chart Section (TUGAS 1 MODUL 14) */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
              Monitoring Sensor Real-time
            </h3>
            <span className="text-xs text-gray-400 font-medium">Auto-refresh: 5s</span>
          </div>
          
          <div className="h-[400px] w-full">
            {chartData.labels.length > 0 ? (
              <Line 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } } 
                }} 
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">
                Menunggu data dari sensor...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;