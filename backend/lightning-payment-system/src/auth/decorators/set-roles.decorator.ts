import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/enums/user-role';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
