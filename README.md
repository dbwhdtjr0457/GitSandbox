# Git Sandbox Terminal

Vite + React + TypeScript 기반 Git 교육용 샌드박스입니다.  
왼쪽은 Git 커밋 그래프(SVG), 오른쪽은 에디터/터미널로 구성되어 있어 한 화면에서 상태 변화를 확인할 수 있습니다.

배포: https://joyoo-blog.com/

---

## 개요

- 지원 명령어를 직접 입력해 시나리오 기반으로 Git 동작을 관찰할 수 있습니다.
- 에디터 입력 내용은 `editorText`로 저장되어 커밋 스냅샷에 반영됩니다.
- 브랜치 이동/체크아웃/리셋 시 해당 커밋 스냅샷으로 에디터가 즉시 갱신됩니다.
- 명령어 실행은 멀티라인 입력 기준으로 1초 간격 순차 처리되어 출력 변화를 쉽게 추적할 수 있습니다.
- 데모 시나리오(튜토리얼 모달 + 데모 카탈로그)로 초보자 진입 장벽을 줄였습니다.
- 기본 UI 언어는 한국어이며, 헤더에서 영어로 전환 가능합니다.

---

## 실행 방법

```bash
npm install
npm run dev
```

- 개발 서버: `http://localhost:5173`
- 빌드: `npm run build`
- 타입 검사: `npx tsc --noEmit`
- 포맷: `npm run format`
- 포맷 체크: `npm run format:check`

---

## 지원 명령어

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

> `help` 출력은 현재 지원 명령어 목록을 바로 확인할 수 있습니다.

---

## 동작 규칙 요약

- `git init`
  - 레포를 초기화하고 `main` 브랜치를 생성합니다.
  - `branches.main = null`, `head.type = symbolic`
- `git commit -m`
  - 현재 HEAD 스냅샷을 커밋 메시지와 함께 저장
  - `parents` 배열 기반 DAG로 이력 유지
- `git branch`
  - 현재 HEAD 기준 새 브랜치 생성
  - 브랜치가 커밋 없는 경우 `unborn`(tip `null`) 상태로 유지
- `git switch`
  - 브랜치 이동만 수행 (`symbolic` HEAD)
- `git checkout`
  - 브랜치명: 브랜치로 이동
  - 커밋ID: detached HEAD로 이동
- `git merge`
  - `detached HEAD`에서는 merge 미지원
- `merge` 결과
  - Fast-forward 또는 non-FF 3-way merge commit 생성
  - 충돌은 현재 자동 해결 정책 없이 진행 상태만 노출(향후 확장 예정)
- `git revert`
  - 대상 커밋을 되돌린 새 커밋 생성
- `git reset --hard`
  - 지정 커밋으로 브랜치/HEAD 포인터 이동 + 에디터 스냅샷 복원
- `git status`
  - symbolic/detached 기준 문자열 출력
- `git log --oneline`
  - first-parent 기준으로 최대 30개 출력

---

## 주요 아키텍처

```
src/
  App.tsx, main.tsx, App.css
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
    parse/
      parseCommand.ts
      tokenize.ts
      types.ts
    execute.ts
    commands/execute/*
    guards.ts
    messages.ts
    utils.ts
```

---

## 리팩터링(최근 반영)

- Monaco 에디터 정합성 완료
  - `@monaco-editor/react`, `monaco-editor` 중심으로 정리
- CodeMirror 관련 의존성 제거 완료
- Prettier 도입 및 일괄 포맷 적용
- `unborn` 브랜치(`null tip`) 처리 규칙 정리
- `merge` 가드/에러 메시지 정리
- 그래프 정렬 기준을 `timestamp` 우선(동률 시 `cN`, 이후 문자열 fallback)으로 안정화
- locale(한/영) 분기 및 튜토리얼/데모 연동 정합성 강화

---

## 대표 시나리오 (10줄 내외)

```text
git init
git commit -m "init"
git commit -m "main: bootstrap project"
git branch feat
git switch feat
git commit -m "feat: add editor"
git commit -m "feat: add toolbar"
git switch main
git merge feat
git status
git log --oneline
```

`merge`에서 분기 병합 흐름과 그래프/에디터/터미널 동기화를 한 번에 확인할 수 있습니다.

---

## 참고

- 데모는 `AppDemoCatalogModal`에서 실행할 수 있으며, 실행 전 상태를 초기화한 뒤 순차 실행합니다.
- 충돌 해결 UI는 `ConflictResolver`(OURS / THEIRS / RESULT)로 구성되어 있으며, 향후 실제 충돌 병합 정책을 확장할 수 있는 기반을 제공합니다.
