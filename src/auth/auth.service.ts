import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  login(): string {
    return 'I am signed up!';
  }

  signup(): string {
    return 'I am signed in!';
  }
}
