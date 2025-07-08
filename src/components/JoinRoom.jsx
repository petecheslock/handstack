import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roomExists, joinRoom } from '../services/firebase';
import { formatJoinRoomCode, validateJoinRoomCode } from '../utils/roomCode';

const JoinRoom = ({ onSessionStart }) => {
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoomCodeChange = (e) => {
    const formatted = formatJoinRoomCode(e.target.value);
    if (formatted.length <= 4) {
      setRoomCode(formatted);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    if (!validateJoinRoomCode(roomCode)) {
      setError('Room code must be 4 characters (letters and numbers only)');
      return;
    }

    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if room exists
      const exists = await roomExists(roomCode);
      if (!exists) {
        setError('Room not found. Please check the room code.');
        setIsLoading(false);
        return;
      }

      // Join the room
      const userId = await joinRoom(roomCode, userName.trim());
      
      // Start session
      const sessionData = {
        roomCode,
        userName: userName.trim(),
        userType: 'user',
        userId
      };
      
      onSessionStart(sessionData);
      navigate(`/room/${roomCode}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">
            Join Room
          </h1>
          <p className="text-gray-600">
            Enter the room code to join a meeting
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="roomCode" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Room Code
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={handleRoomCodeChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl font-mono tracking-widest uppercase"
              placeholder="A3F7"
              maxLength={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              4-character code
            </p>
          </div>

          <div>
            <label 
              htmlFor="userName" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your name"
              maxLength={50}
            />
          </div>

          {error && (
            <div className="text-danger-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining...
              </span>
            ) : (
              'Join Room'
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>As a participant, you can:</strong>
          </p>
          <ul className="text-sm text-green-700 mt-2 space-y-1">
            <li>• Raise your hand to speak</li>
            <li>• See your position in the queue</li>
            <li>• Lower your hand at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom; 