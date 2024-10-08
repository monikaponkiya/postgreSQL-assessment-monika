import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, compareSync } from 'bcrypt';
import { statusBadRequest } from 'src/common/constants/response.status.constant';
import { UserRole } from 'src/common/constants/user-role';
import { ChangePasswordDto } from 'src/common/dto/change-password.dto';
import { LoginDto } from 'src/common/dto/login.dto';
import { User } from 'src/common/entities/user';
import { AuthExceptions } from 'src/common/helpers/exceptions/auth.exception';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async seedAdmin() {
    try {
      const isAdminExists = await this.userRepo.findOneBy({
        email: process.env.ADMIN_USER,
      });
      if (isAdminExists) {
        return;
      }
      const adminObj = {
        name: 'Admin',
        email: process.env.ADMIN_USER,
        phone: '8153848585',
        address: 'Pune',
        password: await hash(process.env.ADMIN_PASSWORD, 10),
        role: UserRole.SUPER_ADMIN,
      };
      await this.userRepo.save(adminObj);
    } catch (error) {
      throw AuthExceptions.customException(error, statusBadRequest);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.tenant', 'tenant')
        .where('user.email = :email', { email: loginDto.email })
        .select([
          'user.id',
          'user.name',
          'user.role',
          'user.phone',
          'user.email',
          'user.address',
          'user.password',
          'tenant.id',
        ])
        .getRawOne();
      if (!user) {
        throw AuthExceptions.AccountNotFound();
      }
      if (!(await compareSync(loginDto.password, user.user_password))) {
        throw AuthExceptions.InvalidIdPassword();
      }
      const payload = {
        id: user.user_id,
        name: user.user_name,
        role: user.user_role,
        tenant: user.tenant_id,
      };
      return {
        access_token: await this.jwtService.signAsync(payload, {
          secret: process.env.JWT_TOKEN_SECRET,
          expiresIn: process.env.JWT_TONE_EXPIRY_TIME,
        }),
        id: user.user_id,
        name: user.user_name,
        email: user.user_email,
        phone: user.user_phone,
        address: user.user_address,
      };
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async changePassword(body: ChangePasswordDto) {
    try {
      const user = await this.userRepo.findOneBy({ id: body.id });
      if (!user) {
        throw AuthExceptions.AccountNotFound();
      }
      const isPasswordMatch = await compareSync(
        body.current_password,
        user.password,
      );
      if (!isPasswordMatch) {
        throw AuthExceptions.InvalidIdPassword();
      }
      user.password = await hash(body.new_password, 10);
      await this.userRepo.save(user);
      return {};
    } catch (error) {
      throw AuthExceptions.customException(error.message, statusBadRequest);
    }
  }
}
