import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export function generateHash() {
  const uuid = uuidv4();
  return crypto.createHash('sha256').update(uuid).digest('hex');
}