# ChronoArchive VS Code 확장

**언어:** [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · **한국어** · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md)

chronoarchive(`.car`) 파일용 언어 지원입니다. 작업 추적, 타임스탬프 로그, 프롬프트 컨테이너를 위한 구조화된 일반 텍스트 형식입니다.

명령, 설정, 시맨틱 토큰 설명은 `package.nls.json` 및 `package.nls.<locale>.json`으로 현지화됩니다. VS Code 표시 언어(`Configure Display Language`)를 따릅니다. 포함 로케일: `en`(기본, `package.nls.json`), `zh-cn`, `zh-tw`, `ja`, `ko`, `vi`, `th`.

## 기능

- **구문 강조**: TextMate 문법
- **시맨틱 토큰**: 플래그, 날짜·시간, 수식어, 속성 강조
- **접기**: 항목·슈퍼헤더 블록
- **진단**: 누락된 시각, 빈 페이로드, 잘못된 항목 등
- **문서 기호**: 개요에 모든 항목 표시
- **CodeLens**: `/prompt` 항목용 빠른 동작
- **단축키**: 플래그 순환, 탐색, 편집
- **스마트 이동**: 항목 이동 시 커서 유지
- **자동 최적화**: 항목 사이 빈 줄 관리

## 설치

1. 저장소 클론  
2. `npm install`  
3. F5로 확장 개발 호스트 실행  
4. `.car` 파일 열기

## 사용

`.car` 파일을 만들고 구조화된 항목을 작성합니다.

**일일 로그:** **Ctrl+Alt+D**(또는 **Alt+Meta+D**)로 오늘 로그를 만들고 엽니다. 경로는 `<root>/년/년-월/년-월-일.car`입니다. 있으면 열고 없으면 템플릿으로 생성합니다. **설정** → **ChronoArchive**에서 **Daily Logs Root**(비우면 기본값: Linux `~/Documents/Daily Logs` 또는 `$XDG_DOCUMENTS_DIR/Daily Logs`, Windows `%USERPROFILE%\Documents\Daily Logs`)와 **Daily Log Template Path**(`{{CREATION}}`, `{{TIME}}`, 비우면 기본 템플릿)를 지정할 수 있습니다.

## 키보드 단축키

(키 조합은 영어 README와 동일합니다)

### 플래그 순환

| 단축키 | 순환 | 설명 |
|----------|------------|-------------|
| `Ctrl+/` | ☑️ → ✅ → 🎉 → 끔 | 완료 |
| `Ctrl+'` | ❌ → ❎ → 🗑️ → 끔 | 닫힘 |
| `Ctrl+Shift+/` | 🟡 → ⏱️ → ⌛ → 🚧 → 🔄 → 🛠️ → 끔 | 대기 |
| `Ctrl+Shift+\` | 📝 → 📍 → 📌 → 끔 | 중요도 |
| `Ctrl+Shift+'` | ⚠️ → ‼️ → 🔥 → 끔 | 주의 |
| `Ctrl+@` | ☕️ → 🍵 → 🍼 → 🍻 → 🍹 → 🍷 → 끔 | 음료 |
| `Ctrl+)` | 💕 → 🤏 → ☺️ → 😃 → 👍 → 😍 → 😘 → 끔 | 긍정 감정 |
| `Ctrl+(` | 🥺 → 🫩 → 😂 → 🤣 → 😭 → 😅 → 💀 → 끔 | 부정 감정 |

### 일일 로그

| 단축키 | 동작 |
|----------|--------|
| `Ctrl+Alt+D` | 오늘 일일 로그 생성·열기 |
| `Alt+PageUp` / `Alt+PageDown` | 가까운 기존 날짜 로그로 이동(파일 생성 없음) |
| `Ctrl+Alt+PageUp` / `Ctrl+Alt+PageDown` | 전날/다음날 달력 로그(없으면 템플릿으로 생성) |

### 우선순위

| 단축키 | 동작 |
|----------|--------|
| `Ctrl+1` ~ `Ctrl+5` | 우선순위 1~5성 ⭐ |

### 항목 탐색

| 단축키 | 동작 |
|----------|--------|
| `Ctrl+K` | 이전 항목 |
| `Ctrl+J` | 다음 항목 |
| `Alt+K` | 항목 위로 |
| `Alt+J` | 항목 아래로 |

### 항목 추가

| 단축키 | 동작 |
|----------|--------|
| `Alt+]` | 현재 다음에 추가 |
| `Alt+[` | 현재 항목 앞에 추가 |
| `Alt+Shift+[` | 현재 줄 앞에 추가 |
| `Ctrl+Alt+=` | 파일 끝에 추가 |

### 삭제

| 단축키 | 동작 |
|----------|--------|
| `Alt+Delete` | 현재 항목 삭제 |

### 설정

| 설정 | 기본값 | 설명 |
|---------|---------|-------------|
| `chronoarchive.blankLinesBetweenItems` | `0` | 항목 사이 빈 줄 수(0~3) |

## 빠른 시작

```todo
Date: 2022-03-04
Author: Lenik

📝 12:34:56
    This is a note item

✅ 12:45:00 /prompt
    Write a program about weather analysis.

    1. Qt based
    2. Access local proxy

✅ 12:56:12 /php
    <?php
        phpinfo();
    ?>
```

## 예시

### 슈퍼헤더

```todo
Date: 2022-03-04
Author: Lenik
Project: ChronoArchive
```

### 항목 구조

1. **머리줄**(필수): `[플래그] [날짜] 시간 [수식어]`
2. **속성**(선택): 들여쓴 `이름: 값`
3. **페이로드**(필수): 들여쓴 본문

### 수식어

- `/prompt` — 프롬프트로 표시
- `/php`, `/python`, `/json` 등 — 언어 힌트
- `/lang=identifier` — 명시적 언어 지정

## 개발

```bash
npm run compile
```

```bash
npm run watch
```

```bash
npm test
```

## 라이선스

GPL
