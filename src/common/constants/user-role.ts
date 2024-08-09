export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export const accessUser = {
  admin: [UserRole.MANAGER, UserRole.STAFF],
  manager: [UserRole.STAFF],
};
