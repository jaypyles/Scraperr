# STL
import os
import logging
from typing import Any

# PDM
import boto3
from mypy_boto3_dynamodb.service_resource import Table, DynamoDBServiceResource

LOG = logging.getLogger(__name__)


def connect_to_dynamo() -> Table:
    region_name = os.getenv("AWS_REGION")
    dynamodb: DynamoDBServiceResource = boto3.resource(
        "dynamodb", region_name=region_name
    )
    return dynamodb.Table("scrape")


def insert(table: Table, item: dict[str, Any]) -> None:
    i = table.put_item(Item=item)
    LOG.info(f"Inserted item: {i}")


def query(table: Table, index_name: str, key_condition: Any) -> list[Any]:
    try:
        response = table.query(
            IndexName=index_name, KeyConditionExpression=key_condition
        )
        items = response.get("Items", [])
        for item in items:
            LOG.info(f"Queried item: {item}")
        return items
    except Exception as e:
        LOG.error(f"Failed to query table: {e}")
        raise


def query_by_id(table: Table, key_condition: Any) -> list[Any]:
    try:
        response = table.query(KeyConditionExpression=key_condition)
        items = response.get("Items", [])
        for item in items:
            LOG.info(f"Queried item: {item}")
        return items
    except Exception as e:
        LOG.error(f"Failed to query table: {e}")
        raise
