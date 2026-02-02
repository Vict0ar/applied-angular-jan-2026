import { httpResource } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { PageLayout } from '@ht/shared/ui-common/layouts/page';
import { BookInfo } from './book-info';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BooksPreference, tasksStore } from '@ht/shared/data/stores/tasks/store';

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
  imports: [PageLayout, BookInfo, MatIconModule, RouterLink],
  template: `<link
      href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet"
    />
    <app-ui-page title="list"
      ><button class="btn btn-square">
        <mat-icon><a routerLink="/books/prefs">settings</a></mat-icon>
      </button>

      @if (booksResource.hasValue()) {
        <app-book-info [bookList]="sortedBooksResourceX()" />
      }
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>
                <button class="btn btn-outline btn-primary" (click)="sortByAuthor()">Author</button>
              </th>
              <th><button class="btn btn-soft btn-info" (click)="sortByTitle()">Title</button></th>
              <th><button class="btn btn-soft btn-accent" (click)="sortByYear()">Year</button></th>
            </tr>
          </thead>
          <tbody>
            @for (book of sortedBooksResourceX(); track book.id) {
              <tr>
                <td>{{ book.author }}</td>
                <td>{{ book.title }}</td>
                <td>{{ book.year }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-ui-page> `,
  styles: ``,
})
export class HomePage {
  isAscendingByYear = false;
  isAscendingByName = false;
  store = inject(tasksStore);
  isAscendingByTitle = false;

  booksResource = httpResource<BookDisplay[]>(() => '/api/books');

  sortedBooksResourceX = computed(() => {
    if (!this.store.booksPreference().sortBy) {
      return this.sortAscending(this.booksResource.value(), {
        sortBy: 'author',
        sortAscending: true,
      });
    } else {
      if (this.store.booksPreference().sortAscending) {
        return this.sortAscending(this.booksResource.value(), this.store.booksPreference());
      } else {
        return this.sortDescending(this.booksResource.value(), this.store.booksPreference());
      }
    }
  });

  sortAscending(bookList: BookDisplay[] | undefined, booksPreference: BooksPreference) {
    return (
      bookList?.sort((a, b) =>
        a[booksPreference.sortBy as keyof BookDisplay]
          .toString()
          .localeCompare(b[booksPreference.sortBy as keyof BookDisplay].toString()),
      ) ?? []
    );
  }

  sortDescending(bookList: BookDisplay[] | undefined, booksPreference: BooksPreference) {
    return (
      bookList?.sort((a, b) =>
        b[booksPreference.sortBy as keyof BookDisplay]
          .toString()
          .localeCompare(a[booksPreference.sortBy as keyof BookDisplay].toString()),
      ) ?? []
    );
  }
  sortBooks(booksPreference: BooksPreference) {
    const sortString = booksPreference.sortBy;
    this.booksResource.set(
      this.booksResource.value()?.sort((a, b) => {
        const nameA = a[sortString as keyof BookDisplay].toString().toUpperCase();
        const nameB = b[sortString as keyof BookDisplay].toString().toUpperCase();
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

  sortByAuthor() {
    if (!this.isAscendingByName) {
      this.booksResource.set(
        this.booksResource.value()?.sort((a, b) => {
          const nameA = a.author.toUpperCase();
          const nameB = b.author.toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        }),
      );
      this.isAscendingByName = true;
    } else {
      this.booksResource.set(
        this.booksResource.value()?.sort((a, b) => {
          const nameA = a.author.toUpperCase();
          const nameB = b.author.toUpperCase();
          if (nameA < nameB) {
            return 1;
          }
          if (nameA > nameB) {
            return -1;
          }
          return 0;
        }),
      );
      this.isAscendingByName = false;
    }
  }

  sortByTitle() {
    if (!this.isAscendingByTitle) {
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
      this.isAscendingByTitle = true;
    } else {
      this.booksResource.set(
        this.booksResource.value()?.sort((a, b) => {
          const nameA = a.title.toUpperCase();
          const nameB = b.title.toUpperCase();
          if (nameA < nameB) {
            return 1;
          }
          if (nameA > nameB) {
            return -1;
          }
          return 0;
        }),
      );
      this.isAscendingByTitle = false;
    }
  }
  sortByYear(): void {
    if (!this.isAscendingByYear) {
      this.booksResource.set(this.booksResource.value()?.sort((a, b) => a.year - b.year));
      this.isAscendingByYear = true;
    } else {
      this.booksResource.set(this.booksResource.value()?.sort((a, b) => b.year - a.year));
      this.isAscendingByYear = false;
    }
  }
}
