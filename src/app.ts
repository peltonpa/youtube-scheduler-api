import dotenv from 'dotenv';
import Fastify from 'fastify';
import { AppDataSource } from './data-source';
import { handleGetRepository } from './utils/utils';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

function build(opts = {}) {
  const app = Fastify(opts);

  app.get('/test', async (request, reply) => {
    return { test: 'test' };
  });

  app.post('/users', async (request, reply) => {
    const { ownerId, name, video_queue } = request.body as any;
    const userRepository = handleGetRepository('User');
    const user = userRepository.create({ name, video_queue, owner: { id: ownerId } });
    const savedUser = await userRepository.save(user);
    return reply.code(201).send({ data: { user: savedUser } });
  });

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
