import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EndMeetingModal from './EndMeetingModal';

const Home = ({ userSession, onSessionEnd }) => {
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);

  const handleShowEndSessionModal = () => {
    setShowEndSessionModal(true);
  };

  const handleConfirmEndSession = async () => {
    setShowEndSessionModal(false);
    await onSessionEnd();
  };

  const handleCancelEndSession = () => {
    setShowEndSessionModal(false);
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
              onClick={handleShowEndSessionModal}
              className="w-full btn btn-danger text-sm"
            >
              {userSession.userType === 'admin' ? 'End Meeting' : 'Leave Meeting'}
            </button>
          )}
        </div>

        {/* Separator */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-600">
            <a
              href="https://github.com/petecheslock/handstack"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
            
            <span className="hidden sm:inline text-gray-400">•</span>
            
            <span className="text-gray-500">
              Created by{' '}
              <a
                href="https://bsky.app/profile/petecheslock.bsky.social"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 transition-colors font-medium"
              >
                petecheslock
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      <EndMeetingModal
        isOpen={showEndSessionModal}
        onConfirm={handleConfirmEndSession}
        onCancel={handleCancelEndSession}
        userType={userSession?.userType}
      />
    </div>
  );
};

export default Home; 