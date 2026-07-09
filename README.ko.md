<p align="center">
  <img src="media/marketplace-icon.png" alt="Logo" width="128" />
</p>

<h1 align="center">Copilot Memory Explorer</h1>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=cat5th.copilot-memory-explorer">
    <img src="https://img.shields.io/badge/VS%20Code-1.96%2B-blue?logo=visualstudiocode" alt="VS Code" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  </a>
  <a href="https://github.com/harvey-woo/copilot-memory-explorer">
    <img src="https://img.shields.io/github/stars/harvey-woo/copilot-memory-explorer?style=social" alt="Stars" />
  </a>
  <br/>
  <a href="README.md">English</a> ·
  <a href="README.zh-cn.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

VS Code 네이티브 UI로 GitHub Copilot 메모리 파일을 탐색하고 관리하세요.

GitHub Copilot은 대화에서 "메모리"를 축적하여 프로젝트 컨텍스트, 코딩 선호도, 아키텍처 결정 등 장기적인 정보를 기록합니다. 이러한 메모리는 로컬 Markdown 파일로 저장되지만, 이를 탐색하거나 관리할 수 있는 내장 인터페이스는 없습니다.

**Copilot Memory Explorer**가 그 격차를 메웁니다. VS Code 네이티브 사이드바 뷰를 제공하여 채팅 세션별로 정리된 모든 Copilot 메모리를 탐색하고 관리할 수 있습니다.

## 데모

<p align="center">
  <img src="docs/usage-demo.webp" alt="사용 데모" width="720" />
</p>

## 기능

- **네이티브 TreeView** — VS Code 네이티브 컨텍스트 메뉴가 있는 사이드바 뷰
- **세션 탐색** — 메모리 항목이 있는 모든 채팅 세션 탐색
- **파일 트리** — 세션 디렉토리를 재귀적으로 스캔하여 파일과 하위 디렉토리 표시
- **Markdown 미리보기** — 파일을 클릭하여 미리보기 패널에서 렌더링된 Markdown 확인
- **이미지 미리보기** — 미리보기 패널에서 이미지 확인
- **컨텍스트 메뉴** — 우클릭으로 경로 복사, Finder에서 보기, 삭제, 새 메모리 생성
- **정렬** — 뷰 제목 표시줄에서 이름 또는 날짜별 정렬 전환
- **새 메모리** — 사이드바에서 직접 새 메모리 파일 생성

## 사용 방법

1. 활동 표시줄에서 **Copilot Memories** 아이콘 클릭
2. 세션을 탐색하고 확장하여 메모리 파일 보기
3. 파일을 클릭하여 편집기와 미리보기 패널에서 열기
4. 우클릭으로 컨텍스트 메뉴 옵션 확인

## 요구 사항

- VS Code 1.96+
- GitHub Copilot (메모리 생성용)

## 릴리스 노트

버전 기록은 [CHANGELOG.md](CHANGELOG.md)를 참조하세요.

## 라이선스

[MIT](LICENSE)