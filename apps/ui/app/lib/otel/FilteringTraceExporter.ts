import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';
import { type ReadableSpan, type SpanExporter } from '@opentelemetry/sdk-trace-base';

export class FilteringTraceExporter implements SpanExporter {
  constructor(
    private readonly delegate: SpanExporter,
    private readonly filterCallback: (span: ReadableSpan) => boolean,
  ) {}

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    const filteredSpans = spans.filter(this.filterCallback);

    if (filteredSpans.length === 0) {
      resultCallback({ code: ExportResultCode.SUCCESS });
      return;
    }

    this.delegate.export(filteredSpans, resultCallback);
  }

  async forceFlush(): Promise<void> {
    return await this.delegate.forceFlush?.();
  }

  async shutdown(): Promise<void> {
    await this.delegate.shutdown();
  }
}
