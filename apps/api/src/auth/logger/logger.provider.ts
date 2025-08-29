import type { LoggerService } from '@nestjs/common';
import { ConsoleLogger } from '@nestjs/common';

import { Logger } from '../../logger';

export const loggerProviderFactory = {
  provide: ConsoleLogger,
  inject: [Logger],
  useFactory: (logger: Logger): LoggerService => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if ((logger as ConsoleLogger).setContext !== undefined) {
      (logger as ConsoleLogger).setContext('AuthModule');
    }
    return logger;
  },
};
