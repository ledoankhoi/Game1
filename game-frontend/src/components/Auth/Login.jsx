import React, { useState } from 'react';
import axios from 'axios';
// Nhập thư viện Facebook và Google
import FacebookLoginRaw from 'react-facebook-login/dist/facebook-login-render-props';
import { GoogleLogin } from '@react-oauth/google';

const FacebookLogin = FacebookLoginRaw.default || FacebookLoginRaw;

const Login = ({ onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. XỬ LÝ ĐĂNG NHẬP EMAIL & PASSWORD (Lấy từ App.jsx cũ)
  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        // Lưu thông tin và token vào localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        // Thông báo cho App.jsx biết để cập nhật giao diện
        window.dispatchEvent(new Event('storage'));
        onClose();
        window.location.reload(); 
      } else {
        setError(data.message || "Sai email hoặc mật khẩu!");
      }
    } catch (err) {
      setError("Lỗi kết nối tới máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  // 2. XỬ LÝ ĐĂNG NHẬP GOOGLE (Lấy từ App.jsx cũ)
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      const response = await fetch('http://localhost:3000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        window.dispatchEvent(new Event('storage'));
        onClose();
        window.location.reload();
      } else {
        setError("Xác thực Google thất bại!");
      }
    } catch (err) {
      setError("Lỗi kết nối tới máy chủ!");
    }
  };

  // 3. XỬ LÝ ĐĂNG NHẬP FACEBOOK (Lấy từ Home.jsx cũ)
  const handleFacebookResponse = async (response) => {
    if (!response.accessToken) return;
    setError("");
    try {
      const res = await axios.post('http://localhost:3000/api/auth/facebook-login', {
        accessToken: response.accessToken
      });
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        window.dispatchEvent(new Event('storage'));
        onClose();
        window.location.reload(); 
      }
    } catch (err) {
      setError("Đăng nhập Facebook thất bại!");
    }
  };

  const handleBoxClick = (e) => e.stopPropagation();

  return (
    <div className="bg-white dark:bg-[#1a2e20] p-8 rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-300" onClick={handleBoxClick}>
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors">
        <span className="material-symbols-outlined">close</span>
      </button>
      
      <h2 className="text-3xl font-black text-center mb-6 text-gray-800 dark:text-white">Đăng nhập</h2>
      
      {error && <p className="text-red-500 text-sm text-center mb-4 font-bold bg-red-50 p-2 rounded-lg">{error}</p>}

      <form onSubmit={handleStandardLogin} className="flex flex-col gap-4 mb-6">
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
        <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-all shadow-md">
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="relative flex py-2 items-center mb-6">
        <div className="flex-grow border-t border-gray-300 dark:border-[#2a3f31]"></div>
        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-bold uppercase tracking-wider">Hoặc</span>
        <div className="flex-grow border-t border-gray-300 dark:border-[#2a3f31]"></div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Nút Google */}
        <div className="flex justify-center w-full overflow-hidden rounded-xl border border-gray-200">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Lỗi khi mở cửa sổ Google')}
            useOneTap
            width="384px"
          />
        </div>

        {/* Nút Facebook */}
        <FacebookLogin
          appId="2123992368365701"
          autoLoad={false}
          fields="name,email,picture"
          callback={handleFacebookResponse}
          render={renderProps => (
            <button 
              type="button" 
              onClick={renderProps.onClick} 
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-bold py-2.5 rounded-xl hover:bg-[#166fe5] transition-all shadow-md active:scale-95"
            >
              <span className="font-bold text-xl">f</span> Facebook
            </button>
          )}
        />
      </div>

      <p className="text-center text-gray-600 dark:text-gray-300 mt-6 text-sm">
        Chưa có tài khoản? <button onClick={onSwitchToRegister} className="text-primary font-bold hover:underline">Đăng ký ngay</button>
      </p>
    </div>
  );
};

export default Login;