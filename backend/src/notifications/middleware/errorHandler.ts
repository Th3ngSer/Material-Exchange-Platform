// @ts-nocheck
import { Request, Response, NextFunction, RequestHandler } from 'express'

// Minimal async handler wrapper to catch promise rejections in async route handlers.
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default asyncHandler
