"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Download, Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface DataPoint {
  timestamp: number;
  value: number;
  unit: string;
}

interface GpsMapProps {
  gpsLatData: DataPoint[];
  gpsLngData: DataPoint[];
  altitudeData?: DataPoint[];
}

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function GpsMap({ gpsLatData, gpsLngData, altitudeData }: GpsMapProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Combine GPS data points
  const flightPath = useMemo(() => {
    const combined: Array<{
      timestamp: number;
      lat: number;
      lng: number;
      altitude?: number;
    }> = [];

    const latByTime = new Map(gpsLatData.map(d => [d.timestamp, d.value]));
    const lngByTime = new Map(gpsLngData.map(d => [d.timestamp, d.value]));
    const altByTime = altitudeData ? new Map(altitudeData.map(d => [d.timestamp, d.value])) : new Map();

    // Get all unique timestamps
    const allTimestamps = new Set([
      ...gpsLatData.map(d => d.timestamp),
      ...gpsLngData.map(d => d.timestamp)
    ]);

    Array.from(allTimestamps).sort((a, b) => a - b).forEach(timestamp => {
      const lat = latByTime.get(timestamp);
      const lng = lngByTime.get(timestamp);
      
      if (lat !== undefined && lng !== undefined) {
        combined.push({
          timestamp,
          lat,
          lng,
          altitude: altByTime.get(timestamp),
        });
      }
    });

    return combined;
  }, [gpsLatData, gpsLngData, altitudeData]);

  // Calculate map bounds
  const bounds = useMemo(() => {
    if (flightPath.length === 0) return null;
    
    const lats = flightPath.map(p => p.lat);
    const lngs = flightPath.map(p => p.lng);
    
    return [
      [Math.min(...lats), Math.min(...lngs)] as [number, number],
      [Math.max(...lats), Math.max(...lngs)] as [number, number],
    ];
  }, [flightPath]);

  // Get path coordinates for polyline
  const pathCoordinates = useMemo(() => {
    return flightPath.map(point => [point.lat, point.lng] as [number, number]);
  }, [flightPath]);

  // Current position for animation
  const currentPosition = flightPath[currentIndex];

  // Animation effect
  useEffect(() => {
    if (isPlaying && currentIndex < flightPath.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => Math.min(prev + 1, flightPath.length - 1));
      }, 1000 / playbackSpeed);

      return () => clearTimeout(timer);
    } else if (currentIndex >= flightPath.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIndex, flightPath.length, playbackSpeed]);

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const handleSkipToEnd = () => {
    setCurrentIndex(flightPath.length - 1);
    setIsPlaying(false);
  };

  const exportTrack = () => {
    // Create GPX-like format
    const gpxData = flightPath.map(point => ({
      timestamp: point.timestamp,
      latitude: point.lat,
      longitude: point.lng,
      altitude: point.altitude || 0,
    }));

    const csvContent = [
      "timestamp,latitude,longitude,altitude",
      ...gpxData.map(row => `${row.timestamp},${row.latitude},${row.longitude},${row.altitude}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "flight_track.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isClient) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Flight Path</h3>
        <div className="flex items-center justify-center h-96 bg-slate-100 rounded-lg">
          <p className="text-slate-500">Loading map...</p>
        </div>
      </div>
    );
  }

  if (flightPath.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Flight Path</h3>
        <div className="flex items-center justify-center h-96 text-slate-500">
          <p>No GPS data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Flight Path</h3>
        <button
          onClick={exportTrack}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Export track"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Controls */}
      <div className="mb-4 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              title="Reset to start"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleSkipToEnd}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              title="Skip to end"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-sm text-slate-600">Speed:</label>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="px-2 py-1 border border-slate-300 rounded text-sm"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-200"
            style={{ width: `${(currentIndex / Math.max(flightPath.length - 1, 1)) * 100}%` }}
          />
        </div>

        {/* Current Status */}
        {currentPosition && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Time:</span>
              <span className="ml-2 font-medium">{formatTimestamp(currentPosition.timestamp)}</span>
            </div>
            <div>
              <span className="text-slate-500">Lat:</span>
              <span className="ml-2 font-medium">{currentPosition.lat.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-slate-500">Lng:</span>
              <span className="ml-2 font-medium">{currentPosition.lng.toFixed(6)}</span>
            </div>
            {currentPosition.altitude !== undefined && (
              <div>
                <span className="text-slate-500">Alt:</span>
                <span className="ml-2 font-medium">{currentPosition.altitude.toFixed(1)}m</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden">
        {bounds && (
          <MapContainer
            bounds={bounds}
            style={{ height: "100%", width: "100%" }}
            className="rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Flight path */}
            <Polyline
              positions={pathCoordinates}
              color="#3B82F6"
              weight={3}
              opacity={0.8}
            />
            
            {/* Start point */}
            {flightPath[0] && (
              <CircleMarker
                center={[flightPath[0].lat, flightPath[0].lng]}
                radius={8}
                fillColor="#10B981"
                color="#065F46"
                weight={2}
                fillOpacity={0.8}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Start Point</strong><br />
                    Time: {formatTimestamp(flightPath[0].timestamp)}<br />
                    Lat: {flightPath[0].lat.toFixed(6)}<br />
                    Lng: {flightPath[0].lng.toFixed(6)}
                    {flightPath[0].altitude !== undefined && (
                      <>
                        <br />Alt: {flightPath[0].altitude.toFixed(1)}m
                      </>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            )}
            
            {/* End point */}
            {flightPath.length > 1 && flightPath[flightPath.length - 1] && (
              <CircleMarker
                center={[flightPath[flightPath.length - 1]!.lat, flightPath[flightPath.length - 1]!.lng]}
                radius={8}
                fillColor="#EF4444"
                color="#991B1B"
                weight={2}
                fillOpacity={0.8}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>End Point</strong><br />
                    Time: {formatTimestamp(flightPath[flightPath.length - 1]!.timestamp)}<br />
                    Lat: {flightPath[flightPath.length - 1]!.lat.toFixed(6)}<br />
                    Lng: {flightPath[flightPath.length - 1]!.lng.toFixed(6)}
                    {flightPath[flightPath.length - 1]!.altitude !== undefined && (
                      <>
                        <br />Alt: {flightPath[flightPath.length - 1]!.altitude!.toFixed(1)}m
                      </>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            )}
            
            {/* Current position during playback */}
            {currentPosition && isPlaying && (
              <CircleMarker
                center={[currentPosition.lat, currentPosition.lng]}
                radius={6}
                fillColor="#F59E0B"
                color="#92400E"
                weight={2}
                fillOpacity={1}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Current Position</strong><br />
                    Time: {formatTimestamp(currentPosition.timestamp)}<br />
                    Lat: {currentPosition.lat.toFixed(6)}<br />
                    Lng: {currentPosition.lng.toFixed(6)}
                    {currentPosition.altitude !== undefined && (
                      <>
                        <br />Alt: {currentPosition.altitude.toFixed(1)}m
                      </>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            )}
          </MapContainer>
        )}
      </div>

      {/* Flight Stats */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Total Points:</span>
            <span className="ml-2 font-medium text-slate-900">{flightPath.length}</span>
          </div>
          <div>
            <span className="text-slate-500">Duration:</span>
            <span className="ml-2 font-medium text-slate-900">
              {formatTimestamp(flightPath[flightPath.length - 1]?.timestamp || 0)}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Start:</span>
            <span className="ml-2 font-medium text-slate-900">
              {flightPath[0] ? `${flightPath[0].lat.toFixed(4)}, ${flightPath[0].lng.toFixed(4)}` : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">End:</span>
            <span className="ml-2 font-medium text-slate-900">
              {flightPath[flightPath.length - 1] 
                ? `${flightPath[flightPath.length - 1]!.lat.toFixed(4)}, ${flightPath[flightPath.length - 1]!.lng.toFixed(4)}` 
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}