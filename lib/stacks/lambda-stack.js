"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const ec2 = require("aws-cdk-lib/aws-ec2");
const constants_1 = require("../utils/constants");
const path = require("path");
class LambdaStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { config, namingHelper, taggingHelper, vpc, lambdaSecurityGroup, lambdaRole } = props;
        // Health Check Lambda Function
        this.healthCheckFunction = new lambda.Function(this, 'HealthCheckFunction', {
            functionName: namingHelper.getLambdaFunctionName(constants_1.LAMBDA_FUNCTIONS.HEALTH_CHECK),
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/functions/health-check'), {
                bundling: {
                    image: lambda.Runtime.NODEJS_18_X.bundlingImage,
                    command: [
                        'bash', '-c', [
                            'npm install',
                            'npm run build 2>/dev/null || echo "No build script found"',
                            'cp -r . /asset-output/',
                            'cd /asset-output',
                            'npm install --production'
                        ].join(' && ')
                    ],
                    user: 'root',
                    workingDirectory: '/asset-input'
                }
            }),
            memorySize: config.lambda.memorySize,
            timeout: cdk.Duration.seconds(config.lambda.timeout),
            role: lambdaRole,
            vpc: vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
            },
            securityGroups: [lambdaSecurityGroup],
            environment: {
                NODE_ENV: config.stage,
                STAGE: config.stage,
                REGION: config.environment.region,
                LOG_LEVEL: config.isDev ? 'debug' : 'info'
            },
            reservedConcurrentExecutions: config.isProd ? 10 : 5,
            description: 'Health check function for API monitoring'
        });
        // Create Lambda alias for blue/green deployment
        const alias = new lambda.Alias(this, 'HealthCheckAlias', {
            aliasName: config.stage,
            version: this.healthCheckFunction.currentVersion,
            description: `${config.stage} environment alias for health check function`
        });
        // Apply tags to all resources
        taggingHelper.applyTags(this, {
            StackName: 'LambdaStack',
            Purpose: 'Lambda functions for API endpoints'
        });
        // Outputs
        new cdk.CfnOutput(this, 'HealthCheckFunctionArn', {
            value: this.healthCheckFunction.functionArn,
            description: 'Health Check Function ARN',
            exportName: namingHelper.getLogicalId('HealthCheckFunctionArn')
        });
        new cdk.CfnOutput(this, 'HealthCheckFunctionName', {
            value: this.healthCheckFunction.functionName,
            description: 'Health Check Function Name',
            exportName: namingHelper.getLogicalId('HealthCheckFunctionName')
        });
        new cdk.CfnOutput(this, 'HealthCheckAliasArn', {
            value: alias.functionArn,
            description: 'Health Check Function Alias ARN',
            exportName: namingHelper.getLogicalId('HealthCheckAliasArn')
        });
    }
}
exports.LambdaStack = LambdaStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGFtYmRhLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQyxpREFBaUQ7QUFDakQsMkNBQTJDO0FBTTNDLGtEQUFzRDtBQUN0RCw2QkFBNkI7QUFXN0IsTUFBYSxXQUFZLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFHeEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF1QjtRQUMvRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLG1CQUFtQixFQUFFLFVBQVUsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUU1RiwrQkFBK0I7UUFDL0IsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDMUUsWUFBWSxFQUFFLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyw0QkFBZ0IsQ0FBQyxZQUFZLENBQUM7WUFDL0UsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsZ0JBQWdCO1lBQ3pCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUscUNBQXFDLENBQUMsRUFDM0Q7Z0JBQ0UsUUFBUSxFQUFFO29CQUNSLEtBQUssRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxhQUFhO29CQUMvQyxPQUFPLEVBQUU7d0JBQ1AsTUFBTSxFQUFFLElBQUksRUFBRTs0QkFDWixhQUFhOzRCQUNiLDJEQUEyRDs0QkFDM0Qsd0JBQXdCOzRCQUN4QixrQkFBa0I7NEJBQ2xCLDBCQUEwQjt5QkFDM0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO3FCQUNmO29CQUNELElBQUksRUFBRSxNQUFNO29CQUNaLGdCQUFnQixFQUFFLGNBQWM7aUJBQ2pDO2FBQ0YsQ0FDRjtZQUNELFVBQVUsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVU7WUFDcEMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQ3BELElBQUksRUFBRSxVQUFVO1lBQ2hCLEdBQUcsRUFBRSxHQUFHO1lBQ1IsVUFBVSxFQUFFO2dCQUNWLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLG1CQUFtQjthQUMvQztZQUNELGNBQWMsRUFBRSxDQUFDLG1CQUFtQixDQUFDO1lBQ3JDLFdBQVcsRUFBRTtnQkFDWCxRQUFRLEVBQUUsTUFBTSxDQUFDLEtBQUs7Z0JBQ3RCLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSztnQkFDbkIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTTtnQkFDakMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTTthQUMzQztZQUNELDRCQUE0QixFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRCxXQUFXLEVBQUUsMENBQTBDO1NBQ3hELENBQUMsQ0FBQztRQUVILGdEQUFnRDtRQUNoRCxNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3ZELFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSztZQUN2QixPQUFPLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWM7WUFDaEQsV0FBVyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssOENBQThDO1NBQzNFLENBQUMsQ0FBQztRQUVILDhCQUE4QjtRQUM5QixhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRTtZQUM1QixTQUFTLEVBQUUsYUFBYTtZQUN4QixPQUFPLEVBQUUsb0NBQW9DO1NBQzlDLENBQUMsQ0FBQztRQUVILFVBQVU7UUFDVixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQ2hELEtBQUssRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVztZQUMzQyxXQUFXLEVBQUUsMkJBQTJCO1lBQ3hDLFVBQVUsRUFBRSxZQUFZLENBQUMsWUFBWSxDQUFDLHdCQUF3QixDQUFDO1NBQ2hFLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUU7WUFDakQsS0FBSyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZO1lBQzVDLFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsVUFBVSxFQUFFLFlBQVksQ0FBQyxZQUFZLENBQUMseUJBQXlCLENBQUM7U0FDakUsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUM3QyxLQUFLLEVBQUUsS0FBSyxDQUFDLFdBQVc7WUFDeEIsV0FBVyxFQUFFLGlDQUFpQztZQUM5QyxVQUFVLEVBQUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQztTQUM3RCxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFsRkQsa0NBa0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgRW52aXJvbm1lbnRDb25maWcgfSBmcm9tICcuLi91dGlscy9lbnZpcm9ubWVudCc7XG5pbXBvcnQgeyBOYW1pbmdIZWxwZXIgfSBmcm9tICcuLi91dGlscy9uYW1pbmcnO1xuaW1wb3J0IHsgVGFnZ2luZ0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL3RhZ3MnO1xuaW1wb3J0IHsgTEFNQkRBX0ZVTkNUSU9OUyB9IGZyb20gJy4uL3V0aWxzL2NvbnN0YW50cyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExhbWJkYVN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIHJlYWRvbmx5IGNvbmZpZzogRW52aXJvbm1lbnRDb25maWc7XG4gIHJlYWRvbmx5IG5hbWluZ0hlbHBlcjogTmFtaW5nSGVscGVyO1xuICByZWFkb25seSB0YWdnaW5nSGVscGVyOiBUYWdnaW5nSGVscGVyO1xuICByZWFkb25seSB2cGM6IGVjMi5JVnBjO1xuICByZWFkb25seSBsYW1iZGFTZWN1cml0eUdyb3VwOiBlYzIuSVNlY3VyaXR5R3JvdXA7XG4gIHJlYWRvbmx5IGxhbWJkYVJvbGU6IGlhbS5JUm9sZTtcbn1cblxuZXhwb3J0IGNsYXNzIExhbWJkYVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IGhlYWx0aENoZWNrRnVuY3Rpb246IGxhbWJkYS5GdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogTGFtYmRhU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgeyBjb25maWcsIG5hbWluZ0hlbHBlciwgdGFnZ2luZ0hlbHBlciwgdnBjLCBsYW1iZGFTZWN1cml0eUdyb3VwLCBsYW1iZGFSb2xlIH0gPSBwcm9wcztcblxuICAgIC8vIEhlYWx0aCBDaGVjayBMYW1iZGEgRnVuY3Rpb25cbiAgICB0aGlzLmhlYWx0aENoZWNrRnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdIZWFsdGhDaGVja0Z1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiBuYW1pbmdIZWxwZXIuZ2V0TGFtYmRhRnVuY3Rpb25OYW1lKExBTUJEQV9GVU5DVElPTlMuSEVBTFRIX0NIRUNLKSxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2xhbWJkYS5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcbiAgICAgICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYS9mdW5jdGlvbnMvaGVhbHRoLWNoZWNrJyksXG4gICAgICAgIHtcbiAgICAgICAgICBidW5kbGluZzoge1xuICAgICAgICAgICAgaW1hZ2U6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLmJ1bmRsaW5nSW1hZ2UsXG4gICAgICAgICAgICBjb21tYW5kOiBbXG4gICAgICAgICAgICAgICdiYXNoJywgJy1jJywgW1xuICAgICAgICAgICAgICAgICducG0gaW5zdGFsbCcsXG4gICAgICAgICAgICAgICAgJ25wbSBydW4gYnVpbGQgMj4vZGV2L251bGwgfHwgZWNobyBcIk5vIGJ1aWxkIHNjcmlwdCBmb3VuZFwiJyxcbiAgICAgICAgICAgICAgICAnY3AgLXIgLiAvYXNzZXQtb3V0cHV0LycsXG4gICAgICAgICAgICAgICAgJ2NkIC9hc3NldC1vdXRwdXQnLFxuICAgICAgICAgICAgICAgICducG0gaW5zdGFsbCAtLXByb2R1Y3Rpb24nXG4gICAgICAgICAgICAgIF0uam9pbignICYmICcpXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgdXNlcjogJ3Jvb3QnLFxuICAgICAgICAgICAgd29ya2luZ0RpcmVjdG9yeTogJy9hc3NldC1pbnB1dCdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICksXG4gICAgICBtZW1vcnlTaXplOiBjb25maWcubGFtYmRhLm1lbW9yeVNpemUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyhjb25maWcubGFtYmRhLnRpbWVvdXQpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHZwYzogdnBjLFxuICAgICAgdnBjU3VibmV0czoge1xuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfRUdSRVNTXG4gICAgICB9LFxuICAgICAgc2VjdXJpdHlHcm91cHM6IFtsYW1iZGFTZWN1cml0eUdyb3VwXSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE5PREVfRU5WOiBjb25maWcuc3RhZ2UsXG4gICAgICAgIFNUQUdFOiBjb25maWcuc3RhZ2UsXG4gICAgICAgIFJFR0lPTjogY29uZmlnLmVudmlyb25tZW50LnJlZ2lvbixcbiAgICAgICAgTE9HX0xFVkVMOiBjb25maWcuaXNEZXYgPyAnZGVidWcnIDogJ2luZm8nXG4gICAgICB9LFxuICAgICAgcmVzZXJ2ZWRDb25jdXJyZW50RXhlY3V0aW9uczogY29uZmlnLmlzUHJvZCA/IDEwIDogNSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnSGVhbHRoIGNoZWNrIGZ1bmN0aW9uIGZvciBBUEkgbW9uaXRvcmluZydcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBMYW1iZGEgYWxpYXMgZm9yIGJsdWUvZ3JlZW4gZGVwbG95bWVudFxuICAgIGNvbnN0IGFsaWFzID0gbmV3IGxhbWJkYS5BbGlhcyh0aGlzLCAnSGVhbHRoQ2hlY2tBbGlhcycsIHtcbiAgICAgIGFsaWFzTmFtZTogY29uZmlnLnN0YWdlLFxuICAgICAgdmVyc2lvbjogdGhpcy5oZWFsdGhDaGVja0Z1bmN0aW9uLmN1cnJlbnRWZXJzaW9uLFxuICAgICAgZGVzY3JpcHRpb246IGAke2NvbmZpZy5zdGFnZX0gZW52aXJvbm1lbnQgYWxpYXMgZm9yIGhlYWx0aCBjaGVjayBmdW5jdGlvbmBcbiAgICB9KTtcblxuICAgIC8vIEFwcGx5IHRhZ3MgdG8gYWxsIHJlc291cmNlc1xuICAgIHRhZ2dpbmdIZWxwZXIuYXBwbHlUYWdzKHRoaXMsIHtcbiAgICAgIFN0YWNrTmFtZTogJ0xhbWJkYVN0YWNrJyxcbiAgICAgIFB1cnBvc2U6ICdMYW1iZGEgZnVuY3Rpb25zIGZvciBBUEkgZW5kcG9pbnRzJ1xuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0c1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdIZWFsdGhDaGVja0Z1bmN0aW9uQXJuJywge1xuICAgICAgdmFsdWU6IHRoaXMuaGVhbHRoQ2hlY2tGdW5jdGlvbi5mdW5jdGlvbkFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnSGVhbHRoIENoZWNrIEZ1bmN0aW9uIEFSTicsXG4gICAgICBleHBvcnROYW1lOiBuYW1pbmdIZWxwZXIuZ2V0TG9naWNhbElkKCdIZWFsdGhDaGVja0Z1bmN0aW9uQXJuJylcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdIZWFsdGhDaGVja0Z1bmN0aW9uTmFtZScsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmhlYWx0aENoZWNrRnVuY3Rpb24uZnVuY3Rpb25OYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdIZWFsdGggQ2hlY2sgRnVuY3Rpb24gTmFtZScsXG4gICAgICBleHBvcnROYW1lOiBuYW1pbmdIZWxwZXIuZ2V0TG9naWNhbElkKCdIZWFsdGhDaGVja0Z1bmN0aW9uTmFtZScpXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSGVhbHRoQ2hlY2tBbGlhc0FybicsIHtcbiAgICAgIHZhbHVlOiBhbGlhcy5mdW5jdGlvbkFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnSGVhbHRoIENoZWNrIEZ1bmN0aW9uIEFsaWFzIEFSTicsXG4gICAgICBleHBvcnROYW1lOiBuYW1pbmdIZWxwZXIuZ2V0TG9naWNhbElkKCdIZWFsdGhDaGVja0FsaWFzQXJuJylcbiAgICB9KTtcbiAgfVxufSJdfQ==