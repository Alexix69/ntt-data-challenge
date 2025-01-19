import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-add-product',
  imports: [],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back(); // Vuelve a la ruta anterior
  }
}
