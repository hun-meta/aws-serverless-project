import { PROJECT_PREFIX } from './constants';

export class NamingHelper {
  private readonly stage: string;
  private readonly prefix: string;

  constructor(stage: string) {
    this.stage = stage;
    this.prefix = stage === 'prod' ? 'Prod' : 'Dev';
  }

  getResourceName(resource: string): string {
    return `${this.prefix}${resource}`;
  }

  getStackName(stackName: string): string {
    return `${PROJECT_PREFIX}${this.prefix}${stackName}`;
  }

  getLogicalId(resource: string): string {
    return `${this.prefix}${resource}`;
  }

  getPhysicalName(resource: string): string {
    return `${this.stage}-${resource.toLowerCase()}`;
  }

  getSecurityGroupName(sgName: string): string {
    return `${this.stage}-${sgName.toLowerCase()}`;
  }

  getKeyPairName(): string {
    return `${this.stage}-ec2-key`;
  }

  getDatabaseName(dbName: string = 'main'): string {
    return `${this.stage}-${dbName}-db`;
  }

  getLambdaFunctionName(functionName: string): string {
    return `${this.stage}-${functionName}-function`;
  }

  getS3BucketName(bucketName: string): string {
    return `${this.stage}-${bucketName}-bucket`;
  }

  getApiGatewayName(): string {
    return `${this.stage}-api-gateway`;
  }

  getVpcName(): string {
    return `${this.stage}-vpc`;
  }

  getSubnetName(subnetType: string, az: string): string {
    return `${this.stage}-${subnetType.toLowerCase()}-subnet-${az}`;
  }

  getRouteTableName(type: string): string {
    return `${this.stage}-${type.toLowerCase()}-rt`;
  }

  getInternetGatewayName(): string {
    return `${this.stage}-igw`;
  }

  getNatGatewayName(az: string): string {
    return `${this.stage}-nat-gw-${az}`;
  }

  getElasticIpName(purpose: string): string {
    return `${this.stage}-eip-${purpose}`;
  }

  getIamRoleName(roleName: string): string {
    return `${this.prefix}${roleName}`;
  }

  getIamPolicyName(policyName: string): string {
    return `${this.prefix}${policyName}`;
  }
}