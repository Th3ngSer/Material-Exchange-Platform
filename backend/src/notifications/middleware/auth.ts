import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Protect middleware for express-style notification routes.
// Verifies a Bearer JWT and sets `req.user = { id, email, role }` on success.
// Falls back to a 401 Unauthorized response when token is missing/invalid.
export function protect(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || req.headers.Authorization

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const token = authHeader.split(' ')[1]
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me'

  try {
    const payload = jwt.verify(token, secret) as any
    // Normalize to minimal user shape expected by controllers
    ;(req as any).user = {
      id: payload.sub ?? payload.id,
      email: payload.email,
      role: payload.role,
    }
    next()
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' })
  }
}

export default protect



import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req    = ctx.switchToHttp().getRequest()
    const header = req.headers.authorization

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header')
    }

    const token = header.split(' ')[1]
    try {
      const payload = await this.jwtService.verifyAsync<{ sub?: string; id?: string; email?: string; role?: string }>(token)
      req.user = {
        _id:   payload.sub ?? payload.id,
        id:    payload.sub ?? payload.id,
        email: payload.email,
        role:  payload.role,
      }
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest().user
)
