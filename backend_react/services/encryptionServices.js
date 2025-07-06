const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const secret = process.env.ENCRYPTION_SECRET;

if (!secret || secret.length !== 32) {
  throw new Error('ENCRYPTION_SECRET must be 32 characters long');
}

const iv = crypto.randomBytes(16);

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(text) {
  const [ivHex, encryptedHex] = text.split(':');
  const decipher = crypto.createDecipheriv(
    algorithm, 
    Buffer.from(secret), 
    Buffer.from(ivHex, 'hex')
  );
  let decrypted = decipher.update(Buffer.from(encryptedHex, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };
