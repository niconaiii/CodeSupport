import { useState } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Popconfirm,
  message,
  Drawer,
  Image,
  Select
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useForm, Controller } from "react-hook-form";
import { useHairstyles, useCreateHairstyle, useDeleteHairstyle } from "../../../hooks/useHairstyles";
import type { IHairstyle, IHairstylePayload } from "../../../types/hairstyle";

const { Search, TextArea } = Input;

const FACE_SHAPE_OPTIONS = [
  { value: "OVAL", label: "Trái xoan (Oval)" },
  { value: "ROUND", label: "Tròn (Round)" },
  { value: "SQUARE", label: "Vuông (Square)" },
  { value: "HEART", label: "Trái tim (Heart)" },
  { value: "DIAMOND", label: "Kim cương (Diamond)" },
  { value: "LONG", label: "Dài (Long)" },
];

export default function HairstyleGalleryPage() {
  const { data: hairstyles = [], isLoading } = useHairstyles();
  const { mutate: createHairstyle, isPending: isCreating } = useCreateHairstyle();
  const { mutate: deleteHairstyle, isPending: isDeleting } = useDeleteHairstyle();

  const [searchText, setSearchText] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<IHairstylePayload>({
    defaultValues: {
      name: "",
      description: "",
      faceShape: null,
      recommendedAgeGroup: "",
    }
  });

  const filteredData = hairstyles.filter(h => 
    h.name.toLowerCase().includes(searchText.toLowerCase()) || 
    (h.faceShape && h.faceShape.toLowerCase().includes(searchText.toLowerCase()))
  );

  const onSubmit = (data: IHairstylePayload) => {
    createHairstyle(data, {
      onSuccess: () => {
        message.success("Thêm kiểu tóc thành công!");
        setIsDrawerOpen(false);
        reset();
      },
      onError: () => message.error("Có lỗi xảy ra!"),
    });
  };

  const handleDelete = (id: number) => {
    deleteHairstyle(id, {
      onSuccess: () => message.success("Xóa thành công!"),
      onError: () => message.error("Không thể xóa!"),
    });
  };

  const columns: ColumnsType<IHairstyle> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
    },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      width: 100,
      render: (images) => (
        images && images.length > 0 
          ? <Image width={50} height={50} className="rounded-md object-cover" src={images[0].imageUrl} alt="hair" />
          : <div className="w-[50px] h-[50px] bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">Trống</div>
      )
    },
    {
      title: "Tên kiểu tóc",
      dataIndex: "name",
      className: "font-semibold",
    },
    {
      title: "Khuôn mặt",
      dataIndex: "faceShape",
      render: (shape) => FACE_SHAPE_OPTIONS.find(o => o.value === shape)?.label || shape || "N/A"
    },
    {
      title: "Độ tuổi đề xuất",
      dataIndex: "recommendedAgeGroup",
      render: (age) => age || "N/A"
    },
    {
      title: "Hành động",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link">Sửa</Button>
          <Popconfirm
            title="Xóa kiểu tóc này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger type="link" loading={isDeleting}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-semibold mb-1">Quản lý Gallery Kiểu Tóc</h4>
          <p className="text-gray-500 mb-0">Hiển thị các mẫu tóc cho AI Recommendation và Khách hàng</p>
        </div>
        <Button type="primary" onClick={() => setIsDrawerOpen(true)}>+ Thêm kiểu tóc</Button>
      </div>

      <div className="card bg-white p-4 rounded-lg shadow-sm">
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm tên kiểu tóc..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          pagination={{ pageSize: 8 }}
        />
      </div>

      <Drawer
        title="Thêm kiểu tóc mới"
        width={400}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          reset();
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên kiểu tóc *</label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Vui lòng nhập tên kiểu tóc" }}
              render={({ field }) => <Input {...field} placeholder="VD: Undercut Quiff" status={errors.name ? 'error' : ''} />}
            />
            {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Khuôn mặt phù hợp</label>
            <Controller
              name="faceShape"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-full"
                  placeholder="Chọn khuôn mặt"
                  options={FACE_SHAPE_OPTIONS}
                  allowClear
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Độ tuổi đề xuất</label>
            <Controller
              name="recommendedAgeGroup"
              control={control}
              render={({ field }) => <Input {...field} placeholder="VD: 18-35" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <TextArea {...field} rows={4} placeholder="Nhập mô tả kiểu tóc..." />}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={isCreating}>Lưu kiểu tóc</Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}