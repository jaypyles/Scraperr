# STL
import os

# PDM
import boto3
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def test_insert_and_delete():
    # Get environment variables
    region_name = os.getenv("AWS_REGION")
    # Initialize DynamoDB resource
    dynamodb = boto3.resource("dynamodb", region_name=region_name)
    table = dynamodb.Table("scrape")

    # Item to insert
    item = {
        "id": "123",  # Replace with the appropriate id value
        "attribute1": "value1",
        "attribute2": "value2",
        # Add more attributes as needed
    }

    # Insert the item
    table.put_item(Item=item)
    print(f"Inserted item: {item}")

    # Delete the item
    table.delete_item(Key={"id": "123"})  # Replace with the appropriate id value
    print(f"Deleted item with id: {item['id']}")


if __name__ == "__main__":
    test_insert_and_delete()
