import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { AppDataSource, TestDataSource } from '../data-source';

export const handleGetRepository = <T extends ObjectLiteral>(
  entity: EntityTarget<T>,
): Repository<T> => {
  const environment = process.env.NODE_ENV || 'development';
  return environment === 'test'
    ? TestDataSource.manager.getRepository(entity)
    : AppDataSource.manager.getRepository(entity);
};

export const getEntityManager = () => {
  const environment = process.env.NODE_ENV || 'development';
  return environment === 'test' ? TestDataSource.manager : AppDataSource.manager;
}
