import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://192.168.66.27:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // 修改：將使用者名稱和角色一起傳遞給父組件
        onLogin(username, data.role);
      } else {
        setError(data.message || '帳號或密碼錯誤，請再試一次。');
      }
    } catch (err) {
      setError('連線失敗，請檢查網路或稍後再試。');
      console.error('Login error:', err);
    }
  };

  // --- 樣式定義 (內聯樣式，除了輸入框的動態樣式改用 CSS class) ---
  const pageContainerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(to bottom right, #e0f2fe, #eef2ff, #f3e8ff)',
    fontFamily: 'Inter, sans-serif',
  };

  const formCardStyle = {
    width: 'min(90%, 400px)',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    border: '1px solid #e0e7ee',
  };

  const titleStyle = {
    textAlign: 'center',
    marginBottom: '10px',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    background: 'linear-gradient(45deg, #3b82f6, #4f46e5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const subtitleStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '0.9rem',
    color: '#6b7280',
    lineHeight: '1.5',
  };

  const errorStyle = {
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    padding: '10px 15px',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontWeight: '500',
    border: '1px solid #fca5a5',
    marginTop: '0',
    marginBottom: '10px',
  };

  const buttonStyle = {
    padding: '14px',
    borderRadius: '8px',
    background: 'linear-gradient(45deg, #3b82f6, #4f46e5)',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    transition: 'background 0.3s, transform 0.1s, box-shadow 0.3s',
  };

  const buttonHoverStyle = {
    background: 'linear-gradient(45deg, #2563eb, #3730a3)',
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
  };

  return (
    <div style={pageContainerStyle}>
      <form onSubmit={handleSubmit} style={formCardStyle}>
        <h2 style={titleStyle}>北護課程查詢登入系統</h2>
        <p style={subtitleStyle}>
          請使用您的帳號密碼登入系統<br/>
          <small>學生可查詢課程，管理者可進行課程管理</small>
        </p>
        
        {error && <p style={errorStyle}>{error}</p>}
        
        <input
          type="text"
          placeholder="請輸入帳號"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="請輸入密碼"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <button
          type="submit"
          style={buttonStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
        >
          登入
        </button>
      </form>

      {/* 內嵌 CSS 樣式，用於處理輸入框的動態狀態 */}
      <style>
        {`
          .login-input {
            padding: 14px 16px;
            border-radius: 8px;
            box-shadow: inset 0 0 0 1px #d1d5db; 
            font-size: 1rem;
            outline: none;
            transition: box-shadow 0.2s ease-in-out; 
            color: #333;
            box-sizing: border-box;
            border: none;
          }

          .login-input:focus {
            box-shadow: inset 0 0 0 1px #60a5fa, 0 0 0 3px rgba(96, 165, 250, 0.3);
          }

          .login-input::placeholder {
            color: #9ca3af;
          }
        `}
      </style>
    </div>
  );
}

export default Login;