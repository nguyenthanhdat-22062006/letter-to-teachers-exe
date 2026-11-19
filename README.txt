LETTER TO TEACHERS.EXE — Thiệp điện tử tri ân Ngày Nhà giáo Việt Nam 20/11
Khoa Công nghệ thông tin — Đại học Tôn Đức Thắng (TDTU)
Kỷ niệm 44 năm Ngày Nhà giáo Việt Nam (1982 – 2026)

=====================================================================
1. CÁCH CHẠY CHƯƠNG TRÌNH
=====================================================================
Ngôn ngữ lập trình: HTML / CSS / JavaScript (ES Module)

Cách 1 - Mở trực tiếp (đơn giản nhất):
   Giải nén file .zip, mở đúp file "index.html" bằng trình duyệt
   (Chrome, Edge, Firefox, Cốc Cốc...). Toàn bộ hiệu ứng vẫn hoạt
   động bình thường.
   Lưu ý: nếu trình duyệt chặn hiển thị nội dung khi mở trực tiếp,
   hãy dùng Cách 2 bên dưới cho chắc chắn.

Cách 2 - Chạy qua máy chủ cục bộ (khuyến nghị để kiểm tra đầy đủ):
   Mở Terminal / Command Prompt trong thư mục đã giải nén, gõ:

       python -m http.server 8000

   Sau đó mở trình duyệt tại:  http://localhost:8000

Cách 3 - Xem bản trực tuyến (bản chính thức đã đăng ký GitHub Pages):
   https://nguyenthanhdat-22062006.github.io/letter-to-teachers-exe/

=====================================================================
2. CẤU TRÚC THƯ MỤC
=====================================================================
   index.html   - Toàn bộ cấu trúc giao diện (HTML5)
   style.css    - Toàn bộ hiển thị, hiệu ứng, responsive (CSS3)
   script.js    - Toàn bộ logic tương tác (JavaScript ES Module)
   README.txt   - File hướng dẫn này

Không có thư viện ngoài, không cần cài đặt thêm, không cần mạng
riêng (chỉ dùng Google Fonts để hiển thị đẹp hơn; nếu offline thì
font sẽ tự dùng font hệ thống và giao diện vẫn hoạt động bình thường).

=====================================================================
3. TÍNH NĂNG CHÍNH
=====================================================================
   - Màn hình chào với phong bì 3D: bấm hoặc nhấn Enter/Space để mở
   - Hiệu ứng thiệp hiện từ từ: bay lên từ dưới, mờ nhòe -> nét dần,
     kèm vệt sáng quét ngang (shine) kiểu bóc quà
   - Terminal gõ từ từ: letter-to-teachers.exe / Loading memories... 100% /
     Thank you, Teacher! kèm thanh tiến trình
   - Cánh hoa rơi (canvas) + pháo giấy khi mở thiệp
   - Nhạc hộp nhạc tổng hợp bằng Web Audio API (mặc định TẮT,
     bấm nút "Nhạc" ở góc trên để bật)
   - Bật/tắt hiệu ứng cánh hoa
   - Nút REPLAY (xem lại hiệu ứng mở), COPY LỜI CHÚC, SHARE, CLOSE
   - Tương thích điện thoại/máy tính bảng, có hỗ trợ
     prefers-reduced-motion và điều hướng bằng bàn phím

=====================================================================
4. ĐIỀU KHIỂN BẰNG BÀN PHÍM
=====================================================================
   Enter / Space : mở phong bì khi phong bì đang được chọn
   Esc           : đóng thiệp, quay lại màn hình chào
   Tab          : di chuyển giữa các nút

=====================================================================
5. CẤU TRÚC MÃ NGUỒN
=====================================================================
   - HTML5: index.html
       + Lớp nền trang trí, thanh điều hướng, màn hình chào,
         phong bì 3D, thiệp tri ân, footer
   - CSS3: style.css
       + Biến màu chủ đạo, hiệu ứng 3D (perspective,
         transform-style: preserve-3d), animation, responsive
         (breakpoint 820px / 768px / 520px), hỗ trợ
         prefers-reduced-motion
   - JavaScript (ES Module): script.js
       + Máy trạng thái intro -> opening -> card -> closing
       + Canvas cánh hoa, canvas pháo giấy, lớp ký tự code nền
       + Terminal gõ từ từ + thanh tiến trình
       + Web Audio API (music box), Share API + clipboard fallback
       + Toast thông báo, quản lý focus, khóa chống bấm đúp

=====================================================================
6. LƯU Ý KHI NỘP BÀI
=====================================================================
   - Toàn bộ mã nguồn và tài nguyên nằm gọn trong 1 file .zip này.
   - Bản trực tuyến (GitHub Pages) là bản chính thức để thầy cô
     và ban chấm điểm xem trực tiếp, cập nhật tự động theo mã nguồn.
   - Sản phẩm: LETTER TO TEACHERS.EXE — Thiệp tri ân 20/11
     Khoa Công nghệ thông tin — TDTU

=====================================================================
Hạn nộp: 18/11/2026 - 21/11/2026
=====================================================================
