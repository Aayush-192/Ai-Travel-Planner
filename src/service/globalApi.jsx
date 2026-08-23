import axios from "axios";

const GEOAPIFY_BASE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

/**
 * Calls Geoapify Autocomplete API for place suggestions.
 * Returns a GeoJSON FeatureCollection: { features: [ { properties: {...} } ] }
 * Each feature.properties has: formatted, address_line1, address_line2,
 * city, country, lat, lon, place_id
 */
export const getGeoapifyAutocomplete = (text) =>
  axios.get(GEOAPIFY_BASE_URL, {
    params: {
      text,
      apiKey: import.meta.env.VITE_GEOAPIFY_API_KEY,
      limit: 5,
    },
  });

/**
 * Returns an Unsplash Source URL for a given place/hotel/attraction name.
 * Free, no API key required — redirects to a real relevant photo.
 */
export const getPlacePhotoUrl = async (name) => {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      name + " travel"
    )}&per_page=1`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    }
  );

  const data = await response.json();

  return data.results?.[0]?.urls?.regular || null;
};
