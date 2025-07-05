# AWS CDK Serverless Backend Infrastructure / AWS CDK 서버리스 백엔드 인프라 구축

[🇰🇷 한국어](#korean) | [🇺🇸 English](#english)

---

## 🇰🇷 한국어 {#korean}

### 개요

이 프로젝트는 AWS CDK와 TypeScript를 사용하여 서버리스 백엔드 인프라를 구현하며, 개발/운영 환경 분리를 통한 확장 가능한 웹 애플리케이션을 위해 설계되었습니다.

### 🏗️ 아키텍처 개요

인프라 구성 요소:

- **VPC**: 퍼블릭, 프라이빗, 데이터베이스 서브넷 구성
- **API Gateway + Lambda**: 서버리스 API 구성
- **Aurora Serverless v2**: MySQL 데이터베이스
- **S3**: 파일 저장소
- **EC2**: NAT/Bastion 호스트
- **IAM 역할 및 보안 그룹**
- **무중단 배포**: 환경 분리를 통한 배포 전략

### 📋 사전 요구사항

#### 필요한 도구
- Node.js (v18 이상)
- AWS CLI
- AWS CDK CLI
- TypeScript

#### AWS 계정 설정
1. AWS 계정 생성
2. AWS CLI 자격 증명 구성
3. AWS CDK 전역 설치
4. 대상 리전에서 CDK 부트스트랩

### 🚀 시작하기

#### 1. 의존성 설치
```bash
npm install -g aws-cdk
npm install
```

#### 2. AWS 자격 증명 구성
```bash
# Identity Center를 통해 생성한 사용자의 권한을 설정하기 위함(브라우저 사용)
aws configure sso
```

#### 3. CDK 부트스트랩
```bash
# CDK 앱이 AWS 클라우드에 리소스를 배포하는 데 필요한 기본 인프라(부트스트랩 스택) 세팅 명령
cdk bootstrap
```

#### 4. 인프라 배포
```bash
# 개발 환경 배포 
cdk deploy --context env=dev

# 운영 환경 배포
cdk deploy --context env=prod
```

### 🔧 인프라 구성 요소

#### 컴퓨팅 서비스
- **Lambda 함수**: API 엔드포인트 (512MB 메모리, 15초 타임아웃)
- **EC2 인스턴스**: 
  - 개발환경: t2.micro (NAT + Bastion)
  - 운영환경: t4g.nano (Bastion), 별도 NAT Gateway

#### 스토리지 서비스
- **S3 버킷**: 환경별 구성, 퍼블릭 액세스 차단
- **Aurora Serverless v2**: MySQL 엔진
  - 개발환경: 0-0.5 ACU
  - 운영환경: 0.5-4 ACU

#### 네트워킹
- **VPC**: Multi-AZ 구성 (public/private/database 서브넷)
- **API Gateway**: Lambda 통합 REST API
- **Route 53**: 커스텀 도메인 지원 (향후 계획)
- **보안 그룹**: 계층화된 보안 모델

#### IAM 역할
- `CustomLambdaLoggingRole`: CloudWatch 로깅 권한
- `CustomApiGatewayLogRole`: API Gateway 로깅
- `CustomLambdaEdgeS3`: Lambda@Edge S3 액세스
- `CustomLambdaCommon`: 일반 Lambda 권한
- `CustomSchedulerLambdaExecutionRole`: EventBridge 스케줄러

### 🔒 보안 구성

#### 보안 그룹
- **Lambda**: 아웃바운드 전용 액세스
- **EC2**: 특정 IP SSH 액세스
- **데이터베이스**: Bastion과 Lambda에서만 액세스
- **NAT**: 내부 트래픽 라우팅

#### 네트워크 보안
- Lambda 함수용 프라이빗 서브넷
- 인터넷 액세스 없는 데이터베이스 서브넷
- 안전한 데이터베이스 액세스를 위한 Bastion 호스트

### 💰 비용 최적화

- **서버리스 우선** 접근법
- **Aurora Serverless v2** 자동 스케일링
- **개발 환경**: NAT/Bastion 단일 EC2 사용
- **운영 환경**: 고가용성 최적화

### 🔄 배포 전략

#### 환경 분리
- 독립적인 배포 파이프라인
- 환경별 구성
- 격리된 리소스 스택

#### 무중단 배포
- Lambda 버전 관리 및 별칭
- API Gateway 스테이지 관리
- 데이터베이스 마이그레이션 전략

### 📊 모니터링 및 로깅

- **CloudWatch Logs**: 중앙 집중식 로깅
- **CloudWatch Metrics**: 성능 모니터링
- **Cost Explorer**: 예산 추적
- **AWS X-Ray**: 분산 추적 (선택사항)

### 🏷️ 태깅 전략

모든 리소스에 다음 태그 적용:
- Environment (dev/prod)
- Project name
- Cost center
- Owner

### 📁 프로젝트 구조

```
├── lib/
│   ├── stacks/
│   │   ├── vpc-stack.ts
│   │   ├── lambda-stack.ts
│   │   ├── database-stack.ts
│   │   └── api-gateway-stack.ts
│   ├── constructs/
│   └── utils/
├── lambda/
│   └── functions/
├── cdk.json
├── package.json
└── README.md
```

### 🔧 구성

#### 환경 변수
```bash
# 개발환경
export CDK_DEFAULT_REGION=ap-northeast-2
export CDK_DEFAULT_ACCOUNT=your-account-id

# 운영환경
export PROD_REGION=ap-northeast-2
export PROD_ACCOUNT=your-prod-account-id
```

#### CDK 컨텍스트
```json
{
  "environments": {
    "dev": {
      "account": "your-dev-account",
      "region": "ap-northeast-2"
    },
    "prod": {
      "account": "your-prod-account",
      "region": "ap-northeast-2"
    }
  }
}
```

### 🚀 배포 명령어

```bash
# 모든 스택 목록 조회
cdk ls

# 특정 환경 배포
cdk deploy --context env=dev
cdk deploy --context env=prod

# 환경 제거
cdk destroy --context env=dev

# 차이점 확인
cdk diff --context env=dev
```

### 📚 추가 리소스

- [AWS CDK 문서](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda 모범 사례](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Aurora Serverless v2 가이드](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html)

### 🤝 기여하기

1. 리포지토리 포크
2. 기능 브랜치 생성
3. 변경사항 적용
4. 배포 테스트
5. Pull Request 제출

#### 커밋 메시지 컨벤션

이 프로젝트는 일관성 있는 커밋 히스토리를 위해 Conventional Commits 표준을 따릅니다.

기본 형식:
```
<type>: <subject>

[body]

[footer]
```

주요 타입:
- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 포맷팅 변경
- **refactor**: 코드 리팩토링
- **test**: 테스트 코드 추가/수정
- **chore**: 빌드 시스템, 패키지 관리 등

자세한 내용은 [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md)를 참조하세요.

### 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

---

## 🇺🇸 English {#english}

### Overview

This project implements a serverless backend infrastructure using AWS CDK with TypeScript, designed for scalable web applications with separate development and production environments.

### 🏗️ Architecture Overview

Infrastructure Components:

- **VPC**: Public, private, and database subnet configuration
- **API Gateway + Lambda**: Serverless API configuration
- **Aurora Serverless v2**: MySQL database
- **S3**: File storage
- **EC2**: NAT/Bastion hosts
- **IAM roles and security groups**
- **Zero-downtime deployment**: Deployment strategy through environment separation

### 📋 Prerequisites

#### Required Tools
- Node.js (v18 or higher)
- AWS CLI
- AWS CDK CLI
- TypeScript

#### AWS Account Setup
1. Create AWS account
2. Configure AWS CLI credentials
3. Install AWS CDK globally
4. Bootstrap CDK in target region

### 🚀 Getting Started

#### 1. Install Dependencies
```bash
npm install -g aws-cdk
npm install
```

#### 2. Configure AWS Credentials
```bash
# Configure permissions for users created through Identity Center (uses browser)
aws configure sso
```

#### 3. Bootstrap CDK
```bash
# Command to set up basic infrastructure (bootstrap stack) needed for CDK app to deploy resources to AWS cloud
cdk bootstrap
```

#### 4. Deploy Infrastructure
```bash
# Deploy development environment
cdk deploy --context env=dev

# Deploy production environment
cdk deploy --context env=prod
```

### 🔧 Infrastructure Components

#### Computing Services
- **Lambda Functions**: API endpoints (512MB memory, 15-second timeout)
- **EC2 Instances**: 
  - Development: t2.micro (NAT + Bastion)
  - Production: t4g.nano (Bastion), separate NAT Gateway

#### Storage Services
- **S3 Buckets**: Environment-specific configuration, public access blocked
- **Aurora Serverless v2**: MySQL engine
  - Development: 0-0.5 ACU
  - Production: 0.5-4 ACU

#### Networking
- **VPC**: Multi-AZ configuration (public/private/database subnets)
- **API Gateway**: Lambda-integrated REST API
- **Route 53**: Custom domain support (future plan)
- **Security Groups**: Layered security model

#### IAM Roles
- `CustomLambdaLoggingRole`: CloudWatch logging permissions
- `CustomApiGatewayLogRole`: API Gateway logging
- `CustomLambdaEdgeS3`: Lambda@Edge S3 access
- `CustomLambdaCommon`: General Lambda permissions
- `CustomSchedulerLambdaExecutionRole`: EventBridge scheduler

### 🔒 Security Configuration

#### Security Groups
- **Lambda**: Outbound-only access
- **EC2**: Specific IP SSH access
- **Database**: Access only from Bastion and Lambda
- **NAT**: Internal traffic routing

#### Network Security
- Private subnets for Lambda functions
- Database subnets without internet access
- Bastion host for secure database access

### 💰 Cost Optimization

- **Serverless-first** approach
- **Aurora Serverless v2** auto-scaling
- **Development environment**: Single EC2 for NAT/Bastion
- **Production environment**: High availability optimization

### 🔄 Deployment Strategy

#### Environment Separation
- Independent deployment pipelines
- Environment-specific configurations
- Isolated resource stacks

#### Zero-Downtime Deployment
- Lambda version management and aliases
- API Gateway stage management
- Database migration strategy

### 📊 Monitoring and Logging

- **CloudWatch Logs**: Centralized logging
- **CloudWatch Metrics**: Performance monitoring
- **Cost Explorer**: Budget tracking
- **AWS X-Ray**: Distributed tracing (optional)

### 🏷️ Tagging Strategy

Apply the following tags to all resources:
- Environment (dev/prod)
- Project name
- Cost center
- Owner

### 📁 Project Structure

```
├── lib/
│   ├── stacks/
│   │   ├── vpc-stack.ts
│   │   ├── lambda-stack.ts
│   │   ├── database-stack.ts
│   │   └── api-gateway-stack.ts
│   ├── constructs/
│   └── utils/
├── lambda/
│   └── functions/
├── cdk.json
├── package.json
└── README.md
```

### 🔧 Configuration

#### Environment Variables
```bash
# Development environment
export CDK_DEFAULT_REGION=ap-northeast-2
export CDK_DEFAULT_ACCOUNT=your-account-id

# Production environment
export PROD_REGION=ap-northeast-2
export PROD_ACCOUNT=your-prod-account-id
```

#### CDK Context
```json
{
  "environments": {
    "dev": {
      "account": "your-dev-account",
      "region": "ap-northeast-2"
    },
    "prod": {
      "account": "your-prod-account",
      "region": "ap-northeast-2"
    }
  }
}
```

### 🚀 Deployment Commands

```bash
# List all stacks
cdk ls

# Deploy specific environment
cdk deploy --context env=dev
cdk deploy --context env=prod

# Destroy environment
cdk destroy --context env=dev

# Check differences
cdk diff --context env=dev
```

### 📚 Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Aurora Serverless v2 Guide](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html)

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Apply changes
4. Test deployment
5. Submit Pull Request

#### Commit Message Convention

This project follows the Conventional Commits standard for consistent commit history.

Basic format:
```
<type>: <subject>

[body]

[footer]
```

Main types:
- **feat**: Add new feature
- **fix**: Fix bug
- **docs**: Documentation updates
- **style**: Code formatting changes
- **refactor**: Code refactoring
- **test**: Add/modify test code
- **chore**: Build system, package management, etc.

For detailed information, refer to [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md).

### 📄 License

This project is distributed under the MIT License. See the [LICENSE](./LICENSE) file for details.