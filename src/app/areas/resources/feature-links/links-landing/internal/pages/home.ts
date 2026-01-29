import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { PageLayout } from '@ht/shared/ui-common/layouts/page';

import { LinkResourceItemLink } from '../resource-display/link';
import { Resource } from '../types';
import { httpResource } from '@angular/common/http';

import { ResourceData } from './resource-data';
import { JsonPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

/* Note - you can use either interface or type for this. The differences are so small, I don't care. I like 'type' */

@Component({
  selector: 'app-links-pages-home',
  providers: [ResourceData],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageLayout, LinkResourceItemLink, JsonPipe, RouterLink],
  template: `<app-ui-page title="List of Links">
    <div class="grid  md:grid-cols-3  grid-cols-1 gap-4   ">
      @if (linksFromServer.hasValue()) {
        @for (resource of links(); track resource.id) {
          <div class="bg-base-100 p-2  rounded-lg shadow-2xl  flex flex-col h-full w-full">
            <h3 class="text-xl p-2 font-boldest text-secondary w-full">
              {{ resource.title }} <a [routerLink]="['details', resource.id]">Details</a>
            </h3>
            <hr class="divider m-0" />
            <div class="flex flex-row w-full h-full justify-between items-start">
              <div class="flex flex-col justify-stretch w-1/3 gap-2 ">
                <app-links-resource-link
                  [link]="resource.primaryLink"
                  kind="primary"
                  (linkVisited)="onLinkVisited($event)"
                />
                @for (link of resource.additionalLinks; track link.href) {
                  <app-links-resource-link
                    kind="additional"
                    [link]="link"
                    (linkVisited)="onLinkVisited($event)"
                  />
                }
              </div>
              <div class="flex flex-col w-2/3 pl-4 bg-base-200 p-4 mx-4 h-full rounded-lg">
                <p class="text-base-content text-sm font-light italic mb-2">
                  {{ resource.description }}
                </p>
              </div>
            </div>
          </div>
        } @empty {
          <p>Sorry. there are no links!</p>
        }
      } @else {
        @if (linksFromServer.isLoading()) {
          <span class="loading loading-spinner text-primary"></span>
          <span class="loading loading-spinner text-secondary"></span>
          <span class="loading loading-spinner text-accent"></span>
          <span class="loading loading-spinner text-neutral"></span>
          <span class="loading loading-spinner text-info"></span>
          <span class="loading loading-spinner text-success"></span>
          <span class="loading loading-spinner text-warning"></span>
          <span class="loading loading-spinner text-error"></span>
        } @else {
          @if (linksFromServer.error()) {
            <p>Bummer! Error!</p>
            <p>{{ linksFromServer.status() }}</p>
          }
        }
      }
    </div>
    <pre> {{ other() | json }} </pre>
  </app-ui-page>`,
  styles: ``,
})
export class HomePage {
  onLinkVisited(linkHref: string) {
    console.log('Link visited:', linkHref);
    // Here you can add any additional logic you want to execute when a link is visited
  }

  // Api Will Be At https://api.jeff-gonzalez-fake-server.com/developer/resources

  // Three signal based things are resource, httpResource, and rxResource - these are all ways to get stuff as a signal
  // read only, no mutations, but good for reference data.

  linksFromServer = httpResource<Resource[]>(
    () => 'https://api.jeff-gonzalez-fake-server.com/developer/resources',
  );

  resourceData = inject(ResourceData);

  other = this.resourceData.getResourcesSignal();

  links = computed(() => this.linksFromServer.value() ?? []);
}
