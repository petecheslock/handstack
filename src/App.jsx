import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './components/Home';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import AdminRoom from './components/AdminRoom';
import UserRoom from './components/UserRoom';
import { leaveRoom, roomExists, deleteRoom, userExistsInRoom, restoreUserToRoom } from './services/firebase';

function App() {
  const [userSession, setUserSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Load session from localStorage on app start and restore room if valid
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedSession = localStorage.getItem('handstack_session');
        if (savedSession) {
          const session = JSON.parse(savedSession);
          
          // Validate that the room still exists
          const roomStillExists = await roomExists(session.roomCode);
          if (roomStillExists) {
            // Handle session restoration based on user type
            if (session.userType === 'user' && session.userId) {
              // For regular users, check if they still exist in the database
              const userExists = await userExistsInRoom(session.roomCode, session.userId);
              if (!userExists) {
                // Only restore to database if user is on their room page (refresh scenario)
                const isOnRoomPage = location.pathname === `/room/${session.roomCode}`;
                if (isOnRoomPage) {
                  // User was removed from database during page refresh, restore them
                  await restoreUserToRoom(session.roomCode, session.userId, session.userName);
                  console.log(`User ${session.userName} restored to room ${session.roomCode}`);
                }
                // Always preserve session regardless of page (they can see it on home page)
              }
            }
            // For admins, no database restoration needed (they don't exist in users collection)
            // Session is preserved as long as room exists
            
            setUserSession(session);
            
            // Only redirect from create/join pages (not home page)
            const isOnCreateJoinPage = location.pathname === '/create' || location.pathname === '/join';
            
            if (isOnCreateJoinPage) {
              const targetPath = session.userType === 'admin' 
                ? `/admin/${session.roomCode}` 
                : `/room/${session.roomCode}`;
              navigate(targetPath, { replace: true });
            }
          } else {
            // Room no longer exists, clear session
            localStorage.removeItem('handstack_session');
            setUserSession(null);
          }
        }

        // Handle path redirected from 404 page (for SPA routing)
        const pathToRedirect = sessionStorage.getItem('pathToRedirect');
        if (pathToRedirect) {
          sessionStorage.removeItem('pathToRedirect');
          navigate(pathToRedirect);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        // Clear potentially corrupted session
        localStorage.removeItem('handstack_session');
        setUserSession(null);
      } finally {
        setIsLoadingSession(false);
      }
    };

    restoreSession();
  }, [navigate, location.pathname]);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (userSession) {
      localStorage.setItem('handstack_session', JSON.stringify(userSession));
    } else {
      localStorage.removeItem('handstack_session');
    }
  }, [userSession]);

  // Cleanup on app close/refresh (only for regular users)
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (userSession) {
        try {
          if (userSession.userType === 'user' && userSession.userId) {
            // Regular user closing - just remove them from the room
            await leaveRoom(userSession.roomCode, userSession.userId);
          }
          // Note: Admin rooms are NOT deleted on page close/refresh
          // They persist until explicitly ended via "End Meeting" button
        } catch (error) {
          console.error('Error during beforeunload cleanup:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userSession]);

  const handleSessionStart = (sessionData) => {
    setUserSession(sessionData);
  };

  const handleSessionEnd = async () => {
    if (userSession) {
      try {
        if (userSession.userType === 'admin') {
          // Admin is ending the meeting - delete the entire room
          await deleteRoom(userSession.roomCode);
          console.log(`Room ${userSession.roomCode} deleted successfully`);
        } else if (userSession.userId) {
          // Regular user is leaving - just remove them from the room
          await leaveRoom(userSession.roomCode, userSession.userId);
        }
      } catch (error) {
        console.error('Error during session cleanup:', error);
        // Continue with session cleanup even if database operations fail
      }
    }
    // Clear localStorage immediately to prevent session restoration
    localStorage.removeItem('handstack_session');
    setUserSession(null);
  };

  // Show loading screen while restoring session
  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Restoring session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home userSession={userSession} onSessionEnd={handleSessionEnd} />} />
        <Route 
          path="/create" 
          element={
            userSession ? (
              <Navigate to={userSession.userType === 'admin' ? `/admin/${userSession.roomCode}` : `/room/${userSession.roomCode}`} replace />
            ) : (
              <CreateRoom onSessionStart={handleSessionStart} />
            )
          } 
        />
        <Route 
          path="/join" 
          element={
            userSession ? (
              <Navigate to={userSession.userType === 'admin' ? `/admin/${userSession.roomCode}` : `/room/${userSession.roomCode}`} replace />
            ) : (
              <JoinRoom onSessionStart={handleSessionStart} />
            )
          } 
        />
        <Route 
          path="/admin/:roomCode" 
          element={
            userSession && userSession.userType === 'admin' ? (
              <AdminRoom 
                userSession={userSession} 
                onSessionEnd={handleSessionEnd} 
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/room/:roomCode" 
          element={
            userSession && userSession.userType === 'user' ? (
              <UserRoom 
                userSession={userSession} 
                onSessionEnd={handleSessionEnd} 
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App; 