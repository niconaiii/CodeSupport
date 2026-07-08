import axiosClient from "../api/axiosClient";
import type { IService } from "../types/service";

export const getServices = async () => {
    const res = await axiosClient.get("/services");
    return res.data;
};

export const createService = async (data: Omit<IService, "id">) => {
    const res = await axiosClient.post("/services", data);
    return res.data;
};

//thêm

export const updateService = async (id: number, data: Partial<IService>) => {
    const res = await axiosClient.patch(`/services/${id}`, data);
    return res.data;
};

export const deleteService = async (id: number) => {
    const res = await axiosClient.delete(`/services/${id}`);
    return res.data;
};