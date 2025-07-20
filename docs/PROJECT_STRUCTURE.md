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
│   ├── 📁 config/            # 환경별 설정 (향후 확장)
│   └── 📁 constructs/        # 재사용 가능한 CDK 구성요소 (향후 확장)
├── 📁 lambda/                 # Lambda 함수 코드
│   └── 📁 functions/         # 개별 Lambda 함수들
├── 📁 packages/               # 공유 패키지 및 라이브러리
│   └── 📁 lambda-common/     # Lambda 함수 공통 라이브러리
├── 📁 docs/                   # 프로젝트 문서
├── 📁 scripts/                # 배포 및 관리 스크립트 (향후 확장)
├── 📁 tests/                  # 테스트 파일 (향후 확장)
├── 📁 .github/                # GitHub Actions 워크플로우 (향후 확장)
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

#### `/lib/config` - 환경별 설정 (향후 확장)
**목적**: 환경별 세부 설정 파일 (현재 environment.ts에서 관리)

#### `/lib/constructs` - 재사용 가능한 CDK 구성요소 (향후 확장)
**목적**: 커스텀 CDK Construct 라이브러리

### `/lambda` - Lambda 함수 코드
**목적**: 서버리스 비즈니스 로직 구현

```
lambda/
└── functions/
    ├── health-check/           # 헬스체크 Lambda 함수 (구현됨)
    │   ├── src/
    │   │   ├── constant/       # 상수 정의
    │   │   ├── dto/           # 데이터 전송 객체
    │   │   ├── interface/     # 타입 인터페이스 (비어있음)
    │   │   ├── service/       # 비즈니스 로직 서비스
    │   │   └── lambda.ts      # Lambda 핸들러
    │   ├── package.json       # 의존성 관리
    │   ├── tsconfig.json      # TypeScript 설정
    │   └── .gitignore         # Git 제외 파일
    ├── auth/                  # 인증 관련 함수 (계획됨)
    │   └── src/
    │       ├── lambda.ts      # Lambda 진입점 (컨트롤러 역할)
    │       ├── dto/           # 로그인, 회원가입, 토큰 DTO
    │       ├── interface/     # 인증 및 사용자 인터페이스
    │       ├── service/       # 인증, 토큰, 검증 서비스
    │       └── constant/      # 에러 및 응답 상수
    └── user/                  # 사용자 관리 함수 (계획됨)
        └── src/
            ├── lambda.ts      # Lambda 진입점 (컨트롤러 역할)
            ├── dto/           # 프로필, 업데이트, 삭제 DTO
            ├── interface/     # 사용자 및 프로필 인터페이스
            ├── service/       # 사용자, 프로필, 검증 서비스
            └── constant/      # 에러 및 응답 상수
```

**Lambda 함수 아키텍처**:
- **MVC 패턴 적용**: 각 함수는 하나의 `lambda.ts` 파일(컨트롤러)에서 시작
- **계층화 구조**: DTO, Interface, Service, Constant 분리
- **마이크로서비스 단위**: 하나의 Lambda 함수가 최대 10개의 API 엔드포인트 처리
- **공통 패키지 의존성**: `@hun_meta/lambda-common` 패키지 사용

**헬스체크 함수 구조 (현재 구현됨)**:

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
    ├── dist/                 # TypeScript 컴파일 결과물
    ├── package.json          # 패키지 설정
    ├── tsconfig.json         # TypeScript 설정
    ├── .eslintrc.js         # ESLint 설정
    ├── .gitignore           # Git 제외 파일
    └── README.md            # 패키지 문서
```

**lambda-common 라이브러리**:
- **NPM 패키지 형태**: `@hun_meta/lambda-common`으로 발행됨
- **로컬 파일 경로 참조**: `file:../../../packages/lambda-common`
- **TypeScript 빌드**: `src/` → `dist/` 컴파일
- **모듈화된 구조**: constant, exception, interface, service 분리
- **중앙 집중식 공통 코드 관리**: 에러 코드, 서비스 클래스, 타입 정의

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
├── COMMIT_CONVENTION.md      # 커밋 메시지 규칙 (한/영)
├── PRIVATE_NPM_PACKAGE.md    # NPM 패키지 관리 가이드 (한/영)
└── REPOSITORY_STRUCTURE.md   # 저장소 구조 설명 (이전 버전)
```

### `/scripts` - 배포 및 관리 스크립트 (향후 확장)
**목적**: 자동화된 배포 및 관리 스크립트

```
scripts/ (계획됨)
├── deploy-dev.sh             # 개발 환경 배포 스크립트
├── deploy-prod.sh            # 운영 환경 배포 스크립트
├── destroy-env.sh            # 환경 제거 스크립트
└── setup.sh                  # 초기 설정 스크립트
```

### `/tests` - 테스트 파일 (향후 확장)
**목적**: 단위 테스트 및 통합 테스트

```
tests/ (계획됨)
├── unit/                     # 단위 테스트
│   ├── vpc-stack.test.ts     # VPC 스택 테스트
│   ├── lambda-stack.test.ts  # Lambda 스택 테스트
│   └── database-stack.test.ts # 데이터베이스 스택 테스트
├── integration/              # 통합 테스트
│   ├── api-gateway.test.ts   # API Gateway 테스트
│   └── database-connection.test.ts # DB 연결 테스트
└── fixtures/                 # 테스트 픽스처
    ├── sample-data.json      # 샘플 데이터
    └── mock-responses.json   # 모의 응답
```

### `/.github` - GitHub Actions (향후 확장)
**목적**: CI/CD 파이프라인 및 GitHub 관련 설정

```
.github/ (계획됨)
├── workflows/                # GitHub Actions
│   ├── ci.yml               # CI 파이프라인
│   ├── deploy-dev.yml       # 개발 환경 배포
│   └── deploy-prod.yml      # 운영 환경 배포
└── PULL_REQUEST_TEMPLATE.md # PR 템플릿
```

### 설정 및 구성 파일

#### 루트 레벨 설정 파일
```
├── package.json              # 프로젝트 의존성 및 스크립트
├── tsconfig.json            # TypeScript 설정
├── cdk.json                 # CDK 설정 및 환경 구성
├── cdk.context.json         # CDK 컨텍스트 캐시
├── cdk_request_template.md  # CDK 구현 요청 템플릿
├── jest.config.js           # Jest 테스트 설정 (향후 사용)
├── .gitignore              # Git 제외 파일
├── LICENSE                 # MIT 라이선스
├── README.md               # 프로젝트 개요 (한/영)
└── SUGGESTION.md           # 프로젝트 개선 제안
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

## 🏷️ 명명 규칙

### 스택 명명
- **형식**: `{Environment}{Service}Stack`
- **예시**: `DevVpcStack`, `ProdLambdaStack`

### Lambda 함수 명명
- **형식**: `{environment}-{domain}-function`
- **예시**: `dev-auth-function`, `prod-user-function`
- **설명**: 각 함수는 최대 10개의 API 엔드포인트를 마이크로서비스 단위로 처리

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
│   ├── 📁 config/            # Environment configurations (future expansion)
│   └── 📁 constructs/        # Reusable CDK constructs (future expansion)
├── 📁 lambda/                 # Lambda function code
│   └── 📁 functions/         # Individual Lambda functions
├── 📁 packages/               # Shared packages and libraries
│   └── 📁 lambda-common/     # Common Lambda library
├── 📁 docs/                   # Project documentation
├── 📁 scripts/                # Deployment and management scripts (future expansion)
├── 📁 tests/                  # Test files (future expansion)
├── 📁 .github/                # GitHub Actions workflows (future expansion)
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
    ├── health-check/           # Health check Lambda function (implemented)
    │   ├── src/
    │   │   ├── constant/       # Constant definitions
    │   │   ├── dto/           # Data Transfer Objects
    │   │   ├── interface/     # Type interfaces (empty)
    │   │   ├── service/       # Business logic services
    │   │   └── lambda.ts      # Lambda handler
    │   ├── package.json       # Dependency management
    │   ├── tsconfig.json      # TypeScript configuration
    │   └── .gitignore         # Git ignore file
    ├── auth/                  # Authentication functions (planned)
    │   └── src/
    │       ├── lambda.ts      # Lambda entry point (controller role)
    │       ├── dto/           # Login, register, token DTOs
    │       ├── interface/     # Auth and user interfaces
    │       ├── service/       # Auth, token, validation services
    │       └── constant/      # Error and response constants
    └── user/                  # User management functions (planned)
        └── src/
            ├── lambda.ts      # Lambda entry point (controller role)
            ├── dto/           # Profile, update, delete DTOs
            ├── interface/     # User and profile interfaces
            ├── service/       # User, profile, validation services
            └── constant/      # Error and response constants
```

**Lambda Function Architecture**:
- **MVC Pattern Implementation**: Each function starts with a single `lambda.ts` file (controller)
- **Layered Structure**: DTO, Interface, Service, Constant separation
- **Microservice Unit**: One Lambda function handles up to 10 API endpoints
- **Common Package Dependency**: Uses `@hun_meta/lambda-common` package

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
    ├── dist/                 # TypeScript compilation output
    ├── package.json          # Package configuration
    ├── tsconfig.json         # TypeScript configuration
    ├── .eslintrc.js         # ESLint configuration
    ├── .gitignore           # Git ignore file
    └── README.md            # Package documentation
```

**lambda-common Library Features**:
- **NPM Package Format**: Published as `@hun_meta/lambda-common`
- **Local File Path Reference**: `file:../../../packages/lambda-common`
- **TypeScript Build**: `src/` → `dist/` compilation
- **Modular Structure**: Separated constant, exception, interface, service
- **Centralized Common Code Management**: Error codes, service classes, type definitions

### 🏷️ Naming Conventions

#### Stack Naming
- **Format**: `{Environment}{Service}Stack`
- **Example**: `DevVpcStack`, `ProdLambdaStack`

#### Lambda Function Naming
- **Format**: `{environment}-{domain}-function`
- **Example**: `dev-auth-function`, `prod-user-function`
- **Description**: Each function handles up to 10 API endpoints as a microservice unit

### 🎯 Architecture Benefits

#### 1. **Scalability**
- Domain-based Lambda function separation
- Each function handles up to 10 APIs for optimal size
- Independent deployment and scaling

#### 2. **Maintainability**
- Clear separation of concerns with MVC pattern
- Singleton pattern for service instance management
- Layered structure for improved code readability

#### 3. **Reusability**
- Common libraries (`lambda-common`) utilization
- Standardized DTOs and interfaces
- Consistent error handling and response formats

#### 4. **Testability**
- Independent testing for each layer
- Easy unit testing for service layer
- Isolated testing with mock objects

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

This structure satisfies the requirements of `cdk_request_template.md` and includes all components of a serverless backend architecture, designed with consideration for development/production environment separation, zero-downtime deployment, and maintainability.