import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';

export interface S3StackProps extends cdk.StackProps {
  readonly config: EnvironmentConfig;
  readonly namingHelper: NamingHelper;
  readonly taggingHelper: TaggingHelper;
}

export class S3Stack extends cdk.Stack {
  public readonly fileStorageBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: S3StackProps) {
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
      this.fileStorageBucket.addToResourcePolicy(
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          principals: [new cdk.aws_iam.ServicePrincipal('logging.s3.amazonaws.com')],
          actions: ['s3:PutObject'],
          resources: [`${logsBucket.bucketArn}/*`],
          conditions: {
            StringEquals: {
              's3:x-amz-acl': 'bucket-owner-full-control'
            }
          }
        })
      );
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