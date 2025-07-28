import React, { useState } from 'react';
import Login from './login';
import CoursePage from './CoursePage';

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (username) => {
    setUser(username);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      {user ? (
        <>
          <button
            onClick={handleLogout}
            style={{
              position: 'fixed',
              top: 10,
              right: 10,
              padding: '8px 15px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              zIndex: 999,
            }}
          >
            登出
          </button>
          <CoursePage />
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
};

export default App;
