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
