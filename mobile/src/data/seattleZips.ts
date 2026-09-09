export type SeattleZip = {
  zip: string;
  label: string;
};

/** Seattle-area ZIP codes used for Near You distance filtering. */
export const SEATTLE_ZIPS: SeattleZip[] = [
  { zip: '98103', label: 'Fremont, Seattle' },
  { zip: '98107', label: 'Ballard, Seattle' },
  { zip: '98119', label: 'Queen Anne, Seattle' },
  { zip: '98102', label: 'Capitol Hill, Seattle' },
  { zip: '98115', label: 'Wedgwood, Seattle' },
  { zip: '98199', label: 'Magnolia, Seattle' },
  { zip: '98105', label: 'University District, Seattle' },
  { zip: '98125', label: 'Lake City, Seattle' },
  { zip: '98122', label: 'Central District, Seattle' },
  { zip: '98101', label: 'Downtown Seattle, WA' },
  { zip: '98109', label: 'South Lake Union, Seattle' },
];

export const DEFAULT_SEATTLE_ZIP = SEATTLE_ZIPS[0].zip;

export function labelForZip(zipCode: string): string {
  const match = SEATTLE_ZIPS.find((z) => z.zip === zipCode);
  return match?.label || zipCode;
}

export function nextSeattleZip(currentZip: string): string {
  const index = SEATTLE_ZIPS.findIndex((z) => z.zip === currentZip);
  const next = index < 0 ? 0 : (index + 1) % SEATTLE_ZIPS.length;
  return SEATTLE_ZIPS[next].zip;
}
