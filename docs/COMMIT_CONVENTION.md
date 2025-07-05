# Commit Message Convention / 커밋 메시지 컨벤션

[🇰🇷 한국어](#korean) | [🇺🇸 English](#english)

---

## 🇰🇷 한국어 {#korean}

### 개요

이 문서는 프로젝트의 일관성 있는 커밋 히스토리를 위한 커밋 메시지 작성 규칙을 정의합니다.

### 📋 기본 구조

```
<type>: <subject>

[body]

[footer]
```

### 🏷️ 타입 (Type) 종류

#### 주요 타입
- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 수정 (README, 주석, 가이드 등)
- **style**: 코드 포맷팅, 세미콜론 누락 등 코드 동작에 영향 없는 스타일 변경
- **refactor**: 코드 리팩토링 (기능 변경 없이 코드 구조 개선)
- **test**: 테스트 코드 추가 또는 수정
- **chore**: 빌드 시스템, 패키지 관리, 환경 설정 등 코드와 직접 관련 없는 작업

#### 추가 타입
- **perf**: 성능 개선
- **ci**: CI/CD 설정 파일 변경 (Jenkins, GitLab CI, GitHub Actions 등)
- **build**: 빌드 관련 파일 변경 (npm, yarn, gradle 등)
- **revert**: 이전 커밋 되돌리기
- **deprecate**: 사용하지 않을 기능 표시

### 📝 작성 규칙

#### 제목 (Subject) 규칙
- **50자 이내**로 작성
- **첫 글자는 소문자**로 시작
- **마침표 사용하지 않음**
- **명령형 동사** 사용 (add, fix, update 등)
- **무엇을 했는지** 간결하게 설명

#### 본문 (Body) 규칙 (선택사항)
- 제목과 본문 사이에 **한 줄 비워두기**
- **72자 이내**로 줄 바꿈
- **왜 변경했는지** 상세히 설명
- **어떤 영향을 미치는지** 설명
- 글머리 기호 사용 가능

#### 푸터 (Footer) 규칙 (선택사항)
- 관련 이슈 번호 참조
- Breaking Change 표시
- 기타 참조 정보

### ✅ 좋은 커밋 메시지 예시

#### 간단한 예시
```
feat: add user authentication feature
fix: resolve database connection error
docs: update README with installation steps
refactor: simplify data fetching logic
```

#### 상세한 예시
```
feat: implement user login functionality

This commit introduces the user login feature, allowing users to
authenticate via username and password.

Key changes include:
- Added login endpoint `/api/v1/auth/login`
- Implemented JWT token generation upon successful authentication
- Integrated with user database for credential verification
- Added input validation for username and password fields

Addresses #45
```

#### CDK 관련 예시
```
feat: add VPC stack with multi-AZ configuration

- Create public, private, and database subnets
- Configure Internet Gateway and NAT Gateway
- Set up route tables for each subnet type
- Add security groups for Lambda and RDS access

Closes #12

fix: resolve Aurora serverless connection timeout

The Lambda functions were timing out when connecting to Aurora
serverless due to VPC configuration issues.

- Updated security group rules for database access
- Modified subnet configuration for Lambda functions
- Added proper IAM permissions for RDS access

Fixes #23
```

### ❌ 피해야 할 커밋 메시지 예시

```
fix bug                    # 너무 모호하고 짧음
stuff                      # 내용 없음
asdfasdf                   # 의미 없음
Changed code               # 무엇을 변경했는지 불명확
Final commit               # 비전문적
Updated files              # 구체적이지 않음
```

### 🔧 실제 적용 예시

#### AWS CDK 프로젝트 커밋 예시
```
feat: add Lambda function for user management API

- Create Lambda function with TypeScript
- Configure API Gateway integration
- Add IAM roles and policies
- Set up environment variables for database connection

chore: update CDK dependencies to latest version

- Update @aws-cdk/core to v2.45.0
- Update @aws-cdk/aws-lambda to v2.45.0
- Fix breaking changes in stack configuration

docs: add deployment guide for production environment

- Add step-by-step deployment instructions
- Include environment variable configuration
- Add troubleshooting section for common issues

fix: resolve security group configuration for RDS access

Lambda functions were unable to connect to Aurora serverless
due to incorrect security group rules.

- Updated inbound rules for database security group
- Added Lambda security group to allowed sources
- Verified connection in both dev and prod environments

Fixes #34
```

### 🎯 권장사항

1. **일관성 유지**: 팀 전체가 동일한 규칙을 따르도록 합니다
2. **의미 있는 커밋**: 하나의 커밋은 하나의 논리적 변경사항을 포함합니다
3. **자주 커밋**: 작은 단위로 자주 커밋하는 것이 좋습니다
4. **리뷰 고려**: 코드 리뷰어가 이해하기 쉽도록 작성합니다

### 🛠️ 도구 활용

#### Conventional Commits 도구
- **commitizen**: 대화형 커밋 메시지 작성 도구
- **conventional-changelog**: 커밋 히스토리 기반 체인지로그 자동 생성
- **commitlint**: 커밋 메시지 린팅 도구

#### 설치 및 설정
```bash
# commitizen 설치
npm install -g commitizen cz-conventional-changelog

# 프로젝트에 설정
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc

# 사용법
git cz  # git commit 대신 사용
```

이러한 규칙을 따르면 프로젝트의 유지보수성, 협업 효율성, 그리고 코드 히스토리의 가치를 크게 높일 수 있습니다.

---

## 🇺🇸 English {#english}

### Overview

This document defines commit message writing rules for consistent commit history in the project.

### 📋 Basic Structure

```
<type>: <subject>

[body]

[footer]
```

### 🏷️ Type Categories

#### Main Types
- **feat**: Add new feature
- **fix**: Fix bug
- **docs**: Documentation updates (README, comments, guides, etc.)
- **style**: Code formatting changes, missing semicolons, etc. (no functional impact)
- **refactor**: Code refactoring (improve code structure without changing functionality)
- **test**: Add or modify test code
- **chore**: Build system, package management, environment setup, etc. (not directly related to code)

#### Additional Types
- **perf**: Performance improvements
- **ci**: CI/CD configuration file changes (Jenkins, GitLab CI, GitHub Actions, etc.)
- **build**: Build-related file changes (npm, yarn, gradle, etc.)
- **revert**: Revert previous commit
- **deprecate**: Mark features as deprecated

### 📝 Writing Rules

#### Subject Rules
- **50 characters or less**
- **Start with lowercase letter**
- **No period at the end**
- Use **imperative mood** (add, fix, update, etc.)
- **Briefly describe what was done**

#### Body Rules (Optional)
- **Leave one blank line** between subject and body
- **Wrap at 72 characters**
- **Explain why** the change was made in detail
- **Explain what impact** it has
- Bullet points are allowed

#### Footer Rules (Optional)
- Reference related issue numbers
- Indicate Breaking Changes
- Other reference information

### ✅ Good Commit Message Examples

#### Simple Examples
```
feat: add user authentication feature
fix: resolve database connection error
docs: update README with installation steps
refactor: simplify data fetching logic
```

#### Detailed Examples
```
feat: implement user login functionality

This commit introduces the user login feature, allowing users to
authenticate via username and password.

Key changes include:
- Added login endpoint `/api/v1/auth/login`
- Implemented JWT token generation upon successful authentication
- Integrated with user database for credential verification
- Added input validation for username and password fields

Addresses #45
```

#### CDK-Related Examples
```
feat: add VPC stack with multi-AZ configuration

- Create public, private, and database subnets
- Configure Internet Gateway and NAT Gateway
- Set up route tables for each subnet type
- Add security groups for Lambda and RDS access

Closes #12

fix: resolve Aurora serverless connection timeout

The Lambda functions were timing out when connecting to Aurora
serverless due to VPC configuration issues.

- Updated security group rules for database access
- Modified subnet configuration for Lambda functions
- Added proper IAM permissions for RDS access

Fixes #23
```

### ❌ Commit Messages to Avoid

```
fix bug                    # Too vague and short
stuff                      # No content
asdfasdf                   # Meaningless
Changed code               # Unclear what was changed
Final commit               # Unprofessional
Updated files              # Not specific
```

### 🔧 Real-World Application Examples

#### AWS CDK Project Commit Examples
```
feat: add Lambda function for user management API

- Create Lambda function with TypeScript
- Configure API Gateway integration
- Add IAM roles and policies
- Set up environment variables for database connection

chore: update CDK dependencies to latest version

- Update @aws-cdk/core to v2.45.0
- Update @aws-cdk/aws-lambda to v2.45.0
- Fix breaking changes in stack configuration

docs: add deployment guide for production environment

- Add step-by-step deployment instructions
- Include environment variable configuration
- Add troubleshooting section for common issues

fix: resolve security group configuration for RDS access

Lambda functions were unable to connect to Aurora serverless
due to incorrect security group rules.

- Updated inbound rules for database security group
- Added Lambda security group to allowed sources
- Verified connection in both dev and prod environments

Fixes #34
```

### 🎯 Best Practices

1. **Maintain consistency**: Ensure the entire team follows the same rules
2. **Meaningful commits**: One commit should contain one logical change
3. **Commit frequently**: It's better to commit small changes frequently
4. **Consider reviewers**: Write so that code reviewers can easily understand

### 🛠️ Tool Usage

#### Conventional Commits Tools
- **commitizen**: Interactive commit message writing tool
- **conventional-changelog**: Automatic changelog generation based on commit history
- **commitlint**: Commit message linting tool

#### Installation and Setup
```bash
# Install commitizen
npm install -g commitizen cz-conventional-changelog

# Configure in project
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc

# Usage
git cz  # Use instead of git commit
```

Following these rules can significantly improve project maintainability, collaboration efficiency, and the value of code history.