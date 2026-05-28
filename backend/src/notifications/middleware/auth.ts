
import { Request, Response, NextFunction } from 'express'

// Lightweight protect middleware for notifications routes.
// This is a minimal passthrough so notification routes compile and remain
// self-contained. Replace with real auth logic if/when integrated.
export function protect(req: Request, res: Response, next: NextFunction): void {
  // If you have a JWT guard available in the main app, integrate here.
  next()
}

export default protect
