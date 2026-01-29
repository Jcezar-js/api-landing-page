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

const router = express.Router();
//Rotas de produto públicas
router.get('/', get_all_products);
router.get('/:id', get_product_by_id);
router.post('/quote/:id', get_product_quote);
//Rotas protegidas
router.post('/', auth_middleware, upload.array('photos',5),create_product);
router.patch('/:id', auth_middleware, upload.array('photos',5),update_product);
router.delete('/:id', auth_middleware, delete_product);



export default router;