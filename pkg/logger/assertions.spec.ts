import test from 'ava';
import { Signale } from 'signale';
import {
  assertIsSignaleLogger,
  assertIsSignaleOptions,
  SignaleLoggerAssertionError,
  SignaleOptionsAssertionError,
} from './assertions';

test('assertIsSignaleOptions() - correct error is thrown', t => {
  t.plan(2);
  const invalidOptions = {
    bro: 'foo',
  };
  t.throws(() => assertIsSignaleOptions(invalidOptions));
  try {
    assertIsSignaleOptions(invalidOptions);
  } catch (e) {
    t.log(e.toString());
    if (e) {
      t.assert(e.name === SignaleOptionsAssertionError.name);
    }
  }
});

test('assertIsSignaleOptions() - valid value', t => {
  t.notThrows(() => assertIsSignaleOptions({ scope: 'bro' }));
});

test('assertIsSignaleLogger() - correct error is thrown', t => {
  t.plan(2);
  const invalidLogger = console.log;
  t.throws(() => assertIsSignaleLogger(invalidLogger));
  try {
    assertIsSignaleLogger(invalidLogger);
  } catch (e) {
    t.log(e.toString());
    t.assert(e.name === SignaleLoggerAssertionError.name);
  }
});

test('assertIsSignaleLogger - valid value', t => {
  t.notThrows(() => assertIsSignaleLogger(new Signale()));
});
