import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { BooksPreference, tasksStore } from '@ht/shared/data/stores/tasks/store';

@Component({
  selector: 'app-book-prefs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
  template: `
    <form (submit)="handleForm($event)">
      <select [formField]="form.sortBy" class="select">
        <option value="" disabled [selected]="this.store.booksPreference().sortBy === ''">
          Select Sort Preferences
        </option>
        <option value="author" [selected]="this.store.booksPreference().sortBy === 'author'">
          Author
        </option>
        <option value="title" [selected]="this.store.booksPreference().sortBy === 'title'">
          Title
        </option>
        <option value="year" [selected]="this.store.booksPreference().sortBy === 'year'">
          Year
        </option>
      </select>
      @if (form.sortBy().value() || this.store.booksPreference().sortAscending) {
        <label>
          <input
            type="checkbox"
            [formField]="form.sortAscending || this.store.booksPreference().sortAscending"
          />
          Sort Ascending
        </label>
      }
      <div class="flex items-center gap-3">
        <button type="submit" class="btn btn-primary">Save</button>
        <button
          type="button"
          class="btn btn-primary"
          (click)="store.updateBookPreferences({ sortBy: '', sortAscending: false })"
        >
          Clear Preferences
        </button>
      </div>
    </form>
  `,
  styles: ``,
})
export class Prefs {
  trueBoolean = true;
  sortModel = signal<BooksPreference>({ sortBy: '', sortAscending: false });
  form = form(this.sortModel);
  store = inject(tasksStore);
  handleForm($event: SubmitEvent) {
    $event.preventDefault();
    this.store.updateBookPreferences(this.sortModel());
  }
}
