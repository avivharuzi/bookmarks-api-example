import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { User } from '@prisma/client';

import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  me(@GetUser() user: User): User {
    return user;
  }

  @Patch()
  editUser(
    @GetUser('id') userId: string,
    @Body() dto: EditUserDto,
  ): Promise<User> {
    return this.userService.editUser(userId, dto);
  }
}
