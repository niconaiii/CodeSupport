import axiosClient from "../api/axiosClient";
import type { IReview, IReviewWithRelations, ReviewStatus } from "../types/review";
import type { IUser } from "../types/user";

export const reviewService = {
  getReviews: async (): Promise<IReviewWithRelations[]> => {
    // Gọi song song API reviews và users để tối ưu thời gian
    const [reviewsRes, usersRes] = await Promise.all([
      axiosClient.get<IReview[]>("/reviews"),
      axiosClient.get<IUser[]>("/users"),
    ]);

    const users = usersRes.data;

    return reviewsRes.data.map((r) => {
      const customer = users.find((u) => u.id === r.customerId);
      const barber = users.find((u) => u.id === r.barberId);
      
      return {
        ...r,
        customerName: customer?.full_name ?? "Khách vãng lai",
        barberName: barber?.full_name ?? "N/A",
      };
    });
  },

  updateReviewStatus: async (
    id: number,
    status: ReviewStatus
  ): Promise<IReview> => {
    const res = await axiosClient.patch<IReview>(`/reviews/${id}`, { status });
    return res.data;
  },
};