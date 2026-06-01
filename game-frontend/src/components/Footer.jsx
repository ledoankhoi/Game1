import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import '../assets/css/footer.css';

const Footer = () => {
  const footerRef = useRef(null);
  const sectionRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(footerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.3, ease: 'power2.out' });
    if (sectionRef.current?.children?.length) gsap.fromTo(sectionRef.current.children, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: 'power2.out', delay: 0.4 });
  }, []);

  return (
    <footer ref={footerRef} className="footer-container">
      <div ref={sectionRef} className="footer-content">
        
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
            <li><Link to="/privacy">Trung tâm bảo mật</Link></li>
          </ul>
        </div>

      </div>

      {/* Phần bản quyền */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} mathquest.com. Đã đăng ký bản quyền.</p>
      </div>
    </footer>
  );
};

export default Footer;