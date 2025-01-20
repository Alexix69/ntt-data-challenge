import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-modal',
  imports: [CommonModule],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css',
})
export class DeleteModalComponent {
  @Input() title: string = '';
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  closeModal() {
    this.visible = false;
    this.close.emit();
  }

  onConfirm() {
    this.visible = false;
    this.confirm.emit();
  }
}
