import { getApiBaseUrl } from '../services/api';
import type { Listing, ListingImage } from '../types/listing';

export function listingImageUrl(listingId: string, image: ListingImage | string): string {
  const imageId = typeof image === 'string' ? image : image.id;
  const relative =
    typeof image === 'object' && image.url
      ? image.url
      : `/api/gear/${encodeURIComponent(listingId)}/images/${encodeURIComponent(imageId)}`;
  if (relative.startsWith('http://') || relative.startsWith('https://')) {
    return relative;
  }
  return `${getApiBaseUrl()}${relative.startsWith('/') ? '' : '/'}${relative}`;
}

export function primaryListingImageUrl(listing: Listing): string | null {
  const first = listing.images && listing.images[0];
  if (!first) return null;
  return listingImageUrl(listing.id, first);
}
