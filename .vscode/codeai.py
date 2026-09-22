import os
import sys
from google import genai

# Các phần mở rộng tệp mã nguồn hoặc tài liệu cần quét
VALID_EXTENSIONS = ('.js', '.ts', '.py', '.html', '.css', '.json', '.java', '.cpp', '.h', '.md')
# Các thư mục muốn bỏ qua để tránh rác (như thư mục hệ thống hoặc build)
IGNORE_DIRS = ('node_modules', '.git', 'venv', '__pycache__', 'dist', 'build')

def get_project_context(root_dir):
    project_data = []
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Lọc bỏ các thư mục không cần thiết
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        
        for file in filenames:
            if file.endswith(VALID_EXTENSIONS):
                file_path = os.path.join(dirpath, file)
                relative_path = os.path.relpath(file_path, root_dir)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Đóng gói từng file kèm đường dẫn rõ ràng
                    file_block = f"--- FILE: {relative_path} ---\n{content}\n"
                    project_data.append(file_block)
                except Exception:
                    # Bỏ qua các file lỗi đọc (ví dụ file nhị phân)
                    pass
                    
    return "\n".join(project_data)

def main():
    if len(sys.argv) < 2:
        print("Cách dùng: python codeai.py \"Yêu cầu của bạn cho toàn bộ dự án\"")
        print("Ví dụ: python codeai.py \"Giải thích kiến trúc tổng thể và mối liên kết giữa các file trong dự án này\"")
        return

    prompt = sys.argv[1]
    current_dir = os.getcwd()

    print(f"Đang quét toàn bộ dự án tại: {current_dir} ...")
    project_code = get_project_context(current_dir)

    if not project_code:
        print("Không tìm thấy file mã nguồn hợp lệ nào trong thư mục này!")
        return

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Lỗi: Chưa thiết lập biến môi trường GEMINI_API_KEY!")
        return

    client = genai.Client(api_key=api_key)

    full_content = f"""
    Yêu cầu của tôi cho toàn bộ dự án này: {prompt}

    Dưới đây là toàn bộ mã nguồn của các file trong dự án:
    {project_code}
    """

    print("Đang gửi toàn bộ ngữ cảnh dự án lên Gemini...")
    
    try:
        # Sử dụng mô hình Gemini 2.5 Flash xử lý ngữ cảnh lớn nhanh và chuẩn
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_content,
        )
        
        print("\n================ PHẢN HỒI TỪ AI ================")
        print(response.text)
        print("================================================")
        
    except Exception as e:
        print(f"Lỗi kết nối API: {e}")

if __name__ == "__main__":
    main()