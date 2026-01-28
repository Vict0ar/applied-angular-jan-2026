import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PageLayout } from '@ht/shared/ui-common/layouts/page';

@Component({
  selector: 'app-home-pages-help',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageLayout],
  template: `<app-ui-page title="Need Help">
    <div class="prose prose-xl">
      <h2>Need Help?</h2>
      <p>
        If you need help with this application, please contact our support team or refer to the
        documentation.
      </p>
    </div>
  </app-ui-page>`,
  styles: ``,
})
export class HelpPage {}
