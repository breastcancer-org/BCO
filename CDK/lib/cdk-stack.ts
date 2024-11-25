import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
// import * as amplify from '@aws-cdk-lib/aws-amplify-alpha';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';

interface CdkstackProps extends cdk.StackProps {
  githubToken: string;
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkstackProps) {
    super(scope, id, props); 

    // const githubTokenParameter = new cdk.CfnParameter(this, 'GitHubTokenParameter', {
    //   type: 'String', // The type of parameter (String, Number, etc.)
    //   description: 'GitHub Personal Access Token for Amplify'
    // });

    // const githubssmTokenParameter = new ssm.StringParameter(this, 'GitHub_TokenParameter', {
    //   parameterName: 'ssm-github-token',
    //   stringValue: githubTokenParameter.valueAsString,
    //   description: 'GitHub Personal Access Token for Amplify',
    //   tier: ssm.ParameterTier.STANDARD
    // });

    const githubToken = new secretsmanager.Secret(this, 'GitHubToken', {
      secretName: 'github-token',
      description: 'GitHub Personal Access Token for Amplify',
      secretStringValue: cdk.SecretValue.unsafePlainText(props.githubToken)
    });

    const amplifyApp = new amplify.App(this, 'amplify-app', {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: 'ASUCICREPO',
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
                'cd frontend',
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
            baseDirectory: 'frontend/build',
            files: [
              '**/*'
            ]
          },
          cache: {
            paths: [
              'frontend/node_modules/**/*'
            ]
          }
        }
      }),
    });

    amplifyApp.addBranch('main');
    

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
        TABLE_NAME: table.tableName, // Pass the DynamoDB table name to the Lambda function
      },
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

    // Add a User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
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
    // items.addMethod('GET');  // GET /items
    items.addMethod('POST'); // POST /items
    items.defaultCorsPreflightOptions;

    // const singleItem = items.addResource('{id}'); // e.g., /items/{id}
    // singleItem.addMethod('GET');  // GET /items/{id}
    // singleItem.addMethod('DELETE');  // DELETE /items/{id}

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
        returnResponse: true
      }
    );

    amplifyApp.addEnvironment('REACT_APP_WEBSOCKET_API', webSocketStage.url);
    amplifyApp.addEnvironment('REACT_APP_API_URL', restApi.url);

    // Output User Pool ID and Client ID
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });
    
  }
}
