import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.html',
  styleUrls: ['./page-header.scss'],
})
export class PageHeaderComponent {
  titulo = input.required<string>();
  subtitulo = input<string>('');
  bg = input<string>('earth-1'); // 'earth-1' o 'md-bg'
}
