import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { hash, verify } from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async login(authDto: AuthDto) {
    // find user by email
    const user = await this.prismaService.user.findFirst({
      where: {
        email: authDto.email,
      },
    });

    // if user not found
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // check password
    const isPasswordValid = await verify(user.password, authDto.password);

    // if password is not valid throw exception
    if (!isPasswordValid) {
      throw new ForbiddenException('Email or password is incorrect');
    }

    delete user.password;

    // return user
    return user;
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
