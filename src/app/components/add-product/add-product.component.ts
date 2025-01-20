import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { catchError, map, of, Subscription } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Product } from '../../interfaces/product.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  imports: [ReactiveFormsModule, CommonModule, ModalComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent {
  modalVisible: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  isSuccess: boolean = true;
  productForm: FormGroup = new FormGroup({});
  product: Product | null = null;
  subscription: Subscription = new Subscription();
  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initProductForm();
    this.subscription.add(
      this.productsService.product.subscribe((product) => {
        if (product) {
          this.product = product;
          this.productForm.patchValue(product);
          this.productForm.get('id')?.disable();
        }
      })
    );

    this.productForm
      .get('date_release')
      ?.valueChanges.subscribe((releaseDate) => {
        console.log('Release Date:', releaseDate);
        if (releaseDate) {
          const reviewDate = this.addOneYearToDate(releaseDate);
          this.productForm
            .get('date_revision')
            ?.setValue(reviewDate, { emitEvent: false });
        }
      });
  }

  ngOnDestroy(): void {
    this.productsService.productNextValue = null;
    this.subscription.unsubscribe();
  }

  initProductForm() {
    this.productForm = this.fb.group({
      id: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
        [this.idValidator.bind(this)], 
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      logo: ['', Validators.required],
      date_release: ['', [Validators.required, this.releaseDateValidator]],
      date_revision: [{ value: '', disabled: true }, Validators.required],
    });
  }

  addOneYearToDate(date: string): string {
    const releaseDate = new Date(date);
    const reviewDate = new Date(
      releaseDate.setFullYear(releaseDate.getFullYear() + 1)
    );
    return reviewDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  idValidator(control: AbstractControl) {
    return this.productsService.verify(control.value).pipe(
      map((response) => {
        return response && !this.product ? { idExists: true } : null;
      }),
      catchError(() => of(null)) 
    );
  }

  releaseDateValidator(control: AbstractControl) {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; 
    const inputDateString = control.value; 
    return inputDateString >= todayString ? null : { invalidReleaseDate: true };
  }

  getFieldClass(fieldName: string) {
    const control = this.productForm.get(fieldName);
    return {
      valid: control?.valid && (control?.touched || control?.dirty),
      invalid: control?.invalid && (control?.touched || control?.dirty),
    };
  }

  goBack(): void {
    this.router.navigate(['/bp/products']);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    const formValues = { ...this.productForm.getRawValue() };
    if (this.product) {
      this.productsService.update(this.product.id, formValues).subscribe({
        next: (response) => {
          this.showModal('Éxito', response.message, true);
        },
        error: (error) => {
          this.showModal('Ha ocurrido un error', error, false);
        },
      });
    } else {
      this.productsService.create(formValues).subscribe({
        next: (response) => {
          this.showModal('Éxito', response.message, true);
        },
        error: (error) => {
          this.showModal('Ha ocurrido un error', error, false);
        },
      });
    }
  }

  fieldHasError(fieldName: string, errorName: string) {
    const control = this.productForm.get(fieldName);
    return control?.hasError(errorName) && (control.touched || control.dirty);
  }

  showModal(title: string, message: string, isSuccess: boolean) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.isSuccess = isSuccess;
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
    if (this.isSuccess) this.goBack();
  }

  onReset() {
    this.router.navigate(['/bp/products/add']);
  }
}
