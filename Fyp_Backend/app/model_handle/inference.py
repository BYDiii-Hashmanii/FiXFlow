import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from threading import BoundedSemaphore
from time import monotonic

logger = logging.getLogger(__name__)


class InferencePool:
    def __init__(self, workers: int, name: str):
        self.executor = ThreadPoolExecutor(max_workers=workers, thread_name_prefix=name)
        self.slots = BoundedSemaphore(workers)
        self.name = name

    async def run(self, fn, *args, timeout: float):
        if not self.slots.acquire(blocking=False):
            raise RuntimeError(f"{self.name} inference is busy")
        started = monotonic()
        try:
            future = asyncio.get_running_loop().run_in_executor(self.executor, fn, *args)
        except Exception:
            self.slots.release()
            raise

        def completed(result):
            if not result.cancelled():
                result.exception()
            self.slots.release()
            logger.info("%s inference finished in %.3f s", self.name, monotonic() - started)

        future.add_done_callback(completed)
        return await asyncio.wait_for(asyncio.shield(future), timeout)


image_inference = InferencePool(1, "image")
chat_inference = InferencePool(2, "chat")
