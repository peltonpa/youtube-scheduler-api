import dotenv from 'dotenv';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Static, Type } from '@sinclair/typebox';
import { AppDataSource } from './data-source';
import { User } from './entity/User';
import { Owner } from './entity/Owner';
import { getEntityManager } from './utils/utils';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  video_queue: Type.Array(Type.String()),
});
const PostUserInputSchema = Type.Object({
  name: Type.String(),
  video_queue: Type.Array(Type.String()),
  ownerId: Type.String({ format: 'uuid' }),
});
const OwnerIdSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});
const UserIdSchema = Type.Object({
  id: Type.String(),
});
const UserVideoQueueSchema = Type.Object({
  id: Type.String(),
  video_queue: Type.Array(Type.String()),
});

type UserSchemaType = Static<typeof UserSchema>;

function build(opts = {}) {
  const app = Fastify(opts);

  app.register(cors, {
    origin: 'http://localhost:3000',
  });

  app.get('/test', async (request, reply) => {
    return { test: 'test' };
  });

  // Route to create an owner
  app.post<{ Reply: { data: Static<typeof OwnerIdSchema> } }>(
    '/owner',
    {
      schema: {
        response: {
          201: { type: 'object', properties: { data: OwnerIdSchema } },
        },
      },
    },
    async (request, reply) => {
      const manager = getEntityManager();
      const owner = manager.create(Owner);
      await manager.save(owner);
      return reply.status(201).send({ data: { id: owner.id } });
    },
  );

  app.post<{ Body: Static<typeof PostUserInputSchema>; Reply: { data: UserSchemaType } }>(
    '/users',
    {
      schema: {
        body: PostUserInputSchema,
        response: {
          201: { type: 'object', properties: { data: UserSchema } },
        },
      },
    },
    async (request, reply) => {
      const { ownerId, name, video_queue } = request.body;
      const manager = getEntityManager();
      const user = manager.create(User, { ownerId, name, video_queue });
      await manager.save(user);
      return reply.code(201).send({ data: user });
    },
  );

  app.get<{ Params: Static<typeof OwnerIdSchema>; Reply: { data: UserSchemaType[] } }>(
    '/users/:id',
    {
      schema: {
        params: OwnerIdSchema,
        response: {
          200: { type: 'object', properties: { data: Type.Array(UserSchema) } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const manager = getEntityManager();
      const users = await manager.find(User, { where: { ownerId: id } });
      return reply.code(200).send({ data: users });
    },
  );

  app.put<{ Body: Static<typeof UserVideoQueueSchema>; Reply: { data: UserSchemaType } }>(
    '/users/update-video-queue',
    {
      schema: {
        body: UserVideoQueueSchema,
        response: {
          200: { type: 'object', properties: { data: UserSchema } },
        },
      },
    },
    async (request, reply) => {
      const { id, video_queue } = request.body;
      const manager = getEntityManager();
      const user = await manager.findOne(User, { where: { id } });
      if (!user) {
        throw new Error('User not found');
      }
      user.video_queue = video_queue;
      await manager.save(user);
      return reply.code(200).send({ data: user });
    },
  );

  app.delete<{ Params: Static<typeof UserIdSchema>; Reply: { data: UserSchemaType } }>(
    '/users/:id',
    {
      schema: {
        params: UserIdSchema,
        response: {
          200: { type: 'object', properties: { data: UserSchema } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const manager = getEntityManager();
      const user = await manager.findOne(User, { where: { id } });
      if (!user) {
        throw new Error('User not found');
      }
      await manager.delete(User, { id });
      return reply.code(200).send({ data: user });
    },
  );

  app.get<{
    Params: Static<typeof UserIdSchema>;
    Reply: { data: Static<typeof UserVideoQueueSchema> };
  }>(
    '/users/video-queue/:id',
    {
      schema: {
        params: UserIdSchema,
        response: {
          200: { type: 'object', properties: { data: UserSchema } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const manager = getEntityManager();
      const user = await manager.findOne(User, { where: { id } });
      if (!user) {
        throw new Error('User not found');
      }
      return reply.code(200).send({ data: { id: user.id, video_queue: user.video_queue } });
    },
  );

  return app;
}

const server = build({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
    },
  },
});

const start = async () => {
  try {
    if (!process.env.PORT) {
      throw new Error('Missing PORT in environment variables. Cannot start Fastify');
    }
    await server.listen({ port: Number(process.env.PORT), host: '0.0.0.0' });
    await AppDataSource.initialize();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
// Tests have their own helper to setup the database, TypeORM connection and Fastify instance
if (process.env.NODE_ENV !== 'test') {
  start();
}

export default build;
