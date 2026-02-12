from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import logging

geolocator = Nominatim(user_agent="jobsearch_tool_v1")
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)

def get_lat_long(location: str):
    try:
        loc = geocode(location)
        if loc:
            return loc.latitude, loc.longitude
        else:
            return None, None
    except Exception as e:
        logging.error(f"Geocoding failed for {location}: {e}")
        return None, None