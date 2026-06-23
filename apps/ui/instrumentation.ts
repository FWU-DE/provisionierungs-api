import { instr } from '@/lib/otel/instrumentation';

export function register() {
  instr('vidis-rostering-ui');
}
