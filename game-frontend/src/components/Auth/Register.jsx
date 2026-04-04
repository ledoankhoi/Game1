import React, { useState } from 'react';

function Register({ setIsLoginMode, setAuthMessage, authMessage }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    setAuthMessage("Đang xử lý...");
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (data.success) {
        setAuthMessage("Đăng ký thành công! Hãy đăng nhập.");
        setTimeout(() => setIsLoginMode(true), 1500);
      } else {
        setAuthMessage(data.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      setAuthMessage("Lỗi kết nối tới máy chủ!");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input 
        type="text" 
        placeholder="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 outline-none transition focus:ring-2 focus:ring-primary" 
      />
      <input 
        type="email" 
        placeholder="Email Address" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary" 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary" 
      />

      <p className="text-red-500 text-center text-sm min-h-[20px] font-medium">{authMessage}</p>
      
      <button onClick={handleRegister} className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-2 hover:bg-green-600 transition shadow-lg shadow-green-500/30 uppercase">
        Register
      </button>

      <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        Đã có tài khoản? <span onClick={() => setIsLoginMode(true)} className="text-primary font-bold cursor-pointer hover:underline">Đăng nhập</span>
      </p>
    </div>
  );
}

export default Register;