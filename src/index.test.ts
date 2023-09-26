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
        ownerId,
      },
    });
    const { data: result } = response.json();
    expect(response.statusCode).toBe(201);
    expect(result.name).toBe('ismo laitela');
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

  it('should be able to fetch users', async () => {
    const userRepository = handleGetRepository('User');
    const ownerRepository = handleGetRepository('Owner');
    const ownerId1 = randomUUID();
    const ownerId2 = randomUUID();
    const owner1 = ownerRepository.create({ id: ownerId1 });
    const owner2 = ownerRepository.create({ id: ownerId2 });
    await ownerRepository.save(owner1);
    await ownerRepository.save(owner2);

    const user1 = userRepository.create({ name: randomUUID(), video_queue: [], ownerId: ownerId1 });
    const user2 = userRepository.create({ name: randomUUID(), video_queue: [], ownerId: ownerId2 });
    const user3 = userRepository.create({ name: randomUUID(), video_queue: [], ownerId: ownerId1 });

    await userRepository.save(user1);
    await userRepository.save(user2);
    await userRepository.save(user3);
    const response = await testHelper.app.inject({
      method: 'GET',
      url: `/users/${ownerId1}`,
    });
    const { data: result } = response.json();
    expect(response.statusCode).toBe(200);
    expect(result.length).toBe(2);
    expect(result[0].id).toEqual(user1.id);
    expect(result[1].id).toEqual(user3.id);
  });

  it('should be able to update video queue for user', async () => {
    const userRepository = handleGetRepository('User');
    const ownerRepository = handleGetRepository('Owner');
    const ownerId = randomUUID();
    const owner = ownerRepository.create({ id: ownerId });
    await ownerRepository.save(owner);
    const user = userRepository.create({ name: 'test', video_queue: [], ownerId });
    await userRepository.save(user);
    const response = await testHelper.app.inject({
      method: 'PUT',
      url: '/users/update-video-queue',
      payload: {
        id: user.id,
        video_queue: ['test', 'test2'],
      },
    });
    const { data: result } = response.json();
    expect(response.statusCode).toBe(200);
    expect(result.video_queue).toEqual(['test', 'test2']);
  });

  it('should be able to delete user', async () => {
    const userRepository = handleGetRepository('User');
    const ownerRepository = handleGetRepository('Owner');
    const ownerId = randomUUID();
    const owner = ownerRepository.create({ id: ownerId });
    await ownerRepository.save(owner);
    const user = userRepository.create({ name: 'test', video_queue: [], ownerId });
    await userRepository.save(user);
    const response = await testHelper.app.inject({
      method: 'DELETE',
      url: `/users/${user.id}`,
    });
    const { data: result } = response.json();
    expect(response.statusCode).toBe(200);
    expect(result).toEqual(user);
  });
});
