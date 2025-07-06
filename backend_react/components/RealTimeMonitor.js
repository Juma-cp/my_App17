// components/RealTimeMonitor.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';
import { decryptPHI } from '../../lib/hipaa';

let socket;

export default function RealTimeMonitor() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Initialize Socket.IO
    socketInitializer();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const socketInitializer = async () => {
    await fetch('/api/socket');
    
    socket = io({
      transports: ['websocket'],
      upgrade: false,
      auth: {
        token: session.accessToken,
        role: session.user.role
      }
    });

    socket.on('connect', () => {
      console.log('Connected to real-time server');
    });

    socket.on('patient:update', (encryptedData) => {
      const patientData = JSON.parse(decryptPHI(encryptedData));
      setPatients(prev => updatePatientState(prev, patientData));
    });

    socket.on('alert:new', (encryptedAlert) => {
      const alert = JSON.parse(decryptPHI(encryptedAlert));
      setAlerts(prev => [alert, ...prev.slice(0, 9)]);
    });
  };

  const updatePatientState = (currentPatients, update) => {
    return currentPatients.map(p => 
      p.id === update.id ? { ...p, ...update } : p
    );
  };

  const handleIntervention = (patientId) => {
    socket.emit('intervention:request', {
      patientId,
      clinicianId: session.user.id,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Patient Status Panel */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Patient Status</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map(patient => (
                <tr key={patient.id} className={patient.riskLevel === 'high' ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">ID: {patient.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${patient.riskLevel === 'high' ? 'bg-red-100 text-red-800' : 
                        patient.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {patient.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(patient.lastUpdate).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleIntervention(patient.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Start Intervention
                    </button>
                    <button 
                      onClick={() => openPatientChart(patient.id)}
                      className="text-gray-600 hover:text-gray-900">
                      View Chart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Alerts</h2>
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="border-l-4 border-red-500 bg-red-50 p-4">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium text-red-800">{alert.type.replace(/_/g, ' ')}</h3>
                <span className="text-xs text-red-700">{new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="mt-1 text-sm text-red-700">{alert.message}</p>
              <div className="mt-2 text-xs text-red-600">
                Patient: {alert.patientName} | Location: {alert.location || 'Unknown'}
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="text-center text-gray-500 py-4">No recent alerts</p>
          )}
        </div>
      </div>
    </div>
  );
  }
