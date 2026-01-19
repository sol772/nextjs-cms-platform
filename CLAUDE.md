# Basic Solution Frontend

Next.js 14 기반의 CMS 플랫폼 프론트엔드 프로젝트입니다.

## 프로젝트 개요

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **상태 관리**: Zustand (로컬) + React Query (서버)
- **UI**: Radix UI + Tailwind CSS
- **에디터**: Lexical
- **다국어**: next-intl (ko, en, ja, zh)

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev -- -p 3028

# 빌드
npm run build

# 프로덕션 실행
npm run start
```

## 프로젝트 구조

```
src/
├── app/                # Next.js App Router
│   ├── (user)/        # 사용자 영역
│   └── console/       # 관리자 영역
├── components/        # React 컴포넌트
│   ├── ui/           # 기본 UI 컴포넌트
│   ├── user/         # 사용자 컴포넌트
│   ├── console/      # 관리자 컴포넌트
│   └── editor/       # Lexical 에디터
├── service/          # API 서비스 (React Query hooks)
├── store/            # Zustand 상태 관리
├── hooks/            # Custom React hooks
├── types/            # TypeScript 타입
├── constants/        # 상수
├── utils/            # 유틸리티 함수
└── config/           # 설정 파일
```

## 주요 컨벤션

### 파일 네이밍
- 컴포넌트: PascalCase (`PostDetail.tsx`)
- 훅: camelCase + use 접두사 (`useGetPostList.ts`)
- 유틸리티: camelCase (`dateUtils.ts`)

### API 서비스
- 조회: `useGet[Domain].ts`, `useGet[Domain]List.ts`
- 생성: `usePost[Domain].ts`
- 수정: `usePut[Domain].ts`
- 삭제: `useDel[Domain].ts`

### 컴포넌트 구조
1. "use client" 지시어 (필요시)
2. import 문 (순서: React → 외부 → 내부 → 타입 → 상수)
3. Props 인터페이스
4. 컴포넌트 함수

## Claude Code 커맨드

```bash
# 새 기능 개발 워크플로우
/new-feature [기능 설명]

# API 서비스 추가
/add-api [영역] [도메인] [메서드] [엔드포인트]

# 코드 리뷰
/review [대상]
```

## 사용 가능한 에이전트

- `component-generator`: 컴포넌트 자동 생성
- `api-service-generator`: API 서비스 hook 생성
- `page-generator`: 페이지 자동 생성
- `code-reviewer`: 코드 품질 검토

## 참조 스킬

- `basic-solution-conventions`: 프로젝트 코딩 컨벤션
- `api-service-guide`: API 서비스 작성 가이드
- `component-patterns`: UI 컴포넌트 패턴

## 빌드 명령어

```bash
npm run build          # 프로덕션 빌드
npm run lint           # ESLint 검사
npm run test           # 테스트 실행
npx tsc --noEmit       # TypeScript 타입 체크
```

## 환경 변수

`.env.local` 파일에 다음 변수들을 설정하세요:

```
NEXT_PUBLIC_API_URL=https://api.example.com
```
