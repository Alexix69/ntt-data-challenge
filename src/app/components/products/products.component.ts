import { Component, OnInit } from '@angular/core';
import { Product } from '../../interfaces/product.interface';
import {
  ProductsService,
  SuccessResponse,
  ErrorResponse,
} from '../../services/products.service';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  imports: [FormsModule, AsyncPipe, ReactiveFormsModule, DatePipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  constructor(
    private productsService: ProductsService,
    private router: Router
  ) {}

  filteredProducts$: BehaviorSubject<Product[]> = new BehaviorSubject<
    Product[]
  >([]); // El BehaviorSubject
  products: Product[] = [];
  error: string = '';
  searchTerm = new FormControl('');
  itemsPerPage = new FormControl(1);

  ngOnInit(): void {
    this.loadProducts();
    // Suscripción al input para realizar el filtrado con debounce
    this.searchTerm.valueChanges
      .pipe(
        debounceTime(300) // Espera 300ms después de la última entrada
        //distinctUntilChanged() // Filtra los valores iguales
      )
      .subscribe((searchTerm) => {
        this.filterProducts(searchTerm!);
      });
    this.itemsPerPage.valueChanges.subscribe((value) => {
      const filtered = this.products.slice(0, value!);
      this.filteredProducts$.next(filtered); // Actualiza productos filtrados según el valor
    });
  }

  loadProducts(): void {
    this.productsService.getAll().subscribe({
      next: (response: SuccessResponse<Product[]> | ErrorResponse) => {
        if ('data' in response) {
          this.products = response.data;
          this.filteredProducts$.next(this.products.slice(0, 1));

          // this.filteredProducts = [...this.products];
        } else {
          this.error = response.message;
        }
      },
      error: (error) => {
        console.error('Error al cargar los productos', error);
        this.error = 'Ocurrió un error al obtener los productos.';
      },
    });
  }

  get productsLength(): number {
    let length = 0;
    this.filteredProducts$.subscribe((data) => {
      length = data.length;
    });
    return length;
  }

  private filterProducts(searchTerm: string): void {
    console.log('searchTerm', searchTerm);
    if (!searchTerm) {
      this.filteredProducts$.next(
        this.products.slice(0, this.itemsPerPage.value!)
      );
      return;
    }

    const filtered = this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(product.date_release)
          .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
          .includes(searchTerm) ||
        new Date(product.date_revision)
          .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
          .includes(searchTerm)
    );
    this.filteredProducts$.next(filtered);
  }

  addProduct() {
    this.router.navigate(['/bp/products/add']);
  }

  send() {
    this.loadProducts();
  }
}
