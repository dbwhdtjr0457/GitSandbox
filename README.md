# Git Sandbox Terminal

교육용 Git 시뮬레이터(React + TypeScript).  
브라우저에서 `Editor`, `Graph`, `Terminal`을 통해 Git 동작을 시각적으로 확인할 수 있습니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 기본 주소(`http://localhost:5173`)로 접속하세요.

## 현재 반영된 핵심 기능

- 좌우 2단 구성 UI (100vh)
  - 좌측: 커밋 그래프 (SVG)
  - 우측 상단: 텍스트 에디터
  - 우측 하단: 터미널
- Git 상태 관리: `useReducer` 기반 `GitState`
- 터미널 멀티라인 입력 지원 (줄 단위 실행)
- 명령 히스토리 위/아래 탐색 (Arrow Up/Down)
- 출력 결과 스크롤/자동 스크롤

### 지원 명령어

- `help`
- `git init`
- `git commit -m <msg>`  
- `git branch <name>`
- `git switch <name>`
- `git switch -c <name>`
- `git checkout <branch|commitId>`
- `git merge <name>`
- `git status`
- `git log --oneline`
- `git revert <commitId>`
- `git reset --hard <commitId>`

### 구현 동작

- `init`
  - 저장소 초기화 (`initialized: true`)
- `commit`
  - 현재 `HEAD` 기준으로 커밋 생성
  - 커밋은 `c1, c2, ...` 순번 ID, `parents[]` DAG 저장
  - `HEAD`가 심볼릭이면 브랜치 포인터 이동, detached면 `head.commitId`만 이동
- `branch`
  - 기존 브랜치 중복 시 에러
  - 새 브랜치 생성 시 lane 할당
- `switch`
  - 기존 브랜치로 이동
- `checkout`
  - 브랜치 체크아웃: symbolic 전환
  - 커밋 checkout: detached HEAD로 전환
- `merge`
  - FF 가능한 경우: `Fast-forward`
  - 동일 커밋: `Already up to date`
  - FF 불가: 3-way merge commit 생성
    - 메시지: `Merge branch '<name>'`
    - 병합 부모 2개 유지
- `status`
  - symbolic: `On branch <branch> + HEAD -> <branch> (...)`
  - detached: `HEAD detached at <commitId>`
- `log --oneline`
  - `HEAD`에서 시작해 first-parent 기준으로 최대 30개 출력
- `revert`
  - 새 커밋 생성
  - 메시지: `Reverted <commitId>`
- `reset --hard`
  - 헤드(또는 브랜치 포인터) 이동
  - `editorText`를 대상 커밋 snapshot으로 덮어쓰기

### Graph 동작

- 커밋 노드 렌더링 (원형)
- 부모선 렌더링 (단일/멀티 부모 모두)
- 레이블
  - 브랜치명 라벨
  - `HEAD` 배지
- 도달 가능성에 따라 reachable / dangling 표시(스타일 차이)
- 커밋 많아질 때는 스크롤로 확인

## 최근 수정 포인트

- `help` 실행 시 런타임 에러 수정
  - `executeHelp`에 `state` 전달 누락 수정으로 `result.nextState.terminal` 접근 크래시 해결
- 그래프 모듈 분리(100줄 이상 파일 리팩터링)
  - `src/components/graph/` 하위로 레이아웃 유틸 분리
- CSS 분리
  - `App.css` 분할(`App.base.css`, `App.graph.css`, `App.editor.css`, `App.right-panel.css`, `App.terminal.css`)

## 프로젝트 구조

```text
src/
  App.tsx
  App.css (+ 분리된 App.*.css)
  components/
    AppHeader.tsx
    Editor.tsx
    Terminal.tsx
    Graph.tsx
    graph/
      graphLayout.ts
      graphLayoutCore.ts
      graphLayoutNodes.ts
      graphLayoutEmpty.ts
      graphTypes.ts
      graphConstants.ts
      graphUtils.ts
  git/
    types.ts
    execute.ts
    parse.ts
    reducer.ts
    parse/
      parseCommand.ts
      parse.ts
      tokenize.ts
      types.ts
    commands/
      execute.ts
      execute/
        executeUtils.ts
        init.ts
        commit.ts
        branch.ts
        switch.ts
        checkout.ts
        merge.ts
        revert.ts
        resetHard.ts
        status.ts
        logOneline.ts
        help.ts
    reducer/
      actionTypes.ts
      applyReducer.ts
      initialState.ts
```

## 참고

- 현재는 학습용 최소 구현입니다. 실제 Git의 인덱스/워크트리/스테이징 동작, 충돌 해결 등은 아직 반영하지 않았습니다.
- 디버깅용 로그 버튼으로 현재 상태를 콘솔에 출력할 수 있습니다.  
  (헤더의 `Log state` 버튼)
