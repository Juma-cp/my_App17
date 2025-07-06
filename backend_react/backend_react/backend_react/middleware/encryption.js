const crypto = require('crypto');
const { HIPAA_ENCRYPTION_KEY } = process.env;

exports.encryptPHI = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', 
    Buffer.from(HIPAA_ENCRYPTION_KEY, 'hex'), iv);
  
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);
  
  const tag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
    tag: tag.toString('hex')
  };
};

exports.decryptPHI = (encrypted) => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', 
    Buffer.from(HIPAA_ENCRYPTION_KEY, 'hex'), 
    Buffer.from(encrypted.iv, 'hex'));
  
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));
  
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.content, 'hex')),
    decipher.final()
  ]);
  
  return decrypted.toString('utf8');
};
