import { delay, http, HttpResponse } from 'msw';
import { ExpectedSampleResources } from './data';

export default [
  http.get('https://api.jeff-gonzalez-fake-server.com/developer/resources', async () => {
    await delay();
    return HttpResponse.json(ExpectedSampleResources);
  }),
  http.get('https://api.jeff-gonzalez-fake-server.com/developer/resources/:id', async (req) => {
    await delay();
    const { id } = req.params;
    const resource = ExpectedSampleResources.find((r) => r.id === id);
    if (resource) {
      return HttpResponse.json(resource);
    } else {
      return HttpResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
  }),
];
