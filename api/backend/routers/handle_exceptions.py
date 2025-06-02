# STL
import logging
import traceback
from typing import Any, Union, Callable, Awaitable
from functools import wraps

# PDM
from fastapi.responses import JSONResponse


def handle_exceptions(
    logger: logging.Logger,
) -> Callable[
    [Callable[..., Awaitable[Any]]], Callable[..., Awaitable[Union[Any, JSONResponse]]]
]:
    def decorator(
        func: Callable[..., Awaitable[Any]],
    ) -> Callable[..., Awaitable[Union[Any, JSONResponse]]]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Union[Any, JSONResponse]:
            try:
                return await func(*args, **kwargs)

            except Exception as e:
                logger.error(f"Exception occurred: {e}")
                traceback.print_exc()
                return JSONResponse(content={"error": str(e)}, status_code=500)

        return wrapper

    return decorator
