"""
VOXAR Rate Limiter.
Token bucket rate limiting per API key.
"""

import time
import logging
import threading

logger = logging.getLogger("VoxarRateLimit")


class RateLimiter:
    """
    Token bucket rate limiter.

    Each API key gets a bucket with:
    - max_tokens: burst capacity
    - refill_rate: tokens added per second (requests_per_minute / 60)
    """

    def __init__(self, requests_per_minute=10, burst=5):
        self._max_tokens = burst
        self._refill_rate = requests_per_minute / 60.0
        self._buckets = {}  # api_key -> (tokens, last_refill_time)
        self._lock = threading.Lock()

        logger.info(
            f"Rate limiter initialized: {requests_per_minute}/min, burst={burst}"
        )

    def check(self, api_key):
        """
        Check if a request is allowed for this API key.

        Returns:
            tuple: (allowed: bool, retry_after: float or None)
        """
        with self._lock:
            now = time.time()

            if api_key not in self._buckets:
                # New key — start with full bucket
                self._buckets[api_key] = (self._max_tokens - 1, now)
                return True, None

            tokens, last_time = self._buckets[api_key]

            # Refill tokens based on elapsed time
            elapsed = now - last_time
            tokens = min(self._max_tokens, tokens + elapsed * self._refill_rate)

            if tokens >= 1:
                # Allow request, consume one token
                self._buckets[api_key] = (tokens - 1, now)
                return True, None
            else:
                # Rate limited — calculate retry_after
                deficit = 1 - tokens
                retry_after = deficit / self._refill_rate
                return False, round(retry_after, 1)

    def cleanup_stale(self, max_age=3600):
        """Remove buckets not accessed in max_age seconds."""
        now = time.time()
        with self._lock:
            stale = [
                key for key, (_, last_time) in self._buckets.items()
                if now - last_time > max_age
            ]
            for key in stale:
                del self._buckets[key]
        if stale:
            logger.debug(f"Cleaned up {len(stale)} stale rate limit buckets")
