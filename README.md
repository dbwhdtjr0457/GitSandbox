# Git Sandbox

브라우저에서 동작하는 간단한 Git 동작 시뮬레이터입니다.  
왼쪽에는 커밋 그래프를, 오른쪽에는 Editor/Terminal을 두고 명령을 입력해 상태를 확인할 수 있습니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` (또는 터미널에 표시된 주소)로 열어 사용하세요.

## 화면 구성

- 전체 화면은 좌우 50:50 레이아웃(100vh)
- 왼쪽: 커밋 그래프 (SVG)
- 오른쪽 상단: Editor
- 오른쪽 하단: Terminal

## 지원 명령어

- `help`
- `git init`
- `git commit -m "msg"`
- `git branch <name>`
- `git switch <name>`
- `git switch -c <name>`
- `git merge <name>` (FF-only)

`help`를 입력하면 위 목록이 터미널에 출력됩니다.

## 핵심 동작

- Editor 입력은 즉시 `editorText` 상태로 저장됩니다.
- `git commit -m` 실행 시 현재 Editor 내용이 커밋 스냅샷으로 저장됩니다.
- 브랜치, HEAD, 커밋 포인터가 변경될 때마다 그래프가 업데이트됩니다.
- `git merge`는 Fast-Forward 방식만 지원합니다.
  - FF 가능한 경우: `Fast-forward`
  - 이미 최신이면: `Already up to date`
  - FF 불가 분기이면: `Non-FF merge not supported in MVP`

## 터미널 동작

- `Enter`로 명령 전송
- `↑ / ↓`로 과거 입력 탐색
- 탐색 시작 시 현재 입력은 임시로 보관되며, 탐색 종료 시 복구됩니다.

## 프로젝트 구조

```text
src/
  App.tsx
  App.css
  components/
    Editor.tsx
    Terminal.tsx
    Graph.tsx
  git/
    types.ts
    reducer.ts
    parse.ts
    execute.ts
```

## 요약

- 사용자는 Terminal에서 명령어를 입력해 Git 저장소 상태를 조작할 수 있습니다.
- Editor는 현재 작업 트리(미커밋 상태)를 입력 받는 곳입니다.
- 커밋은 실제 코드 파일이 아닌 “상태 스냅샷”으로 저장되어 그래프와 상태 변화 추적에 사용됩니다.

## 다음으로 추가하기 좋은 기능

- `git switch` 시 해당 브랜치의 마지막 커밋 내용으로 Editor 자동 로드
- `git show / git log` 같은 조회 명령 추가
- 병합 충돌/비FF merge 구현
