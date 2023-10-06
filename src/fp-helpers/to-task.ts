import { Task } from 'fp-ts/Task';

export const toTask =
  <E, A>(f: () => A): ((e: E) => Task<A>) =>
  () =>
  (): Promise<A> =>
    Promise.resolve(f());
