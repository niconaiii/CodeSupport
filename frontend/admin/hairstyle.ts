export interface IHairstyleImage {
  id: number;
  hairstyleId: number; // Đã đổi sang camelCase
  imageUrl: string;
  overlayPngUrl?: string;
  displayOrder: number;
}

export type FaceShapeType = "OVAL" | "ROUND" | "SQUARE" | "HEART" | "DIAMOND" | "LONG";

export interface IHairstyle {
  id: number;
  name: string;
  description: string;
  faceShape: FaceShapeType | null;
  recommendedAgeGroup: string | null;
  trendScore: number | null;
  suitabilityScore: number | null;
  createdAt: string;
  images?: IHairstyleImage[]; 
}

export interface IHairstylePayload {
  name: string;
  description: string;
  faceShape?: FaceShapeType | null;
  recommendedAgeGroup?: string;
}