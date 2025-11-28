import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// ❗ COMPONENT FIX AGAR MAP TIDAK PATAH
function FixMapSize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);

  return null;
}

function PresensiPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const API_URL = "http://localhost:3001/api/presensi";
  const getToken = () => localStorage.getItem("token");

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLoadingLocation(false);
        },
        (err) => {
          setError("Gagal mendapatkan lokasi: " + err.message);
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Browser tidak mendukung geolocation.");
      setLoadingLocation(false);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const activeAttendance = res.data.data.find(
        (record) => record.checkIn && !record.checkOut
      );

      setAttendanceStatus(activeAttendance || null);
    } catch (err) {
      console.error("Gagal ambil status presensi:", err);
    }
  };

  useEffect(() => {
    getLocation();
    fetchAttendanceStatus();
  }, []);

  const handleCheckIn = async () => {
    setError("");
    setMessage("");

    if (!coords) {
      setError("Lokasi belum tersedia. Izinkan akses GPS.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/checkin`,
        {
          latitude: coords.lat,
          longitude: coords.lng,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      // Format waktu check-in
      const checkInTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta'
      });
      
      setMessage(`Check-in berhasil pada ${checkInTime} WIB`);
      fetchAttendanceStatus();
    } catch (err) {
      setError(err.response?.data?.message || "Check-in gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/checkout`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      // Format waktu check-out
      const checkOutTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta'
      });
      
      setMessage(`Check-out berhasil pada ${checkOutTime} WIB`);
      fetchAttendanceStatus();
    } catch (err) {
      setError(err.response?.data?.message || "Check-out gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center py-10 px-4">
      
      {/* MAP */}
      {loadingLocation ? (
        <div className="w-full max-w-3xl mb-6 bg-white p-8 rounded-3xl shadow-xl text-center">
          <p className="text-gray-600 font-medium">📡 Mendapatkan lokasi Anda...</p>
        </div>
      ) : coords ? (
        <div className="w-full max-w-3xl mb-6">
          {/* Info Koordinat di atas Map */}
          <div className="bg-purple-600 text-white p-4 rounded-t-3xl shadow-lg">
            <h3 className="font-bold text-lg mb-1">📍 Lokasi Presensi Anda</h3>
            <p className="text-sm opacity-90">
              Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
            </p>
          </div>
          
          {/* Map Container */}
          <div className="border-4 border-white rounded-b-3xl shadow-xl overflow-hidden ring-1 ring-purple-200">
            <div className="w-full h-[300px]">
              <MapContainer
                center={[coords.lat, coords.lng]}
                zoom={16}
                className="h-full w-full"
                scrollWheelZoom={false}
              >
                <FixMapSize />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap"
                />
                <Marker position={[coords.lat, coords.lng]}>
                  <Popup>
                    <strong>Lokasi Anda</strong><br/>
                    Lat: {coords.lat.toFixed(6)}<br/>
                    Lng: {coords.lng.toFixed(6)}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      ) : null}

      {/* CARD */}
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-3xl border border-purple-100">
        
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-700 text-center">
          Lakukan Presensi
        </h2>

        
        {message && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">✓</div>
            <p className="text-green-800 font-medium">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">!</div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button
            onClick={handleCheckIn}
            disabled={loading || !coords || attendanceStatus !== null}
            className={`flex-1 py-4 px-6 text-white text-lg font-bold rounded-xl shadow-lg transition-all duration-200
              ${loading || !coords || attendanceStatus 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-400 to-purple-600 hover:scale-[1.02]'}`}
          >
            {loading ? "Memproses..." : "✅ Check-In"}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={loading || attendanceStatus === null}
            className={`flex-1 py-4 px-6 text-white text-lg font-bold rounded-xl shadow-lg transition-all duration-200
              ${loading || !attendanceStatus
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-400 to-rose-500 hover:scale-[1.02]'}`}
          >
            {loading ? "Memproses..." : "🚪 Check-Out"}
          </button>
        </div>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-gray-400 text-sm">
            {!attendanceStatus 
              ? "Tekan tombol Check-In saat Anda tiba di lokasi" 
              : "Tekan tombol Check-Out jika pekerjaan selesai"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PresensiPage;