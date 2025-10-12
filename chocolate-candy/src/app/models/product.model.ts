export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  weight: string; // e.g., "100g", "150g (3 blocks)"
  category: string; // e.g., "Signature Chocolate Bars"
  img?: string;
  priceNote?: string; // e.g., "Starts at"
}

export interface ProductCategory {
  name: string;
  products: Product[];
}
