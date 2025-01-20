import { Component, OnInit } from '@angular/core';
import { Product } from '../../interfaces/product.interface';
import {
  ProductsService,
  SuccessResponse,
  ErrorResponse,
} from '../../services/products.service';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, DatePipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeleteModalComponent } from '../../shared/delete-modal/delete-modal.component';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-products',
  imports: [
    FormsModule,
    AsyncPipe,
    ReactiveFormsModule,
    DatePipe,
    CommonModule,
    DeleteModalComponent,
    ModalComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  constructor(
    private productsService: ProductsService,
    private router: Router
  ) {}

  modalVisible: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  isSuccess: boolean = true;
  deleteModalVisible: boolean = false;
  deleteModalTitle: string = '';

  filteredProducts$: BehaviorSubject<Product[]> = new BehaviorSubject<
    Product[]
  >([]);
  products: Product[] = [];
  error: string = '';
  searchTerm = new FormControl('');
  itemsPerPage = new FormControl(5);
  idProduct: string = '';

  ngOnInit(): void {
    this.loadProducts();
    this.searchTerm.valueChanges
      .pipe(debounceTime(300))
      .subscribe((searchTerm) => {
        this.filterProducts(searchTerm!);
      });

    this.itemsPerPage.valueChanges.subscribe((value) => {
      const filtered = this.products.slice(0, value!);
      this.filteredProducts$.next(filtered);
    });
  }

  loadProducts(): void {
    this.productsService.getAll().subscribe({
      next: (response: SuccessResponse<Product[]> | ErrorResponse) => {
        if ('data' in response) {
          this.products = response.data;
          this.filteredProducts$.next(
            this.products.slice(0, this.itemsPerPage.value!)
          );
        } else {
          this.showModal('Error', response.message, false);
        }
      },
      error: (error) => {
        this.showModal('Error', error, false);
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

  menuOptions = [
    { label: 'Editar', value: 'edit' },
    { label: 'Eliminar', value: 'delete' },
  ];

  openMenus: Set<number> = new Set();

  toggleMenu(index: number): void {
    if (this.openMenus.has(index)) {
      this.openMenus.delete(index);
    } else {
      this.openMenus.clear();
      this.openMenus.add(index);
    }
  }

  isMenuOpen(index: number): boolean {
    return this.openMenus.has(index);
  }

  onSelectOption(product: Product, option: string): void {
    if (option === 'edit') {
      this.productsService.productNextValue = product;
      this.router.navigate(['/bp/products/edit', product.id]);
    }
    if (option === 'delete') {
      this.idProduct = product.id;
      this.showDeleteModal(product.name);
    }
    this.openMenus.clear();
  }

  showDeleteModal(title: string) {
    this.deleteModalTitle = title;
    this.deleteModalVisible = true;
  }

  closeDeleteModal() {
    this.deleteModalVisible = false;
  }

  confirmDelete() {
    this.productsService.delete(this.idProduct).subscribe({
      next: (response) => {
        this.showModal('Éxito', response.message, true);
      },
      error: (error) => {
        this.showModal('Ha ocurrido un error', error, false);
      },
    });
    this.closeDeleteModal();
  }

  showModal(title: string, message: string, isSuccess: boolean) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.isSuccess = isSuccess;
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
    this.loadProducts();
  }
}
