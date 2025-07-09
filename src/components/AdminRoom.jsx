import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listenToRoom, removeFromQueue } from '../services/firebase';

const AdminRoom = ({ userSession, onSessionEnd }) => {
  const [roomData, setRoomData] = useState(null);
  const [queue, setQueue] = useState([]);
  const [users, setUsers] = useState({});
  const [showEndMeetingModal, setShowEndMeetingModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const audioContextRef = useRef(null);
  const previousQueueLengthRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const soundEnabledRef = useRef(soundEnabled);
  const flashEnabledRef = useRef(flashEnabled);

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.error('Audio context not supported:', error);
      }
    };
    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play notification sound
  const playNotificationSound = async () => {
    if (!audioContextRef.current) return;
    
    try {
      // Resume audio context if suspended (required by many browsers)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Create a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Trigger screen flash
  const triggerScreenFlash = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);
  };

  // Common notification handler - only triggers when users raise hands
  const triggerNotifications = () => {
    if (soundEnabledRef.current) {
      playNotificationSound();
    }
    if (flashEnabledRef.current) {
      triggerScreenFlash();
    }
  };

  useEffect(() => {
    const unsubscribe = listenToRoom(roomCode, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
        setUsers(data.users || {});
        
        // Process queue
        const queueData = data.queue || {};
        const queueArray = Object.entries(queueData)
          .map(([queueId, queueItem]) => ({
            queueId,
            ...queueItem,
            user: data.users ? data.users[queueItem.userId] : null
          }))
          .filter(item => item.user)
          .sort((a, b) => a.raisedAt - b.raisedAt);
        
        // Only trigger notifications after initial load and when queue actually increases
        if (!isInitialLoadRef.current && queueArray.length > previousQueueLengthRef.current) {
          // Additional check: ensure we're not triggering on page refresh with existing queue
          if (previousQueueLengthRef.current > 0 || queueArray.length === 1) {
            // Only trigger notifications if at least one notification type is enabled
            if (soundEnabledRef.current || flashEnabledRef.current) {
              triggerNotifications();
            }
          }
        }
        
        // After first load, set initial load to false and update previous queue length
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
        
        previousQueueLengthRef.current = queueArray.length;
        setQueue(queueArray);
      }
    });

    return unsubscribe;
  }, [roomCode]);

  // Handle escape key for modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showEndMeetingModal) {
        handleCancelEndSession();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showEndMeetingModal]);

  const handleRemoveFromQueue = async (userId) => {
    try {
      await removeFromQueue(roomCode, userId);
    } catch (err) {
      console.error('Error removing from queue:', err);
    }
  };

  const handleEndSession = () => {
    setShowEndMeetingModal(true);
  };

  const handleConfirmEndSession = () => {
    setShowEndMeetingModal(false);
    onSessionEnd();
    navigate('/');
  };

  const handleCancelEndSession = () => {
    setShowEndMeetingModal(false);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  // Update refs when state changes
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    flashEnabledRef.current = flashEnabled;
  }, [flashEnabled]);

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

  const activeUsers = Object.values(users).length;
  const raisedHands = queue.length;

  return (
    <div className={`min-h-screen bg-gray-50 transition-colors duration-300 ${
      isFlashing ? 'bg-yellow-200' : ''
    }`}>
      {/* Flash overlay */}
      {isFlashing && (
        <div className="fixed inset-0 bg-yellow-400 opacity-30 pointer-events-none z-50 animate-pulse"></div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Meeting hosted by {userSession.userName}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  soundEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={soundEnabled ? 'Disable sound notifications' : 'Enable sound notifications'}
              >
                {soundEnabled ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    Sound
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zm9.464-9.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Sound
                  </>
                )}
              </button>

              {/* Flash Toggle */}
              <button
                onClick={toggleFlash}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  flashEnabled 
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={flashEnabled ? 'Disable screen flash notifications' : 'Enable screen flash notifications'}
              >
                {flashEnabled ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Flash
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Flash
                  </>
                )}
              </button>

              <button
                onClick={handleEndSession}
                className="btn btn-danger"
              >
                End Meeting
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Room Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Room Information</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span>Sound:</span>
                  <span className={`font-medium ${soundEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {soundEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Flash:</span>
                  <span className={`font-medium ${flashEnabled ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {flashEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              <button
                onClick={copyRoomCode}
                className="btn btn-secondary text-sm"
              >
                Copy Room Code
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary-600 font-mono tracking-widest">
                {roomCode}
              </div>
              <p className="text-sm text-gray-600 mt-1">Room Code</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activeUsers}
              </div>
              <p className="text-sm text-gray-600 mt-1">Active Users</p>
            </div>
            
            <div className="bg-warning-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-warning-600">
                {raisedHands}
              </div>
              <p className="text-sm text-gray-600 mt-1">Raised Hands</p>
            </div>
          </div>
        </div>

        {/* Queue */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Speaking Queue</h2>
                <p className="text-gray-600 mt-1">
                  {queue.length === 0 ? 'No one in queue' : `${queue.length} person${queue.length > 1 ? 's' : ''} waiting to speak`}
                </p>
              </div>
              {(soundEnabled || flashEnabled) && (
                <div className="flex items-center gap-2">
                  {soundEnabled && (
                    <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      Sound
                    </div>
                  )}
                  {flashEnabled && (
                    <div className="flex items-center text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Flash
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="divide-y">
            {queue.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-4">🤐</div>
                <p>No raised hands yet</p>
                <p className="text-sm mt-2">
                  {soundEnabled || flashEnabled 
                    ? `You'll be notified when participants raise their hands${soundEnabled ? ' with sound' : ''}${soundEnabled && flashEnabled ? ' and' : ''}${flashEnabled ? ' screen flash' : ''}`
                    : "Participants will appear here when they raise their hands"
                  }
                </p>
              </div>
            ) : (
              queue.map((queueItem, index) => (
                <div key={queueItem.queueId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-primary-100 text-primary-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{queueItem.user.name}</p>
                      <p className="text-sm text-gray-500">
                        Raised hand {new Date(queueItem.raisedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveFromQueue(queueItem.userId)}
                    className="btn btn-success text-sm"
                  >
                    ✓ Done Speaking
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* All Users */}
        <div className="bg-white rounded-lg shadow-sm mt-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">All Participants</h2>
            <p className="text-gray-600 mt-1">
              {activeUsers === 0 ? 'No participants yet' : `${activeUsers} participant${activeUsers > 1 ? 's' : ''} in the room`}
            </p>
          </div>
          
          <div className="divide-y">
            {activeUsers === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-4">👥</div>
                <p>No participants yet</p>
                <p className="text-sm mt-2">Share the room code <strong>{roomCode}</strong> to get started</p>
              </div>
            ) : (
              Object.entries(users).map(([userId, user]) => (
                <div key={userId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {user.handRaised ? (
                        <div className="text-warning-500 text-xl">🙋‍♂️</div>
                      ) : (
                        <div className="text-gray-400 text-xl">👤</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {user.handRaised ? 'Hand raised' : 'Hand down'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Joined {new Date(user.joinedAt).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* End Meeting Confirmation Modal */}
      {showEndMeetingModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCancelEndSession}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                End Meeting
              </h3>
              <button
                onClick={handleCancelEndSession}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to end this meeting?
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-2">This will:</p>
                    <ul className="space-y-1">
                      <li>• Close the meeting for all participants</li>
                      <li>• Clear the speaking queue</li>
                      <li>• Remove all users from the room</li>
                    </ul>
                    <p className="font-medium mt-2">This action cannot be undone.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelEndSession}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEndSession}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                End Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoom; 