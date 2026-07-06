import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "../services/review.service";
import type { ReviewStatus } from "../types/review";

export const useReviews = () => {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: reviewService.getReviews,
  });
};

export const useUpdateReviewStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ReviewStatus }) =>
      reviewService.updateReviewStatus(id, status),
    onSuccess: () => {
      // Refresh lại data sau khi update thành công
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};