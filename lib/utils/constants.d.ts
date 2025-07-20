export declare const PROJECT_NAME = "cdk-prj";
export declare const PROJECT_PREFIX = "CdkPrj";
export declare const STACK_NAMES: {
    readonly VPC: "VpcStack";
    readonly IAM: "IamStack";
    readonly SECURITY_GROUP: "SecurityGroupStack";
    readonly EC2: "Ec2Stack";
    readonly S3: "S3Stack";
    readonly DATABASE: "DatabaseStack";
    readonly LAMBDA: "LambdaStack";
    readonly API_GATEWAY: "ApiGatewayStack";
};
export declare const LAMBDA_FUNCTIONS: {
    readonly HEALTH_CHECK: "health-check";
    readonly AUTH: "auth";
    readonly USER: "user";
};
export declare const PORTS: {
    readonly HTTP: 80;
    readonly HTTPS: 443;
    readonly SSH: 22;
    readonly MYSQL: 3306;
};
export declare const AVAILABILITY_ZONES: {
    readonly PRIMARY: "a";
    readonly SECONDARY: "c";
};
export declare const SUBNET_TYPES: {
    readonly PUBLIC: "Public";
    readonly PRIVATE: "Private";
    readonly DATABASE: "Database";
};
