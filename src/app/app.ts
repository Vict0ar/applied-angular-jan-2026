import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SectionLink } from '@ht/shared/ui-common/layouts/section';
import { authStore } from '@ht/shared/util-auth/store';
import { IconName, NgIcon } from '@ng-icons/core';
import { Key } from 'node:readline';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon],
  template: ` <div class="drawer lg:drawer-open">
    <input id="my-drawer-4" type="checkbox" class="drawer-toggle" />

    <div class="drawer-content"><router-outlet /></div>

    <div
      class="drawer-side is-drawer-close:overflow-visible bg-linear-to-b from-base-300 to-base-100"
    >
      <label for="my-drawer-4" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="flex min-h-full flex-col items-start is-drawer-close:w-14 is-drawer-open:w-48  ">
        <!-- Sidebar content here -->

        <img
          (click)="goHome()"
          src="images/logo.svg"
          alt="Logo"
          class="m-2 is-drawer-close:hidden"
          [class.sepia]="isHome()"
        />

        <ul class="menu w-full grow gap-2  ">
          <!-- List item -->

          <li>
            <a
              routerLink="/home"
              class="is-drawer-close:tooltip is-drawer-close:tooltip-right is-drawer-open:hidden "
              data-tip="Home"
              routerLinkActive="bg-accent text-accent-content"
            >
              <span class="flex flex-row gap-2 justify-items-center items-center">
                <ng-icon name="lucideHome" class="size-4"></ng-icon>
                <span class="is-drawer-close:hidden  ">Home</span>
              </span>
            </a>
          </li>
          @for (link of links(); track link.path) {
            <li class="">
              <a
                [routerLink]="link.path"
                class="is-drawer-close:tooltip is-drawer-close:tooltip-right "
                [attr.data-tip]="link.title"
                routerLinkActive="bg-accent text-accent-content"
              >
                <span class="flex flex-row gap-2 justify-items-center items-center">
                  <ng-icon [name]="link.icon" class="size-4"></ng-icon>
                  <span class="is-drawer-close:hidden  ">{{ link.title }}</span>
                </span>
              </a>
            </li>
          }
          <!-- List item -->

          <li class="mt-auto">
            <a
              routerLink="profile"
              class="is-drawer-close:tooltip is-drawer-close:tooltip-right btn btn-primary btn-sm   text-primary-content"
              data-tip="You"
            >
              <span class="flex flex-row gap-2 justify-items-center items-center h-8">
                <ng-icon name="lucideUserRoundCog" class="is-drawer-close:mt-2"></ng-icon>
                <span class="is-drawer-close:hidden">{{ store.authResource.value()?.name }}</span>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>`,
  styles: [],
  host: {
    tabindex: '1',
    '(keyup.control.shift.h)': 'onHelpRequested()',
  },
})
export class App {
  protected router = inject(Router);
  onHelpRequested() {
    console.log('Getting you help...');
    this.router.navigate(['/home/help']);
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }
  isHome() {
    return this.router.url.startsWith('/home');
  }
  store = inject(authStore);
  links = signal<(SectionLink & { icon: IconName })[]>([
    {
      icon: 'lucideCode',
      path: '/dev',
      title: 'Dev Stuff',
    },
    {
      icon: 'lucideLink',
      path: '/links',
      title: 'Links',
    },
    {
      path: '/counting',
      title: 'Counting',
      icon: 'lucideBook',
    },
    {
      path: '/demos',
      title: 'Canned Demos',
      icon: 'lucideBook',
    },

    {
      path: '/jefflabs',
      title: 'Lab 1 (Jeff)',
      icon: 'lucideChessKing',
    },
    {
      path: '/lab1',
      title: 'Lab 1',
      icon: 'lucideFlaskConical',
    },
  ]);
}
