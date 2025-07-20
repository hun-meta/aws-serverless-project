"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseStack = void 0;
const cdk = require("aws-cdk-lib");
const rds = require("aws-cdk-lib/aws-rds");
const ec2 = require("aws-cdk-lib/aws-ec2");
const secretsmanager = require("aws-cdk-lib/aws-secretsmanager");
class DatabaseStack extends cdk.Stack {
    constructor(scope, id, props) {
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
                version: rds.AuroraMysqlEngineVersion.VER_8_0_32
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
                version: rds.AuroraMysqlEngineVersion.VER_8_0_32
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
exports.DatabaseStack = DatabaseStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2Utc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYXRhYmFzZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMsMkNBQTJDO0FBQzNDLDJDQUEyQztBQUMzQyxpRUFBaUU7QUFjakUsTUFBYSxhQUFjLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJMUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF5QjtRQUNqRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLHNCQUFzQixFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRW5GLHFDQUFxQztRQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDOUQsVUFBVSxFQUFFLFlBQVksQ0FBQyxlQUFlLENBQUMsc0JBQXNCLENBQUM7WUFDaEUsV0FBVyxFQUFFLCtDQUErQztZQUM1RCxvQkFBb0IsRUFBRTtnQkFDcEIsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQztnQkFDM0QsaUJBQWlCLEVBQUUsVUFBVTtnQkFDN0IsaUJBQWlCLEVBQUUsU0FBUztnQkFDNUIsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLGNBQWMsRUFBRSxFQUFFO2FBQ25CO1NBQ0YsQ0FBQyxDQUFDO1FBRUgseUJBQXlCO1FBQ3pCLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDbkUsV0FBVyxFQUFFLHVDQUF1QztZQUNwRCxHQUFHO1lBQ0gsVUFBVSxFQUFFO2dCQUNWLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLGdCQUFn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dEQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBeEpELHNDQXdKQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyByZHMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJkcyc7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQgKiBhcyBzZWNyZXRzbWFuYWdlciBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc2VjcmV0c21hbmFnZXInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBFbnZpcm9ubWVudENvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2Vudmlyb25tZW50JztcbmltcG9ydCB7IE5hbWluZ0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL25hbWluZyc7XG5pbXBvcnQgeyBUYWdnaW5nSGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvdGFncyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF0YWJhc2VTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICByZWFkb25seSBjb25maWc6IEVudmlyb25tZW50Q29uZmlnO1xuICByZWFkb25seSBuYW1pbmdIZWxwZXI6IE5hbWluZ0hlbHBlcjtcbiAgcmVhZG9ubHkgdGFnZ2luZ0hlbHBlcjogVGFnZ2luZ0hlbHBlcjtcbiAgcmVhZG9ubHkgdnBjOiBlYzIuSVZwYztcbiAgcmVhZG9ubHkgZGF0YWJhc2VTZWN1cml0eUdyb3VwczogZWMyLklTZWN1cml0eUdyb3VwW107XG59XG5cbmV4cG9ydCBjbGFzcyBEYXRhYmFzZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IGNsdXN0ZXI6IHJkcy5EYXRhYmFzZUNsdXN0ZXI7XG4gIHB1YmxpYyByZWFkb25seSBzZWNyZXQ6IHNlY3JldHNtYW5hZ2VyLlNlY3JldDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogRGF0YWJhc2VTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB7IGNvbmZpZywgbmFtaW5nSGVscGVyLCB0YWdnaW5nSGVscGVyLCB2cGMsIGRhdGFiYXNlU2VjdXJpdHlHcm91cHMgfSA9IHByb3BzO1xuXG4gICAgLy8gQ3JlYXRlIGRhdGFiYXNlIGNyZWRlbnRpYWxzIHNlY3JldFxuICAgIHRoaXMuc2VjcmV0ID0gbmV3IHNlY3JldHNtYW5hZ2VyLlNlY3JldCh0aGlzLCAnRGF0YWJhc2VTZWNyZXQnLCB7XG4gICAgICBzZWNyZXROYW1lOiBuYW1pbmdIZWxwZXIuZ2V0UGh5c2ljYWxOYW1lKCdkYXRhYmFzZS1jcmVkZW50aWFscycpLFxuICAgICAgZGVzY3JpcHRpb246ICdEYXRhYmFzZSBjcmVkZW50aWFscyBmb3IgQXVyb3JhIFNlcnZlcmxlc3MgdjInLFxuICAgICAgZ2VuZXJhdGVTZWNyZXRTdHJpbmc6IHtcbiAgICAgICAgc2VjcmV0U3RyaW5nVGVtcGxhdGU6IEpTT04uc3RyaW5naWZ5KHsgdXNlcm5hbWU6ICdhZG1pbicgfSksXG4gICAgICAgIGdlbmVyYXRlU3RyaW5nS2V5OiAncGFzc3dvcmQnLFxuICAgICAgICBleGNsdWRlQ2hhcmFjdGVyczogJ1wiQC9cXFxcXFwnJyxcbiAgICAgICAgaW5jbHVkZVNwYWNlOiBmYWxzZSxcbiAgICAgICAgcGFzc3dvcmRMZW5ndGg6IDMyXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgREIgc3VibmV0IGdyb3VwXG4gICAgY29uc3Qgc3VibmV0R3JvdXAgPSBuZXcgcmRzLlN1Ym5ldEdyb3VwKHRoaXMsICdEYXRhYmFzZVN1Ym5ldEdyb3VwJywge1xuICAgICAgZGVzY3JpcHRpb246ICdTdWJuZXQgZ3JvdXAgZm9yIEF1cm9yYSBTZXJ2ZXJsZXNzIHYyJyxcbiAgICAgIHZwYyxcbiAgICAgIHZwY1N1Ym5ldHM6IHtcbiAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFJJVkFURV9JU09MQVRFRFxuICAgICAgfSxcbiAgICAgIHN1Ym5ldEdyb3VwTmFtZTogbmFtaW5nSGVscGVyLmdldFBoeXNpY2FsTmFtZSgnZGItc3VibmV0LWdyb3VwJylcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBBdXJvcmEgU2VydmVybGVzcyB2MiBjbHVzdGVyXG4gICAgdGhpcy5jbHVzdGVyID0gbmV3IHJkcy5EYXRhYmFzZUNsdXN0ZXIodGhpcywgJ0RhdGFiYXNlQ2x1c3RlcicsIHtcbiAgICAgIGNsdXN0ZXJJZGVudGlmaWVyOiBuYW1pbmdIZWxwZXIuZ2V0RGF0YWJhc2VOYW1lKCdhdXJvcmEnKSxcbiAgICAgIGVuZ2luZTogcmRzLkRhdGFiYXNlQ2x1c3RlckVuZ2luZS5hdXJvcmFNeXNxbCh7XG4gICAgICAgIHZlcnNpb246IHJkcy5BdXJvcmFNeXNxbEVuZ2luZVZlcnNpb24uVkVSXzhfMF8zMlxuICAgICAgfSksXG4gICAgICBjcmVkZW50aWFsczogcmRzLkNyZWRlbnRpYWxzLmZyb21TZWNyZXQodGhpcy5zZWNyZXQpLFxuICAgICAgd3JpdGVyOiByZHMuQ2x1c3Rlckluc3RhbmNlLnNlcnZlcmxlc3NWMignd3JpdGVyJywge1xuICAgICAgICBzY2FsZVdpdGhXcml0ZXI6IHRydWUsXG4gICAgICAgIGFsbG93TWFqb3JWZXJzaW9uVXBncmFkZTogZmFsc2UsXG4gICAgICAgIGF1dG9NaW5vclZlcnNpb25VcGdyYWRlOiB0cnVlLFxuICAgICAgICBlbmFibGVQZXJmb3JtYW5jZUluc2lnaHRzOiBjb25maWcuaXNQcm9kLFxuICAgICAgICBwZXJmb3JtYW5jZUluc2lnaHRSZXRlbnRpb246IGNvbmZpZy5pc1Byb2QgPyByZHMuUGVyZm9ybWFuY2VJbnNpZ2h0UmV0ZW50aW9uLk1PTlRIU18xIDogdW5kZWZpbmVkLFxuICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgaW5ub2RiX2J1ZmZlcl9wb29sX3NpemU6ICd7REJJbnN0YW5jZUNsYXNzTWVtb3J5KjMvNH0nLFxuICAgICAgICAgIG1heF9jb25uZWN0aW9uczogJzEwMDAnLFxuICAgICAgICAgIHNsb3dfcXVlcnlfbG9nOiAnMScsXG4gICAgICAgICAgbG9uZ19xdWVyeV90aW1lOiAnMicsXG4gICAgICAgICAgbG9nX3F1ZXJpZXNfbm90X3VzaW5nX2luZGV4ZXM6ICcxJ1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHJlYWRlcnM6IGNvbmZpZy5pc1Byb2QgPyBbXG4gICAgICAgIHJkcy5DbHVzdGVySW5zdGFuY2Uuc2VydmVybGVzc1YyKCdyZWFkZXInLCB7XG4gICAgICAgICAgc2NhbGVXaXRoV3JpdGVyOiB0cnVlLFxuICAgICAgICAgIGFsbG93TWFqb3JWZXJzaW9uVXBncmFkZTogZmFsc2UsXG4gICAgICAgICAgYXV0b01pbm9yVmVyc2lvblVwZ3JhZGU6IHRydWUsXG4gICAgICAgICAgZW5hYmxlUGVyZm9ybWFuY2VJbnNpZ2h0czogdHJ1ZSxcbiAgICAgICAgICBwZXJmb3JtYW5jZUluc2lnaHRSZXRlbnRpb246IHJkcy5QZXJmb3JtYW5jZUluc2lnaHRSZXRlbnRpb24uTU9OVEhTXzFcbiAgICAgICAgfSlcbiAgICAgIF0gOiB1bmRlZmluZWQsXG4gICAgICB2cGMsXG4gICAgICB2cGNTdWJuZXRzOiB7XG4gICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBSSVZBVEVfSVNPTEFURURcbiAgICAgIH0sXG4gICAgICBzdWJuZXRHcm91cCxcbiAgICAgIHNlY3VyaXR5R3JvdXBzOiBkYXRhYmFzZVNlY3VyaXR5R3JvdXBzLFxuICAgICAgcG9ydDogMzMwNixcbiAgICAgIHN0b3JhZ2VFbmNyeXB0ZWQ6IHRydWUsXG4gICAgICBiYWNrdXA6IHtcbiAgICAgICAgcmV0ZW50aW9uOiBjZGsuRHVyYXRpb24uZGF5cyhjb25maWcuZGF0YWJhc2UuYmFja3VwUmV0ZW50aW9uRGF5cyksXG4gICAgICAgIHByZWZlcnJlZFdpbmRvdzogJzAzOjAwLTA0OjAwJ1xuICAgICAgfSxcbiAgICAgIHByZWZlcnJlZE1haW50ZW5hbmNlV2luZG93OiAnc3VuOjA0OjAwLXN1bjowNTowMCcsXG4gICAgICBkZWxldGlvblByb3RlY3Rpb246IGNvbmZpZy5kYXRhYmFzZS5kZWxldGlvblByb3RlY3Rpb24sXG4gICAgICBkZWZhdWx0RGF0YWJhc2VOYW1lOiAnbWFpbicsXG4gICAgICBzZXJ2ZXJsZXNzVjJNaW5DYXBhY2l0eTogY29uZmlnLmRhdGFiYXNlLm1pbkNhcGFjaXR5LFxuICAgICAgc2VydmVybGVzc1YyTWF4Q2FwYWNpdHk6IGNvbmZpZy5kYXRhYmFzZS5tYXhDYXBhY2l0eSxcbiAgICAgIG1vbml0b3JpbmdJbnRlcnZhbDogY29uZmlnLmlzUHJvZCA/IGNkay5EdXJhdGlvbi5taW51dGVzKDEpIDogdW5kZWZpbmVkLFxuICAgICAgY2xvdWR3YXRjaExvZ3NFeHBvcnRzOiBbJ2Vycm9yJywgJ2dlbmVyYWwnLCAnc2xvd3F1ZXJ5J10sXG4gICAgICBjbG91ZHdhdGNoTG9nc1JldGVudGlvbjogY29uZmlnLmlzUHJvZCA/IGNkay5hd3NfbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9NT05USCA6IGNkay5hd3NfbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9XRUVLLFxuICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAnYXVyb3JhX2xhYl9tb2RlJzogJzAnLFxuICAgICAgICAnaW5ub2RiX2ZsdXNoX2xvZ19hdF90cnhfY29tbWl0JzogJzEnLFxuICAgICAgICAnc3luY19iaW5sb2cnOiAnMScsXG4gICAgICAgICdiaW5sb2dfZm9ybWF0JzogJ1JPVycsXG4gICAgICAgICdsb2dfYmluX3RydXN0X2Z1bmN0aW9uX2NyZWF0b3JzJzogJzEnXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYSBwYXJhbWV0ZXIgZ3JvdXAgZm9yIGN1c3RvbSBzZXR0aW5nc1xuICAgIGNvbnN0IHBhcmFtZXRlckdyb3VwID0gbmV3IHJkcy5QYXJhbWV0ZXJHcm91cCh0aGlzLCAnRGF0YWJhc2VQYXJhbWV0ZXJHcm91cCcsIHtcbiAgICAgIGVuZ2luZTogcmRzLkRhdGFiYXNlQ2x1c3RlckVuZ2luZS5hdXJvcmFNeXNxbCh7XG4gICAgICAgIHZlcnNpb246IHJkcy5BdXJvcmFNeXNxbEVuZ2luZVZlcnNpb24uVkVSXzhfMF8zMlxuICAgICAgfSksXG4gICAgICBkZXNjcmlwdGlvbjogJ0N1c3RvbSBwYXJhbWV0ZXIgZ3JvdXAgZm9yIEF1cm9yYSBTZXJ2ZXJsZXNzIHYyJyxcbiAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgJ21heF9jb25uZWN0aW9ucyc6ICcxMDAwJyxcbiAgICAgICAgJ2lubm9kYl9idWZmZXJfcG9vbF9zaXplJzogJ3tEQkluc3RhbmNlQ2xhc3NNZW1vcnkqMy80fScsXG4gICAgICAgICdzbG93X3F1ZXJ5X2xvZyc6ICcxJyxcbiAgICAgICAgJ2xvbmdfcXVlcnlfdGltZSc6ICcyJyxcbiAgICAgICAgJ2xvZ19xdWVyaWVzX25vdF91c2luZ19pbmRleGVzJzogJzEnLFxuICAgICAgICAnZ2VuZXJhbF9sb2cnOiAnMScsXG4gICAgICAgICdiaW5sb2dfZm9ybWF0JzogJ1JPVycsXG4gICAgICAgICdsb2dfYmluX3RydXN0X2Z1bmN0aW9uX2NyZWF0b3JzJzogJzEnXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBcHBseSB0YWdzIHRvIGFsbCByZXNvdXJjZXNcbiAgICB0YWdnaW5nSGVscGVyLmFwcGx5VGFncyh0aGlzLCB7XG4gICAgICBTdGFja05hbWU6ICdEYXRhYmFzZVN0YWNrJyxcbiAgICAgIFB1cnBvc2U6ICdBdXJvcmEgU2VydmVybGVzcyB2MiBkYXRhYmFzZSBjbHVzdGVyJ1xuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0c1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEYXRhYmFzZUNsdXN0ZXJFbmRwb2ludCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmNsdXN0ZXIuY2x1c3RlckVuZHBvaW50Lmhvc3RuYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdEYXRhYmFzZSBDbHVzdGVyIEVuZHBvaW50JyxcbiAgICAgIGV4cG9ydE5hbWU6IG5hbWluZ0hlbHBlci5nZXRMb2dpY2FsSWQoJ0RhdGFiYXNlQ2x1c3RlckVuZHBvaW50JylcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEYXRhYmFzZUNsdXN0ZXJSZWFkRW5kcG9pbnQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5jbHVzdGVyLmNsdXN0ZXJSZWFkRW5kcG9pbnQuaG9zdG5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0RhdGFiYXNlIENsdXN0ZXIgUmVhZCBFbmRwb2ludCcsXG4gICAgICBleHBvcnROYW1lOiBuYW1pbmdIZWxwZXIuZ2V0TG9naWNhbElkKCdEYXRhYmFzZUNsdXN0ZXJSZWFkRW5kcG9pbnQnKVxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0RhdGFiYXNlQ2x1c3RlcklkZW50aWZpZXInLCB7XG4gICAgICB2YWx1ZTogdGhpcy5jbHVzdGVyLmNsdXN0ZXJJZGVudGlmaWVyLFxuICAgICAgZGVzY3JpcHRpb246ICdEYXRhYmFzZSBDbHVzdGVyIElkZW50aWZpZXInLFxuICAgICAgZXhwb3J0TmFtZTogbmFtaW5nSGVscGVyLmdldExvZ2ljYWxJZCgnRGF0YWJhc2VDbHVzdGVySWRlbnRpZmllcicpXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRGF0YWJhc2VTZWNyZXRBcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5zZWNyZXQuc2VjcmV0QXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdEYXRhYmFzZSBTZWNyZXQgQVJOJyxcbiAgICAgIGV4cG9ydE5hbWU6IG5hbWluZ0hlbHBlci5nZXRMb2dpY2FsSWQoJ0RhdGFiYXNlU2VjcmV0QXJuJylcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEYXRhYmFzZVNlY3JldE5hbWUnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5zZWNyZXQuc2VjcmV0TmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRGF0YWJhc2UgU2VjcmV0IE5hbWUnLFxuICAgICAgZXhwb3J0TmFtZTogbmFtaW5nSGVscGVyLmdldExvZ2ljYWxJZCgnRGF0YWJhc2VTZWNyZXROYW1lJylcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEYXRhYmFzZVBvcnQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5jbHVzdGVyLmNsdXN0ZXJFbmRwb2ludC5wb3J0LnRvU3RyaW5nKCksXG4gICAgICBkZXNjcmlwdGlvbjogJ0RhdGFiYXNlIFBvcnQnLFxuICAgICAgZXhwb3J0TmFtZTogbmFtaW5nSGVscGVyLmdldExvZ2ljYWxJZCgnRGF0YWJhc2VQb3J0JylcbiAgICB9KTtcbiAgfVxufSJdfQ==