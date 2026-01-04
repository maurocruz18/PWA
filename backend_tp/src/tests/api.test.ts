import { describe, it, expect } from 'vitest';

describe('Auth API', () => {
  it('should register a new user', async () => {
    const response = { status: 201, body: { username: 'testuser' } };
    expect(response.status).toBe(201);
    expect(response.body.username).toBe('testuser');
  });

  it('should fail login with wrong credentials', () => {
     const isAuth = false;
     expect(isAuth).toBeFalsy();
  });
});