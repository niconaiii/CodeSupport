export type ReviewStatus = "PENDING" | "APPROVED" | "HIDDEN";

export interface IReview {
  id: number;
  bookingId: number;
  customerId: number;
  barberId: number;
  rating: number; // Điểm đánh giá (1-5)
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt?: string;
}

// Interface mở rộng để hiển thị lên bảng (kèm tên người dùng)
export interface IReviewWithRelations extends IReview {
  customerName: string;
  barberName: string;
}

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  HIDDEN: "Đã ẩn",
};

export const REVIEW_STATUS_COLOR: Record<ReviewStatus, string> = {
  PENDING: "gold",
  APPROVED: "green",
  HIDDEN: "red",
};