export const Role = {
  ADMIN: 1,
  DOCTOR: 2,
  USER: 3,
} as const;

export type RoleId = (typeof Role)[keyof typeof Role];

export type ViewMode = "ADMIN" | "DOCTOR" | "USER";

export function isAdminRole(roleId: number): boolean {
  return roleId === Role.ADMIN;
}

export function isDoctorRole(roleId: number): boolean {
  return roleId === Role.DOCTOR;
}

export function isUserRole(roleId: number): boolean {
  return roleId === Role.USER;
}

export function defaultPanelViewMode(roleId: number): ViewMode | undefined {
  if (roleId === Role.ADMIN) return "ADMIN";
  if (roleId === Role.DOCTOR) return "DOCTOR";
  return undefined;
}

export function canAccessAdminPanel(roleId: number, viewMode?: ViewMode): boolean {
  return roleId === Role.ADMIN && viewMode !== "USER";
}

export function canAccessDoctorPanel(roleId: number, viewMode?: ViewMode): boolean {
  return roleId === Role.DOCTOR && viewMode !== "USER";
}

export function isPatientView(roleId: number, viewMode?: ViewMode): boolean {
  if (roleId === Role.USER) return true;
  return viewMode === "USER";
}

export function canSwitchViewMode(roleId: number): boolean {
  return roleId === Role.ADMIN || roleId === Role.DOCTOR;
}

export function panelViewModeForRole(roleId: number): ViewMode {
  if (roleId === Role.ADMIN) return "ADMIN";
  if (roleId === Role.DOCTOR) return "DOCTOR";
  return "USER";
}

export function legacyRoleToId(role: string): RoleId {
  const map: Record<string, RoleId> = {
    ADMIN: Role.ADMIN,
    DOCTOR: Role.DOCTOR,
    USER: Role.USER,
  };
  return map[role] ?? Role.USER;
}
