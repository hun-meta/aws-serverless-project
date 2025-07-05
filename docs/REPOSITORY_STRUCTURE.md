# Repository Structure / 프로젝트 구조

[🇰🇷 한국어](#korean) | [🇺🇸 English](#english)

---

## 🇰🇷 한국어 {#korean}

### 개요

이 문서는 AWS CDK 서버리스 백엔드 인프라 프로젝트의 디렉토리 구조와 각 파일의 목적을 설명합니다.

## 📁 전체 디렉토리 구조

```
cdk-prj/
├── 📄 README.md                           # 프로젝트 개요 및 사용법 (한/영)
├── 📄 LICENSE                             # MIT 라이선스
├── 📄 cdk_request_template.md             # CDK 구현 요청 템플릿
├── 📄 package.json                        # Node.js 프로젝트 설정 및 의존성
├── 📄 package-lock.json                   # 의존성 락 파일
├── 📄 tsconfig.json                       # TypeScript 컴파일러 설정
├── 📄 cdk.json                           # CDK 앱 설정 및 컨텍스트
├── 📄 .gitignore                         # Git 버전 관리 제외 파일
├── 📄 .npmignore                         # NPM 게시 제외 파일
│
├── 📁 bin/                               # CDK 앱 진입점
│   └── 📄 cdk-prj.ts                     # CDK 앱 메인 파일
├── 📁 docs/                              # 프로젝트 문서
│   ├── 📄 COMMIT_CONVENTION.md           # 커밋 메시지 컨벤션 (한/영)
│   ├── 📄 REPOSITORY_STRUCTURE.md        # 이 파일 - 프로젝트 구조 설명
│   └── 📄 PRIVATE_NPM_PACKAGE.md         # Lambda 공통 패키지 가이드 (한/영)
│
├── 📁 lib/                               # CDK 스택 및 구성 요소
│   ├── 📁 stacks/                        # CDK 스택 정의
│   │   ├── 📄 vpc-stack.ts               # VPC 인프라 스택
│   │   ├── 📄 iam-stack.ts               # IAM 역할 및 정책 스택
│   │   ├── 📄 security-group-stack.ts    # 보안 그룹 스택
│   │   ├── 📄 database-stack.ts          # Aurora Serverless v2 스택
│   │   ├── 📄 lambda-stack.ts            # Lambda 함수 스택
│   │   ├── 📄 api-gateway-stack.ts       # API Gateway 스택
│   │   ├── 📄 s3-stack.ts                # S3 버킷 스택
│   │   └── 📄 ec2-stack.ts               # EC2 (NAT/Bastion) 스택
│   │
│   ├── 📁 constructs/                    # 재사용 가능한 CDK 구성 요소
│   │   ├── 📄 lambda-construct.ts        # Lambda 함수 구성 요소
│   │   ├── 📄 vpc-construct.ts           # VPC 구성 요소
│   │   ├── 📄 database-construct.ts      # 데이터베이스 구성 요소
│   │   └── 📄 security-construct.ts      # 보안 관련 구성 요소
│   │
│   ├── 📁 utils/                         # 유틸리티 함수 및 헬퍼
│   │   ├── 📄 environment.ts             # 환경 설정 관리
│   │   ├── 📄 constants.ts               # 상수 정의
│   │   ├── 📄 tags.ts                    # 태깅 전략 구현
│   │   └── 📄 naming.ts                  # 리소스 네이밍 컨벤션
│   │
│   └── 📁 config/                        # 환경별 설정
│       ├── 📄 dev.ts                     # 개발 환경 설정
│       ├── 📄 prod.ts                    # 운영 환경 설정
│       └── 📄 common.ts                  # 공통 설정
├── 📁 packages/                          # 공통 패키지
│   └── 📁 lambda-common/                 # Lambda 공통 라이브러리 패키지
│       ├── 📄 package.json               # 패키지 설정 및 의존성
│       ├── 📄 package-lock.json          # 의존성 락 파일
│       ├── 📄 tsconfig.json              # TypeScript 컴파일러 설정
│       ├── 📄 .eslintrc.js               # ESLint 설정
│       ├── 📄 .gitignore                 # Git 제외 파일
│       ├── 📄 README.md                  # 패키지 사용법
│       ├── 📁 dist/                      # 빌드 결과물 (TypeScript 컴파일 후)
│       ├── 📁 node_modules/              # 의존성 모듈
│       └── 📁 src/                       # 소스 코드
│           ├── 📄 index.ts               # 패키지 진입점 (모든 export)
│           ├── 📁 constant/              # 공통 상수 정의
│           │   ├── 📄 common-code.constant.ts    # 공통 코드 상수
│           │   ├── 📄 error-info.constant.ts     # 에러 정보 상수
│           │   ├── 📄 http-status.constant.ts    # HTTP 상태 코드 상수
│           │   ├── 📄 success-info.constant.ts   # 성공 정보 상수
│           │   └── 📄 table-code.constant.ts     # 테이블 코드 상수
│           ├── 📁 exception/             # 예외 처리
│           │   └── 📄 custom.exception.ts # 커스텀 예외 클래스
│           ├── 📁 interface/             # 공통 인터페이스
│           │   └── 📄 response.types.ts  # 응답 타입 정의
│           └── 📁 service/               # 공통 서비스 클래스
│               ├── 📄 base.service.ts    # 기본 서비스 추상 클래스
│               ├── 📄 base-external.service.ts # 외부 서비스 추상 클래스
│               ├── 📄 database.service.ts # 데이터베이스 서비스 추상 클래스
│               └── 📄 logger.service.ts  # 로깅 서비스 싱글톤 클래스
│
├── 📁 lambda/                            # Lambda 함수 소스 코드
│   └── 📁 functions/                     # 개별 Lambda 함수
│       ├── 📁 auth/                      # 인증 관련 함수 (로그인, 회원가입, 토큰 검증 등)
│       │   ├── 📄 package.json           # 함수별 의존성
│       │   ├── 📄 tsconfig.json          # TypeScript 설정
│       │   ├── 📁 node_modules/          # 의존성
│       │   └── 📁 src/
│       │       ├── 📄 lambda.ts          # Lambda 진입점 (컨트롤러 역할)
│       │       ├── 📁 dto/               # 데이터 전송 객체
│       │       │   ├── 📄 login.dto.ts   # 로그인 요청/응답 DTO
│       │       │   ├── 📄 register.dto.ts # 회원가입 요청/응답 DTO
│       │       │   └── 📄 token.dto.ts   # 토큰 관련 DTO
│       │       ├── 📁 interface/         # 인터페이스 정의
│       │       │   ├── 📄 auth.interface.ts # 인증 관련 인터페이스
│       │       │   └── 📄 user.interface.ts # 사용자 관련 인터페이스
│       │       ├── 📁 service/           # 비즈니스 로직 처리 서비스 클래스 (싱글톤)
│       │       │   ├── 📄 auth.service.ts # 인증 서비스
│       │       │   ├── 📄 token.service.ts # 토큰 서비스
│       │       │   └── 📄 validation.service.ts # 입력 검증 서비스
│       │       └── 📁 constant/          # 상수 정의 (에러 및 응답)
│       │           ├── 📄 error.constant.ts # 에러 메시지 상수
│       │           └── 📄 response.constant.ts # 응답 메시지 상수
│       │
│       ├── 📁 user/                      # 사용자 관리 함수 (프로필, 계정 관리 등)
│       │   ├── 📄 package.json
│       │   ├── 📄 tsconfig.json
│       │   ├── 📁 node_modules/          # 의존성
│       │   └── 📁 src/
│       │       ├── 📄 lambda.ts          # Lambda 진입점 (컨트롤러 역할)
│       │       ├── 📁 dto/               # 데이터 전송 객체
│       │       │   ├── 📄 profile.dto.ts # 프로필 관련 DTO
│       │       │   ├── 📄 update.dto.ts  # 업데이트 관련 DTO
│       │       │   └── 📄 delete.dto.ts  # 삭제 관련 DTO
│       │       ├── 📁 interface/         # 인터페이스 정의
│       │       │   ├── 📄 user.interface.ts # 사용자 관련 인터페이스
│       │       │   └── 📄 profile.interface.ts # 프로필 관련 인터페이스
│       │       ├── 📁 service/           # 비즈니스 로직 처리 서비스 클래스 (싱글톤)
│       │       │   ├── 📄 user.service.ts # 사용자 서비스
│       │       │   ├── 📄 profile.service.ts # 프로필 서비스
│       │       │   └── 📄 validation.service.ts # 입력 검증 서비스
│       │       └── 📁 constant/          # 상수 정의 (에러 및 응답)
│       │           ├── 📄 error.constant.ts # 에러 메시지 상수
│       │           └── 📄 response.constant.ts # 응답 메시지 상수
│       └── 📁 health-check/              # 헬스 체크 함수 (시스템 상태 확인)
│           ├── 📄 package.json           # 함수별 의존성 (@hun_meta/lambda-common 포함)
│           ├── 📄 package-lock.json      # 의존성 락 파일
│           ├── 📄 tsconfig.json          # TypeScript 설정
│           ├── 📄 .gitignore             # Git 제외 파일
│           ├── 📁 node_modules/          # 의존성 모듈
│           └── 📁 src/                   # 소스 코드
│               ├── 📄 lambda.ts          # Lambda 진입점 (컨트롤러 역할) - 미구현
│               ├── 📁 dto/               # 데이터 전송 객체
│               │   ├── 📄 health-check-request.dto.ts  # 헬스 체크 요청 DTO
│               │   └── 📄 health-check-response.dto.ts # 헬스 체크 응답 DTO
│               ├── 📁 interface/         # 인터페이스 정의
│               ├── 📁 service/           # 비즈니스 로직 처리 서비스 클래스 (싱글톤)
│               │   └── 📄 health-check.service.ts # 헬스 체크 서비스
│               └── 📁 constant/          # 상수 정의 (에러 및 응답)
│                   ├── 📄 error-info.constant.ts # 에러 정보 상수
│                   └── 📄 service-code.constant.ts # 서비스 코드 상수
│
├── 📁 scripts/                           # 배포 및 관리 스크립트
│   ├── 📄 deploy-dev.sh                  # 개발 환경 배포 스크립트
│   ├── 📄 deploy-prod.sh                 # 운영 환경 배포 스크립트
│   ├── 📄 destroy-env.sh                 # 환경 제거 스크립트
│   └── 📄 setup.sh                       # 초기 설정 스크립트
│
├── 📁 tests/                             # 테스트 파일
│   ├── 📁 unit/                          # 단위 테스트
│   │   ├── 📄 vpc-stack.test.ts          # VPC 스택 테스트
│   │   ├── 📄 lambda-stack.test.ts       # Lambda 스택 테스트
│   │   └── 📄 database-stack.test.ts     # 데이터베이스 스택 테스트
│   │
│   ├── 📁 integration/                   # 통합 테스트
│   │   ├── 📄 api-gateway.test.ts        # API Gateway 테스트
│   │   └── 📄 database-connection.test.ts # DB 연결 테스트
│   │
│   └── 📁 fixtures/                      # 테스트 픽스처
│       ├── 📄 sample-data.json           # 샘플 데이터
│       └── 📄 mock-responses.json        # 모의 응답
│
└── 📁 .github/                           # GitHub 관련 설정
    ├── 📁 workflows/                     # GitHub Actions
    │   ├── 📄 ci.yml                     # CI 파이프라인
    │   ├── 📄 deploy-dev.yml             # 개발 환경 배포
    │   └── 📄 deploy-prod.yml            # 운영 환경 배포
    │
    └── 📄 PULL_REQUEST_TEMPLATE.md       # PR 템플릿
```

## 📋 주요 디렉토리 설명

### 🔧 `/bin` - CDK 앱 진입점
- **`cdk-prj.ts`**: CDK 앱의 메인 파일로, 모든 스택을 초기화하고 환경별 설정을 적용
### 📚 `/docs` - 프로젝트 문서
- **`COMMIT_CONVENTION.md`**: 커밋 메시지 작성 규칙 (한/영)
- **`REPOSITORY_STRUCTURE.md`**: 프로젝트 구조 설명 문서
- **`PRIVATE_NPM_PACKAGE.md`**: Lambda 공통 패키지 사용 가이드 (한/영)

### 🏗️ `/lib` - CDK 인프라 코드
- **`/stacks`**: 각 AWS 서비스별로 분리된 CDK 스택 정의
- **`/constructs`**: 재사용 가능한 CDK 구성 요소
- **`/utils`**: 공통 유틸리티 함수 및 헬퍼
- **`/config`**: 환경별 설정 파일
### 📦 `/packages` - 공통 패키지
- **`/lambda-common`**: 모든 Lambda 함수에서 공유하는 라이브러리 패키지
  - **NPM 패키지 형태**: `@hun_meta/lambda-common`으로 발행됨
  - **로컬 파일 경로 참조**: `file:../../../packages/lambda-common`
  - **TypeScript 빌드**: `src/` → `dist/` 컴파일
  - **모듈화된 구조**: constant, exception, interface, service 분리
  - **중앙 집중식 공통 코드 관리**: 에러 코드, 서비스 클래스, 타입 정의

### ⚡ `/lambda` - Lambda 함수 소스 코드
- **`/common`**: 모든 Lambda 함수에서 공유하는 라이브러리
- **`/functions`**: API 기능별로 분리된 Lambda 함수들
  - 각 함수는 독립적인 `package.json`과 `tsconfig.json` 보유
    - 기능별 디렉토리 구조 (auth, user, health-check)
  - **MVC 패턴 적용**: 각 함수는 하나의 `lambda.ts` 파일(컨트롤러)에서 시작
  - **계층화 구조**: DTO, Interface, Service, Constant 분리
  - **하나의 Lambda 함수가 최대 10개의 API 엔드포인트 처리**
  - **공통 패키지 의존성**: `@hun_meta/lambda-common` 패키지 사용

### 🚀 `/scripts` - 배포 및 관리 스크립트 (미구현)
- 환경별 배포 자동화 스크립트
- 설정 및 관리 스크립트

### 🧪 `/tests` - 테스트 코드
- **`/unit`**: CDK 스택별 단위 테스트
- **`/integration`**: 서비스 간 통합 테스트
- **`/fixtures`**: 테스트용 샘플 데이터

## 🔑 핵심 파일 설명

### 📄 루트 설정 파일
- **`cdk.json`**: CDK 앱 설정, 환경별 컨텍스트, 부트스트랩 설정
- **`package.json`**: 프로젝트 의존성, NPM 스크립트, 메타데이터
- **`tsconfig.json`**: TypeScript 컴파일러 설정
- **`README.md`**: 프로젝트 개요 및 사용법 (한/영)
- **`LICENSE`**: MIT 라이선스
- **`.gitignore`**: Git 버전 관리 제외 파일

### 📦 Lambda Common 패키지 주요 파일
- **`packages/lambda-common/src/index.ts`**: 패키지 진입점, 모든 export 정의
- **`packages/lambda-common/package.json`**: 패키지 설정, NPM 발행 설정
- **`packages/lambda-common/dist/`**: TypeScript 컴파일 결과물

---

## 🇺🇸 English {#english}

### Overview

This document describes the directory structure and purpose of each file in the AWS CDK serverless backend infrastructure project.

### 📁 Key Directory Structure

```
cdk-prj/
├── 📁 lambda/functions/                  # Individual Lambda functions
│   ├── 📁 auth/                          # Authentication functions (login, register, token verification, etc.)
│   │   ├── 📄 package.json               # Function-specific dependencies
│   │   ├── 📄 tsconfig.json              # TypeScript configuration
│   │   └── 📁 src/
│   │       ├── 📄 lambda.ts              # Lambda entry point (controller role)
│   │       ├── 📁 dto/                   # Data transfer objects
│   │       ├── 📁 interface/             # Interface definitions
│   │       ├── 📁 service/               # Business logic service classes (singleton)
│   │       └── 📁 constant/              # Constants (error and response messages)
│   └── 📁 user/                          # User management functions
│       └── 📁 src/
│           ├── 📄 lambda.ts              # Lambda entry point (controller role)
│           ├── 📁 dto/                   # Data transfer objects
│           ├── 📁 interface/             # Interface definitions
│           ├── 📁 service/               # Business logic service classes (singleton)
│           └── 📁 constant/              # Constants (error and response messages)
```

### 🔧 Lambda Function Architecture

#### MVC Pattern Implementation
- **Controller (lambda.ts)**: Entry point handling routing for up to 10 API endpoints
- **Service Layer**: Business logic with singleton pattern
- **DTO**: Data transfer objects for type-safe communication
- **Interface**: Type definitions for data structures
- **Constants**: Error messages and response constants

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
- Common libraries (`/common`) utilization
- Standardized DTOs and interfaces
- Consistent error handling and response formats

#### 4. **Testability**
- Independent testing for each layer
- Easy unit testing for service layer
- Isolated testing with mock objects

This structure satisfies the requirements of `cdk_request_template.md` and includes all components of a serverless backend architecture, designed with consideration for development/production environment separation, zero-downtime deployment, and maintainability.