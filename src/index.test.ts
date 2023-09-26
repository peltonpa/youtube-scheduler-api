import 'reflect-metadata';
import { randomUUID } from 'crypto';
import { TestHelper } from './TestHelper';
import { handleGetRepository } from './utils/utils';

const testHelper = new TestHelper();

describe('test that typeorm can connect', () => {
  beforeEach((done) => {
    testHelper.init().then(done);
  });

  afterEach((done) => {
    testHelper.close().then(done);
  });

  it('should be able to fetch users', async () => {
    const userRepository = handleGetRepository('User');
    const ownerRepository = handleGetRepository('Owner');
    const ownerId = randomUUID();
    const owner = ownerRepository.create({ id: ownerId });
    await ownerRepository.save(owner);
    const user = userRepository.create({ name: 'test', video_queue: [], ownerId });
    await userRepository.save(user);
    const users = await userRepository.find();
    expect(users.length).toBe(1);
  });
});

describe('route-level tests', () => {
  beforeEach((done) => {
    testHelper.init().then(done);
  });

  afterEach((done) => {
    testHelper.close().then(done);
  });

  it('should be able to create user', async () => {
    const ownerRepository = handleGetRepository('Owner');
    const owner = ownerRepository.create();
    await ownerRepository.save(owner);
    const owners = await ownerRepository.find();
    expect(owners.length).toBe(1);
    const { id: ownerId } = owners[0];

    const response = await testHelper.app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        name: 'ismo laitela',
        video_queue: [],
        ownerId: ownerId,
      },
    });
    const { data: result } = response.json();
    expect(response.statusCode).toBe(201);
    expect(result.user.name).toBe('ismo laitela');
  });

  it('should not be able to create user with inexistent owner id', async () => {
    const response = await testHelper.app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        name: 'ismo laitela',
        video_queue: [],
        ownerId: randomUUID(),
      },
    });
    expect(response.statusCode).toBe(500);
  });
});
