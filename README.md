# Git Sandbox Terminal

실행 가능한 Git 학습용 미니 IDE입니다.  
좌측에는 커밋 그래프, 우측에는 코드 에디터 + 터미널을 배치해 `git`의 핵심 흐름을 실습할 수 있습니다.

---

## 실행 방법

```bash
npm install
npm run dev
```

브라우저: `http://localhost:5173`
- 배포 주소: https://joyoo-blog.com/
- 배포: Netlify 사용 가능 (`npm run build` 통과 기준)

---

## 핵심 기능

- Git 상태 엔진(모의 Git)
  - `init / commit -m / branch / switch / switch -c / checkout / merge / revert / reset --hard / status / log --oneline / help`
- 분기/병합
  - FF Merge, Non-FF Merge(3-way merge commit 생성), mergeBase 저장
  - detached HEAD
- SVG Graph 뷰
  - 커밋 노드/부모 간선/브랜치 라벨/HEAD 표시
  - 커밋이 늘어나면 스크롤로 대응
- 에디터 연동
  - 커밋은 `editorText` 스냅샷을 저장
  - branch/commit 이동 시 HEAD 커밋 스냅샷을 에디터에 반영
  - `reset --hard` 시 에디터 텍스트 롤백
- 터미널 UX
  - 다중 명령어(멀티라인) 일괄 입력 지원
  - 결과를 줄 단위로 순차 실행(딜레이 적용)
  - 명령 히스토리(↑/↓), 입력 복구
- 충돌 UI(현재: 충돌 해결 흐름 기반 뼈대)
  - 결과/원본 비교 기반 `ConflictResolver` 진입점
- 데모/교육 모듈
  - 헤더 우측 질문 버튼 기반 튜토리얼 모달
  - 데모 카탈로그 버튼으로 시나리오별 실행
    - 기본/브랜치/머지/revert/reset 등의 순차 실행 데모

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
   - 환영 메시지 출력, `help` 확인
2. Git 시작
   - `git init` → `git commit -m ...` 반복
3. 브랜치/전환
   - `git branch`, `git switch`, `git checkout`
4. 병합 학습
   - FF 병합: `merge`
   - Non-FF 병합: Merge commit 생성 및 부모 2개 표시
5. 롤백/원복
   - `git revert` 또는 `git reset --hard`
6. 시각 확인
   - 그래프에서 HEAD 이동, 브랜치 라벨, 머지 포인트를 함께 점검

---

## 동작 규칙 요약

- `init`
  - `head = { type: "symbolic", branch: "main", commitId: null }`
  - `branches.main = null`, `meta.initialized = true`, `nextId` 초기화
- `commit`
  - `snapshot = editorText`
  - `parents` 기반 DAG 기록
  - symbolic head면 현재 브랜치 tip 이동, detached면 `head.commitId`만 이동
- `branch`
  - 현재 HEAD를 가리키는 브랜치 생성(또는 unborn branch: `null`)
- `switch`
  - 존재 브랜치로만 이동
- `checkout`
  - branch: symbolic 이동
  - commit: detached 이동
- `merge`
  - detached는 미지원
  - unborn branch tip(null) 예외 규칙 처리
  - FF 가능 시 fast-forward, 불가 시 merge commit 생성
  - `mergeBase`는 내부 메타로 저장
- `revert`
  - 새 커밋 생성(`Revert "<원본메시지>"`), parents는 현재 HEAD 기준
- `reset --hard`
  - HEAD 포인터만 이동, 커밋 삭제 없음
  - 에디터 텍스트를 대상 커밋 snapshot으로 덮어쓰기
- `status / log`
  - symbolic/detached 분기 상태 반영
  - `log --oneline`는 first-parent 방식(최대 30개)

---

## 현재 아키텍처

- `App.tsx`
  - 상태(useReducer), 터미널 입력 처리, 데모/튜토리얼 제어
- `src/git`
  - `types.ts` 상태 타입
  - `reducer.ts` 액션/상태 갱신
  - `parse.ts` 명령어 파서(AST)
  - `execute.ts` 단일 실행 진입점
  - `commands/execute/*` 명령 핸들러 분리
  - `guards.ts`, `messages.ts`로 에러/메시지 공통화
- `src/components`
  - `Graph.tsx` + `graph/*` SVG 렌더링 및 레이아웃 유틸
  - `Editor.tsx` / `MonacoEditor`(실사용 에디터)
  - `Terminal.tsx`
  - `AppHeader.tsx`, `AppTutorialModal.tsx`, `AppDemoCatalogModal.tsx`

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

- 데모 실행 시 브라우저 터미널에 명령이 순차적으로 주입되며, 각 결과를 화면에서 확인할 수 있습니다.
- 복잡한 시나리오도 동일한 파이프라인으로 동작하기 때문에 `git` 상태 + 에디터 + 그래프가 함께 일관되게 갱신됩니다.

