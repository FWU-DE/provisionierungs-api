import { FacetValue } from './facet-value.model';

export class Facet {
  facetCriteria: string;
  facetValues: FacetValue[];

  constructor(data: Partial<Facet> = {}) {
    this.facetCriteria = data.facetCriteria ?? '';
    this.facetValues = (data.facetValues ?? []).map((v) => new FacetValue(v));
  }
}
