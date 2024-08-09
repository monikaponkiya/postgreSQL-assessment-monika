import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RoleGuard } from 'src/security/guard/role.guard';
import { CreateUserDto } from './dto/create-user.dto';
import {
  CreateUserResponseDto,
  DeleteUserResponseDto,
  UpdateUserResponseDto,
  UserDetailResponseDto,
  UserListResponseDto,
} from './dto/user-response.dto';
import { UserRole } from 'src/common/constants/user-role';
import {
  statusCreated,
  statusOk,
} from 'src/common/constants/response.status.constant';
import {
  USER_ALREADY_EXIST,
  USER_CREATE,
  USER_DELETE,
  USER_DETAIL,
  USER_LIST,
  USER_UPDATE,
} from 'src/common/constants/response.constants';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListDto } from 'src/common/dto/list.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    createUser: jest.fn(),
    updateUser: jest.fn(),
    findUserDetails: jest.fn(),
    findAllUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  const mockRoleGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: RoleGuard,
          useValue: mockRoleGuard,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  const createUserDto: CreateUserDto = {
    name: 'Test User',
    email: 'k5LpY@example.com',
    role: 'ADMIN',
    phone: '1234567890',
    address: 'Test Address',
  };
  const createUserResult: CreateUserResponseDto = {
    data: {
      id: 1,
      name: 'Test User',
      email: 'k5LpY@example.com',
      role: UserRole.ADMIN,
      phone: '1234567890',
      address: 'Test Address',
    },
    message: USER_CREATE,
    statusCode: statusCreated,
  };

  const id = 1;
  const updateUserDto: UpdateUserDto = {
    name: 'Updated User',
    role: 'ADMIN',
    phone: '1234567890',
    address: 'Updated Address',
  };
  const updateUserResult: UpdateUserResponseDto = {
    data: {
      id: 1,
      name: 'Updated User',
      email: 'k5LpY@example.com',
      role: UserRole.ADMIN,
      phone: '1234567890',
      address: 'Updated Address',
    },
    message: USER_UPDATE,
    statusCode: statusOk,
  };

  const userDetailResult: UserDetailResponseDto = {
    data: {
      id: 1,
      name: 'Updated User',
      email: 'k5LpY@example.com',
      role: UserRole.ADMIN,
      phone: '1234567890',
      address: 'Updated Address',
      tenant: {
        id: 1,
        name: 'Test Tenant',
      },
    },
    message: USER_DETAIL,
    statusCode: statusOk,
  };

  const body: ListDto = {
    page: 1,
    limit: 10,
    search: 'Test',
    sortBy: 'name',
    sortOrder: 'asc',
  };

  const userListResult: UserListResponseDto = {
    data: [
      {
        id: 1,
        name: 'Test User',
        email: 'k5LpY@example.com',
        role: UserRole.ADMIN,
        phone: '1234567890',
        address: 'Test Address',
        tenant: {
          id: 1,
          name: 'Test Tenant',
        },
      },
    ],
    message: USER_LIST,
    statusCode: statusOk,
  };

  const userDeleteResult: DeleteUserResponseDto = {
    message: USER_DELETE,
    statusCode: statusOk,
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user and return the response', async () => {
      const req = { user: { tenantId: 1 } } as any;

      mockUserService.createUser.mockResolvedValue(createUserResult);

      expect(await controller.createUser(createUserDto, req)).toBe(
        createUserResult,
      );
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        createUserDto,
        req.user.tenantId,
      );
      expect(service.createUser).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req: Request = { user: { tenantId: 1 } } as any;
      const error = new Error(USER_ALREADY_EXIST);

      mockUserService.createUser.mockRejectedValue(error);

      await expect(controller.createUser(createUserDto, req)).rejects.toThrow(
        error,
      );
    });

    it('should handle role-based access control', async () => {
      mockRoleGuard.canActivate = jest.fn(() => true);
      const req = { user: { tenantId: 1 } } as any;

      mockUserService.createUser.mockResolvedValue(createUserResult);

      await expect(
        controller.createUser(createUserDto, req),
      ).resolves.not.toThrow();
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        createUserDto,
        req.user.tenantId,
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user and return the response', async () => {
      mockUserService.updateUser.mockResolvedValue(updateUserResult);

      expect(await controller.updateUser(updateUserDto, id)).toBe(
        updateUserResult,
      );
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        id,
        updateUserDto,
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Error updating user');

      mockUserService.updateUser.mockRejectedValue(error);

      await expect(controller.updateUser(updateUserDto, id)).rejects.toThrow(
        error,
      );
    });

    it('should handle role-based access control', async () => {
      mockRoleGuard.canActivate = jest.fn(() => true);

      mockUserService.updateUser.mockResolvedValue(updateUserResult);

      await expect(
        controller.updateUser(updateUserDto, id),
      ).resolves.not.toThrow();
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        id,
        updateUserDto,
      );
    });
  });

  describe('findUserById', () => {
    it('should return user details', async () => {
      mockUserService.findUserDetails.mockResolvedValue(userDetailResult);

      expect(await controller.findUserById(id)).toBe(userDetailResult);
      expect(mockUserService.findUserDetails).toHaveBeenCalledWith(id);
    });

    it('should handle errors', async () => {
      const id = 1;
      const error = new Error('Error fetching user details');

      mockUserService.findUserDetails.mockRejectedValue(error);

      await expect(controller.findUserById(id)).rejects.toThrow(error);
    });

    it('should handle role-based access control', async () => {
      mockRoleGuard.canActivate = jest.fn(() => true);

      mockUserService.findUserDetails.mockResolvedValue(userDetailResult);

      await expect(controller.findUserById(id)).resolves.not.toThrow();
      expect(mockUserService.findUserDetails).toHaveBeenCalledWith(id);
    });
  });

  describe('listUser', () => {
    it('should return a list of users', async () => {
      const req = { user: { tenantId: 1 } } as any; // Simulate request object

      mockUserService.findAllUser.mockResolvedValue(userListResult);

      expect(await controller.listUser(body, req)).toBe(userListResult);
      expect(mockUserService.findAllUser).toHaveBeenCalledWith(body, req.user);
    });

    it('should handle errors', async () => {
      const req = { user: { tenantId: 1 } } as any;
      const error = new Error('Error fetching user list');

      mockUserService.findAllUser.mockRejectedValue(error);

      await expect(controller.listUser(body, req)).rejects.toThrow(error);
    });

    it('should handle role-based access control', async () => {
      mockRoleGuard.canActivate = jest.fn(() => true);
      const req = { user: { tenantId: 1 } } as any;

      mockUserService.findAllUser.mockResolvedValue(userListResult);

      await expect(controller.listUser(body, req)).resolves.not.toThrow();
      expect(mockUserService.findAllUser).toHaveBeenCalledWith(body, req.user);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return a response', async () => {
      mockUserService.deleteUser.mockResolvedValue(userDeleteResult);

      expect(await controller.deleteUser(id)).toBe(userDeleteResult);
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(id);
    });

    it('should handle errors', async () => {
      const id = 1;
      const error = new Error('Error deleting user');

      mockUserService.deleteUser.mockRejectedValue(error);

      await expect(controller.deleteUser(id)).rejects.toThrow(error);
    });

    it('should handle role-based access control', async () => {
      mockRoleGuard.canActivate = jest.fn(() => true);
      mockUserService.deleteUser.mockResolvedValue(userDeleteResult);

      await expect(controller.deleteUser(id)).resolves.not.toThrow();
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(id);
    });
  });
});
