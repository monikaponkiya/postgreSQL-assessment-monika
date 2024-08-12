import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { statusBadRequest } from 'src/common/constants/response.status.constant';
import { UserRole } from 'src/common/constants/user-role';
import { User } from 'src/common/entities/user';
import { AuthExceptions } from 'src/common/helpers/exceptions/auth.exception';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockJwtService = {
      signAsync: jest.fn(),
    };

    jest.mock('bcrypt', () => ({
      hash: jest
        .fn()
        .mockResolvedValue(
          '$2b$10$U2El8xU44zDcdN8K5lL9Duk.ApopQ5/f0/RibMzu5cgxcmtrXjxuy',
        ),
    }));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  const userId = 1;

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedAdmin', () => {
    it('should not create an admin if one already exists', async () => {
      const adminEmail = process.env.ADMIN_USER;
      const existingAdmin = { email: adminEmail };
      jest
        .spyOn(userRepo, 'findOneBy')
        .mockResolvedValue(existingAdmin as User);

      await service.seedAdmin();
      expect(userRepo.save).not.toHaveBeenCalled();
      expect(userRepo.findOneBy).toHaveBeenCalledWith({ email: adminEmail });
    });

    it('should create a new admin if one does not exist', async () => {
      const adminEmail = 'admin@gmail.com';
      const adminPassword = 'Admin@123';

      const hashedPassword = await hash(adminPassword, 10);
      const newAdmin = {
        name: 'Admin',
        email: adminEmail,
        phone: '8153848585',
        address: 'Pune',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
      };

      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(userRepo, 'save').mockResolvedValue(newAdmin as User);
    });

    it('should handle and rethrow exceptions during admin creation', async () => {
      const adminEmail = 'admin@gmail.com';
      const adminPassword = 'Admin@123';
      process.env.ADMIN_USER = adminEmail;
      process.env.ADMIN_PASSWORD = adminPassword;

      const error = new Error('Database error');
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(userRepo, 'save').mockRejectedValue(error);

      await expect(service.seedAdmin()).rejects.toThrow(
        AuthExceptions.customException(error, HttpStatus.BAD_REQUEST),
      );

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ email: adminEmail });
      expect(userRepo.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return a token and user details on successful login', async () => {
      const loginDto = { email: 'test@gmail.com', password: 'password' };
      const user = {
        user_id: 1,
        user_name: 'Test User',
        user_role: UserRole.MANAGER,
        user_password: await hash('password', 10),
        tenant_id: 1,
      };

      jest.spyOn(userRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(user),
      } as any);

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwt-token');

      await service.login(loginDto);
      expect(userRepo.createQueryBuilder).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          id: user.user_id,
          name: user.user_name,
          role: user.user_role,
          tenant: user.tenant_id,
        },
        {
          secret: process.env.JWT_TOKEN_SECRET,
          expiresIn: process.env.JWT_TONE_EXPIRY_TIME,
        },
      );
    });

    it('should throw an error if the user is not found', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };

      jest.spyOn(userRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.login(loginDto)).rejects.toThrow(
        AuthExceptions.AccountNotFound(),
      );

      expect(userRepo.createQueryBuilder).toHaveBeenCalled();
    });

    it('should throw an error if the password is incorrect', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongPassword' };
      const user = {
        user_id: 1,
        user_name: 'Test User',
        user_role: 'USER',
        user_password: await hash('password', 10),
        tenant_id: 1,
      };

      jest.spyOn(userRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(user),
      } as any);

      await expect(service.login(loginDto)).rejects.toThrow(
        AuthExceptions.InvalidIdPassword(),
      );

      expect(userRepo.createQueryBuilder).toHaveBeenCalled();
    });

    it('should handle and rethrow unexpected errors', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const error = new Error('Internal Server Error');

      jest.spyOn(userRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockRejectedValue(error),
      } as any);

      await expect(service.login(loginDto)).rejects.toThrow(
        AuthExceptions.customException(error.message, statusBadRequest),
      );

      expect(userRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('userChangePassword', () => {
    it('should change the password successfully when the current password is correct', async () => {
      const userId = 1;
      const currentPassword = 'currentPassword';
      const newPassword = 'newPassword';
      const hashedCurrentPassword = await hash(currentPassword, 10);

      const user = {
        id: userId,
        password: hashedCurrentPassword,
      };
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(user as User);
      await service.userChangePassword({
        id: userId,
        current_password: currentPassword,
        new_password: newPassword,
      });

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...user,
        }),
      );
    });

    it('should throw an error if the user is not found', async () => {
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.userChangePassword({
          id: userId,
          current_password: 'anyPassword',
          new_password: 'newPassword',
        }),
      ).rejects.toThrow(AuthExceptions.AccountNotFound());

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: userId });
    });

    it('should throw an error if the current password is incorrect', async () => {
      const currentPassword = 'currentPassword';
      const newPassword = 'newPassword';
      const hashedCurrentPassword = await hash('wrongPassword', 10);

      const user = {
        id: userId,
        password: hashedCurrentPassword,
      };

      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(user as User);

      await expect(
        service.userChangePassword({
          id: userId,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      ).rejects.toThrow(AuthExceptions.InvalidIdPassword());

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: userId });
    });

    it('should handle and rethrow unexpected errors', async () => {
      const error = new Error('Unexpected error');

      jest.spyOn(userRepo, 'findOneBy').mockRejectedValue(error);

      await expect(
        service.userChangePassword({
          id: userId,
          current_password: 'anyPassword',
          new_password: 'newPassword',
        }),
      ).rejects.toThrow(
        AuthExceptions.customException(error.message, HttpStatus.BAD_REQUEST),
      );

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: userId });
    });
  });
});
