import dotenv from 'dotenv';
import Fastify from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import { AppDataSource } from './data-source';
import { User } from './entity/User';
import { getEntityManager } from './utils/utils';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  video_queue: Type.Array(Type.String()),
  ownerId: Type.String({ format: 'uuid' }),
});
const PostUserInputSchema = {
  ...Type.Pick({ ...UserSchema }, ['name', 'video_queue', 'ownerId']),
  additionalProperties: false,
};

type UserSchemaType = Static<typeof UserSchema>;

function build(opts = {}) {
  const app = Fastify(opts);

  app.get('/test', async (request, reply) => {
    return { test: 'test' };
  });

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
    }
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
    await server.listen({ port: Number(process.env.PORT) });
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
