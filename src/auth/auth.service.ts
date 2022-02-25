import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { hash, verify } from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';

import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

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

    // return user
    return this.signToken(user);
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

      return this.signToken(user);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already in use');
        }
      }
      throw error;
    }
  }

  async signToken(user: User): Promise<{ accessToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      accessToken: token,
    };
  }
}
