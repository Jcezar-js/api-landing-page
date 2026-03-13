import { Request, Response, NextFunction } from 'express';
import User from '../models/user_schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { app_error_class } from '../middlewares/error_handling_middleware';


//user validation schema zod
const userSchema = z.object({
  name: z
    .string({ error: "O nome � obrigat�rio" })
    .min(3, 'O nome deve conter pelo menos 3 caracteres'),
  email: z
    .string()
    .min(1, { message: 'O campo "Email" � obrigat�rio' })
    .email("Formato de email inv�lido"),
  password: z
    .string({ error: "A senha � obrigat�ria" })
    .min(8, { message: 'A senha deve conter no m�nimo 8 caracteres' })
    .max(32, { message: 'A senha deve conter no m�ximo 32 caracteres' })
    .refine((password) => /[A-Z]/.test(password), { message: 'A senha deve conter pelo menos uma letra mai�scula' })
    .refine((password) => /[a-z]/.test(password), { message: 'A senha deve conter pelo menos uma letra min�scula' })
    .refine((password) => /[0-9]/.test(password), { message: 'A senha deve conter pelo menos um n�mero' })
    .refine((password) => /[!@#$%^&*(),.?":{}|<>]/.test(password), { message: 'A senha deve conter pelo menos um caractere especial' }),
})

const updatePasswordSchema = z
  .object({
    newPassword: userSchema.shape.password,
    confirmPassword: z
      .string()
  });

//create user
export const create_user = async (req: Request, res: Response, next: NextFunction) => {
  const result = userSchema.safeParse(req.body);

  if (!result.success) {
    const flatenned = result.error.flatten();
    return res.status(400).json({
      success: false,
      message: 'Dados inv�lidos para cria��o de usu�rio',
      errors: flatenned.fieldErrors
    });
  }
  const user = new User(result.data);

  try {
    await user.save();
    res.status(201).json({ _id: user._id, name: user.name, email: user.email });
  } catch (err: any) {
    if (err.code === 11000) {
      return next(new app_error_class('Email j� cadastrado', 409));
    }
  }

}
//login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const validation = userSchema.pick({ email: true, password: true }).safeParse(req.body);
  if (!validation.success) {
    const flatenned = validation.error.flatten();
    return res.status(400).json({
      success: false,
      message: 'Dados inv�lidos para login',
      errors: flatenned.fieldErrors
    });
  }
  const { email, password } = validation.data;

  try {
    const user = await User.findOne({ email: { $eq: email } });
    if (!user) {
      return next(new app_error_class('Email ou senha incorretos!', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new app_error_class('Email ou senha incorretos!', 401));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new app_error_class('JWT_SECRET n�o est� definido', 422));
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


//update_password
export const update_password = async (req: Request, res: Response, next: NextFunction) => {
  const validation = updatePasswordSchema.safeParse(req.body);
  const userId = (req as any).userId;

  if (userId !== req.params.id) {
    return next(new app_error_class('Acesso não autorizado', 403));
  }

  if (!validation.success) {
    const flatenet = validation.error.flatten();
    return res.status(400).json({
      success: false,
      message: 'Dados inv�lidos para atualiza��o de senha',
      errors: flatenet.fieldErrors
    });
  }

  const { newPassword, confirmPassword } = validation.data;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new app_error_class('Usu�rio n�o encontrado', 404));
    }

    const isSameAsOldPassword = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOldPassword) {
      return next(new app_error_class('A nova senha n�o pode ser igual a senha atual', 400));
    }

    if (newPassword !== confirmPassword) {
      return next(new app_error_class('A senha de confirma��o n�o corresponde � nova senha', 400));
    };

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso!' });
  } catch (err) {
    return next(err);
  }
};