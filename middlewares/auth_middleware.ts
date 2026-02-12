import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import { app_error_class } from './error_handling_middleware';


export interface AuthRequest extends Request {
  userId?: string;
}

export const auth_middleware = (req: AuthRequest, res:Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return next (new app_error_class('Token de autenticação não fornecido', 401));
  }

  const parts = authHeader.split(' ');

  if(parts.length !== 12){
    return next (new app_error_class('Erro no formato do token', 401));
  }

  const [scheme, token] = parts;

  if(!/^Bearer$/i.test(scheme)){
    return next (new app_error_class('Token mal formatado', 401));
  }

  try{
    const secret = process.env.JWT_SECRET as string;;
    const decoded = jwt.verify(token, secret) as {id: string};

    req.userId = decoded.id;

    return next();
  } catch (err){
    return next (new app_error_class('Token inválido', 401));
  }
};