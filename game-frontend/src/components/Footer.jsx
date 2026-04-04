import React from 'react';
import { Link } from 'react-router-dom'; // Dùng để chuyển trang không cần tải lại
import '../assets/css/footer.css'; // Nhúng file CSS vừa tạo

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Cột 1: Thông tin dự án */}
        <div className="footer-section">
          <h4>Về Game1</h4>
          <p>
            Nền tảng trò chơi giải trí đa dạng. Thử thách trí tuệ với Cờ vua, giải mã mê cung hay đua xe tốc độ. Chơi ngay không cần cài đặt!
          </p>
        </div>

        {/* Cột 2: Điều hướng trang (Dùng Link của React) */}
        <div className="footer-section">
          <h4>Tính năng</h4>
          <ul>
            <li><Link to="/">🏠 Trang chủ</Link></li>
            <li><Link to="/leaderboard">🏆 Bảng xếp hạng</Link></li>
            <li><Link to="/shop">🛒 Cửa hàng</Link></li>
            <li><Link to="/profile">👤 Hồ sơ cá nhân</Link></li>
          </ul>
        </div>

        {/* Cột 3: Game nổi bật (Dùng thẻ a vì đây là file HTML tĩnh trong thư mục public) */}
        <div className="footer-section">
          <h4>Game Nổi Bật</h4>
          <ul>
            <li><a href="/chess.html">♞ Cờ vua (Chess)</a></li>
            <li><a href="/race.html">🏎️ Đua xe (Race)</a></li>
            <li><a href="/maze.html">🧩 Mê cung (Maze)</a></li>
            <li><a href="/pixel.html">👾 Pixel Game</a></li>
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