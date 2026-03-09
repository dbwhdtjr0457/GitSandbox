# Git Sandbox

Git 동작을 브라우저에서 시각적으로 학습할 수 있는 `Vite + React + TypeScript` 기반 샌드박스입니다.

왼쪽에는 커밋 그래프, 오른쪽에는 에디터와 터미널을 배치해 `branch`, `switch`, `checkout`, `merge`, `revert`, `reset` 같은 흐름을 한 화면에서 확인할 수 있습니다. 머지 충돌이 발생하면 `ConflictResolver` UI로 `OURS / THEIRS / RESULT`를 비교하고 해결할 수 있습니다.

## 주요 기능

- Git 학습용 단일 화면 UI
- 커밋 DAG와 브랜치 포인터 시각화
- Monaco 기반 에디터
- 터미널 명령 실행과 히스토리 탐색
- `ko / en` 로케일 전환 및 저장
- 튜토리얼 모달과 데모 시나리오 카탈로그
- 머지 충돌 해결 UI
- `git merge --abort` 지원
- Vitest + Testing Library + Playwright 테스트 구성

## 지원 명령어

- `help`
- `git init`
- `git commit -m <msg>`
- `git branch <name>`
- `git switch <name>`
- `git switch -c <name>`
- `git checkout <branch|commitId>`
- `git merge <name>`
- `git merge --abort`
- `git revert <commitId>`
- `git reset --hard <commitId>`
- `git status`
- `git log --oneline`

## 현재 구현 동작

- `git init`
  - `main` 브랜치와 symbolic `HEAD`를 생성합니다.
- `git commit -m`
  - 현재 `editorText`를 스냅샷으로 저장합니다.
- `git branch`
  - 현재 `HEAD` 기준으로 브랜치를 생성합니다.
- `git switch` / `git checkout`
  - 브랜치 이동 또는 detached `HEAD` 이동을 지원합니다.
- `git merge`
  - fast-forward, non-fast-forward merge commit, conflict 흐름을 처리합니다.
  - 충돌 시 즉시 merge commit을 만들지 않고, 충돌 해결 후 `git commit`으로 머지 완료합니다.
- `git merge --abort`
  - 진행 중인 merge conflict 상태를 제거하고 `OURS` 상태로 복구합니다.
- `git status`
  - 일반 상태와 merge 진행 상태를 구분해서 출력합니다.

## 데모 시나리오

앱에는 다음 학습 시나리오가 포함되어 있습니다.

- `help`, `init`, `status`
- 단일 커밋 / 다중 커밋
- 브랜치 생성 / 전환 / `switch -c`
- `checkout` 브랜치 / 커밋
- fast-forward merge
- non-fast-forward merge
- merge conflict
- `revert`
- `reset --hard`
- 복합 시나리오

데모 실행 시 상태를 초기화한 뒤 명령을 순차적으로 재생합니다.

## 실행 방법

```bash
npm install
npm run dev
```

- 개발 서버: `http://localhost:5173`
- 프로덕션 빌드: `npm run build`
- 린트: `npm run lint`
- 포맷: `npm run format`

## 테스트

```bash
npm run test
npm run test:e2e
npm run test:all
```

- `npm run test`
  - Vitest 기반 unit / integration 테스트
- `npm run test:e2e`
  - Playwright 기반 브라우저 E2E 테스트
- `npm run test:all`
  - unit/integration + E2E 전체 실행

Playwright를 처음 실행하는 환경이라면 브라우저 설치가 필요할 수 있습니다.

```bash
npx playwright install chromium
```

## 테스트 범위

- Git 파서와 실행 로직
- reducer와 command runner
- terminal history / scroll 동작
- App 통합 흐름
- merge conflict 해결 UI
- 모달 접근성
- 긴 터미널 로그에서의 레이아웃 회귀

## 기술 스택

- React 19
- TypeScript
- Vite
- Mantine
- Monaco Editor
- Vitest
- Testing Library
- Playwright

## 프로젝트 구조

```text
src/
  app/
    commandSequence.ts
    terminalHistoryHandlers.ts
    terminalSubmitHandlers.ts
  components/
    AppDemoCatalogModal.tsx
    AppHeader.tsx
    AppTutorialModal.tsx
    ConflictResolver.tsx
    Editor.tsx
    Graph.tsx
    MonacoEditor.tsx
    Terminal.tsx
    graph/
  git/
    commands/execute/
    parse/
    reducer/
    types.ts
    execute.ts
    guards.ts
    messages.ts
    utils.ts
  test/
    renderWithProviders.tsx
    setup.tsx
e2e/
  app.spec.ts
```

## 비고

- 이 프로젝트는 실제 Git을 완전히 복제하는 것이 아니라, 학습용으로 핵심 개념을 시각화하는 데 초점을 둡니다.
- 최근 머지 충돌 흐름은 실제 Git에 더 가깝게 조정되어, 충돌 중 명령 제한과 `merge --abort`를 지원합니다.
