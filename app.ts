import products_router from './routes/product_routes';
import auth_router from './routes/auth_routes';
import material_router from './routes/material_routes';
import cors from 'cors';
import { error_handling_middleware } from './middlewares/error_handling_middleware';
import express from 'express';
import helmet from 'helmet';

const app = express();

//origens permitidas CORS
const allowed_origins = ['http://localhost:12000', 'http://localhost:12001'];

const options: cors.CorsOptions = {
  origin: allowed_origins,
};



//middleware para parsear o corpo da requisição
app.use(express.json());
//middleware para permitir CORS

app.use(cors(options));
app.use(helmet());

//usar as rotas de produtos
app.use('/api/products', products_router);
//usar as rotas de autenticação
app.use('/api/auth', auth_router);
//usar as rotas de materiais
app.use('/api/materials', material_router);

// Global error handler - DEVE vir depois de todas as rotas
app.use(error_handling_middleware);

//exportar app para ser usado no server.ts
export default app;
