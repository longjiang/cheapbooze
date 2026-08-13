export interface Product {
  sku: string;
  name: string;
  namePrefix: string;
  nameSuffix: string;
  regularPrice: number;
  currentPrice: number;
  isLimitedTimeOffer: boolean;
  salePrice: number | null;
  volume: number;
  alcoholPercentage: number;
  pureAlcoholMl: number;
  pricePerMlPure: number;
  image: string;
  tastingDescription: string;
  consumerRating: number;
  votes: number;
  category: string;
  subCategory: string;
  style: string;
  countryName: string;
  isCraft: boolean;
  isOrganic: boolean;
  isExclusive: boolean;
  isNew: boolean;
  availableUnits: number;
  storeCount: number;
  upc: string[];
  ribbons: { id: string; label: string }[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  fetchedAt: string;
}
