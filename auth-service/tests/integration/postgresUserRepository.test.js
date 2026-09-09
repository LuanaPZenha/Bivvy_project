'use strict';

const { randomUUID } = require('crypto');
const {
  PostgresUserRepository,
} = require('../../src/infrastructure/persistence/PostgresUserRepository');
const { User } = require('../../src/domain/entities/User');

// Opt-in: only runs when a database is reachable (CI/local Postgres).
const url = process.env.TEST_DATABASE_URL;
const maybeDescribe = url ? describe : describe.skip;

maybeDescribe('PostgresUserRepository', () => {
  /** @type {PostgresUserRepository} */
  let repo;

  beforeAll(async () => {
    repo = new PostgresUserRepository({ connectionString: url });
    await repo.migrate();
  });

  afterAll(async () => {
    await repo.close();
  });

  it('persists and reads a user by email and id', async () => {
    const email = `pg_${Date.now()}@bivvy.test`;
    const saved = await repo.save(
      new User({
        id: randomUUID(),
        email,
        passwordHash: 'hashed',
        name: 'PG User',
        phone: '2065550134',
        acceptedTermsAt: new Date(),
      }),
    );

    expect(saved.email).toBe(email);

    const byEmail = await repo.findByEmail(email.toUpperCase());
    expect(byEmail.id).toBe(saved.id);
    expect(byEmail.phone).toBe('2065550134');
    expect(byEmail.acceptedTermsAt).toBeInstanceOf(Date);

    const byId = await repo.findById(saved.id);
    expect(byId.email).toBe(email);
  });

  it('updates an existing user on save', async () => {
    const email = `pg_update_${Date.now()}@bivvy.test`;
    const user = await repo.save(
      new User({ id: randomUUID(), email, passwordHash: 'hashed', name: 'Before' }),
    );

    user.name = 'After';
    user.googleSub = `sub-${Date.now()}`;
    await repo.save(user);

    const reloaded = await repo.findById(user.id);
    expect(reloaded.name).toBe('After');
    expect(reloaded.googleSub).toBe(user.googleSub);
  });

  it('returns null for unknown users', async () => {
    expect(await repo.findByEmail('nobody@bivvy.test')).toBeNull();
    expect(await repo.findById(randomUUID())).toBeNull();
  });
});
