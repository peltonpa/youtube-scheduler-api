import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { AppDataSource, TestDataSource } from '../data-source';

export const handleGetRepository = (entity: EntityTarget<ObjectLiteral>): Repository<ObjectLiteral> => {
  const environment = process.env.NODE_ENV || 'development';
  return environment === 'test'
    ? TestDataSource.manager.getRepository(entity)
    : AppDataSource.manager.getRepository(entity);
};

