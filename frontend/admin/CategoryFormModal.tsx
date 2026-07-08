import { useEffect } from "react";
import { Modal, Input, Button, DatePicker } from "antd";
import { useForm, Controller } from "react-hook-form";
import type { IServiceCategory } from "../../../types/service";
import dayjs from "dayjs";

// ==================== THÊM MỚI: Định nghĩa kiểu dữ liệu an toàn cho Form ====================
export interface CategoryFormValues {
    name: string;
    description?: string;
    created_at?: string;
}
// ===========================================================================================

interface CategoryFormModalProps {
    open: boolean;
    mode: "create" | "edit";
    initialValues?: IServiceCategory | null;
    submitting: boolean;
    onCancel: () => void;
    onSubmit: (values: CategoryFormValues) => void; // CẬP NHẬT: Đổi từ kiểu 'any' sang strict type 'CategoryFormValues'
}

export default function CategoryFormModal({
    open,
    mode,
    initialValues,
    submitting,
    onCancel,
    onSubmit,
}: CategoryFormModalProps) {
    
    // CẬP NHẬT: Ép kiểu dữ liệu strict cho hook useForm bằng <CategoryFormValues>
    const { control, handleSubmit, reset } = useForm<CategoryFormValues>({
        defaultValues: {
            name: "",
            description: "",
            created_at: "", 
        },
    });

    // CẬP NHẬT: Viết lại logic kiểm soát luồng đóng/mở và bóc tách bưu kiện initialValues dữ liệu cũ
    useEffect(() => {
        if (open) {
            if (initialValues) {
                // Chế độ: SỬA DỮ LIỆU
                reset({
                    name: initialValues.name || "",
                    description: initialValues.description || "",
                    // CẬP NHẬT: Chuyển đổi định dạng chuỗi thời gian trả về từ API sang chuỗi YYYY-MM-DD
                    created_at: initialValues.created_at ? dayjs(initialValues.created_at).format("YYYY-MM-DD") : "",
                });
            } else {
                // Chế độ: THÊM MỚI
                reset({
                    name: "",
                    description: "",
                    created_at: dayjs().format("YYYY-MM-DD"), // THÊM MỚI: Mặc định chọn ngày hiện tại khi mở form tạo mới
                });
            }
        }
    }, [initialValues, open, reset]);

    const handleFormSubmit = (data: CategoryFormValues) => {
        onSubmit(data);
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

                {/* Trường nhập: Mô tả danh mục */}
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

                {/* ==================== THÊM MỚI: Tích hợp ô chọn ngày tháng bằng DatePicker ==================== */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo danh mục</label>
                    <Controller
                        name="created_at"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                className="w-full h-10 rounded-md"
                                placeholder="Chọn ngày tháng"
                                value={field.value ? dayjs(field.value) : null}
                                onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                                format="DD/MM/YYYY"
                            />
                        )}
                    />
                </div>
                {/* ============================================================================================= */}

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