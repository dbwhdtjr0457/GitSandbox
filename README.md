# Git Sandbox Terminal

Vite + React + TypeScript로 만든 Git 학습용 UI 데모입니다.
한쪽에는 커밋 그래프를, 오른쪽에는 Editor와 터미널을 배치해 Git 동작을 시각적으로 확인할 수 있습니다.

---

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 기본적으로 `http://localhost:5173` 에 접속합니다.

---

## 현재 지원 기능

- Git 리포지터리 초기화/커밋/브랜치/체크아웃
- 병합(FF 및 non-FF merge commit 생성)
- 상태 조회(`status`)
- 로그 조회(`log --oneline`)
- `revert`, `reset --hard`
- Detached HEAD 이동/복귀
- Editor 내용은 `git commit` 시점에 스냅샷으로 저장
- 좌측은 SVG 그래프, 우측은 Editor + Terminal

현재 명령어는 단일 파이프라인으로 동작합니다.

```
입력(터미널) -> parseCommand -> executeCommand -> 상태 업데이트
```

---

## 사용 가능한 명령어

`help` 입력 시 출력됩니다.

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

> 공백/따옴표 처리 및 기본 파싱은 `src/git/parse/*`에서 처리합니다.

---

## 핵심 동작 규칙

### 초기화

- `git init` 실행 시:
  - `meta.initialized = true`
  - `main` 브랜치 생성 (`main: null`)
  - `head`는 `symbolic` + `branch: main`, `commitId: null`
- 이미 초기화된 상태에서 다시 `git init`을 실행하면 재초기화 메시지를 출력합니다.

### commit

- 커밋 ID는 `c1, c2, ...`
- `parents`는 배열입니다.
- HEAD가 symbolic이면 해당 브랜치 포인터를 새 커밋으로 이동
- HEAD가 detached이면 detached head의 `commitId`만 이동
- `editorText`를 현재 snapshot으로 저장

### branch / switch / checkout

- `git branch <name>`: 기존 브랜치 이름이면 오류
- `git switch <name>`: 존재 브랜치로 전환
- `git switch -c <name>`: 브랜치 생성 + 전환
- `git checkout <branch|commitId>`:
  - 브랜치명이면 symbolic HEAD 전환
  - `cN` 형태면 commitId로 detached 전환

### merge

- 입력 브랜치가 존재하지 않으면 오류
- HEAD가 detached면 병합 불가 오류
- 머지 판정은 공통 조상(ancestor) 로직으로 처리
  - 이미 동일 커밋이면 `Already up to date`
  - 현재 tip이 대상 tip을 선행 조상으로 포함하면 `Fast-forward`
  - 그 외는 merge commit 생성
- merge commit는 `Merge branch '<name>'`, `parents: [current, target]`
- 현재 버전은 non-FF에서도 충돌은 따로 계산하지 않고 commit만 생성
- 병합 커밋에는 `mergeBase`(optional)도 저장

### status / log

- `status`
  - symbolic: `On branch <branch> + HEAD -> <branch> (<commitId or no commits yet>)`
  - detached: `HEAD detached at <commitId or no commits yet>`
  - 현재 상태를 기준으로 간단한 clean/dirty 문구 표시
- `log --oneline`
  - `head`가 가리키는 커밋부터 first-parent 경로로 최대 30개 출력
  - 커밋이 없으면 `No commits yet`

### revert / reset

- `revert <commitId>`: 새 커밋 생성(`Revert "<message>"`), 대상이 없으면 오류
- `reset --hard <commitId>`: 헤드 포인터만 이동 + 에디터 내용을 해당 commit snapshot으로 복원

---

## Unborn branch (커밋 없는 브랜치) 동작

- 브랜치 tip이 `null`인 경우에도 명령이 깨지지 않습니다.
- `isAncestor(null, X)`는 `true`, `isAncestor(X, null)`는 `false`로 동작
- 현재 브랜치 tip이 `null`이고 대상 브랜치가 커밋을 가지고 있으면 `Fast-forward`로 병합 포인터를 이동

---

## 구현 구조

- `src/App.tsx`
  - 전체 상태: `useReducer(reducer, initialState)`
  - 헤더, Graph, Editor, Terminal 구성

- `src/git/`
  - `types.ts`: 공통 상태 타입
  - `parse.ts` + `parse/*`: 터미널 입력 파싱
  - `execute.ts`: 단일 실행 엔트리(`executeCommand`) + switch 기반 라우팅
  - `guards.ts`: 공통 오류 가드
  - `messages.ts`: 공통 출력/에러 메시지
  - `utils.ts`: DAG 유틸(ancestor/LCA)
  - `reducer.ts`: 리듀서 조합 엔트리
  - `reducer/*`: 액션, 초기상태, reduce 적용부
  - `commands/execute/*`: 명령별 실행 핸들러

- `src/components/graph/*`
  - 그래프 레이아웃/좌표 계산/노드/엣지 렌더러
  - 커밋 정렬은 기본적으로 `timestamp` 최신 우선, 예외적으로 id `cN` fallback

- `src/app/*`
  - `terminalSubmitHandlers.ts`: Enter/멀티라인 입력 처리
  - `terminalHistoryHandlers.ts`: 위/아래 방향키 히스토리

---

## 터미널 / UI

- Enter: 제출
- Shift+Enter: (현재 입력 유지)
- Up/Down: 히스토리 이동
- 여러 줄 명령 입력 시 줄 단위로 순차 실행되어 결과가 모두 기록됩니다.

### 헤더 버튼

- `Log State`: 현재 상태를 콘솔에 출력
- `Reset`: 초기 상태로 전체 리셋

---

## 최근 정리 포인트

- 파서/실행 메시지/오류 처리는 가드 + 공통 메시지로 정리
- 실행 엔트리는 `src/git/execute.ts` 하나로 통합
- merge에서 LCA 결과를 실제로 커밋 메타(`mergeBase`)에 보관
- 그래프 정렬은 id 규칙에 강결합되지 않도록 `timestamp` 우선 정렬로 완화
