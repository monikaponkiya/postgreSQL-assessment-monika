import { Test, TestingModule } from '@nestjs/testing';
import {
  USER_CHANGE_PASSWORD,
  USER_LOGIN,
  USER_NOT_FOUND,
} from 'src/common/constants/response.constants';
import { statusOk } from 'src/common/constants/response.status.constant';
import {
  ChangePasswordResponseDto,
  LoginResponseDto,
} from 'src/common/dto/auth-response.dto';
import { ChangePasswordDto } from 'src/common/dto/change-password.dto';
import { LoginDto } from 'src/common/dto/login.dto';
import { RoleGuard } from '../guard/role.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockRoleGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: RoleGuard,
          useValue: mockRoleGuard,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  const loginDto: LoginDto = {
    email: 'JGQ6b@example.com',
    password: 'password',
  };
  const userLoginResult: LoginResponseDto = {
    data: {
      id: 1,
      name: 'John Doe',
      email: 'JGQ6b@example.com',
      phone: '1234567890',
      address: '123 Main St',
      access_token: 'token123',
    },
    message: USER_LOGIN,
    statusCode: statusOk,
  };

  const body: ChangePasswordDto = {
    id: 1,
    current_password: 'password',
    new_password: 'newPassword',
  };
  const result: ChangePasswordResponseDto = {
    data: {
      access_token: '',
    },
    message: USER_CHANGE_PASSWORD,
    statusCode: statusOk,
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('adminLogin', () => {
    it('should return a login response on successful login', async () => {
      mockAuthService.login.mockResolvedValue(userLoginResult);

      expect(await controller.adminLogin(loginDto)).toBe(userLoginResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(service.login).toHaveBeenCalled();
    });

    it('should handle errors during login', async () => {
      const error = new Error(USER_NOT_FOUND);

      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.adminLogin(loginDto)).rejects.toThrow(error);
    });

    it('should handle invalid login data', async () => {
      const error = new Error('Invalid login data');

      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.adminLogin(loginDto)).rejects.toThrow(error);
    });
  });

  describe('ChangePassword', () => {
    it('should change password successfully', async () => {
      mockAuthService.changePassword.mockResolvedValue(result);

      expect(await controller.changePassword(body)).toBe(result);
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(body);
    });

    it('should handle errors during password change', async () => {
      const error = new Error(USER_NOT_FOUND);

      mockAuthService.changePassword.mockRejectedValue(error);

      await expect(controller.changePassword(body)).rejects.toThrow(
        error,
      );
    });

    it('should handle role-based access control', async () => {
      mockRoleGuard.canActivate = jest.fn(() => true);

      mockAuthService.changePassword.mockResolvedValue(result);

      await expect(
        controller.changePassword(body),
      ).resolves.not.toThrow();
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(body);
    });
  });
});
