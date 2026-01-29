import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import products_router from './routes/product_routes';
import auth_router from './routes/auth_routes';
import material_router from './routes/material_routes';

const app = express();
const DB_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3001;

if (!DB_URL){
  console.error('DATABASE_URL não está definido nas variáveis de ambiente.');
  process.exit(1);
}

//conexão com banco de dados
mongoose.connect(DB_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error('Erro ao conectar ao banco: ', error));
db.once('open', () => console.log('Conectado ao MongoDB'));

app.use(express.json())

// Usar as rotas de produtos
app.use('/api/products', products_router);
//usar as rotas de autenticação
app.use('/api/auth', auth_router);
//usar as rotas de materiais
app.use('/api/materials', material_router);

app.listen(PORT,()=>console.log('Server iniciado na porta', PORT));