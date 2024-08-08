import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync, hash } from 'bcrypt';
import {
  TENANT_NOT_FOUND,
  USER_ALREADY_EXIST,
  USER_NOT_FOUND,
} from 'src/common/constants/response.constants';
import { statusBadRequest } from 'src/common/constants/response.status.constant';
import { LoginDto } from 'src/common/dto/login.dto';
import { User } from 'src/common/entities/user';
import { AuthExceptions } from 'src/common/helpers/exceptions/auth.exception';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Tenant } from 'src/common/entities/tenant';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    private jwtService: JwtService,
  ) {}

  async userLogin(user: LoginDto) {
    try {
      const userExist = await this.userRepo.findOne({
        where: { email: user.email },
      });
      if (!userExist) {
        throw AuthExceptions.customException(USER_NOT_FOUND, statusBadRequest);
      }
      if (!(await compareSync(user.password, userExist.password))) {
        throw AuthExceptions.InvalidIdPassword();
      }
      const payload = {
        id: userExist.id,
        name: userExist.name,
        role: userExist.role,
        tenantId: userExist.tenantId,
      };
      return {
        access_token: await this.jwtService.signAsync(payload, {
          secret: process.env.JWT_TOKEN_SECRET,
          expiresIn: process.env.JWT_TONE_EXPIRY_TIME,
        }),
      };
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  private extractUserDetails(user: User): {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
  } {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
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
      const userObj = {
        ...user,
        tenantId: tenantId,
        password: await hash(user.password, 10),
      };
      const createdUser = await this.userRepo.save(userObj);
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

  async findAllUser() {
    try {
      return await this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.tenant', 'tenant')
        .select([
          'user.id',
          'user.name',
          'user.email',
          'user.phone',
          'user.address',
          'tenant.name',
        ])
        .getMany();
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

  async findUserByTenant(tenantId: number) {
    try {
      const tenantExist = await this.tenantRepo.findOneBy({ id: tenantId });
      if (!tenantExist) {
        throw AuthExceptions.customException(
          TENANT_NOT_FOUND,
          statusBadRequest,
        );
      }
      return await this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.tenant', 'tenant')
        .where('user.tenantId = :tenantId', { tenantId })
        .select([
          'user.id',
          'user.name',
          'user.email',
          'user.phone',
          'user.address',
          'user.role',
          'tenant.id',
          'tenant.name',
        ])
        .getMany();
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }
}
