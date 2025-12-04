import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Webcam from "react-webcam";
import L from "leaflet";

// Marker Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Fix map size bug
function FixMapSize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 300);
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

  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);

  const API_URL = "http://localhost:3001/api/presensi";
  const getToken = () => localStorage.getItem("token");

  // Ambil posisi GPS
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
    }
  };

  // Ambil status presensi aktif
  const fetchAttendanceStatus = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const active = res.data.data.find(
        (r) => r.checkIn && !r.checkOut
      );

      setAttendanceStatus(active || null);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getLocation();
    fetchAttendanceStatus();
  }, []);

  // 📸 Capture foto dari Webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);

  // =========================== CHECK-IN ===========================
  const handleCheckIn = async () => {
    setMessage("");
    setError("");

    if (!coords) return setError("Lokasi belum tersedia!");
    if (!image) return setError("Foto selfie wajib diambil!");

    setLoading(true);

    try {
      // Convert base64 image → Blob
      const blob = await (await fetch(image)).blob();

      const formData = new FormData();
      formData.append("latitude", coords.lat);
      formData.append("longitude", coords.lng);
      formData.append("image", blob, "selfie.jpg");

      const res = await axios.post(
        `${API_URL}/check-in`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setMessage(res.data.message);
      fetchAttendanceStatus();
    } catch (err) {
      setError(err.response?.data?.message || "Check-in gagal");
    }

    setLoading(false);
  };

  // =========================== CHECK-OUT ===========================
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

      setMessage(res.data.message);
      fetchAttendanceStatus();
      setImage(null);
    } catch (err) {
      setError(err.response?.data?.message || "Check-out gagal");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center py-10 px-4">

      {/* MAP */}
      {loadingLocation ? (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl text-center">
          Mendapatkan lokasi...
        </div>
      ) : coords && (
        <div className="w-full max-w-3xl mb-6">
          <div className="bg-purple-600 text-white p-4 rounded-t-xl">
            <strong>Lokasi Anda</strong><br />
            Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
          </div>

          <div className="h-[300px] border rounded-b-xl overflow-hidden shadow-md">
            <MapContainer
              center={[coords.lat, coords.lng]}
              zoom={16}
              className="h-full w-full"
            >
              <FixMapSize />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[coords.lat, coords.lng]}>
                <Popup>Lokasi Anda</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* CARD */}
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-3xl border border-purple-100">

        <h2 className="text-3xl font-bold text-center mb-6 text-purple-700">
          Presensi Dengan Foto
        </h2>

        {message && (
          <div className="bg-green-50 p-4 border border-green-200 rounded-xl mb-4">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 p-4 border border-red-200 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* 📸 KAMERA */}
        <div className="my-4 border rounded-lg overflow-hidden bg-black">
          {image ? (
            <img src={image} alt="Selfie" className="w-full" />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full"
            />
          )}
        </div>

        {/* TOMBOL KAMERA */}
        <div className="mb-4">
          {!image ? (
            <button
              onClick={capture}
              className="bg-blue-600 text-white py-2 rounded w-full"
            >
              Ambil Foto 📸
            </button>
          ) : (
            <button
              onClick={() => setImage(null)}
              className="bg-gray-500 text-white py-2 rounded w-full"
            >
              Foto Ulang 🔄
            </button>
          )}
        </div>

        {/* TOMBOL CHECK-IN / CHECK-OUT */}
        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
            disabled={loading || !coords || attendanceStatus !== null}
            className={`flex-1 py-3 text-white rounded-xl font-bold ${
              loading || attendanceStatus !== null
                ? "bg-gray-300"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            Check-In
          </button>

          <button
            onClick={handleCheckOut}
            disabled={loading || attendanceStatus === null}
            className={`flex-1 py-3 text-white rounded-xl font-bold ${
              loading || attendanceStatus === null
                ? "bg-gray-300"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            Check-Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default PresensiPage;
