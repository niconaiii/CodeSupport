import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input, InputNumber, Select, Switch, Button } from "antd";
import { useServiceCategories } from "../hooks/useServiceCategories";
import type { IService } from "../types/service";

// ==================== THÊM MỚI: Định nghĩa kiểu dữ liệu an toàn cho Form dịch vụ ====================
export interface ServiceFormValues {
    name: string;
    category_id: number | undefined;
    description: string;
    price: number;
    duration_minutes: number;
    is_deposit_required: boolean;
    deposit_percent: number;
    status: string;
}
// ====================================================================================================

interface ServiceFormProps {
    initialValues?: IService | null;
    onSubmit: (values: ServiceFormValues) => void;
    submitting?: boolean;
}

export default function ServiceForm({ initialValues, onSubmit, submitting }: ServiceFormProps) {
    const { data: categories = [], isLoading: isLoadingCategories } = useServiceCategories();

    // CẬP NHẬT: Ép kiểu dữ liệu strict cho useForm bằng <ServiceFormValues> giúp ngăn lỗi gán sai kiểu category_id
    const { control, handleSubmit, reset, watch } = useForm<ServiceFormValues>({
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

    // CẬP NHẬT: Thay đổi cơ chế đồng bộ dữ liệu, map thủ công tường minh từng trường 
    // XÓA BỎ: Loại bỏ hoàn toàn cơ chế giải rải rộng (...initialValues) cũ để loại bỏ ID thừa kế, tránh lỗi TypeScript gạch đỏ
    // XÓA BỎ: Loại bỏ hoàn toàn trường created_at và DatePicker vì interface IService gốc không quản lý trường này
    useEffect(() => {
        if (initialValues) {
            reset({
                name: initialValues.name,
                category_id: initialValues.category_id,
                description: initialValues.description || "",
                price: initialValues.price,
                duration_minutes: initialValues.duration_minutes,
                is_deposit_required: initialValues.is_deposit_required,
                deposit_percent: initialValues.deposit_percent || 0,
                status: initialValues.status || "ACTIVE",
            });
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

                {/* Danh mục thuộc về */}
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

            {/* Switch đặt cọc */}
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

            {/* Khung nhập phần trăm cọc */}
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

            {/* Mô tả ngắn */}
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

            <div className="flex justify-end pt-4 border-t border-gray-100 mt-2">
                <Button type="primary" htmlType="submit" loading={submitting} className="h-10 px-6 font-medium rounded-md">
                    {initialValues ? "Lưu thay đổi" : "Tạo dịch vụ mới"}
                </Button>
            </div>
        </form>
    );
}