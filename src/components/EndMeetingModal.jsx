import React from 'react';

const EndMeetingModal = ({ isOpen, onConfirm, onCancel, userType }) => {
  if (!isOpen) return null;

  const isAdmin = userType === 'admin';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isAdmin ? 'End Meeting' : 'Leave Meeting'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            {isAdmin 
              ? 'Are you sure you want to end this meeting?' 
              : 'Are you sure you want to leave this meeting?'
            }
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-2">This will:</p>
                <ul className="space-y-1">
                  {isAdmin ? (
                    <>
                      <li>• Close the meeting for all participants</li>
                      <li>• Clear the speaking queue</li>
                      <li>• Remove all users from the room</li>
                    </>
                  ) : (
                    <>
                      <li>• Remove you from the meeting</li>
                      <li>• Clear your place in the speaking queue</li>
                      <li>• End your session</li>
                    </>
                  )}
                </ul>
                <p className="font-medium mt-2">This action cannot be undone.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            {isAdmin ? 'End Meeting' : 'Leave Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndMeetingModal; 