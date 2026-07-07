import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hairstyleService } from "../services/hairstyle.service";
import type { IHairstylePayload } from "../types/hairstyle";

export const useHairstyles = () => {
  return useQuery({
    queryKey: ["hairstyles"],
    queryFn: hairstyleService.getHairstyles,
  });
};

export const useCreateHairstyle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: IHairstylePayload) => hairstyleService.createHairstyle(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hairstyles"] });
    },
  });
};

export const useDeleteHairstyle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hairstyleService.deleteHairstyle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hairstyles"] });
    },
  });
};