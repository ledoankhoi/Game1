import React from 'react';
import { Link } from 'react-router-dom'; 
import '../assets/css/footer.css'; 

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Cột 1: Thông tin liên hệ */}
        <div className="footer-section">
          <h4>Thông tin liên hệ</h4>
          <ul className="social-links">
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://zalo.me" target="_blank" rel="noopener noreferrer">Zalo</a></li>
            <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">Github</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>
        </div>

        {/* Cột 2: Về chúng tôi */}
        <div className="footer-section">
          <h4>Về MathQuest</h4>
          <p>
            Hành trình giải mã tri thức và thử thách trí tuệ đỉnh cao. Khám phá câu chuyện đằng sau thế giới trò chơi của chúng tôi!
          </p>
          <div style={{ marginTop: '10px' }}>
            {/* Thêm Link chuyển hướng đến trang About */}
            <Link to="/about" style={{ color: '#ffd700', fontWeight: 'bold', textDecoration: 'none' }}>
              🚀 Khám phá ngay
            </Link>
          </div>
        </div>

        {/* Cột 3: Giúp đỡ và hỗ trợ */}
        <div className="footer-section">
          <h4>Giúp đỡ & Hỗ trợ</h4>
          <ul>
            <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
            <li><Link to="/contact">Liên hệ trực tiếp</Link></li>
            <li><Link to="/security">Trung tâm bảo mật</Link></li>
          </ul>
        </div>

      </div>

      {/* Phần bản quyền */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Game1 Project. Đã đăng ký bản quyền.</p>
      </div>
    </footer>
  );
};

export default Footer;