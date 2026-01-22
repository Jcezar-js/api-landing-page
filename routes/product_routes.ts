import express from 'express';
import {authMiddleware} from '../middlewares/auth_middleware';
import upload from '../controllers/config/multer';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductQuote
} from '../controllers/product_controller'

const router = express.Router();
//Rotas de produto públicas
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/quote/:id', getProductQuote);
//Rotas protegidas
router.post('/', authMiddleware, upload.array('photos',5),createProduct);
router.patch('/:id', authMiddleware, upload.array('photos',5),updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);



export default router;