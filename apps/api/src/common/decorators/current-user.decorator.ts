import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUserResponse } from '@commerceos/contracts';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUserResponse | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUserResponse;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
