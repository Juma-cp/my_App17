require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');
const hipaa = require('./config/hipaa');
const patientRoutes = require('./routes/patientRoutes');
const authRoutes = require('./routes/authRoutes');
const geoRoutes = require('./routes/geoRoutes');

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: hipaa.cspDirectives
  },
  hsts: { maxAge: 31536000, includeSubDomains: true }
}));
app.use(cors(hipaa.corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(rateLimit(hipaa.rateLimiting));

// Database Connection
db.connect();

// Routes
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/geo', geoRoutes);

// HIPAA Audit Trail Middleware
app.use(require('./middleware/audit'));

// SSL Configuration
const sslOptions = {
  key: fs.readFileSync('./ssl/atis.key'),
  cert: fs.readFileSync('./ssl/atis.crt'),
  ca: fs.readFileSync('./ssl/ca_bundle.crt'),
  minVersion: 'TLSv1.3',
  ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256'
};

// Start Server
const PORT = process.env.PORT || 443;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HIPAA-compliant server running on port ${PORT}`);
});
