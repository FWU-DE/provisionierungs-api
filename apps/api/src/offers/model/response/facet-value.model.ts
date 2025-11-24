export class FacetValue {
  numberOfOccurrences: number;
  term: string;

  constructor(data: Partial<FacetValue> = {}) {
    this.numberOfOccurrences = data.numberOfOccurrences ?? 0;
    this.term = data.term ?? '';
  }
}
