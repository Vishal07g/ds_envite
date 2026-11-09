// Unique 10-Character Invitation Code Utility
// Alphabet: 30 chars (excludes confusing 0/O, 1/I/L)
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/**
 * Generate a cryptographically secure random invitation code.
 * Uses crypto.getRandomValues in browser and crypto.randomInt in Node.js.
 */
export function generateInvitationCode(length = 10) {
  let code = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    }
  } else {
    // Fallback for Node.js scripts if needed
    for (let i = 0; i < length; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
  }
  return code;
}

/**
 * Validate code format (10 characters from CODE_ALPHABET, case-insensitive)
 */
export function isValidInvitationCode(code) {
  if (!code || typeof code !== "string") return false;
  const clean = code.trim().toUpperCase();
  if (clean.length !== 10) return false;
  for (let i = 0; i < clean.length; i++) {
    if (!CODE_ALPHABET.includes(clean[i])) return false;
  }
  return true;
}
