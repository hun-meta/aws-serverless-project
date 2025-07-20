"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityGroupStack = void 0;
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
const constants_1 = require("../utils/constants");
class SecurityGroupStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { config, namingHelper, taggingHelper, vpc } = props;
        // Lambda Outbound Group - for Lambda functions
        this.lambdaOutboundGroup = new ec2.SecurityGroup(this, 'LambdaOutboundGroup', {
            securityGroupName: namingHelper.getSecurityGroupName('lambda-outbound-group'),
            vpc,
            description: 'Security group for Lambda functions - outbound only',
            allowAllOutbound: true
        });
        // Public SSH Group - for EC2 instances in public subnets
        this.publicSshGroup = new ec2.SecurityGroup(this, 'PublicSshGroup', {
            securityGroupName: namingHelper.getSecurityGroupName('public-ssh-group'),
            vpc,
            description: 'Security group for public EC2 instances with SSH access',
            allowAllOutbound: false
        });
        // Add SSH access from specific IP addresses (replace with actual IP ranges)
        this.publicSshGroup.addIngressRule(ec2.Peer.ipv4('0.0.0.0/0'), // Replace with specific IP range for security
        ec2.Port.tcp(constants_1.PORTS.SSH), 'SSH access from specific IP addresses');
        // Add SSH access from internal network
        this.publicSshGroup.addIngressRule(ec2.Peer.ipv4(config.vpc.cidr), ec2.Port.tcp(constants_1.PORTS.SSH), 'SSH access from internal network');
        // Bastion Host Outbound Group
        this.bastionOutboundGroup = new ec2.SecurityGroup(this, 'BastionOutboundGroup', {
            securityGroupName: namingHelper.getSecurityGroupName('bastion-outbound-group'),
            vpc,
            description: 'Security group for Bastion Host - outbound to internal network',
            allowAllOutbound: false
        });
        // Allow outbound to internal network
        this.bastionOutboundGroup.addEgressRule(ec2.Peer.ipv4(config.vpc.cidr), ec2.Port.allTraffic(), 'Outbound to internal network');
        // NAT Group - for NAT instances
        this.natGroup = new ec2.SecurityGroup(this, 'NatGroup', {
            securityGroupName: namingHelper.getSecurityGroupName('nat-group'),
            vpc,
            description: 'Security group for NAT instances',
            allowAllOutbound: true
        });
        // Allow inbound from internal network
        this.natGroup.addIngressRule(ec2.Peer.ipv4(config.vpc.cidr), ec2.Port.allTraffic(), 'Inbound from internal network');
        // Database SSH Group - for database access from Bastion
        this.dbSshGroup = new ec2.SecurityGroup(this, 'DbSshGroup', {
            securityGroupName: namingHelper.getSecurityGroupName('db-ssh-group'),
            vpc,
            description: 'Security group for database access from Bastion Host',
            allowAllOutbound: true
        });
        // Allow MySQL access from Bastion
        this.dbSshGroup.addIngressRule(this.bastionOutboundGroup, ec2.Port.tcp(constants_1.PORTS.MYSQL), 'MySQL access from Bastion Host');
        // Database Private Group - for database access from Lambda
        this.dbPrivateGroup = new ec2.SecurityGroup(this, 'DbPrivateGroup', {
            securityGroupName: namingHelper.getSecurityGroupName('db-private-group'),
            vpc,
            description: 'Security group for database access from Lambda functions',
            allowAllOutbound: false
        });
        // Allow MySQL access from Lambda
        this.dbPrivateGroup.addIngressRule(this.lambdaOutboundGroup, ec2.Port.tcp(constants_1.PORTS.MYSQL), 'MySQL access from Lambda functions');
        // Local Outbound Group - for internal communication
        this.localOutboundGroup = new ec2.SecurityGroup(this, 'LocalOutboundGroup', {
            securityGroupName: namingHelper.getSecurityGroupName('local-outbound-group'),
            vpc,
            description: 'Security group for internal network communication',
            allowAllOutbound: false
        });
        // Allow outbound to internal network
        this.localOutboundGroup.addEgressRule(ec2.Peer.ipv4(config.vpc.cidr), ec2.Port.allTraffic(), 'Outbound to internal network');
        // Apply tags to all resources
        taggingHelper.applyTags(this, {
            StackName: 'SecurityGroupStack',
            Purpose: 'Security groups for network access control'
        });
        // Outputs
        new cdk.CfnOutput(this, 'LambdaOutboundGroupId', {
            value: this.lambdaOutboundGroup.securityGroupId,
            description: 'Lambda Outbound Security Group ID',
            exportName: namingHelper.getLogicalId('LambdaOutboundGroupId')
        });
        new cdk.CfnOutput(this, 'PublicSshGroupId', {
            value: this.publicSshGroup.securityGroupId,
            description: 'Public SSH Security Group ID',
            exportName: namingHelper.getLogicalId('PublicSshGroupId')
        });
        new cdk.CfnOutput(this, 'BastionOutboundGroupId', {
            value: this.bastionOutboundGroup.securityGroupId,
            description: 'Bastion Outbound Security Group ID',
            exportName: namingHelper.getLogicalId('BastionOutboundGroupId')
        });
        new cdk.CfnOutput(this, 'NatGroupId', {
            value: this.natGroup.securityGroupId,
            description: 'NAT Security Group ID',
            exportName: namingHelper.getLogicalId('NatGroupId')
        });
        new cdk.CfnOutput(this, 'DbSshGroupId', {
            value: this.dbSshGroup.securityGroupId,
            description: 'Database SSH Security Group ID',
            exportName: namingHelper.getLogicalId('DbSshGroupId')
        });
        new cdk.CfnOutput(this, 'DbPrivateGroupId', {
            value: this.dbPrivateGroup.securityGroupId,
            description: 'Database Private Security Group ID',
            exportName: namingHelper.getLogicalId('DbPrivateGroupId')
        });
        new cdk.CfnOutput(this, 'LocalOutboundGroupId', {
            value: this.localOutboundGroup.securityGroupId,
            description: 'Local Outbound Security Group ID',
            exportName: namingHelper.getLogicalId('LocalOutboundGroupId')
        });
    }
}
exports.SecurityGroupStack = SecurityGroupStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHktZ3JvdXAtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZWN1cml0eS1ncm91cC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMsMkNBQTJDO0FBSzNDLGtEQUEyQztBQVMzQyxNQUFhLGtCQUFtQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBUy9DLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBOEI7UUFDdEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUUzRCwrQ0FBK0M7UUFDL0MsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDNUUsaUJBQWlCLEVBQUUsWUFBWSxDQUFDLG9CQUFvQixDQUFDLHVCQUF1QixDQUFDO1lBQzdFLEdBQUc7WUFDSCxXQUFXLEVBQUUscURBQXFEO1lBQ2xFLGdCQUFnQixFQUFFLElBQUk7U0FDdkIsQ0FBQyxDQUFDO1FBRUgseURBQXlEO1FBQ3pELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUNsRSxpQkFBaUIsRUFBRSxZQUFZLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLENBQUM7WUFDeEUsR0FBRztZQUNILFdBQVcsRUFBRSx5REFBeUQ7WUFDdEUsZ0JBQWdCLEVBQUUsS0FBSztTQUN4QixDQUFDLENBQUM7UUFFSCw0RUFBNEU7UUFDNUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQ2hDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLDhDQUE4QztRQUMxRSxHQUFHLENBQUMs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O1lBQ2pELFVBQVUsRUFBRSxZQUFZLENBQUMsWUFBWSxDQUFDLHdCQUF3QixDQUFDO1NBQ2hFLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWU7WUFDcEMsV0FBVyxFQUFFLHVCQUF1QjtZQUNwQyxVQUFVLEVBQUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUM7U0FDcEQsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdEMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZTtZQUN0QyxXQUFXLEVBQUUsZ0NBQWdDO1lBQzdDLFVBQVUsRUFBRSxZQUFZLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQztTQUN0RCxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzFDLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWU7WUFDMUMsV0FBVyxFQUFFLG9DQUFvQztZQUNqRCxVQUFVLEVBQUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQztTQUMxRCxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQzlDLEtBQUssRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZTtZQUM5QyxXQUFXLEVBQUUsa0NBQWtDO1lBQy9DLFVBQVUsRUFBRSxZQUFZLENBQUMsWUFBWSxDQUFDLHNCQUFzQixDQUFDO1NBQzlELENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXhLRCxnREF3S0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBFbnZpcm9ubWVudENvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2Vudmlyb25tZW50JztcbmltcG9ydCB7IE5hbWluZ0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL25hbWluZyc7XG5pbXBvcnQgeyBUYWdnaW5nSGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvdGFncyc7XG5pbXBvcnQgeyBQT1JUUyB9IGZyb20gJy4uL3V0aWxzL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VjdXJpdHlHcm91cFN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIHJlYWRvbmx5IGNvbmZpZzogRW52aXJvbm1lbnRDb25maWc7XG4gIHJlYWRvbmx5IG5hbWluZ0hlbHBlcjogTmFtaW5nSGVscGVyO1xuICByZWFkb25seSB0YWdnaW5nSGVscGVyOiBUYWdnaW5nSGVscGVyO1xuICByZWFkb25seSB2cGM6IGVjMi5JVnBjO1xufVxuXG5leHBvcnQgY2xhc3MgU2VjdXJpdHlHcm91cFN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IGxhbWJkYU91dGJvdW5kR3JvdXA6IGVjMi5TZWN1cml0eUdyb3VwO1xuICBwdWJsaWMgcmVhZG9ubHkgcHVibGljU3NoR3JvdXA6IGVjMi5TZWN1cml0eUdyb3VwO1xuICBwdWJsaWMgcmVhZG9ubHkgYmFzdGlvbk91dGJvdW5kR3JvdXA6IGVjMi5TZWN1cml0eUdyb3VwO1xuICBwdWJsaWMgcmVhZG9ubHkgbmF0R3JvdXA6IGVjMi5TZWN1cml0eUdyb3VwO1xuICBwdWJsaWMgcmVhZG9ubHkgZGJTc2hHcm91cDogZWMyLlNlY3VyaXR5R3JvdXA7XG4gIHB1YmxpYyByZWFkb25seSBkYlByaXZhdGVHcm91cDogZWMyLlNlY3VyaXR5R3JvdXA7XG4gIHB1YmxpYyByZWFkb25seSBsb2NhbE91dGJvdW5kR3JvdXA6IGVjMi5TZWN1cml0eUdyb3VwO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBTZWN1cml0eUdyb3VwU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgeyBjb25maWcsIG5hbWluZ0hlbHBlciwgdGFnZ2luZ0hlbHBlciwgdnBjIH0gPSBwcm9wcztcblxuICAgIC8vIExhbWJkYSBPdXRib3VuZCBHcm91cCAtIGZvciBMYW1iZGEgZnVuY3Rpb25zXG4gICAgdGhpcy5sYW1iZGFPdXRib3VuZEdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdMYW1iZGFPdXRib3VuZEdyb3VwJywge1xuICAgICAgc2VjdXJpdHlHcm91cE5hbWU6IG5hbWluZ0hlbHBlci5nZXRTZWN1cml0eUdyb3VwTmFtZSgnbGFtYmRhLW91dGJvdW5kLWdyb3VwJyksXG4gICAgICB2cGMsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NlY3VyaXR5IGdyb3VwIGZvciBMYW1iZGEgZnVuY3Rpb25zIC0gb3V0Ym91bmQgb25seScsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvLyBQdWJsaWMgU1NIIEdyb3VwIC0gZm9yIEVDMiBpbnN0YW5jZXMgaW4gcHVibGljIHN1Ym5ldHNcbiAgICB0aGlzLnB1YmxpY1NzaEdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdQdWJsaWNTc2hHcm91cCcsIHtcbiAgICAgIHNlY3VyaXR5R3JvdXBOYW1lOiBuYW1pbmdIZWxwZXIuZ2V0U2VjdXJpdHlHcm91cE5hbWUoJ3B1YmxpYy1zc2gtZ3JvdXAnKSxcbiAgICAgIHZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIHB1YmxpYyBFQzIgaW5zdGFuY2VzIHdpdGggU1NIIGFjY2VzcycsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgLy8gQWRkIFNTSCBhY2Nlc3MgZnJvbSBzcGVjaWZpYyBJUCBhZGRyZXNzZXMgKHJlcGxhY2Ugd2l0aCBhY3R1YWwgSVAgcmFuZ2VzKVxuICAgIHRoaXMucHVibGljU3NoR3JvdXAuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBlYzIuUGVlci5pcHY0KCcwLjAuMC4wLzAnKSwgLy8gUmVwbGFjZSB3aXRoIHNwZWNpZmljIElQIHJhbmdlIGZvciBzZWN1cml0eVxuICAgICAgZWMyLlBvcnQudGNwKFBPUlRTLlNTSCksXG4gICAgICAnU1NIIGFjY2VzcyBmcm9tIHNwZWNpZmljIElQIGFkZHJlc3NlcydcbiAgICApO1xuXG4gICAgLy8gQWRkIFNTSCBhY2Nlc3MgZnJvbSBpbnRlcm5hbCBuZXR3b3JrXG4gICAgdGhpcy5wdWJsaWNTc2hHcm91cC5hZGRJbmdyZXNzUnVsZShcbiAgICAgIGVjMi5QZWVyLmlwdjQoY29uZmlnLnZwYy5jaWRyKSxcbiAgICAgIGVjMi5Qb3J0LnRjcChQT1JUUy5TU0gpLFxuICAgICAgJ1NTSCBhY2Nlc3MgZnJvbSBpbnRlcm5hbCBuZXR3b3JrJ1xuICAgICk7XG5cbiAgICAvLyBCYXN0aW9uIEhvc3QgT3V0Ym91bmQgR3JvdXBcbiAgICB0aGlzLmJhc3Rpb25PdXRib3VuZEdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdCYXN0aW9uT3V0Ym91bmRHcm91cCcsIHtcbiAgICAgIHNlY3VyaXR5R3JvdXBOYW1lOiBuYW1pbmdIZWxwZXIuZ2V0U2VjdXJpdHlHcm91cE5hbWUoJ2Jhc3Rpb24tb3V0Ym91bmQtZ3JvdXAnKSxcbiAgICAgIHZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIEJhc3Rpb24gSG9zdCAtIG91dGJvdW5kIHRvIGludGVybmFsIG5ldHdvcmsnLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogZmFsc2VcbiAgICB9KTtcblxuICAgIC8vIEFsbG93IG91dGJvdW5kIHRvIGludGVybmFsIG5ldHdvcmtcbiAgICB0aGlzLmJhc3Rpb25PdXRib3VuZEdyb3VwLmFkZEVncmVzc1J1bGUoXG4gICAgICBlYzIuUGVlci5pcHY0KGNvbmZpZy52cGMuY2lkciksXG4gICAgICBlYzIuUG9ydC5hbGxUcmFmZmljKCksXG4gICAgICAnT3V0Ym91bmQgdG8gaW50ZXJuYWwgbmV0d29yaydcbiAgICApO1xuXG4gICAgLy8gTkFUIEdyb3VwIC0gZm9yIE5BVCBpbnN0YW5jZXNcbiAgICB0aGlzLm5hdEdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdOYXRHcm91cCcsIHtcbiAgICAgIHNlY3VyaXR5R3JvdXBOYW1lOiBuYW1pbmdIZWxwZXIuZ2V0U2VjdXJpdHlHcm91cE5hbWUoJ25hdC1ncm91cCcpLFxuICAgICAgdnBjLFxuICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBncm91cCBmb3IgTkFUIGluc3RhbmNlcycsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvLyBBbGxvdyBpbmJvdW5kIGZyb20gaW50ZXJuYWwgbmV0d29ya1xuICAgIHRoaXMubmF0R3JvdXAuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBlYzIuUGVlci5pcHY0KGNvbmZpZy52cGMuY2lkciksXG4gICAgICBlYzIuUG9ydC5hbGxUcmFmZmljKCksXG4gICAgICAnSW5ib3VuZCBmcm9tIGludGVybmFsIG5ldHdvcmsnXG4gICAgKTtcblxuICAgIC8vIERhdGFiYXNlIFNTSCBHcm91cCAtIGZvciBkYXRhYmFzZSBhY2Nlc3MgZnJvbSBCYXN0aW9uXG4gICAgdGhpcy5kYlNzaEdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdEYlNzaEdyb3VwJywge1xuICAgICAgc2VjdXJpdHlHcm91cE5hbWU6IG5hbWluZ0hlbHBlci5nZXRTZWN1cml0eUdyb3VwTmFtZSgnZGItc3NoLWdyb3VwJyksXG4gICAgICB2cGMsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NlY3VyaXR5IGdyb3VwIGZvciBkYXRhYmFzZSBhY2Nlc3MgZnJvbSBCYXN0aW9uIEhvc3QnLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgLy8gQWxsb3cgTXlTUUwgYWNjZXNzIGZyb20gQmFzdGlvblxuICAgIHRoaXMuZGJTc2hHcm91cC5hZGRJbmdyZXNzUnVsZShcbiAgICAgIHRoaXMuYmFzdGlvbk91dGJvdW5kR3JvdXAsXG4gICAgICBlYzIuUG9ydC50Y3AoUE9SVFMuTVlTUUwpLFxuICAgICAgJ015U1FMIGFjY2VzcyBmcm9tIEJhc3Rpb24gSG9zdCdcbiAgICApO1xuXG4gICAgLy8gRGF0YWJhc2UgUHJpdmF0ZSBHcm91cCAtIGZvciBkYXRhYmFzZSBhY2Nlc3MgZnJvbSBMYW1iZGFcbiAgICB0aGlzLmRiUHJpdmF0ZUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdEYlByaXZhdGVHcm91cCcsIHtcbiAgICAgIHNlY3VyaXR5R3JvdXBOYW1lOiBuYW1pbmdIZWxwZXIuZ2V0U2VjdXJpdHlHcm91cE5hbWUoJ2RiLXByaXZhdGUtZ3JvdXAnKSxcbiAgICAgIHZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIGRhdGFiYXNlIGFjY2VzcyBmcm9tIExhbWJkYSBmdW5jdGlvbnMnLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogZmFsc2VcbiAgICB9KTtcblxuICAgIC8vIEFsbG93IE15U1FMIGFjY2VzcyBmcm9tIExhbWJkYVxuICAgIHRoaXMuZGJQcml2YXRlR3JvdXAuYWRkSW5ncmVzc1J1bGUoXG4gICAgICB0aGlzLmxhbWJkYU91dGJvdW5kR3JvdXAsXG4gICAgICBlYzIuUG9ydC50Y3AoUE9SVFMuTVlTUUwpLFxuICAgICAgJ015U1FMIGFjY2VzcyBmcm9tIExhbWJkYSBmdW5jdGlvbnMnXG4gICAgKTtcblxuICAgIC8vIExvY2FsIE91dGJvdW5kIEdyb3VwIC0gZm9yIGludGVybmFsIGNvbW11bmljYXRpb25cbiAgICB0aGlzLmxvY2FsT3V0Ym91bmRHcm91cCA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnTG9jYWxPdXRib3VuZEdyb3VwJywge1xuICAgICAgc2VjdXJpdHlHcm91cE5hbWU6IG5hbWluZ0hlbHBlci5nZXRTZWN1cml0eUdyb3VwTmFtZSgnbG9jYWwtb3V0Ym91bmQtZ3JvdXAnKSxcbiAgICAgIHZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIGludGVybmFsIG5ldHdvcmsgY29tbXVuaWNhdGlvbicsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgLy8gQWxsb3cgb3V0Ym91bmQgdG8gaW50ZXJuYWwgbmV0d29ya1xuICAgIHRoaXMubG9jYWxPdXRib3VuZEdyb3VwLmFkZEVncmVzc1J1bGUoXG4gICAgICBlYzIuUGVlci5pcHY0KGNvbmZpZy52cGMuY2lkciksXG4gICAgICBlYzIuUG9ydC5hbGxUcmFmZmljKCksXG4gICAgICAnT3V0Ym91bmQgdG8gaW50ZXJuYWwgbmV0d29yaydcbiAgICApO1xuXG4gICAgLy8gQXBwbHkgdGFncyB0byBhbGwgcmVzb3VyY2VzXG4gICAgdGFnZ2luZ0hlbHBlci5hcHBseVRhZ3ModGhpcywge1xuICAgICAgU3RhY2tOYW1lOiAnU2VjdXJpdHlHcm91cFN0YWNrJyxcbiAgICAgIFB1cnBvc2U6ICdTZWN1cml0eSBncm91cHMgZm9yIG5ldHdvcmsgYWNjZXNzIGNvbnRyb2wnXG4gICAgfSk7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0xhbWJkYU91dGJvdW5kR3JvdXBJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmxhbWJkYU91dGJvdW5kR3JvdXAuc2VjdXJpdHlHcm91cElkLFxuICAgICAgZGVzY3JpcHRpb246ICdMYW1iZGEgT3V0Ym91bmQgU2VjdXJpdHkgR3JvdXAgSUQnLFxuICAgICAgZXhwb3J0TmFtZTogbmFtaW5nSGVscGVyLmdldExvZ2ljYWxJZCgnTGFtYmRhT3V0Ym91bmRHcm91cElkJylcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdQdWJsaWNTc2hHcm91cElkJywge1xuICAgICAgdmFsdWU6IHRoaXMucHVibGljU3NoR3JvdXAuc2VjdXJpdHlHcm91cElkLFxuICAgICAgZGVzY3JpcHRpb246ICdQdWJsaWMgU1NIIFNlY3VyaXR5IEdyb3VwIElEJyxcbiAgICAgIGV4cG9ydE5hbWU6IG5hbWluZ0hlbHBlci5nZXRMb2dpY2FsSWQoJ1B1YmxpY1NzaEdyb3VwSWQnKVxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Jhc3Rpb25PdXRib3VuZEdyb3VwSWQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5iYXN0aW9uT3V0Ym91bmRHcm91cC5zZWN1cml0eUdyb3VwSWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Jhc3Rpb24gT3V0Ym91bmQgU2VjdXJpdHkgR3JvdXAgSUQnLFxuICAgICAgZXhwb3J0TmFtZTogbmFtaW5nSGVscGVyLmdldExvZ2ljYWxJZCgnQmFzdGlvbk91dGJvdW5kR3JvdXBJZCcpXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTmF0R3JvdXBJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLm5hdEdyb3VwLnNlY3VyaXR5R3JvdXBJZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTkFUIFNlY3VyaXR5IEdyb3VwIElEJyxcbiAgICAgIGV4cG9ydE5hbWU6IG5hbWluZ0hlbHBlci5nZXRMb2dpY2FsSWQoJ05hdEdyb3VwSWQnKVxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0RiU3NoR3JvdXBJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmRiU3NoR3JvdXAuc2VjdXJpdHlHcm91cElkLFxuICAgICAgZGVzY3JpcHRpb246ICdEYXRhYmFzZSBTU0ggU2VjdXJpdHkgR3JvdXAgSUQnLFxuICAgICAgZXhwb3J0TmFtZTogbmFtaW5nSGVscGVyLmdldExvZ2ljYWxJZCgnRGJTc2hHcm91cElkJylcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEYlByaXZhdGVHcm91cElkJywge1xuICAgICAgdmFsdWU6IHRoaXMuZGJQcml2YXRlR3JvdXAuc2VjdXJpdHlHcm91cElkLFxuICAgICAgZGVzY3JpcHRpb246ICdEYXRhYmFzZSBQcml2YXRlIFNlY3VyaXR5IEdyb3VwIElEJyxcbiAgICAgIGV4cG9ydE5hbWU6IG5hbWluZ0hlbHBlci5nZXRMb2dpY2FsSWQoJ0RiUHJpdmF0ZUdyb3VwSWQnKVxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0xvY2FsT3V0Ym91bmRHcm91cElkJywge1xuICAgICAgdmFsdWU6IHRoaXMubG9jYWxPdXRib3VuZEdyb3VwLnNlY3VyaXR5R3JvdXBJZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTG9jYWwgT3V0Ym91bmQgU2VjdXJpdHkgR3JvdXAgSUQnLFxuICAgICAgZXhwb3J0TmFtZTogbmFtaW5nSGVscGVyLmdldExvZ2ljYWxJZCgnTG9jYWxPdXRib3VuZEdyb3VwSWQnKVxuICAgIH0pO1xuICB9XG59Il19