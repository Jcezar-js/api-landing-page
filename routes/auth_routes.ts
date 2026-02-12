import express from 'express';
import {auth_middleware} from '../middlewares/auth_middleware';
import { 
  login,
  update_password,
  create_user
} from '../controllers/auth_controller';
import { rate_limiter, rate_limiter_login } from '../middlewares/rate_limiting';


const auth_router = express.Router();

auth_router.use(rate_limiter);

//Rotas de produto públicas
auth_router.post('/register', create_user);
auth_router.post('/login', rate_limiter_login, login);

//Rotas protegidas
auth_router.patch('/updatepsw/:id', auth_middleware, update_password);



export default auth_router;