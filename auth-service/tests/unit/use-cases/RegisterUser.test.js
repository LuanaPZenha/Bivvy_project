'use strict';

const { RegisterUser } = require('../../../src/application/use-cases/RegisterUser');
const { LoginUser } = require('../../../src/application/use-cases/LoginUser');
const {
  InMemoryUserRepository,
} = require('../../../src/infrastructure/persistence/InMemoryUserRepository');

describe('RegisterUser use case', () => {
  const hasher = {
    hash: async (p) => `hashed:${p}`,
    compare: async (p, h) => h === `hashed:${p}`,
  };
  const tokenService = {
    issuePair: async (_user) => ({
      accessToken: 'access',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresIn: '15m',
    }),
  };

  it('registers a new user', async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new RegisterUser({
      userRepository: repo,
      passwordHasher: hasher,
      tokenService,
    });

    const result = await useCase.execute({
      email: 'hiker@example.com',
      password: 'securePass1',
      name: 'Alex',
      phone: '(206) 555-0134',
      acceptTerms: true,
    });

    expect(result.user.email).toBe('hiker@example.com');
    expect(result.user.phone).toBe('2065550134');
    expect(result.user.acceptedTermsAt).toBeInstanceOf(Date);
    expect(result.accessToken).toBe('access');
    expect(result.user.passwordHash).toBeUndefined();
  });

  function makeUseCase() {
    return new RegisterUser({
      userRepository: new InMemoryUserRepository(),
      passwordHasher: hasher,
      tokenService,
    });
  }

  it('rejects short passwords', async () => {
    await expect(
      makeUseCase().execute({ email: 'a@b.com', password: 'short', acceptTerms: true }),
    ).rejects.toThrow(/at least 8/);
  });

  it('requires letters and numbers in the password', async () => {
    await expect(
      makeUseCase().execute({ email: 'a@b.com', password: 'onlyletters', acceptTerms: true }),
    ).rejects.toThrow(/letters and numbers/);
  });

  it('requires accepting the terms', async () => {
    await expect(
      makeUseCase().execute({ email: 'a@b.com', password: 'securePass1' }),
    ).rejects.toThrow(/Terms of Service/);
  });

  it('rejects an invalid phone number', async () => {
    await expect(
      makeUseCase().execute({
        email: 'a@b.com',
        password: 'securePass1',
        phone: '123',
        acceptTerms: true,
      }),
    ).rejects.toThrow(/Invalid phone/);
  });

  it('rejects duplicate emails', async () => {
    const useCase = makeUseCase();
    const payload = { email: 'dupe@example.com', password: 'securePass1', acceptTerms: true };
    await useCase.execute(payload);
    await expect(useCase.execute(payload)).rejects.toThrow(/already registered/);
  });
});

describe('LoginUser use case', () => {
  it('rejects invalid credentials', async () => {
    const useCase = new LoginUser({
      userRepository: new InMemoryUserRepository(),
      passwordHasher: {
        hash: async (p) => p,
        compare: async () => false,
      },
      tokenService: { issuePair: async () => ({}) },
    });

    await expect(
      useCase.execute({ email: 'nobody@example.com', password: 'whatever12' }),
    ).rejects.toThrow(/Invalid credentials/);
  });
});
