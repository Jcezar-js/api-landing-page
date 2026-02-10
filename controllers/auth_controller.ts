import {Request, Response, NextFunction} from 'express';
import User from '../models/user_schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {z} from 'zod';
import { app_error_class } from '../middlewares/error_handling_middleware';


//user validation schema zod
const userSchema = z.object({
  name: z
    .string({ error : "O nome é obrigatório"})
    .min(3, 'O nome deve conter pelo menos 3 caracteres'),
  email: z
    .string()
    .min(1, {message: 'O campo "Email" é obrigatório'})
    .email("Formato de email inválido"),
  password: z
    .string()
    .min(8, {message: 'A senha deve conter no mínimo 8 caracteres'})
    .max(32, {message: 'A senha deve conter no máximo 32 caracteres'})
    .refine((password) => /[A-Z]/.test(password), { message: 'A senha deve conter pelo menos uma letra maiúscula' })
    .refine((password) => /[a-z]/.test(password), { message: 'A senha deve conter pelo menos uma letra minúscula' })
    .refine((password) => /[0-9]/.test(password), { message: 'A senha deve conter pelo menos um número' })
    .refine((password) => /[!@#$%^&*(),.?":{}|<>]/.test(password), { message: 'A senha deve conter pelo menos um caractere especial' }),
})

const updatePasswordSchema = z
.object({
  currentPassword: z.string(),
  password: userSchema.shape.password,
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem', 
});


//login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ $eq: { email } });
    if (!user) {
      return next(new app_error_class('Email ou senha incorretos!', 401));
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new app_error_class('Email ou senha incorretos!', 401));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new app_error_class('JWT_SECRET não está definido', 422));
    }

    const token = jwt.sign(
      { id: user._id, role: 'user' },
      secret,
      { expiresIn: '1d' }
    );

    return res.json({ token, userId: user._id });
  } catch (err) {
    return next(err); // Passa para o error handler global
  }
};

export const update_password = async (req: Request, res: Response, next: NextFunction) => {
  const result = updatePasswordSchema.safeParse(req.body);

  if (!result.success) {
    return next (new app_error_class('Dados inválidos', 400));
  }

  const { currentPassword, password } = result.data;
  const userId = (req as any).userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new app_error_class('Usuário não encontrado', 404));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(new app_error_class('As senhas não coincidem', 400));
    }
    
    user.password = password;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso!' });
  } catch (err) {
    return next(err);
  }
};