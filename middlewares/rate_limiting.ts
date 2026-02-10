import rateLimit from 'express-rate-limit';
import {Request, Response, NextFunction} from 'express';
import { app_error_class } from './error_handling_middleware';

const Limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, 
  message: 'Muitas requisições, por favor tente novamente mais tarde.',
  handler: (req:Request, res: Response, next: NextFunction) => {
    next(new app_error_class('Muitas requisições, por favor tente novamente mais tarde.', 429));
  }
})

export const rate_limiter = Limiter;