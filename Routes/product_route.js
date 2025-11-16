const express = require ('express');
const router = express.Router();
const Product = require('../models/product_schema');

// Rota para obter todos os produtos 

router.get ('/', async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
      
})
//ROTA PARA OBTER PRODUTO PELO ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product == null){
      return res.status(404).json({message: 'Produto não encontrado'});
    }
    res.json(product);
  }catch (err) {
    res.status(500).json({ message: err.message });
}
}) 

// Rota para criar um novo produto
router.post('/', async (req, res) => {
// Desestruturar garante que você pegue apenas os campos necessários
const {name, description, price, photos, isFeatured} = req.body

if (!name || !description || !price == null) {
  return res.status(400).json({message: 'Nome, descrição e preço são obrigatórios.'});
}
  // Cria um novo objeto Product com os dados do 'body' da requisição
  const product = new Product({
    name: name,
    description:description,
    price: price,
    photos: photos || [],
    isFeatured: isFeatured || false, 
  });

  try {
    //Tenta salvar o novo produto no banco de dados
    const newProduct =  await product.save();
    res.status(201).json(newProduct); // Retorna o produto criado com status 201 (Created)
  } catch (err){
    res.status(400).json({ message: err.message }); // Retorna erro 400 (Bad Request) em caso de falha
  }
});



module.exports = router;