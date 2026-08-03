export type DoctorRoleRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface DoctorRoleRequest {
  requestId: number;
  userId: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  status: DoctorRoleRequestStatus;
  appliedAt: string;
  reviewedAt?: string | null;
}
