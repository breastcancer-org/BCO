import boto3
import json
import logging
from botocore.exceptions import ClientError
import os
from datetime import datetime

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

bedrock_runtime = boto3.client(service_name='bedrock-runtime')

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('TABLE_NAME'))
s3_client = boto3.client('s3')
S3_BUCKET_NAME = os.environ.get('BUCKET_NAME')

class BCO_API:
    
    def __init__(self, event):
        self.CancerName = event.get('breastCancerType')
        self.CancerStage = event.get('breastCancerStage')
        self.Username = event.get('username')
        self.Email = event.get('email')
        self.UserMessage = event.get('Message')
        self.ChatHistory = event.get('chatHistory')
        self.Prompt = ''''''
                     
    def configure_logging(self):
        response = bedrock_runtime.put_model_invocation_logging_configuration(
            destinationConfiguration={
                's3Configuration': {
                    'bucketName': S3_BUCKET_NAME,  # The S3 bucket name for storing logs
                    'prefix': 'bedrock_logs/'      # Optional: Prefix for the log files in the bucket
                }
            }
        )
        
        print("Logging configuration updated:", response)
    
    def setPromptNewlyDiagnosed(self):
        self.Prompt = f'''
                        A user who is known as {self.Username} has been newly diagnosed with {self.CancerName} which means the cancer is at stage 0 and the user is looking to understand their situation better and general information on Breast Cancer. You may refer to the website: https://www.breastcancer.org.
        
                        You must strictly follow the following rules:
                        
                        <rules>
                        Friendly, conversational voice that respects our readers’ intelligence while being sensitive to their experience
                        Use the second person personal pronouns: you, your, yours, yourself, yourselves.
                        There is one crucial exception: Never use personal pronouns when discussing cancer. (your cancer vs the cancer).
                        Avoid making cancer possessive (people with cancer vs people who’ve been diagnosed with cancer).
                        Aim to write short sentences in plain, simple language that is accessible. 
                        Aim for an eighth-grade reading level. 
                        Place the person before the disease or condition. 
                        Avoid the word patient and instead use a person or people.
                        Use the user's name whenever possible in appropriate setting.
                        Stay Confident and don't mention you don't have enough specific information.
                        <rules>
                        
                        Since the person is a newly diagnosed person. Respond with the highest level of empathy for every response.
                        
                     '''
    
    def setPromptMetastatic(self):
        self.Prompt = f'''
                        A user who is known as {self.Username} had been diagnosed with {self.CancerName} at metastatic stage for 2 years now and is looking to talk about her situation and understand any general information on Breast Cancer. You may refer to the website: https://www.breastcancer.org.

                        You must strictly follow the following rules:
                        
                        <rules>
                        Friendly, conversational voice that respects our readers’ intelligence while being sensitive to their experience
                        Use the second person personal pronouns: you, your, yours, yourself, yourselves.
                        There is one crucial exception: Never use personal pronouns when discussing cancer. (your cancer vs the cancer).
                        Avoid making cancer possessive (people with cancer vs people who’ve been diagnosed with cancer).
                        Aim to write short sentences in plain, simple language that is accessible. 
                        Aim for an eighth-grade reading level. 
                        Place the person before the disease or condition. 
                        Avoid the word patient and instead use a person or people.
                        Use the user's name whenever possible in appropriate setting.
                        Stay Confident and don't mention you don't have enough specific information.
                        <rules>
                        
                        Since the person has been diagnosed for a long time, Respond with  empathy for every response.
                    '''
    
    
    def generate_message(self, bedrock_runtime, model_id, system_prompt, messages, max_tokens):
    
        body=json.dumps(
            {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": max_tokens,
                "system": system_prompt,
                "messages": messages
            }  
        )  
    
        
        response = bedrock_runtime.invoke_model(body=body, modelId=model_id)

        timestamp = datetime.utcnow().strftime('%Y-%m-%dT%H-%M-%SZ')
        s3_key = f'bedrock-outputs/output-{timestamp}.json'
        
        response_body = json.loads(response.get('body').read())
        response_json = json.dumps(response_body)
        s3_response_body = response_json.encode('utf-8')

        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            Body=s3_response_body,
            ContentType='application/json'
        )

        return response_body
    
    
    def main(self):
        """
        Entrypoint for Anthropic Claude message example.
        """
        if self.CancerStage == 'Metastatic':
            self.setPromptMetastatic()
        else:
            self.setPromptNewlyDiagnosed()
    
        try:
    
            model_id = 'anthropic.claude-3-5-sonnet-20240620-v1:0'
            max_tokens = 1000
            
            if len(self.ChatHistory)<1 or isinstance(self.ChatHistory, str):
                self.ChatHistory = [[]]
                
            print({"role": "user", "content": f"{self.UserMessage}"})
            # Prompt with user turn only.
            print(self.ChatHistory[-1])
            messages = self.ChatHistory
    
            response = self.generate_message(bedrock_runtime, model_id, self.Prompt, messages, max_tokens)
            self.ChatHistory.append({"role": "assistant", "content": f"{response['content'][0]['text']}"})
            print("User turn only.")
            print(json.dumps(response, indent=4))
            
            return response
    
        except ClientError as err:
            message=err.response["Error"]["Message"]
            logger.error("A client error occurred: %s", message)
            print("A client error occured: " +
                format(message))
                
                
def lambda_handler(event, context):
    
    print(event)
    print(context)
    # json_obj = json.loads(event)
    if event['requestContext']['routeKey'] != 'sendMessage':
        return {
            'statusCode': 200,
            'body': f"{event}"
        }
    else:
        json_obj = json.loads(event['body'])
        api_object = BCO_API(json_obj)
        
        response = api_object.main()
        # return response['content'][0]['text']
        event["chatHistory"] = api_object.ChatHistory
        #Updates Table with latest Chat History
        table.update_item(
            Key={
                'email': json_obj.get('email')
            },
            UpdateExpression="SET chatHistory = :newchatHistory",
            ExpressionAttributeValues={
                ':newchatHistory': event["chatHistory"]
            },
            ReturnValues='ALL_NEW'
            )
        
        return {
            'statusCode': 200,
            'body': json.dumps({"ChatHistory": event["chatHistory"], "Response": response['content'][0]['text']})
        }
