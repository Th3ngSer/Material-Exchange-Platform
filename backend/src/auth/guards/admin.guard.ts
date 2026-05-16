import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

interface AuthenticatedRequest {
  user?: JwtPayload;
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const role = request.user?.role;

    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
