import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { BookDisplay } from './home';

@Component({
  selector: 'app-book-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <table class="table table-zebra">
      <thead>
        <tr>
          <th>Total Books</th>
          <th>Oldest Book</th>
          <th>Newest Book</th>
          <th>Average Book Length</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ bookList().length }}</td>
          <td>{{ oldestBook() }}</td>
          <td>{{ newestBook() }}</td>
          <td>{{ averagePages() }}</td>
        </tr>
      </tbody>
    </table>
  `,
  styles: ``,
})
export class BookInfo {
  bookList = input.required<BookDisplay[]>();

  oldestBook = computed(
    () => this.bookList().reduce((b1, b2) => (b1.year < b2.year ? b1 : b2)).year,
  );
  newestBook = computed(
    () => this.bookList().reduce((b1, b2) => (b1.year > b2.year ? b1 : b2)).year,
  );

  averagePages = computed(() => this.bookList().reduce((acc, book) => acc + book.pages, 0));
}
