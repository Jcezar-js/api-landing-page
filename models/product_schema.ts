const mongoose = require('mongoose');
// Definição do esquema do produto
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // Remove espaços em branco no início e no fim
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
// Armazenamento da URL das fotos
  photos: [{
    type: String,
  }],
// Para ordenar ou destacar produtos

  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true // Adiciona campos createdAt e updatedAt automaticamente

});

export default mongoose.model('product', productSchema)