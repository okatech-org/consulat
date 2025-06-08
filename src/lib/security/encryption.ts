import crypto from 'crypto';

const algorithm = 'aes-256-gcm';

/**
 * Récupère ou génère la clé de chiffrement
 * @returns Buffer de la clé de chiffrement
 */
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }

  // Si la clé est en hex, la convertir en Buffer
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }

  // Sinon, créer un hash SHA-256 de la clé
  return crypto.createHash('sha256').update(key).digest();
};

/**
 * Chiffre un texte avec AES-256-GCM
 * @param text - Texte à chiffrer
 * @returns Texte chiffré au format "iv:authTag:encrypted"
 */
export const encrypt = (text: string): string => {
  try {
    if (!text) {
      throw new Error('Text to encrypt cannot be empty');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Déchiffre un texte chiffré avec AES-256-GCM
 * @param encryptedData - Données chiffrées au format "iv:authTag:encrypted"
 * @returns Texte déchiffré
 */
export const decrypt = (encryptedData: string): string => {
  try {
    if (!encryptedData) {
      throw new Error('Encrypted data cannot be empty');
    }

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid encrypted data parts');
    }

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash sécurisé d'un mot de passe avec salt
 * @param password - Mot de passe à hasher
 * @param saltRounds - Nombre de rounds (défaut: 12)
 * @returns Hash du mot de passe
 */
export const hashPassword = async (
  password: string,
  saltRounds: number = 12,
): Promise<string> => {
  try {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Vérifie un mot de passe contre son hash
 * @param password - Mot de passe en clair
 * @param hash - Hash stocké
 * @returns true si le mot de passe correspond
 */
export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  try {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

/**
 * Génère un token sécurisé pour réinitialisation, etc.
 * @param length - Longueur du token (défaut: 32 bytes)
 * @returns Token sécurisé en hex
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash SHA-256 d'une donnée
 * @param data - Données à hasher
 * @returns Hash SHA-256 en hex
 */
export const sha256Hash = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Comparaison sécurisée contre les attaques de timing
 * @param a - Premier string à comparer
 * @param b - Deuxième string à comparer
 * @returns true si les strings sont identiques
 */
export const timingSafeEqual = (a: string, b: string): boolean => {
  try {
    // S'assurer que les strings ont la même longueur pour éviter les timing attacks
    if (a.length !== b.length) {
      return false;
    }

    const bufferA = Buffer.from(a, 'utf8');
    const bufferB = Buffer.from(b, 'utf8');

    return crypto.timingSafeEqual(bufferA, bufferB);
  } catch (error) {
    console.error('Timing safe comparison error:', error);
    return false;
  }
};

/**
 * Masque les données sensibles pour les logs
 * @param data - Données à masquer
 * @param visibleChars - Nombre de caractères visibles au début et à la fin
 * @returns Données masquées
 */
export const maskSensitiveData = (data: string, visibleChars: number = 2): string => {
  if (!data || data.length <= visibleChars * 2) {
    return '*'.repeat(data?.length || 8);
  }

  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const middle = '*'.repeat(data.length - visibleChars * 2);

  return `${start}${middle}${end}`;
};
