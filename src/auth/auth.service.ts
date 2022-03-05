import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { hash, verify } from 'argon2';

import { PrismaService } from '../prisma/prisma.service';
import { AuthToken } from './auth-token';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(authDto: AuthDto): Promise<AuthToken> {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: authDto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const isPasswordValid = await verify(user.password, authDto.password);

    if (!isPasswordValid) {
      throw new ForbiddenException('Email or password is incorrect');
    }

    return this.signToken(user);
  }

  async signup(authDto: AuthDto): Promise<AuthToken> {
    const password = await hash(authDto.password);

    try {
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

  async signToken(user: User): Promise<AuthToken> {
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
