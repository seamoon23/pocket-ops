# Pocket Ops v0.2.0 검증 보고서

검증일: 2026-10-04 (KST). 실행 파일은 단일 `pocket-ops.html`입니다.

| 범위 | 환경 | 통과 | 실패 |
|---|---|---:|---:|
| 순수 변환·명령어 데이터·보안 회귀 | Node v22.17.0, Windows PowerShell 구문 분석 | 96 | 0 |
| 오프라인 UI·보안·배포·로컬 파일 | Chrome 154.0.8037.95, Playwright 1.63.0 | 84 | 0 |
| 완성 HTML·CSP·배포 원본 일치 | Python 표준 라이브러리 | 14 | 0 |
| 합계 | 자동 검사 항목 수 | 194 | 0 |

HTML: 540,548 bytes. ZIP: 558,314 bytes.

- HTML SHA-256: `4cdf075b05698c738c83c48cf7f3ad3b4a8af92e4bf45d1bc2cd989bea1409cf`
- ZIP SHA-256: `ba3183e8492901097c3353affbcef84e283b19abccedee87aea83b10a0fd5a64`

상세 결과는 `tests/core-results.json`, `tests/browser-results.json`, `tests/static-results.json`에 있습니다. 별도로 Bash 96개와 PowerShell 19개 명령의 구문을 파싱했습니다. 카탈로그 명령을 실행하거나 서버·DB에 접속하지 않았습니다. DB의 SQL 예제 6개는 해당 DB 엔진에 실행 검증하지 않았습니다.

## 확인한 동작

14개 도구와 설정·즐겨찾기 경로, 121개 기본 명령어, Windows/Linux/DB 분류, 대체 명령어 선택, 실행 조건 표시를 확인했습니다. 도구와 명령어 즐겨찾기는 공통 화면에서 조회합니다. PID·포트·옵션형 경로·셸 인용을 검증하며, 변경 명령 확인 후 값을 바꾸면 다시 확인해야 복사할 수 있습니다. 사용자 HTML은 텍스트로 표시되고 가져온 명령이 위험도를 낮춰 주장해도 미검증 명령으로 취급합니다.

PowerShell의 스마트 따옴표 주입, SQL 역슬래시 해석 차이, JSON 깊이·출력 팽창, BOM 소실, 잘못된 UTF-16의 손실 변환을 회귀 검사했습니다. 입력 수정 시 결과가 지워지며 오래된 정규식 오류가 새 결과를 덮지 않습니다. 큰 JSON의 문법 검증은 불필요한 들여쓰기 팽창을 만들지 않습니다.

브라우저에서 Windows-949 확장 한글 `갂`, `똠`이 있는 파일을 읽고, 실제 UTF-8 BOM 다운로드 바이트와 줄바꿈을 대조했습니다. UTF-16 BOM, 손실된 문자열 복구 거절, URL/Base64/HEX/유니코드/HTML 코덱 왕복도 확인했습니다. Node EUC-KR 검사는 공통 영역만 다루며, 확장 CP949 판독 결과는 Chromium 검사로 구분했습니다.

JSON 큰 정수·소수 표기·중복 키 보존, 텍스트 CRLF 다운로드, 줄 비교, 로그 문맥, SQL 1,001개 묶음, 유니코드/ASCII, 시간·권한·크론 계산을 검사했습니다. 정규식은 실제 Blob Worker에서 실행하며 약 1.2초 제한, 1,000매치 제한, 캡처 합계 500,000자 제한과 화면 응답을 확인했습니다.

정상 설정 백업이 2 MiB를 넘는 한글 명령어 사례로 내보내기·다시 가져오기 무손실을 확인했습니다. 가져오기 상한은 16 MiB이며 스키마의 항목·길이 제한을 별도 적용합니다. Crypto 부재 시에도 설정 화면에 접근할 수 있습니다.

## 배포 파일

상단 배포하기로 실제 ZIP을 내려받아 Python zipfile로 CRC와 파일 목록을 확인했습니다. ZIP은 HTML 원본, START_HERE.txt, README_KO.md, CHANGELOG.md만 포함합니다. 작업 입력·사용자 명령·설정 및 변경된 화면의 표식이 섞이지 않았으며, 내장 원본 레시피의 DOM을 초기화 뒤 변경해도 결과에 영향을 주지 않았습니다.

브라우저 ZIP과 빌드 ZIP이 바이트 단위로 같습니다. ZIP의 HTML도 빌드 원본과 같으며, 그 HTML을 다시 열고 배포해도 동일한 ZIP입니다. ZIP은 Windows 기본 압축 해제와 호환되는 저장 방식이며 외부 라이브러리·Web Crypto·네트워크 없이 생성합니다. 상단 버튼은 현재 파일의 버전을 포장하며 온라인 최신 버전 확인은 하지 않습니다.

## 로컬 파일 및 검증 한계

이번 Windows 개발 PC에서는 `file://` 직접 열기가 허용되어, 실제 HTML 열기 → SHA-256 계산 → ZIP 저장 → 추출한 HTML 다시 열기 → JSON 변환 → 테마 변경 → 새로고침 후 설정 유지까지 통과했습니다. 이 컨텍스트는 secureContext/WebCrypto/Worker를 지원했습니다. 브라우저 정책은 변경하지 않았습니다.

주 UI 검사는 오프라인 `page.set_content` 컨텍스트에서 수행했습니다. 여기서는 보안 컨텍스트와 Web Crypto가 없으므로 제한 안내를 시험했습니다. 주 설정 저장과 클립보드 payload 검사는 명시적인 대역을 사용했습니다. **OS 클립보드, 브라우저 완전 종료 뒤 저장소 지속성, 기관 작업 PC 정책의 성공까지 검증한 것은 아닙니다.** 화면 미리보기의 정상 저장소 표시는 메모리 저장소 대역이며 제품에 포함되지 않습니다.

검사 워크플로에서 관측한 HTTP(S) 요청은 0건, 주 페이지의 미처리 JavaScript 예외는 0건입니다. CSP 해시·외부 리소스 부재도 검사했습니다. 브라우저/OS 전체를 패킷 캡처한 결과나 보안 인증은 아닙니다.

390px 모바일 주요 화면의 가로 넘침을 검사하고 밝은/어두운 화면과 모바일 검색 버튼을 육안 확인했습니다. 자동 검사는 모든 입력 조합, 모든 서버 버전, 기관 보안 승인을 대신하지 않습니다.

대상 승인 PC에서 탐색기 → 배포 ZIP → 모두 압축 풀기 → pocket-ops.html → Edge/Chrome으로 열고, 샘플 변환 → 복사 → 저장 → 종료/재실행 → 즐겨찾기·설정 유지 여부를 추가 확인하세요. 실제 업무 입력은 샘플 점검이 끝난 뒤 다루세요.

## 재현 경로

개발 PC의 시작 메뉴 → PowerShell → 저장소 폴더에서 `python make_data.py`, `python build.py`, `node tests/core.test.cjs`, `python tests/static_test.py`를 실행합니다. Python Playwright를 준비한 승인된 개발 환경에서는 `$env:CHROMIUM_PATH`를 설치된 Chrome/Edge 실행파일로 지정한 뒤 `python tests/browser_test.py`를 실행합니다. 상세 경로와 제한은 AGENTS.md를 참고하세요. 배포 HTML에는 개발용 Python·Node·Playwright가 필요하지 않습니다.
