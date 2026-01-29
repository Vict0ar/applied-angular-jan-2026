import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Resource } from '../types';
import { toSignal } from '@angular/core/rxjs-interop';

export class ResourceData {
  #client = inject(HttpClient);

  getResources() {
    return this.#client.get<Resource[]>(
      'https://api.jeff-gonzalez-fake-server.com/developer/resources',
    );
  }

  // Moving to signals? Work from the outside in. Get rid of observables in components, first.

  getResourcesSignal() {
    return toSignal(this.getResources());
  }
}
