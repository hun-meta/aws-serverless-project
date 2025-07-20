export declare class NamingHelper {
    private readonly stage;
    private readonly prefix;
    constructor(stage: string);
    getResourceName(resource: string): string;
    getStackName(stackName: string): string;
    getLogicalId(resource: string): string;
    getPhysicalName(resource: string): string;
    getSecurityGroupName(sgName: string): string;
    getKeyPairName(): string;
    getDatabaseName(dbName?: string): string;
    getLambdaFunctionName(functionName: string): string;
    getS3BucketName(bucketName: string): string;
    getApiGatewayName(): string;
    getVpcName(): string;
    getSubnetName(subnetType: string, az: string): string;
    getRouteTableName(type: string): string;
    getInternetGatewayName(): string;
    getNatGatewayName(az: string): string;
    getElasticIpName(purpose: string): string;
    getIamRoleName(roleName: string): string;
    getIamPolicyName(policyName: string): string;
}
