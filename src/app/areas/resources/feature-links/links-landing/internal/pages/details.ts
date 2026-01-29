import { httpResource } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { PageLayout } from '@ht/shared/ui-common/layouts/page';
import { Resource } from '../types';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-resources-pages-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageLayout, JsonPipe],
  template: `<app-ui-page title="details">
    <p>Details for resource with ID: {{ id() }}</p>
    <pre>{{ link.value() | json }}</pre>
  </app-ui-page>`,
  styles: ``,
})
export class DetailsPage {
  id = input.required<string>();

  link = httpResource<Resource>(
    () => `https://api.jeff-gonzalez-fake-server.com/developer/resources/${this.id()}`,
  );
}
