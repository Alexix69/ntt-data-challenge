import { Routes } from '@angular/router';
import { ProductsComponent } from './components/products/products.component';
import { AddProductComponent } from './components/add-product/add-product.component';

export const routes: Routes = [
  { path: '', redirectTo: '/bp/products', pathMatch: 'full' },
  { path: 'bp/products', component: ProductsComponent },
  { path: 'bp/products/add', component: AddProductComponent },
];
