import express from 'express';
import { authMiddleware } from '../middlewares/auth_middleware';
import {
  create_material,
  get_all_materials,
  get_material_by_id,
  update_material,
  delete_material
} from '../controllers/material_controller';

const router = express.Router();

router.use(authMiddleware);

router.post('/', create_material);
router.get('/', get_all_materials);
router.get('/:id', get_material_by_id);
router.patch('/:id', update_material);
router.delete('/id', delete_material);

export default router;