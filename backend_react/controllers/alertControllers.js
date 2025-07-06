const Alert = require('../models/Alert');
const Patient = require('../models/Patient');
const { publishAlert } = require('../services/notificationService');

exports.createAlert = async (req, res) => {
  try {
    const { patientId, type, message, severity } = req.body;
    
    const alert = new Alert({
      patient: patientId,
      type,
      message,
      severity
    });

    await alert.save();
    
    // Real-time notification
    publishAlert(alert);
    
    // Trigger SMS/Email if critical
    if (severity === 'CRITICAL') {
      const patient = await Patient.findById(patientId);
      sendEmergencyNotification(patient.contact);
    }

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Real-time alert publishing (using WebSockets/Socket.io)
function publishAlert(alert) {
  // Implementation would connect to your real-time service
  console.log(`ALERT PUBLISHED: ${alert.message}`);
      }
