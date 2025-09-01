import React, { useState } from 'react';
import Login from './login';
import CoursePage from './CoursePage';
import AdminPage from './AdminPage'; // 新增管理者頁面

const App = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 新增：儲存使用者角色

  const handleLogin = (username, role) => {
    setUser(username);
    setUserRole(role); // 儲存角色資訊
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole(null); // 清除角色資訊
  };

  return (
    <>
      {user ? (
        <>
          {/* 頂部導航列 */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
            zIndex: 1000,
            borderBottom: '1px solid #e0e7ee'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h3 style={{ 
                margin: 0, 
                color: '#1f2937',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                北護課程查詢系統
              </h3>
              <span style={{
                backgroundColor: userRole === 'admin' ? '#dc2626' : '#3b82f6',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                {userRole === 'admin' ? '管理者' : '學生'}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                歡迎，{user}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                登出
              </button>
            </div>
          </div>

          {/* 主要內容區域 */}
          <div style={{ paddingTop: '60px' }}>
            {userRole === 'admin' ? <AdminPage /> : <CoursePage />}
          </div>
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
};

export default App;