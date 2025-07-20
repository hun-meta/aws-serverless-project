"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayStack = void 0;
const cdk = require("aws-cdk-lib");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const iam = require("aws-cdk-lib/aws-iam");
const logs = require("aws-cdk-lib/aws-logs");
class ApiGatewayStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.ApiGatewayStack = ApiGatewayStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLWdhdGV3YXktc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcGktZ2F0ZXdheS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBRXpELDJDQUEyQztBQUMzQyw2Q0FBNkM7QUFjN0MsTUFBYSxlQUFnQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBSTVDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBMkI7UUFDbkUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLG1CQUFtQixFQUFFLGNBQWMsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUUzRiw4Q0FBOEM7UUFDOUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUM3RCxZQUFZLEVBQUUsbUJBQW1CLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO1lBQ25FLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRO1lBQ3JGLGFBQWEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1NBQ3BGLENBQUMsQ0FBQztRQUVILHFCQUFxQjtRQUNyQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ2pELFdBQVcsRUFBRSxZQUFZLENBQUMsaUJBQWlCLEVBQUU7WUFDN0MsV0FBVyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssaURBQWlEO1lBQzdFLGFBQWEsRUFBRTtnQkFDYixTQUFTLEVBQUUsTUFBTSxDQUFDLEtBQUs7Z0JBQ3ZCLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDakQsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHO2dCQUMvQyxZQUFZLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLEtBQUs7Z0JBQ3JHLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxLQUFLO2dCQUM5QixjQUFjLEVBQUUsSUFBSTtnQkFDcEIsb0JBQW9CLEVBQUUsSUFBSSxVQUFVLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDO2dCQUNyRSxlQUFlLEVBQUUsVUFBVSxDQUFDLGVBQWUsQ0FBQyxzQkFBc0IsQ0FBQztvQkFDakUsTUFBTSxFQUFFLElBQUk7b0JBQ1osVUFBVSxFQUFFLElBQUk7b0JBQ2hCLEVBQUUsRUFBRSxJQUFJO29CQUNSLFFBQVEsRUFBRSxJQUFJO29CQUNkLFdBQVcsRUFBRSxJQUFJO29CQUNqQixZQUFZLEVBQUUsSUFBSTtvQkFDbEIsY0FBYyxFQUFFLElBQUk7b0JBQ3BCLE1BQU0sRUFBRSxJQUFJO29CQUNaLElBQUksRUFBRSxJQUFJO2lCQUNYLENBQUM7YUFDSDtZQUNELGNBQWMsRUFBRSxJQUFJO1lBQ3BCLDJCQUEyQixFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDakcscUJBQXFCLEVBQUU7Z0JBQ3JCLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO2FBQzFDO1lBQ0QsTUFBTSxFQUFFLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQztnQkFDN0IsVUFBVSxFQUFFO29CQUNWLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQzt3QkFDdEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSzt3QkFDeEIsVUFBVSxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7d0JBQ3BDLE9BQU8sRUFBRSxDQUFDLG9CQUFvQixDQUFDO3dCQUMvQixTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7cUJBQ2pCLENBQUM7aUJBQ0g7YUFDRixDQUFDO1NBQ0gsQ0FBQyxDQUFDO1FBRUgsaURBQWlEO1FBQ2pELElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDbkQsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLE9BQU87U0FDMUMsQ0FBQyxDQUFDO1FBRUgsbUNBQW1DO1FBQ25DLG1CQUFtQjtRQUNuQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRS9ELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQUU7WUFDbkYsS0FBSyxFQUFFLElBQUk7WUFDWCxlQUFlLEVBQUUsSUFBSTtTQUN0QixDQUFDLENBQUM7UUFFSCxrQ0FBa0M7UUFDbEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsc0JBQXNCLEVBQUU7WUFDaEUsZUFBZSxFQUFFO2dCQUNmO29CQUNFLFVBQVUsRUFBRSxLQUFLO29CQUNqQixrQkFBa0IsRUFBRTt3QkFDbEIsb0RBQW9ELEVBQUUsSUFBSTt3QkFDMUQscURBQXFELEVBQUUsSUFBSTt3QkFDM0QscURBQXFELEVBQUUsSUFBSTtxQkFDNUQ7aUJBQ0Y7Z0JBQ0Q7b0JBQ0UsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLGtCQUFrQixFQUFFO3dCQUNsQixvREFBb0QsRUFBRSxJQUFJO3FCQUMzRDtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsbUNBQW1DO1FBQ25DLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLHNCQUFzQixFQUFFO1lBQ2pFLGVBQWUsRUFBRTtnQkFDZjtvQkFDRSxVQUFVLEVBQUUsS0FBSztvQkFDakIsa0JBQWtCLEVBQUU7d0JBQ2xCLG9EQUFvRCxFQUFFLElBQUk7d0JBQzFELHFEQUFxRCxFQUFFLElBQUk7d0JBQzNELHFEQUFxRCxFQUFFLElBQUk7cUJBQzVEO2lCQUNGO2dCQUNEO29CQUNFLFVBQVUsRUFBRSxLQUFLO29CQUNqQixrQkFBa0IsRUFBRTt3QkFDbEIsb0RBQW9ELEVBQUUsSUFBSTtxQkFDM0Q7aUJBQ0Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILG1CQUFtQjtRQUNuQixJQUFJLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUM7WUFDeEMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXO1lBQ3ZGLFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDO1lBQ3hDLFlBQVksRUFBRSxDQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxzQkFBc0IsQ0FBQztZQUNsRyxnQkFBZ0IsRUFBRSxJQUFJO1NBQ3ZCLENBQUMsQ0FBQztRQUVILDhCQUE4QjtRQUM5QixhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRTtZQUM1QixTQUFTLEVBQUUsaUJBQWlCO1lBQzVCLE9BQU8sRUFBRSw4Q0FBOEM7U0FDeEQsQ0FBQyxDQUFDO1FBRUgsVUFBVTtRQUNWLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ3ZDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUc7WUFDbkIsV0FBVyxFQUFFLGlCQUFpQjtZQUM5QixVQUFVLEVBQUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUM7U0FDdkQsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdEMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUztZQUN6QixXQUFXLEVBQUUsZ0JBQWdCO1lBQzdCLFVBQVUsRUFBRSxZQUFZLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQztTQUN0RCxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQzdDLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRO1lBQzlCLFdBQVcsRUFBRSwyQkFBMkI7WUFDeEMsVUFBVSxFQUFFLFlBQVksQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUM7U0FDN0QsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBaEpELDBDQWdKQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBFbnZpcm9ubWVudENvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2Vudmlyb25tZW50JztcbmltcG9ydCB7IE5hbWluZ0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL25hbWluZyc7XG5pbXBvcnQgeyBUYWdnaW5nSGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvdGFncyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBpR2F0ZXdheVN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIHJlYWRvbmx5IGNvbmZpZzogRW52aXJvbm1lbnRDb25maWc7XG4gIHJlYWRvbmx5IG5hbWluZ0hlbHBlcjogTmFtaW5nSGVscGVyO1xuICByZWFkb25seSB0YWdnaW5nSGVscGVyOiBUYWdnaW5nSGVscGVyO1xuICByZWFkb25seSBoZWFsdGhDaGVja0Z1bmN0aW9uOiBsYW1iZGEuSUZ1bmN0aW9uO1xuICByZWFkb25seSBhcGlHYXRld2F5Um9sZTogaWFtLklSb2xlO1xufVxuXG5leHBvcnQgY2xhc3MgQXBpR2F0ZXdheVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IGFwaTogYXBpZ2F0ZXdheS5SZXN0QXBpO1xuICBwdWJsaWMgcmVhZG9ubHkgaGVhbHRoQ2hlY2tSZXNvdXJjZTogYXBpZ2F0ZXdheS5SZXNvdXJjZTtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogQXBpR2F0ZXdheVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHsgY29uZmlnLCBuYW1pbmdIZWxwZXIsIHRhZ2dpbmdIZWxwZXIsIGhlYWx0aENoZWNrRnVuY3Rpb24sIGFwaUdhdGV3YXlSb2xlIH0gPSBwcm9wcztcblxuICAgIC8vIENyZWF0ZSBDbG91ZFdhdGNoIExvZyBHcm91cCBmb3IgQVBJIEdhdGV3YXlcbiAgICBjb25zdCBsb2dHcm91cCA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsICdBcGlHYXRld2F5TG9nR3JvdXAnLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IGAvYXdzL2FwaWdhdGV3YXkvJHtuYW1pbmdIZWxwZXIuZ2V0QXBpR2F0ZXdheU5hbWUoKX1gLFxuICAgICAgcmV0ZW50aW9uOiBjb25maWcuaXNQcm9kID8gbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9NT05USCA6IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNvbmZpZy5pc1Byb2QgPyBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4gOiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgQVBJIEdhdGV3YXlcbiAgICB0aGlzLmFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ1Jlc3RBcGknLCB7XG4gICAgICByZXN0QXBpTmFtZTogbmFtaW5nSGVscGVyLmdldEFwaUdhdGV3YXlOYW1lKCksXG4gICAgICBkZXNjcmlwdGlvbjogYCR7Y29uZmlnLnN0YWdlfSBlbnZpcm9ubWVudCBBUEkgR2F0ZXdheSBmb3Igc2VydmVybGVzcyBiYWNrZW5kYCxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgc3RhZ2VOYW1lOiBjb25maWcuc3RhZ2UsXG4gICAgICAgIHRocm90dGxpbmdCdXJzdExpbWl0OiBjb25maWcuaXNQcm9kID8gNTAwMCA6IDEwMDAsXG4gICAgICAgIHRocm90dGxpbmdSYXRlTGltaXQ6IGNvbmZpZy5pc1Byb2QgPyAyMDAwIDogNTAwLFxuICAgICAgICBsb2dnaW5nTGV2ZWw6IGNvbmZpZy5pc0RldiA/IGFwaWdhdGV3YXkuTWV0aG9kTG9nZ2luZ0xldmVsLklORk8gOiBhcGlnYXRld2F5Lk1ldGhvZExvZ2dpbmdMZXZlbC5FUlJPUixcbiAgICAgICAgZGF0YVRyYWNlRW5hYmxlZDogY29uZmlnLmlzRGV2LFxuICAgICAgICBtZXRyaWNzRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgYWNjZXNzTG9nRGVzdGluYXRpb246IG5ldyBhcGlnYXRld2F5LkxvZ0dyb3VwTG9nRGVzdGluYXRpb24obG9nR3JvdXApLFxuICAgICAgICBhY2Nlc3NMb2dGb3JtYXQ6IGFwaWdhdGV3YXkuQWNjZXNzTG9nRm9ybWF0Lmpzb25XaXRoU3RhbmRhcmRGaWVsZHMoe1xuICAgICAgICAgIGNhbGxlcjogdHJ1ZSxcbiAgICAgICAgICBodHRwTWV0aG9kOiB0cnVlLFxuICAgICAgICAgIGlwOiB0cnVlLFxuICAgICAgICAgIHByb3RvY29sOiB0cnVlLFxuICAgICAgICAgIHJlcXVlc3RUaW1lOiB0cnVlLFxuICAgICAgICAgIHJlc291cmNlUGF0aDogdHJ1ZSxcbiAgICAgICAgICByZXNwb25zZUxlbmd0aDogdHJ1ZSxcbiAgICAgICAgICBzdGF0dXM6IHRydWUsXG4gICAgICAgICAgdXNlcjogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIGNsb3VkV2F0Y2hSb2xlOiB0cnVlLFxuICAgICAgY2xvdWRXYXRjaFJvbGVSZW1vdmFsUG9saWN5OiBjb25maWcuaXNQcm9kID8gY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOIDogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIGVuZHBvaW50Q29uZmlndXJhdGlvbjoge1xuICAgICAgICB0eXBlczogW2FwaWdhdGV3YXkuRW5kcG9pbnRUeXBlLlJFR0lPTkFMXVxuICAgICAgfSxcbiAgICAgIHBvbGljeTogbmV3IGlhbS5Qb2xpY3lEb2N1bWVudCh7XG4gICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICBwcmluY2lwYWxzOiBbbmV3IGlhbS5BbnlQcmluY2lwYWwoKV0sXG4gICAgICAgICAgICBhY3Rpb25zOiBbJ2V4ZWN1dGUtYXBpOkludm9rZSddLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbJyonXVxuICAgICAgICAgIH0pXG4gICAgICAgIF1cbiAgICAgIH0pXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgQVBJIEdhdGV3YXkgQWNjb3VudCBmb3IgQ2xvdWRXYXRjaCBMb2dzXG4gICAgbmV3IGFwaWdhdGV3YXkuQ2ZuQWNjb3VudCh0aGlzLCAnQXBpR2F0ZXdheUFjY291bnQnLCB7XG4gICAgICBjbG91ZFdhdGNoUm9sZUFybjogYXBpR2F0ZXdheVJvbGUucm9sZUFyblxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIEFQSSByZXNvdXJjZXMgYW5kIG1ldGhvZHNcbiAgICAvLyBIZWFsdGggQ2hlY2sgQVBJXG4gICAgdGhpcy5oZWFsdGhDaGVja1Jlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnaGVhbHRoJyk7XG4gICAgXG4gICAgY29uc3QgaGVhbHRoQ2hlY2tJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlYWx0aENoZWNrRnVuY3Rpb24sIHtcbiAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgYWxsb3dUZXN0SW52b2tlOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgR0VUIG1ldGhvZCBmb3IgaGVhbHRoIGNoZWNrXG4gICAgdGhpcy5oZWFsdGhDaGVja1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgaGVhbHRoQ2hlY2tJbnRlZ3JhdGlvbiwge1xuICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IHRydWUsXG4gICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogdHJ1ZSxcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgc3RhdHVzQ29kZTogJzUwMCcsXG4gICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgUE9TVCBtZXRob2QgZm9yIGhlYWx0aCBjaGVja1xuICAgIHRoaXMuaGVhbHRoQ2hlY2tSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBoZWFsdGhDaGVja0ludGVncmF0aW9uLCB7XG4gICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogdHJ1ZSxcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiB0cnVlLFxuICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBzdGF0dXNDb2RlOiAnNTAwJyxcbiAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KTtcblxuICAgIC8vIEFkZCBDT1JTIHN1cHBvcnRcbiAgICB0aGlzLmhlYWx0aENoZWNrUmVzb3VyY2UuYWRkQ29yc1ByZWZsaWdodCh7XG4gICAgICBhbGxvd09yaWdpbnM6IGNvbmZpZy5pc1Byb2QgPyBbJ2h0dHBzOi8veW91ci1kb21haW4uY29tJ10gOiBhcGlnYXRld2F5LkNvcnMuQUxMX09SSUdJTlMsXG4gICAgICBhbGxvd01ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnT1BUSU9OUyddLFxuICAgICAgYWxsb3dIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdYLUFtei1EYXRlJywgJ0F1dGhvcml6YXRpb24nLCAnWC1BcGktS2V5JywgJ1gtQW16LVNlY3VyaXR5LVRva2VuJ10sXG4gICAgICBhbGxvd0NyZWRlbnRpYWxzOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvLyBBcHBseSB0YWdzIHRvIGFsbCByZXNvdXJjZXNcbiAgICB0YWdnaW5nSGVscGVyLmFwcGx5VGFncyh0aGlzLCB7XG4gICAgICBTdGFja05hbWU6ICdBcGlHYXRld2F5U3RhY2snLFxuICAgICAgUHVycG9zZTogJ0FQSSBHYXRld2F5IGZvciBzZXJ2ZXJsZXNzIGJhY2tlbmQgZW5kcG9pbnRzJ1xuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0c1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBcGlHYXRld2F5VXJsJywge1xuICAgICAgdmFsdWU6IHRoaXMuYXBpLnVybCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIEdhdGV3YXkgVVJMJyxcbiAgICAgIGV4cG9ydE5hbWU6IG5hbWluZ0hlbHBlci5nZXRMb2dpY2FsSWQoJ0FwaUdhdGV3YXlVcmwnKVxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaUdhdGV3YXlJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmFwaS5yZXN0QXBpSWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBHYXRld2F5IElEJyxcbiAgICAgIGV4cG9ydE5hbWU6IG5hbWluZ0hlbHBlci5nZXRMb2dpY2FsSWQoJ0FwaUdhdGV3YXlJZCcpXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSGVhbHRoQ2hlY2tFbmRwb2ludCcsIHtcbiAgICAgIHZhbHVlOiBgJHt0aGlzLmFwaS51cmx9aGVhbHRoYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnSGVhbHRoIENoZWNrIEFQSSBFbmRwb2ludCcsXG4gICAgICBleHBvcnROYW1lOiBuYW1pbmdIZWxwZXIuZ2V0TG9naWNhbElkKCdIZWFsdGhDaGVja0VuZHBvaW50JylcbiAgICB9KTtcbiAgfVxufSJdfQ==