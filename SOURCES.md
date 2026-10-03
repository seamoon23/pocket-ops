# 구현에 참고한 1차 기술 자료

외부 URL은 이 문서의 참고 자료입니다. 실행 HTML이 이 주소들에 접속하거나 내용을 다운로드하지 않습니다. 명령어 예제는 특정 서버에 대한 실제 실행 검증을 거친 운영 절차서가 아닙니다.

## 문자 인코딩

- WHATWG Encoding Standard: https://encoding.spec.whatwg.org/
  - TextEncoder, TextDecoder, 레거시 인코딩과 오류 처리. EUC-KR 브라우저 디코더 및 UTF-8 출력 범위.
- MDN TextDecoder: https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
- MDN TextEncoder: https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder

## 로컬 저장·복사·해시

- MDN Window.localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  - file URL에서의 저장소 동작이 브라우저별로 달라질 수 있음.
- MDN Clipboard.writeText: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
  - 보안 컨텍스트 및 권한 제약.
- MDN Document.execCommand: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
  - deprecated 복사 대체 경로. 미래 브라우저의 유지 보장을 하지 않음.
- MDN SubtleCrypto.digest: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
  - SHA 계열, 보안 컨텍스트, 전체 입력 메모리 처리.

## 크론

- crontab(5), Linux manual pages: https://man7.org/linux/man-pages/man5/crontab.5.html
  - 숫자 5필드, 일/요일 조건의 제한된 Vixie/Cronie 계열 해석에 참고.

## v0.2.0 명령어 검토 (2026-10-04)

이 자료는 명령 구문과 표시 범위를 검토한 근거입니다. 대상 작업 PC와 서버에서 실행했다는 의미는 아닙니다. Ubuntu 22.04·RHEL 7도 최소 설치, 계정 권한, 보안 정책에 따라 도구가 없을 수 있어 각 항목에 전제 조건을 표시했습니다. 대체 항목은 별도로 복사하며, 원본과 동일한 정보를 주지 못하는 경우 그 차이를 설명합니다.

- [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html)
  - `command -v`, 셸 인용, `/dev/tcp`, 비어 있는 `CATALINA_HOME`의 실행 중단 처리.
- [GNU Coreutils Manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)
  - `stat`, `ls`, `cat`, `tail`, `od`, `timeout`, `sha256sum`의 범위. 전체 명령 지원을 일괄 보장하지 않음.
- [Linux Kernel: /proc](https://www.kernel.org/doc/html/latest/filesystems/proc.html)
  - `meminfo`, `loadavg`, `net/dev` 원시 정보. 기본 파일 조회는 전문 명령의 모든 계산·표시 기능을 대체하지 않음.
- [Linux Kernel: /proc/net/tcp](https://www.kernel.org/doc/html/latest/networking/proc_net_tcp.html)
  - TCP 원시 주소·포트·상태 정보. 최신 인터페이스의 대안으로 권장되는 도구가 아니라 `ss`와 `netstat`가 모두 없을 때 제한적으로 제시.
- [RHEL 7 System Administrator's Guide: Log Files](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/system_administrators_guide/ch-viewing_and_managing_log_files)
  - `journalctl`과 서비스별 로그 조회, 조회 권한·저장 범위의 제약.
- [curl Manual](https://curl.se/docs/manpage.html), [옵션 도입 버전](https://curl.se/docs/optionswhen.html)
  - HTTP(S) 프로토콜 제한, 요청 시간 제한, 개인 설정 파일 생략(`-q`), URL 범위 확장 생략(`--globoff`). `--proto`는 7.21.0 이상 필요.

## Windows 11 · 기본 Windows PowerShell 5.1

- [Select-String](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/select-string?view=powershell-5.1)
  - `LiteralPath`, 고정 문자열 검색, UTF-8 지정과 문맥 줄 표시.
- [Get-ChildItem](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-childitem?view=powershell-5.1)
  - 재귀 탐색 없이 지정 폴더 파일 조회.
- [Get-WinEvent](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.diagnostics/get-winevent?view=powershell-5.1)
  - Application 로그의 오류·경고를 최대 50개 조회.
- [.NET GetActiveTcpListeners](https://learn.microsoft.com/en-us/dotnet/api/system.net.networkinformation.ipglobalproperties.getactivetcplisteners?view=netframework-4.8.1)
  - NetTCPIP 명령이 없을 때 사용할 로컬 수신 주소·포트 조회. PID 제공이나 제한 언어 모드 우회를 뜻하지 않음.

## DB 조회 예제

SQL은 해당 DB에 이미 접속한 승인된 클라이언트의 쿼리 창에서 사용합니다. 계정 비밀번호를 포함한 접속 문자열, 임의 입력의 SQL 보간, 데이터 수정 예제는 추가하지 않았습니다.

- [Oracle SYS_CONTEXT](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/SYS_CONTEXT.html), [Oracle NLS_SESSION_PARAMETERS](https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/NLS_SESSION_PARAMETERS.html)
  - 세션 계정·스키마·DB 이름과 세션 NLS 설정 조회.
- [MySQL Information Functions](https://dev.mysql.com/doc/refman/8.4/en/information-functions.html), [MySQL System Variables](https://dev.mysql.com/doc/refman/8.4/en/server-system-variables.html)
  - 서버 버전, 접속 사용자/권한 계정의 차이, 현재 DB와 세션 문자셋·시간대 조회.
- [MariaDB System Variables](https://mariadb.com/docs/server/server-management/variables-and-modes/server-system-variables)
  - 세션 문자셋과 시간대 변수 범위.
- [PostgreSQL 9.6 Information Functions](https://www.postgresql.org/docs/9.6/functions-info.html), [pg_settings](https://www.postgresql.org/docs/9.6/view-pg-settings.html)
  - 기존 PostgreSQL 환경에서도 사용할 수 있는 접속 정보와 설정 조회 구문.
- [CUBRID 9.3 Process Control](https://www.cubrid.org/manual/en/9.3.0/admin/control.html)
  - 기존 `cubrid broker status`, `cubrid service status` 예제의 조회 구문 확인.

## 해석 주의

이 버전은 위 API와 문법의 일부만 구현합니다. 이름이 비슷하더라도 모든 인코딩·모든 크론 문법·모든 셸·모든 브라우저를 지원한다는 뜻이 아닙니다. 실제 지원 범위는 README와 화면의 안내를 따르세요.
