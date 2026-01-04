import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationCenter = () => {
  const { notifications, markAsRead, clearNotification } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, 3));
  }, [notifications]);

  return (
    <div className="fixed top-20 right-4 z-40 space-y-3 max-w-md">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-lg shadow-lg animate-fade-in
            ${notification.type === 'workout'
              ? 'bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700'
              : 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700'
            }
          `}
          onClick={() => markAsRead(notification.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`
                font-semibold
                ${notification.type === 'workout'
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-blue-900 dark:text-blue-100'
                }
              `}>
                {notification.title}
              </h3>
              <p className={`
                text-sm mt-1
                ${notification.type === 'workout'
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-blue-800 dark:text-blue-200'
                }
              `}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearNotification(notification.id);
              }}
              className={`
                ml-2 font-bold
                ${notification.type === 'workout'
                  ? 'text-green-600 dark:text-green-400 hover:text-green-700'
                  : 'text-blue-600 dark:text-blue-400 hover:text-blue-700'
                }
              `}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;