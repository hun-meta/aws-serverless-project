# 프로젝트 구조 (Repository Structure)

이 문서는 AWS CDK 서버리스 백엔드 인프라 프로젝트의 디렉토리 구조와 각 파일의 목적을 설명합니다.

## 📁 전체 디렉토리 구조

```
cdk-prj/
├── 📄 README.md                           # 프로젝트 개요 및 사용법 (한/영)
├── 📄 LICENSE                             # MIT 라이선스
├── 📄 COMMIT_CONVENTION.md                # 커밋 메시지 컨벤션 (한/영)
├── 📄 REPOSITORY_STRUCTURE.md             # 이 파일 - 프로젝트 구조 설명
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
│
├── 📁 lambda/                            # Lambda 함수 소스 코드
│   ├── 📁 common/                        # 공통 라이브러리 및 유틸리티
│   │   ├── 📄 types.ts                   # 공통 타입 정의
│   │   ├── 📄 database.ts                # 데이터베이스 연결 관리
│   │   ├── 📄 response.ts                # API 응답 포맷터
│   │   └── 📄 middleware.ts              # 공통 미들웨어
│   │
│   └── 📁 functions/                     # 개별 Lambda 함수
│       ├── 📁 auth/                      # 인증 관련 함수
│       │   ├── 📄 package.json           # 함수별 의존성
│       │   ├── 📄 tsconfig.json          # TypeScript 설정
│       │   └── 📁 src/
│       │       ├── 📄 login.ts           # 로그인 함수
│       │       ├── 📄 register.ts        # 회원가입 함수
│       │       └── 📄 authorizer.ts      # API Gateway 권한 부여자
│       │
│       ├── 📁 user/                      # 사용자 관리 함수
│       │   ├── 📄 package.json
│       │   ├── 📄 tsconfig.json
│       │   └── 📁 src/
│       │       ├── 📄 get-profile.ts     # 프로필 조회
│       │       ├── 📄 update-profile.ts  # 프로필 업데이트
│       │       └── 📄 delete-user.ts     # 사용자 삭제
│       │
│       ├── 📁 file/                      # 파일 관리 함수
│       │   ├── 📄 package.json
│       │   ├── 📄 tsconfig.json
│       │   └── 📁 src/
│       │       ├── 📄 upload.ts          # 파일 업로드
│       │       ├── 📄 download.ts        # 파일 다운로드
│       │       └── 📄 image-resize.ts    # 이미지 리사이징
│       │
│       └── 📁 scheduler/                 # 스케줄러 함수
│           ├── 📄 package.json
│           ├── 📄 tsconfig.json
│           └── 📁 src/
│               ├── 📄 cleanup.ts         # 정리 작업
│               └── 📄 backup.ts          # 백업 작업
│
├── 📁 scripts/                           # 배포 및 관리 스크립트
│   ├── 📄 deploy-dev.sh                  # 개발 환경 배포 스크립트
│   ├── 📄 deploy-prod.sh                 # 운영 환경 배포 스크립트
│   ├── 📄 destroy-env.sh                 # 환경 제거 스크립트
│   └── 📄 setup.sh                       # 초기 설정 스크립트
│
├── 📁 docs/                              # 추가 문서
│   ├── 📄 ARCHITECTURE.md                # 아키텍처 상세 설명
│   ├── 📄 DEPLOYMENT.md                  # 배포 가이드
│   ├── 📄 TROUBLESHOOTING.md             # 문제 해결 가이드
│   └── 📄 API.md                         # API 문서
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

### 🏗️ `/lib` - CDK 인프라 코드
- **`/stacks`**: 각 AWS 서비스별로 분리된 CDK 스택 정의
- **`/constructs`**: 재사용 가능한 CDK 구성 요소
- **`/utils`**: 공통 유틸리티 함수 및 헬퍼
- **`/config`**: 환경별 설정 파일

### ⚡ `/lambda` - Lambda 함수 소스 코드
- **`/common`**: 모든 Lambda 함수에서 공유하는 라이브러리
- **`/functions`**: API 기능별로 분리된 Lambda 함수들
  - 각 함수는 독립적인 `package.json`과 `tsconfig.json` 보유
  - 기능별 디렉토리 구조 (auth, user, file, scheduler)

### 🚀 `/scripts` - 배포 및 관리 스크립트
- 환경별 배포 자동화 스크립트
- 설정 및 관리 스크립트

### 📚 `/docs` - 프로젝트 문서
- 상세한 아키텍처 설명
- 배포 가이드 및 문제 해결 가이드
- API 문서

### 🧪 `/tests` - 테스트 코드
- **`/unit`**: CDK 스택별 단위 테스트
- **`/integration`**: 서비스 간 통합 테스트
- **`/fixtures`**: 테스트용 샘플 데이터

## 🔑 핵심 파일 설명

### 📄 루트 설정 파일
- **`cdk.json`**: CDK 앱 설정, 환경별 컨텍스트, 부트스트랩 설정
- **`package.json`**: 프로젝트 의존성, NPM 스크립트, 메타데이터
- **`tsconfig.json`**: TypeScript 컴파일러 설정

### 🏷️ 환경별 구성
```json
// cdk.json 예시
{
  "app": "npx ts-node --prefer-ts-exts bin/cdk-prj.ts",
  "context": {
    "environments": {
      "dev": {
        "account": "123456789012",
        "region": "ap-northeast-2",
        "vpcCidr": "10.0.0.0/16"
      },
      "prod": {
        "account": "123456789013", 
        "region": "ap-northeast-2",
        "vpcCidr": "10.1.0.0/16"
      }
    }
  }
}
```

## 🏗️ 스택별 상세 구조

### VPC Stack (`vpc-stack.ts`)
```typescript
// VPC 구성 요소
- VPC (CIDR: 개발 10.0.0.0/16, 운영 10.1.0.0/16)
- Public Subnets (2개 AZ)
- Private Subnets (2개 AZ) 
- Database Subnets (2개 AZ)
- Internet Gateway
- NAT Gateway (운영) / NAT Instance (개발)
- Route Tables
```

### IAM Stack (`iam-stack.ts`)
```typescript
// IAM 역할 및 정책
- CustomLambdaLoggingRole
- CustomApiGatewayLogRole  
- CustomLambdaEdgeS3
- CustomLambdaCommon
- CustomSchedulerLambdaExecutionRole
```

### Security Group Stack (`security-group-stack.ts`)
```typescript
// 보안 그룹
- dev/prod-lambda-outbound-group
- dev/prod-public-ssh-group
- dev/prod-bastion-outbound-group
- dev/prod-nat-group
- dev/prod-db-ssh-group
- dev/prod-db-private-group
```

### Database Stack (`database-stack.ts`)
```typescript
// Aurora Serverless v2
- Cluster Configuration
- Subnet Groups
- Parameter Groups
- Security Groups
- ACU 설정 (개발: 0-0.5, 운영: 0.5-4)
```

### Lambda Stack (`lambda-stack.ts`)
```typescript
// Lambda 함수들
- Authentication Functions
- User Management Functions  
- File Processing Functions
- Scheduled Functions
- API Gateway Integration
```

## 🚀 배포 명령어

```bash
# 전체 스택 목록 확인
cdk ls

# 개발 환경 배포
cdk deploy --context env=dev --all

# 운영 환경 배포  
cdk deploy --context env=prod --all

# 특정 스택만 배포
cdk deploy VpcStack --context env=dev

# 차이점 확인
cdk diff --context env=dev
```

## 🏷️ 네이밍 컨벤션

### 스택 네이밍
- **형식**: `{Environment}{Service}Stack`
- **예시**: `DevVpcStack`, `ProdLambdaStack`

### 리소스 네이밍  
- **형식**: `{environment}-{service}-{purpose}-{type}`
- **예시**: `dev-lambda-outbound-group`, `prod-aurora-cluster`

### Lambda 함수 네이밍
- **형식**: `{environment}-{domain}-{action}`
- **예시**: `dev-auth-login`, `prod-user-getProfile`

## 🔄 환경별 배포 전략

### 개발 환경 (Development)
- **목적**: 기능 개발 및 테스트
- **비용 최적화**: NAT Instance, 최소 ACU
- **보안**: 개발팀 IP만 SSH 접근 허용

### 운영 환경 (Production)  
- **목적**: 실제 서비스 운영
- **고가용성**: NAT Gateway, 적절한 ACU 설정
- **보안**: 강화된 보안 그룹 및 네트워크 분리

## 📊 모니터링 및 로깅

### CloudWatch 설정
```typescript
// 각 Lambda 함수별 로그 그룹
- /aws/lambda/{environment}-{function-name}
- 보존 기간: 개발 7일, 운영 30일
- 메트릭 필터 및 알람 설정
```

### X-Ray 트레이싱
```typescript
// 분산 추적 설정
- Lambda 함수 트레이싱 활성화
- API Gateway 트레이싱 연동
- 성능 분석 및 병목 지점 식별
```

이 구조는 `cdk_request_template.md`의 요구사항을 충족하며, 서버리스 백엔드 아키텍처의 모든 구성 요소를 포함하여 개발/운영 환경 분리, 무중단 배포, 그리고 유지보수성을 고려하여 설계되었습니다.