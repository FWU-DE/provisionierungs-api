import { ActionsEntry } from './action-entry.model';
import { Facet } from './facet.model';
import { OfferItem } from './offer-item.model';

export class OffersResponse {
  items: OfferItem[];
  lastPage: number;
  totalCount: number;
  pageSize: number;
  actions: Record<string, Record<string, string>>;
  page: number;
  facets: Facet[];

  constructor(
    data: Partial<
      Pick<
        OffersResponse,
        'lastPage' | 'totalCount' | 'pageSize' | 'actions' | 'page'
      > & {
        items: ConstructorParameters<typeof OfferItem>[0][];
        facets: Facet[];
      }
    > = {},
  ) {
    this.items = (data.items ?? []).map((item) => new OfferItem(item));
    this.lastPage = data.lastPage ?? 0;
    this.totalCount = data.totalCount ?? 0;
    this.pageSize = data.pageSize ?? 0;
    this.actions = {};

    if (data.actions) {
      for (const [key, value] of Object.entries(data.actions)) {
        this.actions[key] = new ActionsEntry(value);
      }
    }

    this.page = data.page ?? 0;
    this.facets = (data.facets ?? []).map((f) => new Facet(f));
  }
}
