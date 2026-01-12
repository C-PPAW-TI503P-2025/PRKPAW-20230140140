import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function SensorPage() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [latestData, setLatestData] = useState({ suhu: 0, kelembaban: 0, cahaya: 0 });

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/iot/history');
      const dataSensor = response.data.data;

      const labels = dataSensor.map(item => new Date(item.createdAt).toLocaleTimeString());
      const dataSuhu = dataSensor.map(item => item.suhu);
      const dataLembab = dataSensor.map(item => item.kelembaban);
      const dataCahaya = dataSensor.map(item => item.cahaya);

      // Set data terakhir untuk kartu indikator (TUGAS 2)
      if(dataSensor.length > 0) setLatestData(dataSensor[dataSensor.length - 1]);

      setChartData({
        labels,
        datasets: [
          { label: 'Suhu (°C)', data: dataSuhu, borderColor: 'rgb(255, 99, 132)', tension: 0.2 },
          { label: 'Kelembaban (%)', data: dataLembab, borderColor: 'rgb(53, 162, 235)', tension: 0.2 },
          { label: 'Cahaya (LDR)', data: dataCahaya, borderColor: 'rgb(255, 205, 86)', tension: 0.2 }, // TUGAS 1
        ],
      });
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Auto refresh tiap 5 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard IoT</h1>
      
      {/* TUGAS 2: Kartu Indikator */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#ff6384', color: 'white', padding: '15px', borderRadius: '8px', flex: 1 }}>
          Suhu: {latestData.suhu}°C
        </div>
        <div style={{ background: '#35a2eb', color: 'white', padding: '15px', borderRadius: '8px', flex: 1 }}>
          Lembab: {latestData.kelembaban}%
        </div>
        <div style={{ background: '#ffcd56', color: 'black', padding: '15px', borderRadius: '8px', flex: 1 }}>
          Cahaya: {latestData.cahaya}
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <Line data={chartData} />
      </div>
    </div>
  );
}

export default SensorPage;