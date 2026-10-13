# Đề xuất luồng bắt đầu Chart Replayer

Ngày: 13/10/2026. Trạng thái: đề xuất để duyệt, chưa triển khai thay đổi màn bắt đầu.

## Kết luận

Đề xuất **cho thấy đầu ra trước, rồi hướng dẫn 2 quyết định: chọn token và chọn đoạn lịch sử**. Sau đó mới mở đầy đủ công cụ chỉnh video. Mục tiêu là giảm bất ngờ và giúp người mới hiểu mình đang tạo gì; đây là giả thuyết UX cần kiểm chứng, chưa có số liệu conversion.

## Luồng hiện tại đã kiểm tra

1. **Mở app — cần cải thiện.** Form ngắn, một CTA rõ và có sample, nhưng không có hình/video đầu ra để giải thích sản phẩm. Người dùng phải có sẵn mint address. Ảnh: `start-flow-01-entry.png`.
2. **Nhập sai địa chỉ — cơ bản tốt.** Lỗi xuất hiện cạnh input và không mở yêu cầu key. Hướng dẫn hiện tại vẫn chỉ nói “valid Solana token mint address”, chưa chỉ cách lấy địa chỉ. Ảnh: `start-flow-02-invalid.png`.
3. **Nhập đúng địa chỉ khi thiếu key — cần cải thiện nhất.** Sau CTA “Create replay”, app mở modal kết nối Birdeye và dẫn ra ngoài để lấy key. Đây là điều kiện chưa được thông báo ngay trước hành động. Input được giữ lại; không có key nào được nhập trong lần kiểm tra này. Ảnh: `start-flow-03-api-key.png`.
4. **Chọn sample — hoạt động.** “Continue with sample data” mở editor và tải chart. Panel Period mới dễ đọc hơn, nhưng người mới được đưa thẳng vào đủ 4 nhóm công cụ. Chưa có hành động hướng dẫn để đi từ đoạn lịch sử đến video đầu tiên. Ảnh: `start-flow-04-editor.png`.

Ảnh được chụp trong lượt rà soát này tại 1280 × 720, đã mở và kiểm tra. Thư mục: `/Users/hoanghai/.codex/visualizations/2026/10/13/01a13325-5a7a-76f0-b24c-24688f5b01dd/`. Bảng tổng hợp: `start-flow-audit.png`.

![Luồng hiện tại](/Users/hoanghai/.codex/visualizations/2026/10/13/01a13325-5a7a-76f0-b24c-24688f5b01dd/start-flow-audit.png)

Giới hạn: chưa kiểm tra dữ liệu thật với key hợp lệ, latency/429 thực tế, screen reader hoặc analytics funnel. Không thể kết luận tỷ lệ bỏ cuộc từ ảnh chụp.

## Tham khảo Mobbin và cách áp dụng

- [VEED — Creating a new project](https://mobbin.com/flows/670544cb-ae16-4545-87dc-35f698595c4f): ảnh đầu cho thấy modal nhập nguồn; ảnh tiếp theo hiển thị media và trạng thái upload ngay trong editor. Áp dụng nguyên tắc chọn nguồn trước rồi hiện nội dung cùng tiến trình. Không bê toàn bộ toolbar của VEED vào màn bắt đầu.
- [Uniswap — Searching tokens](https://mobbin.com/flows/6d7e4ff6-bfc8-4ffe-9c7f-d021b47329a6): người dùng lọc danh sách và vẫn thấy icon, tên và symbol trong kết quả. Áp dụng nhận diện token trước khi tiếp tục; tìm theo tên cần bổ sung data/API, chưa có trong app hiện tại.
- [Base — Select Coin](https://mobbin.com/screens/acbee0d4-4204-4950-9907-99b945224ed4): dialog có ô tìm, bộ lọc network và kết quả coin có nhận diện. Chart Replayer chỉ hỗ trợ Solana nên không cần thêm bộ lọc chain; dùng network label cố định để xác nhận đúng nguồn.

Đây là suy luận thiết kế từ các màn đã xem, không phải bằng chứng các luồng này chuyển đổi tốt hơn Chart Replayer.

## Luồng khuyến nghị

**Mở app → chọn token/try sample → tải biểu đồ → chọn đoạn + xem replay → tùy chỉnh hoặc xuất video.**

### 1. Màn bắt đầu: hiểu đầu ra và chọn nguồn

- Desktop: form bên trái, một video mẫu ngắn bên phải. Mobile: form và hành động trước, preview nhỏ phía dưới.
- Tiêu đề cụ thể: “Turn a token chart into a video.”
- Input ban đầu hỗ trợ mint address, kèm ví dụ và hướng dẫn lấy địa chỉ. Hỗ trợ Birdeye link có thể bổ sung bằng parser; không quảng cáo tìm theo tên trước khi có API tìm kiếm.
- CTA chính: **Load chart**, vì kết quả của bước này là biểu đồ, chưa phải video hoàn chỉnh.
- Một lựa chọn phụ **Try a sample**, ghi rõ “Sample data · no API key needed”. Video minh họa gắn nhãn sample; không trình bày giá giả như dữ liệu thật.
- Nếu có app key: tải trực tiếp. Nếu không: thông báo trước CTA rằng real data cần kết nối Birdeye; mở vùng kết nối ngay trong form, giữ nguyên token đã nhập. Không tạo modal bất ngờ sau lời hứa Create replay.
- Khi tải xong: cho thấy icon, tên, symbol, Solana và địa chỉ rút gọn để người dùng kiểm tra đúng token.

### 2. Chọn đoạn và thấy replay ngay

- Giữ người dùng trong workspace với một nhóm thiết lập chính: **Period**.
- Mặc định 7 ngày nếu đủ dữ liệu, hoặc toàn bộ lịch sử với token mới; video 15 giây, 4:5, các lựa chọn khác theo mặc định hiện tại.
- Chart lịch sử, presets và đoạn được chọn nằm gần nhau. Tóm tắt “7 days of history → 15-second video”, UTC rõ ràng.
- Preview đã sẵn sàng để phát; không tự phát âm thanh.
- CTA **Customize & export** mở đầy đủ Tags / Format / Effects. Người dùng có kinh nghiệm vẫn có thể vào editor ngay; không thêm một màn xác nhận token bắt buộc.

### 3. Chỉnh video và xuất

- Giữ editor hiện tại, gồm Light/Dark card, background solid/gradient/custom và sound C.
- Chỉ lúc này mới cần đầy đủ tỷ lệ, thời lượng, FPS, layer và effects.
- Export vẫn là render → preview → save; đổi một thiết lập làm video đã render hết hiệu lực.

## Những trạng thái phải thiết kế cùng luồng

| Tình huống | Phản hồi đề xuất |
| --- | --- |
| Sai địa chỉ | Lỗi cạnh input, ví dụ đúng và cách lấy mint address. |
| Token không tồn tại | Giữ input; nêu app chỉ hỗ trợ Solana, cho sửa địa chỉ. |
| Thiếu/không hợp lệ key | Vùng kết nối inline, giữ token và lựa chọn sample. |
| Đang tải | Các trạng thái thật: tìm token, lấy lịch sử, chuẩn bị replay; không dùng phần trăm giả. |
| Mạng lỗi/rate limit | Retry giữ nguyên đầu vào; giải thích ngắn và thời gian chờ nếu server cung cấp. |
| Token ít lịch sử | Tự chọn toàn bộ dữ liệu khả dụng và nói rõ khoảng thời gian. |
| Quay lại đổi token | Nút có viền/icon rõ; chỉ thay token sau khi tải token mới thành công. |

## Mức ưu tiên

- **P0 cho lượt UX tiếp theo:** preview đầu ra, CTA đúng kết quả, thông báo key sớm, kết nối inline, giữ đầu vào khi lỗi, chọn period tập trung trước khi mở full editor.
- **P1:** nhận Birdeye link, recent tokens trong phiên, skeleton và retry theo trạng thái.
- **P2:** tìm theo tên/symbol, token nổi bật, template gallery. Các mục này cần data/API hoặc nội dung; chưa cần cho luồng cốt lõi.

Phương án thay thế là wizard nhiều màn Token → Period → Style → Export. Wizard dễ giải thích từng bước nhưng tăng số lần chuyển màn và làm chậm người dùng quay lại. Đề xuất chỉ hướng dẫn Token + Period, rồi dùng editor hiện có.

## Cách đánh giá sau triển khai

Theo dõi thời gian đến replay đầu tiên, tỷ lệ hoàn tất Load chart, tỷ lệ dừng ở kết nối key, tỷ lệ vào sample rồi export, và lỗi token. Test với người mới xem họ có phân biệt được khoảng lịch sử, thời lượng video và chart detail hay không. Không đặt mục tiêu phần trăm cải thiện khi chưa có baseline.
