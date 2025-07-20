import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';

export interface VpcStackProps extends cdk.StackProps {
  readonly config: EnvironmentConfig;
  readonly namingHelper: NamingHelper;
  readonly taggingHelper: TaggingHelper;
}

export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly publicSubnets: ec2.ISubnet[];
  public readonly privateSubnets: ec2.ISubnet[];
  public readonly databaseSubnets: ec2.ISubnet[];

  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    const { config, namingHelper, taggingHelper } = props;

    // Create VPC
    this.vpc = new ec2.Vpc(this, 'Vpc', {
      vpcName: namingHelper.getVpcName(),
      ipAddresses: ec2.IpAddresses.cidr(config.vpc.cidr),
      maxAzs: config.vpc.maxAzs,
      natGateways: config.vpc.natGateways,
      natGatewayProvider: config.vpc.natGateways > 0 
        ? ec2.NatProvider.gateway()
        : ec2.NatProvider.instance({
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: ec2.MachineImage.latestAmazonLinux2(),
            keyName: namingHelper.getKeyPairName()
          }),
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
          mapPublicIpOnLaunch: true
        },
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24
        },
        {
          name: 'Database',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24
        }
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true
    });

    // Get subnet references
    this.publicSubnets = this.vpc.publicSubnets;
    this.privateSubnets = this.vpc.privateSubnets;
    this.databaseSubnets = this.vpc.isolatedSubnets;

    // Tag subnets with custom names
    this.publicSubnets.forEach((subnet, index) => {
      const az = subnet.availabilityZone.slice(-1);
      cdk.Tags.of(subnet).add('Name', namingHelper.getSubnetName('Public', az));
    });

    this.privateSubnets.forEach((subnet, index) => {
      const az = subnet.availabilityZone.slice(-1);
      cdk.Tags.of(subnet).add('Name', namingHelper.getSubnetName('Private', az));
    });

    this.databaseSubnets.forEach((subnet, index) => {
      const az = subnet.availabilityZone.slice(-1);
      cdk.Tags.of(subnet).add('Name', namingHelper.getSubnetName('Database', az));
    });

    // Create VPC Flow Logs (optional for monitoring)
    if (config.isProd) {
      new ec2.FlowLog(this, 'VpcFlowLog', {
        resourceType: ec2.FlowLogResourceType.fromVpc(this.vpc),
        destination: ec2.FlowLogDestination.toCloudWatchLogs(),
        trafficType: ec2.FlowLogTrafficType.REJECT
      });
    }

    // Apply tags to all resources
    taggingHelper.applyTags(this, {
      StackName: 'VpcStack',
      Purpose: 'Network infrastructure with public, private, and database subnets'
    });

    // Outputs
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: namingHelper.getLogicalId('VpcId')
    });

    new cdk.CfnOutput(this, 'VpcCidr', {
      value: this.vpc.vpcCidrBlock,
      description: 'VPC CIDR Block',
      exportName: namingHelper.getLogicalId('VpcCidr')
    });

    new cdk.CfnOutput(this, 'PublicSubnetIds', {
      value: cdk.Fn.join(',', this.publicSubnets.map(subnet => subnet.subnetId)),
      description: 'Public Subnet IDs',
      exportName: namingHelper.getLogicalId('PublicSubnetIds')
    });

    new cdk.CfnOutput(this, 'PrivateSubnetIds', {
      value: cdk.Fn.join(',', this.privateSubnets.map(subnet => subnet.subnetId)),
      description: 'Private Subnet IDs',
      exportName: namingHelper.getLogicalId('PrivateSubnetIds')
    });

    new cdk.CfnOutput(this, 'DatabaseSubnetIds', {
      value: cdk.Fn.join(',', this.databaseSubnets.map(subnet => subnet.subnetId)),
      description: 'Database Subnet IDs',
      exportName: namingHelper.getLogicalId('DatabaseSubnetIds')
    });
  }
}