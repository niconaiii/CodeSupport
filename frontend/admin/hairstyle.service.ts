import axiosClient from "../api/axiosClient";
import type { IHairstyle, IHairstylePayload } from "../types/hairstyle";

export const hairstyleService = {
  getHairstyles: async (): Promise<IHairstyle[]> => {
    const res = await axiosClient.get<IHairstyle[]>("/hairstyles");
    return res.data;
  },

  createHairstyle: async (payload: IHairstylePayload): Promise<IHairstyle> => {
    const res = await axiosClient.post<IHairstyle>("/hairstyles", payload);
    return res.data;
  },

  deleteHairstyle: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hairstyles/${id}`);
  },
};