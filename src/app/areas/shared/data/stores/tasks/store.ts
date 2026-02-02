/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { computed, effect } from '@angular/core';
import {
  patchState,
  signalStore,
  watchState,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  removeEntity,
  setEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { Task } from './internal/types';
import { httpResource } from '@angular/common/http';

export type TaskEntity = Task & { minutes: number; id: string; description: string };

export type BooksPreference = {
  sortBy: string;
  sortAscending: boolean;
};

type TasksState = {
  booksPreference: BooksPreference;
  isRecording: boolean;
  currentTime: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  _tick: Date; // in a store, an underscore on a member is private, in a class, use a # or the private keyword.
  startTime: Date | null;
  _mutatingTasks: string[];
};

type RawTaskFromServer = {
  id: string;
  description: string;
  startTime: string;
  endTime: string;
  minutes: number;
};

export const tasksStore = signalStore(
  // state is like "initialState" in redux. What's there?
  // these are all "read only" signals, automatically created for you.
  withProps(() => {
    const serverTasks = httpResource<RawTaskFromServer[]>(() => '/api/tasks', {});
    return {
      _serverTasks: serverTasks,
    };
  }),
  withState<TasksState>({
    booksPreference: { sortBy: '', sortAscending: false },
    isRecording: false,
    currentTime: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
    _tick: new Date(),
    startTime: null,
    _mutatingTasks: [],
  }),
  withEntities<TaskEntity>(),
  // instead of having a reducer that takes actions and switches on them, just create methods.
  withMethods((store) => {
    return {
      // async is fine in Angular. You can async and await like the snobby react bros now.

      updateBookPreferences: (booksPreference: BooksPreference) => {
        patchState(store, { booksPreference: booksPreference });
      },
      syncToServer: async (task: TaskEntity) => {
        patchState(store, {
          _mutatingTasks: [...store._mutatingTasks(), task.id],
        });
        await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: task.description,
            startTime: task.startTime,
            endTime: task.endTime,
            minutes: task.minutes,
          }),
        });
        patchState(
          store,
          { _mutatingTasks: store._mutatingTasks().filter((id) => id !== task.id) },
          removeEntity(task.id),
        );
        store._serverTasks.reload(); // this can be whatever
        // what I'm doing is saying "reload the whole list"
        // if the post returned a new entity, you *could* just add it, but this is safest.
      },
      updateDescription: (task: TaskEntity, newDescription: string) => {
        patchState(
          store,
          updateEntity({
            id: task.id,
            changes: {
              description: newDescription,
            },
          }),
        );
      },
      startRecording: () => patchState(store, { isRecording: true, startTime: new Date() }),
      cancelRecording: () => patchState(store, { isRecording: false, startTime: null }),
      finishRecording: () => {
        const task: Task = {
          startTime: store.startTime()
            ? store.startTime()!.toISOString()
            : new Date().toISOString(),
          endTime: store._tick().toISOString(),
        };
        const minutes = Math.round(
          (store._tick().getTime() - new Date(task.startTime).getTime()) / 1000 / 60,
        );
        const taskEntity: TaskEntity = {
          ...task,
          id: crypto.randomUUID(),
          description: 'None',
          minutes,
        };

        patchState(store, { isRecording: false, startTime: null }, addEntity(taskEntity));
      },
      deleteTask: (task: TaskEntity) => patchState(store, removeEntity(task.id)),
      changeDescription: (task: TaskEntity, newDescription: string) => {
        patchState(
          store,
          updateEntity({
            id: task.id,
            changes: {
              description: newDescription,
            },
          }),
        );
      },
    };
  }),
  withComputed((store) => {
    return {
      stats: computed(() => {
        const totalMinutes = store.entities().reduce((sum, task) => sum + task.minutes, 0);
        const totalTasks = store.entities().length;
        const averageMinutes = totalTasks ? Math.round(totalMinutes / totalTasks) : 0;
        const longestTask = store
          .entities()
          .reduce((max, task) => (task.minutes > max ? task.minutes : max), 0);
        return {
          totalMinutes,
          totalTasks,
          averageMinutes,
          longestTask,
        };
      }),
      taskList: computed(() => {
        // Promise you will see why later...

        const localTasks = store.entities().map((task) => ({
          ...task,
          isLocal: true,
          isValid: task.description !== 'None',
          isMutating: false,
        })); // && task.minutes > 0,

        let serverTasks = store._serverTasks.hasValue() ? store._serverTasks.value() : [];
        if (serverTasks.length > 0) {
          serverTasks = serverTasks.map((task) => ({
            ...task,

            isLocal: false,
            isValid: true,
            isMutating: false,
          }));
        }
        return [...localTasks, ...serverTasks].sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        ) as (TaskEntity & { isLocal: boolean; isValid: boolean; isMutating: boolean })[];
      }),
    };
  }),
  withHooks({
    onInit(store) {
      const savedJson = localStorage.getItem('tasks');
      if (savedJson) {
        const savedTasks = JSON.parse(savedJson) as TaskEntity[];
        patchState(store, setEntities(savedTasks));
      }
      const savedBookPreferencesJson = localStorage.getItem('BookPreferences');
      if (savedBookPreferencesJson) {
        const savedBookPreferences = JSON.parse(savedBookPreferencesJson) as BooksPreference;
        patchState(store, { booksPreference: savedBookPreferences });
      }
      watchState(store, () => {
        localStorage.setItem('tasks', JSON.stringify(store.entities()));
        localStorage.setItem('BookPreferences', JSON.stringify(store.booksPreference()));
      });

      setInterval(() => {
        patchState(store, { _tick: new Date() });
      }, 1000);
      effect(() => {
        const now = store._tick();
        patchState(store, {
          currentTime: {
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
          },
        });
      });
    },
    onDestroy() {
      console.log('tasksStore destroyed');
    },
  }),
);
