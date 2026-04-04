import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
// Nhập thư viện Facebook (đã sửa lỗi Vite object)
import FacebookLoginRaw from 'react-facebook-login/dist/facebook-login-render-props';
const FacebookLogin = FacebookLoginRaw.default || FacebookLoginRaw;

function Login({ setShowAuth, setIsLoginMode, setUser, setAuthMessage, authMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- LOGIC ĐĂNG NHẬP FACEBOOK ---
  const handleFacebookResponse = async (response) => {
    
    console.log("📥 Dữ liệu Facebook trả về:", response);
    
    if (!response.accessToken) {
        setAuthMessage("Người dùng hủy hoặc không có token!");
        return;
    }
    
    setAuthMessage("Đang xác thực với Facebook...");
    try {
      const res = await axios.post('http://localhost:3000/api/auth/facebook-login', {
        accessToken: response.accessToken
      });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        setShowAuth(false);
        setAuthMessage("");
         
      }
    } catch (error) {
      console.error("Lỗi đăng nhập FB:", error);
      setAuthMessage("Đăng nhập Facebook thất bại!");
    }
  };

  const handleLogin = async () => {
    setAuthMessage("Đang xử lý...");
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setShowAuth(false);
        setAuthMessage("");
      } else {
        setAuthMessage(data.message || "Sai email hoặc mật khẩu!");
      }
    } catch (error) {
      setAuthMessage("Lỗi kết nối tới máy chủ!");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setAuthMessage("Đang xác thực với Google...");
    try {
      const response = await fetch('http://localhost:3000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setShowAuth(false);
        setAuthMessage("");
      } else {
        setAuthMessage("Xác thực Google thất bại!");
      }
    } catch (error) {
      setAuthMessage("Lỗi kết nối tới máy chủ!");
    }
  };

  return (
    <div className="flex flex-col gap-3">
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
      
      <button onClick={handleLogin} className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-2 hover:bg-green-600 transition shadow-lg shadow-green-500/30 uppercase">
        Login
      </button>

      <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-sm text-gray-400 font-bold uppercase">Hoặc</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>

      <div className="flex flex-col gap-3 items-center w-full">
          {/* Nút Google */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setAuthMessage('Cửa sổ Google bị đóng hoặc lỗi!')}
            theme="filled_blue"
            shape="pill"
          />

          {/* Nút Facebook */}
          <FacebookLogin
            appId="2123992368365701"
            autoLoad={false}
            fields="name,email,picture"
            version="19.0"
            callback={handleFacebookResponse}
            render={renderProps => (
                <button 
                    type="button"
                    onClick={renderProps.onClick}
                    className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-bold py-2 px-4 rounded-full hover:bg-[#166fe5] transition-all shadow-md active:scale-95"
                    style={{ maxWidth: '240px' }} // Cho bằng kích thước nút Google
                >
                    <span className="font-bold text-lg">f</span>
                    <span className="text-sm">Đăng nhập Facebook</span>
                </button>
            )}
          />
      </div>
      
      <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        Chưa có tài khoản? <span onClick={() => setIsLoginMode(false)} className="text-primary font-bold cursor-pointer hover:underline">Đăng ký ngay</span>
      </p>
    </div>
  );
}
export default Login;