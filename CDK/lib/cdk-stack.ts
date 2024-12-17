import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

interface CdkstackProps extends cdk.StackProps {
  githubToken: string;
  githubOwner: string;
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkstackProps) {
    super(scope, id, props); 

    const githubToken = new secretsmanager.Secret(this, 'GitHubToken', {
      secretName: 'github-token',
      description: 'GitHub Personal Access Token for Amplify',
      secretStringValue: cdk.SecretValue.unsafePlainText(props.githubToken)
    });

    const amplifyApp = new amplify.App(this, 'bco-amplify-app', {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: props.githubOwner,
        repository: 'BCO',
        oauthToken: githubToken.secretValue
      }),
      autoBranchCreation: {
        patterns: ['*'],
        basicAuth: amplify.BasicAuth.fromGeneratedPassword('username'),
        pullRequestEnvironmentName: 'staging'
      },
      buildSpec: cdk.aws_codebuild.BuildSpec.fromObjectToYaml({
        version: '1.0',
        frontend: {
          phases: {
            preBuild: {
              commands: [
                'cd Frontend',
                'npm ci'
              ]
            },
            build: {
              commands: [
                'npm run build'
              ]
            }
          },
          artifacts: {
            baseDirectory: 'Frontend/build',
            files: [
              '**/*'
            ]
          },
          cache: {
            paths: [
              'Frontend/node_modules/**/*'
            ]
          }
        }
      }),
    });

    amplifyApp.addBranch('main');
    
    const log_bucket = new s3.Bucket(this, 'BCOBucket', {
      bucketName: 'bco-bedrock-logging-bco-chatbot',  // Customize this to be unique
      versioned: false,  // Enable versioning
      removalPolicy: cdk.RemovalPolicy.DESTROY,  // Automatically delete the bucket when the stack is deleted
      autoDeleteObjects: true  // Automatically delete all objects in the bucket when it's destroyed
    });

    const table = new dynamodb.Table(this, 'BCO_Users', {
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING }
    });

    // Create Lambda functions from file (e.g., handler.js)
    const chatHistoryLambda = new lambda.Function(this, 'chathistoryLambda', {
      runtime: lambda.Runtime.PYTHON_3_12, // Define the runtime for the Lambda function
      code: lambda.Code.fromAsset('Lambda'), // Path to the lambda function folder
      handler: 'chatHistoryAPI.lambda_handler',  // The entry point function within the file (e.g., exports.handler in api.js)
      environment: {
        TABLE_NAME: table.tableName, // Pass the DynamoDB table name to the Lambda function
      },
    });

    chatHistoryLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:*",
          "s3:*",
          "dynamodb:*",
        ],
        resources: ["*"],
      })
    );


    const bedrockLambda = new lambda.Function(this, 'bco_bedrock_lambda', {
      runtime: lambda.Runtime.PYTHON_3_12, // Define the runtime for the Lambda function
      code: lambda.Code.fromAsset('Lambda'), // Path to the lambda function folder
      handler: 'bedrockAPI.lambda_handler',  // The entry point function within the file (e.g., exports.handler in api.js)
      environment: {
        TABLE_NAME: table.tableName,
        BUCKET_NAME: log_bucket.bucketName // Pass the DynamoDB table name to the Lambda function
      },
      timeout: cdk.Duration.seconds(60),
    });
    bedrockLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:*",
          "apigateway:*",
          "s3:*",
          "dynamodb:*",
          "bedrock:*"
        ],
        resources: ["*"],
      })
    );

    const confirmSignUp = new lambda.Function(this, 'confirmSignUpTest', {
      runtime: lambda.Runtime.PYTHON_3_12, // Define the runtime for the Lambda function
      code: lambda.Code.fromAsset('Lambda'), // Path to the lambda function folder
      handler: 'confirmSignUp.lambda_handler',  // The entry point function within the file (e.g., exports.handler in api.js)
      environment: {
        TABLE_NAME: table.tableName, // Pass the DynamoDB table name to the Lambda function
      },
    });

    confirmSignUp.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "cognito-idp:ConfirmSignUp",
          "cognito-idp:AdminUpdateUserAttributes"
        ],
        resources: ["*"],
      })
    );


    // Grant the Lambda function read/write permissions on the DynamoDB table
    table.grantReadWriteData(chatHistoryLambda);

    // Define a Cognito User Pool
    const userPool = new cognito.UserPool(this, 'BCOUserPool', {
      userPoolName: 'BCOUserPool',
      selfSignUpEnabled: true, // Allow users to sign up
      signInAliases: {
        email: true, // Users can sign in using their email
      },
      autoVerify: { email: true },  // Automatically verify email addresses
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: true, mutable: true }
      },
      lambdaTriggers: {
        preSignUp: confirmSignUp,
      },
      customAttributes: {
        'BreastCancerType': new cognito.StringAttribute({ mutable: true }),
        'DiagnosisStatus': new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: true,
        requireUppercase: true,
      },
    });

    const UserPoolDomain = userPool.addDomain('UserPoolDomainChatbot', {
      cognitoDomain: {
        domainPrefix: 'bco-user-pool-chatbot'
      }
    });

    // Add a User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClientChatbbot', {
      userPool,
    });

    // Define a REST API Gateway and link it to the REST Lambda function
    const restApi = new apigateway.LambdaRestApi(this, 'RestApiGateway', {
      handler: chatHistoryLambda,
      proxy: false, // Enable defining routes explicitly
      restApiName: 'chatHistoryAPI',
      description: 'REST API Gateway for managing Chat History',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // Allow all origins for development
        allowMethods: apigateway.Cors.ALL_METHODS, // Allow all methods
        allowHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
      },
    });

    // Define REST API routes (e.g., /items)
    const items = restApi.root.addResource('items');
    restApi.root.addMethod('PUT', new apigateway.LambdaIntegration(chatHistoryLambda, {
      proxy: false, // Enable proxy integration
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'"
        },
      }],
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true
        },
        responseModels: {
          'application/json': apigateway.Model.EMPTY_MODEL,
        },
      }],
    })

    items.defaultCorsPreflightOptions;

    // Define a WebSocket API Gateway and link it to the WebSocket Lambda function
    const webSocketApi = new apigatewayv2.WebSocketApi(this, 'WebSocketApi', {
      connectRouteOptions: { integration: new apigatewayv2integrations.WebSocketLambdaIntegration('ConnectIntegration', bedrockLambda) },
      defaultRouteOptions: { integration: new apigatewayv2integrations.WebSocketLambdaIntegration('DefaultIntegration', bedrockLambda) },
    });

    // Create a WebSocket Stage for development or production (e.g., dev)
    const webSocketStage = new apigatewayv2.WebSocketStage(this, 'WebSocketStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });
    
    webSocketApi.addRoute('sendMessage', 
      {
        integration: new apigatewayv2integrations.WebSocketLambdaIntegration('SendMessageIntegration', bedrockLambda),
        returnResponse: true,

      }
    );

    const cognitoDomainUrl = `https://${UserPoolDomain.domainName}.auth.${cdk.Aws.REGION}.amazoncognito.com`;

    amplifyApp.addEnvironment('REACT_APP_WEBSOCKET_API', webSocketStage.url);
    amplifyApp.addEnvironment('REACT_APP_API_URL', restApi.url);
    amplifyApp.addEnvironment('REACT_APP_USER_POOL_ID', userPool.userPoolId);
    amplifyApp.addEnvironment('REACT_APP_USER_POOL_CLIENT_ID', userPoolClient.userPoolClientId);
    amplifyApp.addEnvironment('REACT_APP_COGNITO_DOMAIN', cognitoDomainUrl);


    // Output User Pool ID and Client ID
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, 'cognitoDomain', {
      value: `https://${userPool.userPoolId}.auth.${this.region}.amazoncognito.com`
    });
    
    new cdk.CfnOutput(this, 'AmplifyAppDomain',{
      value: amplifyApp.defaultDomain
    });
    new cdk.CfnOutput(this, 's3bucket', {
      value: log_bucket.bucketName
    })
  }
}
