import mongoose, { mongo } from "mongoose";

const materialSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  category:{
    type:String,
    enum: ['MDF', 'Madeira Maciça', 'Compensado', 'Aglomerado', 'Metal', 'Vidro', 'Plástico', 'Tecido', 'Couro', 'Espuma', 'Ferragem'],
    required: true
  },
  unit:{
    type:String,
    enum:[ 'm2', 'm', 'unidade', 'kg', 'litro'],
    required: true
  },
  pricePerUnit:{
    type:Number,
    required:true
  },
  wasteFactor:{
    type: Number,
    default: 1.10,
    help: "Multiplicador de segurança para perca de material no corte"
  }
}, {timestamps: true});

export default mongoose.model('Material', materialSchema)