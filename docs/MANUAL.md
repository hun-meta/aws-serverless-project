# AWS CDK 서버리스 프로젝트 배포 매뉴얼

[🇰🇷 한국어](#korean) | [🇺🇸 English](#english)

---

## 🇰🇷 한국어 {#korean}

### 📋 개요

이 매뉴얼은 AWS CDK 기반 서버리스 백엔드 인프라의 **초기 배포**와 **무중단 배포** 프로세스를 단계별로 안내합니다.

### 🎯 프로젝트 목적

- **초기 배포**: AWS에 필요한 모든 인프라 구성 요소를 한 번에 설정
- **무중단 배포**: Lambda 함수 수정/추가 시 서비스 중단 없이 배포
- **환경 분리**: 개발(dev)과 운영(prod) 환경 독립 관리

---

## 🚀 1. 초기 환경 설정

### 1.1 사전 요구사항

```bash
# Node.js 18+ 설치 확인
node --version  # v18.0.0 이상

# AWS CLI 설치 확인
aws --version
```

#### AWS 인증 설정

**SSO 방식 (권장)**:
```bash
# 새로운 SSO 프로필 설정
aws configure sso

# 기존 SSO 프로필로 로그인
aws sso login --profile your-sso-profile

# SSO 프로필을 기본값으로 설정 (선택사항)
export AWS_PROFILE=your-sso-profile
```

**전통적인 방식 (선택사항)**:
```bash
# Access Key 방식 설정
aws configure  # Access Key, Secret Key, Region 설정
```

**CDK CLI 설치**:
```bash
# CDK CLI 글로벌 설치
npm install -g aws-cdk@2.147.0
```

### 1.2 AWS 계정 설정

#### Bootstrap 상태 확인

```bash
# 1. 현재 AWS 계정 및 리전 확인
aws sts get-caller-identity
aws configure get region

# 2. CDK Bootstrap 상태 확인
aws cloudformation describe-stacks --stack-name CDKToolkit --region ap-northeast-2

# 상태가 "CREATE_COMPLETE" 또는 "UPDATE_COMPLETE"이면 이미 Bootstrap 완료
# 스택이 존재하지 않으면 "does not exist" 에러 발생 → Bootstrap 필요
```

#### Bootstrap 실행 (필요한 경우만)

```bash
# Bootstrap이 필요한 경우에만 실행
cdk bootstrap aws://421075015787/ap-northeast-2

# SSO 프로필 사용 시
cdk bootstrap aws://421075015787/ap-northeast-2 --profile your-sso-profile
```

⚠️ **중요**: 
- `cdk.json` 파일의 계정 정보를 본인의 AWS 계정으로 수정하세요.
- Bootstrap은 AWS 계정당 리전별로 **최초 1회만** 실행하면 됩니다.

### 1.3 프로젝트 초기화

```bash
# 저장소 클론
git clone <repository-url>
cd cdk-prj

# 의존성 설치
npm install

# Lambda 공통 라이브러리 빌드
cd packages/lambda-common
npm install && npm run build
cd ../..

# Lambda 함수 빌드
cd lambda/functions/health-check
npm install && npm run build
cd ../../..

# 전체 프로젝트 빌드
npm run build
```

---

## 🏗️ 2. 초기 인프라 배포

### 2.1 개발 환경 배포

```bash
# 1. 배포 전 변경사항 확인
npm run diff:dev

# 2. 개발 환경 전체 배포 (약 15-20분 소요)
npm run deploy:dev

# 3. 배포 상태 확인
npm run ls
```

### 2.2 운영 환경 배포

```bash
# 1. 배포 전 변경사항 확인
npm run diff:prod

# 2. 운영 환경 전체 배포 (약 20-25분 소요)
npm run deploy:prod
```

### 2.3 배포되는 인프라 구성 요소

#### 📊 스택 배포 순서 (의존성 기반)

1. **IAM Stack** - 역할 및 정책
2. **VPC Stack** - 네트워크 인프라
3. **Security Group Stack** - 보안 그룹
4. **S3 Stack** - 스토리지
5. **Database Stack** - Aurora Serverless v2
6. **EC2 Stack** - NAT/Bastion 인스턴스
7. **Lambda Stack** - Lambda 함수
8. **API Gateway Stack** - REST API

#### 🌐 네트워크 구성

**개발 환경 (dev)**:
- VPC CIDR: `10.1.0.0/16`
- Single AZ 구성
- NAT Instance 사용 (비용 절약)

**운영 환경 (prod)**:
- VPC CIDR: `10.0.0.0/16`
- Multi-AZ 구성
- NAT Gateway 사용 (고가용성)

#### 🔐 보안 설정

- Lambda: VPC 내 Private Subnet에 배포
- Database: 제한된 접근만 허용
- API Gateway: CORS 설정 적용
- IAM: 최소 권한 원칙 적용

---

## ⚡ 3. 무중단 배포 (Zero Downtime Deployment)

### 3.1 Lambda 함수 무중단 배포 아키텍처

```
API Gateway → Lambda Alias → Lambda Version
                   ↓
           Blue/Green 배포 지원
```

#### 🔵🟢 Blue/Green 배포 메커니즘

1. **Lambda Alias 활용**: 각 환경별 Alias 생성 (`dev`, `prod`)
2. **Versioning**: 코드 변경 시 자동으로 새 버전 생성
3. **트래픽 전환**: Alias가 새 버전을 가리키도록 원자적 업데이트

### 3.2 Lambda 함수 수정 배포

```bash
# 1. Lambda 함수 코드 수정 후
cd lambda/functions/health-check
npm run build

# 2. 변경사항 확인
cd ../../../
npm run diff:dev  # 또는 npm run diff:prod

# 3. Lambda 스택만 배포 (약 2-3분 소요)
cdk deploy --context env=dev DevLambdaStack

# 4. 배포 확인
aws lambda get-function --function-name dev-health-check-function
```

### 3.3 새로운 Lambda 함수 추가

#### Step 1: 함수 디렉토리 생성

```bash
# 새 함수 디렉토리 생성
mkdir -p lambda/functions/새함수명
cd lambda/functions/새함수명

# package.json 복사 및 수정
cp ../health-check/package.json .
cp ../health-check/tsconfig.json .
cp ../health-check/.gitignore .

# 함수 구조 생성
mkdir -p src/{constant,dto,interface,service}
```

#### Step 2: Lambda 스택에 함수 추가

```typescript
// lib/stacks/lambda-stack.ts에 새 함수 추가
const 새함수 = new lambda.Function(this, '새함수Function', {
  functionName: namingHelper.getLambdaFunctionName('새함수'),
  // ... 기타 설정
});

// Alias 생성
const 새함수Alias = new lambda.Alias(this, '새함수Alias', {
  aliasName: config.stage,
  version: 새함수.currentVersion
});
```

#### Step 3: API Gateway에 연결

```typescript
// lib/stacks/api-gateway-stack.ts에 라우트 추가
const 새함수Integration = new apigateway.LambdaIntegration(새함수);
api.root.addResource('새경로').addMethod('GET', 새함수Integration);
```

#### Step 4: 배포

```bash
# 함수 빌드
cd lambda/functions/새함수명
npm install && npm run build
cd ../../../

# 전체 빌드 및 배포
npm run build
npm run deploy:dev
```

### 3.4 배포 검증

```bash
# 1. Lambda 함수 상태 확인
aws lambda list-functions --query 'Functions[?contains(FunctionName, `dev-`)].FunctionName'

# 2. API Gateway 엔드포인트 테스트
curl https://your-api-id.execute-api.ap-northeast-2.amazonaws.com/dev/health

# 3. CloudWatch 로그 모니터링
aws logs tail /aws/lambda/dev-health-check-function --follow
```

---

## 🔄 4. 일반적인 배포 워크플로우

### 4.1 개발 → 운영 배포 플로우

```bash
# 1. 개발 환경에서 테스트
npm run deploy:dev
# 테스트 수행...

# 2. 운영 환경 배포
npm run deploy:prod

# 3. 배포 후 검증
# - Health check 확인
# - 주요 API 엔드포인트 테스트
# - CloudWatch 메트릭 모니터링
```

### 4.2 롤백 전략

```bash
# 1. 이전 버전으로 Alias 롤백
aws lambda update-alias \
  --function-name prod-health-check-function \
  --name prod \
  --function-version 이전버전번호

# 2. 또는 전체 스택 롤백
cdk deploy --context env=prod --rollback
```

---

## 📊 5. 모니터링 및 운영

### 5.1 로그 모니터링

```bash
# 실시간 로그 확인
aws logs tail /aws/lambda/dev-health-check-function --follow

# 특정 시간 범위 로그
aws logs filter-log-events \
  --log-group-name /aws/lambda/dev-health-check-function \
  --start-time 1640995200000
```

### 5.2 성능 모니터링

- **CloudWatch Metrics**: Duration, Errors, Throttles
- **X-Ray Tracing**: 분산 추적 (활성화 필요)
- **API Gateway Metrics**: 요청 수, 지연시간, 오류율

### 5.3 비용 최적화

**개발 환경**:
- NAT Instance (월 ~$15)
- Aurora Serverless v2 최소 용량
- 예약된 동시 실행 수 제한

**운영 환경**:
- NAT Gateway (고가용성)
- Aurora Serverless v2 자동 스케일링
- CloudWatch 세부 모니터링

---

## 🚨 6. 트러블슈팅

### 6.1 일반적인 문제들

#### Lambda 함수 빌드 실패
```bash
# TypeScript 컴파일 오류 확인
cd lambda/functions/health-check
npm run build

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

#### CDK 배포 실패
```bash
# CDK context 초기화
cdk context --clear

# Bootstrap 상태 확인 후 필요시 재실행
aws cloudformation describe-stacks --stack-name CDKToolkit --region ap-northeast-2
# 필요한 경우에만 Bootstrap 재실행
cdk bootstrap aws://계정번호/리전 --profile your-sso-profile
```

#### Lambda Cold Start 문제
```bash
# Provisioned Concurrency 설정 (운영환경)
aws lambda put-provisioned-concurrency-config \
  --function-name prod-health-check-function \
  --qualifier prod \
  --provisioned-concurrency-config ProvisionedConcurrencyConfig=2
```

### 6.2 네트워크 문제

#### Lambda VPC 연결 문제
- Security Group 아웃바운드 규칙 확인
- NAT Gateway/Instance 상태 확인
- Route Table 설정 검증

#### Database 연결 문제
- Database Security Group 인바운드 규칙
- Lambda Security Group과 Database Security Group 간 통신 허용

---

## 🧹 7. 환경 정리

### 7.1 개발 환경 제거

```bash
# 개발 환경 전체 삭제
npm run destroy:dev

# 확인 후 'y' 입력
```

### 7.2 운영 환경 제거

```bash
# 운영 환경 전체 삭제 (신중하게!)
npm run destroy:prod
```

⚠️ **경고**: 운영 환경 삭제 시 모든 데이터가 영구 삭제됩니다.

---

## 📚 8. 추가 리소스

### 8.1 관련 문서
- [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - 프로젝트 구조 상세 설명
- [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) - 커밋 메시지 규칙
- [PRIVATE_NPM_PACKAGE.md](./PRIVATE_NPM_PACKAGE.md) - Lambda 공통 패키지 가이드

### 8.2 AWS 문서
- [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/)

---

## 🇺🇸 English {#english}

### 📋 Overview

This manual provides step-by-step guidance for **initial deployment** and **zero-downtime deployment** processes of AWS CDK-based serverless backend infrastructure.

### 🎯 Project Purpose

- **Initial Deployment**: Set up all necessary infrastructure components in AWS at once
- **Zero-Downtime Deployment**: Deploy Lambda function modifications/additions without service interruption
- **Environment Separation**: Independent management of development (dev) and production (prod) environments

---

## 🚀 1. Initial Environment Setup

### 1.1 Prerequisites

```bash
# Check Node.js 18+ installation
node --version  # v18.0.0 or higher

# Check AWS CLI installation
aws --version
```

#### AWS Authentication Setup

**SSO Method (Recommended)**:
```bash
# Configure new SSO profile
aws configure sso

# Login with existing SSO profile
aws sso login --profile your-sso-profile

# Set SSO profile as default (optional)
export AWS_PROFILE=your-sso-profile
```

**Traditional Method (Optional)**:
```bash
# Configure with Access Keys
aws configure  # Set Access Key, Secret Key, Region
```

**CDK CLI Installation**:
```bash
# Install CDK CLI globally
npm install -g aws-cdk@2.147.0
```

### 1.2 AWS Account Setup

#### Check Bootstrap Status

```bash
# 1. Check current AWS account and region
aws sts get-caller-identity
aws configure get region

# 2. Check CDK Bootstrap status
aws cloudformation describe-stacks --stack-name CDKToolkit --region ap-northeast-2

# If status is "CREATE_COMPLETE" or "UPDATE_COMPLETE", Bootstrap is already done
# If stack doesn't exist, you'll get "does not exist" error → Bootstrap needed
```

#### Run Bootstrap (only if needed)

```bash
# Run Bootstrap only if needed
cdk bootstrap aws://421075015787/ap-northeast-2

# When using SSO profile
cdk bootstrap aws://421075015787/ap-northeast-2 --profile your-sso-profile
```

⚠️ **Important**: 
- Update the account information in `cdk.json` with your AWS account.
- Bootstrap needs to be run **only once per AWS account per region**.

### 1.3 Project Initialization

```bash
# Clone repository
git clone <repository-url>
cd cdk-prj

# Install dependencies
npm install

# Build Lambda common library
cd packages/lambda-common
npm install && npm run build
cd ../..

# Build Lambda functions
cd lambda/functions/health-check
npm install && npm run build
cd ../../..

# Build entire project
npm run build
```

---

## 🏗️ 2. Initial Infrastructure Deployment

### 2.1 Development Environment Deployment

```bash
# 1. Check changes before deployment
npm run diff:dev

# 2. Deploy entire development environment (takes ~15-20 minutes)
npm run deploy:dev

# 3. Verify deployment status
npm run ls
```

### 2.2 Production Environment Deployment

```bash
# 1. Check changes before deployment
npm run diff:prod

# 2. Deploy entire production environment (takes ~20-25 minutes)
npm run deploy:prod
```

### 2.3 Infrastructure Components Deployed

#### 📊 Stack Deployment Order (dependency-based)

1. **IAM Stack** - Roles and policies
2. **VPC Stack** - Network infrastructure
3. **Security Group Stack** - Security groups
4. **S3 Stack** - Storage
5. **Database Stack** - Aurora Serverless v2
6. **EC2 Stack** - NAT/Bastion instances
7. **Lambda Stack** - Lambda functions
8. **API Gateway Stack** - REST API

#### 🌐 Network Configuration

**Development Environment (dev)**:
- VPC CIDR: `10.1.0.0/16`
- Single AZ configuration
- NAT Instance (cost-effective)

**Production Environment (prod)**:
- VPC CIDR: `10.0.0.0/16`
- Multi-AZ configuration
- NAT Gateway (high availability)

#### 🔐 Security Configuration

- Lambda: Deployed in Private Subnet within VPC
- Database: Restricted access only
- API Gateway: CORS configuration applied
- IAM: Least privilege principle applied

---

## ⚡ 3. Zero-Downtime Deployment

### 3.1 Lambda Function Zero-Downtime Deployment Architecture

```
API Gateway → Lambda Alias → Lambda Version
                   ↓
           Blue/Green deployment support
```

#### 🔵🟢 Blue/Green Deployment Mechanism

1. **Lambda Alias Utilization**: Create aliases for each environment (`dev`, `prod`)
2. **Versioning**: Automatically create new versions on code changes
3. **Traffic Switching**: Atomic update of alias to point to new version

### 3.2 Lambda Function Modification Deployment

```bash
# 1. After modifying Lambda function code
cd lambda/functions/health-check
npm run build

# 2. Check changes
cd ../../../
npm run diff:dev  # or npm run diff:prod

# 3. Deploy Lambda stack only (takes ~2-3 minutes)
cdk deploy --context env=dev DevLambdaStack

# 4. Verify deployment
aws lambda get-function --function-name dev-health-check-function
```

### 3.3 Adding New Lambda Function

#### Step 1: Create Function Directory

```bash
# Create new function directory
mkdir -p lambda/functions/new-function
cd lambda/functions/new-function

# Copy and modify package.json
cp ../health-check/package.json .
cp ../health-check/tsconfig.json .
cp ../health-check/.gitignore .

# Create function structure
mkdir -p src/{constant,dto,interface,service}
```

#### Step 2: Add Function to Lambda Stack

```typescript
// Add new function in lib/stacks/lambda-stack.ts
const newFunction = new lambda.Function(this, 'NewFunction', {
  functionName: namingHelper.getLambdaFunctionName('new-function'),
  // ... other configurations
});

// Create alias
const newFunctionAlias = new lambda.Alias(this, 'NewFunctionAlias', {
  aliasName: config.stage,
  version: newFunction.currentVersion
});
```

#### Step 3: Connect to API Gateway

```typescript
// Add route in lib/stacks/api-gateway-stack.ts
const newFunctionIntegration = new apigateway.LambdaIntegration(newFunction);
api.root.addResource('new-path').addMethod('GET', newFunctionIntegration);
```

#### Step 4: Deploy

```bash
# Build function
cd lambda/functions/new-function
npm install && npm run build
cd ../../../

# Build and deploy entire project
npm run build
npm run deploy:dev
```

### 3.4 Deployment Verification

```bash
# 1. Check Lambda function status
aws lambda list-functions --query 'Functions[?contains(FunctionName, `dev-`)].FunctionName'

# 2. Test API Gateway endpoint
curl https://your-api-id.execute-api.ap-northeast-2.amazonaws.com/dev/health

# 3. Monitor CloudWatch logs
aws logs tail /aws/lambda/dev-health-check-function --follow
```

---

## 🔄 4. General Deployment Workflow

### 4.1 Development → Production Deployment Flow

```bash
# 1. Test in development environment
npm run deploy:dev
# Perform testing...

# 2. Deploy to production environment
npm run deploy:prod

# 3. Post-deployment verification
# - Check health check
# - Test major API endpoints
# - Monitor CloudWatch metrics
```

### 4.2 Rollback Strategy

```bash
# 1. Rollback alias to previous version
aws lambda update-alias \
  --function-name prod-health-check-function \
  --name prod \
  --function-version previous-version-number

# 2. Or rollback entire stack
cdk deploy --context env=prod --rollback
```

---

## 📊 5. Monitoring and Operations

### 5.1 Log Monitoring

```bash
# Real-time log viewing
aws logs tail /aws/lambda/dev-health-check-function --follow

# Logs for specific time range
aws logs filter-log-events \
  --log-group-name /aws/lambda/dev-health-check-function \
  --start-time 1640995200000
```

### 5.2 Performance Monitoring

- **CloudWatch Metrics**: Duration, Errors, Throttles
- **X-Ray Tracing**: Distributed tracing (requires activation)
- **API Gateway Metrics**: Request count, latency, error rate

### 5.3 Cost Optimization

**Development Environment**:
- NAT Instance (~$15/month)
- Aurora Serverless v2 minimum capacity
- Limited reserved concurrent executions

**Production Environment**:
- NAT Gateway (high availability)
- Aurora Serverless v2 auto-scaling
- CloudWatch detailed monitoring

---

## 🚨 6. Troubleshooting

### 6.1 Common Issues

#### Lambda Function Build Failure
```bash
# Check TypeScript compilation errors
cd lambda/functions/health-check
npm run build

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### CDK Deployment Failure
```bash
# Clear CDK context
cdk context --clear

# Check Bootstrap status and re-run if needed
aws cloudformation describe-stacks --stack-name CDKToolkit --region ap-northeast-2
# Re-run Bootstrap only if needed
cdk bootstrap aws://account-number/region --profile your-sso-profile
```

#### Lambda Cold Start Issues
```bash
# Configure Provisioned Concurrency (production)
aws lambda put-provisioned-concurrency-config \
  --function-name prod-health-check-function \
  --qualifier prod \
  --provisioned-concurrency-config ProvisionedConcurrencyConfig=2
```

### 6.2 Network Issues

#### Lambda VPC Connection Issues
- Check Security Group outbound rules
- Verify NAT Gateway/Instance status
- Validate Route Table configuration

#### Database Connection Issues
- Database Security Group inbound rules
- Communication between Lambda and Database Security Groups

---

## 🧹 7. Environment Cleanup

### 7.1 Remove Development Environment

```bash
# Delete entire development environment
npm run destroy:dev

# Confirm with 'y'
```

### 7.2 Remove Production Environment

```bash
# Delete entire production environment (use with caution!)
npm run destroy:prod
```

⚠️ **Warning**: Deleting production environment will permanently delete all data.

---

## 📚 8. Additional Resources

### 8.1 Related Documentation
- [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - Detailed project structure explanation
- [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) - Commit message conventions
- [PRIVATE_NPM_PACKAGE.md](./PRIVATE_NPM_PACKAGE.md) - Lambda common package guide

### 8.2 AWS Documentation
- [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/)

---

## 💡 Best Practices

### Development Workflow
1. Always test in development environment first
2. Use consistent naming conventions
3. Monitor CloudWatch logs during deployment
4. Implement proper error handling
5. Follow git commit conventions

### Security
1. Use IAM roles with least privilege
2. Enable VPC for Lambda functions
3. Implement proper authentication/authorization
4. Regular security audits

### Performance
1. Monitor Lambda cold starts
2. Optimize bundle sizes
3. Use appropriate memory allocation
4. Implement caching strategies

### Cost Management
1. Set up billing alerts
2. Use appropriate instance types for NAT
3. Monitor Lambda execution costs
4. Regular resource cleanup

This manual ensures smooth deployment and operation of your serverless infrastructure with minimal downtime and maximum reliability.