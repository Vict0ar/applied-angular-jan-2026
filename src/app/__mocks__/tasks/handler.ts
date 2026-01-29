import { http, delay, HttpResponse } from 'msw';

const serverTasks: unknown[] = [
  {
    id: '1',
    description: 'Talked to Fred',
    startTime: new Date('2024-01-01T10:00:00Z').toISOString(),
    endTime: new Date('2024-01-01T10:30:00Z').toISOString(),
    minutes: 30,
  },
  {
    id: '2',
    description: 'Meeting with team',
    startTime: new Date('2024-01-02T11:00:00Z').toISOString(),
    endTime: new Date('2024-01-02T12:15:00Z').toISOString(),
    minutes: 75,
  },
];
export default [
  http.get('/api/tasks', async () => {
    await delay(2000);
    return HttpResponse.json(serverTasks);
  }),
  http.post('/api/tasks', async ({ request }) => {
    const newTask = (await request.json()) as {
      description: string;
      startTime: string;
      endTime: string;
    };
    const createdTask = {
      id: crypto.randomUUID(),

      ...newTask,
    };
    serverTasks.push(createdTask);
    await delay();
    return HttpResponse.json(createdTask, { status: 201 });
  }),
];
