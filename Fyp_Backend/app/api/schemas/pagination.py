from typing import Annotated

from fastapi import Query


class Pagination:
    def __init__(
        self,
        limit: Annotated[int, Query(ge=1, le=100)] = 50,
        offset: Annotated[int, Query(ge=0, le=1_000_000)] = 0,
    ):
        self.limit = limit
        self.offset = offset

    def apply(self, query):
        return query.limit(self.limit).offset(self.offset)
