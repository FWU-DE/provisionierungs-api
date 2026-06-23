import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';

import { FilteringTraceExporter } from './FilteringTraceExporter';

export function instr(fallbackServiceName: string) {
  // If the kill-switch environment variable is not set explicitly to either "true" or "false",
  // we skip all instrumentalisation.
  if (typeof process.env.OTEL_SDK_DISABLED === 'undefined') {
    return;
  }

  const exporter = new OTLPTraceExporter();
  // Filter out spans for internal next urls, e.g. for static assets.
  // We assume that these are the only spans in that trace.
  const filteringExporter = new FilteringTraceExporter(exporter, (span) => {
    if (
      span.name === 'GET' &&
      (span.attributes['http.target']?.toString().startsWith('/_next/') ||
        span.attributes['http.target']?.toString().startsWith('/img/'))
    ) {
      return false;
    }

    return true;
  });

  const sdk = new NodeSDK({
    spanProcessors: [new BatchSpanProcessor(filteringExporter)],
    metricReaders: [], // Disable metrics for now
    serviceName: process.env.OTEL_SERVICE_NAME ?? fallbackServiceName,
    instrumentations: [new HttpInstrumentation(), new UndiciInstrumentation()],
  });

  sdk.start();
}
