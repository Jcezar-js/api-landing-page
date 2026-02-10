import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import app from './app';

//variáveis de ambiente
const DB_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3001;


//validar variável de ambiente
if (!DB_URL){
  console.error('DATABASE_URL não está definido nas variáveis de ambiente.');
  process.exit(1);
}

//conexão com banco de dados
mongoose.connect(DB_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error('Erro ao conectar ao banco: ', error));
db.once('open', () => console.log('Conectado ao MongoDB'));


//inicializar servidor
app.listen(PORT, () => console.log('Server iniciado na porta', PORT));