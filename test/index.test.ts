import { cleanEnv } from '../src';
import { EnvError, makeValidator, num } from '../src/validators';

const barParser = makeValidator<'bar'>(input => {
  if (input !== 'bar') {
    throw new EnvError(`Expected '${input}' to be 'bar'`);
  }
  return 'bar';
});

test('custom parser', () => {
  expect(
    cleanEnv(
      { foo: 'bar' },
      {
        foo: barParser({}),
      }
    )
  ).toEqual({
    foo: 'bar',
  });

  expect(() =>
    cleanEnv(
      { foo: 'not bar' },
      {
        foo: barParser({}),
      }
    )
  ).toThrowError();
});

test('missing env', () => {
  expect(() => cleanEnv({}, { num: num() })).toThrowError();
});

describe('num', () => {
  test('happy', () => {
    const opts = { num: num() };
    expect(cleanEnv({ num: '1' }, opts)).toEqual({
      num: 1,
    });
  });
  test('sad', () => {
    expect(() => cleanEnv({}, { num: num() })).toThrowError();
    expect(() => cleanEnv({ num: 'string' }, { num: num() })).toThrowError();
  });
});
