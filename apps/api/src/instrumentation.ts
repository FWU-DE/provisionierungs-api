/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable no-console */
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  ExpressInstrumentation,
  ExpressLayerType,
} from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { TypeormInstrumentation } from 'opentelemetry-instrumentation-typeorm';

export function instr() {
  const sdk = new NodeSDK({
    autoDetectResources: true,
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'vidis-provisionierung-api',
    }),
    serviceName: 'vidis-provisionierung-api',
    spanProcessors: [new SimpleSpanProcessor(new OTLPTraceExporter())], // Use when we want to start using otel
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation({
        ignoreLayersType: [ExpressLayerType.MIDDLEWARE],
      }),
      new TypeormInstrumentation(),
      new UndiciInstrumentation(),
    ],
  });

  sdk.start();

  // gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error: unknown) =>
        console.log('Error terminating tracing', error),
      )
      .finally(() => process.exit(0));
  });
}

if (
  process.env.OTEL_SDK_DISABLED &&
  process.env.OTEL_SDK_DISABLED === 'false'
) {
  instr();
}
