import { useState } from "react";
// CẬP NHẬT: Import thêm Modal, Space, Popconfirm, message và các Icons
import { Button, Table, Tag, Space, Popconfirm, Modal, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { 
    useServices, 
    // THÊM MỚI: Import 3 hook tương tác dữ liệu
    useCreateService, 
    useUpdateService, 
    useDeleteService 
} from "../../../hooks/useService";
import ServiceForm from "../../../components/ServiceForm";
import type { ColumnsType } from "antd/es/table";
import type { IService } from "../../../types/service";

const formatVND = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function ServiceListPage() {
    // XÓA BỎ: const navigate = useNavigate(); (Không chuyển trang nữa)
    
    const { data, isLoading } = useServices();
    
    // THÊM MỚI: Khởi tạo các mutation hook dữ liệu
    const createMutation = useCreateService();
    const updateMutation = useUpdateService();
    const deleteMutation = useDeleteService();

    // THÊM MỚI: Các State kiểm soát đóng mở Modal và lưu trữ dịch vụ được chọn
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<IService | null>(null);

    // THÊM MỚI: Hàm mở modal để thêm mới dịch vụ
    const handleOpenCreate = () => {
        setSelectedService(null);
        setIsModalOpen(true);
    };

    // THÊM MỚI: Hàm mở modal để sửa dịch vụ
    const handleOpenEdit = (service: IService) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    // THÊM MỚI: Hàm đóng modal và dọn dẹp state sạch sẽ
    const handleCloseModal = () => {
        if (createMutation.isPending || updateMutation.isPending) return;
        setIsModalOpen(false);
        setSelectedService(null);
    };

    // THÊM MỚI: Hàm gọi API xử lý yêu cầu xóa dịch vụ
    const handleDelete = (id: number) => {
        deleteMutation.mutate(id, {
            onSuccess: () => message.success("Xóa dịch vụ thành công"),
            onError: () => message.error("Có lỗi xảy ra khi xóa dịch vụ")
        });
    };

    // THÊM MỚI: Hàm xử lý gửi form (Nhận data sạch đã validate từ ServiceForm đưa lên)
    const handleFormSubmit = (values: Omit<IService, "id">) => {
        if (selectedService) {
            // Chế độ: SỬA
            updateMutation.mutate({ id: selectedService.id, payload: values }, {
                onSuccess: () => {
                    message.success("Cập nhật thông tin dịch vụ thành công");
                    handleCloseModal();
                },
                onError: () => message.error("Cập nhật thất bại, vui lòng thử lại")
            });
        } else {
            // Chế độ: THÊM MỚI
            createMutation.mutate(values, {
                onSuccess: () => {
                    message.success("Thêm dịch vụ mới thành công");
                    handleCloseModal();
                },
                onError: () => message.error("Thêm dịch vụ thất bại, vui lòng kiểm tra lại")
            });
        }
    };

    const columns: ColumnsType<IService> = [
        {
            title: "ID",
            dataIndex: "id",
            width: 90,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: "Tên dịch vụ",
            dataIndex: "name",
            render: (name) => <strong className="text-gray-800">{name}</strong>,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            ellipsis: true,
        },
        {
            title: "Giá",
            dataIndex: "price",
            align: "right",
            render: (v) => <span className="text-blue-600 font-semibold">{formatVND(v)}</span>,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: "Thời gian",
            dataIndex: "duration_minutes",
            align: "center",
            render: (v) => <Tag color="blue">{v} phút</Tag>,
        },
        {
            // THÊM MỚI: Cột Hành động được tích hợp ngay bên phải cột Thời gian
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
                        title="Bạn có chắc chắn muốn xóa dịch vụ này?" 
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
            {/* CẬP NHẬT: Layout Bootstrap sang cấu trúc CSS Tailwind */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h4 className="font-semibold text-xl text-gray-800 mb-1">Quản lý dịch vụ</h4>
                    <p className="text-gray-500 text-sm">Danh sách các dịch vụ của tiệm</p>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleOpenCreate} // CẬP NHẬT: Thay đổi hành động từ điều hướng trang sang mở Modal
                    className="h-10 px-4 rounded-md"
                >
                    Thêm dịch vụ
                </Button>
            </div>

            {/* CẬP NHẬT: Sang style Tailwind */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <Table
                    rowKey="id"
                    loading={isLoading}
                    columns={columns}
                    dataSource={data}
                    pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t}` }}
                />
            </div>

            {/* THÊM MỚI: Cấu trúc Modal chứa form nhập liệu để không phải chuyển trang */}
            <Modal
                title={selectedService ? "Cập nhật thông tin dịch vụ" : "Thêm dịch vụ mới"}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null} // Ẩn footer mặc định để tối ưu sử dụng nút bấm tích hợp sẵn bên trong ServiceForm
                destroyOnClose // Tự hủy dữ liệu DOM khi đóng để giữ trạng thái sạch sẽ
                width={650}
            >
                <div className="mt-4">
                    <ServiceForm 
                        initialValues={selectedService} 
                        onSubmit={handleFormSubmit}
                        submitting={createMutation.isPending || updateMutation.isPending}
                    />
                </div>
            </Modal>
        </>
    );
}