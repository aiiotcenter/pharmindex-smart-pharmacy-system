import { executeMutation, executeQuery } from "@/lib/db";
import { Role } from "@/lib/roles";
import { updateUserRole } from "@/repositories/user.repository";
import type {
  DoctorRoleRequest,
  DoctorRoleRequestStatus,
} from "@/types/doctor-role";

interface DbRequestRow {
  REQUEST_ID: number;
  USER_ID: number;
  USERNAME: string;
  NAME: string;
  SURNAME: string;
  EMAIL: string;
  STATUS: DoctorRoleRequestStatus;
  APPLIED_AT: Date;
  REVIEWED_AT?: Date | null;
}

function mapRequest(row: DbRequestRow): DoctorRoleRequest {
  return {
    requestId: row.REQUEST_ID,
    userId: row.USER_ID,
    username: row.USERNAME,
    name: row.NAME,
    surname: row.SURNAME,
    email: row.EMAIL,
    status: row.STATUS,
    appliedAt: row.APPLIED_AT.toISOString(),
    reviewedAt: row.REVIEWED_AT?.toISOString() ?? null,
  };
}

export async function createDoctorRoleRequest(userId: number): Promise<void> {
  const existing = await executeQuery<{ STATUS: DoctorRoleRequestStatus }>(
    `
    SELECT status FROM doctor_role_requests WHERE user_id = :userId
    `,
    { userId }
  );

  if (existing[0]?.STATUS === "PENDING") {
    throw new Error("REQUEST_EXISTS");
  }

  if (existing[0]?.STATUS === "APPROVED") {
    throw new Error("ALREADY_DOCTOR");
  }

  if (existing.length > 0) {
    await executeMutation(
      `
      UPDATE doctor_role_requests
      SET status = 'PENDING', applied_at = CURRENT_TIMESTAMP, reviewed_by = NULL, reviewed_at = NULL
      WHERE user_id = :userId
      `,
      { userId }
    );
    return;
  }

  await executeMutation(
    `
    INSERT INTO doctor_role_requests (user_id, status)
    VALUES (:userId, 'PENDING')
    `,
    { userId }
  );
}

export async function getDoctorRoleRequestForUser(
  userId: number
): Promise<DoctorRoleRequest | null> {
  const rows = await executeQuery<DbRequestRow>(
    `
    SELECT r.request_id, r.user_id, u.username, u.name, u.surname, u.email,
           r.status, r.applied_at, r.reviewed_at
    FROM doctor_role_requests r
    JOIN users u ON u.user_id = r.user_id
    WHERE r.user_id = :userId
    `,
    { userId }
  );

  return rows[0] ? mapRequest(rows[0]) : null;
}

export async function listPendingDoctorRoleRequests(): Promise<DoctorRoleRequest[]> {
  const rows = await executeQuery<DbRequestRow>(
    `
    SELECT r.request_id, r.user_id, u.username, u.name, u.surname, u.email,
           r.status, r.applied_at, r.reviewed_at
    FROM doctor_role_requests r
    JOIN users u ON u.user_id = r.user_id
    WHERE r.status = 'PENDING'
    ORDER BY r.applied_at
    `
  );

  return rows.map(mapRequest);
}

export async function listAllDoctorRoleRequests(): Promise<DoctorRoleRequest[]> {
  const rows = await executeQuery<DbRequestRow>(
    `
    SELECT r.request_id, r.user_id, u.username, u.name, u.surname, u.email,
           r.status, r.applied_at, r.reviewed_at
    FROM doctor_role_requests r
    JOIN users u ON u.user_id = r.user_id
    ORDER BY r.applied_at DESC
    `
  );

  return rows.map(mapRequest);
}

export async function approveDoctorRoleRequest(
  requestId: number,
  adminId: number
): Promise<void> {
  const rows = await executeQuery<{ USER_ID: number; STATUS: string }>(
    `
    SELECT user_id, status FROM doctor_role_requests WHERE request_id = :requestId
    `,
    { requestId }
  );

  const row = rows[0];
  if (!row || row.STATUS !== "PENDING") {
    throw new Error("NOT_FOUND");
  }

  await executeMutation(
    `
    UPDATE doctor_role_requests
    SET status = 'APPROVED', reviewed_by = :adminId, reviewed_at = CURRENT_TIMESTAMP
    WHERE request_id = :requestId
    `,
    { requestId, adminId }
  );

  await updateUserRole(row.USER_ID, Role.DOCTOR);
}

export async function rejectDoctorRoleRequest(
  requestId: number,
  adminId: number
): Promise<void> {
  await executeMutation(
    `
    UPDATE doctor_role_requests
    SET status = 'REJECTED', reviewed_by = :adminId, reviewed_at = CURRENT_TIMESTAMP
    WHERE request_id = :requestId AND status = 'PENDING'
    `,
    { requestId, adminId }
  );
}
