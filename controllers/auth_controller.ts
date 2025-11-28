import {Request, Response} from 'express';
import User from '../models/user_schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {z} from 'zod';
//password validation schema
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

export const updatePasswordSchema = z
.object({
  currentPassword: z.string(),
  password: userSchema.shape.password,
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem', 
});
// user registration
export const register = async (req: Request, res: Response) => {
  const {name, email, password} = req.body;
  
  try{
    const user =  new User({name, email, password});
    const newUser = await user.save();
    res.status(201).json({message: 'Usuário registrado com sucesso', UserID: newUser._id, name: newUser.name, email: newUser.email});
  } catch (err: any){
    res.status(400).json({message: err.message});
  }
};

//login user
export const login = async (req: Request, res: Response)=> {
  const {nqme, email, password} = req.body;


};