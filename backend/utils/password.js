import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export function isBcryptHash(value) {
  return typeof value === 'string' && value.startsWith('$2')
}

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password, storedHash) {
  if (isBcryptHash(storedHash)) {
    return bcrypt.compare(password, storedHash)
  }
  return password === storedHash
}

export async function ensurePasswordHashed(password) {
  if (isBcryptHash(password)) return password
  return hashPassword(password)
}
