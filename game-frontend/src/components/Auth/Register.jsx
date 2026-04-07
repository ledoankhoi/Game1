import React, { useState } from 'react';

const Register = ({ onClose, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (data.success) {
        alert("Đăng ký thành công! Hãy đăng nhập để bắt đầu.");
        onSwitchToLogin(); // Chuyển sang màn hình đăng nhập
      } else {
        setError(data.message || "Đăng ký thất bại!");
      }
    } catch (err) {
      setError("Lỗi kết nối tới máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  const handleBoxClick = (e) => e.stopPropagation();

  return (
    <div className="bg-white dark:bg-[#1a2e20] p-8 rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-300" onClick={handleBoxClick}>
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors">
        <span className="material-symbols-outlined">close</span>
      </button>
      
      <h2 className="text-3xl font-black text-center mb-6 text-gray-800 dark:text-white">Đăng ký</h2>
      
      {error && <p className="text-red-500 text-sm text-center mb-4 font-bold bg-red-50 p-2 rounded-lg">{error}</p>}

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Tên người dùng (Username)" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-[#2a3f31] rounded-xl bg-gray-50 dark:bg-[#0f1912] text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary" 
          required 
        />
        <input 
          type="email" 
          placeholder="Email của bạn" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-[#2a3f31] rounded-xl bg-gray-50 dark:bg-[#0f1912] text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary" 
          required 
        />
        <input 
          type="password" 
          placeholder="Mật khẩu" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-[#2a3f31] rounded-xl bg-gray-50 dark:bg-[#0f1912] text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary" 
          required 
        />
        <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-all shadow-md mt-2">
          {loading ? "Đang xử lý..." : "Tạo tài khoản"}
        </button>
      </form>

      <p className="text-center text-gray-600 dark:text-gray-300 mt-6 text-sm">
        Đã có tài khoản? <button onClick={onSwitchToLogin} className="text-primary font-bold hover:underline">Đăng nhập</button>
      </p>
    </div>
  );
};

export default Register;