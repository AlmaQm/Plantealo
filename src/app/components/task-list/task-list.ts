import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GardenTask } from '../../models/interfaces';
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.scss']
})
export class TaskListComponent {
  @Input() task?: GardenTask;

  // Emite un evento cuando una tarea cambia
  toggleTask(task: GardenTask) {
    task.completed = !task.completed;
    console.log(`Tarea ${task.title} ahora está: ${task.completed ? 'Completada' : 'Pendiente'}`);

    // Aquí podrías llamar a un servicio para guardar el cambio en BD
  }
}