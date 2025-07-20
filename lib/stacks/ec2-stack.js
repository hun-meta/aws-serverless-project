"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ec2Stack = void 0;
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
const iam = require("aws-cdk-lib/aws-iam");
class Ec2Stack extends cdk.Stack {
    constructor(scope, id, props) {
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
        commonUserData.addCommands('#!/bin/bash', 'yum update -y', 'yum install -y amazon-cloudwatch-agent', 'yum install -y awscli', 
        // Install CloudWatch agent
        '/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c default', 
        // Enable SSH password authentication (optional, for emergency access)
        'sed -i "s/PasswordAuthentication no/PasswordAuthentication yes/g" /etc/ssh/sshd_config', 'systemctl restart sshd', 
        // Set timezone
        'timedatectl set-timezone Asia/Seoul');
        if (config.isDev) {
            // Development environment: Single EC2 instance for both NAT and Bastion
            const combinedUserData = ec2.UserData.forLinux();
            combinedUserData.addCommands(...commonUserData.render().split('\n'), 
            // NAT instance configuration
            'echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf', 'sysctl -p', 
            // Configure iptables for NAT
            'yum install -y iptables-services', 'systemctl enable iptables', 'systemctl start iptables', 
            // Set up NAT rules
            '/sbin/iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE', '/sbin/iptables -F FORWARD', '/sbin/iptables -A FORWARD -j ACCEPT', 'service iptables save', 
            // Disable source/destination check (will be done via CDK as well)
            'echo "Configuring NAT instance..."', 
            // Install monitoring tools
            'yum install -y htop iotop netstat-nat');
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
                securityGroup: ec2.SecurityGroup.fromSecurityGroupId(this, 'CombinedSecurityGroup', publicSshSecurityGroup.securityGroupId),
                keyName: config.ec2.keyName,
                role: ec2Role,
                userData: combinedUserData,
                sourceDestCheck: false,
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
        }
        else {
            // Production environment: Separate Bastion Host
            const bastionUserData = ec2.UserData.forLinux();
            bastionUserData.addCommands(...commonUserData.render().split('\n'), 
            // Bastion-specific configuration
            'echo "Configuring Bastion Host..."', 
            // Install additional tools for database access
            'yum install -y mysql telnet nmap-ncat', 
            // Set up SSH agent forwarding
            'echo "AllowAgentForwarding yes" >> /etc/ssh/sshd_config', 'systemctl restart sshd');
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
exports.Ec2Stack = Ec2Stack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWMyLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZWMyLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQywyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBZ0IzQyxNQUFhLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQU1yQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQW9CO1FBQzVELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsc0JBQXNCLEVBQUUsNEJBQTRCLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFFbkksb0NBQW9DO1FBQ3BDLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQzVDLFFBQVEsRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDO1lBQ3hELFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQztZQUN4RCxXQUFXLEVBQUUsMENBQTBDO1lBQ3ZELGVBQWUsRUFBRTtnQkFDZixHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLDhCQUE4QixDQUFDO2dCQUMxRSxHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLDZCQUE2QixDQUFDO2FBQzFFO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsMEJBQTBCO1FBQzFCLE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDMUUsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLGVBQWUsQ0FBQyxzQkFBc0IsQ0FBQztZQUN6RSxJQUFJLEVBQUUsT0FBTztTQUNkLENBQUMsQ0FBQztRQUVILG9DQUFvQztRQUNw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QzlDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQjtnQkFDekMsV0FBVyxFQUFFLHlCQUF5QjtnQkFDdEMsVUFBVSxFQUFFLFlBQVksQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUM7YUFDOUQsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0NBQ0Y7QUE3T0QsNEJBNk9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgRW52aXJvbm1lbnRDb25maWcgfSBmcm9tICcuLi91dGlscy9lbnZpcm9ubWVudCc7XG5pbXBvcnQgeyBOYW1pbmdIZWxwZXIgfSBmcm9tICcuLi91dGlscy9uYW1pbmcnO1xuaW1wb3J0IHsgVGFnZ2luZ0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL3RhZ3MnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVjMlN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIHJlYWRvbmx5IGNvbmZpZzogRW52aXJvbm1lbnRDb25maWc7XG4gIHJlYWRvbmx5IG5hbWluZ0hlbHBlcjogTmFtaW5nSGVscGVyO1xuICByZWFkb25seSB0YWdnaW5nSGVscGVyOiBUYWdnaW5nSGVscGVyO1xuICByZWFkb25seSB2cGM6IGVjMi5JVnBjO1xuICByZWFkb25seSBwdWJsaWNTc2hTZWN1cml0eUdyb3VwOiBlYzIuSVNlY3VyaXR5R3JvdXA7XG4gIHJlYWRvbmx5IGJhc3Rpb25PdXRib3VuZFNlY3VyaXR5R3JvdXA6IGVjMi5JU2VjdXJpdHlHcm91cDtcbiAgcmVhZG9ubHkgbmF0U2VjdXJpdHlHcm91cDogZWMyLklTZWN1cml0eUdyb3VwO1xufVxuXG5leHBvcnQgY2xhc3MgRWMyU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwdWJsaWMgcmVhZG9ubHkgYmFzdGlvbkhvc3Q/OiBlYzIuSW5zdGFuY2U7XG4gIHB1YmxpYyByZWFkb25seSBuYXRJbnN0YW5jZT86IGVjMi5JbnN0YW5jZTtcbiAgcHVibGljIHJlYWRvbmx5IGJhc3Rpb25FbGFzdGljSXA/OiBlYzIuQ2ZuRUlQO1xuICBwdWJsaWMgcmVhZG9ubHkgbmF0RWxhc3RpY0lwPzogZWMyLkNmbkVJUDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogRWMyU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgeyBjb25maWcsIG5hbWluZ0hlbHBlciwgdGFnZ2luZ0hlbHBlciwgdnBjLCBwdWJsaWNTc2hTZWN1cml0eUdyb3VwLCBiYXN0aW9uT3V0Ym91bmRTZWN1cml0eUdyb3VwLCBuYXRTZWN1cml0eUdyb3VwIH0gPSBwcm9wcztcblxuICAgIC8vIENyZWF0ZSBJQU0gcm9sZSBmb3IgRUMyIGluc3RhbmNlc1xuICAgIGNvbnN0IGVjMlJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0VjMlJvbGUnLCB7XG4gICAgICByb2xlTmFtZTogbmFtaW5nSGVscGVyLmdldElhbVJvbGVOYW1lKCdFYzJJbnN0YW5jZVJvbGUnKSxcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlYzIuYW1hem9uYXdzLmNvbScpLFxuICAgICAgZGVzY3JpcHRpb246ICdJQU0gcm9sZSBmb3IgRUMyIGluc3RhbmNlcyAoTkFUL0Jhc3Rpb24pJyxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FtYXpvblNTTU1hbmFnZWRJbnN0YW5jZUNvcmUnKSxcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdDbG91ZFdhdGNoQWdlbnRTZXJ2ZXJQb2xpY3knKVxuICAgICAgXVxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIGluc3RhbmNlIHByb2ZpbGVcbiAgICBjb25zdCBpbnN0YW5jZVByb2ZpbGUgPSBuZXcgaWFtLkluc3RhbmNlUHJvZmlsZSh0aGlzLCAnRWMySW5zdGFuY2VQcm9maWxlJywge1xuICAgICAgaW5zdGFuY2VQcm9maWxlTmFtZTogbmFtaW5nSGVscGVyLmdldFBoeXNpY2FsTmFtZSgnZWMyLWluc3RhbmNlLXByb2ZpbGUnKSxcbiAgICAgIHJvbGU6IGVjMlJvbGVcbiAgICB9KTtcblxuICAgIC8vIEdldCB0aGUgbGF0ZXN0IEFtYXpvbiBMaW51eCAyIEFNSVxuICAgIGNvbnN0IGFtYXpvbkxpbnV4QW1pID0gZWMyLk1hY2hpbmVJbWFnZS5sYXRlc3RBbWF6b25MaW51eDIoKTtcblxuICAgIC8vIFVzZXIgZGF0YSBzY3JpcHQgZm9yIGNvbW1vbiBzZXR1cFxuICAgIGNvbnN0IGNvbW1vblVzZXJEYXRhID0gZWMyLlVzZXJEYXRhLmZvckxpbnV4KCk7XG4gICAgY29tbW9uVXNlckRhdGEuYWRkQ29tbWFuZHMoXG4gICAgICAnIyEvYmluL2Jhc2gnLFxuICAgICAgJ3l1bSB1cGRhdGUgLXknLFxuICAgICAgJ3l1bSBpbnN0YWxsIC15IGFtYXpvbi1jbG91ZHdhdGNoLWFnZW50JyxcbiAgICAgICd5dW0gaW5zdGFsbCAteSBhd3NjbGknLFxuICAgICAgXG4gICAgICAvLyBJbnN0YWxsIENsb3VkV2F0Y2ggYWdlbnRcbiAgICAgICcvb3B0L2F3cy9hbWF6b24tY2xvdWR3YXRjaC1hZ2VudC9iaW4vYW1hem9uLWNsb3Vkd2F0Y2gtYWdlbnQtY3RsIC1hIGZldGNoLWNvbmZpZyAtbSBlYzIgLXMgLWMgZGVmYXVsdCcsXG4gICAgICBcbiAgICAgIC8vIEVuYWJsZSBTU0ggcGFzc3dvcmQgYXV0aGVudGljYXRpb24gKG9wdGlvbmFsLCBmb3IgZW1lcmdlbmN5IGFjY2VzcylcbiAgICAgICdzZWQgLWkgXCJzL1Bhc3N3b3JkQXV0aGVudGljYXRpb24gbm8vUGFzc3dvcmRBdXRoZW50aWNhdGlvbiB5ZXMvZ1wiIC9ldGMvc3NoL3NzaGRfY29uZmlnJyxcbiAgICAgICdzeXN0ZW1jdGwgcmVzdGFydCBzc2hkJyxcbiAgICAgIFxuICAgICAgLy8gU2V0IHRpbWV6b25lXG4gICAgICAndGltZWRhdGVjdGwgc2V0LXRpbWV6b25lIEFzaWEvU2VvdWwnXG4gICAgKTtcblxuICAgIGlmIChjb25maWcuaXNEZXYpIHtcbiAgICAgIC8vIERldmVsb3BtZW50IGVudmlyb25tZW50OiBTaW5nbGUgRUMyIGluc3RhbmNlIGZvciBib3RoIE5BVCBhbmQgQmFzdGlvblxuICAgICAgY29uc3QgY29tYmluZWRVc2VyRGF0YSA9IGVjMi5Vc2VyRGF0YS5mb3JMaW51eCgpO1xuICAgICAgY29tYmluZWRVc2VyRGF0YS5hZGRDb21tYW5kcyhcbiAgICAgICAgLi4uY29tbW9uVXNlckRhdGEucmVuZGVyKCkuc3BsaXQoJ1xcbicpLFxuICAgICAgICBcbiAgICAgICAgLy8gTkFUIGluc3RhbmNlIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgJ2VjaG8gXCJuZXQuaXB2NC5pcF9mb3J3YXJkID0gMVwiID4+IC9ldGMvc3lzY3RsLmNvbmYnLFxuICAgICAgICAnc3lzY3RsIC1wJyxcbiAgICAgICAgXG4gICAgICAgIC8vIENvbmZpZ3VyZSBpcHRhYmxlcyBmb3IgTkFUXG4gICAgICAgICd5dW0gaW5zdGFsbCAteSBpcHRhYmxlcy1zZXJ2aWNlcycsXG4gICAgICAgICdzeXN0ZW1jdGwgZW5hYmxlIGlwdGFibGVzJyxcbiAgICAgICAgJ3N5c3RlbWN0bCBzdGFydCBpcHRhYmxlcycsXG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgdXAgTkFUIHJ1bGVzXG4gICAgICAgICcvc2Jpbi9pcHRhYmxlcyAtdCBuYXQgLUEgUE9TVFJPVVRJTkcgLW8gZXRoMCAtaiBNQVNRVUVSQURFJyxcbiAgICAgICAgJy9zYmluL2lwdGFibGVzIC1GIEZPUldBUkQnLFxuICAgICAgICAnL3NiaW4vaXB0YWJsZXMgLUEgRk9SV0FSRCAtaiBBQ0NFUFQnLFxuICAgICAgICAnc2VydmljZSBpcHRhYmxlcyBzYXZlJyxcbiAgICAgICAgXG4gICAgICAgIC8vIERpc2FibGUgc291cmNlL2Rlc3RpbmF0aW9uIGNoZWNrICh3aWxsIGJlIGRvbmUgdmlhIENESyBhcyB3ZWxsKVxuICAgICAgICAnZWNobyBcIkNvbmZpZ3VyaW5nIE5BVCBpbnN0YW5jZS4uLlwiJyxcbiAgICAgICAgXG4gICAgICAgIC8vIEluc3RhbGwgbW9uaXRvcmluZyB0b29sc1xuICAgICAgICAneXVtIGluc3RhbGwgLXkgaHRvcCBpb3RvcCBuZXRzdGF0LW5hdCdcbiAgICAgICk7XG5cbiAgICAgIC8vIENyZWF0ZSBFbGFzdGljIElQIGZvciBjb21iaW5lZCBOQVQvQmFzdGlvbiBpbnN0YW5jZVxuICAgICAgdGhpcy5uYXRFbGFzdGljSXAgPSBuZXcgZWMyLkNmbkVJUCh0aGlzLCAnTmF0QmFzdGlvbkVsYXN0aWNJcCcsIHtcbiAgICAgICAgZG9tYWluOiAndnBjJyxcbiAgICAgICAgdGFnczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGtleTogJ05hbWUnLFxuICAgICAgICAgICAgdmFsdWU6IG5hbWluZ0hlbHBlci5nZXRFbGFzdGljSXBOYW1lKCduYXQtYmFzdGlvbicpXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcblxuICAgICAgLy8gQ3JlYXRlIGNvbWJpbmVkIE5BVC9CYXN0aW9uIGluc3RhbmNlXG4gICAgICB0aGlzLm5hdEluc3RhbmNlID0gbmV3IGVjMi5JbnN0YW5jZSh0aGlzLCAnTmF0QmFzdGlvbkluc3RhbmNlJywge1xuICAgICAgICBpbnN0YW5jZU5hbWU6IG5hbWluZ0hlbHBlci5nZXRQaHlzaWNhbE5hbWUoJ25hdC1iYXN0aW9uLWluc3RhbmNlJyksXG4gICAgICAgIGluc3RhbmNlVHlwZTogbmV3IGVjMi5JbnN0YW5jZVR5cGUoY29uZmlnLmVjMi5pbnN0YW5jZVR5cGUpLFxuICAgICAgICBtYWNoaW5lSW1hZ2U6IGFtYXpvbkxpbnV4QW1pLFxuICAgICAgICB2cGMsXG4gICAgICAgIHZwY1N1Ym5ldHM6IHtcbiAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUNcbiAgICAgICAgfSxcbiAgICAgICAgc2VjdXJpdHlHcm91cDogZWMyLlNlY3VyaXR5R3JvdXAuZnJvbVNlY3VyaXR5R3JvdXBJZChcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgICdDb21iaW5lZFNlY3VyaXR5R3JvdXAnLFxuICAgICAgICAgIHB1YmxpY1NzaFNlY3VyaXR5R3JvdXAuc2VjdXJpdHlHcm91cElkXG4gICAgICAgICksXG4gICAgICAgIGtleU5hbWU6IGNvbmZpZy5lYzIua2V5TmFtZSxcbiAgICAgICAgcm9sZTogZWMyUm9sZSxcbiAgICAgICAgdXNlckRhdGE6IGNvbWJpbmVkVXNlckRhdGEsXG4gICAgICAgIHNvdXJjZURlc3RDaGVjazogZmFsc2UsIC8vIEltcG9ydGFudCBmb3IgTkFUIGZ1bmN0aW9uYWxpdHlcbiAgICAgICAgYmxvY2tEZXZpY2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZGV2aWNlTmFtZTogJy9kZXYveHZkYScsXG4gICAgICAgICAgICB2b2x1bWU6IGVjMi5CbG9ja0RldmljZVZvbHVtZS5lYnMoMjAsIHtcbiAgICAgICAgICAgICAgdm9sdW1lVHlwZTogZWMyLkVic0RldmljZVZvbHVtZVR5cGUuR1AzLFxuICAgICAgICAgICAgICBlbmNyeXB0ZWQ6IHRydWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcblxuICAgICAgLy8gQXNzb2NpYXRlIEVsYXN0aWMgSVAgd2l0aCB0aGUgaW5zdGFuY2VcbiAgICAgIG5ldyBlYzIuQ2ZuRUlQQXNzb2NpYXRpb24odGhpcywgJ05hdEJhc3Rpb25FaXBBc3NvY2lhdGlvbicsIHtcbiAgICAgICAgZWlwOiB0aGlzLm5hdEVsYXN0aWNJcC5yZWYsXG4gICAgICAgIGluc3RhbmNlSWQ6IHRoaXMubmF0SW5zdGFuY2UuaW5zdGFuY2VJZFxuICAgICAgfSk7XG5cbiAgICAgIC8vIEFkZCBhZGRpdGlvbmFsIHNlY3VyaXR5IGdyb3Vwc1xuICAgICAgdGhpcy5uYXRJbnN0YW5jZS5hZGRTZWN1cml0eUdyb3VwKGJhc3Rpb25PdXRib3VuZFNlY3VyaXR5R3JvdXApO1xuICAgICAgdGhpcy5uYXRJbnN0YW5jZS5hZGRTZWN1cml0eUdyb3VwKG5hdFNlY3VyaXR5R3JvdXApO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFByb2R1Y3Rpb24gZW52aXJvbm1lbnQ6IFNlcGFyYXRlIEJhc3Rpb24gSG9zdFxuICAgICAgY29uc3QgYmFzdGlvblVzZXJEYXRhID0gZWMyLlVzZXJEYXRhLmZvckxpbnV4KCk7XG4gICAgICBiYXN0aW9uVXNlckRhdGEuYWRkQ29tbWFuZHMoXG4gICAgICAgIC4uLmNvbW1vblVzZXJEYXRhLnJlbmRlcigpLnNwbGl0KCdcXG4nKSxcbiAgICAgICAgXG4gICAgICAgIC8vIEJhc3Rpb24tc3BlY2lmaWMgY29uZmlndXJhdGlvblxuICAgICAgICAnZWNobyBcIkNvbmZpZ3VyaW5nIEJhc3Rpb24gSG9zdC4uLlwiJyxcbiAgICAgICAgXG4gICAgICAgIC8vIEluc3RhbGwgYWRkaXRpb25hbCB0b29scyBmb3IgZGF0YWJhc2UgYWNjZXNzXG4gICAgICAgICd5dW0gaW5zdGFsbCAteSBteXNxbCB0ZWxuZXQgbm1hcC1uY2F0JyxcbiAgICAgICAgXG4gICAgICAgIC8vIFNldCB1cCBTU0ggYWdlbnQgZm9yd2FyZGluZ1xuICAgICAgICAnZWNobyBcIkFsbG93QWdlbnRGb3J3YXJkaW5nIHllc1wiID4+IC9ldGMvc3NoL3NzaGRfY29uZmlnJyxcbiAgICAgICAgJ3N5c3RlbWN0bCByZXN0YXJ0IHNzaGQnXG4gICAgICApO1xuXG4gICAgICAvLyBDcmVhdGUgRWxhc3RpYyBJUCBmb3IgQmFzdGlvbiBIb3N0XG4gICAgICB0aGlzLmJhc3Rpb25FbGFzdGljSXAgPSBuZXcgZWMyLkNmbkVJUCh0aGlzLCAnQmFzdGlvbkVsYXN0aWNJcCcsIHtcbiAgICAgICAgZG9tYWluOiAndnBjJyxcbiAgICAgICAgdGFnczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGtleTogJ05hbWUnLFxuICAgICAgICAgICAgdmFsdWU6IG5hbWluZ0hlbHBlci5nZXRFbGFzdGljSXBOYW1lKCdiYXN0aW9uJylcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBDcmVhdGUgQmFzdGlvbiBIb3N0IGluc3RhbmNlXG4gICAgICB0aGlzLmJhc3Rpb25Ib3N0ID0gbmV3IGVjMi5JbnN0YW5jZSh0aGlzLCAnQmFzdGlvbkhvc3QnLCB7XG4gICAgICAgIGluc3RhbmNlTmFtZTogbmFtaW5nSGVscGVyLmdldFBoeXNpY2FsTmFtZSgnYmFzdGlvbi1ob3N0JyksXG4gICAgICAgIGluc3RhbmNlVHlwZTogbmV3IGVjMi5JbnN0YW5jZVR5cGUoY29uZmlnLmVjMi5pbnN0YW5jZVR5cGUpLFxuICAgICAgICBtYWNoaW5lSW1hZ2U6IGFtYXpvbkxpbnV4QW1pLFxuICAgICAgICB2cGMsXG4gICAgICAgIHZwY1N1Ym5ldHM6IHtcbiAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUNcbiAgICAgICAgfSxcbiAgICAgICAgc2VjdXJpdHlHcm91cDogcHVibGljU3NoU2VjdXJpdHlHcm91cCxcbiAgICAgICAga2V5TmFtZTogY29uZmlnLmVjMi5rZXlOYW1lLFxuICAgICAgICByb2xlOiBlYzJSb2xlLFxuICAgICAgICB1c2VyRGF0YTogYmFzdGlvblVzZXJEYXRhLFxuICAgICAgICBibG9ja0RldmljZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBkZXZpY2VOYW1lOiAnL2Rldi94dmRhJyxcbiAgICAgICAgICAgIHZvbHVtZTogZWMyLkJsb2NrRGV2aWNlVm9sdW1lLmVicygxMCwge1xuICAgICAgICAgICAgICB2b2x1bWVUeXBlOiBlYzIuRWJzRGV2aWNlVm9sdW1lVHlwZS5HUDMsXG4gICAgICAgICAgICAgIGVuY3J5cHRlZDogdHJ1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBBc3NvY2lhdGUgRWxhc3RpYyBJUCB3aXRoIEJhc3Rpb24gSG9zdFxuICAgICAgbmV3IGVjMi5DZm5FSVBBc3NvY2lhdGlvbih0aGlzLCAnQmFzdGlvbkVpcEFzc29jaWF0aW9uJywge1xuICAgICAgICBlaXA6IHRoaXMuYmFzdGlvbkVsYXN0aWNJcC5yZWYsXG4gICAgICAgIGluc3RhbmNlSWQ6IHRoaXMuYmFzdGlvbkhvc3QuaW5zdGFuY2VJZFxuICAgICAgfSk7XG5cbiAgICAgIC8vIEFkZCBiYXN0aW9uIG91dGJvdW5kIHNlY3VyaXR5IGdyb3VwXG4gICAgICB0aGlzLmJhc3Rpb25Ib3N0LmFkZFNlY3VyaXR5R3JvdXAoYmFzdGlvbk91dGJvdW5kU2VjdXJpdHlHcm91cCk7XG4gICAgfVxuXG4gICAgLy8gQXBwbHkgdGFncyB0byBhbGwgcmVzb3VyY2VzXG4gICAgdGFnZ2luZ0hlbHBlci5hcHBseVRhZ3ModGhpcywge1xuICAgICAgU3RhY2tOYW1lOiAnRWMyU3RhY2snLFxuICAgICAgUHVycG9zZTogJ0VDMiBpbnN0YW5jZXMgZm9yIE5BVCBhbmQgQmFzdGlvbiBIb3N0IGZ1bmN0aW9uYWxpdHknXG4gICAgfSk7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgaWYgKGNvbmZpZy5pc0RldiAmJiB0aGlzLm5hdEluc3RhbmNlICYmIHRoaXMubmF0RWxhc3RpY0lwKSB7XG4gICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTmF0QmFzdGlvbkluc3RhbmNlSWQnLCB7XG4gICAgICAgIHZhbHVlOiB0aGlzLm5hdEluc3RhbmNlLmluc3RhbmNlSWQsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTkFUL0Jhc3Rpb24gSW5zdGFuY2UgSUQnLFxuICAgICAgICBleHBvcnROYW1lOiBuYW1pbmdIZWxwZXIuZ2V0TG9naWNhbElkKCdOYXRCYXN0aW9uSW5zdGFuY2VJZCcpXG4gICAgICB9KTtcblxuICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ05hdEJhc3Rpb25QdWJsaWNJcCcsIHtcbiAgICAgICAgdmFsdWU6IHRoaXMubmF0RWxhc3RpY0lwLnJlZixcbiAgICAgICAgZGVzY3JpcHRpb246ICdOQVQvQmFzdGlvbiBQdWJsaWMgSVAnLFxuICAgICAgICBleHBvcnROYW1lOiBuYW1pbmdIZWxwZXIuZ2V0TG9naWNhbElkKCdOYXRCYXN0aW9uUHVibGljSXAnKVxuICAgICAgfSk7XG5cbiAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdOYXRCYXN0aW9uUHJpdmF0ZUlwJywge1xuICAgICAgICB2YWx1ZTogdGhpcy5uYXRJbnN0YW5jZS5pbnN0YW5jZVByaXZhdGVJcCxcbiAgICAgICAgZGVzY3JpcHRpb246ICdOQVQvQmFzdGlvbiBQcml2YXRlIElQJyxcbiAgICAgICAgZXhwb3J0TmFtZTogbmFtaW5nSGVscGVyLmdldExvZ2ljYWxJZCgnTmF0QmFzdGlvblByaXZhdGVJcCcpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmlzUHJvZCAmJiB0aGlzLmJhc3Rpb25Ib3N0ICYmIHRoaXMuYmFzdGlvbkVsYXN0aWNJcCkge1xuICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Jhc3Rpb25Ib3N0SW5zdGFuY2VJZCcsIHtcbiAgICAgICAgdmFsdWU6IHRoaXMuYmFzdGlvbkhvc3QuaW5zdGFuY2VJZCxcbiAgICAgICAgZGVzY3JpcHRpb246ICdCYXN0aW9uIEhvc3QgSW5zdGFuY2UgSUQnLFxuICAgICAgICBleHBvcnROYW1lOiBuYW1pbmdIZWxwZXIuZ2V0TG9naWNhbElkKCdCYXN0aW9uSG9zdEluc3RhbmNlSWQnKVxuICAgICAgfSk7XG5cbiAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdCYXN0aW9uSG9zdFB1YmxpY0lwJywge1xuICAgICAgICB2YWx1ZTogdGhpcy5iYXN0aW9uRWxhc3RpY0lwLnJlZixcbiAgICAgICAgZGVzY3JpcHRpb246ICdCYXN0aW9uIEhvc3QgUHVibGljIElQJyxcbiAgICAgICAgZXhwb3J0TmFtZTogbmFtaW5nSGVscGVyLmdldExvZ2ljYWxJZCgnQmFzdGlvbkhvc3RQdWJsaWNJcCcpXG4gICAgICB9KTtcblxuICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Jhc3Rpb25Ib3N0UHJpdmF0ZUlwJywge1xuICAgICAgICB2YWx1ZTogdGhpcy5iYXN0aW9uSG9zdC5pbnN0YW5jZVByaXZhdGVJcCxcbiAgICAgICAgZGVzY3JpcHRpb246ICdCYXN0aW9uIEhvc3QgUHJpdmF0ZSBJUCcsXG4gICAgICAgIGV4cG9ydE5hbWU6IG5hbWluZ0hlbHBlci5nZXRMb2dpY2FsSWQoJ0Jhc3Rpb25Ib3N0UHJpdmF0ZUlwJylcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufSJdfQ==