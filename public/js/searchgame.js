/* file: public/js/search.js */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        // Lắng nghe sự kiện khi người dùng gõ phím
        searchInput.addEventListener('keyup', searchGames);
        // Lắng nghe thêm sự kiện khi người dùng click dấu "x" để xóa text (trên 1 số trình duyệt)
        searchInput.addEventListener('search', searchGames);
    }
});

function searchGames() {
    // 1. Lấy giá trị người dùng nhập vào
    const input = document.getElementById('search-input');
    if (!input) return; // Bảo vệ: Nếu không tìm thấy ô input thì dừng

    const filter = input.value.toUpperCase(); 

    // 2. Lấy danh sách tất cả các thẻ game
    const grid = document.getElementById('game-grid');
    if (!grid) return; // Bảo vệ: Nếu không thấy lưới game thì dừng

    const cards = grid.getElementsByClassName('game-card');

    // 3. Duyệt qua từng thẻ game để kiểm tra
    for (let i = 0; i < cards.length; i++) {
        const titleElement = cards[i].querySelector('h4');
        
        if (titleElement) {
            const titleText = titleElement.textContent || titleElement.innerText;
            
            // 4. So sánh: Nếu tên game CÓ CHỨA từ khóa -> Hiện, ngược lại -> Ẩn
            if (titleText.toUpperCase().indexOf(filter) > -1) {
                cards[i].classList.remove('hidden');
            } else {
                cards[i].classList.add('hidden');
            }
        }
    }

    // (Mẹo UI) Reset các nút danh mục bên trái khi đang tìm kiếm
    if (filter.length > 0) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active-category', 'bg-primary', 'text-white');
            btn.classList.add('bg-white', 'text-gray-600', 'dark:bg-[#1a2e20]', 'dark:text-gray-300');
            const check = btn.querySelector('.material-symbols-outlined:last-child');
            if(check && check.innerText === 'check_circle') check.remove();
        });
    }
}