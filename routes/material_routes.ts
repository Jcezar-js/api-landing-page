import express from 'express';
import { auth_middleware } from '../middlewares/auth_middleware';
import {
  create_material,
  get_all_materials,
  get_material_by_id,
  update_material,
  delete_material
} from '../controllers/material_controller';
import { rate_limiter } from '../middlewares/rate_limiting';

const material_router = express.Router();


material_router.use(auth_middleware);
material_router.use(rate_limiter);

material_router.post('/', create_material);
material_router.get('/', get_all_materials);
material_router.get('/:id', get_material_by_id);
material_router.patch('/:id', update_material);
material_router.delete('/:id', delete_material);

export default material_router;