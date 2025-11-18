require('dotenv').config()

import express from 'express'
const app = express()
import mongoose from 'mongoose'
const DB_URL = process.env.DATABASE_URL
const PORT = process.env.PORT || 3001

if (!DB_URL){
  console.error('DATABASE_URL não está definido nas variáveis de ambiente.')
  process.exit(1)
}


mongoose.connect(DB_URL)
const db = mongoose.connection
db.on('error', (error) => console.error('Erro ao conectar ao banco: ', error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

const productsRouter = require('./Routes/product_route')

app.use('/api/products', productsRouter)

app.listen(PORT,()=>console.log('Server Started on port ', PORT));