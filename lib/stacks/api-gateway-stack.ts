import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';

export interface ApiGatewayStackProps extends cdk.StackProps {
  readonly config: EnvironmentConfig;
  readonly namingHelper: NamingHelper;
  readonly taggingHelper: TaggingHelper;
  readonly healthCheckFunction: lambda.IFunction;
  readonly apiGatewayRole: iam.IRole;
}

export class ApiGatewayStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly healthCheckResource: apigateway.Resource;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const { config, namingHelper, taggingHelper, healthCheckFunction, apiGatewayRole } = props;

    // Create CloudWatch Log Group for API Gateway
    const logGroup = new logs.LogGroup(this, 'ApiGatewayLogGroup', {
      logGroupName: `/aws/apigateway/${namingHelper.getApiGatewayName()}`,
      retention: config.isProd ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.ONE_WEEK,
      removalPolicy: config.isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY
    });

    // Create API Gateway
    this.api = new apigateway.RestApi(this, 'RestApi', {
      restApiName: namingHelper.getApiGatewayName(),
      description: `${config.stage} environment API Gateway for serverless backend`,
      deployOptions: {
        stageName: config.stage,
        throttlingBurstLimit: config.isProd ? 5000 : 1000,
        throttlingRateLimit: config.isProd ? 2000 : 500,
        loggingLevel: config.isDev ? apigateway.MethodLoggingLevel.INFO : apigateway.MethodLoggingLevel.ERROR,
        dataTraceEnabled: config.isDev,
        metricsEnabled: true,
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: true,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true
        })
      },
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: config.isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL]
      },
      policy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals: [new iam.AnyPrincipal()],
            actions: ['execute-api:Invoke'],
            resources: ['*']
          })
        ]
      })
    });

    // Create API Gateway Account for CloudWatch Logs
    new apigateway.CfnAccount(this, 'ApiGatewayAccount', {
      cloudWatchRoleArn: apiGatewayRole.roleArn
    });

    // Create API resources and methods
    // Health Check API
    this.healthCheckResource = this.api.root.addResource('health');
    
    const healthCheckIntegration = new apigateway.LambdaIntegration(healthCheckFunction, {
      proxy: true,
      allowTestInvoke: true
    });

    // Add GET method for health check
    this.healthCheckResource.addMethod('GET', healthCheckIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true
          }
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        }
      ]
    });

    // Add POST method for health check
    this.healthCheckResource.addMethod('POST', healthCheckIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true
          }
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        }
      ]
    });

    // Add CORS support
    this.healthCheckResource.addCorsPreflight({
      allowOrigins: config.isProd ? ['https://your-domain.com'] : apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
      allowCredentials: true
    });

    // Apply tags to all resources
    taggingHelper.applyTags(this, {
      StackName: 'ApiGatewayStack',
      Purpose: 'API Gateway for serverless backend endpoints'
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
      exportName: namingHelper.getLogicalId('ApiGatewayUrl')
    });

    new cdk.CfnOutput(this, 'ApiGatewayId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
      exportName: namingHelper.getLogicalId('ApiGatewayId')
    });

    new cdk.CfnOutput(this, 'HealthCheckEndpoint', {
      value: `${this.api.url}health`,
      description: 'Health Check API Endpoint',
      exportName: namingHelper.getLogicalId('HealthCheckEndpoint')
    });
  }
}