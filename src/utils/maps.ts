import { Alert, Linking, Platform } from 'react-native';

type LocationLike = { latitude?: number | string | null; longitude?: number | string | null; siteAddress?: string | null; siteName?: string | null };

export async function openJobLocation(location: LocationLike) {
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude) && latitude !== 0 && longitude !== 0;
  const query = hasCoordinates ? `${latitude},${longitude}` : [location.siteName, location.siteAddress].filter(Boolean).join(', ');
  if (!query) { Alert.alert('Location unavailable', 'No map coordinates or site address is saved for this job.'); return; }
  const encoded = encodeURIComponent(query);
  const nativeUrl = Platform.OS === 'android' ? `geo:${hasCoordinates ? query : '0,0'}?q=${encoded}` : `comgooglemaps://?q=${encoded}`;
  try { await Linking.openURL(await Linking.canOpenURL(nativeUrl) ? nativeUrl : `https://www.google.com/maps/search/?api=1&query=${encoded}`); }
  catch { Alert.alert('Unable to open maps', 'Please check that Google Maps is installed.'); }
}
