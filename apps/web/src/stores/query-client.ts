import { nanoquery } from '@nanostores/query';

export const [createFetcherStore, createMutatorStore, { invalidateKeys, revalidateKeys, mutateCache }] = nanoquery({
  fetcher: (...keys) => fetch(keys.join('')).then((r) => r.json()),
});
