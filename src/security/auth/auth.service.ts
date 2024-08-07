import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, compareSync } from 'bcrypt';
import { statusBadRequest } from 'src/common/constants/response.status.constant';
import { UserRole } from 'src/common/constants/user-role';
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
        password: await hash(process.env.ADMIN_PASSWORD, 10),
        role: UserRole.SUPER_ADMIN,
      };
      await this.userRepo.save(adminObj);
    } catch (error) {
      throw AuthExceptions.customException(error, statusBadRequest);
    }
  }

  async adminLogin(loginDto: LoginDto) {
    try {
      const admin = await this.userRepo.findOne({
        where: { email: loginDto.email },
      });
      if (!admin) {
        throw AuthExceptions.AccountNotFound();
      }
      if (!(await compareSync(loginDto.password, admin.password))) {
        throw AuthExceptions.InvalidIdPassword();
      }
      const payload = {
        id: admin.id,
        name: admin.name,
        role: UserRole.SUPER_ADMIN,
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
}
