import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { hash } from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  login(): string {
    return 'I am signed up!';
  }

  async signup(authDto: AuthDto) {
    // generate the password hash
    const password = await hash(authDto.password);

    try {
      // save new user to db
      const user = await this.prismaService.user.create({
        data: {
          email: authDto.email,
          password,
        },
      });

      delete user.password;

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already in use');
        }
      }
      throw error;
    }
  }
}
