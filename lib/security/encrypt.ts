import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    // 키가 없으면 폴백: DATABASE_URL 해시를 사용 (프로덕션에서는 ENCRYPTION_KEY 설정 권장)
    const { createHash } = require('crypto');
    const dbUrl = process.env.DATABASE_URL || 'default-fallback-key';
    return createHash('sha256').update(dbUrl).digest();
  }
  // hex 또는 base64 형식 지원
  if (key.length === 64) return Buffer.from(key, 'hex');
  if (key.length === 44) return Buffer.from(key, 'base64');
  // 32바이트 미만이면 SHA-256 해시
  const { createHash } = require('crypto');
  return createHash('sha256').update(key).digest();
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  // iv:tag:encrypted 형식으로 저장
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const parts = ciphertext.split(':');
  if (parts.length !== 3) throw new Error('잘못된 암호화 형식');

  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return '****';
  return key.slice(0, 7) + '****' + key.slice(-4);
}
