---
description: Chạy AI Workflow Loop tự động (Init → Research → Plan → Develop → Verify → Loop)
agent: build
---

Thực hiện AI Workflow Loop từ AGENTS.md.

## Phase 1: Init
1. Chạy `cd game-frontend && npm run lint` kiểm tra lỗi
2. Chạy `git status` xem file nào đã thay đổi
3. Đọc AGENTS.md, README.md

## Phase 2: Research
1. Nếu lint có error → ưu tiên fix ngay
2. Nếu có warning → ghi nhận
3. Xác định issue P0/P1 còn tồn đọng

## Phase 3: Plan
1. Tạo todowrite với tối đa 3-5 issues cho cycle này
2. Ưu tiên P0 → P1 → P2 → P3
3. Mỗi issue = 1 task riêng

## Phase 4: Develop
1. Đọc file gốc trước khi sửa
2. Chỉ sửa đúng phần cần sửa
3. Giữ nguyên coding convention
4. KHÔNG thêm tính năng không được yêu cầu

## Phase 5: Verify
1. Chạy `cd game-frontend && npm run lint` — nếu có error quay lại Phase 4
2. Kiểm tra logic, import, tên biến
3. Update todowrite: task hoàn thành → completed

## Phase 6: Loop
1. Nếu còn task trong todowrite → quay lại Phase 4
2. Nếu hết task → kiểm tra lại toàn bộ dự án
3. Nếu còn issue P0/P1/P2:
   - Tự động bắt đầu cycle mới (quay lại Phase 1)
4. Nếu không còn issue:
   - Báo cáo kết quả và kết thúc
