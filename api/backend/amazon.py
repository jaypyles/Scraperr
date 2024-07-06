# PDM
import boto3


def test_dyanmo():
    dynamodb = boto3.resource("dynamodb", region_name="us-west-2")
    table = dynamodb.Table("scrape")
    print(table)
