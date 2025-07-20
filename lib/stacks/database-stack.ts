import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';

export interface DatabaseStackProps extends cdk.StackProps {
  readonly config: EnvironmentConfig;
  readonly namingHelper: NamingHelper;
  readonly taggingHelper: TaggingHelper;
  readonly vpc: ec2.IVpc;
  readonly databaseSecurityGroups: ec2.ISecurityGroup[];
}

export class DatabaseStack extends cdk.Stack {
  public readonly cluster: rds.DatabaseCluster;
  public readonly secret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const { config, namingHelper, taggingHelper, vpc, databaseSecurityGroups } = props;

    // Create database credentials secret
    this.secret = new secretsmanager.Secret(this, 'DatabaseSecret', {
      secretName: namingHelper.getPhysicalName('database-credentials'),
      description: 'Database credentials for Aurora Serverless v2',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'admin' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\\'',
        includeSpace: false,
        passwordLength: 32
      }
    });

    // Create DB subnet group
    const subnetGroup = new rds.SubnetGroup(this, 'DatabaseSubnetGroup', {
      description: 'Subnet group for Aurora Serverless v2',
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED
      },
      subnetGroupName: namingHelper.getPhysicalName('db-subnet-group')
    });

    // Create Aurora Serverless v2 cluster
    this.cluster = new rds.DatabaseCluster(this, 'DatabaseCluster', {
      clusterIdentifier: namingHelper.getDatabaseName('aurora'),
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_07_0
      }),
      credentials: rds.Credentials.fromSecret(this.secret),
      writer: rds.ClusterInstance.serverlessV2('writer', {
        scaleWithWriter: true,
        allowMajorVersionUpgrade: false,
        autoMinorVersionUpgrade: true,
        enablePerformanceInsights: config.isProd,
        performanceInsightRetention: config.isProd ? rds.PerformanceInsightRetention.MONTHS_1 : undefined,
        parameters: {
          innodb_buffer_pool_size: '{DBInstanceClassMemory*3/4}',
          max_connections: '1000',
          slow_query_log: '1',
          long_query_time: '2',
          log_queries_not_using_indexes: '1'
        }
      }),
      readers: config.isProd ? [
        rds.ClusterInstance.serverlessV2('reader', {
          scaleWithWriter: true,
          allowMajorVersionUpgrade: false,
          autoMinorVersionUpgrade: true,
          enablePerformanceInsights: true,
          performanceInsightRetention: rds.PerformanceInsightRetention.MONTHS_1
        })
      ] : undefined,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED
      },
      subnetGroup,
      securityGroups: databaseSecurityGroups,
      port: 3306,
      storageEncrypted: true,
      backup: {
        retention: cdk.Duration.days(config.database.backupRetentionDays),
        preferredWindow: '03:00-04:00'
      },
      preferredMaintenanceWindow: 'sun:04:00-sun:05:00',
      deletionProtection: config.database.deletionProtection,
      defaultDatabaseName: 'main',
      serverlessV2MinCapacity: config.database.minCapacity,
      serverlessV2MaxCapacity: config.database.maxCapacity,
      monitoringInterval: config.isProd ? cdk.Duration.minutes(1) : undefined,
      cloudwatchLogsExports: ['error', 'general', 'slowquery'],
      cloudwatchLogsRetention: config.isProd ? cdk.aws_logs.RetentionDays.ONE_MONTH : cdk.aws_logs.RetentionDays.ONE_WEEK,
      parameters: {
        'aurora_lab_mode': '0',
        'innodb_flush_log_at_trx_commit': '1',
        'sync_binlog': '1',
        'binlog_format': 'ROW',
        'log_bin_trust_function_creators': '1'
      }
    });

    // Create a parameter group for custom settings
    const parameterGroup = new rds.ParameterGroup(this, 'DatabaseParameterGroup', {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_07_0
      }),
      description: 'Custom parameter group for Aurora Serverless v2',
      parameters: {
        'max_connections': '1000',
        'innodb_buffer_pool_size': '{DBInstanceClassMemory*3/4}',
        'slow_query_log': '1',
        'long_query_time': '2',
        'log_queries_not_using_indexes': '1',
        'general_log': '1',
        'binlog_format': 'ROW',
        'log_bin_trust_function_creators': '1'
      }
    });

    // Apply tags to all resources
    taggingHelper.applyTags(this, {
      StackName: 'DatabaseStack',
      Purpose: 'Aurora Serverless v2 database cluster'
    });

    // Outputs
    new cdk.CfnOutput(this, 'DatabaseClusterEndpoint', {
      value: this.cluster.clusterEndpoint.hostname,
      description: 'Database Cluster Endpoint',
      exportName: namingHelper.getLogicalId('DatabaseClusterEndpoint')
    });

    new cdk.CfnOutput(this, 'DatabaseClusterReadEndpoint', {
      value: this.cluster.clusterReadEndpoint.hostname,
      description: 'Database Cluster Read Endpoint',
      exportName: namingHelper.getLogicalId('DatabaseClusterReadEndpoint')
    });

    new cdk.CfnOutput(this, 'DatabaseClusterIdentifier', {
      value: this.cluster.clusterIdentifier,
      description: 'Database Cluster Identifier',
      exportName: namingHelper.getLogicalId('DatabaseClusterIdentifier')
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.secret.secretArn,
      description: 'Database Secret ARN',
      exportName: namingHelper.getLogicalId('DatabaseSecretArn')
    });

    new cdk.CfnOutput(this, 'DatabaseSecretName', {
      value: this.secret.secretName,
      description: 'Database Secret Name',
      exportName: namingHelper.getLogicalId('DatabaseSecretName')
    });

    new cdk.CfnOutput(this, 'DatabasePort', {
      value: this.cluster.clusterEndpoint.port.toString(),
      description: 'Database Port',
      exportName: namingHelper.getLogicalId('DatabasePort')
    });
  }
}