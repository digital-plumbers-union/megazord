import is from '@sindresorhus/is';
import { difference } from 'lodash';
import { Signale, SignaleOptions } from 'signale';

export class SignaleOptionsAssertionError extends Error {
  name = 'SignaleOptionsAssertionError';
}
/** Simple private alias */
const OptionsError = SignaleOptionsAssertionError;

/**
 * Assert input is valid `SignaleOptions`.
 * @param val
 */
export function assertIsSignaleOptions(
  val: any
): asserts val is SignaleOptions {
  if (is.nullOrUndefined(val)) {
    throw new OptionsError('val must be defined');
  }
  if (!is.object(val)) {
    throw new OptionsError('val must be an object');
  }
  const keys = Object.keys(val);
  const optKeys: Array<keyof SignaleOptions> = [
    'config',
    'disabled',
    'scope',
    'types',
    'interactive',
    'timers',
    'stream',
  ];
  const diff = difference(keys, optKeys);
  if (diff.length !== 0) {
    throw new OptionsError(
      `Input value should be valid Signale options object: https://github.com/klaussinani/signale#configuration.  Invalid keys: ${diff}`
    );
  }
}

export class SignaleLoggerAssertionError extends Error {
  name = 'SignaleLoggerAssertionError';
}
/** Simple private alias */
const LoggerError = SignaleLoggerAssertionError;

export function assertIsSignaleLogger(val: any): asserts val is Signale {
  if (is.nullOrUndefined(val)) {
    throw new LoggerError('val is undefined');
  }
  if (!is.directInstanceOf(val, Signale)) {
    throw new LoggerError('val is not an instance of Signale');
  }
}
