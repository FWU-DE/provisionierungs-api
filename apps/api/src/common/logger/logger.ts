import type { LogLevel } from '@nestjs/common';
import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class Logger extends ConsoleLogger {
  constructor(json = false, logLevel?: LogLevel[]) {
    super({ json });
    this.options.logLevels = logLevel ?? this.getLogLevel();
  }

  static withFormatterFromEnv(): Logger {
    return new Logger(process.env.LOG_FORMAT === 'json');
  }

  private getLogLevel(): LogLevel[] {
    switch (process.env.LOG_LEVEL) {
      case 'fatal':
        return ['fatal'];
      case 'error':
        return ['error', 'fatal'];
      case 'warn':
        return ['warn', 'error', 'fatal'];
      case 'log':
        return ['log', 'warn', 'error', 'fatal'];
      case 'verbose':
        return ['verbose', 'log', 'warn', 'error', 'fatal'];
      case 'debug':
        return ['debug', 'verbose', 'log', 'warn', 'error', 'fatal'];
      default:
        // eslint-disable-next-line no-console
        console.log('Defaulting to log level "log"');
        return ['log'];
    }
  }
}
