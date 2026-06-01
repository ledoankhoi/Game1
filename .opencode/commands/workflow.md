---
description: Quy trình phát triển tự động cho MathQuest — đọc TODO.md, chọn luồng, thực thi
agent: build
---

## Bước 0: Đọc TODO.md
Đầu tiên, luôn đọc `TODO.md` để biết danh sách công việc cần làm. Thực hiện theo các bước trong file đó trước.

## Luồng chính: Compound Engineering
Dùng khi phát triển tính năng mới hoặc cải tiến:

| Bước | Lệnh | Mô tả |
|:----:|------|-------|
| 1 | `/ce-brainstorm` | Khởi tạo ý tưởng, khám phá yêu cầu |
| 2 | `/ce-plan` | Lập kế hoạch chi tiết, chia task |
| 3 | `/ce-work` | Thực thi code theo plan |
| 4 | `/ce-code-review` | Review code với 21 agent chuyên biệt |
| 5 | `/ce-compound` | Lưu knowledge vào `tools/docs/solutions/` |
| 6 | `/ce-commit` | Commit code theo chuẩn conventional commit |

## Luồng Spec-Driven: OpenSpec
Dùng khi cần quy trình chặt chẽ (tính năng lớn, có spec rõ ràng):

| Bước | Lệnh | Mô tả |
|:----:|------|-------|
| 1 | `/opsx-propose "tên tính năng"` | Tạo proposal + design + tasks |
| 2 | `/opsx-apply` | Implement code theo tasks |
| 3 | `/opsx-archive` | Kết thúc change, lưu lại |

## Luồng Debug
Khi gặp lỗi hoặc bug:

| Bước | Lệnh | Mô tả |
|:----:|------|-------|
| 1 | `/ce-debug` | Phân tích root-cause + đề xuất fix |
| 2 | Fix code | Sửa lỗi |
| 3 | `/ce-code-review` | Kiểm tra lại code |

## Luồng Cycle (tự động)
Dùng cho phát triển liên tục, không cần spec:

1. **Init** — Chạy `npm run lint`, `git status`, đọc `TODO.md` + `README.md`
2. **Research** — Xác định issue P0/P1 từ lint và TODO.md
3. **Plan** — Tạo todowrite với 3-5 issues
4. **Develop** — Fix từng issue
5. **Verify** — Chạy lint, kiểm tra logic
6. **Loop** — Tự động bắt đầu cycle mới nếu còn issue
