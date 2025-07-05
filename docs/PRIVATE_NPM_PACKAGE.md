# Lambda Common Package Guide / Lambda 공통 패키지 가이드

[🇰🇷 한국어](#korean) | [🇺🇸 English](#english)

---

## 🇰🇷 한국어 {#korean}

### 개요

이 문서는 Lambda 함수들에서 공통으로 사용하는 코드를 로컬 패키지로 분리하고, 각 Lambda 프로젝트에서 참조하는 방법을 설명합니다. 현재 프로젝트에서는 로컬 파일 경로를 사용하여 공통 패키지를 참조하는 방식을 채택했습니다.

### 🎯 목표

- `lambda/common` 디렉토리를 독립적인 로컬 패키지로 분리
- 각 Lambda 함수에서 로컬 파일 경로를 통해 공통 코드 참조
- 개발 환경에서 실시간 변경사항 반영
- 진정한 모듈화 및 재사용성 확보

## 📋 단계별 가이드

### Step 1: 로컬 공통 패키지 생성

#### 1.1 패키지 디렉토리 생성

```bash
# 프로젝트 루트에서 실행
mkdir packages
cd packages
mkdir lambda-common
cd lambda-common
```

#### 1.2 package.json 초기화

```bash
npm init -y
```

**생성된 `package.json` 수정:**

```json
{
  "name": "@hun_meta/lambda-common",
  "version": "0.0.1",
  "description": "Common utilities and services for Lambda functions",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "clean": "rimraf dist",
    "prepublishOnly": "npm run clean && npm run build",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  },
  "keywords": ["lambda", "aws", "common", "utilities"],
  "author": "Hun <hun.kim.dev@gmail.com>",
  "license": "MIT",
  "private": false,
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "rimraf": "^5.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "files": [
    "dist/**/*",
    "README.md"
  ]
}
```

#### 1.3 TypeScript 설정

**`tsconfig.json` 생성:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### 1.4 소스 코드 구성

```bash
# src 디렉토리 생성
mkdir src

# 공통 코드 파일들을 src 디렉토리에 구성
# 실제 프로젝트에서는 이미 완료된 상태
```

#### 1.5 진입점 파일 생성

**`src/index.ts` 생성:**

```typescript
// Error handling
export * from './exception/custom.exception';

// Base services
export * from './service/base.service';
export * from './service/base-external.service';
export * from './service/database.service';
export * from './service/logger.service';

// Types and interfaces
export * from './interface/response.types';

// Constants
export * from './constant/common-code.constant';
export * from './constant/error-info.constant';
export * from './constant/http-status.constant';
export * from './constant/success-info.constant';
export * from './constant/table-code.constant';

// Default exports
export { default as Logger } from './service/logger.service';
```

### Step 2: 로컬 패키지 빌드

#### 2.1 의존성 설치 및 빌드

```bash
# packages/lambda-common 디렉토리에서 실행
npm install
npm run build
```

#### 2.2 빌드 결과 확인

```bash
# dist 디렉토리가 생성되고 컴파일된 파일들이 있는지 확인
ls -la dist/
```

### Step 3: Lambda 함수에서 로컬 패키지 사용

#### 3.1 로컬 파일 경로로 패키지 추가

각 Lambda 함수의 `package.json`에 로컬 패키지 참조를 추가합니다:

**예시: `lambda/functions/health-check/package.json`**

```json
{
  "name": "health-check",
  "version": "1.0.0",
  "description": "",
  "license": "ISC",
  "author": "",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "devDependencies": {
    "class-validator": "^0.14.2"
  },
  "dependencies": {
    "@hun_meta/lambda-common": "file:../../../packages/lambda-common"
  }
}
```

#### 3.2 패키지 설치

```bash
# 각 Lambda 함수 디렉토리에서 실행
cd lambda/functions/health-check
npm install
```

#### 3.3 Import 문 사용

**로컬 패키지 사용 예시:**
```typescript
// lambda/functions/health-check/src/constant/error-info.constant.ts
import { ResponseInfo } from '@hun_meta/lambda-common/interface/response.types';
import { NOT_FOUND } from '@hun_meta/lambda-common/constant/http-status.constant';
import { COMMON_ACTION_CODES } from '@hun_meta/lambda-common/constant/common-code.constant';

export const DATE_NOT_FOUND: ResponseInfo = {
    status: NOT_FOUND,
    returnCode: COMMON_ACTION_CODES.NOT_FOUND,
    message: 'Input Date Not Found',
}
```

**또는 전체 패키지에서 import:**
```typescript
import { BaseService, CustomException, ResponseInfo } from "@hun_meta/lambda-common";
```

### Step 4: 개발 워크플로우

#### 4.1 공통 패키지 수정 시

```bash
# packages/lambda-common에서 코드 수정 후
cd packages/lambda-common
npm run build

# 변경사항이 자동으로 Lambda 함수에 반영됨 (로컬 파일 경로 사용)
```

#### 4.2 실시간 개발

```bash
# 자동 빌드 모드로 실행
cd packages/lambda-common
npm run build:watch

# 코드 변경 시 자동으로 빌드되어 Lambda 함수에서 즉시 사용 가능
```

## 🔧 고급 설정

### NPM 패키지 배포 (선택사항)

로컬 파일 경로 사용 외에도 NPM 레지스트리에 패키지를 배포할 수 있습니다:

#### NPM 배포

```bash
# packages/lambda-common 디렉토리에서 실행
npm publish
```

#### GitHub Packages 사용

**`package.json`에 repository 정보 추가:**

```json
{
  "name": "@hun_meta/lambda-common",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/hun/cdk-prj.git"
  },
  "publishConfig": {
    "@hun_meta:registry": "https://npm.pkg.github.com"
  }
}
```

### 자동화 스크립트

#### 일괄 빌드 스크립트

**`scripts/build-common.sh` 생성:**

```bash
#!/bin/bash

# Common 패키지 빌드
cd packages/lambda-common
echo "Building lambda-common package..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Lambda-common package built successfully"
else
    echo "❌ Failed to build lambda-common package"
    exit 1
fi

echo "📦 All Lambda functions can now use the updated common package"
```

### 개발 워크플로우

#### 1. 로컬 개발 시

```bash
# Common 패키지에서 변경사항 발생 시
cd packages/lambda-common
npm run build:watch  # 자동 빌드

# 다른 터미널에서 Lambda 함수 테스트
cd lambda/functions/health-check
npm run dev
```

#### 2. CI/CD 파이프라인

**`.github/workflows/build-common.yml`:**

```yaml
name: Build Common Package

on:
  push:
    paths:
      - 'packages/lambda-common/**'
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd packages/lambda-common
          npm ci
          
      - name: Build
        run: |
          cd packages/lambda-common
          npm run build
          
      - name: Test
        run: |
          cd packages/lambda-common
          npm run test
```

## 🎯 장점

### 1. **실시간 개발**
- 로컬 파일 경로 사용으로 변경사항 즉시 반영
- 별도의 배포 과정 없이 개발 가능
- 빠른 반복 개발 지원

### 2. **진정한 모듈화**
- 각 Lambda 함수가 독립적으로 배포 가능
- 명확한 의존성 관리
- 표준화된 공통 로직

### 3. **유지보수성**
- 중앙 집중식 공통 코드 관리
- 단일 소스 코드 관리
- 일관된 코드 품질 유지

### 4. **개발 효율성**
- 복잡한 상대 경로 import 제거
- IDE 자동완성 및 타입 체크 지원
- 코드 리팩토링 용이성

## ⚠️ 주의사항

### 1. **빌드 의존성**
- 공통 패키지 빌드 후 Lambda 함수 사용
- TypeScript 컴파일 순서 고려 필요

### 2. **배포 시 고려사항**
- AWS Lambda 배포 시 로컬 경로 문제 발생 가능
- 번들링 도구 (esbuild, webpack) 사용 권장

### 3. **프로젝트 구조**
- 상대 경로 변경 시 package.json 수정 필요
- 팀 협업 시 동일한 프로젝트 구조 유지 필요

---

## 🇺🇸 English {#english}

### Overview

This document explains how to separate commonly used code in Lambda functions into a local package and reference it from each Lambda project. The current project adopts a method of referencing common packages using local file paths.

### 🎯 Goals

- Separate `lambda/common` directory into an independent local package
- Reference common code through local file paths from each Lambda function
- Real-time reflection of changes in development environment
- Achieve true modularity and reusability

## 📋 Step-by-Step Guide

### Step 1: Create Local Common Package

#### 1.1 Create Package Directory

```bash
# Execute from project root
mkdir packages
cd packages
mkdir lambda-common
cd lambda-common
```

#### 1.2 Initialize package.json

```bash
npm init -y
```

**Edit the generated `package.json`:**

```json
{
  "name": "@hun_meta/lambda-common",
  "version": "0.0.1",
  "description": "Common utilities and services for Lambda functions",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "clean": "rimraf dist",
    "prepublishOnly": "npm run clean && npm run build",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  },
  "keywords": ["lambda", "aws", "common", "utilities"],
  "author": "Hun <hun.kim.dev@gmail.com>",
  "license": "MIT",
  "private": false,
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "rimraf": "^5.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "files": [
    "dist/**/*",
    "README.md"
  ]
}
```

#### 1.3 TypeScript Configuration

**Create `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### 1.4 Organize Source Code

```bash
# Create src directory
mkdir src

# Organize common code files in src directory
# Already completed in the actual project
```

#### 1.5 Create Entry Point File

**Create `src/index.ts`:**

```typescript
// Error handling
export * from './exception/custom.exception';

// Base services
export * from './service/base.service';
export * from './service/base-external.service';
export * from './service/database.service';
export * from './service/logger.service';

// Types and interfaces
export * from './interface/response.types';

// Constants
export * from './constant/common-code.constant';
export * from './constant/error-info.constant';
export * from './constant/http-status.constant';
export * from './constant/success-info.constant';
export * from './constant/table-code.constant';

// Default exports
export { default as Logger } from './service/logger.service';
```

### Step 2: Build Local Package

#### 2.1 Install Dependencies and Build

```bash
# Execute in packages/lambda-common directory
npm install
npm run build
```

#### 2.2 Verify Build Results

```bash
# Check if dist directory is created with compiled files
ls -la dist/
```

### Step 3: Use Local Package in Lambda Functions

#### 3.1 Add Package with Local File Path

Add local package reference to each Lambda function's `package.json`:

**Example: `lambda/functions/health-check/package.json`**

```json
{
  "name": "health-check",
  "version": "1.0.0",
  "description": "",
  "license": "ISC",
  "author": "",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "devDependencies": {
    "class-validator": "^0.14.2"
  },
  "dependencies": {
    "@hun_meta/lambda-common": "file:../../../packages/lambda-common"
  }
}
```

#### 3.2 Install Package

```bash
# Execute in each Lambda function directory
cd lambda/functions/health-check
npm install
```

#### 3.3 Use Import Statements

**Local package usage example:**
```typescript
// lambda/functions/health-check/src/constant/error-info.constant.ts
import { ResponseInfo } from '@hun_meta/lambda-common/interface/response.types';
import { NOT_FOUND } from '@hun_meta/lambda-common/constant/http-status.constant';
import { COMMON_ACTION_CODES } from '@hun_meta/lambda-common/constant/common-code.constant';

export const DATE_NOT_FOUND: ResponseInfo = {
    status: NOT_FOUND,
    returnCode: COMMON_ACTION_CODES.NOT_FOUND,
    message: 'Input Date Not Found',
}
```

**Or import from entire package:**
```typescript
import { BaseService, CustomException, ResponseInfo } from "@hun_meta/lambda-common";
```

### Step 4: Development Workflow

#### 4.1 When Modifying Common Package

```bash
# After modifying code in packages/lambda-common
cd packages/lambda-common
npm run build

# Changes are automatically reflected in Lambda functions (using local file path)
```

#### 4.2 Real-time Development

```bash
# Run in auto-build mode
cd packages/lambda-common
npm run build:watch

# Code changes are automatically built and immediately available in Lambda functions
```

## 🔧 Advanced Configuration

### Using Private Registry (Optional)

#### NPM Private Registry

```bash
# Create .npmrc file
echo "@your-username:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc
```

#### Using GitHub Packages

**Add repository info to `package.json`:**

```json
{
  "name": "@your-username/lambda-common",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-username/your-repo.git"
  },
  "publishConfig": {
    "@your-username:registry": "https://npm.pkg.github.com"
  }
}
```

### Automation Scripts

#### Batch Update Script

**Create `scripts/update-common.sh`:**

```bash
#!/bin/bash

# Build and deploy common package
cd packages/lambda-common
npm run build
npm version patch
npm publish

# Get new version info
NEW_VERSION=$(node -p "require('./package.json').version")

# Update all Lambda functions
LAMBDA_FUNCTIONS=("auth" "user" "health-check" "scheduler")

for func in "${LAMBDA_FUNCTIONS[@]}"; do
    echo "Updating $func..."
    cd "../../lambda/functions/$func"
    npm install "@your-username/lambda-common@$NEW_VERSION"
    cd "../../../packages/lambda-common"
done

echo "All Lambda functions updated to version $NEW_VERSION"
```

### Development Workflow

#### 1. Local Development

```bash
# When changes occur in common package
cd packages/lambda-common
npm run build:watch  # Auto build

# Test Lambda function in another terminal
cd lambda/functions/auth
npm run dev
```

#### 2. CI/CD Pipeline

**`.github/workflows/deploy-common.yml`:**

```yaml
name: Deploy Common Package

on:
  push:
    paths:
      - 'packages/lambda-common/**'
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Install dependencies
        run: |
          cd packages/lambda-common
          npm ci
          
      - name: Build
        run: |
          cd packages/lambda-common
          npm run build
          
      - name: Publish
        run: |
          cd packages/lambda-common
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 🎯 Benefits

### 1. **Real-time Development**
- Immediate reflection of changes using local file paths
- Development possible without separate deployment process
- Fast iterative development support

### 2. **True Modularity**
- Each Lambda function can be deployed independently
- Clear dependency management
- Standardized common logic

### 3. **Maintainability**
- Centralized common code management
- Single source code management
- Consistent code quality maintenance

### 4. **Development Efficiency**
- Elimination of complex relative path imports
- IDE auto-completion and type checking support
- Easy code refactoring

## ⚠️ Precautions

### 1. **Build Dependencies**
- Use Lambda functions after building common package
- Consider TypeScript compilation order

### 2. **Deployment Considerations**
- Local path issues may occur during AWS Lambda deployment
- Recommend using bundling tools (esbuild, webpack)

### 3. **Project Structure**
- Need to modify package.json when relative paths change
- Maintain same project structure for team collaboration 