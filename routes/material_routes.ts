import express from 'express';
import { authMiddleware } from '../middlewares/auth_middleware';
import {
  createMaterial,
  getAllMaterials,
  getMaterialbyId,
  updateMaterial,
  deleteMaterial
} from '../controllers/material_controller';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createMaterial);
router.get('/', getAllMaterials);
router.get('/:id', getMaterialbyId);
router.patch('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

export default router;