import json
import re
from pathlib import Path
commands=[]
# IDs 001–093 belong to v0.1.0 favorites. Keep this order; append new entries.
def add(title,group,command,note,tags='',risk='read',permission='user',shell='bash',prerequisite=''):
    domain='windows' if shell=='powershell' else 'db' if group=='DB · 연동' else 'linux'
    if shell=='sql' and re.search(r'\{\{[A-Z_]+\}\}',command):
        raise ValueError('SQL examples must be static: shell quoting is not SQL parameter binding.')
    if not prerequisite:
        prerequisite=('Windows 11 · 기본 Windows PowerShell 5.1 이상' if shell=='powershell' else
                      '기존에 설치·승인된 해당 DB 클라이언트와 접속 권한' if shell=='sql' else
                      'Ubuntu 22.04 / RHEL 7 대상 · 설치된 도구와 계정 권한 확인')
    command_id=f'cmd-{len(commands)+1:03}'
    commands.append(dict(id=command_id,title=title,group=group,command=command,note=note,tags=tags,risk=risk,permission=permission,shell=shell,domain=domain,prerequisite=prerequisite,alternatives=[]))
    return command_id
add('배포판과 버전 확인','기본 점검','cat /etc/os-release','RHEL·Ubuntu 등 배포판 정보를 확인합니다. 아주 오래된 배포판은 파일이 없을 수 있습니다.','리눅스 버전 redhat centos ubuntu OS')
add('커널 · CPU 아키텍처 확인','기본 점검','uname -a','커널 버전과 x86_64 등 아키텍처를 확인합니다.','32비트 64비트 kernel')
add('내 계정 · 그룹 · 권한 확인','기본 점검','id','root 없이 현재 UID, GID, 보조 그룹을 확인합니다. Docker 그룹도 확인할 수 있습니다.','권한 사용자 그룹 uid gid')
add('서버 이름과 현재 시간','기본 점검',"hostname\ndate '+%Y-%m-%d %H:%M:%S %Z'",'서버 시간대와 시간을 함께 확인합니다. 스케줄과 로그 시간을 비교할 때 유용합니다.','시간 kst utc hostname')
add('문자셋 · 로케일 확인','기본 점검','locale','LANG, LC_CTYPE 등을 확인합니다. 설정 조회만 하며 문자셋을 변경하지 않습니다.','한글 깨짐 인코딩 euc-kr utf-8')
add('명령어 경로 · 셸 정의 확인','기본 점검','command -v -- {{BIN}}','현재 셸에서 실행할 경로·별칭·함수를 확인합니다. 결과가 없어도 PATH 밖 설치 여부는 알 수 없습니다.','which 없는 명령어 ping telnet nc')
add('현재 디렉터리와 숨김 파일','기본 점검','pwd\nls -lah','현재 위치와 숨김 파일을 확인합니다.','파일 폴더 목록')
add('내 계정의 crontab 조회','기본 점검','crontab -l','조회만 합니다. 다른 계정이나 시스템 전체의 예약 작업은 이 결과만으로 알 수 없습니다.','스케줄 배치 예약 크론')
add('가동 시간 · 서버 부하 확인','자원 · 프로세스','uptime','load average와 가동 시간을 확인합니다. CPU 사용률 자체를 뜻하지는 않습니다.','느려짐 load cpu 부하')
add('메모리 · 스왑 사용량','자원 · 프로세스','free -m','MiB 기준 메모리와 swap을 확인합니다. 배포판 버전에 따라 컬럼 구성이 다릅니다.','메모리 램 oom swap')
add('CPU · 메모리 · I/O 연속 확인','자원 · 프로세스','vmstat 1 5','1초 간격 5회 조회합니다. 첫 행은 부팅 이후 평균일 수 있습니다.','느려짐 cpu io wait 스왑')
add('내 프로세스 CPU 순으로 보기','자원 · 프로세스','ps -u "$(id -un)" -o pid,ppid,%cpu,%mem,etime,args --sort=-%cpu','현재 계정만 조회합니다. 실행 인수에 민감정보가 포함될 수 있어 반출 시 주의하세요.','프로세스 cpu was 일반계정')
add('프로세스 이름으로 PID 찾기','자원 · 프로세스','pgrep -af -- {{PATTERN}}','패턴은 정규식입니다. 전체 명령행에 비밀번호나 토큰이 보일 수 있습니다.','pid java tomcat jeus 찾기')
add('특정 PID 상태와 가동 시간','자원 · 프로세스','ps -p {{PID}} -o pid,ppid,user,%cpu,%mem,etime,args','PID가 재사용될 수 있으므로 대상 이름과 계정을 함께 확인합니다.','pid 프로세스 시작시간')
add('프로세스의 작업 디렉터리','자원 · 프로세스','ls -l -- /proc/{{PID}}/cwd','다른 계정 프로세스는 /proc 보안 정책 때문에 조회되지 않을 수 있습니다.','설치 경로 프로세스 cwd','read','limited')
add('내 프로세스 스레드 확인','자원 · 프로세스','ps -L -p {{PID}} -o pid,tid,%cpu,stat,comm','스레드별 상태를 확인합니다. TID를 16진수로 바꾸면 Java 덤프와 비교할 수 있습니다.','쓰레드 스레드 thread cpu')
add('내 계정 자원 제한','자원 · 프로세스','ulimit -a','현재 셸의 제한입니다. 이미 떠 있는 서비스의 설정과 다를 수 있습니다.','open files too many files 제한')
add('프로세스에 정상 종료 요청','자원 · 프로세스','kill -TERM {{PID}}','대상이 종료될 수 있습니다. 계정·서비스 영향·재기동 계획 확인 후 실행하세요. 강제 종료(-9)는 제공하지 않습니다.','종료 stop kill','change')
add('디스크 사용량 확인','디스크 · 파일','df -hP','파일시스템별 남은 공간을 확인합니다. 네트워크 마운트 상태에 따라 지연될 수 있습니다.','용량 full disk 디스크 꽉참')
add('inode 고갈 확인','디스크 · 파일','df -iP','용량은 남아 있는데 파일이 안 만들어질 때 inode를 확인합니다.','no space left 작은파일 inode')
add('폴더 전체 용량 확인','디스크 · 파일','du -sh -- {{DIR}}','폴더를 순회하므로 파일이 많으면 디스크 I/O가 발생합니다. 범위를 작게 지정하세요.','폴더 크기 로그 용량','load')
add('바로 아래 폴더 용량 정렬','디스크 · 파일','du -xhd 1 -- {{DIR}} | sort -h','GNU du 기준입니다. -x는 다른 파일시스템을 넘지 않도록 제한합니다. 대형 경로는 부하에 주의하세요.','큰폴더 디스크 정리','load')
add('큰 파일 찾기 · 100MB 이상','디스크 · 파일',"find {{DIR}} -maxdepth 3 -type f -size +100M -print",'지정 경로의 3단계까지만 조회합니다. 삭제하지 않습니다. 권한 없는 경로는 누락될 수 있습니다.','대용량 파일 찾기','load')
add('최근 60분 변경 파일','디스크 · 파일',"find {{DIR}} -maxdepth 3 -type f -mmin -60 -print",'수정 시각 기준입니다. 생성 시간이나 실제 배포 시간을 보장하지 않습니다.','배포 변경 파일 시간','load')
add('파일 상세 정보 확인','디스크 · 파일','stat -- {{FILE}}','권한, 크기, 접근·변경 시각을 확인합니다. ctime은 생성 시각이 아닙니다.','stat 날짜 파일정보')
add('심볼릭 링크 실제 경로','디스크 · 파일','readlink -f -- {{PATH}}','GNU readlink 기준입니다. 공용 Tomcat 링크가 실제 어떤 설치 경로를 가리키는지 확인합니다.','tomcat 링크 심볼릭 경로')
add('압축 파일 내용만 확인','디스크 · 파일','tar -tzf {{ARCHIVE}}','gzip tar 아카이브의 파일 목록만 표시합니다. 추출하거나 덮어쓰지 않습니다.','tar gz 압축 목록')
add('파일 SHA-256 확인','디스크 · 파일','sha256sum -- {{FILE}}','반입 전후 같은 파일인지 해시를 비교합니다. 해시만으로 공급자의 신원을 검증하지는 못합니다.','checksum 무결성 반입')
add('파일 인코딩 추정','디스크 · 파일','file --mime -- {{FILE}}','file 명령의 추정 결과입니다. 인코딩을 확정하는 판정은 아닙니다.','문자셋 utf8 euc-kr 한글')
add('바이너리 앞부분 64바이트','디스크 · 파일','od -An -tx1 -N64 -- {{FILE}}','별도 xxd가 없는 환경에서 BOM이나 파일 헤더를 확인할 수 있습니다.','hex 16진수 xxd 대체 BOM')
add('EUC-KR 파일을 UTF-8로 출력','디스크 · 파일','iconv -f EUC-KR -t UTF-8 -- {{FILE}}','표준출력으로만 변환합니다. 원본을 덮어쓰지 않습니다. CP949 확장문자는 별도 CP949 지정이 필요할 수 있습니다.','인코딩 한글 깨짐 변환')
add('마지막 로그 200줄','로그 분석','tail -n 200 -- {{LOG}}','파일 끝 200줄만 읽습니다. 큰 로그 전체를 열 필요가 없습니다.','tail 오류 로그 보기')
add('로그 실시간 보기 · 교체 추적','로그 분석','tail -F -- {{LOG}}','GNU tail 기준입니다. 파일 교체·재생성을 추적합니다. 종료는 Ctrl+C입니다.','실시간 tail follow 로그 로테이션')
add('문자 그대로 검색 · 줄번호','로그 분석','grep -n -F -- {{PATTERN}} {{LOG}}','정규식이 아니라 고정 문자열로 검색합니다. 점·괄호가 포함된 메시지에도 유용합니다.','grep 에러 error exception')
add('오류 앞뒤 3줄 함께 보기','로그 분석','grep -n -C 3 -F -- {{PATTERN}} {{LOG}}','일치 줄과 앞뒤 문맥을 표시합니다. 스택 트레이스는 더 긴 범위가 필요할 수 있습니다.','exception stacktrace 앞뒤 문맥')
add('여러 오류 단어 검색','로그 분석',"grep -n -E 'ERROR|Exception|Caused by' -- {{LOG}}",'대소문자를 구분하는 확장 정규식입니다. 로그 형식에 맞춰 단어를 조정하세요.','java 에러 예외 caused by')
add('건강 확인 로그 제외하기','로그 분석','grep -v -F -- {{PATTERN}} {{LOG}}','패턴이 없는 줄을 출력합니다. 원본 파일은 수정하지 않습니다.','health 제외 필터링')
add('특정 줄 범위만 보기','로그 분석',"sed -n '{{START}},{{END}}p' -- {{LOG}}",'시작·끝 줄번호를 지정합니다. 인덱스가 아니라 1부터 시작하는 줄번호입니다.','sed 구간 라인')
add('압축 로그 검색','로그 분석','zgrep -n -F -- {{PATTERN}} {{ARCHIVE}}','gzip 계열 zgrep 설치가 필요합니다. 압축을 풀어 저장하지 않고 검색합니다.','gz gzip log 과거로그')
add('로그 파일 목록 찾기','로그 분석',"find {{DIR}} -maxdepth 3 -type f -name '*.log' -print",'지정 경로 안에서만 찾습니다. 설치 위치를 모른다고 / 전체를 바로 검색하지 않도록 합니다.','로그 경로 jeus webtob tomcat','load')
add('파일의 줄 수 확인','로그 분석','wc -l -- {{LOG}}','개행 문자 수를 셉니다. 마지막 줄이 개행 없이 끝나면 화면상의 줄 수와 다를 수 있습니다.','건수 count 요청수')
add('동일한 줄의 빈도 집계','로그 분석','sort -- {{FILE}} | uniq -c | sort -nr | head -n 20','작은 발췌 파일에 사용하세요. 전체 로그 정렬은 CPU·메모리·임시 디스크를 쓸 수 있습니다.','중복 빈도 top 집계','load')
add('열려 있는 TCP 포트','네트워크','ss -lnt','수신 중인 TCP 소켓을 확인합니다. 방화벽 통과나 외부 연결 가능 여부까지 증명하지 않습니다.','포트 안열림 listen bind')
add('특정 포트 리스닝 확인','네트워크','ss -lnt "( sport = :{{PORT}} )"','로컬 포트가 리스닝 중인지 확인합니다. PID 없이도 일반 계정으로 조회 가능한 경우가 많습니다.','port 8080 8111 충돌')
add('포트를 점유한 프로세스','네트워크','ss -lntp','다른 계정의 PID나 프로그램명은 보이지 않을 수 있습니다. 빈 칸을 미설치로 판단하지 마세요.','포트 점유 pid','read','limited')
add('ss 대체 · netstat가 이미 있을 때','네트워크','netstat -lnt','이미 설치된 net-tools가 있을 때만 사용합니다. 없으면 대체 항목의 /proc 원시 정보를 확인할 수 있지만 포트·PID를 같은 형태로 보여주지는 않습니다.','netstat 대체 command not found')
add('연결된 TCP 세션 확인','네트워크','ss -ant state established','현재 연결 목록을 확인합니다. DB 커넥션 풀 상태는 DB 측 조회와 함께 판단해야 합니다.','db 커넥션 세션 established')
add('기본 경로 · IP 확인','네트워크','ip route\nip address','Ubuntu 22.04 / RHEL 7의 iproute2 기준입니다. 구형 RHEL 7에서도 사용할 수 있도록 -br 옵션을 쓰지 않습니다.','아이피 라우팅 게이트웨이 vpn')
add('이름 해석 확인','네트워크','getent hosts -- {{HOST}}','/etc/hosts와 시스템 이름 해석 설정을 따릅니다. 승인된 내부 대상만 지정하세요.','dns 도메인 hosts')
add('HTTP 응답 헤더 확인','네트워크',"curl -q --globoff --proto '=http,https' -I --connect-timeout 5 --max-time 10 -- {{URL}}",'HEAD 요청을 보냅니다. -q는 개인 curl 설정 파일을 생략하며 TLS 검증을 끄지 않습니다. 헤더만으로 서버 설치 여부를 확정할 수 없습니다.','curl webtob waf 헤더 접속')
add('HTTP 코드 · 응답 시간 확인','네트워크',"curl -q --globoff --proto '=http,https' -sS -o /dev/null --connect-timeout 5 --max-time 15 -w 'HTTP=%{http_code} TOTAL=%{time_total}s\\n' -- {{URL}}",'승인된 대상에 GET 요청을 1회 보냅니다. 개인 curl 설정·URL 범위 확장을 생략합니다. 상태 변경 URL은 사용하지 마세요. 인증정보가 포함된 URL은 저장하지 마세요.','http 장애 지연 응답 속도')
add('ping · telnet · nc 없는 TCP 확인','네트워크',"timeout 3 bash -c 'exec 3<>\"/dev/tcp/$1/$2\"' _ {{HOST}} {{PORT}}",'Bash의 /dev/tcp 기능과 timeout이 필요합니다. TCP 연결만 시도하며 종료코드 0은 연결 성공입니다.','도구없음 최소컨테이너 연결 테스트')
add('경로별 디렉터리 권한 확인','계정 · 권한','namei -l -- {{PATH}}','상위 디렉터리의 실행(x) 권한 누락을 찾습니다. util-linux의 namei가 필요합니다.','permission denied 접근불가')
add('폴더 소유자 · 권한 확인','계정 · 권한','ls -ld -- {{DIR}}','폴더 자체의 권한을 봅니다. 내부 목록과는 다릅니다.','owner group chmod 권한')
add('현재 umask 조회','계정 · 권한','umask\numask -S','새 파일·디렉터리에 적용될 마스크를 확인합니다. 변경하지 않습니다.','umask 기본권한')
add('ACL 확인','계정 · 권한','getfacl -- {{PATH}}','ACL 도구 설치가 필요합니다. 기본 rwx 권한만으로 설명되지 않는 문제에 유용합니다.','acl 접근제어 권한')
add('내 계정 읽기 · 쓰기 권한 확인','계정 · 권한',"test -r {{PATH}} && printf 'READ: yes\\n' || printf 'READ: no\\n'\ntest -w {{PATH}} && printf 'WRITE: yes\\n' || printf 'WRITE: no\\n'",'접근 가능 여부만 점검합니다. 실제 쓰기는 하지 않으며 마운트·ACL 등의 후속 오류까지 보장하지는 않습니다.','권한 테스트 일반계정')
add('파일 권한을 640으로 변경','계정 · 권한','chmod 640 -- {{FILE}}','실제 권한이 변경됩니다. 파일의 용도를 확인하세요. 실행 파일·디렉터리에 그대로 적용하지 마세요.','chmod 권한변경 777 대안','change')
add('Java 런타임 버전','Java · WAS','java -version','PATH에 잡힌 Java입니다. 실행 중인 WAS의 Java와 다를 수 있습니다.','jdk jre 1.6 1.8 17')
add('Java · WAS 프로세스 확인','Java · WAS',"ps -ef | grep -Ei '[j]ava|[j]eus|[w]ebtob|[h]th|[h]tl|[w]sm'",'OS 프로세스 수준 조회입니다. 결과 없음이 제품 미설치를 증명하지 않습니다. 전체 인수 반출 시 주의하세요.','jeus webtob tomcat jboss 설치 확인')
add('WAS 관련 환경변수 확인','Java · WAS',"printf 'JAVA_HOME=%s\\nJEUS_HOME=%s\\nWEBTOBDIR=%s\\nCATALINA_HOME=%s\\nCATALINA_BASE=%s\\n' \"$JAVA_HOME\" \"$JEUS_HOME\" \"$WEBTOBDIR\" \"$CATALINA_HOME\" \"$CATALINA_BASE\"",'현재 셸의 설정일 뿐입니다. 빈 값이면 설치 스크립트나 실행 프로세스에서 추가 확인이 필요합니다.','환경변수 설치경로 일반계정')
add('JDK 프로세스 목록','Java · WAS','jps -lv','JDK 도구이며 JRE에는 없을 수 있습니다. 동일 계정 프로세스 위주로 확인됩니다.','jps pid jdk')
add('Java GC 상태 5회 조회','Java · WAS','jstat -gcutil {{PID}} 1000 5','대상 JVM과 호환되는 JDK 도구·동일 사용자 권한이 필요합니다. JVM 보안 설정에 따라 실패할 수 있습니다.','gc 메모리 누수 jstat','read','limited')
add('Java 스레드 덤프 출력','Java · WAS','jstack {{PID}}','Attach가 순간적인 부하나 지연을 줄 수 있습니다. 승인된 시점에 같은 사용자·호환 JDK로 실행하세요.','쓰레드 thread dump 장애','load','limited')
add('JVM 버전 직접 확인 · JDK 8+','Java · WAS','jcmd {{PID}} VM.version','JDK 6 환경에는 jcmd가 없습니다. 대상 JVM 호환성·동일 계정·Attach 허용 여부가 필요합니다.','jcmd vm 버전','read','limited')
add('Tomcat 버전 스크립트','Java · WAS','sh "${CATALINA_HOME:?CATALINA_HOME 설정을 확인하세요}/bin/version.sh"','CATALINA_HOME이 비어 있으면 실행을 중단합니다. 신뢰할 수 있는 Tomcat 설치 경로인지 먼저 확인하세요.','tomcat 버전 보안점검')
add('Tomcat 커넥터 설정 발췌','Java · WAS',"grep -n -E 'Connector|Server port=|port=|address=' -- {{FILE}}",'server.xml의 관련 줄을 찾는 보조 도구입니다. 주석·멀티라인 XML을 해석하지는 않습니다.','server.xml 포트 connector')
add('JEUS 관리자 도구 경로만 확인','Java · WAS','command -v jeusadmin','JEUS 관리자 인증 없이 설치 도구 경로만 확인합니다. PATH에 없으면 설치 여부는 미확정입니다.','jeus6 관리자 모름 root 없음')
add('WebtoB 관리 도구 경로 확인','Java · WAS','command -v wsadmin\ncommand -v wsboot','관리 명령을 실행하거나 WebtoB를 기동하지 않고 경로만 확인합니다.','webtob wsadmin wsboot web 계정')
add('JBoss 제품 설정 보기','Java · WAS','cat -- {{FILE}}','JBoss 설치 경로의 bin/product.conf를 대상으로 사용하세요. 내용은 배포판별로 다를 수 있습니다.','jboss eap 제품 버전')
add('WAR · JAR 목록 보기','Java · WAS','jar tf {{ARCHIVE}}','JDK의 jar 도구가 필요합니다. 압축을 풀거나 변경하지 않습니다.','jar war class 라이브러리')
add('RHEL 설치 패키지에서 웹 관련 검색','Java · WAS',"rpm -qa | grep -Ei 'httpd|nginx|mod_security|tomcat'",'RPM 등록 내역만 검색합니다. 수동 설치·컨테이너·앞단 WAF는 누락될 수 있습니다.','redhat rhel7 centos waf 보안점검')
add('Ubuntu 설치 패키지 검색','Java · WAS',"dpkg-query -W | grep -Ei 'apache2|nginx|modsecurity|tomcat'",'Debian/Ubuntu 패키지 등록 내역입니다. 미검색을 미설치로 단정하지 마세요.','ubuntu apt 패키지 설치')
add('실행 중인 컨테이너 목록','Docker','docker ps','Docker 데몬 접근 권한이 필요합니다. 일반 계정이라도 Docker 권한은 높은 시스템 권한입니다.','컨테이너 상태','read','limited')
add('종료된 컨테이너까지 보기','Docker','docker ps -a','중지·생성 실패 상태를 포함하여 조회합니다. 컨테이너를 시작하지 않습니다.','exited created 컨테이너','read','limited')
add('컨테이너 로그 마지막 200줄','Docker','docker logs --tail 200 -- {{CONTAINER}}','로그 드라이버 설정에 따라 조회되지 않을 수 있습니다. 민감정보가 포함될 수 있습니다.','컨테이너 로그 error','read','limited')
add('컨테이너 자원 사용량 1회','Docker','docker stats --no-stream','스트리밍 없이 현재 자원 사용량을 표시합니다.','docker cpu memory 메모리','read','limited')
add('Docker 디스크 사용량','Docker','docker system df','사용량만 조회하며 이미지·볼륨·컨테이너를 정리하거나 삭제하지 않습니다.','docker 용량 이미지 prune 대안','read','limited')
add('Docker 엔진 · 클라이언트 버전','Docker','docker version','클라이언트와 서버 버전을 구분해 확인합니다. 서버 조회에는 데몬 접근이 필요합니다.','docker 버전','read','limited')
add('컨테이너 상태만 확인','Docker',"docker inspect --format='{{.State.Status}}' -- {{CONTAINER}}",'전체 inspect에 포함될 수 있는 환경변수·비밀번호 대신 상태 필드만 출력합니다.','inspect status 환경변수 노출 방지','read','limited')
add('컨테이너 포트 매핑','Docker','docker port -- {{CONTAINER}}','호스트에 공개된 포트 매핑을 확인합니다. 방화벽 허용 여부는 별도입니다.','포트 mapping 연결','read','limited')
add('Oracle 클라이언트 위치','DB · 연동','command -v sqlplus','접속하지 않고 클라이언트 경로만 확인합니다.','oracle 11g sqlplus')
add('Oracle TNS 이름 응답 확인','DB · 연동','tnsping {{ALIAS}}','Oracle 클라이언트 도구가 필요합니다. 인증 성공이나 DB 쿼리 가능 여부까지 확인하지는 않습니다.','oracle tns db 연결')
add('CUBRID 브로커 상태','DB · 연동','cubrid broker status','CUBRID 설치 환경변수와 조회 권한이 필요합니다. 버전·설정에 따라 표시가 다를 수 있습니다.','cubrid 브로커 커넥션','read','limited')
add('CUBRID 서비스 상태','DB · 연동','cubrid service status','서비스를 변경하지 않고 상태를 조회합니다. 설치 계정의 환경변수를 확인하세요.','cubrid broker server 상태','read','limited')
add('MySQL 클라이언트 버전','DB · 연동','mysql --version','DB에 접속하지 않는 클라이언트 버전 조회입니다. 서버 버전과 다를 수 있습니다.','mysql mariadb 버전')
add('Oracle 기본 포트 확인','DB · 연동','ss -lnt "( sport = :1521 )"','로컬 1521 포트만 확인합니다. 실제 리스너 포트가 다른 환경은 포트를 변경하세요.','oracle listener 포트')
add('Windows UTF-8 로그 끝 200줄','Windows', 'Get-Content -LiteralPath {{FILE}} -Tail 200 -Encoding UTF8','PowerShell에서 UTF-8 파일을 읽습니다. CP949 등 다른 인코딩은 한글 · 인코딩 진료소에서 먼저 확인하세요.','powershell 윈도우 로그',shell='powershell')
add('Windows UTF-8 로그 실시간 보기','Windows','Get-Content -LiteralPath {{FILE}} -Tail 100 -Encoding UTF8 -Wait','PowerShell에서 UTF-8 파일을 읽습니다. 종료는 Ctrl+C입니다. 파일 교체 시 Linux tail -F와 같은 재연결을 보장하지 않습니다.','powershell tail follow',shell='powershell')
add('Windows 리스닝 포트','Windows','Get-NetTCPConnection -State Listen','PowerShell NetTCPIP 모듈이 필요합니다. OS 버전과 권한에 따라 표시가 제한될 수 있습니다.','윈도우 포트 pid',shell='powershell')
add('Windows 파일 SHA-256','Windows','Get-FileHash -Algorithm SHA256 -LiteralPath {{FILE}}','망 반입 전·후 파일이 같은지 비교할 때 사용합니다.','윈도우 해시 체크섬',shell='powershell')
add('Windows 프로세스 CPU 누적 순','Windows','Get-Process | Sort-Object CPU -Descending | Select-Object -First 10','CPU 컬럼은 대개 누적 CPU 시간으로 순간 사용률과 다릅니다.','윈도우 cpu 작업관리자',shell='powershell')
add('Windows 지정 포트 TCP 확인','Windows','Test-NetConnection -ComputerName {{HOST}} -Port {{PORT}}','승인된 내부 대상에 연결을 시도합니다. 네트워크 정책에 따라 오래 걸릴 수 있습니다.','윈도우 포트 연결 테스트',shell='powershell')
# v0.2.0: independent alternatives, never a chain that tries every command.
memory_fallback=add('free 대체 · 커널 메모리 정보','자원 · 프로세스','cat /proc/meminfo','기본 cat과 /proc만 사용합니다. kB 단위 원시 항목이며 free의 used/available 계산과 같지 않습니다. 일부 구형 커널은 MemAvailable이 없습니다.','free 없음 메모리 대체 proc')
load_fallback=add('uptime 대체 · 커널 부하 정보','자원 · 프로세스','cat /proc/loadavg','앞의 3개 값은 1·5·15분 load average입니다. CPU 사용률이 아니며 CPU 대기와 I/O 대기도 영향을 줍니다.','uptime 없음 load 부하 대체')
process_fallback=add('pgrep 대체 · ps와 문자열 검색','자원 · 프로세스','ps -ef | grep -F -- {{PATTERN}}','기본 ps와 grep을 사용합니다. 정규식이 아닌 문자 그대로 검색하며 검색 명령 자체도 보일 수 있습니다. 인수에 포함된 민감정보에 주의하세요.','pgrep 없음 프로세스 java 대체')
tcp_fallback=add('ss · netstat 대체 · TCP 원시 정보','네트워크','cat /proc/net/tcp /proc/net/tcp6','현재 네트워크 네임스페이스의 원시 정보입니다. 주소·포트는 16진수이며 st 0A는 LISTEN입니다. PID나 외부 접속 가능 여부는 알 수 없습니다. IPv6 비활성 환경은 tcp6 파일이 없을 수 있습니다.','ss netstat 없음 proc 포트 대체')
ip_fallback=add('ip 대체 · 인터페이스 통계','네트워크','cat /proc/net/dev','인터페이스 이름과 송수신 누적 바이트·오류만 확인합니다. IP 주소·라우팅은 이 출력으로 대체할 수 없습니다.','ip ifconfig 없음 네트워크 대체')
gzip_fallback=add('zgrep 대체 · gzip과 grep','로그 분석','gzip -cd -- {{ARCHIVE}} | grep -n -F -- {{PATTERN}}','이미 설치된 gzip과 grep을 사용합니다. 원본과 디스크에 압축 해제 파일을 쓰지 않지만 전체 압축 해제에 CPU를 사용합니다. 출력 없음은 gzip 오류 여부와 함께 확인하세요.','zgrep 없음 gzip 압축 검색 대체',risk='load')
stat_fallback=add('stat 대체 · 기본 파일 속성','디스크 · 파일','ls -ld -- {{PATH}}','소유자·권한·크기·수정 시각을 간단히 봅니다. stat의 상세 시간·inode 정보 전체를 대신하지는 않습니다.','stat namei getfacl 없음 대체 권한')
add('서비스 상태 조회 · systemd','기본 점검','systemctl status --no-pager -- {{SERVICE}}','시작·중지하지 않습니다. SSH 서비스명은 보통 RHEL 7은 sshd.service, Ubuntu 22.04는 ssh.service입니다. 서비스가 중지되어 있으면 조회 명령도 0이 아닌 종료코드를 반환할 수 있습니다.','systemd 서비스 상태 ssh',prerequisite='Ubuntu 22.04 / RHEL 7 · systemd로 구동 중인 호스트')
add('서비스 최근 로그 100줄 · systemd','로그 분석','journalctl -u {{SERVICE}} -n 100 --no-pager','현재 계정이 볼 수 있는 해당 unit 로그만 표시합니다. 기록 없음과 권한 부족을 구분하세요. journal이 없는 환경은 서비스의 실제 로그 파일을 tail로 확인하세요.','systemd journalctl 서비스 로그',permission='limited',prerequisite='Ubuntu 22.04 / RHEL 7 · systemd journal 조회 권한')
add('Windows PowerShell 버전 확인','Windows','$PSVersionTable','Windows 시작 메뉴 → Windows PowerShell을 검색해 엽니다. 기본 5.1을 기준으로 하며 PowerShell 7 추가 설치는 필요하지 않습니다.','윈도우 powershell 버전 기본',shell='powershell')
add('Windows OS · 메모리 정보','Windows','Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object Caption, Version, OSArchitecture, LastBootUpTime, TotalVisibleMemorySize, FreePhysicalMemory','메모리 값은 KiB 단위입니다. 현재 로컬 PC만 조회하며 CIM 서비스 정책에 따라 조회가 제한될 수 있습니다.','윈도우 버전 메모리 부팅 시간',shell='powershell')
add('Windows 디스크 남은 공간','Windows','Get-PSDrive -PSProvider FileSystem | Select-Object Name, Root, Used, Free','Used와 Free는 바이트 단위입니다. 현재 PowerShell에서 보이는 드라이브를 조회합니다. 네트워크 드라이브는 상태에 따라 지연될 수 있습니다.','윈도우 용량 디스크 공간',shell='powershell')
add('Windows IP · 게이트웨이 확인','Windows','Get-NetIPConfiguration','로컬 네트워크 설정을 조회합니다. 어댑터가 꺼져 있거나 정책이 제한하면 일부 정보가 나오지 않을 수 있습니다.','윈도우 ip dns 라우팅 게이트웨이',shell='powershell',prerequisite='Windows 11 · 기본 NetTCPIP 모듈')
add('Windows DNS 이름 해석','Windows','Resolve-DnsName -Name {{HOST}}','승인된 내부 이름만 지정하세요. 시스템의 이름 해석 결과이며 해당 서비스의 접속 성공을 보장하지 않습니다.','윈도우 dns 이름 도메인',shell='powershell',prerequisite='Windows 11 · 기본 DnsClient 모듈')
windows_ports_fallback=add('Windows 포트 대체 · .NET 조회','Windows','[System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Select-Object Address, Port','NetTCPIP 명령이 없을 때 기존 .NET으로 로컬 수신 주소와 포트를 봅니다. PID는 제공하지 않습니다. 제한 언어 모드에서는 메서드 호출이 차단될 수 있습니다.','윈도우 Get-NetTCPConnection 대체 포트',shell='powershell')
add('Windows 특정 PID 확인','Windows','Get-Process -Id {{PID}} | Select-Object Id, ProcessName, CPU, StartTime, Path','PID가 재사용될 수 있으므로 이름도 확인하세요. 다른 계정·보호 프로세스는 경로와 시작 시각을 읽지 못할 수 있습니다.','윈도우 pid 프로세스 경로',shell='powershell')
add('Windows 서비스 목록 조회','Windows','Get-Service | Sort-Object Status, DisplayName | Select-Object Status, Name, DisplayName','로컬 서비스의 상태와 이름만 확인합니다. 서비스 시작·중지·시작 유형 변경을 하지 않습니다.','윈도우 서비스 상태',shell='powershell')
add('Windows 최근 오류 · 경고 50개','Windows',"Get-WinEvent -FilterHashtable @{LogName='Application'; Level=2,3} -MaxEvents 50 | Select-Object TimeCreated, Id, LevelDisplayName, ProviderName, Message",'Application 로그의 오류·경고만 읽습니다. 일치 이벤트가 없으면 오류 메시지가 나올 수 있습니다. 메시지에 계정·경로가 포함될 수 있어 반출 전 확인하세요.','윈도우 이벤트 오류 로그',permission='limited',shell='powershell')
add('Windows UTF-8 로그 문자열 검색','Windows','Select-String -LiteralPath {{FILE}} -Pattern {{PATTERN}} -SimpleMatch -Encoding UTF8 -Context 3,3','UTF-8 파일에서 문자열을 검색하고 앞뒤 3줄을 표시합니다. CP949 파일은 한글 · 인코딩 진료소에서 원본 인코딩을 먼저 확인하세요.','윈도우 grep 검색 로그 소스',shell='powershell')
add('Windows 바로 아래 파일 목록','Windows','Get-ChildItem -LiteralPath {{DIR}} -File | Select-Object Name, Length, LastWriteTime','지정 폴더의 파일만 조회합니다. 하위 폴더를 재귀 탐색하지 않아 범위가 과도하게 넓어지지 않습니다. Length는 바이트입니다.','윈도우 파일 목록 소스 날짜',shell='powershell')
add('Windows 경로 ACL 조회','Windows','Get-Acl -LiteralPath {{PATH}} | Format-List Path, Owner, AccessToString','권한을 변경하지 않습니다. 파일 시스템 ACL을 보여주며 공유 권한·중첩 그룹을 포함한 최종 유효 권한 계산은 아닙니다.','윈도우 권한 접근 거부 acl',shell='powershell')
add('Windows 명령어 경로 확인','Windows','Get-Command -Name {{BIN}} -ErrorAction SilentlyContinue | Select-Object Name, CommandType, Source, Definition','현재 세션에서 찾을 수 있는 명령을 보여줍니다. 빈 결과는 설치 부재의 증거가 아닙니다. 와일드카드 이름은 여러 항목을 표시할 수 있습니다.','윈도우 명령 없음 경로 java ssh',shell='powershell')
add('Oracle 접속 계정 · DB 확인','DB · 연동',"SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') AS session_user,\n       SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS current_schema,\n       SYS_CONTEXT('USERENV', 'DB_NAME') AS db_name\nFROM dual;",'기존 Oracle SQL 도구의 쿼리 창에서 실행하세요. 접속 세션과 기본 스키마를 읽습니다. PDB 구분이 필요한 환경은 별도로 확인하세요. Bash나 PowerShell 명령이 아닙니다.','oracle 오라클 sql 계정 스키마 접속 확인',shell='sql')
add('Oracle 세션 날짜 · 숫자 형식','DB · 연동',"SELECT parameter, value\nFROM nls_session_parameters\nWHERE parameter IN ('NLS_DATE_FORMAT', 'NLS_TIMESTAMP_FORMAT', 'NLS_NUMERIC_CHARACTERS', 'NLS_LANGUAGE')\nORDER BY parameter;",'현재 Oracle 세션의 NLS 설정만 조회합니다. DB 전체 문자셋이나 다른 애플리케이션 세션의 설정을 나타내지는 않습니다.','oracle 오라클 sql 날짜 숫자 nls',shell='sql')
add('MySQL · MariaDB 계정 · 버전','DB · 연동','SELECT VERSION() AS server_version, DATABASE() AS current_database,\n       CURRENT_USER() AS privilege_account, USER() AS login_identity;','기존 MySQL/MariaDB 쿼리 창에서 실행하세요. CURRENT_USER는 권한 판정 계정이고 USER는 접속 시 사용자·호스트입니다. DB를 선택하지 않았다면 DATABASE는 NULL입니다.','mysql mariadb sql db 접속 버전 계정',shell='sql')
add('MySQL · MariaDB 문자셋 · 시간대','DB · 연동','SELECT @@character_set_client AS client_charset,\n       @@character_set_connection AS connection_charset,\n       @@character_set_results AS result_charset,\n       @@session.time_zone AS session_time_zone;','현재 세션의 변수를 조회합니다. 테이블·컬럼별 문자셋을 보장하지 않으며 time_zone이 SYSTEM이면 서버 OS 시간대의 영향도 확인하세요.','mysql mariadb sql 문자셋 시간대 한글',shell='sql')
add('PostgreSQL 접속 계정 · 버전','DB · 연동','SELECT version(), current_database(), session_user, current_user;','기존 PostgreSQL 쿼리 창에서 실행하세요. 접속 DB와 세션 사용자·현재 권한 사용자를 조회합니다. 서버 버전 문자열을 반출할 때 내부 정보 여부를 확인하세요.','postgresql postgres sql 버전 접속 계정',shell='sql')
add('PostgreSQL 문자셋 · 시간대','DB · 연동',"SELECT name, setting\nFROM pg_settings\nWHERE name IN ('server_encoding', 'client_encoding', 'TimeZone')\nORDER BY name;",'PostgreSQL 설정 뷰에서 해당 세션에 보이는 문자셋과 시간대를 읽습니다. 설정을 변경하지 않습니다.','postgresql postgres sql 문자셋 시간대 한글',shell='sql')
commands_by_id={entry['id']:entry for entry in commands}
for original,alternative in [
    ('cmd-010',memory_fallback),('cmd-009',load_fallback),('cmd-013',process_fallback),
    ('cmd-043','cmd-046'),('cmd-043',tcp_fallback),('cmd-046',tcp_fallback),
    ('cmd-048',ip_fallback),('cmd-039',gzip_fallback),('cmd-025',stat_fallback),
    ('cmd-053',stat_fallback),('cmd-056',stat_fallback),('cmd-062','cmd-060'),('cmd-029','cmd-030'),
    ('cmd-090',windows_ports_fallback),
]:
    commands_by_id[original]['alternatives'].append(alternative)
# Requirements are explicit: presence of a package is never assumed on a restricted PC.
for entry in commands:
    if entry['group']=='Docker': entry['prerequisite']='기존 Docker CLI·데몬과 승인된 조회 권한 · 추가 설치 없이 설치된 경우만'
    if entry['group']=='DB · 연동' and entry['shell']=='bash': entry['prerequisite']='Linux의 기존 DB 도구·계정 환경 필요 · 미설치 상태에는 OS 수준 점검만 가능'
for command_id,requirement in {
    'cmd-008':'기존 crontab 도구 · Cronie 또는 cron 패키지',
    'cmd-029':'기존 file 도구 · 없으면 od로 헤더만 확인 가능',
    'cmd-031':'기존 iconv · 지원 인코딩 목록은 설치 버전에 따라 다름',
    'cmd-043':'기존 iproute2의 ss · Ubuntu 22.04 / RHEL 7 대상',
    'cmd-046':'기존 net-tools의 netstat · 신규 설치를 전제로 하지 않음',
    'cmd-050':'기존 curl 7.21.0 이상 · 승인된 내부 HTTP(S) 대상',
    'cmd-051':'기존 curl 7.21.0 이상 · 승인된 내부 HTTP(S) 대상',
    'cmd-052':'Bash /dev/tcp 지원 + 기존 GNU timeout · 승인된 내부 대상',
    'cmd-053':'기존 util-linux의 namei',
    'cmd-056':'기존 acl 패키지의 getfacl · 기본 ls만으로 ACL 전체를 확인할 수 없음',
    'cmd-062':'기존 호환 JDK의 jps · JRE만 있으면 사용 불가',
    'cmd-063':'기존 호환 JDK의 jstat · 대상 JVM과 동일 사용자 권한',
    'cmd-064':'기존 호환 JDK의 jstack · Attach 허용과 작업 시점 승인',
    'cmd-065':'기존 호환 JDK 8+의 jcmd · 동일 계정·Attach 허용',
    'cmd-071':'기존 JDK의 jar · 설치된 경우만',
    'cmd-072':'RHEL 7 · RPM 패키지 조회',
    'cmd-073':'Ubuntu 22.04 · dpkg 패키지 조회',
    'cmd-087':'Linux의 기존 iproute2 · 로컬 Oracle 기본 포트 가정',
}.items(): commands_by_id[command_id]['prerequisite']=requirement
params={
'BIN':{'label':'명령어 이름','default':'java','kind':'identifier'},
'PATTERN':{'label':'검색 문자열 / 패턴','default':'ERROR','kind':'string'},
'PID':{'label':'PID · 실제 값으로 교체','default':'','kind':'pid'},
'PORT':{'label':'포트','default':'8080','kind':'port'},
'DIR':{'label':'조회 디렉터리','default':'.','kind':'path'},
'PATH':{'label':'파일 / 경로','default':'/apps/common/tomcat','defaultPowerShell':'C:\\work\\file.txt','kind':'path'},
'FILE':{'label':'대상 파일','default':'/path/to/file.txt','defaultPowerShell':'C:\\work\\file.txt','kind':'path'},
'LOG':{'label':'로그 파일','default':'/path/to/application.log','defaultPowerShell':'C:\\work\\application.log','kind':'path'},
'ARCHIVE':{'label':'압축 / JAR 파일','default':'/path/to/archive.tar.gz','defaultPowerShell':'C:\\work\\archive.zip','kind':'path'},
'HOST':{'label':'내부 호스트 / IP','default':'127.0.0.1','kind':'identifier'},
'URL':{'label':'승인된 내부 HTTP(S) URL','default':'http://127.0.0.1:8080/','kind':'http-url'},
'START':{'label':'시작 줄번호','default':'1','kind':'positive'},
'END':{'label':'마지막 줄번호','default':'100','kind':'positive'},
'CONTAINER':{'label':'컨테이너 이름 / ID','default':'my-container','kind':'identifier'},
'ALIAS':{'label':'TNS 별칭','default':'MYDB','kind':'identifier'},
'SERVICE':{'label':'서비스 unit 이름 · Ubuntu SSH는 ssh.service','default':'sshd.service','kind':'identifier'},
}
tools=[
('commands','명령어 포켓','상황으로 찾고, 내 환경에 맞춰 복사하세요.','terminal','accent','서버 운영','LINUX · WAS','리눅스 linux 명령어 사전 포트 로그 tomcat jeus webtob docker jboss 서버'),
('encoding','한글 · 인코딩 진료소','깨진 한글과 파일의 문자셋을 함께 살펴봐요.','language','orange','변환 도구','UTF-8 · EUC-KR','인코딩 깨짐 한글 cp949 latin1 mojibake 복구 파일 변환'),
('json','JSON 정리함','검증, 보기 좋게 정렬, 공백 압축까지.','braces','green','데이터 작업','FORMAT · VALIDATE','json 포맷 format minify 데이터 api 응답 큰 숫자'),
('codec','인코딩 변환기','URL, Base64, HEX, 유니코드를 한곳에서.','arrows','accent','변환 도구','ENCODE · DECODE','url base64 hex properties unicode html escape 자바'),
('text','텍스트 다듬기','중복 줄, 공백, 줄바꿈을 가볍게 정리해요.','text','green','데이터 작업','CLEAN · DEDUPE','텍스트 중복 정렬 공백 줄바꿈 crlf lf trim'),
('diff','변경점 비교','두 설정 파일 사이의 차이를 한눈에.','diff','rose','데이터 작업','BEFORE · AFTER','diff 비교 변경 설정 config 차이'),
('logs','로그 돋보기','포함·제외 검색과 오류 주변 문맥을 모아요.','search','orange','서버 운영','FILTER · CONTEXT','log 로그 오류 에러 exception error warn info 필터 grep'),
('sql','SQL IN 도우미','목록을 안전한 따옴표와 분할 조건으로.','database','accent','데이터 작업','QUOTE · CHUNK','sql in oracle 오라클 1000 db 쿼리 리스트'),
('unicode','문자 · ASCII 검사기','눈에 안 보이는 공백과 문자 코드를 확인해요.','scan','rose','변환 도구','ASCII · UNICODE','아스키 ascii 문자 코드 16진수 decimal 한글 utf8 바이트 invisible'),
('time','시간 번역기','Unix 타임스탬프를 KST·UTC로 나란히.','clock','green','서버 운영','UNIX · KST · UTC','시간 날짜 타임스탬프 timestamp epoch kst utc 초 밀리초'),
('chmod','권한 계산기','rwx 체크로 숫자 권한과 명령어를 확인해요.','lock','orange','서버 운영','RWX · OCTAL','chmod 권한 퍼미션 755 644 640 777 계산'),
('cron','크론 미리보기','5필드 예약식과 다음 실행 시각을 확인해요.','calendar','accent','서버 운영','5 FIELDS · NEXT RUN','cron crontab 크론 스케줄 배치 예약'),
('hash','파일 지문','텍스트·파일 SHA 해시로 무결성을 비교해요.','fingerprint','green','데이터 작업','SHA-256 · 384 · 512','sha 해시 체크섬 무결성 반입 파일 hash'),
('regex','정규식 실험실','매치와 캡처를 확인하는 작은 테스트 공간.','regex','rose','데이터 작업','MATCH · CAPTURE','regex 정규식 regexp 검색 패턴 매칭')
]
tool_data=[dict(zip(['id','title','desc','icon','color','group','tag','keywords'],x)) for x in tools]
Path(__file__).resolve().parent.joinpath('src/data.js').write_text('/* Curated offline reference data. Never auto-executed. */\nwindow.PocketData = '+json.dumps(dict(version='0.2.0',commands=commands,params=params,tools=tool_data),ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('Commands:',len(commands),'Tools:',len(tools))
