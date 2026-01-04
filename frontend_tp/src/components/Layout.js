import React from 'react';
import Navbar from './Navbar';
import NotificationCenter from './NotificationCenter';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <NotificationCenter />
      <main className="pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;