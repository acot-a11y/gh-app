import { Datastore } from '@google-cloud/datastore';

export type DatastorePath = [string, string | number];
export type DatastoreEntity = any;

export type DatastoreClient = {
  get: <T>(path: DatastorePath) => Promise<T>;
  save: (path: DatastorePath, entity: DatastoreEntity) => Promise<void>;
  delete: (path: DatastorePath) => Promise<void>;
};

export const createDatastoreClient = (): DatastoreClient => {
  const datastore = new Datastore({});
  const ns = 'gh-app';

  const createKey = (path: DatastorePath) =>
    datastore.key({
      namespace: ns,
      path,
    });

  return {
    get: async (path) => {
      const [entity] = await datastore.get(createKey(path));
      return entity;
    },

    save: async (path, entity) => {
      await datastore.save({
        key: createKey(path),
        data: entity,
      });
    },

    delete: async (path) => {
      await datastore.delete(createKey(path));
    },
  };
};
