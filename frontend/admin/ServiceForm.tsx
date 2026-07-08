import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
// CẬP NHẬT: Import thêm DatePicker từ Ant Design
import { Input, InputNumber, Select, Switch, Button, DatePicker } from "antd"; 
import { useServiceCategories } from "../hooks/useServiceCategories";
import type { IService } from "../types/service";
// THÊM MỚI: Import dayjs để xử lý định dạng ngày tháng cho DatePicker
import dayjs from "dayjs"; 

interface ServiceFormProps {
    initialValues?: IService | null; // Bưu kiện dữ liệu cũ từ ServiceListPage truyền xuống khi Sửa
    onSubmit: (values: any) => void;
    submitting?: boolean;
}

export default function ServiceForm({ initialValues, onSubmit, submitting }: ServiceFormProps) {
    // Gọi API lấy danh sách danh mục để đổ vào thẻ chọn Select
    const { data: categories = [], isLoading: isLoadingCategories } = useServiceCategories();

    // 1. Khởi tạo cấu trúc form bằng React Hook Form
    const { control, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            name: "",
            category_id: undefined,
            description: "",
            price: 0,
            duration_minutes: 30,
            is_deposit_required: false,
            deposit_percent: 0,
            status: "ACTIVE",
            created_at: "", // THÊM MỚI: Khai báo trường ngày tạo trong form dịch vụ
        },
    });

    // 2. CƠ CHẾ HOẠT ĐỘNG CỦA initialValues QUA useEffect
    useEffect(() => {
        if (initialValues) {
            // ==================== CHẾ ĐỘ SỬA ====================
            // Nếu có dữ liệu cũ gửi xuống -> bóc bưu kiện và gọi reset() đổ đầy vào các ô nhập
            reset({
                ...initialValues,
                category_id: initialValues.category_id || undefined,
                // Chuyển đổi dữ liệu ngày từ API (ISO String) thành chuỗi đơn giản YYYY-MM-DD
                created_at: initialValues.created_at ? dayjs(initialValues.created_at).format("YYYY-MM-DD") : "",
            });
        } else {
            // ==================== CHẾ ĐỘ THÊM MỚI ====================
            // Nếu initialValues trống -> reset form về trạng thái ban đầu và lấy ngày hôm nay làm mặc định
            reset({
                name: "",
                category_id: undefined,
                description: "",
                price: 0,
                duration_minutes: 30,
                is_deposit_required: false,
                deposit_percent: 0,
                status: "ACTIVE",
                created_at: dayjs().format("YYYY-MM-DD"), // Mặc định là ngày hôm nay
            });
        }
    }, [initialValues, reset]); // Lắng nghe bưu kiện initialValues, cứ thay đổi là useEffect tự chạy để làm mới form

    // Theo dõi trạng thái Switch để ẩn/hiện ô nhập phần trăm cọc tiền
    const isDepositRequired = watch("is_deposit_required");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tên dịch vụ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="text-red-500 mr-1">*</span>Tên dịch vụ
                    </label>
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: "Vui lòng nhập tên dịch vụ" }}
                        render={({ field, fieldState }) => (
                            <>
                                <Input {...field} placeholder="VD: Cắt tạo kiểu Undercut" status={fieldState.error ? "error" : ""} className="h-10 rounded-md" />
                                {fieldState.error && <span className="text-red-500 text-xs mt-1 block">{fieldState.error.message}</span>}
                            </>
                        )}
                    />
                </div>

                {/* Danh mục dịch vụ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="text-red-500 mr-1">*</span>Danh mục thuộc về
                    </label>
                    <Controller
                        name="category_id"
                        control={control}
                        rules={{ required: "Vui lòng chọn danh mục cho dịch vụ" }}
                        render={({ field, fieldState }) => (
                            <>
                                <Select
                                    {...field}
                                    className="w-full h-10"
                                    placeholder="Chọn một danh mục nhóm"
                                    loading={isLoadingCategories}
                                    status={fieldState.error ? "error" : ""}
                                    options={categories.map((c) => ({ label: c.name, value: c.id }))}
                                />
                                {fieldState.error && <span className="text-red-500 text-xs mt-1 block">{fieldState.error.message}</span>}
                            </>
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Giá dịch vụ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="text-red-500 mr-1">*</span>Giá dịch vụ (VNĐ)
                    </label>
                    <Controller
                        name="price"
                        control={control}
                        rules={{ required: "Vui lòng nhập giá tiền", min: { value: 0, message: "Giá không được nhỏ hơn 0" } }}
                        render={({ field, fieldState }) => (
                            <>
                                <InputNumber 
                                    {...field} 
                                    className="w-full h-10 flex items-center rounded-md" 
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 
                                    status={fieldState.error ? "error" : ""} 
                                />
                                {fieldState.error && <span className="text-red-500 text-xs mt-1 block">{fieldState.error.message}</span>}
                            </>
                        )}
                    />
                </div>

                {/* Thời gian thực hiện */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="text-red-500 mr-1">*</span>Thời gian thực hiện (Phút)
                    </label>
                    <Controller
                        name="duration_minutes"
                        control={control}
                        rules={{ required: "Vui lòng nhập số phút thực hiện" }}
                        render={({ field }) => (
                            <InputNumber {...field} min={5} step={5} className="w-full h-10 flex items-center rounded-md" />
                        )}
                    />
                </div>
            </div>

            {/* ==================== TRƯỜNG THÊM MỚI: Ô CHỌN NGÀY THÁNG ==================== */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày áp dụng/Ngày tạo</label>
                <Controller
                    name="created_at"
                    control={control}
                    render={({ field }) => (
                        <DatePicker
                            className="w-full h-10 rounded-md"
                            placeholder="Chọn ngày áp dụng"
                            // Chuyển chuỗi YYYY-MM-DD từ react-hook-form thành object dayjs để DatePicker hiển thị
                            value={field.value ? dayjs(field.value) : null}
                            // Khi chọn ngày mới, format ngược lại thành chuỗi YYYY-MM-DD gửi vào form state
                            onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                            format="DD/MM/YYYY" // Giao diện hiển thị thân thiện: Ngày/Tháng/Năm
                        />
                    )}
                />
            </div>

            {/* Trạng thái yêu cầu đặt cọc */}
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Controller
                    name="is_deposit_required"
                    control={control}
                    render={({ field }) => (
                        <Switch checked={field.value} onChange={field.onChange} />
                    )}
                />
                <span className="text-sm font-medium text-gray-700">Yêu cầu khách hàng thanh toán đặt cọc trước trực tuyến</span>
            </div>

            {/* Hiện ô nhập phần trăm nếu kích hoạt Switch đặt cọc */}
            {isDepositRequired && (
                <div className="transition-all duration-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phần trăm tiền cọc cần trả trước (%)</label>
                    <Controller
                        name="deposit_percent"
                        control={control}
                        render={({ field }) => (
                            <InputNumber {...field} min={1} max={100} className="w-full h-10 flex items-center rounded-md" placeholder="Nhập từ 1 đến 100" />
                        )}
                    />
                </div>
            )}

            {/* Mô tả dịch vụ */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn về dịch vụ</label>
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <Input.TextArea {...field} rows={3} placeholder="Mô tả các bước thực hiện..." className="rounded-lg" />
                    )}
                />
            </div>

            {/* Chân Form chứa nút bấm */}
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-2">
                <Button type="primary" htmlType="submit" loading={submitting} className="h-10 px-6 font-medium rounded-md">
                    {initialValues ? "Lưu thay đổi" : "Tạo dịch vụ mới"}
                </Button>
            </div>
        </form>
    );
}