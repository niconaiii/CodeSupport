import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createService, getServices, updateService, deleteService } from "../services/service.service";
import type { IService } from "../types/service";

export const useServices = () => {
    return useQuery({
        queryKey: ["services"],
        queryFn: getServices,
    });
};

export const useCreateService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });
};

// ==================== THÊM MỚI ====================
export const useUpdateService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<IService> }) => 
            updateService(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });
};

// ==================== THÊM MỚI ====================
export const useDeleteService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });
};