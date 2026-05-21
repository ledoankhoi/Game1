import http from 'k6/http';
import { sleep, check } from 'k6';

// 1. CẤU HÌNH TẢI
// Với API Ghi (Write) vào DB, tải sẽ nặng hơn API Đọc (GET).
// Ta thử thách nghiệm với 500 VUs trước.
export let options = {
    vus: 5000,         
    duration: '30s',  
};

// 2. HÀM SETUP (Chạy ĐÚNG 1 LẦN trước khi bắt đầu test)
// Mục đích: Đăng nhập để lấy Token
export function setup() {
    const loginUrl = 'http://localhost:5000/api/auth/login'; // Đường dẫn đăng nhập của bạn
    
    // ĐIỀN THÔNG TIN TÀI KHOẢN CÓ THẬT TRONG DB CỦA BẠN VÀO ĐÂY:
    const payload = JSON.stringify({
        email: 'ledang18177@gmail.com',  // Hoặc dùng username nếu logic của bạn dùng username
        password: '123'
    });

    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    const res = http.post(loginUrl, payload, params);
    
    // Lấy token từ phản hồi của server trả về cho các VUs dùng chung
    let token = res.json('token'); 
    return { token: token }; 
}

// 3. KỊCH BẢN CHÍNH (500 người dùng ảo sẽ chạy liên tục hàm này)
export default function (data) {
    const url = 'http://localhost:5000/api/games/save-result';
    
    // Tạo điểm số ngẫu nhiên từ 10 đến 100 để test
    const randomScore = Math.floor(Math.random() * 90) + 10;

    const payload = JSON.stringify({
        gameId: 'chess', // Giả lập chơi game cờ vua xong
        score: randomScore,
        coinsEarned: 10,
        expEarned: 20
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            // Gắn token đã lấy được từ hàm setup() vào Header
            'Authorization': `Bearer ${data.token}` 
        },
    };

    const res = http.post(url, payload, params);

    // Kiểm tra xem lưu điểm có thành công không
    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1); 
}