import { useState } from "react";
// CẬP NHẬT: Import trực tiếp message, notification static và các icon cần dùng
import { Button, Table, Space, Popconfirm, message, notification } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { isAxiosError } from "axios";
import {
    useCreateServiceCategory,
    useServiceCategories,
    // THÊM MỚI: Import thêm hook cập nhật và xóa
    useDeleteServiceCategory,
    useUpdateServiceCategory
} from "../../../../hooks/useServiceCategories";
import CategoryFormModal, {
    type CategoryFormValues,
} from "../../../../components/service/CategoryFormModal";
import type { IServiceCategory } from "../../../../types/service";

const formatDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const extractErrorMessage = (err: unknown): string => {
    if (isAxiosError(err)) {
        const data = err.response?.data as { message?: string | string[] } | undefined;
        const msg = data?.message;
        if (typeof msg === "string") return msg;
        if (Array.isArray(msg) && msg.length) return msg[0];
        if (err.message) return err.message;
    } else if (err instanceof Error) {
        return err.message;
    }
    return "Có lỗi xảy ra, vui lòng thử lại";
};

export default function ServiceCategoryListPage() {
    // XÓA BỎ: const { message, notification } = App.useApp(); (Dòng này gây lỗi hiển thị)

    const { data: categories = [], isLoading } = useServiceCategories();
    const createMutation = useCreateServiceCategory();
    
    // THÊM MỚI: Hook xử lý Update và Delete
    const updateMutation = useUpdateServiceCategory();
    const deleteMutation = useDeleteServiceCategory();

    const [open, setOpen] = useState(false);
    
    // THÊM MỚI: State lưu trữ danh mục đang được chọn để sửa
    const [selectedCategory, setSelectedCategory] = useState<IServiceCategory | null>(null);

    // CẬP NHẬT: Reset category về null khi mở form thêm mới
    const handleOpenCreate = () => {
        setSelectedCategory(null);
        setOpen(true);
    };

    // THÊM MỚI: Hàm xử lý khi bấm nút Sửa
    const handleOpenEdit = (category: IServiceCategory) => {
        setSelectedCategory(category);
        setOpen(true);
    };

    // CẬP NHẬT: Chặn đóng modal nếu đang gửi API và clear state khi đóng
    const handleClose = () => {
        if (createMutation.isPending || updateMutation.isPending) return;
        setOpen(false);
        setSelectedCategory(null);
    };

    // THÊM MỚI: Hàm xử lý xóa danh mục
    const handleDelete = (id: number) => {
        deleteMutation.mutate(id, {
            onSuccess: () => message.success("Đã xóa danh mục thành công"),
            onError: (err) => message.error(extractErrorMessage(err))
        });
    };

    // CẬP NHẬT: Hàm submit phân tách rõ rệt giữa hai chế độ Thêm mới / Cập nhật
    const handleSubmit = (values: CategoryFormValues) => {
        if (selectedCategory) {
            // Chế độ: SỬA
            updateMutation.mutate({ id: selectedCategory.id, payload: values }, {
                onSuccess: () => {
                    message.success("Cập nhật danh mục thành công");
                    handleClose();
                },
                onError: (err) => message.error(extractErrorMessage(err))
            });
        } else {
            // Chế độ: THÊM MỚI
            createMutation.mutate(values, {
                onSuccess: (created) => {
                    message.success(`Đã thêm danh mục "${created.name}" thành công`);
                    notification.success({
                        message: "Thêm danh mục thành công",
                        description: `Danh mục "${created.name}" đã được lưu vào cơ sở dữ liệu.`,
                        placement: "topRight",
                        duration: 3,
                    });
                    handleClose();
                },
                onError: (err) => {
                    const msg = extractErrorMessage(err);
                    message.error(msg);
                    notification.error({
                        message: "Thêm danh mục thất bại",
                        description: msg,
                        placement: "topRight",
                        duration: 4,
                    });
                },
            });
        }
    };

    const columns: ColumnsType<IServiceCategory> = [
        { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id },
        {
            title: "Tên danh mục",
            dataIndex: "name",
            render: (name: string) => <strong className="text-gray-800">{name}</strong>,
        },
        { title: "Mô tả", dataIndex: "description", ellipsis: true },
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            width: 140,
            align: "center",
            render: formatDate,
        },
        {
            // THÊM MỚI: Cột hành động chứa 2 nút Sửa và Xóa ở phía bên phải
            title: "Hành động",
            key: "actions",
            width: 120,
            align: "center",
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleOpenEdit(record)} 
                        className="text-blue-600 hover:text-blue-800" 
                    />
                    <Popconfirm 
                        title="Bạn có chắc chắn muốn xóa danh mục này?" 
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            {/* CẬP NHẬT: Thay thế các thẻ div row/col Bootstrap bằng hệ thống Flex/Grid của Tailwind CSS */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h4 className="font-semibold text-xl text-gray-800 mb-1">Quản lý danh mục dịch vụ</h4>
                    <p className="text-gray-500 text-sm">Phân loại các dịch vụ của tiệm theo nhóm</p>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate} className="h-10 px-4 rounded-md">
                    Thêm danh mục
                </Button>
            </div>

            {/* CẬP NHẬT: Class của thẻ bao ngoài thành Tailwind */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <Table
                    rowKey="id"
                    loading={isLoading}
                    columns={columns}
                    dataSource={categories}
                    pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t}` }}
                />
            </div>

            <CategoryFormModal
                mode={selectedCategory ? "edit" : "create"}
                // THÊM MỚI: Truyền dữ liệu danh mục hiện tại vào prop initialValues của Modal
                initialValues={selectedCategory} 
                open={open}
                submitting={createMutation.isPending || updateMutation.isPending}
                onCancel={handleClose}
                onSubmit={handleSubmit}
            />
        </>
    );
}