import {Request, Response} from 'express';
import Material from '../models/material_schema';
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

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const validation = materialSchemaValidator.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues });
    }

    const material = new Material(validation.data);
    await material.save();
    res.status(201).json(material);
  } catch (err: any){
    res.status(500).json({ message: err.message });
  }
};

export const getAllMaterials = async (req: Request, res: Response) => {
  try {
    const materials = await Material.find();
    res.json(materials);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMaterialbyId = async (req:Request, res:Response) => {
  try {
    const material = await Material.findById(req.params.id);
    if (material == null){
      return res.status(404).json({message: 'Material não encontrado'});
    }
    res.json(material);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMaterial = async (req:Request, res:Response) => {
  try {
    const validation = materialSchemaValidator.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues });
    }

    const material = await Material.findByIdAndUpdate(req.params.id, validation.data, { new: true });
    if (material == null){
      return res.status(404).json({message: 'Material não encontrado'});
    }
    res.json(material);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMaterial = async (req:Request, res:Response) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (material == null){
      return res.status(404).json({message: 'Material não encontrado'});
    }
    res.json({message: 'Material deletado com sucesso'});
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


