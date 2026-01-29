/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, maxLength, minLength, required } from '@angular/forms/signals';
import { TaskEntity, tasksStore } from '@ht/shared/data/stores/tasks/store';
import { FormInputComponent } from '@ht/shared/ui-common/forms/inputs/form-input';
import { PageLayout } from '@ht/shared/ui-common/layouts/page';

// Creating a provider WHEREEVER means you are saying "create a new instance of this thing when injected here"
@Component({
  selector: 'ht-home-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageLayout, DatePipe, DecimalPipe, FormField, FormInputComponent],

  template: `
    <app-ui-page title="Your Tasks">
      @if (isEditing()) {
        <form (submit)="handleForm($event)">
          <div class="form-control w-full max-w-xs">
            <label class="label"> Description: </label>

            <app-ui-form-input
              id="description"
              label="Description"
              [formField]="form.description"
            />

            <button class="btn btn-primary mt-4" type="submit">Save Task</button>
          </div>
        </form>
      } @else {
        <!-- head -->
        <table class="table mb-8">
          <thead>
            <tr>
              <th>Task</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Total Minutes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (task of store.taskList(); track task.startTime) {
              <tr [title]="task.id" class=" animate-fade-out" [class.bg-base-100]="task.isLocal">
                <th>{{ task.description }}</th>
                <td>{{ task.startTime | date: 'shortTime' }}</td>
                <td>{{ task.endTime | date: 'shortTime' }}</td>
                <td>{{ task.minutes }}</td>
                <td colspan="5 ">
                  @if (task.isLocal) {
                    <button class="btn btn-error btn-xs" (click)="store.deleteTask(task)">
                      Abandon
                    </button>
                  }
                  @if (task.isLocal) {
                    <button class="btn btn-primary btn-xs ml-2" (click)="edit(task)">Update</button>
                  }
                  @if (task.isLocal && task.isValid) {
                    <button (click)="store.syncToServer(task)" class="badge badge-success ml-2">
                      Add To Log
                    </button>
                  }
                  @if (!task.isValid) {
                    <span class="ml-2">Needs Description</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
        <!-- stats -->
        @let s = store.stats();
        <div class="stats shadow flex flex-row bg-base-100 mt-auto p-6">
          <div class="stat place-items-center">
            <div class="stat-title">Number Of Tasks</div>
            <div class="stat-value text-primary">{{ s.totalTasks }}</div>
          </div>
          <div class="stat place-items-center">
            <div class="stat-title">Total Minutes on Tasks</div>
            <div class="stat-value text-primary">{{ s.totalMinutes }}</div>
          </div>
          <div class="stat place-items-center">
            <div class="stat-title">Average Length Of Task</div>
            <div class="stat-value text-primary">{{ s.averageMinutes | number: '1.0-2' }}</div>
          </div>
          <div class="stat place-items-center">
            <div class="stat-title">Longest Time Spent On A Task</div>
            <div class="stat-value text-primary">{{ s.longestTask }}</div>
          </div>
        </div>
      }
    </app-ui-page>
  `,
  styles: ``,
})
export class HomePage {
  currentEdit = signal<TaskEntity | null>(null);
  edit(task: TaskEntity) {
    this.model.set({
      id: task.id,
      description: task.description,
    });
    this.currentEdit.set(task);
    this.isEditing.set(true);
  }
  store = inject(tasksStore);
  isEditing = signal(false);

  // for a signal form, yo create a signal with the "initial state" of the thing that will hold your form values.
  model = signal<Pick<TaskEntity, 'description' | 'id'>>({
    id: '',
    description: '',
  });
  form = form(this.model, (sp) => {
    required(sp.description);
    minLength(sp.description, 5);
    maxLength(sp.description, 20);
  });
  handleForm($event: SubmitEvent) {
    $event.preventDefault();
    if (this.form().valid()) {
      this.store.changeDescription(this.currentEdit()!, this.model().description);
      this.isEditing.set(false);
      this.currentEdit.set(null);
    }
  }
}
