import React, { useEffect, useState } from "react";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function MonitoringPage() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [latestData, setLatestData] = useState({ suhu: 0, kelembaban: 0, cahaya: 0 });

  const fetchIoTData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/iot/history");
      const dataSensor = response.data.data;
      if (dataSensor.length > 0) {
        setLatestData(dataSensor[dataSensor.length - 1]);
        const labels = dataSensor.map((item) => new Date(item.createdAt).toLocaleTimeString("id-ID"));
        setChartData({
          labels,
          datasets: [
            { label: "Suhu (°C)", data: dataSensor.map(i => i.suhu), borderColor: "#ef4444", tension: 0.3 },
            { label: "Lembab (%)", data: dataSensor.map(i => i.kelembaban), borderColor: "#3b82f6", tension: 0.3 },
            { label: "Cahaya", data: dataSensor.map(i => i.cahaya), borderColor: "#eab308", tension: 0.3 },
          ],
        });
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchIoTData();
    const interval = setInterval(fetchIoTData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Real-time Sensor Monitoring</h2>
        
        {/* Card Indikator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-red-500">
            <p className="text-gray-500 text-sm uppercase">Suhu</p>
            <h3 className="text-3xl font-bold text-red-600">{latestData.suhu}°C</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm uppercase">Kelembaban</p>
            <h3 className="text-3xl font-bold text-blue-600">{latestData.kelembaban}%</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm uppercase">Cahaya (LDR)</p>
            <h3 className="text-3xl font-bold text-yellow-600">{latestData.cahaya}</h3>
          </div>
        </div>

        {/* Grafik */}
        <div className="bg-white p-6 rounded-2xl shadow-lg h-[450px]">
          {chartData.labels.length > 0 ? (
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          ) : (
            <p className="flex items-center justify-center h-full text-gray-400">Memuat data sensor...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MonitoringPage;