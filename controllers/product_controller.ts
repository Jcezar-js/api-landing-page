import {Request, Response} from 'express';
import Product from '../models/product_schema';
import { calculateProductPrice } from './pricing_service';
import {z} from 'zod';

const productSchema = z.object({
  name: z
    .string({ error : "O nome é obrigatório"})
    .min(3, 'O nome deve conter pelo menos 3 caracteres'),
  description: z
    .string()
    .min(1, 'A descrição é obrigatória'),
  price: z.coerce
    .number()
    .nonnegative('O preço deve ser um número positivo'),
  photos: z
    .array(z.string().url())
    .optional(),
  isFeatured: z.coerce
    .boolean()
    .optional()
})

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  }catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
//Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product == null){
      return res.status(404).json({message: 'Produto não encontrado'});
    }
    res.json(product);
  }catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
//Create a new product
export const createProduct = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const newPhotos = files?.map(file => file.path) || [];
  const dataToValidate = {
    ...req.body,
    photos: newPhotos
  }


  const resultado = productSchema.safeParse(dataToValidate);
  if (!resultado.success) {
    return res.status(400).json({ errors: resultado.error.issues });
  }
  
  const {name, description, price, photos, isFeatured} = resultado.data;
  const product = new Product({
    name,
    description,
    price,
    photos,
    isFeatured: isFeatured ?? false,
  });

  try {
    const newProduct =  await product.save();
    res.status(201).json(newProduct);
  } catch (err:any){
    res.status(400).json({ message: err.message });
  }
}



//Update an existing product
export const updateProduct = async (req: Request, res: Response) => {
  try{
    //Valida ID busca e atualiza em tempo real 
    // O { new: true } diz ao Mongoose para retornar o objeto JÁ atualizado, não o antigo.
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new: true, runValidators: true} // runValidators garante que as regras do Schema (ex: min length) sejam respeitadas
    );
    if (updateProduct == null){
      return res.status(404).json({message: 'Produto não encontrado'});
    }
    res.json(updateProduct);
  } catch (err:any){
    res.status(400).json({ message: err.message });
  }
}


  //Delete a product

export const deleteProduct = async (req: Request, res: Response) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (product == null){
        return res.status(404).json({message: 'Produto não encontrado'});
      }  else {
        res.json({message: 'Produto deletado com sucesso'});
      }
    }catch (err:any) {
      res.status(500).json({ message: err.message });
    }
  }


  export const getProductQuote = async (req: Request, res: Response) => {
    const productId = req.params.id;

    //zod para validar dimensões enviadas pelo cliente

    const dimensionsSchema = z.object({
      height: z.coerce.number().positive('A altura deve ser um número positivo'),
      width: z.coerce.number().positive('A largura deve ser um número positivo'),
      depth: z.coerce.number().positive('A profundidade deve ser um número positivo'),
    });

    const validation = dimensionsSchema.safeParse(req.body);
    if (!validation.success){
      return res.status(400).json({ errors: validation.error.issues });
    }

    try {
      const quote = await calculateProductPrice(productId, validation.data);
      res.json(quote);
    } catch (err:any) {
      res.status(400).json({ message: err.message }); 
    }

  };

  