import { database } from '../firebase/config';
import { ref, set, get, remove, onValue, off, serverTimestamp, push, update } from 'firebase/database';
import { generateRoomCode } from '../utils/roomCode';

/**
 * Create a new room with admin privileges
 * @param {string} adminName - Name of the admin user
 * @returns {Promise<string>} Room code
 */
export const createRoom = async (adminName) => {
  let roomCode;
  let roomExists = true;
  
  // Generate unique room code
  while (roomExists) {
    roomCode = generateRoomCode();
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    roomExists = snapshot.exists();
  }
  
  // Create room with admin
  const roomData = {
    adminName,
    createdAt: serverTimestamp(),
    users: {},
    queue: {}
  };
  
  await set(ref(database, `rooms/${roomCode}`), roomData);
  return roomCode;
};

/**
 * Check if a room exists
 * @param {string} roomCode - Room code to check
 * @returns {Promise<boolean>} Whether the room exists
 */
export const roomExists = async (roomCode) => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  return snapshot.exists();
};

/**
 * Check if a user exists in a room
 * @param {string} roomCode - Room code to check
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} Whether the user exists in the room
 */
export const userExistsInRoom = async (roomCode, userId) => {
  const userRef = ref(database, `rooms/${roomCode}/users/${userId}`);
  const snapshot = await get(userRef);
  return snapshot.exists();
};

/**
 * Restore a user to the database during session restoration
 * @param {string} roomCode - Room code
 * @param {string} userId - User ID
 * @param {string} userName - User name
 * @returns {Promise<void>}
 */
export const restoreUserToRoom = async (roomCode, userId, userName) => {
  // Remove user from queue if they're in it (they'll need to raise hand again)
  const queueRef = ref(database, `rooms/${roomCode}/queue`);
  const queueSnapshot = await get(queueRef);
  
  if (queueSnapshot.exists()) {
    const queue = queueSnapshot.val();
    // Find and remove this user from the queue
    for (const [queueId, queueItem] of Object.entries(queue)) {
      if (queueItem.userId === userId) {
        await remove(ref(database, `rooms/${roomCode}/queue/${queueId}`));
        break;
      }
    }
  }
  
  // Always set hand to down on rejoin - user needs to raise again
  const userRef = ref(database, `rooms/${roomCode}/users/${userId}`);
  await set(userRef, {
    name: userName,
    joinedAt: serverTimestamp(),
    handRaised: false
  });
};

/**
 * Join a room as a user
 * @param {string} roomCode - Room code to join
 * @param {string} userName - Name of the user
 * @returns {Promise<string>} User ID
 */
export const joinRoom = async (roomCode, userName) => {
  const userRef = push(ref(database, `rooms/${roomCode}/users`));
  const userId = userRef.key;
  
  await set(userRef, {
    name: userName,
    joinedAt: serverTimestamp(),
    handRaised: false
  });
  
  return userId;
};

/**
 * Raise or lower hand for a user
 * @param {string} roomCode - Room code
 * @param {string} userId - User ID
 * @param {boolean} handRaised - Whether hand is raised
 */
export const updateHandStatus = async (roomCode, userId, handRaised) => {
  const userRef = ref(database, `rooms/${roomCode}/users/${userId}`);
  await update(userRef, {
    handRaised,
    ...(handRaised && { raisedAt: serverTimestamp() })
  });
  
  if (handRaised) {
    // Add to queue
    const queueRef = push(ref(database, `rooms/${roomCode}/queue`));
    await set(queueRef, {
      userId,
      raisedAt: serverTimestamp()
    });
  } else {
    // Remove from queue
    const queueRef = ref(database, `rooms/${roomCode}/queue`);
    const snapshot = await get(queueRef);
    if (snapshot.exists()) {
      const queue = snapshot.val();
      for (const [queueId, queueItem] of Object.entries(queue)) {
        if (queueItem.userId === userId) {
          await remove(ref(database, `rooms/${roomCode}/queue/${queueId}`));
          break;
        }
      }
    }
  }
};

/**
 * Remove user from queue (admin action)
 * @param {string} roomCode - Room code
 * @param {string} userId - User ID to remove
 */
export const removeFromQueue = async (roomCode, userId) => {
  // Remove from queue
  const queueRef = ref(database, `rooms/${roomCode}/queue`);
  const snapshot = await get(queueRef);
  if (snapshot.exists()) {
    const queue = snapshot.val();
    for (const [queueId, queueItem] of Object.entries(queue)) {
      if (queueItem.userId === userId) {
        await remove(ref(database, `rooms/${roomCode}/queue/${queueId}`));
        break;
      }
    }
  }
  
  // Update user's hand status
  await update(ref(database, `rooms/${roomCode}/users/${userId}`), { handRaised: false });
};

/**
 * Listen to room updates
 * @param {string} roomCode - Room code
 * @param {function} callback - Callback function to handle updates
 * @returns {function} Unsubscribe function
 */
export const listenToRoom = (roomCode, callback) => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  onValue(roomRef, callback);
  
  return () => off(roomRef, callback);
};

/**
 * Leave room and cleanup
 * @param {string} roomCode - Room code
 * @param {string} userId - User ID
 */
export const leaveRoom = async (roomCode, userId) => {
  // Remove from users
  await remove(ref(database, `rooms/${roomCode}/users/${userId}`));
  
  // Remove from queue if exists
  const queueRef = ref(database, `rooms/${roomCode}/queue`);
  const snapshot = await get(queueRef);
  if (snapshot.exists()) {
    const queue = snapshot.val();
    for (const [queueId, queueItem] of Object.entries(queue)) {
      if (queueItem.userId === userId) {
        await remove(ref(database, `rooms/${roomCode}/queue/${queueId}`));
        break;
      }
    }
  }
};

/**
 * Delete entire room (admin action)
 * @param {string} roomCode - Room code
 */
export const deleteRoom = async (roomCode) => {
  await remove(ref(database, `rooms/${roomCode}`));
}; 