// THÊM MỚI TOÀN BỘ FILE HOÀN CHỈNH BẰNG REACT HOOK FORM & TAILWIND CSS
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input, InputNumber, Select, Switch, Button } from "antd";
import { useServiceCategories } from "../hooks/useServiceCategories";
import type { IService } from "../types/service";

interface ServiceFormProps {
    initialValues?: IService | null; // Nhận thông tin dịch vụ cũ nếu là chế độ Sửa
    onSubmit: (values: any) => void;
    submitting?: boolean;
}

export default function ServiceForm({ initialValues, onSubmit, submitting }: ServiceFormProps) {
    // Gọi API lấy danh sách danh mục đổ vào thẻ chọn Select ô danh mục
    const { data: categories = [], isLoading: isLoadingCategories } = useServiceCategories();

    // Khởi tạo trạng thái form và các điều kiện bắt buộc bằng React Hook Form
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
        },
    });

    // Lắng nghe biến initialValues: Nếu có dữ liệu cũ -> reset form và đổ data vào. Nếu không -> làm trống form
    useEffect(() => {
        if (initialValues) {
            reset(initialValues);
        } else {
            reset({
                name: "",
                category_id: undefined,
                description: "",
                price: 0,
                duration_minutes: 30,
                is_deposit_required: false,
                deposit_percent: 0,
                status: "ACTIVE",
            });
        }
    }, [initialValues, reset]);

    // Theo dõi trạng thái của Switch cọc tiền để ẩn/hiện ô nhập phần trăm tương ứng
    const isDepositRequired = watch("is_deposit_required");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Trường: Tên dịch vụ */}
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
                                <Input {...field} placeholder="VD: Cắt tạo kiểu Undercut" status={fieldState.error ? "error" : ""} className="h-10" />
                                {fieldState.error && <span className="text-red-500 text-xs mt-1 block">{fieldState.error.message}</span>}
                            </>
                        )}
                    />
                </div>

                {/* Trường: Danh mục dịch vụ */}
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
                {/* Trường: Giá dịch vụ */}
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
                                    className="w-full h-10 flex items-center" 
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 
                                    status={fieldState.error ? "error" : ""} 
                                />
                                {fieldState.error && <span className="text-red-500 text-xs mt-1 block">{fieldState.error.message}</span>}
                            </>
                        )}
                    />
                </div>

                {/* Trường: Thời gian thực hiện */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="text-red-500 mr-1">*</span>Thời gian thực hiện (Phút)
                    </label>
                    <Controller
                        name="duration_minutes"
                        control={control}
                        rules={{ required: "Vui lòng nhập số phút thực hiện" }}
                        render={({ field }) => (
                            <InputNumber {...field} min={5} step={5} className="w-full h-10 flex items-center" />
                        )}
                    />
                </div>
            </div>

            {/* Trạng thái yêu cầu đặt cọc */}
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 transition-all">
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
                <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phần trăm tiền cọc cần trả trước (%)</label>
                    <Controller
                        name="deposit_percent"
                        control={control}
                        render={({ field }) => (
                            <InputNumber {...field} min={1} max={100} className="w-full h-10 flex items-center" placeholder="Nhập từ 1 đến 100" />
                        )}
                    />
                </div>
            )}

            {/* Trường: Mô tả dịch vụ */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn về dịch vụ</label>
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <Input.TextArea {...field} rows={3} placeholder="Mô tả các bước thực hiện hoặc quà tặng đi kèm nếu có..." className="rounded-lg" />
                    )}
                />
            </div>

            {/* Khu vực nút bấm xác nhận ở chân Form */}
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-2">
                <Button type="primary" htmlType="submit" loading={submitting} className="h-10 px-6 font-medium rounded-md">
                    {initialValues ? "Lưu thay đổi" : "Tạo dịch vụ mới"}
                </Button>
            </div>
        </form>
    );
}