import 'signale';

declare module 'signale' {
  type Secrets = (string | number)[];
  interface SignaleBase<TTypes extends string = DefaultMethods> {
    addSecrets(secrets: Secrets): void;
    clearSecrets(): void;
    enable(): void;
    disable(): void;
  }

  interface SignaleOptions<TTypes extends string = DefaultMethods> {
    logLevel: 'info' | 'debug' | 'timer' | 'warn' | 'error';
  }
}
