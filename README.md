# Git Sandbox Terminal

Vite + React + TypeScript로 만든 Git 학습용 미니 IDE입니다.  
왼쪽에는 커밋 DAG(Directed Acyclic Graph) 시각화를, 오른쪽에는 에디터/터미널을 배치해 Git 동작을 직관적으로 확인할 수 있습니다.

배포 링크: https://joyoo-blog.com/

---

## 핵심 기능

- Git 명령어 시뮬레이터
  - `help`
  - `git init`
  - `git commit -m <msg>`
  - `git branch <name>`
  - `git switch <name>`
  - `git switch -c <name>`
  - `git checkout <branch|commit>`
  - `git merge <name>`
  - `git revert <commitId>`
  - `git reset --hard <commitId>`
  - `git status`
  - `git log --oneline`
- 커밋 그래프(SVG) 시각화
  - 커밋 노드/간선, 브랜치 라벨, HEAD 위치 표시
  - `reachable` / `dangling` 개념 기반 디버그 모드 지원(선택)
- 에디터 연동
  - 입력한 `editorText`가 커밋 스냅샷으로 저장됨
  - 브랜치/커밋 이동 시 해당 커밋 스냅샷으로 에디터 복원
  - `reset --hard` 시 HEAD 스냅샷로 동기화
- 튜토리얼·데모 UI
  - 헤더의 튜토리얼 모달
  - 데모 카탈로그/시나리오 버튼
  - 단계 실행 애니메이션, 실행 중 데모 비활성화(가드) 처리
- 다국어 지원
  - 기본 언어는 영어(요청 시 한국어 전환 가능)

---

## 빠른 시작

```bash
npm install
npm run dev
```

- 개발 서버: `http://localhost:5173`
- 주요 확인 항목:
  - 에디터/터미널 정상 렌더링
  - 명령 실행 시 커맨드/출력 누적
  - 그래프 레이아웃 업데이트

---

## 실행 가능한 명령어 정리

지원 명령은 아래와 같습니다.

- `help`
- `git init`
- `git commit -m <msg>`
- `git branch <name>`
- `git switch <name>`
- `git switch -c <name>`
- `git checkout <branch|commitId>`
- `git merge <name>`
- `git revert <commitId>`
- `git reset --hard <commitId>`
- `git status`
- `git log --oneline`

멀티라인 입력 지원:

```
git init
git commit -m "init"
git commit -m "main: bootstrap"
git status
```

각 줄이 순차적으로 1초 간격으로 처리되어 로그 변화를 확인하기 쉽게 동작합니다.

---

## Git 상태/동작 규칙(요약)

- `init`
  - `meta.initialized = true`
  - `branches.main = null`
  - `head = { type: "symbolic", branch: "main", commitId: null }`
- `commit`
  - 현재 `HEAD`가 가리키는 스냅샷을 커밋(`snapshot`)에 반영
  - 부모 커밋은 `parents` 배열로 DAG 보존
- `branch`
  - 현재 브랜치 HEAD를 기준으로 분기 생성 (최초에는 `unborn` 브랜치가 될 수 있음)
- `switch`/`checkout`
  - 브랜치 이동(`symbolic`) 또는 특정 커밋 이동(`detached`)
  - 이동한 위치의 스냅샷을 에디터에 반영
- `merge`
  - FF merge + non-FF merge(3-way merge commit) 지원
  - 현재는 충돌 자체 해결은 미구현, merge commit 스냅샷은 현재 에디터 내용으로 저장
- `revert`
  - 대상 커밋의 부모 체인을 유지한 새 커밋 생성
  - 메시지: `Revert "<원본 메시지>"`
- `reset --hard`
  - 지정한 커밋으로 브랜치/HEAD 포인터 이동
  - 스냅샷으로 에디터 상태 덮어쓰기
- `status`
  - symbolic: `On branch ...`
  - detached: `HEAD detached at ...`
- `log --oneline`
  - 현재 HEAD 기준 first-parent 방식 최대 30개 출력

---

## Refactor 정리(최근 반영)

### 1) 의존성 정합성 정리
- Monaco 기반 에디터(`@monaco-editor/react`, `monaco-editor`) 기준으로 사용 중인 패키지만 유지
- 미사용 CodeMirror 의존성 정리 완료(프로젝트 기준 import 미사용)

### 2) 코드 스타일/포맷
- `prettier` 적용
- `npm run format` 및 `npm run format:check` 지원 스크립트 추가

### 3) Unborn branch(`null tip`) 규칙 정리
- `isAncestor`의 `null` 처리 규칙 명확화
  - `(null, null) => true`
  - `(null, X) => true`
  - `(X, null) => false`
- `merge`에서 커밋이 없는 브랜치 대상 처리 흐름 정리
- `status / log`에서 초기 브랜치 상태(`No commits yet`) 메시지 정합

### 4) merge 가드/메시지 정리
- Branch 존재/레포 초기화/HEAD 상태 검사 가드 통합
- 존재하지 않는 브랜치 merge 시 일관된 에러 메시지

### 5) 그래프 정렬 기준 개선
- 정렬 우선순위: `timestamp` 내림차순 → `cN` 파싱 fallback → 문자열 비교

### 6) 정적 정합성
- `npx tsc --noEmit` 통과
- `npm run build` 통과
- `npm run dev` UI 렌더링 확인

---

## 대표 시나리오 (10줄 내외)

```text
git init
git commit -m "init"
git commit -m "main: bootstrap"
git branch feat
git switch feat
git commit -m "feat: editor"
git commit -m "feat: toolbar"
git switch main
git merge feat
git status
git log --oneline
```

- `init` 후 두 번의 초기 커밋 생성
- `feat` 브랜치에서 작업
- `main`으로 복귀 후 `merge`로 병합
- 그래프/HEAD/터미널 로그/에디터 상태가 함께 변하는지 확인

---

## 프로젝트 구조(요약)

```
src/
  App.tsx
  main.tsx
  App.tsx, App.css
  app/
    terminalSubmitHandlers.ts
    terminalHistoryHandlers.ts
  components/
    AppHeader.tsx
    AppTutorialModal.tsx
    AppDemoCatalogModal.tsx
    Editor.tsx
    MonacoEditor.tsx
    Terminal.tsx
    Graph.tsx
    ConflictResolver.tsx
    graph/
      GraphCanvas*.tsx
  git/
    types.ts
    reducer.ts
    parse.ts
    execute.ts
    commands/execute/*
    guards.ts
    messages.ts
    utils.ts
```

---

## 라이선스

본 프로젝트는 학습/개인 프로젝트용으로 운영되며, 별도 배포 정책은 저장소 정책에 따릅니다.
