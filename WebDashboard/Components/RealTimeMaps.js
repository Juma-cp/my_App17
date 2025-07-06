import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';

const RealTimeMap = () => {
  const [patients, setPatients] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') }
    });

    // Initial patient data
    socketRef.current.on('initial-data', setPatients);

    // Real-time updates
    socketRef.current.on('location-update', (update) => {
      setPatients(prev => prev.map(p => 
        p.id === update.patientId ? { ...p, location: update.location } : p
      ));
    });

    // Alerts
    socketRef.current.on('new-alert', (alert) => {
      // Show notification
    });

    return () => socketRef.current.disconnect();
  }, []);

  return (
    <MapContainer 
      center={[39.8283, -98.5795]} 
      zoom={4} 
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {patients.map(patient => (
        <Marker
          key={patient.id}
          position={[
            patient.location?.coordinates[1] || 0, 
            patient.location?.coordinates[0] || 0
          ]}
          icon={L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin ${patient.riskLevel}"></div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42]
          })}
        >
          <Popup>
            <div>
              <h3>{patient.name}</h3>
              <p>Risk: {patient.riskLevel}</p>
              <p>Last update: {new Date(patient.lastUpdate).toLocaleTimeString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default RealTimeMap;
