"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IamStack = void 0;
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
class IamStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { config, namingHelper, taggingHelper } = props;
        // Custom Lambda Logging Policy
        const customLambdaLoggingPolicy = new iam.ManagedPolicy(this, 'CustomLambdaLoggingPolicy', {
            managedPolicyName: namingHelper.getIamPolicyName('CustomLambdaLoggingPolicy'),
            description: 'Custom policy for Lambda logging permissions',
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'logs:CreateLogStream',
                        'logs:CreateLogGroup',
                        'logs:TagResource'
                    ],
                    resources: ['*']
                }),
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'logs:PutLogEvents'
                    ],
                    resources: ['*']
                })
            ]
        });
        // Custom Lambda Logging Role
        this.customLambdaLoggingRole = new iam.Role(this, 'CustomLambdaLoggingRole', {
            roleName: namingHelper.getIamRoleName('CustomLambdaLoggingRole'),
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: 'Custom role for Lambda logging',
            managedPolicies: [customLambdaLoggingPolicy]
        });
        // Custom API Gateway Log Role
        this.customApiGatewayLogRole = new iam.Role(this, 'CustomApiGatewayLogRole', {
            roleName: namingHelper.getIamRoleName('CustomApiGatewayLogRole'),
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            description: 'Custom role for API Gateway logging',
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs')
            ]
        });
        // Custom Lambda Edge S3 Role
        this.customLambdaEdgeS3Role = new iam.Role(this, 'CustomLambdaEdgeS3Role', {
            roleName: namingHelper.getIamRoleName('CustomLambdaEdgeS3'),
            assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('lambda.amazonaws.com'), new iam.ServicePrincipal('edgelambda.amazonaws.com')),
            description: 'Custom role for Lambda Edge and S3 access',
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_ReadOnlyAccess'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
                customLambdaLoggingPolicy,
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess')
            ]
        });
        // Custom Lambda Common Role
        this.customLambdaCommonRole = new iam.Role(this, 'CustomLambdaCommonRole', {
            roleName: namingHelper.getIamRoleName('CustomLambdaCommon'),
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: 'Custom role for general Lambda functions',
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_ReadOnlyAccess'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
                customLambdaLoggingPolicy,
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSQSFullAccess')
            ]
        });
        // Custom Scheduler Lambda Execution Role
        this.customSchedulerLambdaExecutionRole = new iam.Role(this, 'CustomSchedulerLambdaExecutionRole', {
            roleName: namingHelper.getIamRoleName('CustomSchedulerLambdaExecutionRole'),
            assumedBy: new iam.ServicePrincipal('scheduler.amazonaws.com'),
            description: 'Custom role for EventBridge Scheduler to execute Lambda functions',
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole')
            ]
        });
        // Apply tags to all resources
        taggingHelper.applyTags(this, {
            StackName: 'IamStack',
            Purpose: 'IAM roles and policies for serverless infrastructure'
        });
        // Outputs
        new cdk.CfnOutput(this, 'CustomLambdaLoggingRoleArn', {
            value: this.customLambdaLoggingRole.roleArn,
            description: 'ARN of the Custom Lambda Logging Role'
        });
        new cdk.CfnOutput(this, 'CustomApiGatewayLogRoleArn', {
            value: this.customApiGatewayLogRole.roleArn,
            description: 'ARN of the Custom API Gateway Log Role'
        });
        new cdk.CfnOutput(this, 'CustomLambdaEdgeS3RoleArn', {
            value: this.customLambdaEdgeS3Role.roleArn,
            description: 'ARN of the Custom Lambda Edge S3 Role'
        });
        new cdk.CfnOutput(this, 'CustomLambdaCommonRoleArn', {
            value: this.customLambdaCommonRole.roleArn,
            description: 'ARN of the Custom Lambda Common Role'
        });
        new cdk.CfnOutput(this, 'CustomSchedulerLambdaExecutionRoleArn', {
            value: this.customSchedulerLambdaExecutionRole.roleArn,
            description: 'ARN of the Custom Scheduler Lambda Execution Role'
        });
    }
}
exports.IamStack = IamStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaWFtLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQywyQ0FBMkM7QUFZM0MsTUFBYSxRQUFTLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFPckMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFvQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFFdEQsK0JBQStCO1FBQy9CLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSwyQkFBMkIsRUFBRTtZQUN6RixpQkFBaUIsRUFBRSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsMkJBQTJCLENBQUM7WUFDN0UsV0FBVyxFQUFFLDhDQUE4QztZQUMzRCxVQUFVLEVBQUU7Z0JBQ1YsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO29CQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLO29CQUN4QixPQUFPLEVBQUU7d0JBQ1Asc0JBQXNCO3dCQUN0QixxQkFBcUI7d0JBQ3JCLGtCQUFrQjtxQkFDbkI7b0JBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO2lCQUNqQixDQUFDO2dCQUNGLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztvQkFDdEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSztvQkFDeEIsT0FBTyxFQUFFO3dCQUNQLG1CQUFtQjtxQkFDcEI7b0JBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO2lCQUNqQixDQUFDO2FBQ0g7U0FDRixDQUFDLENBQUM7UUFFSCw2QkFBNkI7UUFDN0IsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksR0FBRyxDQUFDLElB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LEtBQUssRUFBRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTztZQUMxQyxXQUFXLEVBQUUsc0NBQXNDO1NBQ3BELENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsdUNBQXVDLEVBQUU7WUFDL0QsS0FBSyxFQUFFLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxPQUFPO1lBQ3RELFdBQVcsRUFBRSxtREFBbUQ7U0FDakUsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBcklELDRCQXFJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IEVudmlyb25tZW50Q29uZmlnIH0gZnJvbSAnLi4vdXRpbHMvZW52aXJvbm1lbnQnO1xuaW1wb3J0IHsgTmFtaW5nSGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvbmFtaW5nJztcbmltcG9ydCB7IFRhZ2dpbmdIZWxwZXIgfSBmcm9tICcuLi91dGlscy90YWdzJztcblxuZXhwb3J0IGludGVyZmFjZSBJYW1TdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICByZWFkb25seSBjb25maWc6IEVudmlyb25tZW50Q29uZmlnO1xuICByZWFkb25seSBuYW1pbmdIZWxwZXI6IE5hbWluZ0hlbHBlcjtcbiAgcmVhZG9ubHkgdGFnZ2luZ0hlbHBlcjogVGFnZ2luZ0hlbHBlcjtcbn1cblxuZXhwb3J0IGNsYXNzIElhbVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IGN1c3RvbUxhbWJkYUxvZ2dpbmdSb2xlOiBpYW0uUm9sZTtcbiAgcHVibGljIHJlYWRvbmx5IGN1c3RvbUFwaUdhdGV3YXlMb2dSb2xlOiBpYW0uUm9sZTtcbiAgcHVibGljIHJlYWRvbmx5IGN1c3RvbUxhbWJkYUVkZ2VTM1JvbGU6IGlhbS5Sb2xlO1xuICBwdWJsaWMgcmVhZG9ubHkgY3VzdG9tTGFtYmRhQ29tbW9uUm9sZTogaWFtLlJvbGU7XG4gIHB1YmxpYyByZWFkb25seSBjdXN0b21TY2hlZHVsZXJMYW1iZGFFeGVjdXRpb25Sb2xlOiBpYW0uUm9sZTtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogSWFtU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgeyBjb25maWcsIG5hbWluZ0hlbHBlciwgdGFnZ2luZ0hlbHBlciB9ID0gcHJvcHM7XG5cbiAgICAvLyBDdXN0b20gTGFtYmRhIExvZ2dpbmcgUG9saWN5XG4gICAgY29uc3QgY3VzdG9tTGFtYmRhTG9nZ2luZ1BvbGljeSA9IG5ldyBpYW0uTWFuYWdlZFBvbGljeSh0aGlzLCAnQ3VzdG9tTGFtYmRhTG9nZ2luZ1BvbGljeScsIHtcbiAgICAgIG1hbmFnZWRQb2xpY3lOYW1lOiBuYW1pbmdIZWxwZXIuZ2V0SWFtUG9saWN5TmFtZSgnQ3VzdG9tTGFtYmRhTG9nZ2luZ1BvbGljeScpLFxuICAgICAgZGVzY3JpcHRpb246ICdDdXN0b20gcG9saWN5IGZvciBMYW1iZGEgbG9nZ2luZyBwZXJtaXNzaW9ucycsXG4gICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgICAgICdsb2dzOkNyZWF0ZUxvZ0dyb3VwJyxcbiAgICAgICAgICAgICdsb2dzOlRhZ1Jlc291cmNlJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgcmVzb3VyY2VzOiBbJyonXVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddXG4gICAgICAgIH0pXG4gICAgICBdXG4gICAgfSk7XG5cbiAgICAvLyBDdXN0b20gTGFtYmRhIExvZ2dpbmcgUm9sZVxuICAgIHRoaXMuY3VzdG9tTGFtYmRhTG9nZ2luZ1JvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0N1c3RvbUxhbWJkYUxvZ2dpbmdSb2xlJywge1xuICAgICAgcm9sZU5hbWU6IG5hbWluZ0hlbHBlci5nZXRJYW1Sb2xlTmFtZSgnQ3VzdG9tTGFtYmRhTG9nZ2luZ1JvbGUnKSxcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEuYW1hem9uYXdzLmNvbScpLFxuICAgICAgZGVzY3JpcHRpb246ICdDdXN0b20gcm9sZSBmb3IgTGFtYmRhIGxvZ2dpbmcnLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbY3VzdG9tTGFtYmRhTG9nZ2luZ1BvbGljeV1cbiAgICB9KTtcblxuICAgIC8vIEN1c3RvbSBBUEkgR2F0ZXdheSBMb2cgUm9sZVxuICAgIHRoaXMuY3VzdG9tQXBpR2F0ZXdheUxvZ1JvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0N1c3RvbUFwaUdhdGV3YXlMb2dSb2xlJywge1xuICAgICAgcm9sZU5hbWU6IG5hbWluZ0hlbHBlci5nZXRJYW1Sb2xlTmFtZSgnQ3VzdG9tQXBpR2F0ZXdheUxvZ1JvbGUnKSxcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdhcGlnYXRld2F5LmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ3VzdG9tIHJvbGUgZm9yIEFQSSBHYXRld2F5IGxvZ2dpbmcnLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FtYXpvbkFQSUdhdGV3YXlQdXNoVG9DbG91ZFdhdGNoTG9ncycpXG4gICAgICBdXG4gICAgfSk7XG5cbiAgICAvLyBDdXN0b20gTGFtYmRhIEVkZ2UgUzMgUm9sZVxuICAgIHRoaXMuY3VzdG9tTGFtYmRhRWRnZVMzUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnQ3VzdG9tTGFtYmRhRWRnZVMzUm9sZScsIHtcbiAgICAgIHJvbGVOYW1lOiBuYW1pbmdIZWxwZXIuZ2V0SWFtUm9sZU5hbWUoJ0N1c3RvbUxhbWJkYUVkZ2VTMycpLFxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLkNvbXBvc2l0ZVByaW5jaXBhbChcbiAgICAgICAgbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEuYW1hem9uYXdzLmNvbScpLFxuICAgICAgICBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2VkZ2VsYW1iZGEuYW1hem9uYXdzLmNvbScpXG4gICAgICApLFxuICAgICAgZGVzY3JpcHRpb246ICdDdXN0b20gcm9sZSBmb3IgTGFtYmRhIEVkZ2UgYW5kIFMzIGFjY2VzcycsXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBV1NMYW1iZGFfUmVhZE9ubHlBY2Nlc3MnKSxcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhQmFzaWNFeGVjdXRpb25Sb2xlJyksXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FXU0xhbWJkYVJvbGUnKSxcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhVlBDQWNjZXNzRXhlY3V0aW9uUm9sZScpLFxuICAgICAgICBjdXN0b21MYW1iZGFMb2dnaW5nUG9saWN5LFxuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FtYXpvblMzRnVsbEFjY2VzcycpXG4gICAgICBdXG4gICAgfSk7XG5cbiAgICAvLyBDdXN0b20gTGFtYmRhIENvbW1vbiBSb2xlXG4gICAgdGhpcy5jdXN0b21MYW1iZGFDb21tb25Sb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdDdXN0b21MYW1iZGFDb21tb25Sb2xlJywge1xuICAgICAgcm9sZU5hbWU6IG5hbWluZ0hlbHBlci5nZXRJYW1Sb2xlTmFtZSgnQ3VzdG9tTGFtYmRhQ29tbW9uJyksXG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnbGFtYmRhLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ3VzdG9tIHJvbGUgZm9yIGdlbmVyYWwgTGFtYmRhIGZ1bmN0aW9ucycsXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBV1NMYW1iZGFfUmVhZE9ubHlBY2Nlc3MnKSxcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhQmFzaWNFeGVjdXRpb25Sb2xlJyksXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FXU0xhbWJkYVJvbGUnKSxcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhVlBDQWNjZXNzRXhlY3V0aW9uUm9sZScpLFxuICAgICAgICBjdXN0b21MYW1iZGFMb2dnaW5nUG9saWN5LFxuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FtYXpvbkR5bmFtb0RCRnVsbEFjY2VzcycpLFxuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FtYXpvblMzRnVsbEFjY2VzcycpLFxuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FtYXpvblNTTVJlYWRPbmx5QWNjZXNzJyksXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnU2VjcmV0c01hbmFnZXJSZWFkV3JpdGUnKSxcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBbWF6b25TUVNGdWxsQWNjZXNzJylcbiAgICAgIF1cbiAgICB9KTtcblxuICAgIC8vIEN1c3RvbSBTY2hlZHVsZXIgTGFtYmRhIEV4ZWN1dGlvbiBSb2xlXG4gICAgdGhpcy5jdXN0b21TY2hlZHVsZXJMYW1iZGFFeGVjdXRpb25Sb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdDdXN0b21TY2hlZHVsZXJMYW1iZGFFeGVjdXRpb25Sb2xlJywge1xuICAgICAgcm9sZU5hbWU6IG5hbWluZ0hlbHBlci5nZXRJYW1Sb2xlTmFtZSgnQ3VzdG9tU2NoZWR1bGVyTGFtYmRhRXhlY3V0aW9uUm9sZScpLFxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ3NjaGVkdWxlci5hbWF6b25hd3MuY29tJyksXG4gICAgICBkZXNjcmlwdGlvbjogJ0N1c3RvbSByb2xlIGZvciBFdmVudEJyaWRnZSBTY2hlZHVsZXIgdG8gZXhlY3V0ZSBMYW1iZGEgZnVuY3Rpb25zJyxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BV1NMYW1iZGFSb2xlJylcbiAgICAgIF1cbiAgICB9KTtcblxuICAgIC8vIEFwcGx5IHRhZ3MgdG8gYWxsIHJlc291cmNlc1xuICAgIHRhZ2dpbmdIZWxwZXIuYXBwbHlUYWdzKHRoaXMsIHtcbiAgICAgIFN0YWNrTmFtZTogJ0lhbVN0YWNrJyxcbiAgICAgIFB1cnBvc2U6ICdJQU0gcm9sZXMgYW5kIHBvbGljaWVzIGZvciBzZXJ2ZXJsZXNzIGluZnJhc3RydWN0dXJlJ1xuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0c1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDdXN0b21MYW1iZGFMb2dnaW5nUm9sZUFybicsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmN1c3RvbUxhbWJkYUxvZ2dpbmdSb2xlLnJvbGVBcm4sXG4gICAgICBkZXNjcmlwdGlvbjogJ0FSTiBvZiB0aGUgQ3VzdG9tIExhbWJkYSBMb2dnaW5nIFJvbGUnXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQ3VzdG9tQXBpR2F0ZXdheUxvZ1JvbGVBcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5jdXN0b21BcGlHYXRld2F5TG9nUm9sZS5yb2xlQXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdBUk4gb2YgdGhlIEN1c3RvbSBBUEkgR2F0ZXdheSBMb2cgUm9sZSdcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDdXN0b21MYW1iZGFFZGdlUzNSb2xlQXJuJywge1xuICAgICAgdmFsdWU6IHRoaXMuY3VzdG9tTGFtYmRhRWRnZVMzUm9sZS5yb2xlQXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdBUk4gb2YgdGhlIEN1c3RvbSBMYW1iZGEgRWRnZSBTMyBSb2xlJ1xuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0N1c3RvbUxhbWJkYUNvbW1vblJvbGVBcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5jdXN0b21MYW1iZGFDb21tb25Sb2xlLnJvbGVBcm4sXG4gICAgICBkZXNjcmlwdGlvbjogJ0FSTiBvZiB0aGUgQ3VzdG9tIExhbWJkYSBDb21tb24gUm9sZSdcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDdXN0b21TY2hlZHVsZXJMYW1iZGFFeGVjdXRpb25Sb2xlQXJuJywge1xuICAgICAgdmFsdWU6IHRoaXMuY3VzdG9tU2NoZWR1bGVyTGFtYmRhRXhlY3V0aW9uUm9sZS5yb2xlQXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdBUk4gb2YgdGhlIEN1c3RvbSBTY2hlZHVsZXIgTGFtYmRhIEV4ZWN1dGlvbiBSb2xlJ1xuICAgIH0pO1xuICB9XG59Il19