import { nanoquery } from '@nanostores/query';

export const [createFetcherStore, createMutatorStore, { invalidateKeys, revalidateKeys, mutateCache }] = nanoquery({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetcher: (...keys: any[]) => fetch(keys.join('')).then(async (r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  }),
});
