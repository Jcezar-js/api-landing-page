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

const limiterLogin = rateLimit({
  windowMs: 5 * 10 * 1000, // 50 segundos
  max: 5,
  message: 'Muitas tentativas de login, por favor tente novamente mais tarde.',
  handler: (req:Request, res: Response, next: NextFunction) => {
    next(new app_error_class('Muitas tentativas de login, por favor tente novamente mais tarde.', 429));
  }
})

export const rate_limiter = Limiter;
export const rate_limiter_login = limiterLogin;