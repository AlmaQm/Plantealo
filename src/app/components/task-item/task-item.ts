import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GardenTask } from '../../models/interfaces';

@Component({
   selector: 'app-task-item',
   standalone: true,
   imports: [CommonModule],
   templateUrl: './task-item.html',
   styleUrls: ['./task-item.scss']
})
export class TaskItemComponent {

   @Input() task!: GardenTask;

   @Output() toggle = new EventEmitter<GardenTask>();

   toggleTask() {
      this.toggle.emit(this.task);
   }
}