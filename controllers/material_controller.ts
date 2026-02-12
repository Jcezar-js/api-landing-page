import {Request, Response, NextFunction} from 'express';
import Material from '../models/material_schema';
import { app_error_class } from '../middlewares/error_handling_middleware';
import {z} from 'zod';

const materialSchemaValidator = z.object({
  name: z
    .string()
    .min(2, 'O nome do material deve conter pelo menos 2 caracteres'),
  category: z
    .enum(['MDF', 'Madeira Maciça', 'Compensado', 'Aglomerado', 'Metal', 'Vidro', 'Plástico', 'Tecido', 'Couro', 'Espuma', 'Ferragem']),
  unit: z
    .enum(['m2', 'm', 'unidade', 'kg', 'litro']),
  pricePerUnit: z.coerce.number()
    .nonnegative('O preço por unidade deve ser um número positivo'),
  wasteFactor: z.coerce.number()
    .positive('O fator de desperdício deve ser um número positivo')
    .optional()

});

export const get_all_materials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const materials = await Material.find();
    res.json(materials);
  } catch (err: any) {
    return next(err);
  }
};

export const get_material_by_id = async (req:Request, res:Response, next: NextFunction) => {
  try {
    const material = await Material.findById(req.params.id);
    if (material == null){
      return next (new app_error_class('Material não encontrado', 404))
    }
    res.json(material);
  } catch (err: any) {
    return next (err);
  }
};

export const create_material = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = materialSchemaValidator.safeParse(req.body);
    if (!validation.success) {
      const flatenned = validation.error.flatten();
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos para criação de material',
        errors: flatenned.fieldErrors
      });
    }

    const material = new Material(validation.data);
    await material.save();
    res.status(201).json(material);
  } catch (err: any){
    return next(err);
  }
};

export const update_material = async (req:Request, res:Response, next: NextFunction) => {
  try {
    const validation = materialSchemaValidator.partial().safeParse(req.body);
    if (!validation.success) {
      const flatenned = validation.error.flatten();
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos para atualização de material',
        errors: flatenned.fieldErrors
      });
    }

    const material = await Material.findByIdAndUpdate(req.params.id, validation.data, { new: true });
    if (material == null){
      return next (new app_error_class('Material não encontrado', 404))
    }
    res.json(material);
  } catch (err: any) {
    return next (err);
  }
};

  export const delete_material = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (material == null){
      return next (new app_error_class('Material não encontrado', 404));
    }
    res.json({message: 'Material deletado com sucesso'});
  } catch (err: any) {
    return next (err);
  }
};


