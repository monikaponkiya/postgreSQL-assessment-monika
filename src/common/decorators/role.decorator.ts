import { SetMetadata } from '@nestjs/common';

export const RoleKey = 'RoleKey';
export const Roles = (...message: string[]) => {
  return SetMetadata(RoleKey, message);
};
