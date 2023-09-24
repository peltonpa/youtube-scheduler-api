import 'reflect-metadata';
import { TestHelper } from './TestHelper';
import { handleGetRepository } from './utils/utils';

describe('test that typeorm can connect', () => {
  const testHelper = new TestHelper();

  beforeEach((done) => {
    testHelper.init().then(done);
  });

  afterEach((done) => {
    testHelper.close().then(done);
  });

  it('should be able to fetch users', async () => {
    const userRepository = handleGetRepository('User');
    const user = userRepository.create({ name: 'test', video_queue: [] });
    await userRepository.save(user);
    const users = await userRepository.find();
    expect(users.length).toBe(1);
  });
});
