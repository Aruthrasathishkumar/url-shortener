import redis
from app.core.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

def get_cached_url(short_code: str) -> str | None:
    return redis_client.get(f"link:{short_code}")

def cache_url(short_code: str, original_url: str, ttl_seconds: int = 3600):
    redis_client.setex(f"link:{short_code}", ttl_seconds, original_url)

def invalidate_cache(short_code: str):
    redis_client.delete(f"link:{short_code}")