import { useState } from "react";
import { MapPin, CheckCircle, XCircle } from "lucide-react";
import mapImg from "../assets/map.png";

export default function NearbyToilet() {
  const [toilets] = useState([
    { id: 1, name: "Toilet near Gate 1", distance: "200m", status: "clean" },
    { id: 2, name: "Toilet near Main Temple", distance: "500m", status: "dirty" },
    { id: 3, name: "Toilet near Bus Stand", distance: "350m", status: "clean" },
  ]);

  return (
    <div className="relative min-h-screen flex flex-col items-center p-6">
      {/* Background Image */}
      <img
        src={mapImg}
        alt="Map background"
        className="absolute inset-0 w-full h-full object-cover opacity-70 -z-10"
      />

      {/* Heading */}
      <h1 className="text-3xl font-bold text-black-800 mb-6 z-10">Nearby Toilets</h1>

      {/* Toilet Cards */}
      <div className="w-full max-w-2xl flex flex-col items-center space-y-4 z-10">
        {toilets.map((toilet) => (
          <div
            key={toilet.id}
            className="bg-white/70 rounded-2xl shadow-md p-4 flex items-center justify-between w-full"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-700">{toilet.name}</h2>
              <p className="text-gray-500">Distance: {toilet.distance}</p>
              <p className="flex items-center text-sm">
                {toilet.status === "clean" ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle size={16} /> Clean
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <XCircle size={16} /> Needs Cleaning
                  </span>
                )}
              </p>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                toilet.name
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <MapPin size={16} /> Navigate
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
