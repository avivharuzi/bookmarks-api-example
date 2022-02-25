import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from '@prisma/client';

export const GetUser = createParamDecorator(
  (property: keyof User | undefined, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (property) {
      return user[property];
    }

    return user;
  },
);
