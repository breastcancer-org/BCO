import json
import boto3
import os

# Initialize the DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('TABLE_NAME'))  # Replace 'Users' with your table name

def lambda_handler(event, context):
    body = event

    action = body.get('action')
    email = body.get('email')
    username = body.get('username')
    chatHistory = body.get('chatHistory', [])
    breastCancerType = body.get('breastCancerType', 'Unknown')
    breastCancerStage = body.get('breastCancerStage', 'Unknown')
    print(action)
    
    if action == 'addUser':
        # Add the user to the DynamoDB table
        try:
            table.put_item(
                Item={
                    'email': email,
                    'username': username,                # Primary key
                    'chatHistory': chatHistory,          # Chat history, can be a list
                    'breastCancerType': breastCancerType, # Breast cancer type
                    'breastCancerStage': breastCancerStage # Breast cancer stage
                }
            )
            return {
                'statusCode': 200,
                'headers': {
            'Access-Control-Allow-Origin': '*',  # Allow all origins
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT'
        },
                'body': json.dumps({'message': 'User added successfully'})
            }
        except Exception as e:
            print(f"Error adding user: {e}")
            return {
                'statusCode': 500,
                'headers': {
            'Access-Control-Allow-Origin': '*',  # Allow all origins
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
                'body': json.dumps({'error': 'Could not add user'})
            }
    
    elif action == 'getUser':
        # Retrieve the user from the DynamoDB table
        try:
            response = table.get_item(
                Key={'email': email}
            )
            if 'Item' in response:
                return {
                    'statusCode': 200,
                    'headers': {
            'Access-Control-Allow-Origin': '*',  # Allow all origins
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
                    'body': json.dumps(response['Item'])
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
            'Access-Control-Allow-Origin': '*',  # Allow all origins
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
                    'body': json.dumps({'error': 'User not found'})
                }
        except Exception as e:
            print(f"Error retrieving user: {e}")
            return {
                'statusCode': 500,
                'headers': {
            'Access-Control-Allow-Origin': '*',  # Allow all origins
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
                'body': json.dumps({'error': 'Could not retrieve user data'})
            }
    
    else:
        return {
            'statusCode': 400,
            'headers': {
            'Access-Control-Allow-Origin': '*',  # Allow all origins
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
            'body': json.dumps({'error': f'Invalid action :{action}'})
        }
