import { ProductPage, ProductPageError } from './ProductPage';
import { productPageLoader } from './productPageLoader';

export const Component = ProductPage;
export const ErrorBoundary = ProductPageError;
export const loader = productPageLoader;
