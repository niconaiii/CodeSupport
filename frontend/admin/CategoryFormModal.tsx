import { useEffect } from "react";
import { Modal, Input, Button, DatePicker } from "antd"; // CẬP NHẬT: Thêm DatePicker từ Ant Design
import { useForm, Controller } from "react-hook-form";
import type { IServiceCategory } from "../../../types/service";
import dayjs from "dayjs"; // THÊM MỚI: Dùng để format và hiển thị ngày tháng cho AntD DatePicker

interface CategoryFormModalProps {
    open: boolean;
    mode: "create" | "edit";
    initialValues?: IServiceCategory | null; // Nơi nhận bưu kiện dữ liệu từ trang cha gửi xuống
    submitting: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
}

export default function CategoryFormModal({
    open,
    mode,
    initialValues,
    submitting,
    onCancel,
    onSubmit,
}: CategoryFormModalProps) {
    
    // 1. Khởi tạo cấu trúc dữ liệu mặc định của form bằng React Hook Form
    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            name: "",
            description: "",
            created_at: "", // THÊM MỚI: Khai báo trường dữ liệu ngày tạo trong Form
        },
    });

    // 2. MINH HỌA DÒNG CHẠY CỦA initialValues QUA useEffect
    useEffect(() => {
        if (open) { // Chỉ xử lý khi Modal được mở ra
            if (initialValues) {
                // ==================== CHẾ ĐỘ SỬA ====================
                // Nếu bưu kiện initialValues có dữ liệu cũ -> Tiến hành dùng reset() để đổ ngược vào form
                reset({
                    name: initialValues.name || "",
                    description: initialValues.description || "",
                    // Đảm bảo dữ liệu ngày tháng từ API trả về được đưa vào đúng trường dưới dạng String (YYYY-MM-DD)
                    created_at: initialValues.created_at ? dayjs(initialValues.created_at).format("YYYY-MM-DD") : "",
                });
            } else {
                // ==================== CHẾ ĐỘ THÊM MỚI ====================
                // Nếu initialValues trống rỗng -> Tiến hành reset form về trạng thái trống hoàn toàn
                reset({
                    name: "",
                    description: "",
                    created_at: dayjs().format("YYYY-MM-DD"), // THÊM MỚI: Khi thêm mới, mặc định chọn sẵn ngày hôm nay cho tiện lợi
                });
            }
        }
    }, [initialValues, open, reset]); // Mỗi khi bưu kiện thay đổi hoặc đóng/mở modal, useEffect này sẽ lập tức chạy lại

    const handleFormSubmit = (data: any) => {
        onSubmit(data); // Đẩy dữ liệu sạch đã qua kiểm duyệt lên trang cha để gọi API
    };

    return (
        <Modal
            title={mode === "edit" ? "Cập nhật danh mục dịch vụ" : "Thêm danh mục dịch vụ"}
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
            width={500}
        >
            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 mt-4">
                {/* Trường nhập: Tên danh mục */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="text-red-500 mr-1">*</span>Tên danh mục
                    </label>
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: "Vui lòng nhập tên danh mục" }}
                        render={({ field, fieldState }) => (
                            <>
                                <Input {...field} placeholder="Ví dụ: Cắt tóc nam" status={fieldState.error ? "error" : ""} className="h-10 rounded-md" />
                                {fieldState.error && <span className="text-red-500 text-xs mt-1 block">{fieldState.error.message}</span>}
                            </>
                        )}
                    />
                </div>

                {/* Trường nhập: Mô tả */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <Input.TextArea {...field} rows={3} placeholder="Mô tả ngắn gọn đặc điểm phân loại..." className="rounded-md" />
                        )}
                    />
                </div>

                {/* ==================== TRƯỜNG THÊM MỚI: Ô CHỌN NGÀY THÁNG ==================== */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo danh mục</label>
                    <Controller
                        name="created_at"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                className="w-full h-10 rounded-md"
                                placeholder="Chọn ngày tháng"
                                // Vì Ant Design DatePicker bắt buộc nhận giá trị là 1 object dayjs chứ không nhận chuỗi String, 
                                // nên ta dùng dayjs(field.value) để chuyển đổi chuỗi từ React Hook Form thành dạng hiển thị cho DatePicker
                                value={field.value ? dayjs(field.value) : null}
                                // Khi người dùng chọn ngày mới, ta format ngày đó thành chuỗi chuẩn "YYYY-MM-DD" để lưu ngược vào React Hook Form
                                onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                                format="DD/MM/YYYY" // Định dạng hiển thị cho người dùng xem trên giao diện là Ngày/Tháng/Năm
                            />
                        )}
                    />
                </div>

                {/* Vùng chứa các nút thao tác */}
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-2">
                    <Button onClick={onCancel} className="h-10 px-4 rounded-md">
                        Hủy bỏ
                    </Button>
                    <Button type="primary" htmlType="submit" loading={submitting} className="h-10 px-6 font-medium rounded-md">
                        {mode === "edit" ? "Lưu thay đổi" : "Thêm danh mục"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}