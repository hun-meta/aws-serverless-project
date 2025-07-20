import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';
import { PORTS } from '../utils/constants';

export interface SecurityGroupStackProps extends cdk.StackProps {
  readonly config: EnvironmentConfig;
  readonly namingHelper: NamingHelper;
  readonly taggingHelper: TaggingHelper;
  readonly vpc: ec2.IVpc;
}

export class SecurityGroupStack extends cdk.Stack {
  public readonly lambdaOutboundGroup: ec2.SecurityGroup;
  public readonly publicSshGroup: ec2.SecurityGroup;
  public readonly bastionOutboundGroup: ec2.SecurityGroup;
  public readonly natGroup: ec2.SecurityGroup;
  public readonly dbSshGroup: ec2.SecurityGroup;
  public readonly dbPrivateGroup: ec2.SecurityGroup;
  public readonly localOutboundGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: SecurityGroupStackProps) {
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
    this.publicSshGroup.addIngressRule(
      ec2.Peer.ipv4('0.0.0.0/0'), // Replace with specific IP range for security
      ec2.Port.tcp(PORTS.SSH),
      'SSH access from specific IP addresses'
    );

    // Add SSH access from internal network
    this.publicSshGroup.addIngressRule(
      ec2.Peer.ipv4(config.vpc.cidr),
      ec2.Port.tcp(PORTS.SSH),
      'SSH access from internal network'
    );

    // Bastion Host Outbound Group
    this.bastionOutboundGroup = new ec2.SecurityGroup(this, 'BastionOutboundGroup', {
      securityGroupName: namingHelper.getSecurityGroupName('bastion-outbound-group'),
      vpc,
      description: 'Security group for Bastion Host - outbound to internal network',
      allowAllOutbound: false
    });

    // Allow outbound to internal network
    this.bastionOutboundGroup.addEgressRule(
      ec2.Peer.ipv4(config.vpc.cidr),
      ec2.Port.allTraffic(),
      'Outbound to internal network'
    );

    // NAT Group - for NAT instances
    this.natGroup = new ec2.SecurityGroup(this, 'NatGroup', {
      securityGroupName: namingHelper.getSecurityGroupName('nat-group'),
      vpc,
      description: 'Security group for NAT instances',
      allowAllOutbound: true
    });

    // Allow inbound from internal network
    this.natGroup.addIngressRule(
      ec2.Peer.ipv4(config.vpc.cidr),
      ec2.Port.allTraffic(),
      'Inbound from internal network'
    );

    // Database SSH Group - for database access from Bastion
    this.dbSshGroup = new ec2.SecurityGroup(this, 'DbSshGroup', {
      securityGroupName: namingHelper.getSecurityGroupName('db-ssh-group'),
      vpc,
      description: 'Security group for database access from Bastion Host',
      allowAllOutbound: true
    });

    // Allow MySQL access from Bastion
    this.dbSshGroup.addIngressRule(
      this.bastionOutboundGroup,
      ec2.Port.tcp(PORTS.MYSQL),
      'MySQL access from Bastion Host'
    );

    // Database Private Group - for database access from Lambda
    this.dbPrivateGroup = new ec2.SecurityGroup(this, 'DbPrivateGroup', {
      securityGroupName: namingHelper.getSecurityGroupName('db-private-group'),
      vpc,
      description: 'Security group for database access from Lambda functions',
      allowAllOutbound: false
    });

    // Allow MySQL access from Lambda
    this.dbPrivateGroup.addIngressRule(
      this.lambdaOutboundGroup,
      ec2.Port.tcp(PORTS.MYSQL),
      'MySQL access from Lambda functions'
    );

    // Local Outbound Group - for internal communication
    this.localOutboundGroup = new ec2.SecurityGroup(this, 'LocalOutboundGroup', {
      securityGroupName: namingHelper.getSecurityGroupName('local-outbound-group'),
      vpc,
      description: 'Security group for internal network communication',
      allowAllOutbound: false
    });

    // Allow outbound to internal network
    this.localOutboundGroup.addEgressRule(
      ec2.Peer.ipv4(config.vpc.cidr),
      ec2.Port.allTraffic(),
      'Outbound to internal network'
    );

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