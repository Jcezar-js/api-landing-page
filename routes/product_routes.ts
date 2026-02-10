import express from 'express';
import {auth_middleware} from '../middlewares/auth_middleware';
import upload from '../controllers/config/multer';
import {
  get_all_products,
  get_product_by_id,
  create_product,
  update_product,
  delete_product,
  get_product_quote
} from '../controllers/product_controller'
import { rate_limiter } from '../middlewares/rate_limiting';

const products_router = express.Router();

products_router.use(rate_limiter);
//Rotas de produto públicas
products_router.get('/', get_all_products);
products_router.get('/:id', get_product_by_id);
products_router.post('/quote/:id', get_product_quote);
//Rotas protegidas
products_router.post('/', auth_middleware, upload.array('photos',5),create_product);
products_router.patch('/:id', auth_middleware, upload.array('photos',5),update_product);
products_router.delete('/:id', auth_middleware, delete_product);



export default products_router;