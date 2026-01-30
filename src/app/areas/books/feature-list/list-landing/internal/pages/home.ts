import { httpResource } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { PageLayout } from '@ht/shared/ui-common/layouts/page';
import { BookInfo } from './book-info';

export type BookDisplay = {
  id: string;
  title: string;
  author: string;
  year: number;
  pages: number;
};
@Component({
  selector: 'ht-home-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageLayout, BookInfo],
  template: `
    <app-ui-page title="list">
      @if (booksResource.hasValue()) {
        <app-book-info [bookList]="booksResource.value()" />
      }
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>
                <button class="btn btn-outline btn-primary" (click)="(sortByAuthor)">Author</button>
              </th>
              <th><button class="btn btn-soft btn-info">Title</button></th>
              <th><button class="btn btn-soft btn-accent" (click)="(sortByYear)">Year</button></th>
            </tr>
          </thead>
          <tbody>
            @for (book of booksResource.value(); track book.id) {
              <tr>
                <td>{{ book.author }}</td>
                <td>{{ book.title }}</td>
                <td>{{ book.year }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-ui-page>
  `,
  styles: ``,
})
export class HomePage {
  booksResource = httpResource<BookDisplay[]>(() => '/api/books');
  sortedBooksResource = computed(() => this.booksResource.value() || []);

  sortByAuthor() {
    // tried a bunch of stuff but not really sure how to update the list order with signals
    this.booksResource.set(
      this.booksResource.value()?.sort((a, b) => {
        const nameA = a.title.toUpperCase();
        const nameB = b.title.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      }),
    );
  }

  sortByYear() {
    this.booksResource.set(this.booksResource.value()?.sort((a, b) => a.year - b.year));
  }
}
