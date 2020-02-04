import is from '@sindresorhus/is';
import { Signale, SignaleConfig, SignaleOptions } from 'signale';
import { assertIsSignaleLogger, assertIsSignaleOptions } from './assertions';

type Options = SignaleOptions | Signale;

function resolveLogger(val: Options): Signale {
  if (isSignaleLogger(val)) {
    assertIsSignaleLogger(val);
    return val;
  }
  assertIsSignaleOptions(val);
  return new Signale(val);
}

function isSignaleLogger(val: any): val is Signale {
  return is.directInstanceOf(val, Signale);
}

/**
 * Signale logger factory.
 * Only exported for testing.
 */
export const LogManager = () => {
  /**
   * All Signale loggers managed by this object
   */
  const loggers: Signale[] = [];

  const getLogger = (opts: Options) => {
    const instance = resolveLogger(opts);
    if (loggers.find(i => i === instance) === undefined) {
      loggers.push(instance);
    }
    return instance;
  };

  /**
   * Functions for manipulating all loggers managed by this factory
   */

  /**
   * Configures all log instances managed by this factory.
   * @param config
   */
  const configure = (config: SignaleConfig) =>
    loggers.map(i => i.config(config));
  const addSecrets = (secrets: string[]) =>
    loggers.map(i => i.addSecrets(secrets));
  const clearSecrets = () => loggers.map(i => i.clearSecrets());
  const disable = () => loggers.map(i => i.disable());
  const enable = () => loggers.map(i => i.enable());

  return {
    getLogger,
    configure,
    addSecrets,
    clearSecrets,
    disable,
    enable,
  } as const;
};

/**
 * Set up factory as singleton
 */
let instance: ReturnType<typeof LogManager>;

export default () => {
  if (instance) return instance;
  instance = LogManager();
  return instance;
};
