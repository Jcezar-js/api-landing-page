import mongoose, {Schema, Document} from 'mongoose'

const componentSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  // O marceneiro define: "Para este móvel, gasto X unidades deste material por cada m2 de área frontal"
  // ou "Gasto X unidades fixas independente do tamanho
  quantityType:{
    type: String,
    enum:[ 'fixed', 'area_based', 'perimeter_based'],
    required: true
  },
  quantityFactor:{
    type: Number,
    required: true,
  }
}, {_id: false});

const productSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String, required: true},
  photos: [{type: String}],
  isFeatured: {type: Boolean, default: false},

  constraints: {
    minHeight: {type: Number, required: true},
    maxHeight: {type: Number, required: true},
    minWidth: {type: Number, required: true},
    maxWidth: {type: Number, required: true},
    minDepth: {type: Number, required: true},
    maxDepth: {type: Number, required: true},
  },

  components: [componentSchema],

  baseLaborCost: {type: Number, required: true}, //Mão de obra base
  profitMargin: {type: Number, default: 50}, // margem de lucro em  % 
}, {timestamps: true})

export interface IProduct extends Document {
  name: string;
  description: string;
  constraints:{
    minHeight: number;
    maxHeight: number;
    minWidth: number;
    maxWidth: number;
    minDepth: number;
    maxDepth: number;
  };
  components: Array<{
    material: mongoose.Types.ObjectId;
    quantityType: 'fixed' | 'area_based' | 'perimeter_based';
    quantityFactor: number;
  }>;
  baseLaborCost: number;
  profitMargin: number;
  photos: string[];
  isFeatured: boolean;
}


export default mongoose.model<IProduct>('Product', productSchema)