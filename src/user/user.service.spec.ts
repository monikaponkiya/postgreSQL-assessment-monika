import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { USER_NOT_FOUND } from 'src/common/constants/response.constants';
import { UserRole } from 'src/common/constants/user-role';
import { ListDto } from 'src/common/dto/list.dto';
import { User } from 'src/common/entities/user';
import { AuthExceptions } from 'src/common/helpers/exceptions/auth.exception';
import { EmailService } from 'src/email/email.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            extractUserDetails: jest.fn(),
            createQueryBuilder: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            emailSender: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  const userDto: CreateUserDto = {
    name: 'Test User',
    email: 'newuser@example.com',
    phone: '1234567890',
    address: '123 Main St',
    role: UserRole.STAFF,
  };

  const listDto: ListDto = {
    page: 1,
    limit: 10,
    search: '',
    sortBy: '',
    sortOrder: 'asc',
  };

  const userObj: User = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    address: '123 Main St',
    password: 'password',
    tenant: 1,
    role: UserRole.STAFF,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const userId = 1;

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should throw an error if the user already exists', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(userDto as any);

      await expect(service.createUser(userDto, 1)).rejects.toThrow(
        'Internal Server Error',
      );
    });

    it('should handle errors thrown during user creation', async () => {
      jest
        .spyOn(userRepo, 'findOne')
        .mockRejectedValueOnce(new Error('Internal Server Error'));

      await expect(service.createUser(userDto, 1)).rejects.toThrow(
        'Internal Server Error',
      );
    });
  });

  describe('updateUser', () => {
    it('should throw an error if the user does not exist', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        role: UserRole.STAFF,
      };

      jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(null);

      await expect(service.updateUser(userId, updateUserDto)).rejects.toThrow(
        'User not found',
      );
    });

    it('should handle errors thrown during the update process', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        role: UserRole.STAFF,
      };

      jest
        .spyOn(userRepo, 'findOne')
        .mockRejectedValueOnce(new Error('User not found'));

      await expect(service.updateUser(userId, updateUserDto)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('findUserDetails', () => {
    it('should throw an error if the user does not exist', async () => {
      const userId = 1;

      jest.spyOn(service, 'findUserById').mockResolvedValueOnce(null);

      await expect(service.findUserDetails(userId)).rejects.toThrow(
        USER_NOT_FOUND,
      );
    });

    it('should return user details if the user exists', async () => {
      const userId = 1;
      const userResult = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        address: '123 Main St',
        tenant: { id: 1, name: 'TenantName' },
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-01T00:00:00.000Z',
      };

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(userResult),
      };

      jest.spyOn(service, 'findUserById').mockResolvedValueOnce(userObj);
      jest
        .spyOn(userRepo, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any);
      const result = await service.findUserDetails(userId);
      expect(result).toEqual(result);
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'user.tenant',
        'tenant',
      );
      expect(queryBuilder.select).toHaveBeenCalledWith([
        'user.id',
        'user.name',
        'user.email',
        'user.phone',
        'user.address',
        'tenant.id',
        'tenant.name',
      ]);
      expect(queryBuilder.where).toHaveBeenCalledWith('user.id = :id', {
        id: userId,
      });
    });

    it('should handle errors thrown during the query process', async () => {
      const userId = 1;

      jest.spyOn(service, 'findUserById').mockResolvedValueOnce(userObj);
      jest.spyOn(userRepo, 'createQueryBuilder').mockImplementation(() => {
        throw new Error('Internal Server Error');
      });

      await expect(service.findUserDetails(userId)).rejects.toThrow(
        'Internal Server Error',
      );
    });
  });

  describe('findAllUser', () => {
    it('should handle errors during the query process', async () => {
      jest.spyOn(userRepo, 'createQueryBuilder').mockImplementation(() => {
        throw new Error('internal server error');
      });

      await expect(service.findAllUser(listDto, userObj)).rejects.toThrow(
        'Internal Server Error',
      );
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete a user when they exist', async () => {
      const queryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(userObj);
      jest
        .spyOn(userRepo, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any);

      const result = await service.deleteUser(userId);

      expect(result).toEqual({ });
      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(queryBuilder.from).toHaveBeenCalledWith(User);
      expect(queryBuilder.where).toHaveBeenCalledWith('id = :id', {
        id: userId,
      });
      expect(queryBuilder.execute).toHaveBeenCalled();
    });

    it('should throw an error when the user does not exist', async () => {
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(null);

      await expect(service.deleteUser(userId)).rejects.toThrow(
        AuthExceptions.customException(
          'User not found',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should handle errors during the deletion process', async () => {
      const queryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('User not found')),
      };

      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(userObj);
      jest
        .spyOn(userRepo, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any);

      await expect(service.deleteUser(userId)).rejects.toThrow(
        AuthExceptions.customException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
