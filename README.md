# Git Sandbox Terminal

Git 학습용 미니 IDE입니다.  
좌측은 커밋 그래프, 우측은 에디터 + 터미널로 구성되어 있어 `git` 흐름을 한 화면에서 확인할 수 있습니다.

---

## 실행 방법

```bash
npm install
npm run dev
```

- 브라우저: `http://localhost:5173`
- 배포: https://joyoo-blog.com/
- 배포 플랫폼: Netlify (`npm run build` 통과 기준)

---

## 핵심 기능

- Git 상태 엔진(모의 Git)
  - `init / commit -m / branch / switch / switch -c / checkout / merge / revert / reset --hard / status / log --oneline / help`
- 브랜치/병합
  - fast-forward merge, non-fast-forward(3-way) merge commit 생성
  - detached HEAD 지원
  - mergeBase 보존(내부 메타)
- SVG Graph 뷰
  - 커밋/부모 간선/브랜치 라벨/HEAD 표시
  - 브랜치 수/커밋 수가 늘어나면 스크롤로 탐색
- 에디터 연동
  - 커밋 생성 시 `editorText` 스냅샷 저장
  - 브랜치 이동/체크아웃/`reset --hard` 시 대상 스냅샷을 에디터에 반영
- 터미널 UX
  - 멀티라인 입력 지원(복수 명령어 순차 실행)
  - 1초 간격 단계 실행으로 결과 추적 쉬움
  - 명령 히스토리(↑/↓), 드래프트 입력 복구
- 데모/학습 모듈
  - 헤더 `?` 버튼의 튜토리얼 모달
  - 시나리오 카탈로그(데모 실행 전 초기화 + 자동 순차 실행)

---

## 현재 지원 명령어

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

---

## 주요 사용 흐름

1. 최초 진입
   - 환영 문구 확인 후 `help` 실행
2. 기본 흐름
   - `git init` → `git commit -m "..."` 반복
3. 브랜치/전환
   - `git branch`, `git switch`, `git checkout`
4. 병합 학습
   - `git merge`의 FF/Non-FF 동작 비교
5. 롤백/되돌림
   - `git revert`, `git reset --hard`
6. 시각 점검
   - 그래프의 HEAD/브랜치 라벨/병합 노드를 함께 확인

## 튜토리얼/교육 가이드

- 튜토리얼은 헤더의 `?` 버튼으로 열 수 있습니다.
- 데모 시나리오는 항상 초기 상태로 리셋 후 실행되어 일관된 시작점을 보장합니다.
- 데모는 1초 간격으로 명령이 순서대로 실행됩니다.
- 헤더의 "상태 출력" 버튼은 제거되어 상태 확인은 터미널 로그·그래프·에디터에서 수행합니다.

---

## 동작 규칙 요약

- `init`
  - `head = { type: "symbolic", branch: "main", commitId: null }`
  - `branches.main = null`, `meta.initialized = true`, `nextId` 초기화
- `commit`
  - `snapshot = editorText`
  - `parents` 기반 DAG 기록
  - symbolic head는 브랜치 tip 이동, detached는 `head.commitId`만 이동
- `branch`
  - 현재 HEAD 기준 브랜치 생성(또는 unborn 브랜치면 `null` tip)
- `switch`
  - 존재하는 브랜치로 이동
- `checkout`
  - `git checkout <branch>`: symbolic 이동
  - `git checkout <commitId>`: detached 이동
- `merge`
  - detached HEAD에서는 미지원
  - unborn 브랜치 예외 처리 포함
  - FF 가능 시 fast-forward, 불가 시 merge commit 생성
- `revert`
  - 새 커밋 생성(`Revert "<원본 메시지>"`)
- `reset --hard`
  - 브랜치/HEAD 포인터만 이동(커밋 삭제 없음)
  - 에디터 텍스트를 대상 커밋 스냅샷으로 롤백
- `status / log`
  - symbolic/detached 분기 상태 반영
  - `log --oneline`: first-parent 기준(최대 30개)

---

## 현재 아키텍처

- `App.tsx`
  - 상태(useReducer), 터미널 제출, 데모/튜토리얼 제어, 헤더 제어
- `src/git`
  - `types.ts` 상태 타입
  - `reducer.ts` 상태/액션
  - `parse.ts` 명령 파싱(AST)
  - `execute.ts` 단일 실행 엔트리
  - `commands/execute/*` 명령 핸들러 분리
  - `guards.ts`, `messages.ts` 공통 검사/메시지
- `src/components`
  - `Graph.tsx`, `graph/*` SVG 렌더링
  - `Editor.tsx` / `MonacoEditor`
  - `Terminal.tsx`
  - `AppHeader.tsx`, `AppTutorialModal.tsx`, `AppDemoCatalogModal.tsx`
  - `ConflictResolver.tsx`
- `src/app`
  - `terminalSubmitHandlers.ts`, `terminalHistoryHandlers.ts`

---

## 프로젝트 구조(요약)

```text
src/
  App.tsx
  components/
    AppHeader.tsx
    AppTutorialModal.tsx
    AppDemoCatalogModal.tsx
    Editor.tsx
    Terminal.tsx
    Graph.tsx
    ConflictResolver.tsx
    graph/
      GraphCanvas*.tsx
  app/
    terminalSubmitHandlers.ts
    terminalHistoryHandlers.ts
  git/
    execute.ts
    guards.ts
    messages.ts
    parse.ts
    reducer.ts
    types.ts
    commands/execute/*
```

---

## 참고

- 데모는 매 단계가 터미널 히스토리에 기록되어 실행 과정을 추적하기 쉽습니다.
- `git` 상태 변경, 그래프, 에디터 스냅샷이 같은 흐름으로 갱신됩니다.

## Refactor ���� (���� �����͸� ���ռ� ����)

### 0) ������ ���ռ�

- `src` import ���� ��� ������ ��Ű��: `@monaco-editor/react`, `monaco-editor`
- `src`���� `@uiw/react-codemirror`, `@codemirror/*`�� import ����
- `package.json`/`package-lock.json`�� ���� ��� ��Ű�� �������� ���� ������

### 1) Prettier ����

- `.prettierrc`, `.prettierignore` �߰�
- `format`, `format:check` ��ũ��Ʈ �߰�
- `npm run format:check` ���

### 3) unborn branch(null tip) ���ռ�

- `merge`���� ��� �귣ġ `null`�� �� `Already up to date`
- ���� �귣ġ�� `null`, ��� �귣ġ�� Ŀ���̸� `Fast-forward`
- `isAncestor`�� `null` ���̽��� ���� ��Ģ���� ó��

### 4) merge ����/�޽��� ����

- �귣ġ ���� ������ `requireBranchExists`�� ����
- �귣ġ ������ �� `error: pathspec '...' did not match any branch`

### 5) �׷��� ���� ���ռ�

- ���� �켱����: `timestamp desc` �� `cN ���� ID` �� `string fallback`

### ���� �ó����� ���� (10��)

```text
help
git init
git commit -m "init"
git commit -m "main: bootstrap"
git branch feat
git switch feat
git commit -m "feat: add editor"
git switch main
git merge feat
git status
git log --oneline
```
