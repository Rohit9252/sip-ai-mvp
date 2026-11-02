/** A calendar date as "yyyy-mm-dd". Plain strings compare in date order. */
export type IsoDate = string;

/** The published price (NAV) of one unit of a fund on one day. */
export type NavPoint = { date: IsoDate; nav: number };

/** A fund's NAV history. `navs` is oldest first, one point per date, every nav above zero. */
export type NavSeries = {
  schemeCode: number;
  schemeName: string;
  navs: NavPoint[];
};

/** One row of fund search. Only Direct, Growth plans are ever returned. */
export type FundSearchResult = {
  schemeCode: number;
  schemeName: string;
};
