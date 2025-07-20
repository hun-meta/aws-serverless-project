# 프로젝트 구조 문서 (Project Structure Documentation)

[🇰🇷 한국어](#korean) | [🇺🇸 English](#english)

---

## 🇰🇷 한국어 {#korean}

### 개요
이 문서는 AWS CDK 기반 서버리스 백엔드 인프라 프로젝트의 전체 구조와 각 디렉토리의 역할을 상세히 설명합니다.

### 🏗️ 프로젝트 아키텍처
```
cdk-prj/
├── 📁 bin/                    # CDK 애플리케이션 진입점
├── 📁 lib/                    # CDK 인프라 코드
│   ├── 📁 stacks/            # CDK 스택 정의
│   ├── 📁 utils/             # 유틸리티 및 헬퍼 함수
│   ├── 📁 config/            # 환경별 설정 (비어있음)
│   └── 📁 constructs/        # 재사용 가능한 CDK 구성요소 (비어있음)
├── 📁 lambda/                 # Lambda 함수 코드
│   └── 📁 functions/         # 개별 Lambda 함수들
├── 📁 packages/               # 공유 패키지 및 라이브러리
│   └── 📁 lambda-common/     # Lambda 함수 공통 라이브러리
├── 📁 docs/                   # 프로젝트 문서
├── 📁 .claude/                # Claude AI 설정
├── 📁 .git/                   # Git 버전 관리
└── 📄 설정 및 구성 파일들
```

## 📂 디렉토리별 상세 설명

### `/bin` - CDK 애플리케이션 진입점
**목적**: CDK 애플리케이션의 메인 진입점과 스택 구성

```
bin/
├── cdk-prj.ts      # CDK 앱 메인 진입점 (TypeScript)
└── cdk-prj.js      # 컴파일된 진입점 (JavaScript)
```

**주요 역할**:
- CDK 애플리케이션 초기화
- 환경별 스택 인스턴스화 (dev/prod)
- 스택 간 의존성 관리
- 태깅 및 네이밍 헬퍼 설정

**핵심 기능**:
- `getEnvironmentConfig()`: 환경별 설정 로드
- `NamingHelper`: 일관된 리소스 명명 규칙
- `createTaggingHelper()`: 리소스 태깅 전략

### `/lib` - CDK 인프라스트럭처 코드
**목적**: AWS 인프라스트럭처 정의 및 관리

#### `/lib/stacks` - CDK 스택 정의
```
stacks/
├── vpc-stack.ts              # VPC 및 네트워킹 구성
├── iam-stack.ts              # IAM 역할 및 정책
├── security-group-stack.ts   # 보안 그룹 정의
├── s3-stack.ts              # S3 버킷 및 정책
├── database-stack.ts        # Aurora Serverless v2 데이터베이스
├── ec2-stack.ts             # EC2 인스턴스 (NAT/Bastion)
├── lambda-stack.ts          # Lambda 함수 및 설정
└── api-gateway-stack.ts     # API Gateway 및 라우팅
```

**스택별 세부 역할**:

**VPC Stack** (`vpc-stack.ts`):
- Multi-AZ VPC 구성 (퍼블릭/프라이빗/데이터베이스 서브넷)
- NAT Gateway/Instance 설정
- Internet Gateway 및 라우팅 테이블
- 환경별 네트워크 CIDR 관리

**IAM Stack** (`iam-stack.ts`):
- Lambda 실행 역할 (`CustomLambdaLoggingRole`)
- API Gateway 로깅 역할 (`CustomApiGatewayLogRole`)
- S3 액세스 역할 (`CustomLambdaEdgeS3`)
- 스케줄러 역할 (`CustomSchedulerLambdaExecutionRole`)

**Security Group Stack** (`security-group-stack.ts`):
- Lambda 보안 그룹 (아웃바운드 전용)
- EC2 보안 그룹 (SSH 액세스)
- 데이터베이스 보안 그룹 (제한된 액세스)
- NAT 인스턴스 보안 그룹

**Database Stack** (`database-stack.ts`):
- Aurora Serverless v2 클러스터
- 서브넷 그룹 구성
- 백업 및 보안 설정
- 환경별 용량 스케일링

**Lambda Stack** (`lambda-stack.ts`):
- Lambda 함수 배포 및 설정
- 환경 변수 및 VPC 구성
- Lambda Layer 관리
- 함수별 메모리 및 타임아웃 설정

**API Gateway Stack** (`api-gateway-stack.ts`):
- REST API Gateway 구성
- Lambda 통합 및 프록시 설정
- CORS 및 인증 설정
- 스테이지 관리 (dev/prod)

#### `/lib/utils` - 유틸리티 및 헬퍼
```
utils/
├── environment.ts    # 환경별 설정 관리
├── naming.ts         # 리소스 명명 규칙
├── tags.ts          # 태깅 전략
└── constants.ts     # 프로젝트 상수
```

**파일별 역할**:

**environment.ts**:
- 환경별 설정 인터페이스 정의
- VPC, 데이터베이스, Lambda 설정 타입
- 개발/운영 환경 구성 로드

**naming.ts**:
- 일관된 리소스 명명 규칙
- 환경별 프리픽스 관리
- AWS 리소스 명명 표준 준수

**tags.ts**:
- 공통 태깅 전략
- 비용 추적 및 관리
- 리소스 그룹화

**constants.ts**:
- 스택 이름 정의
- Lambda 함수 식별자
- 포트 및 프로토콜 상수

### `/lambda` - Lambda 함수 코드
**목적**: 서버리스 비즈니스 로직 구현

```
lambda/
└── functions/
    └── health-check/           # 헬스체크 Lambda 함수
        ├── src/
        │   ├── constant/       # 상수 정의
        │   ├── dto/           # 데이터 전송 객체
        │   ├── interface/     # 타입 인터페이스 (비어있음)
        │   ├── service/       # 비즈니스 로직 서비스
        │   └── lambda.ts      # Lambda 핸들러
        ├── package.json       # 의존성 관리
        ├── tsconfig.json      # TypeScript 설정
        └── .gitignore         # Git 제외 파일
```

**헬스체크 함수 구조**:

**constants/**:
- `error-info.constant.ts`: 에러 코드 및 메시지
- `service-code.constant.ts`: 서비스 코드 정의

**dto/**:
- `health-check-request.dto.ts`: 요청 데이터 검증
- `health-check-response.dto.ts`: 응답 형식 정의

**service/**:
- `health-check.service.ts`: 헬스체크 비즈니스 로직
- `logger.service.ts`: 로깅 서비스

**lambda.ts**: API Gateway 이벤트 처리 및 응답

### `/packages` - 공유 패키지
**목적**: Lambda 함수 간 공통 라이브러리 및 유틸리티

```
packages/
└── lambda-common/              # Lambda 공통 라이브러리
    ├── src/
    │   ├── constant/          # 공통 상수
    │   ├── exception/         # 커스텀 예외
    │   ├── interface/         # 공통 인터페이스
    │   ├── service/          # 공통 서비스
    │   └── index.ts          # 패키지 진입점
    ├── package.json          # 패키지 설정
    ├── tsconfig.json         # TypeScript 설정
    ├── .eslintrc.js         # ESLint 설정
    └── README.md            # 패키지 문서
```

**lambda-common 라이브러리**:

**constants/**:
- `common-code.constant.ts`: 공통 액션 코드
- `error-info.constant.ts`: 에러 정보
- `http-status.constant.ts`: HTTP 상태 코드
- `success-info.constant.ts`: 성공 메시지
- `table-code.constant.ts`: 데이터베이스 테이블 코드

**exception/**:
- `custom.exception.ts`: 커스텀 예외 클래스

**interface/**:
- `response.types.ts`: API 응답 타입 정의

**service/**:
- `base.service.ts`: 기본 서비스 클래스
- `base-external.service.ts`: 외부 서비스 기본 클래스
- `database.service.ts`: 데이터베이스 서비스
- `logger.service.ts`: 로깅 서비스
- `response-handler.service.ts`: API 응답 처리

### `/docs` - 프로젝트 문서
**목적**: 프로젝트 관련 문서 및 가이드

```
docs/
├── COMMIT_CONVENTION.md      # 커밋 메시지 규칙
├── PRIVATE_NPM_PACKAGE.md    # NPM 패키지 관리 가이드
└── REPOSITORY_STRUCTURE.md   # 저장소 구조 설명
```

### 설정 및 구성 파일

#### 루트 레벨 설정 파일
```
├── package.json              # 프로젝트 의존성 및 스크립트
├── tsconfig.json            # TypeScript 설정
├── cdk.json                 # CDK 설정 및 환경 구성
├── cdk.context.json         # CDK 컨텍스트 캐시
├── jest.config.js           # Jest 테스트 설정 (향후 사용)
├── .gitignore              # Git 제외 파일
├── LICENSE                 # MIT 라이선스
└── README.md               # 프로젝트 개요
```

**주요 설정 파일 역할**:

**package.json**:
- CDK 및 TypeScript 의존성
- 빌드 및 배포 스크립트
- 환경별 배포 명령어

**cdk.json**:
- CDK 애플리케이션 진입점
- 환경별 계정 및 리전 설정
- CDK 기능 플래그 및 컨텍스트

**tsconfig.json**:
- TypeScript 컴파일 설정
- 모듈 해석 및 빌드 옵션
- 타입 체크 규칙

## 🔗 파일 관계 및 의존성

### 빌드 프로세스
1. **TypeScript 컴파일**: `src/*.ts` → `dist/*.js`
2. **Lambda 패키징**: 함수별 독립적 빌드
3. **CDK 합성**: CloudFormation 템플릿 생성
4. **AWS 배포**: 환경별 스택 배포

### 의존성 관계
```
bin/cdk-prj.ts
├── lib/utils/environment.ts
├── lib/utils/naming.ts
├── lib/utils/tags.ts
└── lib/stacks/*.ts

lambda/functions/*/
├── packages/lambda-common/
└── @types/aws-lambda

packages/lambda-common/
├── zod (validation)
└── AWS Lambda types
```

### 환경 분리
- **개발환경 (dev)**: 단일 AZ, 작은 용량, 비용 최적화
- **운영환경 (prod)**: Multi-AZ, 고가용성, 성능 최적화

## 🚀 개발 워크플로우

### 1. 초기 설정
```bash
# 의존성 설치
npm install

# Lambda 공통 라이브러리 빌드
cd packages/lambda-common
npm install && npm run build

# Lambda 함수 빌드
cd lambda/functions/health-check
npm install && npm run build
```

### 2. 개발 과정
```bash
# CDK 차이점 확인
npm run diff:dev

# 스택 배포
npm run deploy:dev

# 로그 모니터링
aws logs tail /aws/lambda/health-check --follow
```

### 3. 코드 구조 확장
- 새 Lambda 함수: `lambda/functions/새함수명/`
- 새 CDK 스택: `lib/stacks/새스택.ts`
- 공통 유틸리티: `packages/lambda-common/src/`

---

## 🇺🇸 English {#english}

### Overview
This document provides a detailed explanation of the entire structure and directory roles of the AWS CDK-based serverless backend infrastructure project.

### 🏗️ Project Architecture
```
cdk-prj/
├── 📁 bin/                    # CDK application entry point
├── 📁 lib/                    # CDK infrastructure code
│   ├── 📁 stacks/            # CDK stack definitions
│   ├── 📁 utils/             # Utilities and helper functions
│   ├── 📁 config/            # Environment configurations (empty)
│   └── 📁 constructs/        # Reusable CDK constructs (empty)
├── 📁 lambda/                 # Lambda function code
│   └── 📁 functions/         # Individual Lambda functions
├── 📁 packages/               # Shared packages and libraries
│   └── 📁 lambda-common/     # Common Lambda library
├── 📁 docs/                   # Project documentation
├── 📁 .claude/                # Claude AI settings
├── 📁 .git/                   # Git version control
└── 📄 Configuration files
```

## 📂 Detailed Directory Descriptions

### `/bin` - CDK Application Entry Point
**Purpose**: Main entry point and stack configuration for CDK application

```
bin/
├── cdk-prj.ts      # CDK app main entry point (TypeScript)
└── cdk-prj.js      # Compiled entry point (JavaScript)
```

**Key Responsibilities**:
- CDK application initialization
- Environment-specific stack instantiation (dev/prod)
- Inter-stack dependency management
- Tagging and naming helper setup

**Core Functions**:
- `getEnvironmentConfig()`: Load environment-specific configurations
- `NamingHelper`: Consistent resource naming conventions
- `createTaggingHelper()`: Resource tagging strategy

### `/lib` - CDK Infrastructure Code
**Purpose**: AWS infrastructure definition and management

#### `/lib/stacks` - CDK Stack Definitions
```
stacks/
├── vpc-stack.ts              # VPC and networking configuration
├── iam-stack.ts              # IAM roles and policies
├── security-group-stack.ts   # Security group definitions
├── s3-stack.ts              # S3 buckets and policies
├── database-stack.ts        # Aurora Serverless v2 database
├── ec2-stack.ts             # EC2 instances (NAT/Bastion)
├── lambda-stack.ts          # Lambda functions and configuration
└── api-gateway-stack.ts     # API Gateway and routing
```

**Stack-specific Details**:

**VPC Stack** (`vpc-stack.ts`):
- Multi-AZ VPC configuration (public/private/database subnets)
- NAT Gateway/Instance setup
- Internet Gateway and routing tables
- Environment-specific network CIDR management

**IAM Stack** (`iam-stack.ts`):
- Lambda execution roles (`CustomLambdaLoggingRole`)
- API Gateway logging role (`CustomApiGatewayLogRole`)
- S3 access role (`CustomLambdaEdgeS3`)
- Scheduler role (`CustomSchedulerLambdaExecutionRole`)

**Security Group Stack** (`security-group-stack.ts`):
- Lambda security groups (outbound only)
- EC2 security groups (SSH access)
- Database security groups (restricted access)
- NAT instance security groups

**Database Stack** (`database-stack.ts`):
- Aurora Serverless v2 cluster
- Subnet group configuration
- Backup and security settings
- Environment-specific capacity scaling

**Lambda Stack** (`lambda-stack.ts`):
- Lambda function deployment and configuration
- Environment variables and VPC configuration
- Lambda Layer management
- Function-specific memory and timeout settings

**API Gateway Stack** (`api-gateway-stack.ts`):
- REST API Gateway configuration
- Lambda integration and proxy setup
- CORS and authentication settings
- Stage management (dev/prod)

#### `/lib/utils` - Utilities and Helpers
```
utils/
├── environment.ts    # Environment-specific configuration management
├── naming.ts         # Resource naming conventions
├── tags.ts          # Tagging strategy
└── constants.ts     # Project constants
```

**File-specific Roles**:

**environment.ts**:
- Environment-specific configuration interfaces
- VPC, database, Lambda configuration types
- Development/production environment configuration loading

**naming.ts**:
- Consistent resource naming conventions
- Environment-specific prefix management
- AWS resource naming standard compliance

**tags.ts**:
- Common tagging strategy
- Cost tracking and management
- Resource grouping

**constants.ts**:
- Stack name definitions
- Lambda function identifiers
- Port and protocol constants

### `/lambda` - Lambda Function Code
**Purpose**: Serverless business logic implementation

```
lambda/
└── functions/
    └── health-check/           # Health check Lambda function
        ├── src/
        │   ├── constant/       # Constant definitions
        │   ├── dto/           # Data Transfer Objects
        │   ├── interface/     # Type interfaces (empty)
        │   ├── service/       # Business logic services
        │   └── lambda.ts      # Lambda handler
        ├── package.json       # Dependency management
        ├── tsconfig.json      # TypeScript configuration
        └── .gitignore         # Git ignore file
```

**Health Check Function Structure**:

**constants/**:
- `error-info.constant.ts`: Error codes and messages
- `service-code.constant.ts`: Service code definitions

**dto/**:
- `health-check-request.dto.ts`: Request data validation
- `health-check-response.dto.ts`: Response format definition

**service/**:
- `health-check.service.ts`: Health check business logic
- `logger.service.ts`: Logging service

**lambda.ts**: API Gateway event processing and response

### `/packages` - Shared Packages
**Purpose**: Common libraries and utilities shared between Lambda functions

```
packages/
└── lambda-common/              # Lambda common library
    ├── src/
    │   ├── constant/          # Common constants
    │   ├── exception/         # Custom exceptions
    │   ├── interface/         # Common interfaces
    │   ├── service/          # Common services
    │   └── index.ts          # Package entry point
    ├── package.json          # Package configuration
    ├── tsconfig.json         # TypeScript configuration
    ├── .eslintrc.js         # ESLint configuration
    └── README.md            # Package documentation
```

**lambda-common Library**:

**constants/**:
- `common-code.constant.ts`: Common action codes
- `error-info.constant.ts`: Error information
- `http-status.constant.ts`: HTTP status codes
- `success-info.constant.ts`: Success messages
- `table-code.constant.ts`: Database table codes

**exception/**:
- `custom.exception.ts`: Custom exception classes

**interface/**:
- `response.types.ts`: API response type definitions

**service/**:
- `base.service.ts`: Base service class
- `base-external.service.ts`: External service base class
- `database.service.ts`: Database service
- `logger.service.ts`: Logging service
- `response-handler.service.ts`: API response handling

### `/docs` - Project Documentation
**Purpose**: Project-related documentation and guides

```
docs/
├── COMMIT_CONVENTION.md      # Commit message rules
├── PRIVATE_NPM_PACKAGE.md    # NPM package management guide
└── REPOSITORY_STRUCTURE.md   # Repository structure description
```

### Configuration Files

#### Root Level Configuration Files
```
├── package.json              # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── cdk.json                 # CDK configuration and environment setup
├── cdk.context.json         # CDK context cache
├── jest.config.js           # Jest test configuration (future use)
├── .gitignore              # Git ignore file
├── LICENSE                 # MIT License
└── README.md               # Project overview
```

**Key Configuration File Roles**:

**package.json**:
- CDK and TypeScript dependencies
- Build and deployment scripts
- Environment-specific deployment commands

**cdk.json**:
- CDK application entry point
- Environment-specific account and region settings
- CDK feature flags and context

**tsconfig.json**:
- TypeScript compilation settings
- Module resolution and build options
- Type checking rules

## 🔗 File Relationships and Dependencies

### Build Process
1. **TypeScript Compilation**: `src/*.ts` → `dist/*.js`
2. **Lambda Packaging**: Independent build per function
3. **CDK Synthesis**: CloudFormation template generation
4. **AWS Deployment**: Environment-specific stack deployment

### Dependency Relationships
```
bin/cdk-prj.ts
├── lib/utils/environment.ts
├── lib/utils/naming.ts
├── lib/utils/tags.ts
└── lib/stacks/*.ts

lambda/functions/*/
├── packages/lambda-common/
└── @types/aws-lambda

packages/lambda-common/
├── zod (validation)
└── AWS Lambda types
```

### Environment Separation
- **Development (dev)**: Single AZ, small capacity, cost-optimized
- **Production (prod)**: Multi-AZ, high availability, performance-optimized

## 🚀 Development Workflow

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Build Lambda common library
cd packages/lambda-common
npm install && npm run build

# Build Lambda functions
cd lambda/functions/health-check
npm install && npm run build
```

### 2. Development Process
```bash
# Check CDK differences
npm run diff:dev

# Deploy stack
npm run deploy:dev

# Monitor logs
aws logs tail /aws/lambda/health-check --follow
```

### 3. Code Structure Extension
- New Lambda function: `lambda/functions/new-function/`
- New CDK stack: `lib/stacks/new-stack.ts`
- Common utilities: `packages/lambda-common/src/`

---

## 📝 Maintenance Notes

### Build Artifacts
- **`/dist`**: Compiled TypeScript output (excluded from Git)
- **`/cdk.out`**: CDK synthesis output (excluded from Git)
- **`/lambda/functions/*/dist`**: Lambda function build output (excluded from Git)

### Version Control Strategy
- Source files (`.ts`) are tracked in Git
- Compiled files (`.js`, `.d.ts`) are excluded via `.gitignore`
- Build process generates artifacts during deployment

### Development Best Practices
- Use consistent naming conventions across all resources
- Follow TypeScript strict mode for type safety
- Implement proper error handling and logging
- Maintain environment parity between dev and prod
- Document all custom configurations and decisions