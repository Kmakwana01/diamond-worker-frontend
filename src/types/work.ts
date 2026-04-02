export type WorkType = "Cutting" | "Polishing" | "Other";
export type QualityGrade = "A" | "B" | "C" | "D";

export interface WorkEntry {
  _id: string;
  workType: WorkType;
  pieceCount: number;
  ratePerPiece: number;
  totalEarnings: number;
  workDate: string;
  weight?: number;
  quality?: QualityGrade;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkStats {
  totalEntries: number;
  totalPieces: number;
  totalEarnings: number;
  avgEarnings?: number;
  thisMonth?: number;
}

export interface WorkQueryParams {
  page?: number;
  limit?: number;
  workType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface WorkFormData {
  workType: WorkType | "";
  pieceCount: string;
  ratePerPiece: string;
  workDate: Date;
}

export interface WorkFormErrors {
  workType?: string;
  pieceCount?: string;
  ratePerPiece?: string;
}
