import {Request, Response, NextFunction} from 'express';
import Product from '../models/product_schema';
import { calculateProductPrice } from '../services/pricing_service';
import {z} from 'zod';
import { app_error_class } from '../middlewares/error_handling_middleware';

const productSchema = z.object({
  name: z
    .string({ error : "O nome é obrigatório"})
    .min(3, 'O nome deve conter pelo menos 3 caracteres'),
  description: z
    .string({ error: "A descrição é obrigatória"})
    .min(10, 'A descrição deve conter pelo menos 10 caracteres'),
  photos: z
    .array(z.string().url())
    .optional(),
  isFeatured: z.coerce
    .boolean()
    .optional(),
  constraints: z.object({
    minHeight: z
      .coerce
      .number({error: "A Altura mínima é obrigatória"})
      .positive('A altura mínima deve ser um número positivo'),
    maxHeight: z
      .coerce
      .number({error: "A Altura máxima é obrigatória"})
      .positive('A altura máxima deve ser um número positivo'),
    minWidth: z
      .coerce
      .number({error: "A largura mínima é obrigatória"})
      .positive('A largura mínima deve ser um número positivo'),
    maxWidth: z
      .coerce
      .number({error: "A largura máxima é obrigatória"})
      .positive('A largura máxima deve ser um número positivo'),
    minDepth: z
      .coerce
      .number({error: "A profundidade mínima é obrigatória"})
      .positive('A profundidade mínima deve ser um número positivo'),
    maxDepth: z
      .coerce
      .number({error: "A profundidade máxima é obrigatória"})
      .positive('A profundidade máxima deve ser um número positivo'),
  }),
  components: z.array(z.object({
    material: z
      .string()
      .uuid('ID do material inválido'),
    quantityType: z
      .enum(['fixed', 'area_based', 'perimeter_based']),
    quantityFactor: z
      .number()
      .positive('O fator de quantidade deve ser um número positivo'),
  })),
  baseLaborCost: z
    .coerce
    .number({error: "O custo da mão de obra base é obrigatório"})
    .positive('O custo da mão de obra base deve ser um número positivo'),
  profitMargin: z
    .coerce
    .number()
    .positive('A margem de lucro deve ser um número positivo'),
})

// Get all products
export const get_all_products = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find();
    res.json(products);
  }catch (err: any) {
    return next(err);
  }
}
//Get product by ID
export const get_product_by_id = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product){
      return next(new app_error_class('Produto não encontrado', 404));
    }
    res.json(product);
  }catch (err) {
    return next(err);
  }
}
//Create a new product
export const create_product = async (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const newPhotos = files?.map(file => file.path) || [];
  const dataToValidate = {
    ...req.body,
    photos: newPhotos
  }


  const resultado = productSchema.safeParse(dataToValidate);
  if (!resultado.success) {
    const flatenned = resultado.error.flatten();
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos para criação de material',
        errors: flatenned.fieldErrors
      });
    }

  
  const {name, description, photos, isFeatured} = resultado.data;
  const product = new Product({
    name,
    description,
    photos,
    isFeatured: isFeatured ?? false,
    constraints: resultado.data.constraints,
    components: resultado.data.components,
    baseLaborCost: resultado.data.baseLaborCost,
    profitMargin: resultado.data.profitMargin,
  });

  try {
    const newProduct =  await product.save();
    res.status(201).json(newProduct);
  } catch (err){
    return next(err);
  }
}



//Update an existing product
export const update_product = async (req: Request, res: Response, next: NextFunction) => {
  try{
    //Valida os dados contra o schema
    const validation = productSchema.partial().safeParse(req.body);
    if (!validation.success) {
      const flatenned = validation.error.flatten();
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos para atualização de produto',
        errors: flatenned.fieldErrors
      });
    }
  
    //Valida ID busca e atualiza em tempo real 
    // O { new: true } diz ao Mongoose para retornar o objeto JÁ atualizado, não o antigo.
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {$set: validation.data},
      {new: true, runValidators: true} // runValidators garante que as regras do Schema (ex: min length) sejam respeitadas
    );
    if (updateProduct == null){
      return next(new app_error_class('Produto não encontrado', 404));
    }
    res.json(updateProduct);
  } catch (err){
    return next(err);
  }
}


  //Delete a product

export const delete_product = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (product == null){
        return next(new app_error_class('Produto não encontrado', 404));
      }  else {
        res.json({message: 'Produto deletado com sucesso'});
      }
    }catch (err) {
      return next(err);
    }
  }


    export const get_product_quote = async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    //zod para validar dimensões enviadas pelo cliente

    const dimensionsSchema = z.object({
      height: z
      .coerce
      .number({error: "A altura é obrigatória"})
      .positive('A altura deve ser um número positivo'),
      width: z
      .coerce
      .number({error: "A largura é obrigatória"})
      .positive('A largura deve ser um número positivo'),
      depth: z
      .coerce
      .number({error: "A profundidade é obrigatória"})
      .positive('A profundidade deve ser um número positivo'),
    });

    const validation = dimensionsSchema.safeParse(req.body);
    if (!validation.success){
      return next(new app_error_class('Dados inválidos para cálculo de preço', 400));
    }

    try {
      const quote = await calculateProductPrice(productId, validation.data);
      res.json(quote);
    } catch (err) {
      return next(err);
    }

  };

  