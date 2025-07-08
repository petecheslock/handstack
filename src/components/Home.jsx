import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ userSession, onSessionEnd }) => {
  const handleClearSession = () => {
    if (window.confirm('Are you sure you want to end your current session?')) {
      onSessionEnd();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-700 mb-2">
            🙋‍♂️ Handstack
          </h1>
          <p className="text-gray-600 text-lg">
            Digital hand raising for in-person meetings
          </p>
        </div>

        {/* Active Session Notice */}
        {userSession && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800 font-semibold mb-2">
              {userSession.userType === 'admin' ? '🎯 You\'re hosting a meeting' : '👋 You\'re in a meeting'}
            </div>
            <p className="text-green-700 text-sm mb-3">
              Room: <span className="font-mono font-bold">{userSession.roomCode}</span>
            </p>
            <Link
              to={userSession.userType === 'admin' ? `/admin/${userSession.roomCode}` : `/room/${userSession.roomCode}`}
              className="w-full btn btn-success text-lg block mb-3"
            >
              Continue Session
            </Link>
            <p className="text-green-600 text-xs">
              Your session is saved and will resume automatically
            </p>
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-700 mb-4">
            {userSession 
              ? 'Continue your current session or start a new meeting.'
              : 'Organize your meetings with an orderly hand-raising system. Create a room or join an existing one to get started.'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/create"
            className="w-full btn btn-primary text-lg block"
          >
            {userSession ? 'Create New Room' : 'Create Room'}
          </Link>
          
          <Link
            to="/join"
            className="w-full btn btn-secondary text-lg block"
          >
            {userSession ? 'Join Different Room' : 'Join Room'}
          </Link>

          {/* Clear Session Button */}
          {userSession && (
            <button
              onClick={handleClearSession}
              className="w-full btn btn-danger text-sm"
            >
              End Current Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 