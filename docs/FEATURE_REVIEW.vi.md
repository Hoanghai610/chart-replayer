# Đánh giá tính năng Chart Replayer

Ngày 13/10/2026. Đánh giá theo mục tiêu: tạo một clip chart rõ ràng và chia sẻ được với ít thao tác. Đây là đề xuất ưu tiên sản phẩm, chưa phải quyết định xóa tính năng. Màn đầu layout 1 (Mindtrip) đã được chọn và triển khai. Sound C (Glass & Air) đã được chọn và làm mặc định; có nút Preview sound trong Effects.

| Mức độ | Tính năng | Hiện trạng | Đề xuất | Lý do |
|---|---|---|---|---|
| P0 · Bắt buộc | Nhập token và tải dữ liệu Birdeye | Có | Giữ | Điểm bắt đầu của toàn bộ luồng; cần báo địa chỉ sai, thiếu key và lỗi tải. |
| P0 · Bắt buộc | Kết nối API key khi cần | Có | Giữ, hiển thị đúng lúc | Chỉ yêu cầu khi người dùng tải dữ liệu thật và chưa có key server/visitor. |
| P0 · Bắt buộc | Chọn khoảng thời gian + kéo timeline | Có | Giữ | Đây là thao tác chính để tìm khoảnh khắc cần kể. |
| P0 · Bắt buộc | Preview, play/pause, tua và bắt đầu lại | Có | Giữ | Người dùng phải xem được chính xác clip trước khi xuất. |
| P0 · Bắt buộc | Xuất video, tiến độ, hủy và tải về | Có | Giữ | Đầu ra chính của sản phẩm; cần tránh tải nhầm bản cũ sau khi đổi cài đặt. |
| P0 · Bắt buộc | Giá trị mở/hiện tại/đóng và % thay đổi | Có | Giữ | Cung cấp kết luận dễ đọc; không gọi biến động giá là lợi nhuận ví. |
| P0 · Bắt buộc | Loading, lỗi, retry và nhãn Sample data | Có | Giữ | Giúp phân biệt dữ liệu thật/mẫu và hiểu vì sao chưa thể xuất. |
| P1 · Nên có | Chọn Line / Candles | Đã thêm | Giữ trong Format | Line phù hợp người xem phổ thông; nến phù hợp người cần OHLC. |
| P1 · Nên có | Video Light / Dark + màu brand | Đã thêm | Giữ trong Format | Cùng bố cục và khả năng đọc ở cả hai mode, áp dụng vào file xuất. |
| P1 · Nên có | Tỷ lệ 4:5, 9:16, 16:9, 1:1 | Có | Giữ, mặc định 4:5 | Phục vụ các kênh chia sẻ; không cần bắt chọn ngay ở màn đầu. |
| P1 · Nên có | Thời lượng clip | Có | Giữ preset 10/15/30s; tùy chỉnh mở rộng | Các mốc phổ biến đủ cho phần lớn nhu cầu, slider chi tiết là phụ. |
| P1 · Nên có | Big trades + Smart money + KOLs | Có | Giữ trong Tags | Các lớp giúp giải thích ai tham gia vào diễn biến giá. |
| P1 · Nên có | Ngưỡng giao dịch lớn + Auto | Có | Giữ Auto làm mặc định | Hạn chế nhiễu, người dùng có thể chỉnh khi cần. |
| P1 · Nên có | Marker density + tối đa 3 pin gần nhất | Có | Giữ Balanced mặc định | Giữ câu chuyện dễ theo dõi, tránh nhãn chồng lên biểu đồ. |
| P1 · Nên có | Một callout giao dịch tại một thời điểm | Có | Giữ | Thông tin bổ sung có chỗ riêng, không che chart. |
| P1 · Nên có | Sample replay | Có | Giữ một link duy nhất ở màn đầu | Cho người mới hiểu sản phẩm trước khi chuẩn bị API key. |
| P1 · Nên có | Bật/tắt sound + nghe thử | Có; Sound C đã chọn | Giữ; đã thêm nghe thử preset | Sound là tùy chọn, không cản trở thao tác chính. |
| P2 · Nâng cao | Khoảng thời gian UTC chính xác | Có | Giữ trong phần mở rộng | Hữu ích khi tái hiện sự kiện cụ thể; không cần nổi bật như timeline. |
| P2 · Nâng cao | Chart interval thủ công 1m–1W | Có | Giữ Auto mặc định, mở rộng để chỉnh | Người mới không cần hiểu độ phân giải dữ liệu trước khi tạo clip. |
| P2 · Nâng cao | Market cap axis | Có | Giữ nâng cao | Phụ thuộc nguồn circulating supply; cần mô tả là vốn hóa ước tính theo supply hiện tại. |
| P2 · Nâng cao | Snipers / Dev | Có | Giữ tắt mặc định | Phục vụ câu chuyện chuyên biệt; thêm lớp có thể tăng lượng dữ liệu phải tải. |
| P2 · Nâng cao | Tên ví / địa chỉ ví | Có | Giữ tùy chọn | Có ích để xác định tác nhân; tên dài gây nhiễu trong video nhỏ. |
| P2 · Nâng cao | 30/60 fps | Có | Đề xuất 30 mặc định, 60 nâng cao | 30 fps đủ cho clip chart; 60 fps tăng thời gian render và dung lượng. |
| P2 · Nâng cao | Loop preview / callout duration | Có | Giữ trong Effects | Hữu ích khi tinh chỉnh, không cần đặt ở màn đầu. |
| P2 · Nâng cao | API usage và nguồn dữ liệu | Có | Giữ trong About data | Cần để hiểu chi phí/nguồn; không nên chiếm diện tích editor chính. |
| P2 · Nâng cao | Lưu preset / phiên làm việc | Chưa có | Để đợt sau | Có ích cho người dùng lặp lại nhiều lần, chưa cần để tạo clip đầu tiên. |
| P3 · Nên bỏ khỏi luồng chính | Hai nút xem mẫu ở hai vùng | Đã gom còn một link | Giữ | Cùng một hành động xuất hiện hai lần, tăng phân tâm. |
| P3 · Nên bỏ khỏi màn đầu | Toolbar, timeline trống, Export bị vô hiệu hóa | Đã ẩn đến khi có token | Giữ | Chưa giúp người dùng bắt đầu và làm màn đầu trông phức tạp. |
| P3 · Nên giảm | Headline lớn + mô tả + nhắc ba bước lặp lại | Đã tinh giản | Giữ | Tập trung vào nhập token thay vì giải thích lặp lại. |
| P3 · Không cần mặc định | Meme voice / tiếng tiền / milestone dày | Chỉ còn preset tùy chọn | Đã bỏ khỏi mặc định | Dễ lấn át chart; ưu tiên cue ngắn, thưa hoặc im lặng. |
| P3 · Không cần lúc này | Đăng nhập, workspace, cộng tác, cloud render | Chưa có | Chưa xây | Chưa hỗ trợ trực tiếp mục tiêu tải token → chọn khoảnh khắc → xuất clip. |

Luồng mặc định đề xuất: Nhập token hoặc xem mẫu → chọn thời gian → xem preview → xuất video. Tags, Format và Effects chỉ xuất hiện khi đã tải token. Các cài đặt nâng cao vẫn có thể truy cập, không bị xóa.
