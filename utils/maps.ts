import { Linking, Platform } from 'react-native';

/**
 * Opens a free-text address as a search query in the map app the user prefers:
 * `maps://` on iOS, `geo:` on Android (which respects the default map app),
 * with a Google Maps web URL as the last resort.
 */
export async function openAddressInMaps(address: string): Promise<boolean> {
  const query = encodeURIComponent(address.trim());
  if (!query) return false;

  const nativeUrls = Platform.select({
    ios: [`maps://?q=${query}`],
    android: [`geo:0,0?q=${query}`],
    default: [] as string[],
  })!;

  const urls = [...nativeUrls, `https://www.google.com/maps/search/?api=1&query=${query}`];

  for (const url of urls) {
    try {
      await Linking.openURL(url);
      return true;
    } catch {
      continue;
    }
  }

  return false;
}
