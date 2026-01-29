import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/user_schema'

const createAdmin = async () => {
  const DB_URL = process.env.DATABASE_URL
  const PORT = process.env.PORT || 3001
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

    if (!DB_URL){
    console.error('DATABASE_URL não está definido nas variáveis de ambiente.')
    process.exit(1)
  }

  try{
    await mongoose.connect(DB_URL);
    console.log('Conectado ao MongoDB');
    
    const userExists = await User.findOne ({ email: adminEmail });

    if (!adminEmail || !adminPassword){
      console.error('ADMIN_EMAIL OU ADMIN_PASSWORD NÃO DEFINIDOS.');
      process.exit(1);
    }

  const newAdmin = new User ({
    name: 'Admin',
    email: adminEmail,
    password: adminPassword
  });

  await newAdmin.save();
  console.log('Usuário Admin criado com sucesso!');

  } catch (error){
    console.error('Erro ao criar admin', error);
  }finally{
    await mongoose.connection.close();
    console.log('Conexão fechada, encerrando...')
  }

}

createAdmin();