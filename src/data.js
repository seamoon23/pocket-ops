/* Curated offline reference data. Never auto-executed. */
window.PocketData = {
  "version": "0.7.0",
  "commands": [
    {
      "id": "cmd-001",
      "title": "배포판과 버전 확인",
      "group": "기본 점검",
      "command": "cat /etc/os-release",
      "note": "RHEL·Ubuntu 등 배포판 정보를 확인합니다. 아주 오래된 배포판은 파일이 없을 수 있습니다.",
      "tags": "리눅스 버전 redhat centos ubuntu OS",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-002",
      "title": "커널 · CPU 아키텍처 확인",
      "group": "기본 점검",
      "command": "uname -a",
      "note": "커널 버전과 x86_64 등 아키텍처를 확인합니다.",
      "tags": "32비트 64비트 kernel",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-003",
      "title": "내 계정 · 그룹 · 권한 확인",
      "group": "기본 점검",
      "command": "id",
      "note": "root 없이 현재 UID, GID, 보조 그룹을 확인합니다. Docker 그룹도 확인할 수 있습니다.",
      "tags": "권한 사용자 그룹 uid gid",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-004",
      "title": "서버 이름과 현재 시간",
      "group": "기본 점검",
      "command": "hostname\ndate '+%Y-%m-%d %H:%M:%S %Z'",
      "note": "서버 시간대와 시간을 함께 확인합니다. 스케줄과 로그 시간을 비교할 때 유용합니다.",
      "tags": "시간 kst utc hostname",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-005",
      "title": "문자셋 · 로케일 확인",
      "group": "기본 점검",
      "command": "locale",
      "note": "LANG, LC_CTYPE 등을 확인합니다. 설정 조회만 하며 문자셋을 변경하지 않습니다.",
      "tags": "한글 깨짐 인코딩 euc-kr utf-8",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-006",
      "title": "명령어 경로 · 셸 정의 확인",
      "group": "기본 점검",
      "command": "command -v -- {{BIN}}",
      "note": "현재 셸에서 실행할 경로·별칭·함수를 확인합니다. 결과가 없어도 PATH 밖 설치 여부는 알 수 없습니다.",
      "tags": "which 없는 명령어 ping telnet nc",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-007",
      "title": "현재 디렉터리와 숨김 파일",
      "group": "기본 점검",
      "command": "pwd\nls -lah",
      "note": "현재 위치와 숨김 파일을 확인합니다.",
      "tags": "파일 폴더 목록",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-008",
      "title": "내 계정의 crontab 조회",
      "group": "기본 점검",
      "command": "crontab -l",
      "note": "조회만 합니다. 다른 계정이나 시스템 전체의 예약 작업은 이 결과만으로 알 수 없습니다.",
      "tags": "스케줄 배치 예약 크론",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 crontab 도구 · Cronie 또는 cron 패키지",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-009",
      "title": "가동 시간 · 서버 부하 확인",
      "group": "자원 · 프로세스",
      "command": "uptime",
      "note": "load average와 가동 시간을 확인합니다. CPU 사용률 자체를 뜻하지는 않습니다.",
      "tags": "느려짐 load cpu 부하",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [
        "cmd-095"
      ],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-010",
      "title": "메모리 · 스왑 사용량",
      "group": "자원 · 프로세스",
      "command": "free -m",
      "note": "MiB 기준 메모리와 swap을 확인합니다. 배포판 버전에 따라 컬럼 구성이 다릅니다.",
      "tags": "메모리 램 oom swap",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [
        "cmd-094"
      ],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-011",
      "title": "CPU · 메모리 · I/O 연속 확인",
      "group": "자원 · 프로세스",
      "command": "vmstat 1 5",
      "note": "1초 간격 5회 조회합니다. 첫 행은 부팅 이후 평균일 수 있습니다.",
      "tags": "느려짐 cpu io wait 스왑",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-012",
      "title": "내 프로세스 CPU 순으로 보기",
      "group": "자원 · 프로세스",
      "command": "ps -u \"$(id -un)\" -o pid,ppid,%cpu,%mem,etime,args --sort=-%cpu",
      "note": "현재 계정만 조회합니다. 실행 인수에 민감정보가 포함될 수 있어 반출 시 주의하세요.",
      "tags": "프로세스 cpu was 일반계정",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-013",
      "title": "프로세스 이름으로 PID 찾기",
      "group": "자원 · 프로세스",
      "command": "pgrep -af -- {{PATTERN}}",
      "note": "패턴은 정규식입니다. 전체 명령행에 비밀번호나 토큰이 보일 수 있습니다.",
      "tags": "pid java tomcat jeus 찾기",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [
        "cmd-096"
      ],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-014",
      "title": "특정 PID 상태와 가동 시간",
      "group": "자원 · 프로세스",
      "command": "ps -p {{PID}} -o pid,ppid,user,%cpu,%mem,etime,args",
      "note": "PID가 재사용될 수 있으므로 대상 이름과 계정을 함께 확인합니다.",
      "tags": "pid 프로세스 시작시간",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-015",
      "title": "프로세스의 작업 디렉터리",
      "group": "자원 · 프로세스",
      "command": "ls -l -- /proc/{{PID}}/cwd",
      "note": "다른 계정 프로세스는 /proc 보안 정책 때문에 조회되지 않을 수 있습니다.",
      "tags": "설치 경로 프로세스 cwd",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-016",
      "title": "내 프로세스 스레드 확인",
      "group": "자원 · 프로세스",
      "command": "ps -L -p {{PID}} -o pid,tid,%cpu,stat,comm",
      "note": "스레드별 상태를 확인합니다. TID를 16진수로 바꾸면 Java 덤프와 비교할 수 있습니다.",
      "tags": "쓰레드 스레드 thread cpu",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-017",
      "title": "내 계정 자원 제한",
      "group": "자원 · 프로세스",
      "command": "ulimit -a",
      "note": "현재 셸의 제한입니다. 이미 떠 있는 서비스의 설정과 다를 수 있습니다.",
      "tags": "open files too many files 제한",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-018",
      "title": "프로세스에 정상 종료 요청",
      "group": "자원 · 프로세스",
      "command": "kill -TERM {{PID}}",
      "note": "대상이 종료될 수 있습니다. 계정·서비스 영향·재기동 계획 확인 후 실행하세요. 강제 종료(-9)는 제공하지 않습니다.",
      "tags": "종료 stop kill",
      "risk": "change",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-019",
      "title": "디스크 사용량 확인",
      "group": "디스크 · 파일",
      "command": "df -hP",
      "note": "파일시스템별 남은 공간을 확인합니다. 네트워크 마운트 상태에 따라 지연될 수 있습니다.",
      "tags": "용량 full disk 디스크 꽉참",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-020",
      "title": "inode 고갈 확인",
      "group": "디스크 · 파일",
      "command": "df -iP",
      "note": "용량은 남아 있는데 파일이 안 만들어질 때 inode를 확인합니다.",
      "tags": "no space left 작은파일 inode",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-021",
      "title": "폴더 전체 용량 확인",
      "group": "디스크 · 파일",
      "command": "du -sh -- {{DIR}}",
      "note": "폴더를 순회하므로 파일이 많으면 디스크 I/O가 발생합니다. 범위를 작게 지정하세요.",
      "tags": "폴더 크기 로그 용량",
      "risk": "load",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-022",
      "title": "바로 아래 폴더 용량 정렬",
      "group": "디스크 · 파일",
      "command": "du -xhd 1 -- {{DIR}} | sort -h",
      "note": "GNU du 기준입니다. -x는 다른 파일시스템을 넘지 않도록 제한합니다. 대형 경로는 부하에 주의하세요.",
      "tags": "큰폴더 디스크 정리",
      "risk": "load",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-023",
      "title": "큰 파일 찾기 · 100MB 이상",
      "group": "디스크 · 파일",
      "command": "find {{DIR}} -maxdepth 3 -type f -size +100M -print",
      "note": "지정 경로의 3단계까지만 조회합니다. 삭제하지 않습니다. 권한 없는 경로는 누락될 수 있습니다.",
      "tags": "대용량 파일 찾기",
      "risk": "load",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-024",
      "title": "최근 60분 변경 파일",
      "group": "디스크 · 파일",
      "command": "find {{DIR}} -maxdepth 3 -type f -mmin -60 -print",
      "note": "수정 시각 기준입니다. 생성 시간이나 실제 배포 시간을 보장하지 않습니다.",
      "tags": "배포 변경 파일 시간",
      "risk": "load",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-025",
      "title": "파일 상세 정보 확인",
      "group": "디스크 · 파일",
      "command": "stat -- {{FILE}}",
      "note": "권한, 크기, 접근·변경 시각을 확인합니다. ctime은 생성 시각이 아닙니다.",
      "tags": "stat 날짜 파일정보",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [
        "cmd-100"
      ],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-026",
      "title": "심볼릭 링크 실제 경로",
      "group": "디스크 · 파일",
      "command": "readlink -f -- {{PATH}}",
      "note": "GNU readlink 기준입니다. 공용 Tomcat 링크가 실제 어떤 설치 경로를 가리키는지 확인합니다.",
      "tags": "tomcat 링크 심볼릭 경로",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-027",
      "title": "압축 파일 내용만 확인",
      "group": "디스크 · 파일",
      "command": "tar --force-local -tzf {{ARCHIVE}}",
      "note": "목록을 읽기 위해 압축 파일 전체를 검사합니다. 파일명에 콜론이 있어도 로컬 파일로 해석합니다. 큰 파일은 점검 시간을 고려하세요.",
      "tags": "tar gz 압축 목록",
      "risk": "load",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Linux의 기존 GNU tar 및 gzip · 로컬 파일 읽기 권한",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-028",
      "title": "파일 SHA-256 확인",
      "group": "디스크 · 파일",
      "command": "sha256sum -- {{FILE}}",
      "note": "반입 전후 같은 파일인지 해시를 비교합니다. 해시만으로 공급자의 신원을 검증하지는 못합니다.",
      "tags": "checksum 무결성 반입",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-029",
      "title": "파일 인코딩 추정",
      "group": "디스크 · 파일",
      "command": "file --mime -- {{FILE}}",
      "note": "file 명령의 추정 결과입니다. 인코딩을 확정하는 판정은 아닙니다.",
      "tags": "문자셋 utf8 euc-kr 한글",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 file 도구 · 없으면 od로 헤더만 확인 가능",
      "alternatives": [
        "cmd-030"
      ],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-030",
      "title": "바이너리 앞부분 64바이트",
      "group": "디스크 · 파일",
      "command": "od -An -tx1 -N64 -- {{FILE}}",
      "note": "별도 xxd가 없는 환경에서 BOM이나 파일 헤더를 확인할 수 있습니다.",
      "tags": "hex 16진수 xxd 대체 BOM",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-031",
      "title": "EUC-KR 파일을 UTF-8로 출력",
      "group": "디스크 · 파일",
      "command": "iconv -f EUC-KR -t UTF-8 -- {{FILE}}",
      "note": "표준출력으로만 변환합니다. 원본을 덮어쓰지 않습니다. CP949 확장문자는 별도 CP949 지정이 필요할 수 있습니다.",
      "tags": "인코딩 한글 깨짐 변환",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 iconv · 지원 인코딩 목록은 설치 버전에 따라 다름",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-032",
      "title": "마지막 로그 200줄",
      "group": "로그 분석",
      "command": "tail -n 200 -- {{LOG}}",
      "note": "파일 끝 200줄만 읽습니다. 큰 로그 전체를 열 필요가 없습니다.",
      "tags": "tail 오류 로그 보기",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-033",
      "title": "로그 실시간 보기 · 교체 추적",
      "group": "로그 분석",
      "command": "tail -F -- {{LOG}}",
      "note": "GNU tail 기준입니다. 파일 교체·재생성을 추적합니다. 종료는 Ctrl+C입니다.",
      "tags": "실시간 tail follow 로그 로테이션",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-034",
      "title": "문자 그대로 검색 · 줄번호",
      "group": "로그 분석",
      "command": "grep -n -F -- {{PATTERN}} {{LOG}}",
      "note": "정규식이 아니라 고정 문자열로 검색합니다. 점·괄호가 포함된 메시지에도 유용합니다.",
      "tags": "grep 에러 error exception",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-035",
      "title": "오류 앞뒤 3줄 함께 보기",
      "group": "로그 분석",
      "command": "grep -n -C 3 -F -- {{PATTERN}} {{LOG}}",
      "note": "일치 줄과 앞뒤 문맥을 표시합니다. 스택 트레이스는 더 긴 범위가 필요할 수 있습니다.",
      "tags": "exception stacktrace 앞뒤 문맥",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-036",
      "title": "여러 오류 단어 검색",
      "group": "로그 분석",
      "command": "grep -n -E 'ERROR|Exception|Caused by' -- {{LOG}}",
      "note": "대소문자를 구분하는 확장 정규식입니다. 로그 형식에 맞춰 단어를 조정하세요.",
      "tags": "java 에러 예외 caused by",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-037",
      "title": "건강 확인 로그 제외하기",
      "group": "로그 분석",
      "command": "grep -v -F -- {{PATTERN}} {{LOG}}",
      "note": "패턴이 없는 줄을 출력합니다. 원본 파일은 수정하지 않습니다.",
      "tags": "health 제외 필터링",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-038",
      "title": "특정 줄 범위만 보기",
      "group": "로그 분석",
      "command": "sed -n '{{START}},{{END}}p' -- {{LOG}}",
      "note": "시작·끝 줄번호를 지정합니다. 인덱스가 아니라 1부터 시작하는 줄번호입니다.",
      "tags": "sed 구간 라인",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-039",
      "title": "압축 로그 검색",
      "group": "로그 분석",
      "command": "zgrep -n -F -- {{PATTERN}} {{ARCHIVE}}",
      "note": "gzip 계열 zgrep 설치가 필요합니다. 압축을 풀어 저장하지 않고 검색합니다.",
      "tags": "gz gzip log 과거로그",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [
        "cmd-099"
      ],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-040",
      "title": "로그 파일 목록 찾기",
      "group": "로그 분석",
      "command": "find {{DIR}} -maxdepth 3 -type f -name '*.log' -print",
      "note": "지정 경로 안에서만 찾습니다. 설치 위치를 모른다고 / 전체를 바로 검색하지 않도록 합니다.",
      "tags": "로그 경로 jeus webtob tomcat",
      "risk": "load",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-041",
      "title": "파일의 줄 수 확인",
      "group": "로그 분석",
      "command": "wc -l -- {{LOG}}",
      "note": "개행 문자 수를 셉니다. 마지막 줄이 개행 없이 끝나면 화면상의 줄 수와 다를 수 있습니다.",
      "tags": "건수 count 요청수",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-042",
      "title": "동일한 줄의 빈도 집계",
      "group": "로그 분석",
      "command": "sort -- {{FILE}} | uniq -c | sort -nr | head -n 20",
      "note": "작은 발췌 파일에 사용하세요. 전체 로그 정렬은 CPU·메모리·임시 디스크를 쓸 수 있습니다.",
      "tags": "중복 빈도 top 집계",
      "risk": "load",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-043",
      "title": "열려 있는 TCP 포트",
      "group": "네트워크",
      "command": "ss -lnt",
      "note": "수신 중인 TCP 소켓을 확인합니다. 방화벽 통과나 외부 연결 가능 여부까지 증명하지 않습니다.",
      "tags": "포트 안열림 listen bind",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 iproute2의 ss · Ubuntu 22.04 / RHEL 7 대상",
      "alternatives": [
        "cmd-046",
        "cmd-097"
      ],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-044",
      "title": "특정 포트 리스닝 확인",
      "group": "네트워크",
      "command": "ss -lnt \"( sport = :{{PORT}} )\"",
      "note": "로컬 포트가 리스닝 중인지 확인합니다. PID 없이도 일반 계정으로 조회 가능한 경우가 많습니다.",
      "tags": "port 8080 8111 충돌",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-045",
      "title": "포트를 점유한 프로세스",
      "group": "네트워크",
      "command": "ss -lntp",
      "note": "다른 계정의 PID나 프로그램명은 보이지 않을 수 있습니다. 빈 칸을 미설치로 판단하지 마세요.",
      "tags": "포트 점유 pid",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-046",
      "title": "ss 대체 · netstat가 이미 있을 때",
      "group": "네트워크",
      "command": "netstat -lnt",
      "note": "이미 설치된 net-tools가 있을 때만 사용합니다. 없으면 대체 항목의 /proc 원시 정보를 확인할 수 있지만 포트·PID를 같은 형태로 보여주지는 않습니다.",
      "tags": "netstat 대체 command not found",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 net-tools의 netstat · 신규 설치를 전제로 하지 않음",
      "alternatives": [
        "cmd-097"
      ],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-047",
      "title": "연결된 TCP 세션 확인",
      "group": "네트워크",
      "command": "ss -ant state established",
      "note": "현재 연결 목록을 확인합니다. DB 커넥션 풀 상태는 DB 측 조회와 함께 판단해야 합니다.",
      "tags": "db 커넥션 세션 established",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-048",
      "title": "기본 경로 · IP 확인",
      "group": "네트워크",
      "command": "ip route\nip address",
      "note": "Ubuntu 22.04 / RHEL 7의 iproute2 기준입니다. 구형 RHEL 7에서도 사용할 수 있도록 -br 옵션을 쓰지 않습니다.",
      "tags": "아이피 라우팅 게이트웨이 vpn",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [
        "cmd-098"
      ],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-049",
      "title": "이름 해석 확인",
      "group": "네트워크",
      "command": "getent hosts -- {{HOST}}",
      "note": "/etc/hosts와 시스템 이름 해석 설정을 따릅니다. 승인된 내부 대상만 지정하세요.",
      "tags": "dns 도메인 hosts",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-050",
      "title": "HTTP 응답 헤더 확인",
      "group": "네트워크",
      "command": "curl -q --globoff --proto '=http,https' -I --connect-timeout 5 --max-time 10 -- {{URL}}",
      "note": "HEAD 요청을 보냅니다. -q는 개인 curl 설정 파일을 생략하며 TLS 검증을 끄지 않습니다. 헤더만으로 서버 설치 여부를 확정할 수 없습니다.",
      "tags": "curl webtob waf 헤더 접속",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 curl 7.21.0 이상 · 승인된 내부 HTTP(S) 대상",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-051",
      "title": "HTTP 코드 · 응답 시간 확인",
      "group": "네트워크",
      "command": "curl -q --globoff --proto '=http,https' -sS -o /dev/null --connect-timeout 5 --max-time 15 -w 'HTTP=%{http_code} TOTAL=%{time_total}s\\n' -- {{URL}}",
      "note": "승인된 대상에 GET 요청을 1회 보냅니다. 개인 curl 설정·URL 범위 확장을 생략합니다. 상태 변경 URL은 사용하지 마세요. 인증정보가 포함된 URL은 저장하지 마세요.",
      "tags": "http 장애 지연 응답 속도",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 curl 7.21.0 이상 · 승인된 내부 HTTP(S) 대상",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-052",
      "title": "ping · telnet · nc 없는 TCP 확인",
      "group": "네트워크",
      "command": "timeout 3 bash -c 'exec 3<>\"/dev/tcp/$1/$2\"' _ {{HOST}} {{PORT}}",
      "note": "Bash의 /dev/tcp 기능과 timeout이 필요합니다. TCP 연결만 시도하며 종료코드 0은 연결 성공입니다.",
      "tags": "도구없음 최소컨테이너 연결 테스트",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Bash /dev/tcp 지원 + 기존 GNU timeout · 승인된 내부 대상",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-053",
      "title": "경로별 디렉터리 권한 확인",
      "group": "계정 · 권한",
      "command": "namei -l -- {{PATH}}",
      "note": "상위 디렉터리의 실행(x) 권한 누락을 찾습니다. util-linux의 namei가 필요합니다.",
      "tags": "permission denied 접근불가",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 util-linux의 namei",
      "alternatives": [
        "cmd-100"
      ],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-054",
      "title": "폴더 소유자 · 권한 확인",
      "group": "계정 · 권한",
      "command": "ls -ld -- {{DIR}}",
      "note": "폴더 자체의 권한을 봅니다. 내부 목록과는 다릅니다.",
      "tags": "owner group chmod 권한",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-055",
      "title": "현재 umask 조회",
      "group": "계정 · 권한",
      "command": "umask\numask -S",
      "note": "새 파일·디렉터리에 적용될 마스크를 확인합니다. 변경하지 않습니다.",
      "tags": "umask 기본권한",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-056",
      "title": "ACL 확인",
      "group": "계정 · 권한",
      "command": "getfacl -- {{PATH}}",
      "note": "ACL 도구 설치가 필요합니다. 기본 rwx 권한만으로 설명되지 않는 문제에 유용합니다.",
      "tags": "acl 접근제어 권한",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 acl 패키지의 getfacl · 기본 ls만으로 ACL 전체를 확인할 수 없음",
      "alternatives": [
        "cmd-100"
      ],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-057",
      "title": "내 계정 읽기 · 쓰기 권한 확인",
      "group": "계정 · 권한",
      "command": "test -r {{PATH}} && printf 'READ: yes\\n' || printf 'READ: no\\n'\ntest -w {{PATH}} && printf 'WRITE: yes\\n' || printf 'WRITE: no\\n'",
      "note": "접근 가능 여부만 점검합니다. 실제 쓰기는 하지 않으며 마운트·ACL 등의 후속 오류까지 보장하지는 않습니다.",
      "tags": "권한 테스트 일반계정",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-058",
      "title": "파일 권한을 640으로 변경",
      "group": "계정 · 권한",
      "command": "chmod 640 -- {{FILE}}",
      "note": "실제 권한이 변경됩니다. 파일의 용도를 확인하세요. 실행 파일·디렉터리에 그대로 적용하지 마세요.",
      "tags": "chmod 권한변경 777 대안",
      "risk": "change",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-059",
      "title": "Java 런타임 버전",
      "group": "Java · WAS",
      "command": "java -version",
      "note": "PATH에 잡힌 Java입니다. 실행 중인 WAS의 Java와 다를 수 있습니다.",
      "tags": "jdk jre 1.6 1.8 17",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-060",
      "title": "Java · WAS 프로세스 확인",
      "group": "Java · WAS",
      "command": "ps -ef | grep -Ei '[j]ava|[j]eus|[w]ebtob|[h]th|[h]tl|[w]sm'",
      "note": "OS 프로세스 수준 조회입니다. 결과 없음이 제품 미설치를 증명하지 않습니다. 전체 인수 반출 시 주의하세요.",
      "tags": "jeus webtob tomcat jboss 설치 확인",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-061",
      "title": "WAS 관련 환경변수 확인",
      "group": "Java · WAS",
      "command": "printf 'JAVA_HOME=%s\\nJEUS_HOME=%s\\nWEBTOBDIR=%s\\nCATALINA_HOME=%s\\nCATALINA_BASE=%s\\n' \"$JAVA_HOME\" \"$JEUS_HOME\" \"$WEBTOBDIR\" \"$CATALINA_HOME\" \"$CATALINA_BASE\"",
      "note": "현재 셸의 설정일 뿐입니다. 빈 값이면 설치 스크립트나 실행 프로세스에서 추가 확인이 필요합니다.",
      "tags": "환경변수 설치경로 일반계정",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-062",
      "title": "JDK 프로세스 목록",
      "group": "Java · WAS",
      "command": "jps -lv",
      "note": "JDK 도구이며 JRE에는 없을 수 있습니다. 동일 계정 프로세스 위주로 확인됩니다.",
      "tags": "jps pid jdk",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 호환 JDK의 jps · JRE만 있으면 사용 불가",
      "alternatives": [
        "cmd-060"
      ],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-063",
      "title": "Java GC 상태 5회 조회",
      "group": "Java · WAS",
      "command": "jstat -gcutil {{PID}} 1000 5",
      "note": "대상 JVM과 호환되는 JDK 도구·동일 사용자 권한이 필요합니다. JVM 보안 설정에 따라 실패할 수 있습니다.",
      "tags": "gc 메모리 누수 jstat",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 호환 JDK의 jstat · 대상 JVM과 동일 사용자 권한",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-064",
      "title": "Java 스레드 덤프 출력",
      "group": "Java · WAS",
      "command": "jstack {{PID}}",
      "note": "Attach가 순간적인 부하나 지연을 줄 수 있습니다. 승인된 시점에 같은 사용자·호환 JDK로 실행하세요.",
      "tags": "쓰레드 thread dump 장애",
      "risk": "load",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 호환 JDK의 jstack · Attach 허용과 작업 시점 승인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-065",
      "title": "JVM 버전 직접 확인 · JDK 8+",
      "group": "Java · WAS",
      "command": "jcmd {{PID}} VM.version",
      "note": "JDK 6 환경에는 jcmd가 없습니다. 대상 JVM 호환성·동일 계정·Attach 허용 여부가 필요합니다.",
      "tags": "jcmd vm 버전",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 호환 JDK 8+의 jcmd · 동일 계정·Attach 허용",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-066",
      "title": "Tomcat 버전 스크립트",
      "group": "Java · WAS",
      "command": "sh \"${CATALINA_HOME:?CATALINA_HOME 설정을 확인하세요}/bin/version.sh\"",
      "note": "CATALINA_HOME이 비어 있으면 실행을 중단합니다. 신뢰할 수 있는 Tomcat 설치 경로인지 먼저 확인하세요.",
      "tags": "tomcat 버전 보안점검",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-067",
      "title": "Tomcat 커넥터 설정 발췌",
      "group": "Java · WAS",
      "command": "grep -n -E 'Connector|Server port=|port=|address=' -- {{FILE}}",
      "note": "server.xml의 관련 줄을 찾는 보조 도구입니다. 주석·멀티라인 XML을 해석하지는 않습니다.",
      "tags": "server.xml 포트 connector",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-068",
      "title": "JEUS 관리자 도구 경로만 확인",
      "group": "Java · WAS",
      "command": "command -v jeusadmin",
      "note": "JEUS 관리자 인증 없이 설치 도구 경로만 확인합니다. PATH에 없으면 설치 여부는 미확정입니다.",
      "tags": "jeus6 관리자 모름 root 없음",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-069",
      "title": "WebtoB 관리 도구 경로 확인",
      "group": "Java · WAS",
      "command": "command -v wsadmin\ncommand -v wsboot",
      "note": "관리 명령을 실행하거나 WebtoB를 기동하지 않고 경로만 확인합니다.",
      "tags": "webtob wsadmin wsboot web 계정",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-070",
      "title": "JBoss 제품 설정 보기",
      "group": "Java · WAS",
      "command": "cat -- {{FILE}}",
      "note": "JBoss 설치 경로의 bin/product.conf를 대상으로 사용하세요. 내용은 배포판별로 다를 수 있습니다.",
      "tags": "jboss eap 제품 버전",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-071",
      "title": "WAR · JAR 목록 보기",
      "group": "Java · WAS",
      "command": "jar tf {{ARCHIVE}}",
      "note": "JDK의 jar 도구가 필요합니다. 압축을 풀거나 변경하지 않습니다.",
      "tags": "jar war class 라이브러리",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 JDK의 jar · 설치된 경우만",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-072",
      "title": "RHEL 설치 패키지에서 웹 관련 검색",
      "group": "Java · WAS",
      "command": "rpm -qa | grep -Ei 'httpd|nginx|mod_security|tomcat'",
      "note": "RPM 등록 내역만 검색합니다. 수동 설치·컨테이너·앞단 WAF는 누락될 수 있습니다.",
      "tags": "redhat rhel7 centos waf 보안점검",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "RHEL 7 · RPM 패키지 조회",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-073",
      "title": "Ubuntu 설치 패키지 검색",
      "group": "Java · WAS",
      "command": "dpkg-query -W | grep -Ei 'apache2|nginx|modsecurity|tomcat'",
      "note": "Debian/Ubuntu 패키지 등록 내역입니다. 미검색을 미설치로 단정하지 마세요.",
      "tags": "ubuntu apt 패키지 설치",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 · dpkg 패키지 조회",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-074",
      "title": "실행 중인 컨테이너 목록",
      "group": "Docker",
      "command": "docker ps",
      "note": "Docker 데몬 접근 권한이 필요합니다. 일반 계정이라도 Docker 권한은 높은 시스템 권한입니다.",
      "tags": "컨테이너 상태",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 Docker CLI·데몬과 승인된 조회 권한 · 추가 설치 없이 설치된 경우만",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-075",
      "title": "종료된 컨테이너까지 보기",
      "group": "Docker",
      "command": "docker ps -a",
      "note": "중지·생성 실패 상태를 포함하여 조회합니다. 컨테이너를 시작하지 않습니다.",
      "tags": "exited created 컨테이너",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 Docker CLI·데몬과 승인된 조회 권한 · 추가 설치 없이 설치된 경우만",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-076",
      "title": "컨테이너 로그 마지막 200줄",
      "group": "Docker",
      "command": "docker logs --tail 200 -- {{CONTAINER}}",
      "note": "로그 드라이버 설정에 따라 조회되지 않을 수 있습니다. 민감정보가 포함될 수 있습니다.",
      "tags": "컨테이너 로그 error",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 Docker CLI·데몬과 승인된 조회 권한 · 추가 설치 없이 설치된 경우만",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-077",
      "title": "컨테이너 자원 사용량 1회",
      "group": "Docker",
      "command": "docker stats --no-stream",
      "note": "스트리밍 없이 현재 자원 사용량을 표시합니다.",
      "tags": "docker cpu memory 메모리",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 Docker CLI·데몬과 승인된 조회 권한 · 추가 설치 없이 설치된 경우만",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-078",
      "title": "Docker 디스크 사용량",
      "group": "Docker",
      "command": "docker system df",
      "note": "사용량만 조회하며 이미지·볼륨·컨테이너를 정리하거나 삭제하지 않습니다.",
      "tags": "docker 용량 이미지 prune 대안",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 Docker CLI·데몬과 승인된 조회 권한 · 추가 설치 없이 설치된 경우만",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-079",
      "title": "Docker 엔진 · 클라이언트 버전",
      "group": "Docker",
      "command": "docker version",
      "note": "클라이언트와 서버 버전을 구분해 확인합니다. 서버 조회에는 데몬 접근이 필요합니다.",
      "tags": "docker 버전",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 Docker CLI·데몬과 승인된 조회 권한 · 추가 설치 없이 설치된 경우만",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-080",
      "title": "컨테이너 상태만 확인",
      "group": "Docker",
      "command": "docker inspect --format='{{.State.Status}}' -- {{CONTAINER}}",
      "note": "전체 inspect에 포함될 수 있는 환경변수·비밀번호 대신 상태 필드만 출력합니다.",
      "tags": "inspect status 환경변수 노출 방지",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 Docker CLI·데몬과 승인된 조회 권한 · 추가 설치 없이 설치된 경우만",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-081",
      "title": "컨테이너 포트 매핑",
      "group": "Docker",
      "command": "docker port -- {{CONTAINER}}",
      "note": "호스트에 공개된 포트 매핑을 확인합니다. 방화벽 허용 여부는 별도입니다.",
      "tags": "포트 mapping 연결",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "기존 Docker CLI·데몬과 승인된 조회 권한 · 추가 설치 없이 설치된 경우만",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-082",
      "title": "Oracle 클라이언트 위치",
      "group": "DB · 연동",
      "command": "command -v sqlplus",
      "note": "접속하지 않고 클라이언트 경로만 확인합니다.",
      "tags": "oracle 11g sqlplus",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "Linux의 기존 DB 도구·계정 환경 필요 · 미설치 상태에는 OS 수준 점검만 가능",
      "alternatives": [],
      "db": "oracle",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-083",
      "title": "Oracle TNS 이름 응답 확인",
      "group": "DB · 연동",
      "command": "tnsping {{ALIAS}}",
      "note": "Oracle 클라이언트 도구가 필요합니다. 인증 성공이나 DB 쿼리 가능 여부까지 확인하지는 않습니다.",
      "tags": "oracle tns db 연결",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "Linux의 기존 DB 도구·계정 환경 필요 · 미설치 상태에는 OS 수준 점검만 가능",
      "alternatives": [],
      "db": "oracle",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-084",
      "title": "CUBRID 브로커 상태",
      "group": "DB · 연동",
      "command": "cubrid broker status",
      "note": "CUBRID 설치 환경변수와 조회 권한이 필요합니다. 버전·설정에 따라 표시가 다를 수 있습니다.",
      "tags": "cubrid 브로커 커넥션",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "Linux의 기존 DB 도구·계정 환경 필요 · 미설치 상태에는 OS 수준 점검만 가능",
      "alternatives": [],
      "db": "cubrid",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-085",
      "title": "CUBRID 서비스 상태",
      "group": "DB · 연동",
      "command": "cubrid service status",
      "note": "서비스를 변경하지 않고 상태를 조회합니다. 설치 계정의 환경변수를 확인하세요.",
      "tags": "cubrid broker server 상태",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "Linux의 기존 DB 도구·계정 환경 필요 · 미설치 상태에는 OS 수준 점검만 가능",
      "alternatives": [],
      "db": "cubrid",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-086",
      "title": "MySQL 클라이언트 버전",
      "group": "DB · 연동",
      "command": "mysql --version",
      "note": "DB에 접속하지 않는 클라이언트 버전 조회입니다. 서버 버전과 다를 수 있습니다.",
      "tags": "mysql mariadb 버전",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "Linux의 기존 DB 도구·계정 환경 필요 · 미설치 상태에는 OS 수준 점검만 가능",
      "alternatives": [],
      "db": "mariadb",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-087",
      "title": "Oracle 기본 포트 확인",
      "group": "DB · 연동",
      "command": "ss -lnt \"( sport = :1521 )\"",
      "note": "로컬 1521 포트만 확인합니다. 실제 리스너 포트가 다른 환경은 포트를 변경하세요.",
      "tags": "oracle listener 포트",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "Linux의 기존 iproute2 · 로컬 Oracle 기본 포트 가정",
      "alternatives": [],
      "db": "oracle",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-088",
      "title": "Windows UTF-8 로그 끝 200줄",
      "group": "Windows",
      "command": "Get-Content -LiteralPath {{FILE}} -Tail 200 -Encoding UTF8",
      "note": "PowerShell에서 UTF-8 파일을 읽습니다. CP949 등 다른 인코딩은 한글 · 인코딩 진료소에서 먼저 확인하세요.",
      "tags": "powershell 윈도우 로그",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-089",
      "title": "Windows UTF-8 로그 실시간 보기",
      "group": "Windows",
      "command": "Get-Content -LiteralPath {{FILE}} -Tail 100 -Encoding UTF8 -Wait",
      "note": "PowerShell에서 UTF-8 파일을 읽습니다. 종료는 Ctrl+C입니다. 파일 교체 시 Linux tail -F와 같은 재연결을 보장하지 않습니다.",
      "tags": "powershell tail follow",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-090",
      "title": "Windows 리스닝 포트",
      "group": "Windows",
      "command": "Get-NetTCPConnection -State Listen",
      "note": "PowerShell NetTCPIP 모듈이 필요합니다. OS 버전과 권한에 따라 표시가 제한될 수 있습니다.",
      "tags": "윈도우 포트 pid",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [
        "cmd-108"
      ],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-091",
      "title": "Windows 파일 SHA-256",
      "group": "Windows",
      "command": "Get-FileHash -Algorithm SHA256 -LiteralPath {{FILE}}",
      "note": "망 반입 전·후 파일이 같은지 비교할 때 사용합니다.",
      "tags": "윈도우 해시 체크섬",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-092",
      "title": "Windows 프로세스 CPU 누적 순",
      "group": "Windows",
      "command": "Get-Process | Sort-Object CPU -Descending | Select-Object -First 10",
      "note": "CPU 컬럼은 대개 누적 CPU 시간으로 순간 사용률과 다릅니다.",
      "tags": "윈도우 cpu 작업관리자",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-093",
      "title": "Windows 지정 포트 TCP 확인",
      "group": "Windows",
      "command": "Test-NetConnection -ComputerName {{HOST}} -Port {{PORT}}",
      "note": "승인된 내부 대상에 연결을 시도합니다. 네트워크 정책에 따라 오래 걸릴 수 있습니다.",
      "tags": "윈도우 포트 연결 테스트",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-094",
      "title": "free 대체 · 커널 메모리 정보",
      "group": "자원 · 프로세스",
      "command": "cat /proc/meminfo",
      "note": "기본 cat과 /proc만 사용합니다. kB 단위 원시 항목이며 free의 used/available 계산과 같지 않습니다. 일부 구형 커널은 MemAvailable이 없습니다.",
      "tags": "free 없음 메모리 대체 proc",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-095",
      "title": "uptime 대체 · 커널 부하 정보",
      "group": "자원 · 프로세스",
      "command": "cat /proc/loadavg",
      "note": "앞의 3개 값은 1·5·15분 load average입니다. CPU 사용률이 아니며 CPU 대기와 I/O 대기도 영향을 줍니다.",
      "tags": "uptime 없음 load 부하 대체",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-096",
      "title": "pgrep 대체 · ps와 문자열 검색",
      "group": "자원 · 프로세스",
      "command": "ps -ef | grep -F -- {{PATTERN}}",
      "note": "기본 ps와 grep을 사용합니다. 정규식이 아닌 문자 그대로 검색하며 검색 명령 자체도 보일 수 있습니다. 인수에 포함된 민감정보에 주의하세요.",
      "tags": "pgrep 없음 프로세스 java 대체",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-097",
      "title": "ss · netstat 대체 · TCP 원시 정보",
      "group": "네트워크",
      "command": "cat /proc/net/tcp /proc/net/tcp6",
      "note": "현재 네트워크 네임스페이스의 원시 정보입니다. 주소·포트는 16진수이며 st 0A는 LISTEN입니다. PID나 외부 접속 가능 여부는 알 수 없습니다. IPv6 비활성 환경은 tcp6 파일이 없을 수 있습니다.",
      "tags": "ss netstat 없음 proc 포트 대체",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-098",
      "title": "ip 대체 · 인터페이스 통계",
      "group": "네트워크",
      "command": "cat /proc/net/dev",
      "note": "인터페이스 이름과 송수신 누적 바이트·오류만 확인합니다. IP 주소·라우팅은 이 출력으로 대체할 수 없습니다.",
      "tags": "ip ifconfig 없음 네트워크 대체",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-099",
      "title": "zgrep 대체 · gzip과 grep",
      "group": "로그 분석",
      "command": "gzip -cd -- {{ARCHIVE}} | grep -n -F -- {{PATTERN}}",
      "note": "이미 설치된 gzip과 grep을 사용합니다. 원본과 디스크에 압축 해제 파일을 쓰지 않지만 전체 압축 해제에 CPU를 사용합니다. 출력 없음은 gzip 오류 여부와 함께 확인하세요.",
      "tags": "zgrep 없음 gzip 압축 검색 대체",
      "risk": "load",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-100",
      "title": "stat 대체 · 기본 파일 속성",
      "group": "디스크 · 파일",
      "command": "ls -ld -- {{PATH}}",
      "note": "소유자·권한·크기·수정 시각을 간단히 봅니다. stat의 상세 시간·inode 정보 전체를 대신하지는 않습니다.",
      "tags": "stat namei getfacl 없음 대체 권한",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-101",
      "title": "서비스 상태 조회 · systemd",
      "group": "기본 점검",
      "command": "systemctl status --no-pager -- {{SERVICE}}",
      "note": "시작·중지하지 않습니다. SSH 서비스명은 보통 RHEL 7은 sshd.service, Ubuntu 22.04는 ssh.service입니다. 서비스가 중지되어 있으면 조회 명령도 0이 아닌 종료코드를 반환할 수 있습니다.",
      "tags": "systemd 서비스 상태 ssh",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 · systemd로 구동 중인 호스트",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-102",
      "title": "서비스 최근 로그 100줄 · systemd",
      "group": "로그 분석",
      "command": "journalctl -u {{SERVICE}} -n 100 --no-pager",
      "note": "현재 계정이 볼 수 있는 해당 unit 로그만 표시합니다. 기록 없음과 권한 부족을 구분하세요. journal이 없는 환경은 서비스의 실제 로그 파일을 tail로 확인하세요.",
      "tags": "systemd journalctl 서비스 로그",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "linux",
      "prerequisite": "Ubuntu 22.04 / RHEL 7 · systemd journal 조회 권한",
      "alternatives": [],
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-103",
      "title": "Windows PowerShell 버전 확인",
      "group": "Windows",
      "command": "$PSVersionTable",
      "note": "Windows 시작 메뉴 → Windows PowerShell을 검색해 엽니다. 기본 5.1을 기준으로 하며 PowerShell 7 추가 설치는 필요하지 않습니다.",
      "tags": "윈도우 powershell 버전 기본",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-104",
      "title": "Windows OS · 메모리 정보",
      "group": "Windows",
      "command": "Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object Caption, Version, OSArchitecture, LastBootUpTime, TotalVisibleMemorySize, FreePhysicalMemory",
      "note": "메모리 값은 KiB 단위입니다. 현재 로컬 PC만 조회하며 CIM 서비스 정책에 따라 조회가 제한될 수 있습니다.",
      "tags": "윈도우 버전 메모리 부팅 시간",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-105",
      "title": "Windows 디스크 남은 공간",
      "group": "Windows",
      "command": "Get-PSDrive -PSProvider FileSystem | Select-Object Name, Root, Used, Free",
      "note": "Used와 Free는 바이트 단위입니다. 현재 PowerShell에서 보이는 드라이브를 조회합니다. 네트워크 드라이브는 상태에 따라 지연될 수 있습니다.",
      "tags": "윈도우 용량 디스크 공간",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-106",
      "title": "Windows IP · 게이트웨이 확인",
      "group": "Windows",
      "command": "Get-NetIPConfiguration",
      "note": "로컬 네트워크 설정을 조회합니다. 어댑터가 꺼져 있거나 정책이 제한하면 일부 정보가 나오지 않을 수 있습니다.",
      "tags": "윈도우 ip dns 라우팅 게이트웨이",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 NetTCPIP 모듈",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-107",
      "title": "Windows DNS 이름 해석",
      "group": "Windows",
      "command": "Resolve-DnsName -Name {{HOST}}",
      "note": "승인된 내부 이름만 지정하세요. 시스템의 이름 해석 결과이며 해당 서비스의 접속 성공을 보장하지 않습니다.",
      "tags": "윈도우 dns 이름 도메인",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 DnsClient 모듈",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-108",
      "title": "Windows 포트 대체 · .NET 조회",
      "group": "Windows",
      "command": "[System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Select-Object Address, Port",
      "note": "NetTCPIP 명령이 없을 때 기존 .NET으로 로컬 수신 주소와 포트를 봅니다. PID는 제공하지 않습니다. 제한 언어 모드에서는 메서드 호출이 차단될 수 있습니다.",
      "tags": "윈도우 Get-NetTCPConnection 대체 포트",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-109",
      "title": "Windows 특정 PID 확인",
      "group": "Windows",
      "command": "Get-Process -Id {{PID}} | Select-Object Id, ProcessName, CPU, StartTime, Path",
      "note": "PID가 재사용될 수 있으므로 이름도 확인하세요. 다른 계정·보호 프로세스는 경로와 시작 시각을 읽지 못할 수 있습니다.",
      "tags": "윈도우 pid 프로세스 경로",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-110",
      "title": "Windows 서비스 목록 조회",
      "group": "Windows",
      "command": "Get-Service | Sort-Object Status, DisplayName | Select-Object Status, Name, DisplayName",
      "note": "로컬 서비스의 상태와 이름만 확인합니다. 서비스 시작·중지·시작 유형 변경을 하지 않습니다.",
      "tags": "윈도우 서비스 상태",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-111",
      "title": "Windows 최근 오류 · 경고 50개",
      "group": "Windows",
      "command": "Get-WinEvent -FilterHashtable @{LogName='Application'; Level=2,3} -MaxEvents 50 | Select-Object TimeCreated, Id, LevelDisplayName, ProviderName, Message",
      "note": "Application 로그의 오류·경고만 읽습니다. 일치 이벤트가 없으면 오류 메시지가 나올 수 있습니다. 메시지에 계정·경로가 포함될 수 있어 반출 전 확인하세요.",
      "tags": "윈도우 이벤트 오류 로그",
      "risk": "read",
      "permission": "limited",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-112",
      "title": "Windows UTF-8 로그 문자열 검색",
      "group": "Windows",
      "command": "Select-String -LiteralPath {{FILE}} -Pattern {{PATTERN}} -SimpleMatch -Encoding UTF8 -Context 3,3",
      "note": "UTF-8 파일에서 문자열을 검색하고 앞뒤 3줄을 표시합니다. CP949 파일은 한글 · 인코딩 진료소에서 원본 인코딩을 먼저 확인하세요.",
      "tags": "윈도우 grep 검색 로그 소스",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-113",
      "title": "Windows 바로 아래 파일 목록",
      "group": "Windows",
      "command": "Get-ChildItem -LiteralPath {{DIR}} -File | Select-Object Name, Length, LastWriteTime",
      "note": "지정 폴더의 파일만 조회합니다. 하위 폴더를 재귀 탐색하지 않아 범위가 과도하게 넓어지지 않습니다. Length는 바이트입니다.",
      "tags": "윈도우 파일 목록 소스 날짜",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-114",
      "title": "Windows 경로 ACL 조회",
      "group": "Windows",
      "command": "Get-Acl -LiteralPath {{PATH}} | Format-List Path, Owner, AccessToString",
      "note": "권한을 변경하지 않습니다. 파일 시스템 ACL을 보여주며 공유 권한·중첩 그룹을 포함한 최종 유효 권한 계산은 아닙니다.",
      "tags": "윈도우 권한 접근 거부 acl",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-115",
      "title": "Windows 명령어 경로 확인",
      "group": "Windows",
      "command": "Get-Command -Name {{BIN}} -ErrorAction SilentlyContinue | Select-Object Name, CommandType, Source, Definition",
      "note": "현재 세션에서 찾을 수 있는 명령을 보여줍니다. 빈 결과는 설치 부재의 증거가 아닙니다. 와일드카드 이름은 여러 항목을 표시할 수 있습니다.",
      "tags": "윈도우 명령 없음 경로 java ssh",
      "risk": "read",
      "permission": "user",
      "shell": "powershell",
      "domain": "windows",
      "prerequisite": "Windows 11 · 기본 Windows PowerShell 5.1 이상",
      "alternatives": [],
      "where": "Windows PowerShell · PS>"
    },
    {
      "id": "cmd-116",
      "title": "Oracle 접속 계정 · DB 확인",
      "group": "DB · 연동",
      "command": "SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') AS session_user,\n       SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS current_schema,\n       SYS_CONTEXT('USERENV', 'DB_NAME') AS db_name\nFROM dual;",
      "note": "기존 Oracle SQL 도구의 쿼리 창에서 실행하세요. 접속 세션과 기본 스키마를 읽습니다. PDB 구분이 필요한 환경은 별도로 확인하세요. Bash나 PowerShell 명령이 아닙니다.",
      "tags": "oracle 오라클 sql 계정 스키마 접속 확인",
      "risk": "read",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "기존에 설치·승인된 해당 DB 클라이언트와 접속 권한",
      "alternatives": [],
      "db": "oracle",
      "where": "SQL> · SQL"
    },
    {
      "id": "cmd-117",
      "title": "Oracle 세션 날짜 · 숫자 형식",
      "group": "DB · 연동",
      "command": "SELECT parameter, value\nFROM nls_session_parameters\nWHERE parameter IN ('NLS_DATE_FORMAT', 'NLS_TIMESTAMP_FORMAT', 'NLS_NUMERIC_CHARACTERS', 'NLS_LANGUAGE')\nORDER BY parameter;",
      "note": "현재 Oracle 세션의 NLS 설정만 조회합니다. DB 전체 문자셋이나 다른 애플리케이션 세션의 설정을 나타내지는 않습니다.",
      "tags": "oracle 오라클 sql 날짜 숫자 nls",
      "risk": "read",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "기존에 설치·승인된 해당 DB 클라이언트와 접속 권한",
      "alternatives": [],
      "db": "oracle",
      "where": "SQL> · SQL"
    },
    {
      "id": "cmd-118",
      "title": "MySQL · MariaDB 계정 · 버전",
      "group": "DB · 연동",
      "command": "SELECT VERSION() AS server_version, DATABASE() AS current_database,\n       CURRENT_USER() AS privilege_account, USER() AS login_identity;",
      "note": "기존 MySQL/MariaDB 쿼리 창에서 실행하세요. CURRENT_USER는 권한 판정 계정이고 USER는 접속 시 사용자·호스트입니다. DB를 선택하지 않았다면 DATABASE는 NULL입니다.",
      "tags": "mysql mariadb sql db 접속 버전 계정",
      "risk": "read",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "기존에 설치·승인된 해당 DB 클라이언트와 접속 권한",
      "alternatives": [],
      "db": "mariadb",
      "where": "MariaDB> · SQL"
    },
    {
      "id": "cmd-119",
      "title": "MySQL · MariaDB 문자셋 · 시간대",
      "group": "DB · 연동",
      "command": "SELECT @@character_set_client AS client_charset,\n       @@character_set_connection AS connection_charset,\n       @@character_set_results AS result_charset,\n       @@session.time_zone AS session_time_zone;",
      "note": "현재 세션의 변수를 조회합니다. 테이블·컬럼별 문자셋을 보장하지 않으며 time_zone이 SYSTEM이면 서버 OS 시간대의 영향도 확인하세요.",
      "tags": "mysql mariadb sql 문자셋 시간대 한글",
      "risk": "read",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "기존에 설치·승인된 해당 DB 클라이언트와 접속 권한",
      "alternatives": [],
      "db": "mariadb",
      "where": "MariaDB> · SQL"
    },
    {
      "id": "cmd-120",
      "title": "PostgreSQL 접속 계정 · 버전",
      "group": "DB · 연동",
      "command": "SELECT version(), current_database(), session_user, current_user;",
      "note": "기존 PostgreSQL 쿼리 창에서 실행하세요. 접속 DB와 세션 사용자·현재 권한 사용자를 조회합니다. 서버 버전 문자열을 반출할 때 내부 정보 여부를 확인하세요.",
      "tags": "postgresql postgres sql 버전 접속 계정",
      "risk": "read",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "기존에 설치·승인된 해당 DB 클라이언트와 접속 권한",
      "alternatives": [],
      "db": "postgresql",
      "where": "psql => · SQL"
    },
    {
      "id": "cmd-121",
      "title": "PostgreSQL 문자셋 · 시간대",
      "group": "DB · 연동",
      "command": "SELECT name, setting\nFROM pg_settings\nWHERE name IN ('server_encoding', 'client_encoding', 'TimeZone')\nORDER BY name;",
      "note": "PostgreSQL 설정 뷰에서 해당 세션에 보이는 문자셋과 시간대를 읽습니다. 설정을 변경하지 않습니다.",
      "tags": "postgresql postgres sql 문자셋 시간대 한글",
      "risk": "read",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "기존에 설치·승인된 해당 DB 클라이언트와 접속 권한",
      "alternatives": [],
      "db": "postgresql",
      "where": "psql => · SQL"
    },
    {
      "id": "cmd-122",
      "title": "CSQL 실행 옵션 확인",
      "group": "CUBRID · CSQL",
      "command": "csql",
      "note": "DB 이름을 생략하면 설치된 버전과 옵션 목록을 표시합니다. DB 이름 누락 메시지는 이 확인 과정에서 정상입니다.",
      "tags": "도움말 옵션 버전",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "승인된 SSH 도구 → 대상 Linux 서버 접속 → 셸 프롬프트 · 설치된 CUBRID CSQL 필요",
      "alternatives": [],
      "db": "cubrid",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-123",
      "title": "CSQL 조회 전용 접속",
      "group": "CUBRID · CSQL",
      "command": "csql -C -r -u {{DBUSER}} {{DBTARGET}}",
      "note": "클라이언트/서버 모드(-C)와 읽기 전용(-r)으로 접속합니다. 계정에 비밀번호가 있으면 CSQL의 비밀번호 프롬프트에 직접 입력하세요.",
      "tags": "SSH 로그인 접속 읽기 전용",
      "risk": "read",
      "permission": "user",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "승인된 SSH 도구 → 대상 Linux 서버 접속 → 셸 프롬프트 · 설치된 CUBRID CSQL 필요",
      "alternatives": [],
      "db": "cubrid",
      "step": "connect",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-124",
      "title": "CSQL 변경 작업용 접속",
      "group": "CUBRID · CSQL",
      "command": "csql -C --no-auto-commit -u {{DBUSER}} {{DBTARGET}}",
      "note": "변경 작업 전용 세션을 엽니다. 비밀번호는 CSQL 프롬프트에 입력하세요. 접속 후 ;database로 대상을, ;autocommit으로 OFF 표시를 확인합니다.",
      "tags": "SSH 로그인 접속 수동 커밋 트랜잭션",
      "risk": "change",
      "permission": "limited",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "승인된 SSH 도구 → 대상 Linux 서버 접속 → 셸 프롬프트 · 설치된 CUBRID CSQL 필요",
      "alternatives": [],
      "db": "cubrid",
      "step": "connect",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-125",
      "title": "CSQL 세션 도움말",
      "group": "CUBRID · CSQL",
      "command": ";help",
      "note": "현재 설치 버전이 지원하는 세션 명령을 표시합니다. 맨 앞에 세미콜론을 쓰고 Enter를 누릅니다.",
      "tags": "세션 명령",
      "risk": "read",
      "permission": "user",
      "shell": "csql",
      "domain": "db",
      "prerequisite": "SSH 셸 → CSQL 연결 → csql> 에 한 줄 입력",
      "alternatives": [],
      "db": "cubrid",
      "where": "csql> · CSQL 세션 명령"
    },
    {
      "id": "cmd-126",
      "title": "CSQL 접속 대상 확인",
      "group": "CUBRID · CSQL",
      "command": ";database",
      "note": "현재 연결한 DB 이름과 호스트를 확인합니다. 예상한 대상인지 변경 작업 전에 비교하세요.",
      "tags": "세션 명령",
      "risk": "read",
      "permission": "user",
      "shell": "csql",
      "domain": "db",
      "prerequisite": "SSH 셸 → CSQL 연결 → csql> 에 한 줄 입력",
      "alternatives": [],
      "db": "cubrid",
      "step": "check",
      "where": "csql> · CSQL 세션 명령"
    },
    {
      "id": "cmd-127",
      "title": "CSQL 테이블 구조 확인",
      "group": "CUBRID · CSQL",
      "command": ";schema pocket_ops_sample",
      "note": "예시 이름을 확인할 테이블명으로 바꿔 입력하세요. 컬럼, 타입, 제약 조건을 보고 SQL에 사용할 키를 확인합니다.",
      "tags": "세션 명령",
      "risk": "read",
      "permission": "user",
      "shell": "csql",
      "domain": "db",
      "prerequisite": "SSH 셸 → CSQL 연결 → csql> 에 한 줄 입력",
      "alternatives": [],
      "db": "cubrid",
      "step": "check",
      "where": "csql> · CSQL 세션 명령"
    },
    {
      "id": "cmd-128",
      "title": "CSQL 자동 커밋 상태 확인",
      "group": "CUBRID · CSQL",
      "command": ";autocommit",
      "note": "현재 설정을 표시합니다. ON이면 실행한 변경이 즉시 확정될 수 있습니다. 변경 작업은 새 수동 커밋 세션에서 시작하세요.",
      "tags": "세션 명령",
      "risk": "read",
      "permission": "user",
      "shell": "csql",
      "domain": "db",
      "prerequisite": "SSH 셸 → CSQL 연결 → csql> 에 한 줄 입력",
      "alternatives": [],
      "db": "cubrid",
      "step": "check",
      "where": "csql> · CSQL 세션 명령"
    },
    {
      "id": "cmd-129",
      "title": "CSQL 트랜잭션 확정",
      "group": "CUBRID · CSQL",
      "command": ";commit",
      "note": "현재 트랜잭션의 미확정 변경 전체를 저장합니다. 영향 행 수와 결과를 확인한 후 선택하세요. 확정 뒤에는 ;rollback으로 되돌릴 수 없습니다.",
      "tags": "세션 명령",
      "risk": "change",
      "permission": "user",
      "shell": "csql",
      "domain": "db",
      "prerequisite": "SSH 셸 → CSQL 연결 → csql> 에 한 줄 입력",
      "alternatives": [],
      "db": "cubrid",
      "step": "finish",
      "where": "csql> · CSQL 세션 명령"
    },
    {
      "id": "cmd-130",
      "title": "CSQL 트랜잭션 취소",
      "group": "CUBRID · CSQL",
      "command": ";rollback",
      "note": "현재 트랜잭션의 미확정 변경 전체를 취소합니다. 같은 세션의 다른 작업까지 포함되므로 범위를 확인하세요.",
      "tags": "세션 명령",
      "risk": "change",
      "permission": "user",
      "shell": "csql",
      "domain": "db",
      "prerequisite": "SSH 셸 → CSQL 연결 → csql> 에 한 줄 입력",
      "alternatives": [],
      "db": "cubrid",
      "step": "finish",
      "where": "csql> · CSQL 세션 명령"
    },
    {
      "id": "cmd-131",
      "title": "CSQL 종료",
      "group": "CUBRID · CSQL",
      "command": ";exit",
      "note": "미확정 작업을 먼저 확정하거나 취소한 뒤 종료합니다. 종료 시 나타나는 질문은 읽고 응답하세요.",
      "tags": "세션 명령",
      "risk": "change",
      "permission": "user",
      "shell": "csql",
      "domain": "db",
      "prerequisite": "SSH 셸 → CSQL 연결 → csql> 에 한 줄 입력",
      "alternatives": [],
      "db": "cubrid",
      "step": "finish",
      "where": "csql> · CSQL 세션 명령"
    },
    {
      "id": "cmd-132",
      "title": "SELECT · 키로 대상 행 확인",
      "group": "SQL · 기본 쿼리 프리셋",
      "command": "SELECT item_id, item_name\nFROM pocket_ops_sample\nWHERE item_id = 1001;",
      "note": "item_id가 기본 키인 가상 테이블 예시입니다. 실제 키와 조건에 맞게 수정해 조회하고, 변경 전 대상 행과 현재 값을 확인하세요. SQL 작업대에서 DB를 고르면 붙여넣을 프롬프트와 DB별 주의사항을 함께 표시합니다.",
      "tags": "조회 기본 csql cubrid mariadb mysql oracle postgresql psql sqlplus 쿼리 프리셋",
      "risk": "read",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "DB 클라이언트 접속 → csql> · MariaDB> · SQL> · psql => 프롬프트 · 예시 테이블 pocket_ops_sample의 이름·컬럼을 확인",
      "alternatives": [],
      "editorSql": "SELECT item_id, item_name\nFROM pocket_ops_sample\nWHERE item_id = 1001;",
      "where": "DB 클라이언트 · SQL"
    },
    {
      "id": "cmd-133",
      "title": "INSERT · 한 행 추가",
      "group": "SQL · 기본 쿼리 프리셋",
      "command": "-- INSERT INTO pocket_ops_sample (item_id, item_name)\n-- VALUES (1001, 'SAMPLE');",
      "note": "대상 키가 비어 있는지, 컬럼 타입과 필수 값이 맞는지 확인하세요. 앱에서 쿼리 정렬로 열어 예시 이름·값을 바꾸고 최종 SQL을 확인하세요. 원문 복사는 모든 줄에 주석을 붙입니다.",
      "tags": "변경 csql cubrid mariadb mysql oracle postgresql psql sqlplus 쿼리 프리셋",
      "risk": "change",
      "permission": "limited",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "DB 클라이언트 접속 → csql> · MariaDB> · SQL> · psql => 프롬프트 · 예시 테이블 pocket_ops_sample의 이름·컬럼을 확인 · 변경 권한과 자동 커밋 OFF 또는 트랜잭션 시작 확인",
      "alternatives": [],
      "editorSql": "INSERT INTO pocket_ops_sample (item_id, item_name)\nVALUES (1001, 'SAMPLE');",
      "where": "DB 클라이언트 · SQL"
    },
    {
      "id": "cmd-134",
      "title": "UPDATE · 키와 기존 값으로 수정",
      "group": "SQL · 기본 쿼리 프리셋",
      "command": "-- UPDATE pocket_ops_sample\n-- SET item_name = 'UPDATED'\n-- WHERE item_id = 1001 AND item_name = 'SAMPLE';",
      "note": "같은 WHERE 조건을 SELECT로 먼저 조회하고 변경할 행 수와 기존 값을 확인하세요. 앱에서 쿼리 정렬로 열어 예시 이름·값을 바꾸고 최종 SQL을 확인하세요. 원문 복사는 모든 줄에 주석을 붙입니다.",
      "tags": "변경 csql cubrid mariadb mysql oracle postgresql psql sqlplus 쿼리 프리셋",
      "risk": "change",
      "permission": "limited",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "DB 클라이언트 접속 → csql> · MariaDB> · SQL> · psql => 프롬프트 · 예시 테이블 pocket_ops_sample의 이름·컬럼을 확인 · 변경 권한과 자동 커밋 OFF 또는 트랜잭션 시작 확인",
      "alternatives": [],
      "editorSql": "UPDATE pocket_ops_sample\nSET item_name = 'UPDATED'\nWHERE item_id = 1001 AND item_name = 'SAMPLE';",
      "where": "DB 클라이언트 · SQL"
    },
    {
      "id": "cmd-135",
      "title": "DELETE · 키와 기존 값으로 삭제",
      "group": "SQL · 기본 쿼리 프리셋",
      "command": "-- DELETE FROM pocket_ops_sample\n-- WHERE item_id = 1001 AND item_name = 'SAMPLE';",
      "note": "같은 WHERE 조건을 SELECT로 먼저 조회하고 삭제할 행 수와 복구 방법을 확인하세요. 앱에서 쿼리 정렬로 열어 예시 이름·값을 바꾸고 최종 SQL을 확인하세요. 원문 복사는 모든 줄에 주석을 붙입니다.",
      "tags": "변경 csql cubrid mariadb mysql oracle postgresql psql sqlplus 쿼리 프리셋",
      "risk": "change",
      "permission": "limited",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "DB 클라이언트 접속 → csql> · MariaDB> · SQL> · psql => 프롬프트 · 예시 테이블 pocket_ops_sample의 이름·컬럼을 확인 · 변경 권한과 자동 커밋 OFF 또는 트랜잭션 시작 확인",
      "alternatives": [],
      "editorSql": "DELETE FROM pocket_ops_sample\nWHERE item_id = 1001 AND item_name = 'SAMPLE';",
      "where": "DB 클라이언트 · SQL"
    },
    {
      "id": "cmd-136",
      "title": "MariaDB 접속 · 안전 갱신 모드",
      "group": "MariaDB · mysql 클라이언트",
      "command": "mysql -h {{DBHOST}} -u {{DBUSER}} -p --safe-updates {{DBNAME}}",
      "note": "-p 뒤에 비밀번호를 붙이지 말고 Enter password 프롬프트에 입력하세요. --safe-updates는 키 조건이 없는 UPDATE·DELETE를 거부하고 SELECT 결과를 기본 1,000행으로 제한합니다. RHEL 7의 MariaDB 5.5는 mysql, Ubuntu 22.04는 mariadb 이름도 사용할 수 있습니다.",
      "tags": "mariadb mysql 접속 로그인 safe-updates",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "승인된 SSH 도구 → 대상 Linux 서버 접속 → 셸 프롬프트 · 이미 설치된 DB 클라이언트 필요",
      "alternatives": [],
      "db": "mariadb",
      "step": "connect",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-137",
      "title": "MariaDB 접속 대상 · 자동 커밋 확인",
      "group": "MariaDB · mysql 클라이언트",
      "command": "SELECT DATABASE() AS current_db, CURRENT_USER() AS account,\n       @@hostname AS server, @@autocommit AS autocommit;",
      "note": "autocommit이 1이면 각 변경 문장이 즉시 확정됩니다. 변경 전에 START TRANSACTION;을 먼저 실행하세요.",
      "tags": "mariadb mysql 접속 대상 autocommit 확인",
      "risk": "read",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "MariaDB> (mysql/mariadb 클라이언트) 프롬프트에 입력",
      "alternatives": [],
      "db": "mariadb",
      "step": "check",
      "where": "MariaDB> · SQL"
    },
    {
      "id": "cmd-138",
      "title": "MariaDB 테이블 구조 확인",
      "group": "MariaDB · mysql 클라이언트",
      "command": "DESCRIBE pocket_ops_sample;",
      "note": "예시 이름을 확인할 테이블명으로 바꿔 입력하세요. 키 컬럼과 NULL 허용 여부를 확인합니다.",
      "tags": "mariadb mysql 테이블 컬럼 구조 describe",
      "risk": "read",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "MariaDB> (mysql/mariadb 클라이언트) 프롬프트에 입력",
      "alternatives": [],
      "db": "mariadb",
      "step": "check",
      "where": "MariaDB> · SQL"
    },
    {
      "id": "cmd-139",
      "title": "MariaDB 트랜잭션 시작",
      "group": "MariaDB · mysql 클라이언트",
      "command": "START TRANSACTION;",
      "note": "새 변경 세션에서만 시작하세요. 진행 중인 트랜잭션에서 다시 실행하면 이전 변경이 커밋됩니다. 대상 테이블이 InnoDB 등 트랜잭션 지원 엔진인지 확인하고 DDL은 분리하세요.",
      "tags": "mariadb mysql begin transaction 트랜잭션",
      "risk": "change",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "MariaDB> (mysql/mariadb 클라이언트) 프롬프트에 입력",
      "alternatives": [],
      "db": "mariadb",
      "step": "begin",
      "where": "MariaDB> · SQL"
    },
    {
      "id": "cmd-140",
      "title": "MariaDB 변경 확정",
      "group": "MariaDB · mysql 클라이언트",
      "command": "COMMIT;",
      "note": "영향 행 수와 SELECT 재확인 결과를 본 뒤 실행하세요. 확정 뒤에는 ROLLBACK으로 되돌릴 수 없습니다.",
      "tags": "mariadb mysql commit 확정",
      "risk": "change",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "MariaDB> (mysql/mariadb 클라이언트) 프롬프트에 입력",
      "alternatives": [],
      "db": "mariadb",
      "step": "finish",
      "where": "MariaDB> · SQL"
    },
    {
      "id": "cmd-141",
      "title": "MariaDB 변경 취소",
      "group": "MariaDB · mysql 클라이언트",
      "command": "ROLLBACK;",
      "note": "현재 트랜잭션의 미확정 변경 전체를 취소합니다. autocommit=1에서 START TRANSACTION 없이 실행한 문장은 이미 확정되어 취소되지 않습니다.",
      "tags": "mariadb mysql rollback 취소",
      "risk": "change",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "MariaDB> (mysql/mariadb 클라이언트) 프롬프트에 입력",
      "alternatives": [],
      "db": "mariadb",
      "step": "finish",
      "where": "MariaDB> · SQL"
    },
    {
      "id": "cmd-142",
      "title": "MariaDB 클라이언트 종료",
      "group": "MariaDB · mysql 클라이언트",
      "command": "exit",
      "note": "연결을 끊으면 미확정 트랜잭션은 롤백됩니다. 먼저 COMMIT; 또는 ROLLBACK;을 명시적으로 실행하세요.",
      "tags": "mariadb mysql 종료 quit",
      "risk": "change",
      "permission": "user",
      "shell": "mariadb",
      "domain": "db",
      "prerequisite": "MariaDB> (mysql/mariadb 클라이언트) 프롬프트에 입력",
      "alternatives": [],
      "db": "mariadb",
      "step": "finish",
      "where": "MariaDB> · 클라이언트 명령"
    },
    {
      "id": "cmd-143",
      "title": "Oracle SQL*Plus 접속",
      "group": "Oracle · SQL*Plus",
      "command": "sqlplus -L {{DBUSER}}@{{ALIAS}}",
      "note": "비밀번호는 Enter password 프롬프트에 입력하세요. user/password 형식으로 명령행에 넣으면 프로세스 목록·셸 기록에 남을 수 있습니다. -L은 로그인을 한 번만 시도합니다.",
      "tags": "oracle 오라클 sqlplus 접속 로그인",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "승인된 SSH 도구 → 대상 Linux 서버 접속 → 셸 프롬프트 · 이미 설치된 DB 클라이언트 필요 · 기존 Oracle 클라이언트와 TNS 별칭",
      "alternatives": [],
      "db": "oracle",
      "step": "connect",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-144",
      "title": "Oracle 접속 계정 · 자동 커밋 확인",
      "group": "Oracle · SQL*Plus",
      "command": "SHOW USER\nSHOW AUTOCOMMIT",
      "note": "SQL*Plus 기본값은 autocommit OFF입니다. ON으로 표시되면 SET AUTOCOMMIT OFF를 먼저 실행하세요.",
      "tags": "oracle sqlplus 계정 autocommit 확인",
      "risk": "read",
      "permission": "user",
      "shell": "sqlplus",
      "domain": "db",
      "prerequisite": "SQL> (SQL*Plus) 프롬프트에 입력",
      "alternatives": [],
      "db": "oracle",
      "step": "check",
      "where": "SQL> · SQL*Plus 명령"
    },
    {
      "id": "cmd-145",
      "title": "Oracle 테이블 구조 확인",
      "group": "Oracle · SQL*Plus",
      "command": "DESC pocket_ops_sample",
      "note": "예시 이름을 확인할 테이블명으로 바꿔 입력하세요. 스키마가 다르면 소유자.테이블 형식으로 지정합니다.",
      "tags": "oracle sqlplus desc describe 컬럼 구조",
      "risk": "read",
      "permission": "user",
      "shell": "sqlplus",
      "domain": "db",
      "prerequisite": "SQL> (SQL*Plus) 프롬프트에 입력",
      "alternatives": [],
      "db": "oracle",
      "step": "check",
      "where": "SQL> · SQL*Plus 명령"
    },
    {
      "id": "cmd-146",
      "title": "Oracle 치환 변수 끄기",
      "group": "Oracle · SQL*Plus",
      "command": "SET DEFINE OFF",
      "note": "값에 & 문자가 있으면 SQL*Plus가 입력값을 묻고 문장을 바꿉니다. & 가 든 SQL을 붙여넣기 전에 실행하세요.",
      "tags": "oracle sqlplus ampersand define 치환 변수",
      "risk": "read",
      "permission": "user",
      "shell": "sqlplus",
      "domain": "db",
      "prerequisite": "SQL> (SQL*Plus) 프롬프트에 입력",
      "alternatives": [],
      "db": "oracle",
      "step": "begin",
      "where": "SQL> · SQL*Plus 명령"
    },
    {
      "id": "cmd-147",
      "title": "Oracle 변경 확정",
      "group": "Oracle · SQL*Plus",
      "command": "COMMIT;",
      "note": "처리 행 수와 SELECT 재확인 결과를 본 뒤 실행하세요. 확정 뒤에는 ROLLBACK으로 되돌릴 수 없습니다.",
      "tags": "oracle commit 확정",
      "risk": "change",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "SQL> (SQL*Plus) 프롬프트에 입력",
      "alternatives": [],
      "db": "oracle",
      "step": "finish",
      "where": "SQL> · SQL"
    },
    {
      "id": "cmd-148",
      "title": "Oracle 변경 취소",
      "group": "Oracle · SQL*Plus",
      "command": "ROLLBACK;",
      "note": "마지막 COMMIT 이후의 미확정 변경을 취소합니다. DDL은 암시적으로 커밋되어 취소되지 않습니다.",
      "tags": "oracle rollback 취소",
      "risk": "change",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "SQL> (SQL*Plus) 프롬프트에 입력",
      "alternatives": [],
      "db": "oracle",
      "step": "finish",
      "where": "SQL> · SQL"
    },
    {
      "id": "cmd-149",
      "title": "Oracle 종료 · 미확정 변경 취소",
      "group": "Oracle · SQL*Plus",
      "command": "EXIT ROLLBACK",
      "note": "SQL*Plus의 EXIT는 기본적으로 미확정 변경을 커밋합니다. EXIT ROLLBACK은 취소한 뒤 종료합니다.",
      "tags": "oracle sqlplus exit 종료 rollback",
      "risk": "change",
      "permission": "user",
      "shell": "sqlplus",
      "domain": "db",
      "prerequisite": "SQL> (SQL*Plus) 프롬프트에 입력",
      "alternatives": [],
      "db": "oracle",
      "step": "finish",
      "where": "SQL> · SQL*Plus 명령"
    },
    {
      "id": "cmd-150",
      "title": "PostgreSQL 조회 전용 접속",
      "group": "PostgreSQL · psql",
      "command": "PGOPTIONS='-c default_transaction_read_only=on' psql -h {{DBHOST}} -U {{DBUSER}} -d {{DBNAME}}",
      "note": "새 트랜잭션을 읽기 전용으로 시작합니다. 비밀번호는 프롬프트에 입력하세요. 연결 풀러가 시작 옵션을 거부하면 일반 접속 후 SELECT만 사용하세요.",
      "tags": "postgresql postgres psql 접속 로그인 읽기 전용",
      "risk": "read",
      "permission": "limited",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "승인된 SSH 도구 → 대상 Linux 서버 접속 → 셸 프롬프트 · 이미 설치된 DB 클라이언트 필요",
      "alternatives": [],
      "db": "postgresql",
      "step": "connect",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-151",
      "title": "PostgreSQL 변경 작업용 접속 · 수동 커밋",
      "group": "PostgreSQL · psql",
      "command": "psql --set=AUTOCOMMIT=off -h {{DBHOST}} -U {{DBUSER}} -d {{DBNAME}}",
      "note": "AUTOCOMMIT off로 시작하면 첫 문장부터 트랜잭션이 열리고 COMMIT 전까지 확정되지 않습니다. 비밀번호는 프롬프트에 입력하세요.",
      "tags": "postgresql postgres psql 접속 수동 커밋 트랜잭션",
      "risk": "change",
      "permission": "limited",
      "shell": "bash",
      "domain": "db",
      "prerequisite": "승인된 SSH 도구 → 대상 Linux 서버 접속 → 셸 프롬프트 · 이미 설치된 DB 클라이언트 필요",
      "alternatives": [],
      "db": "postgresql",
      "step": "connect",
      "where": "Linux 셸 · $"
    },
    {
      "id": "cmd-152",
      "title": "PostgreSQL 접속 대상 · 자동 커밋 확인",
      "group": "PostgreSQL · psql",
      "command": "\\conninfo\n\\echo :AUTOCOMMIT",
      "note": "접속한 DB·사용자·호스트와 psql AUTOCOMMIT 값을 표시합니다. on이면 BEGIN;으로 트랜잭션을 먼저 여세요.",
      "tags": "postgresql psql conninfo autocommit 확인",
      "risk": "read",
      "permission": "user",
      "shell": "psql",
      "domain": "db",
      "prerequisite": "psql 프롬프트(DB이름=>)에 입력",
      "alternatives": [],
      "db": "postgresql",
      "step": "check",
      "where": "psql => · 메타 명령"
    },
    {
      "id": "cmd-153",
      "title": "PostgreSQL 테이블 구조 확인",
      "group": "PostgreSQL · psql",
      "command": "\\d pocket_ops_sample",
      "note": "예시 이름을 확인할 테이블명으로 바꿔 입력하세요. 스키마가 다르면 스키마.테이블 형식으로 지정합니다.",
      "tags": "postgresql psql describe 컬럼 구조",
      "risk": "read",
      "permission": "user",
      "shell": "psql",
      "domain": "db",
      "prerequisite": "psql 프롬프트(DB이름=>)에 입력",
      "alternatives": [],
      "db": "postgresql",
      "step": "check",
      "where": "psql => · 메타 명령"
    },
    {
      "id": "cmd-154",
      "title": "PostgreSQL 트랜잭션 시작",
      "group": "PostgreSQL · psql",
      "command": "BEGIN;",
      "note": "자동 커밋 세션에서 변경 전에 실행합니다. AUTOCOMMIT off 세션은 생략해도 되지만 실행해도 경고만 표시됩니다.",
      "tags": "postgresql psql begin transaction 트랜잭션",
      "risk": "read",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "psql 프롬프트(DB이름=>)에 입력",
      "alternatives": [],
      "db": "postgresql",
      "step": "begin",
      "where": "psql => · SQL"
    },
    {
      "id": "cmd-155",
      "title": "PostgreSQL 변경 확정",
      "group": "PostgreSQL · psql",
      "command": "COMMIT;",
      "note": "결과 행 수와 SELECT 재확인 결과를 본 뒤 실행하세요. 트랜잭션 중 오류가 났다면 COMMIT도 ROLLBACK으로 처리됩니다.",
      "tags": "postgresql commit 확정",
      "risk": "change",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "psql 프롬프트(DB이름=>)에 입력",
      "alternatives": [],
      "db": "postgresql",
      "step": "finish",
      "where": "psql => · SQL"
    },
    {
      "id": "cmd-156",
      "title": "PostgreSQL 변경 취소",
      "group": "PostgreSQL · psql",
      "command": "ROLLBACK;",
      "note": "현재 트랜잭션의 미확정 변경 전체를 취소합니다.",
      "tags": "postgresql rollback 취소",
      "risk": "change",
      "permission": "user",
      "shell": "sql",
      "domain": "db",
      "prerequisite": "psql 프롬프트(DB이름=>)에 입력",
      "alternatives": [],
      "db": "postgresql",
      "step": "finish",
      "where": "psql => · SQL"
    },
    {
      "id": "cmd-157",
      "title": "PostgreSQL psql 종료",
      "group": "PostgreSQL · psql",
      "command": "\\q",
      "note": "연결을 끊으면 미확정 트랜잭션은 롤백됩니다. 먼저 COMMIT; 또는 ROLLBACK;을 명시적으로 실행하세요.",
      "tags": "postgresql psql 종료 quit",
      "risk": "change",
      "permission": "user",
      "shell": "psql",
      "domain": "db",
      "prerequisite": "psql 프롬프트(DB이름=>)에 입력",
      "alternatives": [],
      "db": "postgresql",
      "step": "finish",
      "where": "psql => · 메타 명령"
    }
  ],
  "params": {
    "DBUSER": {
      "label": "승인된 DB 계정명",
      "default": "",
      "kind": "identifier"
    },
    "DBTARGET": {
      "label": "대상 DB 이름 또는 DB이름@승인된호스트",
      "default": "",
      "kind": "identifier"
    },
    "BIN": {
      "label": "명령어 이름",
      "default": "java",
      "kind": "identifier"
    },
    "PATTERN": {
      "label": "검색 문자열 / 패턴",
      "default": "ERROR",
      "kind": "string"
    },
    "PID": {
      "label": "PID · 실제 값으로 교체",
      "default": "",
      "kind": "pid"
    },
    "PORT": {
      "label": "포트",
      "default": "8080",
      "kind": "port"
    },
    "DIR": {
      "label": "조회 디렉터리",
      "default": ".",
      "kind": "path"
    },
    "PATH": {
      "label": "파일 / 경로",
      "default": "/apps/common/tomcat",
      "defaultPowerShell": "C:\\work\\file.txt",
      "kind": "path"
    },
    "FILE": {
      "label": "대상 파일",
      "default": "/path/to/file.txt",
      "defaultPowerShell": "C:\\work\\file.txt",
      "kind": "path"
    },
    "LOG": {
      "label": "로그 파일",
      "default": "/path/to/application.log",
      "defaultPowerShell": "C:\\work\\application.log",
      "kind": "path"
    },
    "ARCHIVE": {
      "label": "압축 / JAR 파일",
      "default": "/path/to/archive.tar.gz",
      "defaultPowerShell": "C:\\work\\archive.zip",
      "kind": "path"
    },
    "HOST": {
      "label": "내부 호스트 / IP",
      "default": "127.0.0.1",
      "kind": "identifier"
    },
    "URL": {
      "label": "승인된 내부 HTTP(S) URL",
      "default": "http://127.0.0.1:8080/",
      "kind": "http-url"
    },
    "START": {
      "label": "시작 줄번호",
      "default": "1",
      "kind": "positive"
    },
    "END": {
      "label": "마지막 줄번호",
      "default": "100",
      "kind": "positive"
    },
    "CONTAINER": {
      "label": "컨테이너 이름 / ID",
      "default": "my-container",
      "kind": "identifier"
    },
    "ALIAS": {
      "label": "TNS 별칭 또는 host:port/service",
      "default": "MYDB",
      "kind": "identifier"
    },
    "DBHOST": {
      "label": "DB 서버 호스트 / IP",
      "default": "127.0.0.1",
      "kind": "identifier"
    },
    "DBNAME": {
      "label": "대상 DB 이름",
      "default": "",
      "kind": "identifier"
    },
    "SERVICE": {
      "label": "서비스 unit 이름 · Ubuntu SSH는 ssh.service",
      "default": "sshd.service",
      "kind": "identifier"
    }
  },
  "tools": [
    {
      "id": "commands",
      "title": "명령어 포켓",
      "desc": "상황으로 찾고, 내 환경에 맞춰 복사하세요.",
      "icon": "terminal",
      "color": "accent",
      "group": "서버 운영",
      "tag": "LINUX · WAS",
      "keywords": "리눅스 linux 명령어 사전 포트 로그 tomcat jeus webtob docker jboss 서버"
    },
    {
      "id": "sqlformat",
      "title": "SQL 작업대",
      "desc": "DB를 고르고 접속 → 확인 → 쿼리 → 확정 순서로 복사해요.",
      "icon": "database",
      "color": "green",
      "group": "서버 운영",
      "tag": "CUBRID · MARIADB · ORACLE · PG",
      "keywords": "CUBRID CSQL MariaDB MySQL Oracle SQL*Plus PostgreSQL psql SELECT INSERT UPDATE DELETE 포맷 SQL 쿼리 정렬 작업대 트랜잭션"
    },
    {
      "id": "encoding",
      "title": "한글 · 인코딩 진료소",
      "desc": "깨진 한글과 파일의 문자셋을 함께 살펴봐요.",
      "icon": "language",
      "color": "orange",
      "group": "변환 도구",
      "tag": "UTF-8 · EUC-KR",
      "keywords": "인코딩 깨짐 한글 cp949 latin1 mojibake 복구 파일 변환"
    },
    {
      "id": "json",
      "title": "JSON 정리함",
      "desc": "검증, 보기 좋게 정렬, 공백 압축까지.",
      "icon": "braces",
      "color": "green",
      "group": "데이터 작업",
      "tag": "FORMAT · VALIDATE",
      "keywords": "json 포맷 format minify 데이터 api 응답 큰 숫자"
    },
    {
      "id": "codec",
      "title": "인코딩 변환기",
      "desc": "URL, Base64, HEX, 유니코드를 한곳에서.",
      "icon": "arrows",
      "color": "accent",
      "group": "변환 도구",
      "tag": "ENCODE · DECODE",
      "keywords": "url base64 hex properties unicode html escape 자바"
    },
    {
      "id": "text",
      "title": "텍스트 다듬기",
      "desc": "중복 줄, 공백, 줄바꿈을 가볍게 정리해요.",
      "icon": "text",
      "color": "green",
      "group": "데이터 작업",
      "tag": "CLEAN · DEDUPE",
      "keywords": "텍스트 중복 정렬 공백 줄바꿈 crlf lf trim"
    },
    {
      "id": "diff",
      "title": "변경점 비교",
      "desc": "두 설정 파일 사이의 차이를 한눈에.",
      "icon": "diff",
      "color": "rose",
      "group": "데이터 작업",
      "tag": "BEFORE · AFTER",
      "keywords": "diff 비교 변경 설정 config 차이"
    },
    {
      "id": "logs",
      "title": "로그 돋보기",
      "desc": "포함·제외 검색과 오류 주변 문맥을 모아요.",
      "icon": "search",
      "color": "orange",
      "group": "서버 운영",
      "tag": "FILTER · CONTEXT",
      "keywords": "log 로그 오류 에러 exception error warn info 필터 grep"
    },
    {
      "id": "sql",
      "title": "SQL IN 도우미",
      "desc": "목록을 안전한 따옴표와 분할 조건으로.",
      "icon": "database",
      "color": "accent",
      "group": "데이터 작업",
      "tag": "QUOTE · CHUNK",
      "keywords": "sql in oracle 오라클 1000 db 쿼리 리스트"
    },
    {
      "id": "unicode",
      "title": "문자 · ASCII 검사기",
      "desc": "눈에 안 보이는 공백과 문자 코드를 확인해요.",
      "icon": "scan",
      "color": "rose",
      "group": "변환 도구",
      "tag": "ASCII · UNICODE",
      "keywords": "아스키 ascii 문자 코드 16진수 decimal 한글 utf8 바이트 invisible"
    },
    {
      "id": "time",
      "title": "시간 번역기",
      "desc": "Unix 타임스탬프를 KST·UTC로 나란히.",
      "icon": "clock",
      "color": "green",
      "group": "서버 운영",
      "tag": "UNIX · KST · UTC",
      "keywords": "시간 날짜 타임스탬프 timestamp epoch kst utc 초 밀리초"
    },
    {
      "id": "chmod",
      "title": "권한 계산기",
      "desc": "rwx 체크로 숫자 권한과 명령어를 확인해요.",
      "icon": "lock",
      "color": "orange",
      "group": "서버 운영",
      "tag": "RWX · OCTAL",
      "keywords": "chmod 권한 퍼미션 755 644 640 777 계산"
    },
    {
      "id": "cron",
      "title": "크론 미리보기",
      "desc": "5필드 예약식과 다음 실행 시각을 확인해요.",
      "icon": "calendar",
      "color": "accent",
      "group": "서버 운영",
      "tag": "5 FIELDS · NEXT RUN",
      "keywords": "cron crontab 크론 스케줄 배치 예약"
    },
    {
      "id": "hash",
      "title": "파일 지문",
      "desc": "텍스트·파일 SHA 해시로 무결성을 비교해요.",
      "icon": "fingerprint",
      "color": "green",
      "group": "데이터 작업",
      "tag": "SHA-256 · 384 · 512",
      "keywords": "sha 해시 체크섬 무결성 반입 파일 hash"
    },
    {
      "id": "regex",
      "title": "정규식 실험실",
      "desc": "매치와 캡처를 확인하는 작은 테스트 공간.",
      "icon": "regex",
      "color": "rose",
      "group": "데이터 작업",
      "tag": "MATCH · CAPTURE",
      "keywords": "regex 정규식 regexp 검색 패턴 매칭"
    }
  ],
  "dbs": {
    "cubrid": {
      "label": "CUBRID",
      "client": "CSQL",
      "prompt": "csql>",
      "flow": "SSH 셸에서 csql -C --no-auto-commit 으로 접속 → csql> 에서 ;autocommit 이 OFF인지 확인 → SQL 붙여넣기 → 영향 행 수 확인 → ;commit 또는 ;rollback"
    },
    "mariadb": {
      "label": "MariaDB",
      "client": "mysql · mariadb 클라이언트",
      "prompt": "MariaDB>",
      "flow": "새 변경 세션에서 트랜잭션 지원 테이블인지 확인 → START TRANSACTION; 한 번만 실행 → SQL 붙여넣기 → 영향 행 수 확인 → COMMIT; 또는 ROLLBACK;. 진행 중에 다시 시작하면 앞선 변경이 커밋됩니다."
    },
    "oracle": {
      "label": "Oracle",
      "client": "SQL*Plus",
      "prompt": "SQL>",
      "flow": "sqlplus 접속 → SHOW AUTOCOMMIT 이 OFF인지 확인 → SQL 붙여넣기 → 처리 행 수 확인 → COMMIT; 또는 ROLLBACK; · EXIT는 기본적으로 커밋하므로 EXIT ROLLBACK 사용"
    },
    "postgresql": {
      "label": "PostgreSQL",
      "client": "psql",
      "prompt": "psql =>",
      "flow": "psql 접속 → BEGIN; 먼저 실행 (기본값 자동 커밋) → SQL 붙여넣기 → UPDATE n 등 결과 확인 → COMMIT; 또는 ROLLBACK;"
    }
  },
  "guides": {
    "home": {
      "when": "처음 열었거나, 자주 쓰는 명령과 도구로 바로 가고 싶을 때",
      "steps": [
        [
          "위쪽 검색 상자를 누르거나 Ctrl K",
          "‘포트’, ‘한글’, ‘autocommit’처럼 상황을 입력 → ↑ ↓로 고르고 Enter로 엽니다."
        ],
        [
          "환경 카드에서 작업할 곳 고르기",
          "Windows PowerShell · Linux 셸 · DB 중 하나를 누르면 명령어 포켓이 그 환경만 보여 줍니다."
        ],
        [
          "DB 카드에서 DB 고르기",
          "CUBRID · MariaDB · Oracle · PostgreSQL을 누르면 SQL 작업대가 그 DB 기준으로 열립니다."
        ],
        [
          "별표로 모으기",
          "명령어 카드나 도구 제목 옆 ☆를 누르면 아래 ‘즐겨찾는 명령 / 도구’에 모입니다."
        ],
        [
          "나머지 도구",
          "‘모든 도구’를 펼치면 전체 목록이 나옵니다. 휴대폰은 왼쪽 위 메뉴 버튼을 누르세요."
        ]
      ],
      "cautions": [
        "명령을 실행하거나 서버에 접속하지 않습니다. 복사한 뒤 카드의 ‘입력:’ 위치에 직접 붙여넣으세요."
      ],
      "example": {
        "input": "Ctrl K → 포트",
        "output": "도구와 명령어가 함께 나옵니다.\n예: 특정 포트 리스닝 확인 · 입력: Linux 셸 · $",
        "click": [
          "[data-open-palette]"
        ],
        "label": "검색창 열어 보기"
      }
    },
    "favorites": {
      "when": "매일 쓰는 도구와 명령만 따로 모아 보고 싶을 때",
      "steps": [
        [
          "도구 화면 제목 옆 ☆ 누르기",
          "별이 채워지면 추가된 것입니다. 다시 누르면 빠집니다."
        ],
        [
          "명령어 카드의 ☆ 누르기",
          "명령어 포켓과 검색 결과의 카드 모두 같은 별표입니다."
        ],
        [
          "왼쪽 메뉴 → 즐겨찾기",
          "휴대폰은 왼쪽 위 메뉴 버튼 → 즐겨찾기. 카드에서 바로 ‘값 넣기 · 복사’를 할 수 있습니다."
        ],
        [
          "다른 PC로 옮기기",
          "내 포켓 관리 → 설정 백업 → 새 PC에서 백업 가져오기"
        ]
      ],
      "cautions": [
        "즐겨찾기는 이 브라우저에만 저장됩니다. HTML 파일 위치나 브라우저가 바뀌면 보이지 않을 수 있으니 설정 백업을 남기세요."
      ],
      "example": {
        "input": "명령어 포켓 → ‘특정 포트 리스닝 확인’ 카드의 ☆",
        "output": "즐겨찾기 → 즐겨찾는 명령어에 표시\n내 작업실 → 즐겨찾는 명령에도 표시"
      }
    },
    "commands": {
      "when": "서버나 PC에서 포트 · 로그 · 프로세스를 확인할 명령이 바로 떠오르지 않을 때",
      "steps": [
        [
          "환경 고르기: 전체 · Windows · Linux · DB",
          "고른 환경의 명령만 남고, 아래 안내에 붙여넣을 곳이 표시됩니다."
        ],
        [
          "검색창 또는 자주 찾는 검색어",
          "‘포트’, ‘로그’, ‘JEUS’처럼 상황으로 찾습니다. 분류 · 권한으로 더 좁힐 수 있습니다."
        ],
        [
          "카드의 ‘입력:’ 확인",
          "Linux 셸 · $, Windows PowerShell · PS>, csql> 등 명령을 붙여넣을 곳입니다."
        ],
        [
          "값 넣기 · 복사",
          "창에서 PORT 같은 값을 바꾸면 최종 명령어가 바로 바뀝니다. 변경 · 부하 명령은 확인 체크 후 복사됩니다."
        ],
        [
          "안 될 때는 대체 명령",
          "창 아래 ‘사용할 수 없을 때’에서 조건을 비교해 고르면 입력한 값이 이어지고, ‘← 원래 명령으로’로 돌아올 수 있습니다."
        ]
      ],
      "cautions": [
        "이 페이지는 명령을 실행하지 않습니다. 결과가 비어 있다고 미설치로 단정하지 말고 설치 경로 · 권한을 함께 확인하세요."
      ],
      "example": {
        "input": "포트 검색 → 특정 포트 리스닝 확인 → 포트: 8111",
        "output": "ss -lnt \"( sport = :8111 )\"\n입력: Linux 셸 · $",
        "click": [
          "[data-command-search=\"포트\"]"
        ],
        "label": "‘포트’로 찾아보기"
      }
    },
    "sqlformat": {
      "when": "DB 클라이언트에 붙여넣을 쿼리를 정리하고, 데이터를 바꾸는 쿼리는 최종 내용을 확인한 뒤 복사할 때",
      "steps": [
        [
          "DB 고르기",
          "CUBRID · MariaDB · Oracle · PostgreSQL 중 하나. 붙여넣을 프롬프트(csql>, MariaDB>, SQL>, psql =>)가 표시됩니다."
        ],
        [
          "작업 순서 1 ~ 3",
          "접속(Linux 셸) → 대상 · 자동 커밋 확인 → 트랜잭션 시작 버튼을 누르면 값 확인 · 복사 창이 열립니다."
        ],
        [
          "4 쿼리 작성",
          "SELECT · INSERT · UPDATE · DELETE 프리셋을 누르거나 SQL 원문에 붙여넣고 테이블 · 값 · 조건을 고칩니다."
        ],
        [
          "정렬된 SQL의 복사 · 저장",
          "SELECT는 바로 복사됩니다. 변경 SQL은 최종 쿼리 확인 창이 열리고, WHERE가 없으면 확인 체크를 해야 복사됩니다."
        ],
        [
          "5 확정 · 취소 · 종료",
          "영향받은 행 수를 확인한 뒤 COMMIT 또는 ROLLBACK을 복사해 붙여넣습니다."
        ]
      ],
      "cautions": [
        "정렬은 공백만 바꾸며 DB에 접속하거나 실행하지 않습니다.",
        "WHERE 1=1처럼 범위가 넓은 조건이나 함수의 부작용은 판별하지 않습니다. 고른 DB가 실제로 붙여넣을 클라이언트와 같은지 확인하세요."
      ],
      "example": {
        "input": "update sample_items set item_name = '새 이름', updated_at = current_timestamp where item_id = 'A001';",
        "output": "update sample_items\nset item_name = '새 이름',\n  updated_at = current_timestamp\nwhere item_id = 'A001';",
        "fill": {
          "sqlformat-input": "update sample_items set item_name = '새 이름', updated_at = current_timestamp where item_id = 'A001';"
        },
        "click": [
          "#sqlformat-run"
        ],
        "result": "sqlformat-output",
        "status": "sqlformat-status",
        "label": "예시를 넣고 정렬"
      }
    },
    "encoding": {
      "when": "로그 · CSV · 설정 파일의 한글이 ‘ì•ˆë…•’ 또는 ‘�’처럼 깨져 보일 때",
      "steps": [
        [
          "원본 파일이 있으면 01에서 다시 읽기",
          "깨지기 전 파일을 고르고 문자셋을 UTF-8 ↔ EUC-KR로 바꿔 가며 한글이 바르게 보이는 쪽을 찾습니다."
        ],
        [
          "바르게 보이면 UTF-8로 저장",
          "Excel에서 열 파일이면 ‘UTF-8 BOM 추가’를 켭니다. 원본 파일은 바뀌지 않습니다."
        ],
        [
          "문자열만 있으면 02 복구 후보",
          "깨진 문자열을 붙여넣고 잘못 읽힌 문자셋과 원래 문자셋을 가정한 뒤 ‘복구 후보 만들기’를 누릅니다."
        ],
        [
          "후보를 원본과 대조",
          "그럴듯하게 보여도 원래 문장이라는 증거는 아닙니다."
        ]
      ],
      "cautions": [
        "이미 � 또는 ?로 저장된 글자는 되살릴 수 없습니다. 저장은 UTF-8만 지원합니다."
      ],
      "example": {
        "input": "ì•ˆë…•í•˜ì„¸ìš”\n잘못 읽힌 문자셋: Windows-1252 · 원래 바이트: UTF-8",
        "output": "안녕하세요",
        "fill": {
          "repair-input": "ì•ˆë…•í•˜ì„¸ìš”",
          "repair-source": "windows-1252",
          "repair-target": "utf-8"
        },
        "click": [
          "#repair-run"
        ],
        "result": "repair-output",
        "status": "repair-status"
      }
    },
    "json": {
      "when": "API 응답이나 설정 JSON을 읽기 좋게 펼치거나 문법이 맞는지 확인할 때",
      "steps": [
        [
          "JSON 원문 붙여넣기",
          "한 줄로 된 응답도 그대로 넣습니다."
        ],
        [
          "보기 좋게 정리 · 공백 압축 · 문법 검증",
          "들여쓰기는 2칸 또는 4칸. 문법 오류가 있으면 상태 줄에 원인이 표시됩니다."
        ],
        [
          "결과 복사 · 저장",
          "정리된 JSON 오른쪽 위의 복사 또는 저장 버튼"
        ]
      ],
      "cautions": [
        "큰 정수, 1.2300 같은 숫자 표기, 키 순서를 바꾸지 않습니다. 업무 스키마나 중복 키의 의미는 검증하지 않습니다."
      ],
      "example": {
        "input": "{\"id\":900719925474099312345,\"amount\":1.2300,\"tags\":[\"한글\",\"offline\"]}",
        "output": "{\n  \"id\": 900719925474099312345,\n  \"amount\": 1.2300,\n  \"tags\": [\n    \"한글\",\n    \"offline\"\n  ]\n}",
        "fill": {
          "json-input": "{\"id\":900719925474099312345,\"amount\":1.2300,\"tags\":[\"한글\",\"offline\"]}",
          "json-indent": "2"
        },
        "click": [
          "#json-pretty"
        ],
        "result": "json-output",
        "status": "json-status"
      }
    },
    "codec": {
      "when": "URL 파라미터, Base64 값, \\uXXXX 이스케이프, HTML 엔티티를 읽거나 만들 때",
      "steps": [
        [
          "변환 형식 고르기",
          "URL · Base64 · HEX · 유니코드 이스케이프 · HTML 엔티티"
        ],
        [
          "입력 붙여넣기 → 인코딩 또는 디코딩",
          "form 데이터의 +를 공백으로 읽으려면 아래 체크를 켭니다."
        ],
        [
          "결과 복사",
          "‘결과를 입력으로 옮기기’로 이어서 다른 변환을 할 수 있습니다."
        ]
      ],
      "cautions": [
        "Base64는 암호화가 아닙니다. 비밀번호 · 토큰을 붙여넣지 마세요."
      ],
      "example": {
        "input": "URL 인코딩 · 한글 이름&x=1",
        "output": "%ED%95%9C%EA%B8%80%20%EC%9D%B4%EB%A6%84%26x%3D1",
        "fill": {
          "codec-mode": "url",
          "codec-plus": false,
          "codec-input": "한글 이름&x=1"
        },
        "click": [
          "#codec-encode"
        ],
        "result": "codec-output",
        "status": "codec-status"
      }
    },
    "text": {
      "when": "복사한 서버 · ID 목록에서 공백 · 빈 줄 · 중복을 정리하고 정렬할 때",
      "steps": [
        [
          "원문 붙여넣기",
          "한 줄에 하나씩"
        ],
        [
          "정리 옵션 고르기",
          "앞뒤 공백 · 빈 줄 · 중복 제거, 자연 정렬(2 다음 10), 결과 줄바꿈 LF / CRLF"
        ],
        [
          "선택한 정리 적용",
          "몇 줄이 몇 줄로 바뀌었는지 상태 줄에 표시됩니다."
        ],
        [
          "복사 · 저장",
          "저장 파일에는 고른 줄바꿈 형식이 적용됩니다."
        ]
      ],
      "cautions": [
        "코드나 CSV처럼 공백과 중복이 의미 있는 데이터는 필요한 옵션만 켜세요."
      ],
      "example": {
        "input": "  item10\nitem2\nitem2\n\nitem1  \n(공백 · 빈 줄 · 중복 제거, 자연 오름차순)",
        "output": "item1\nitem2\nitem10",
        "fill": {
          "text-input": "  item10\nitem2\nitem2\n\nitem1  ",
          "text-trim": true,
          "text-empty": true,
          "text-unique": true,
          "text-sort": "asc",
          "text-eol": "lf"
        },
        "click": [
          "#text-run"
        ],
        "result": "text-output",
        "status": "text-status"
      }
    },
    "diff": {
      "when": "설정 파일을 바꾸기 전후나 두 서버의 설정이 어떻게 다른지 볼 때",
      "steps": [
        [
          "변경 전 · 변경 후 붙여넣기",
          "왼쪽에 기존 내용, 오른쪽에 바뀐 내용"
        ],
        [
          "변경점 비교",
          "추가 · 삭제 · 동일 줄 수와 양쪽 줄 번호가 표시됩니다."
        ],
        [
          "필요하면 옵션",
          "‘줄 앞뒤 공백 무시’는 다시 비교해야 적용되고, ‘바뀐 줄만 표시’는 바로 적용됩니다."
        ],
        [
          "비교 결과 저장",
          "참고용 텍스트 보고서입니다. git patch가 아닙니다."
        ]
      ],
      "cautions": [
        "줄 단위 비교입니다. 각 2,500줄 · 500,000자 이하로 나눠 넣으세요."
      ],
      "example": {
        "input": "변경 전: server.port=8080 · pool.max=100 · encoding=UTF-8\n변경 후: server.port=8111 · pool.max=100 · encoding=UTF-8",
        "output": "− server.port=8080\n+ server.port=8111\n  pool.max=100\n  encoding=UTF-8\n추가 1 · 삭제 1 · 동일 2",
        "fill": {
          "diff-before": "server.port=8080\npool.max=100\nencoding=UTF-8",
          "diff-after": "server.port=8111\npool.max=100\nencoding=UTF-8",
          "diff-space": false,
          "diff-changes": false
        },
        "click": [
          "#diff-run"
        ],
        "result": "diff-stats",
        "expect": "1추가1삭제2동일",
        "status": "diff-status"
      }
    },
    "logs": {
      "when": "긴 로그에서 ERROR · Exception 줄과 그 앞뒤만 추려 보고 싶을 때",
      "steps": [
        [
          "로그 붙여넣기 또는 UTF-8 파일 열기",
          "EUC-KR 로그는 한글 · 인코딩 진료소에서 먼저 UTF-8로 저장합니다."
        ],
        [
          "포함 · 제외 단어",
          "쉼표로 구분하면 OR 조건입니다. 예: ERROR,Exception"
        ],
        [
          "주변 문맥 고르기",
          "일치 줄 앞뒤 1 · 3 · 5 · 10줄"
        ],
        [
          "로그 추려보기",
          "전체 · 일치 · 문맥 포함 · ERROR · WARN 줄 수와 결과가 나옵니다. 결과는 복사 · 저장할 수 있습니다."
        ]
      ],
      "cautions": [
        "정규식이 아닌 고정 문자열 검색입니다. 로그에 토큰이나 개인정보가 있을 수 있으니 결과 반출에 유의하세요."
      ],
      "example": {
        "input": "09:00:01 INFO  started\n09:00:02 WARN  pool nearly full\n09:00:03 ERROR request failed\njava.sql.SQLException: timeout\n09:00:05 INFO  completed\n(포함: ERROR · 앞뒤 1줄)",
        "output": "09:00:02 WARN  pool nearly full\n09:00:03 ERROR request failed\njava.sql.SQLException: timeout",
        "fill": {
          "logs-input": "09:00:01 INFO  started\n09:00:02 WARN  pool nearly full\n09:00:03 ERROR request failed\njava.sql.SQLException: timeout\n09:00:05 INFO  completed",
          "logs-include": "ERROR",
          "logs-exclude": "",
          "logs-context": "1",
          "logs-case": true
        },
        "click": [
          "#logs-run"
        ],
        "result": "logs-output",
        "status": "logs-status"
      }
    },
    "sql": {
      "when": "엑셀 등에서 복사한 코드 목록으로 WHERE … IN (…) 조건을 만들 때",
      "steps": [
        [
          "값 목록 붙여넣기",
          "한 줄에 하나씩"
        ],
        [
          "컬럼명 · 값 형식 · 묶음 크기",
          "문자열의 작은따옴표는 두 번 써서 이스케이프합니다. 묶음 크기를 넘으면 OR로 나눕니다."
        ],
        [
          "IN 조건 만들기",
          "중복 · 앞뒤 공백 제거 여부를 고를 수 있습니다."
        ],
        [
          "복사해서 쿼리에 붙이기",
          "SQL 작업대의 WHERE 절에 넣고 정렬 · 점검을 거치세요."
        ]
      ],
      "cautions": [
        "DB에 접속하거나 실행하지 않습니다. 애플리케이션 코드에는 바인드 변수를 사용하세요."
      ],
      "example": {
        "input": "A001\nO'Brien\nA001\n00123\n(컬럼: ITEM_ID · 문자열 · 중복 제거)",
        "output": "ITEM_ID IN (\n  'A001', 'O''Brien', '00123'\n)",
        "fill": {
          "sql-input": "A001\nO'Brien\nA001\n00123",
          "sql-column": "ITEM_ID",
          "sql-kind": "string",
          "sql-chunk": "1000",
          "sql-unique": true,
          "sql-trim": true
        },
        "click": [
          "#sql-run"
        ],
        "result": "sql-output",
        "status": "sql-status"
      }
    },
    "unicode": {
      "when": "눈에 안 보이는 공백 때문에 값 비교가 실패하거나 문자 코드 · UTF-8 바이트를 확인할 때",
      "steps": [
        [
          "검사할 문자 붙여넣기 → 문자 분석",
          "코드 포인트 · 10진수 · ASCII · UTF-8 HEX가 한 줄씩 나옵니다."
        ],
        [
          "숨은 공백 샘플",
          "ZERO WIDTH SPACE · NBSP 같은 보이지 않는 문자가 이름으로 표시됩니다."
        ],
        [
          "ASCII 0~127 표",
          "제어문자 이름까지 한 번에 봅니다."
        ],
        [
          "숫자 코드 → 문자",
          "65, U+D55C, 0x1F600처럼 입력하고 ‘문자로 바꾸기’를 누릅니다."
        ]
      ],
      "cautions": [
        "한 글자처럼 보여도 여러 코드 포인트일 수 있습니다. 한글과 이모지는 ASCII 값이 없습니다."
      ],
      "example": {
        "input": "65 U+D55C U+AE00 0x1F600",
        "output": "A한글😀",
        "fill": {
          "unicode-codes": "65 U+D55C U+AE00 0x1F600"
        },
        "click": [
          "#unicode-decode"
        ],
        "result": "unicode-decoded",
        "status": "unicode-code-status"
      }
    },
    "time": {
      "when": "로그의 Unix 타임스탬프를 KST로 읽거나 특정 시각의 타임스탬프가 필요할 때",
      "steps": [
        [
          "타임스탬프 입력 + 단위 고르기",
          "10자리는 대개 초, 13자리는 밀리초입니다. 단위를 직접 고릅니다."
        ],
        [
          "날짜로 변환",
          "UTC · KST · Unix 초 / 밀리초 · ISO 8601이 나란히 나옵니다."
        ],
        [
          "반대 방향",
          "오른쪽에 날짜와 시간대를 넣고 ‘타임스탬프로 변환’을 누릅니다."
        ]
      ],
      "cautions": [
        "KST는 UTC+9 고정으로 계산합니다. 서버의 실제 시간대와 시계 오차는 따로 확인하세요."
      ],
      "example": {
        "input": "1700000000 · 초",
        "output": "UTC        2023-11-14 22:13:20.000 UTC+00:00\nKST        2023-11-15 07:13:20.000 UTC+09:00\nUnix 초    1700000000\nUnix ms    1700000000000\nISO 8601   2023-11-14T22:13:20.000Z",
        "fill": {
          "time-epoch": "1700000000",
          "time-unit": "s"
        },
        "click": [
          "#time-from-epoch"
        ],
        "result": "time-output",
        "status": "time-status"
      }
    },
    "chmod": {
      "when": "640 · 755 같은 숫자 권한과 rwx를 맞춰 보고 chmod 명령을 만들 때",
      "steps": [
        [
          "체크박스 또는 숫자 3자리",
          "소유자 · 그룹 · 기타별로 읽기 4 · 쓰기 2 · 실행 1을 더한 값입니다."
        ],
        [
          "대상 경로 입력",
          "공백이나 특수문자가 있어도 따옴표로 감싼 명령이 만들어집니다."
        ],
        [
          "결과 확인",
          "숫자 · rwx 표기 · 복사할 명령어가 함께 바뀝니다."
        ],
        [
          "내용 확인 후 복사",
          "확인 창에서 한 번 더 확인합니다. 붙여넣을 곳: Linux 셸 · $"
        ]
      ],
      "cautions": [
        "복사한 명령을 실행하면 실제 권한이 바뀝니다. 777은 모든 사용자에게 쓰기를 허용하니 신중히 검토하세요.",
        "setuid · setgid · sticky 비트와 ACL은 다루지 않습니다."
      ],
      "example": {
        "input": "숫자 권한 750 · 대상 경로 /app/batch/run.sh",
        "output": "rwxr-x---\nchmod 750 -- '/app/batch/run.sh'",
        "expect": "chmod 750 -- '/app/batch/run.sh'",
        "fill": {
          "chmod-path": "/app/batch/run.sh",
          "chmod-octal": "750"
        },
        "click": [],
        "result": "chmod-output",
        "status": "chmod-status"
      }
    },
    "cron": {
      "when": "crontab에 넣을 예약식이 실제로 언제 실행되는지 미리 볼 때",
      "steps": [
        [
          "표현식 입력 또는 칩 고르기",
          "분 시 일 월 요일 5필드. 예: 30 9 * * 1-5"
        ],
        [
          "시간대와 기준 시각",
          "KST 또는 UTC, 이 시각 이후의 실행을 계산합니다."
        ],
        [
          "다음 실행 미리보기",
          "필드별 해석과 다음 5회 실행 시각 · 요일이 나옵니다."
        ]
      ],
      "cautions": [
        "미리보기만 하고 서버에 예약하지 않습니다. Quartz의 ? L W #, @reboot, 초 · 연도 필드는 지원하지 않습니다."
      ],
      "example": {
        "input": "30 9 * * 1-5 · KST · 2026-11-21 00:00:00 이후",
        "output": "1.  2026-11-23 09:30:00  KST  (월)\n2.  2026-11-24 09:30:00  KST  (화)\n3.  2026-11-25 09:30:00  KST  (수)\n4.  2026-11-26 09:30:00  KST  (목)\n5.  2026-11-27 09:30:00  KST  (금)",
        "fill": {
          "cron-zone": "540",
          "cron-start": "2026-11-21T00:00:00",
          "cron-expression": "30 9 * * 1-5"
        },
        "click": [
          "#cron-run"
        ],
        "result": "cron-output",
        "status": "cron-status"
      }
    },
    "hash": {
      "when": "반입 · 반출한 파일이 원본과 같은지 SHA-256 값으로 비교할 때",
      "steps": [
        [
          "알고리즘 고르기",
          "배포처가 알려 준 해시와 같은 종류(SHA-256 등)"
        ],
        [
          "비교할 해시 붙여넣기",
          "선택사항. 넣어 두면 계산 후 일치 / 불일치가 바로 표시됩니다."
        ],
        [
          "파일 선택 → 파일 해시 계산",
          "최대 32 MiB. 텍스트는 왼쪽 칸에 넣고 ‘텍스트 해시 계산’을 누릅니다."
        ],
        [
          "결과 확인 · 복사",
          "불일치면 파일 · 공백 · 줄바꿈 · 인코딩을 확인합니다."
        ]
      ],
      "cautions": [
        "해시가 같다는 것은 내용이 같다는 뜻이지 파일이 안전하다는 증명은 아닙니다. 큰 파일은 sha256sum · Get-FileHash 명령을 이용하세요."
      ],
      "example": {
        "input": "텍스트 abc · SHA-256 · 비교할 해시 ba7816bf…15ad",
        "output": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad\n일치합니다. 같은 해시 값입니다.",
        "expect": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        "fill": {
          "hash-algorithm": "SHA-256",
          "hash-input": "abc",
          "hash-expected": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        },
        "click": [
          "#hash-text"
        ],
        "result": "hash-output",
        "status": "hash-compare"
      }
    },
    "regex": {
      "when": "grep · 로그 필터 · 코드에 쓸 패턴이 의도대로 잡히는지 미리 확인할 때",
      "steps": [
        [
          "패턴과 플래그",
          "양쪽 / 없이 입력합니다. g 전체 · i 대소문자 무시 · m 여러 줄"
        ],
        [
          "테스트 문자열 붙여넣기",
          "실제 로그 몇 줄이면 충분합니다."
        ],
        [
          "정규식 테스트",
          "매치 위치(index) · 전체 매치 · 캡처 그룹이 JSON으로 나옵니다."
        ],
        [
          "다른 도구로 옮길 때",
          "JavaScript 문법입니다. grep -E · Java · sed와 다를 수 있습니다."
        ]
      ],
      "cautions": [
        "약 1.2초를 넘기면 중단합니다. Worker가 차단된 환경에서는 실행하지 않습니다."
      ],
      "example": {
        "input": "ERROR connection timeout\nINFO ready\nWARN pool almost full\n(패턴: (ERROR|WARN)\\s+(.+) · 플래그: gm)",
        "output": "[\n{\"index\":0,\"match\":\"ERROR connection timeout\",\"captures\":[\"ERROR\",\"connection timeout\"],\"groups\":null},\n{\"index\":36,\"match\":\"WARN pool almost full\",\"captures\":[\"WARN\",\"pool almost full\"],\"groups\":null}\n]",
        "fill": {
          "regex-pattern": "(ERROR|WARN)\\s+(.+)",
          "regex-flags": "gm",
          "regex-input": "ERROR connection timeout\nINFO ready\nWARN pool almost full"
        },
        "click": [
          "#regex-run"
        ],
        "result": "regex-output",
        "status": "regex-status"
      }
    },
    "settings": {
      "when": "PC를 옮기거나 즐겨찾기 · 내 명령어를 백업할 때, 다른 사람에게 배포 ZIP을 줄 때",
      "steps": [
        [
          "설정 백업",
          "pocket-ops-settings.json에 즐겨찾기 · 내 명령어 · 테마만 저장합니다. 작업 입력은 넣지 않습니다."
        ],
        [
          "새 PC에서 백업 가져오기",
          "같은 pocket-ops.html → 내 포켓 관리 → 백업 가져오기 → 교체 확인"
        ],
        [
          "내 명령어 추가",
          "자주 쓰는 명령을 저장합니다. 실행하지 않으며 평문으로 저장됩니다."
        ],
        [
          "배포하기",
          "위쪽 ‘배포하기’ → 현재 버전 ZIP(HTML · 안내문). 입력 · 설정 · 내 명령어는 넣지 않습니다."
        ],
        [
          "입력 비우기",
          "휴지통 버튼 또는 ‘열린 도구의 입력 비우기’로 이 탭의 입력과 결과를 지웁니다."
        ]
      ],
      "cautions": [
        "백업 파일에는 직접 저장한 명령이 평문으로 들어갑니다. 내부 주소나 비밀번호가 없는지 확인하고 반입 · 반출 규정을 따르세요."
      ]
    }
  }
};
