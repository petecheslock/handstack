import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listenToRoom, updateHandStatus } from '../services/firebase';

const UserRoom = ({ userSession, onSessionEnd }) => {
  const [roomData, setRoomData] = useState(null);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [queuePosition, setQueuePosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoomEndedModal, setShowRoomEndedModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();
  const { roomCode } = useParams(); // Get room code from URL parameter

  useEffect(() => {
    const unsubscribe = listenToRoom(roomCode, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
        
        // Check user's hand status
        const user = data.users && data.users[userSession.userId];
        if (user) {
          setIsHandRaised(user.handRaised || false);
        }
        
        // Calculate queue position
        const queueData = data.queue || {};
        const queueArray = Object.entries(queueData)
          .map(([queueId, queueItem]) => ({
            queueId,
            ...queueItem,
            user: data.users ? data.users[queueItem.userId] : null
          }))
          .filter(item => item.user) // Only include items with valid users
          .sort((a, b) => a.raisedAt - b.raisedAt); // Sort by raise time
        
        const userQueueIndex = queueArray.findIndex(item => item.userId === userSession.userId);
        setQueuePosition(userQueueIndex >= 0 ? userQueueIndex + 1 : null);
      } else if (roomData !== null) {
        // Room was deleted (admin ended the meeting)
        setShowRoomEndedModal(true);
      }
    });

    return unsubscribe;
  }, [roomCode, userSession.userId, roomData]);

  const handleToggleHand = async () => {
    setIsLoading(true);
    try {
      await updateHandStatus(roomCode, userSession.userId, !isHandRaised);
    } catch (err) {
      console.error('Error updating hand status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    onSessionEnd();
    navigate('/');
  };

  const handleReturnToMain = () => {
    setShowRoomEndedModal(false);
    onSessionEnd();
    navigate('/');
  };

  // Countdown timer for room ended modal
  useEffect(() => {
    let interval;
    if (showRoomEndedModal && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (showRoomEndedModal && countdown === 0) {
      handleReturnToMain();
    }

    return () => clearInterval(interval);
  }, [showRoomEndedModal, countdown]);

  if (!roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  const users = roomData.users || {};
  const activeUsers = Object.values(users).length;
  const queueData = roomData.queue || {};
  const queueLength = Object.keys(queueData).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meeting Room</h1>
              <p className="text-gray-600">Room: {roomCode}</p>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="btn btn-secondary text-sm"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {isHandRaised ? '🙋‍♂️' : '👤'}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Hello, {userSession.userName}!
            </h2>
            <p className="text-gray-600">
              {isHandRaised ? 'Your hand is raised' : 'Your hand is down'}
            </p>
          </div>
        </div>

        {/* Queue Status */}
        {queuePosition && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600 mb-2">
                #{queuePosition}
              </div>
              <p className="text-warning-800 font-medium">
                You're in the queue!
              </p>
              <p className="text-warning-700 text-sm mt-1">
                {queuePosition === 1 ? 'You\'re up next!' : `${queuePosition - 1} person${queuePosition > 2 ? 's' : ''} ahead of you`}
              </p>
            </div>
          </div>
        )}

        {/* Hand Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            {!isHandRaised ? (
              <button
                onClick={handleToggleHand}
                disabled={isLoading}
                className="w-full btn btn-success text-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Raising...
                  </span>
                ) : (
                  '🙋‍♂️ Raise Hand'
                )}
              </button>
            ) : (
              <button
                onClick={handleToggleHand}
                disabled={isLoading}
                className="w-full btn btn-warning text-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Lowering...
                  </span>
                ) : (
                  '👋 Lower Hand'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Room Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Stats</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activeUsers}
              </div>
              <p className="text-sm text-gray-600 mt-1">Participants</p>
            </div>
            
            <div className="bg-warning-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-warning-600">
                {queueLength}
              </div>
              <p className="text-sm text-gray-600 mt-1">In Queue</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">How it works:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Raise your hand when you want to speak</li>
            <li>• Wait for your turn in the queue</li>
            <li>• The meeting host will call on you</li>
            <li>• Lower your hand when you're done</li>
          </ul>
        </div>
      </div>

      {/* Room Ended Modal */}
      {showRoomEndedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Meeting Ended
              </h3>
              
              <p className="text-gray-600 mb-6">
                The room admin has ended the meeting. You will be redirected to the main screen.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-800 font-medium">
                    Auto-redirect in {countdown} seconds
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleReturnToMain}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Return to Main Screen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoom; 