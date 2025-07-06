module.exports = {
  // Encryption standards
  encryptionAlgorithm: 'aes-256-gcm',
  keyDerivation: {
    iterations: 100000,
    digest: 'sha512'
  },
  
  // Access Control
  rolePermissions: {
    patient: ['read:self', 'update:self', 'delete:self'],
    counselor: ['read:assigned', 'update:logs', 'create:notes'],
    doctor: ['read:assigned', 'update:patients', 'create:interventions'],
    admin: ['read:all', 'update:all', 'delete:all', 'audit:logs']
  },
  
  // Audit Requirements
  auditFields: [
    'patientId', 'actionType', 'userId', 
    'timestamp', 'ipAddress', 'modifiedFields'
  ],
  
  // Network Security
  cspDirectives: {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", "https://api.mapbox.com"],
    imgSrc: ["'self'", "data:", "https://*.tiles.mapbox.com"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"]
  },
  
  corsOptions: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400
  },
  
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false
  }
};
