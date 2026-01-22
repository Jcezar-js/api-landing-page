import Product from '../models/product_schema';
import Material from '../models/material_schema';

interface Dimensions {
  height: number;
  width: number;
  depth: number;
}

export const calculateProductPrice = async (productId: string, dimensions: Dimensions) => {
  // Busca o produto com os materiais populados
  const product = await Product.findById(productId).populate('components.material');
  if (!product) throw new Error('Produto não encontrado');

  //Valida as dimensões
  if (dimensions.height < product.constraints.minHeight || dimensions.height > product.constraints.maxHeight) {
    throw new Error(`Altura inválida. Mínimo: ${product.constraints.minHeight}, Máximo: ${product.constraints.maxHeight}`);
  };
  if (dimensions.width < product.constraints.minWidth || dimensions.width > product.constraints.maxWidth) {
    throw new Error(`Largura inválida. Mínimo: ${product.constraints.minWidth}, Máximo: ${product.constraints.maxWidth}`);
  };
  if (dimensions.depth < product.constraints.minDepth || dimensions.depth > product.constraints.maxDepth) {
    throw new Error(`Profundidade inválida. Mínimo: ${product.constraints.minDepth}, Máximo: ${product.constraints.maxDepth}`);
  };

  let totalMaterialCost = 0;
  const area = dimensions.height * dimensions.width / 1000000; // área em m2
  const perimeter = 2 * (dimensions.height + dimensions.width) / 1000; // perímetro em metros

  const technicalSheet = [];

  //ITERA SOBRE OS COMPONENTES PARA CALCULAR O CUSTO
  for (const component of product.components) {
    const material: any = component.material;
    let quantityConsumed = 0;

    switch (component.quantityType) {
      case 'fixed':
        quantityConsumed = component.quantityFactor;
        break;
      case 'area_based':
        quantityConsumed = area * component.quantityFactor;
        break;
      case 'perimeter_based':
        quantityConsumed = perimeter * component.quantityFactor;
        break;
    }

    //APlica o fator de desperdicio
    const finalQuantity = quantityConsumed * material.wasteFactor;
    const materialCost = finalQuantity * material.pricePerUnit;
    
    totalMaterialCost += materialCost;

    technicalSheet.push({
      materialName: material.name,
      quantityConsumed: finalQuantity.toFixed(2),
      unit: material.unit,
      cost: materialCost.toFixed(2)
    });
  }

  //preço final
  const totalBaseCost = totalMaterialCost + product.baseLaborCost;
  const finalPrice = totalBaseCost * (1 + product.profitMargin / 100);

  return ({
    finalPrice: Math.ceil(finalPrice),
    details: {
      totalMaterialCost,
      laborCost: product.baseLaborCost,
      profit: finalPrice - totalBaseCost,
      technicalSheet
    }
    });
}