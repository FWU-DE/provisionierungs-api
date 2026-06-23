import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';

export function instr(fallbackServiceName: string) {
  // If the kill-switch environment variable is not set explicitly to either "true" or "false",
  // we skip all instrumentalisation.
  if (typeof process.env.OTEL_SDK_DISABLED === 'undefined') {
    return;
  }

  const sdk = new NodeSDK({
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
    metricReaders: [], // Disable metrics for now
    serviceName: process.env.OTEL_SERVICE_NAME ?? fallbackServiceName,
    instrumentations: [
      new HttpInstrumentation(),
      new NestInstrumentation(),
      new GraphQLInstrumentation({
        // Don't create Spans for fields without resolver functions (where GraphQL just looks
        // for a property on the object in question) to reduce noise.
        ignoreTrivialResolveSpans: true,
        // `users.*.name` instead of `users.0.name`, `users.1.name`
        mergeItems: true,
      }),
      new UndiciInstrumentation({
        requireParentforSpans: true,
      }),
      new PgInstrumentation(),
    ],
  });

  sdk.start();
}
