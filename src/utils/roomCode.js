/**
 * Generate a random 4-character room code using unambiguous numbers and letters
 * Excludes confusing characters: 0/O, 1/I/L, 5/S, 8/B, G/6, Z/2
 * @returns {string} 4-character room code
 */
export const generateRoomCode = () => {
  // Use only unambiguous characters to avoid confusion when sharing codes
  const chars = '23467ACDEFHJKMNPQRTUVWXY';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate room code format for joining (accepts any alphanumeric characters)
 * @param {string} code - Room code to validate
 * @returns {boolean} Whether the code is valid
 */
export const validateJoinRoomCode = (code) => {
  // Accept any 4-character alphanumeric code when joining
  const regex = /^[A-Z0-9]{4}$/;
  return regex.test(code.toUpperCase());
};

/**
 * Format room code for joining (accepts any alphanumeric characters)
 * @param {string} code - Room code to format
 * @returns {string} Formatted room code with only alphanumeric characters
 */
export const formatJoinRoomCode = (code) => {
  // Keep any alphanumeric characters when joining
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}; 