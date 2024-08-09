import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import {
  LOGIN_PASSWORD,
  USER_ALREADY_EXIST,
  USER_NOT_FOUND,
} from 'src/common/constants/response.constants';
import { statusBadRequest } from 'src/common/constants/response.status.constant';
import { ListDto } from 'src/common/dto/list.dto';
import { Tenant } from 'src/common/entities/tenant';
import { User } from 'src/common/entities/user';
import { AuthExceptions } from 'src/common/helpers/exceptions/auth.exception';
import applyQueryOptions from 'src/common/queryHelper';
import { EmailService } from 'src/email/email.service';
import { welcomeTemplate } from 'src/email/emailTemplates/welcome';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { accessUser, UserRole } from 'src/common/constants/user-role';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    private emailService: EmailService,
  ) {}

  private extractUserDetails(user: User): {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
  } {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    };
  }

  async findUserByEmail(email: string) {
    return await this.userRepo.findOneBy({ email });
  }

  async findUserById(id: number) {
    return await this.userRepo.findOneBy({ id });
  }

  async createUser(user: CreateUserDto, tenantId: number) {
    try {
      const isUserExist = await this.findUserByEmail(user.email);
      if (isUserExist) {
        throw AuthExceptions.customException(
          USER_ALREADY_EXIST,
          statusBadRequest,
        );
      }
      const randomPassword = Math.random().toString(36).slice(-8);
      const userObj = {
        ...user,
        tenant: tenantId,
        password: await hash(randomPassword, 10),
      };
      const createdUser = await this.userRepo.save(userObj);

      if (createdUser.role !== UserRole.STAFF) {
        await this.emailService.emailSender(
          createdUser.email.toLowerCase(),
          LOGIN_PASSWORD,
          `${welcomeTemplate(createdUser, randomPassword)}`,
        );
      }

      return this.extractUserDetails(createdUser);
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async updateUser(id: number, user: UpdateUserDto) {
    try {
      const userExist = await this.findUserById(id);
      if (!userExist) {
        throw AuthExceptions.customException(USER_NOT_FOUND, statusBadRequest);
      }
      userExist.name = user.name;
      userExist.phone = user.phone;
      userExist.address = user.address;
      userExist.role = user.role;
      const updatedUser = await this.userRepo.save(userExist);
      return this.extractUserDetails(updatedUser);
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async findUserDetails(id: number) {
    try {
      const userExist = await this.findUserById(id);
      if (!userExist) {
        throw AuthExceptions.customException(USER_NOT_FOUND, statusBadRequest);
      }
      return this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.tenant', 'tenant')
        .select([
          'user.id',
          'user.name',
          'user.email',
          'user.phone',
          'user.address',
          'tenant.id',
          'tenant.name',
        ])
        .where('user.id = :id', { id })
        .getOne();
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async findAllUser(body: ListDto, user: User) {
    try {
      const page = body.page ? Number(body.page) : 1;
      const limit = body.limit ? Number(body.limit) : 10;
      const skip = (page - 1) * limit;

      const roles = accessUser[user.role];

      const queryBuilder = this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.tenant', 'tenant')
        .where('user.tenant = :tenant', { tenant: user.tenant })
        .andWhere('user.role IN (:...roles)', { roles: roles })
        .select([
          'user.id',
          'user.name',
          'user.email',
          'user.phone',
          'user.address',
          'user.role',
          'tenant.id',
          'tenant.name',
        ]);

      if (body.search) {
        queryBuilder.andWhere(
          'tenant.name LIKE :search OR user.name LIKE :search',
          { search: `%${body.search}%` },
        );
      }

      applyQueryOptions(
        queryBuilder,
        {
          search: body.search,
          sortBy: body.sortBy,
          sortOrder: body.sortOrder,
          skip: skip,
          limit: body.limit,
        },
        'user',
      );

      const [users, total] = await queryBuilder.getManyAndCount();

      return {
        data: users,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async deleteUser(id: number) {
    try {
      const userExist = await this.userRepo.findOneBy({ id });
      if (!userExist) {
        throw AuthExceptions.customException(USER_NOT_FOUND, statusBadRequest);
      }
      return await this.userRepo
        .createQueryBuilder('user')
        .delete()
        .from(User)
        .where('id = :id', { id })
        .execute();
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }
}
