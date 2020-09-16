import { Environment, ValidatorSpec } from './types';
import { EnvMissingError } from './validators';

type Validators<TCleanEnv> = {
  [K in keyof TCleanEnv]: ValidatorSpec<TCleanEnv[K]>;
};

function getValueOrError<TValue>({
  env,
  validator,
  key,
}: {
  env: Environment;
  validator: ValidatorSpec<TValue>;
  key: string;
}): TValue | Error {
  const usingDevDefault = env.NODE_ENV === 'development';

  const raw = env[key];

  if (
    raw === undefined &&
    usingDevDefault &&
    validator.devDefault !== undefined
  ) {
    return validator.devDefault;
  }
  if (raw === undefined && validator.default !== undefined) {
    return validator.default;
  }
  if (typeof raw !== 'string') {
    return new EnvMissingError();
  }
  return validator._parse(raw);
}

export function cleanEnv<TCleanEnv>(
  env: Environment,
  validators: Validators<TCleanEnv>
): Readonly<TCleanEnv> {
  const errors: Record<string, Error | undefined> = {};
  const result = {} as TCleanEnv;

  for (const key in validators) {
    const validator = validators[key];
    const resolved = getValueOrError({ env, validator, key });

    if (resolved instanceof Error) {
      errors[key] = resolved;
    } else {
      result[key] = resolved;
    }
  }

  if (Object.keys(errors).length) {
    throw new Error('Tmp');
  }

  return result;
}
