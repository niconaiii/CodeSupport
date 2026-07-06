import { useState, useMemo } from "react";
import {
  Table,
  Tag,
  Input,
  Select,
  Space,
  Button,
  Avatar,
  Rate,
  Popconfirm,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useReviews, useUpdateReviewStatus } from "../../../hooks/useReviews";
import {
  REVIEW_STATUS_COLOR,
  REVIEW_STATUS_LABEL,
  type ReviewStatus,
  type IReviewWithRelations,
} from "../../../types/review";

const { Search } = Input;

const STATUS_OPTIONS: { value: ReviewStatus; label: string }[] = (
  Object.keys(REVIEW_STATUS_LABEL) as ReviewStatus[]
).map((s) => ({ value: s, label: REVIEW_STATUS_LABEL[s] }));

export default function ReviewListPage() {
  const { data: reviews = [], isLoading } = useReviews();
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateReviewStatus();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | undefined>();

  // Xử lý bộ lọc
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchStatus = !statusFilter || r.status === statusFilter;
      const matchSearch =
        !searchText ||
        r.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        r.barberName.toLowerCase().includes(searchText.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchText.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [reviews, searchText, statusFilter]);

  // Xử lý đổi trạng thái (Duyệt / Ẩn)
  const handleUpdateStatus = (id: number, status: ReviewStatus) => {
    updateStatus(
      { id, status },
      {
        onSuccess: () => message.success("Cập nhật trạng thái thành công!"),
        onError: () => message.error("Có lỗi xảy ra, vui lòng thử lại!"),
      },
    );
  };

  const columns: ColumnsType<IReviewWithRelations> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      width: 200,
      render: (name) => (
        <Space>
          <Avatar
            size="small"
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
          >
            {name?.[0]}
          </Avatar>
          <span className="font-medium">{name}</span>
        </Space>
      ),
    },
    {
      title: "Barber",
      dataIndex: "barberName",
      width: 150,
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      width: 150,
      render: (rating: number) => (
        <Rate disabled defaultValue={rating} className="text-sm" />
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
      render: (text) => (
        <p className="line-clamp-2 max-w-xs m-0 text-gray-600">
          {text || <em className="text-gray-400">Không có bình luận</em>}
        </p>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: (s: ReviewStatus) => (
        <Tag color={REVIEW_STATUS_COLOR[s]}>{REVIEW_STATUS_LABEL[s]}</Tag>
      ),
    },
    {
      title: "Hành động",
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status !== "APPROVED" && (
            <Button
              size="small"
              type="primary"
              ghost
              loading={isUpdating}
              onClick={() => handleUpdateStatus(record.id, "APPROVED")}
            >
              Duyệt
            </Button>
          )}
          {record.status !== "HIDDEN" && (
            <Popconfirm
              title="Ẩn đánh giá này?"
              description="Đánh giá sẽ không hiển thị trên ứng dụng khách."
              onConfirm={() => handleUpdateStatus(record.id, "HIDDEN")}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button size="small" danger loading={isUpdating}>
                Ẩn
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="fw-semibold mb-1">Quản lý Đánh giá</h4>
              <p className="text-muted mb-0">
                {filtered.length} lượt đánh giá từ khách hàng
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <Space wrap style={{ marginBottom: 16 }} size={[12, 12]}>
            <Search
              placeholder="Tìm theo nội dung, tên khách..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 320 }}
            />
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: 200 }}
              options={STATUS_OPTIONS}
              onChange={(v) => setStatusFilter(v)}
            />
            <Button
              onClick={() => {
                setSearchText("");
                setStatusFilter(undefined);
              }}
            >
              Đặt lại
            </Button>
          </Space>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (t) => `Tổng ${t}`,
            }}
            scroll={{ x: 1000 }}
          />
        </div>
      </div>
    </>
  );
}
