import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.html',
  styleUrls: ['./confirm-modal.scss'],
})
export class ConfirmModalComponent {
  mensaje = input<string>('');
  visible = input<boolean>(false);

  confirmar = output<void>();
  cancelar = output<void>();
}
