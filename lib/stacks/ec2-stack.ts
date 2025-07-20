import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';

export interface Ec2StackProps extends cdk.StackProps {
  readonly config: EnvironmentConfig;
  readonly namingHelper: NamingHelper;
  readonly taggingHelper: TaggingHelper;
  readonly vpc: ec2.IVpc;
  readonly publicSshSecurityGroup: ec2.ISecurityGroup;
  readonly bastionOutboundSecurityGroup: ec2.ISecurityGroup;
  readonly natSecurityGroup: ec2.ISecurityGroup;
}

export class Ec2Stack extends cdk.Stack {
  public readonly bastionHost?: ec2.Instance;
  public readonly natInstance?: ec2.Instance;
  public readonly bastionElasticIp?: ec2.CfnEIP;
  public readonly natElasticIp?: ec2.CfnEIP;

  constructor(scope: Construct, id: string, props: Ec2StackProps) {
    super(scope, id, props);

    const { config, namingHelper, taggingHelper, vpc, publicSshSecurityGroup, bastionOutboundSecurityGroup, natSecurityGroup } = props;

    // Create IAM role for EC2 instances
    const ec2Role = new iam.Role(this, 'Ec2Role', {
      roleName: namingHelper.getIamRoleName('Ec2InstanceRole'),
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'IAM role for EC2 instances (NAT/Bastion)',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy')
      ]
    });

    // Create instance profile
    const instanceProfile = new iam.InstanceProfile(this, 'Ec2InstanceProfile', {
      instanceProfileName: namingHelper.getPhysicalName('ec2-instance-profile'),
      role: ec2Role
    });

    // Get the latest Amazon Linux 2 AMI
    const amazonLinuxAmi = ec2.MachineImage.latestAmazonLinux2();

    // User data script for common setup
    const commonUserData = ec2.UserData.forLinux();
    commonUserData.addCommands(
      '#!/bin/bash',
      'yum update -y',
      'yum install -y amazon-cloudwatch-agent',
      'yum install -y awscli',
      
      // Install CloudWatch agent
      '/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c default',
      
      // Enable SSH password authentication (optional, for emergency access)
      'sed -i "s/PasswordAuthentication no/PasswordAuthentication yes/g" /etc/ssh/sshd_config',
      'systemctl restart sshd',
      
      // Set timezone
      'timedatectl set-timezone Asia/Seoul'
    );

    if (config.isDev) {
      // Development environment: Single EC2 instance for both NAT and Bastion
      const combinedUserData = ec2.UserData.forLinux();
      combinedUserData.addCommands(
        ...commonUserData.render().split('\n'),
        
        // NAT instance configuration
        'echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf',
        'sysctl -p',
        
        // Configure iptables for NAT
        'yum install -y iptables-services',
        'systemctl enable iptables',
        'systemctl start iptables',
        
        // Set up NAT rules
        '/sbin/iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE',
        '/sbin/iptables -F FORWARD',
        '/sbin/iptables -A FORWARD -j ACCEPT',
        'service iptables save',
        
        // Disable source/destination check (will be done via CDK as well)
        'echo "Configuring NAT instance..."',
        
        // Install monitoring tools
        'yum install -y htop iotop netstat-nat'
      );

      // Create Elastic IP for combined NAT/Bastion instance
      this.natElasticIp = new ec2.CfnEIP(this, 'NatBastionElasticIp', {
        domain: 'vpc',
        tags: [
          {
            key: 'Name',
            value: namingHelper.getElasticIpName('nat-bastion')
          }
        ]
      });

      // Create combined NAT/Bastion instance
      this.natInstance = new ec2.Instance(this, 'NatBastionInstance', {
        instanceName: namingHelper.getPhysicalName('nat-bastion-instance'),
        instanceType: new ec2.InstanceType(config.ec2.instanceType),
        machineImage: amazonLinuxAmi,
        vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC
        },
        securityGroup: ec2.SecurityGroup.fromSecurityGroupId(
          this,
          'CombinedSecurityGroup',
          publicSshSecurityGroup.securityGroupId
        ),
        keyName: config.ec2.keyName,
        role: ec2Role,
        userData: combinedUserData,
        sourceDestCheck: false, // Important for NAT functionality
        blockDevices: [
          {
            deviceName: '/dev/xvda',
            volume: ec2.BlockDeviceVolume.ebs(20, {
              volumeType: ec2.EbsDeviceVolumeType.GP3,
              encrypted: true
            })
          }
        ]
      });

      // Associate Elastic IP with the instance
      new ec2.CfnEIPAssociation(this, 'NatBastionEipAssociation', {
        eip: this.natElasticIp.ref,
        instanceId: this.natInstance.instanceId
      });

      // Add additional security groups
      this.natInstance.addSecurityGroup(bastionOutboundSecurityGroup);
      this.natInstance.addSecurityGroup(natSecurityGroup);

    } else {
      // Production environment: Separate Bastion Host
      const bastionUserData = ec2.UserData.forLinux();
      bastionUserData.addCommands(
        ...commonUserData.render().split('\n'),
        
        // Bastion-specific configuration
        'echo "Configuring Bastion Host..."',
        
        // Install additional tools for database access
        'yum install -y mysql telnet nmap-ncat',
        
        // Set up SSH agent forwarding
        'echo "AllowAgentForwarding yes" >> /etc/ssh/sshd_config',
        'systemctl restart sshd'
      );

      // Create Elastic IP for Bastion Host
      this.bastionElasticIp = new ec2.CfnEIP(this, 'BastionElasticIp', {
        domain: 'vpc',
        tags: [
          {
            key: 'Name',
            value: namingHelper.getElasticIpName('bastion')
          }
        ]
      });

      // Create Bastion Host instance
      this.bastionHost = new ec2.Instance(this, 'BastionHost', {
        instanceName: namingHelper.getPhysicalName('bastion-host'),
        instanceType: new ec2.InstanceType(config.ec2.instanceType),
        machineImage: amazonLinuxAmi,
        vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC
        },
        securityGroup: publicSshSecurityGroup,
        keyName: config.ec2.keyName,
        role: ec2Role,
        userData: bastionUserData,
        blockDevices: [
          {
            deviceName: '/dev/xvda',
            volume: ec2.BlockDeviceVolume.ebs(10, {
              volumeType: ec2.EbsDeviceVolumeType.GP3,
              encrypted: true
            })
          }
        ]
      });

      // Associate Elastic IP with Bastion Host
      new ec2.CfnEIPAssociation(this, 'BastionEipAssociation', {
        eip: this.bastionElasticIp.ref,
        instanceId: this.bastionHost.instanceId
      });

      // Add bastion outbound security group
      this.bastionHost.addSecurityGroup(bastionOutboundSecurityGroup);
    }

    // Apply tags to all resources
    taggingHelper.applyTags(this, {
      StackName: 'Ec2Stack',
      Purpose: 'EC2 instances for NAT and Bastion Host functionality'
    });

    // Outputs
    if (config.isDev && this.natInstance && this.natElasticIp) {
      new cdk.CfnOutput(this, 'NatBastionInstanceId', {
        value: this.natInstance.instanceId,
        description: 'NAT/Bastion Instance ID',
        exportName: namingHelper.getLogicalId('NatBastionInstanceId')
      });

      new cdk.CfnOutput(this, 'NatBastionPublicIp', {
        value: this.natElasticIp.ref,
        description: 'NAT/Bastion Public IP',
        exportName: namingHelper.getLogicalId('NatBastionPublicIp')
      });

      new cdk.CfnOutput(this, 'NatBastionPrivateIp', {
        value: this.natInstance.instancePrivateIp,
        description: 'NAT/Bastion Private IP',
        exportName: namingHelper.getLogicalId('NatBastionPrivateIp')
      });
    }

    if (config.isProd && this.bastionHost && this.bastionElasticIp) {
      new cdk.CfnOutput(this, 'BastionHostInstanceId', {
        value: this.bastionHost.instanceId,
        description: 'Bastion Host Instance ID',
        exportName: namingHelper.getLogicalId('BastionHostInstanceId')
      });

      new cdk.CfnOutput(this, 'BastionHostPublicIp', {
        value: this.bastionElasticIp.ref,
        description: 'Bastion Host Public IP',
        exportName: namingHelper.getLogicalId('BastionHostPublicIp')
      });

      new cdk.CfnOutput(this, 'BastionHostPrivateIp', {
        value: this.bastionHost.instancePrivateIp,
        description: 'Bastion Host Private IP',
        exportName: namingHelper.getLogicalId('BastionHostPrivateIp')
      });
    }
  }
}