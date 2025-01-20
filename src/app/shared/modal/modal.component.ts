import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() isSuccess: boolean = true;
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.visible = false;
    this.close.emit();
  }
}
