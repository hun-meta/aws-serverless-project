"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Stack = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
class S3Stack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { config, namingHelper, taggingHelper } = props;
        // File Storage Bucket
        this.fileStorageBucket = new s3.Bucket(this, 'FileStorageBucket', {
            bucketName: namingHelper.getS3BucketName('file-storage'),
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            versioned: config.s3.versioning,
            lifecycleRules: [
                {
                    id: 'DeleteIncompleteMultipartUploads',
                    abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
                    enabled: true
                },
                {
                    id: 'TransitionToIA',
                    transitions: [
                        {
                            storageClass: s3.StorageClass.INFREQUENT_ACCESS,
                            transitionAfter: cdk.Duration.days(30)
                        },
                        {
                            storageClass: s3.StorageClass.GLACIER,
                            transitionAfter: cdk.Duration.days(90)
                        }
                    ],
                    enabled: config.isProd
                }
            ],
            cors: [
                {
                    allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT, s3.HttpMethods.DELETE],
                    allowedOrigins: config.isProd ? ['https://your-domain.com'] : ['*'],
                    allowedHeaders: ['*'],
                    exposedHeaders: ['ETag']
                }
            ],
            removalPolicy: config.isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: !config.isProd,
            eventBridgeEnabled: true,
            // Inventory configuration removed for simplicity
        });
        // Create a separate bucket for logs if production
        if (config.isProd) {
            const logsBucket = new s3.Bucket(this, 'LogsBucket', {
                bucketName: namingHelper.getS3BucketName('logs'),
                blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
                encryption: s3.BucketEncryption.S3_MANAGED,
                versioned: false,
                lifecycleRules: [
                    {
                        id: 'DeleteOldLogs',
                        enabled: true,
                        expiration: cdk.Duration.days(90)
                    }
                ],
                removalPolicy: cdk.RemovalPolicy.RETAIN,
                eventBridgeEnabled: false
            });
            // Enable access logging for the main bucket
            this.fileStorageBucket.addToResourcePolicy(new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                principals: [new cdk.aws_iam.ServicePrincipal('logging.s3.amazonaws.com')],
                actions: ['s3:PutObject'],
                resources: [`${logsBucket.bucketArn}/*`],
                conditions: {
                    StringEquals: {
                        's3:x-amz-acl': 'bucket-owner-full-control'
                    }
                }
            }));
        }
        // Apply tags to all resources
        taggingHelper.applyTags(this, {
            StackName: 'S3Stack',
            Purpose: 'S3 buckets for file storage and logs'
        });
        // Outputs
        new cdk.CfnOutput(this, 'FileStorageBucketName', {
            value: this.fileStorageBucket.bucketName,
            description: 'File Storage Bucket Name',
            exportName: namingHelper.getLogicalId('FileStorageBucketName')
        });
        new cdk.CfnOutput(this, 'FileStorageBucketArn', {
            value: this.fileStorageBucket.bucketArn,
            description: 'File Storage Bucket ARN',
            exportName: namingHelper.getLogicalId('FileStorageBucketArn')
        });
        new cdk.CfnOutput(this, 'FileStorageBucketDomainName', {
            value: this.fileStorageBucket.bucketDomainName,
            description: 'File Storage Bucket Domain Name',
            exportName: namingHelper.getLogicalId('FileStorageBucketDomainName')
        });
    }
}
exports.S3Stack = S3Stack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzMy1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseUNBQXlDO0FBWXpDLE1BQWEsT0FBUSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBR3BDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBbUI7UUFDM0QsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRXRELHNCQUFzQjtRQUN0QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUNoRSxVQUFVLEVBQUUsWUFBWSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUM7WUFDeEQsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVM7WUFDakQsVUFBVSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVO1lBQzFDLFNBQVMsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVU7WUFDL0IsY0FBYyxFQUFFO2dCQUNkO29CQUNFLEVBQUUsRUFBRSxrQ0FBa0M7b0JBQ3RDLG1DQUFtQyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDekQsT0FBTyxFQUFFLElBQUk7aUJBQ2Q7Z0JBQ0Q7b0JBQ0UsRUFBRSxFQUFFLGdCQUFnQjtvQkFDcEIsV0FBVyxFQUFFO3dCQUNYOzRCQUNFLFlBQVksRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLGlCQUFpQjs0QkFDL0MsZUFBZSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzt5QkFDdkM7d0JBQ0Q7NEJBQ0UsWUFBWSxFQUFFLEVBQUUsQ0FBQyxZ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QUFZLENBQUMsdUJBQXVCLENBQUM7U0FDL0QsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUM5QyxLQUFLLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVM7WUFDdkMsV0FBVyxFQUFFLHlCQUF5QjtZQUN0QyxVQUFVLEVBQUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQztTQUM5RCxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLDZCQUE2QixFQUFFO1lBQ3JELEtBQUssRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCO1lBQzlDLFdBQVcsRUFBRSxpQ0FBaUM7WUFDOUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxZQUFZLENBQUMsNkJBQTZCLENBQUM7U0FDckUsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBNUdELDBCQTRHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBFbnZpcm9ubWVudENvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2Vudmlyb25tZW50JztcbmltcG9ydCB7IE5hbWluZ0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL25hbWluZyc7XG5pbXBvcnQgeyBUYWdnaW5nSGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvdGFncyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUzNTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICByZWFkb25seSBjb25maWc6IEVudmlyb25tZW50Q29uZmlnO1xuICByZWFkb25seSBuYW1pbmdIZWxwZXI6IE5hbWluZ0hlbHBlcjtcbiAgcmVhZG9ubHkgdGFnZ2luZ0hlbHBlcjogVGFnZ2luZ0hlbHBlcjtcbn1cblxuZXhwb3J0IGNsYXNzIFMzU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwdWJsaWMgcmVhZG9ubHkgZmlsZVN0b3JhZ2VCdWNrZXQ6IHMzLkJ1Y2tldDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogUzNTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB7IGNvbmZpZywgbmFtaW5nSGVscGVyLCB0YWdnaW5nSGVscGVyIH0gPSBwcm9wcztcblxuICAgIC8vIEZpbGUgU3RvcmFnZSBCdWNrZXRcbiAgICB0aGlzLmZpbGVTdG9yYWdlQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnRmlsZVN0b3JhZ2VCdWNrZXQnLCB7XG4gICAgICBidWNrZXROYW1lOiBuYW1pbmdIZWxwZXIuZ2V0UzNCdWNrZXROYW1lKCdmaWxlLXN0b3JhZ2UnKSxcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG4gICAgICBlbmNyeXB0aW9uOiBzMy5CdWNrZXRFbmNyeXB0aW9uLlMzX01BTkFHRUQsXG4gICAgICB2ZXJzaW9uZWQ6IGNvbmZpZy5zMy52ZXJzaW9uaW5nLFxuICAgICAgbGlmZWN5Y2xlUnVsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiAnRGVsZXRlSW5jb21wbGV0ZU11bHRpcGFydFVwbG9hZHMnLFxuICAgICAgICAgIGFib3J0SW5jb21wbGV0ZU11bHRpcGFydFVwbG9hZEFmdGVyOiBjZGsuRHVyYXRpb24uZGF5cygxKSxcbiAgICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogJ1RyYW5zaXRpb25Ub0lBJyxcbiAgICAgICAgICB0cmFuc2l0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzdG9yYWdlQ2xhc3M6IHMzLlN0b3JhZ2VDbGFzcy5JTkZSRVFVRU5UX0FDQ0VTUyxcbiAgICAgICAgICAgICAgdHJhbnNpdGlvbkFmdGVyOiBjZGsuRHVyYXRpb24uZGF5cygzMClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHN0b3JhZ2VDbGFzczogczMuU3RvcmFnZUNsYXNzLkdMQUNJRVIsXG4gICAgICAgICAgICAgIHRyYW5zaXRpb25BZnRlcjogY2RrLkR1cmF0aW9uLmRheXMoOTApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBlbmFibGVkOiBjb25maWcuaXNQcm9kXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBjb3JzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBhbGxvd2VkTWV0aG9kczogW3MzLkh0dHBNZXRob2RzLkdFVCwgczMuSHR0cE1ldGhvZHMuUE9TVCwgczMuSHR0cE1ldGhvZHMuUFVULCBzMy5IdHRwTWV0aG9kcy5ERUxFVEVdLFxuICAgICAgICAgIGFsbG93ZWRPcmlnaW5zOiBjb25maWcuaXNQcm9kID8gWydodHRwczovL3lvdXItZG9tYWluLmNvbSddIDogWycqJ10sXG4gICAgICAgICAgYWxsb3dlZEhlYWRlcnM6IFsnKiddLFxuICAgICAgICAgIGV4cG9zZWRIZWFkZXJzOiBbJ0VUYWcnXVxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY29uZmlnLmlzUHJvZCA/IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTiA6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogIWNvbmZpZy5pc1Byb2QsXG4gICAgICBldmVudEJyaWRnZUVuYWJsZWQ6IHRydWUsXG4gICAgICAvLyBJbnZlbnRvcnkgY29uZmlndXJhdGlvbiByZW1vdmVkIGZvciBzaW1wbGljaXR5XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYSBzZXBhcmF0ZSBidWNrZXQgZm9yIGxvZ3MgaWYgcHJvZHVjdGlvblxuICAgIGlmIChjb25maWcuaXNQcm9kKSB7XG4gICAgICBjb25zdCBsb2dzQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnTG9nc0J1Y2tldCcsIHtcbiAgICAgICAgYnVja2V0TmFtZTogbmFtaW5nSGVscGVyLmdldFMzQnVja2V0TmFtZSgnbG9ncycpLFxuICAgICAgICBibG9ja1B1YmxpY0FjY2VzczogczMuQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLFxuICAgICAgICBlbmNyeXB0aW9uOiBzMy5CdWNrZXRFbmNyeXB0aW9uLlMzX01BTkFHRUQsXG4gICAgICAgIHZlcnNpb25lZDogZmFsc2UsXG4gICAgICAgIGxpZmVjeWNsZVJ1bGVzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdEZWxldGVPbGRMb2dzJyxcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICBleHBpcmF0aW9uOiBjZGsuRHVyYXRpb24uZGF5cyg5MClcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTixcbiAgICAgICAgZXZlbnRCcmlkZ2VFbmFibGVkOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEVuYWJsZSBhY2Nlc3MgbG9nZ2luZyBmb3IgdGhlIG1haW4gYnVja2V0XG4gICAgICB0aGlzLmZpbGVTdG9yYWdlQnVja2V0LmFkZFRvUmVzb3VyY2VQb2xpY3koXG4gICAgICAgIG5ldyBjZGsuYXdzX2lhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgIGVmZmVjdDogY2RrLmF3c19pYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgIHByaW5jaXBhbHM6IFtuZXcgY2RrLmF3c19pYW0uU2VydmljZVByaW5jaXBhbCgnbG9nZ2luZy5zMy5hbWF6b25hd3MuY29tJyldLFxuICAgICAgICAgIGFjdGlvbnM6IFsnczM6UHV0T2JqZWN0J10sXG4gICAgICAgICAgcmVzb3VyY2VzOiBbYCR7bG9nc0J1Y2tldC5idWNrZXRBcm59LypgXSxcbiAgICAgICAgICBjb25kaXRpb25zOiB7XG4gICAgICAgICAgICBTdHJpbmdFcXVhbHM6IHtcbiAgICAgICAgICAgICAgJ3MzOngtYW16LWFjbCc6ICdidWNrZXQtb3duZXItZnVsbC1jb250cm9sJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQXBwbHkgdGFncyB0byBhbGwgcmVzb3VyY2VzXG4gICAgdGFnZ2luZ0hlbHBlci5hcHBseVRhZ3ModGhpcywge1xuICAgICAgU3RhY2tOYW1lOiAnUzNTdGFjaycsXG4gICAgICBQdXJwb3NlOiAnUzMgYnVja2V0cyBmb3IgZmlsZSBzdG9yYWdlIGFuZCBsb2dzJ1xuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0c1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdGaWxlU3RvcmFnZUJ1Y2tldE5hbWUnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5maWxlU3RvcmFnZUJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdGaWxlIFN0b3JhZ2UgQnVja2V0IE5hbWUnLFxuICAgICAgZXhwb3J0TmFtZTogbmFtaW5nSGVscGVyLmdldExvZ2ljYWxJZCgnRmlsZVN0b3JhZ2VCdWNrZXROYW1lJylcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdGaWxlU3RvcmFnZUJ1Y2tldEFybicsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmZpbGVTdG9yYWdlQnVja2V0LmJ1Y2tldEFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnRmlsZSBTdG9yYWdlIEJ1Y2tldCBBUk4nLFxuICAgICAgZXhwb3J0TmFtZTogbmFtaW5nSGVscGVyLmdldExvZ2ljYWxJZCgnRmlsZVN0b3JhZ2VCdWNrZXRBcm4nKVxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0ZpbGVTdG9yYWdlQnVja2V0RG9tYWluTmFtZScsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmZpbGVTdG9yYWdlQnVja2V0LmJ1Y2tldERvbWFpbk5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZpbGUgU3RvcmFnZSBCdWNrZXQgRG9tYWluIE5hbWUnLFxuICAgICAgZXhwb3J0TmFtZTogbmFtaW5nSGVscGVyLmdldExvZ2ljYWxJZCgnRmlsZVN0b3JhZ2VCdWNrZXREb21haW5OYW1lJylcbiAgICB9KTtcbiAgfVxufSJdfQ==