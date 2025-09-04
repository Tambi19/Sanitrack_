import { useState } from "react";
import { useSearchParams } from "react-router-dom"; // ✅ get query params
import mandirImg from "../assets/mandir.jpg";
import api from "../api"; // ✅ centralized axios instance

export default function Pilgrim() {
  const [toiletId, setToiletId] = useState("");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams(); 
  const clusterId = searchParams.get("clusterId") || "1"; // fallback cluster

  const reportIssue = async (issue) => {
    if (!toiletId) {
      setMessage("⚠️ Please enter a toilet number first.");
      return;
    }

    try {
      const res = await api.post("/feedback", {
        clusterId: String(clusterId),
        toiletNo: toiletId,
        feedback: issue,
      });

      if (res.data.success) {
        setMessage(`✅ Reported "${issue}" for Toilet ${toiletId} in Cluster ${clusterId}`);
        setToiletId("");
      } else {
        setMessage("❌ Failed to log complaint.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to connect to server.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative p-6"
      style={{
        backgroundImage: `url(${mandirImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/60"></div>

      <div className="relative z-10 bg-white/50 shadow-2xl rounded-2xl p-8 w-full max-w-md backdrop-blur-md">
        <h1 className="text-3xl font-bold text-black mb-8 text-center">
          “आपका एक कदम, लाखों के लिए स्वच्छता”
        </h1>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          🚻 🙏
        </h2>

        {/* toilet input */}
        <input
          type="text"
          placeholder="Enter Toilet Number"
          value={toiletId}
          onChange={(e) => setToiletId(e.target.value)}
          className="border-2 border-black-200 rounded-lg px-4 py-3 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />

        {/* buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => reportIssue("Need Water")}
            className="bg-blue-500 bg-opacity-80 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition transform hover:scale-[1.02]"
          >
            🚰 Need Water
          </button>
          <button
            onClick={() => reportIssue("Need Cleaning")}
            className="bg-green-500 bg-opacity-80 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-green-600 hover:shadow-lg transition transform hover:scale-[1.02]"
          >
            🧹 Need Cleaning
          </button>
          <button
            onClick={() => reportIssue("Dirty")}
            className="bg-red-500 bg-opacity-80 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-red-600 hover:shadow-lg transition transform hover:scale-[1.02] sm:col-span-2"
          >
            🚫 Dirty
          </button>
        </div>

        {/* feedback message */}
        {message && (
          <p className="mt-6 text-center font-medium text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
