import { describe, it, expect } from 'vitest';
import { signupSchema } from '../src/index.js';

describe('Shared schemas', () => {
  it('validates a valid email', () => {
    expect(signupSchema.safeParse({ email: 'test@example.com', password: 'password1234', name: 'John Doe' }).success).toBe(true);
  });
});
