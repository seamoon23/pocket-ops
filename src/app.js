/* Pocket Ops UI. No network requests, remote libraries, shell execution or telemetry. */
(function(){
'use strict';
const D=window.PocketData,C=window.PocketCore,$=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s)),E=C.htmlEscape;
const paths={
 pocket:'M5 4h14v9a7 7 0 0 1-14 0V4Z M5 8h14 M9 13l3 2 3-2',home:'m3 10 9-7 9 7 M5 9v11h14V9 M9 20v-7h6v7',terminal:'M4 5h16v14H4z m4 4 3 3-3 3 m5 0h3',language:'M3 5h11 M8 3v2 M5 5c0 6 5 10 8 10 M12 5c-1 6-5 10-9 11 m11 4 4-11 4 11 m-7-4h6',braces:'M8 4H6v6l-2 2 2 2v6h2 M16 4h2v6l2 2-2 2v6h-2',arrows:'M4 7h15 m-4-4 4 4-4 4 M20 17H5 m4-4-4 4 4 4',text:'M4 5h16 M4 10h11 M4 15h16 M4 20h10',diff:'M4 4h6v16H4z M14 4h6v16h-6z M6 9h2 M16 9h2 M17 8v2 M16 15h2',search:'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z m5-2 5 5',database:'M4 6c0-4 16-4 16 0s-16 4-16 0 M4 6v12c0 4 16 4 16 0V6 M4 12c0 4 16 4 16 0',scan:'M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5 M8 15l4-7 4 7 M9 13h6',clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3 2',lock:'M6 10h12v10H6z M8 10V7a4 4 0 0 1 8 0v3 M12 14v2',calendar:'M4 5h16v16H4z M7 3v4 M17 3v4 M4 10h16 M8 14h2 M14 14h2 M8 17h2',fingerprint:'M4 12c0-11 16-11 16 0 M7 18c0-3 1-3 1-6 0-6 8-6 8 0 0 5-1 7-2 9 M4 16v-2 M11 20c2-4 1-6 1-9 M18 19c1-3 2-4 2-7',regex:'M3 17h2 M11 6v10 M7 8l8 6 M15 8l-8 6 M18 7h3v10h-3',star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z',arrow:'M5 12h14 m-5-5 5 5-5 5',chevron:'m9 5 7 7-7 7',copy:'M8 8h12v12H8z M16 8V4H4v12h4',check:'m5 12 4 4L19 6',shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z m-4 9 3 3 5-5',moon:'M20 14A8 8 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z',sun:'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1 1 M18 18l1 1 M5 19l1-1 M18 6l1-1',settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M9 3h6l1 4 4 1v8l-4 1-1 4H9l-1-4-4-1V8l4-1 1-4Z',download:'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5',upload:'M12 16V4 m-5 5 5-5 5 5 M4 16v5h16v-5',plus:'M12 5v14 M5 12h14',x:'m6 6 12 12 M18 6 6 18',trash:'M4 6h16 M9 6V3h6v3 M6 6l1 15h10l1-15 M10 10v7 M14 10v7',menu:'M4 6h16 M4 12h16 M4 18h16',book:'M3 4h8l1 2 1-2h8v16h-8l-1 1-1-1H3V4Z M12 6v15',file:'M6 3h8l4 4v14H6V3Z M14 3v5h4 M9 12h6 M9 16h6',spark:'m12 3 2 6 6 3-6 2-2 7-2-7-6-2 6-3 2-6Z',edit:'m5 15 10-10 4 4L9 19H5v-4Z M13 7l4 4'};
function icon(name){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[name]||paths.pocket)+'"/></svg>';}
const STORE='pocket-ops:v1',BASE={version:1,theme:'light',toolFavs:['commands','encoding','json','logs'],cmdFavs:['cmd-040','cmd-031','cmd-026'],customCommands:[]};
let canStore=true,state={...BASE,toolFavs:[...BASE.toolFavs],cmdFavs:[...BASE.cmdFavs],customCommands:[]};
function validateState(v){
 if(!v||v.version!==1)throw new Error('지원하지 않는 백업 형식입니다.');
 const validIDs=new Set(D.tools.map(t=>t.id));const out={version:1,theme:v.theme==='dark'?'dark':'light',toolFavs:[],cmdFavs:[],customCommands:[]};
 if(!Array.isArray(v.toolFavs)||!Array.isArray(v.cmdFavs)||!Array.isArray(v.customCommands))throw new Error('백업 필드 구성을 확인하세요.');
 if(v.toolFavs.length>400||v.cmdFavs.length>400)throw new Error('즐겨찾기는 각 400개 이하로 가져오세요.');
 out.toolFavs=[...new Set(v.toolFavs.filter(x=>validIDs.has(x)))];out.cmdFavs=[...new Set(v.cmdFavs.filter(x=>typeof x==='string'&&/^(cmd-\d{3}|custom-[a-z0-9-]+)$/.test(x)))].slice(0,400);
 if(v.customCommands.length>200)throw new Error('내 명령어는 최대 200개입니다.');const seen=new Set();
 for(const x of v.customCommands){
  if(!x||typeof x.id!=='string'||x.id.length>100||!/^custom-[a-z0-9-]+$/.test(x.id)||seen.has(x.id)||typeof x.title!=='string'||typeof x.command!=='string'||typeof x.note!=='string'||!x.title.trim()||!x.command.trim()||x.title.length>80||x.command.length>8000||x.note.length>400)throw new Error('올바르지 않은 내 명령어 데이터입니다.');
  seen.add(x.id);out.customCommands.push({id:x.id,title:x.title,command:x.command,note:x.note,group:'내 명령어',tags:typeof x.tags==='string'?x.tags.slice(0,200):'',risk:'custom',permission:'limited',shell:x.shell==='powershell'?'powershell':'bash'});
 }
 const commandIDs=new Set(D.commands.concat(out.customCommands).map(c=>c.id));out.cmdFavs=out.cmdFavs.filter(id=>commandIDs.has(id));
 return out;
}
try{localStorage.setItem(STORE+':test','1');localStorage.removeItem(STORE+':test');const raw=localStorage.getItem(STORE);if(raw)state=validateState(JSON.parse(raw));}catch(_){canStore=false;}
function save(){try{localStorage.setItem(STORE,JSON.stringify(state));canStore=true;}catch(_){canStore=false;}refreshStorage();}
function refreshStorage(){const el=$('#storage-status');if(el)el.textContent=canStore?'설정만 이 브라우저에 저장':'설정 저장 불가 · 백업을 이용하세요';const bar=$('#storage-warning');if(bar){bar.classList.toggle('visible',!canStore);bar.textContent='브라우저 저장소를 사용할 수 없습니다. 도구는 작동하지만 즐겨찾기·내 명령어는 설정 백업으로 보관하세요.';}}
document.documentElement.dataset.theme=state.theme;
let current='home',views=new Map(),toastTimer,paletteIndex=0,paletteItems=[],cleanupTasks=new Set();
const mobileLayout=window.matchMedia('(max-width:900px)');
function setMenu(open){
 const sidebar=$('#sidebar'),wasOpen=sidebar.classList.contains('open'),hadMenuFocus=sidebar.contains(document.activeElement);open=Boolean(open&&mobileLayout.matches);
 sidebar.classList.toggle('open',open);sidebar.inert=mobileLayout.matches&&!open;$('.main').inert=open;$('#menu-scrim').hidden=!open;document.body.classList.toggle('menu-open',open);
 $('#mobile-menu').setAttribute('aria-expanded',String(open));
 if(open){sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');$('#mobile-close').focus();}
 else{sidebar.removeAttribute('role');sidebar.removeAttribute('aria-modal');if(mobileLayout.matches&&(wasOpen||hadMenuFocus))$('#mobile-menu').focus();else if(wasOpen)sidebar.querySelector('.nav-btn.active')?.focus();}
}
const allCommands=()=>D.commands.concat(state.customCommands),tool=id=>D.tools.find(t=>t.id===id),cmd=id=>allCommands().find(c=>c.id===id);
const DOMAINS=[['','전체'],['windows','Windows'],['linux','Linux'],['db','DB']];
const commandDomain=c=>c.domain||(c.shell==='powershell'?'windows':c.shell==='sql'?'db':'linux');
// Paste target shown on every card and dialog: Linux shell, PowerShell or a DB client prompt.
const DBS=D.dbs,whereLabel=c=>c.where||(c.shell==='powershell'?'Windows PowerShell · PS>':'Linux 셸 · $');
const hasFields=c=>c.risk!=='custom'&&/\{\{[A-Z_]+\}\}/.test(c.command);
const PRESETS=['cmd-132','cmd-133','cmd-134','cmd-135'];
let sqlDialect='cubrid',commandDb='',activeCommand=null;
function domainButtons(kind,active=''){return '<div class="domain-tabs" role="group" aria-label="명령어 환경 선택">'+DOMAINS.map(([id,label])=>'<button class="chip '+(id===active?'active':'')+'" data-'+kind+'-domain="'+id+'" aria-pressed="'+(id===active)+'">'+label+'</button>').join('')+'</div>';}
function dbChips(kind,active,withAll){return '<div class="chip-row db-switch" role="group" aria-label="DB 종류 선택">'+(withAll?[['','모든 DB']]:[]).concat(Object.entries(DBS).map(([id,db])=>[id,db.label])).map(([id,label])=>'<button class="chip'+(id===active?' active':'')+'" data-'+kind+'-db="'+id+'" aria-pressed="'+(id===active)+'">'+E(label)+'</button>').join('')+'</div>';}
function whereTag(text){return '<span class="where-tag">'+icon('terminal')+'입력: '+E(text)+'</span>';}
function homeCards(){return D.tools.slice().sort((a,b)=>Number(state.toolFavs.includes(b.id))-Number(state.toolFavs.includes(a.id))).map(card).join('');}
// A manual popover is drawn in the top layer, so a copy confirmation stays readable above an open dialog
// instead of sitting under its blurred backdrop. Without popover support the toast stays as before.
function toast(text){const el=$('#toast');el.textContent=text;clearTimeout(toastTimer);
 try{if(el.showPopover){if(el.matches(':popover-open'))el.hidePopover();el.showPopover();}}catch(_){}
 el.classList.add('show');
 toastTimer=setTimeout(()=>{el.classList.remove('show');toastTimer=setTimeout(()=>{try{if(el.matches(':popover-open'))el.hidePopover();}catch(_){}},250);},3100);}
function setStatus(id,message,type=''){const el=document.getElementById(id);if(el){el.className='status '+type;el.textContent=message;}}
function run(id,fn){try{const result=fn();setStatus(id,'완료','success');return result;}catch(e){setStatus(id,e.message,'error');return undefined;}}
function download(name,content,type='text/plain;charset=utf-8'){
 try{const blob=content instanceof Blob?content:new Blob([C.utf8(content)],{type});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}catch(e){toast('파일 저장 실패: '+e.message);}
}
function modal(title,html,bind){setMenu(false);const d=$('#modal');if(d.open)d.close();d.innerHTML='<div class="dialog-head"><h2>'+E(title)+'</h2><button class="icon-btn" data-close aria-label="닫기">'+icon('x')+'</button></div><div class="dialog-body">'+html+'</div>';d.querySelector('[data-close]').onclick=()=>d.close();d.showModal();if(bind)bind(d);}
let copySequence = 0;
async function copy(text){
 const request = ++copySequence;
 if(typeof text!=='string')return;
 try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);if(request!==copySequence)return;toast('클립보드에 복사했어요.');return;}}catch(_){}
 if(request!==copySequence)return;
 const area=document.createElement('textarea');area.value=text;area.setAttribute('aria-label','복사용 텍스트');area.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:.01;';const active=document.activeElement;($('dialog[open]')||document.body).append(area);area.focus();area.select();let ok=false;try{ok=document.execCommand('copy');}catch(_){}area.remove();if(active&&active.isConnected)active.focus();
 if(ok){toast('클립보드에 복사했어요.');return;}
 modal('직접 복사해 주세요','<p class="muted">자동 복사가 제한되어 있습니다. PC에서는 선택된 내용을 Ctrl+C로 복사하세요. 휴대폰에서는 텍스트 길게 누르기 → 모두 선택 → 복사를 이용하세요.</p><textarea id="manual-copy" readonly class="short" aria-label="수동 복사할 내용"></textarea>',()=>{const a=$('#manual-copy');a.value=text;a.focus();a.select();});
}
function checkFile(file,max=8*1024*1024){if(!file)throw new Error('파일을 선택하세요.');if(file.size>max)throw new Error('파일은 '+(max/1024/1024)+' MiB 이하로 나누어 주세요.');}
function editor(id,label,placeholder='',readonly=false,height=''){return '<div class="panel"><div class="panel-head"><h2>'+label+'</h2><div class="actions">'+(readonly?'<button class="btn small" data-copy-id="'+id+'">'+icon('copy')+'복사</button><button class="icon-btn" data-download-id="'+id+'" title="UTF-8 텍스트 저장" aria-label="결과 파일 저장">'+icon('download')+'</button>':'<button class="btn small subtle" data-clear-id="'+id+'">비우기</button>')+'</div></div><textarea id="'+id+'" class="'+height+'" '+(readonly?'readonly ':'')+'spellcheck="false" autocomplete="off" maxlength="2000000" aria-label="'+label+'" placeholder="'+E(placeholder)+'"></textarea><div class="editor-meta"><span data-counter-for="'+id+'">0자 · 0줄</span><span>'+(readonly?'UTF-8로 저장':'현재 탭 메모리에만 유지')+'</span></div></div>';}
function field(id,label,value='',type='text'){return '<label class="field"><span>'+E(label)+'</span><input id="'+id+'" type="'+type+'" value="'+E(String(value))+'" autocomplete="off" spellcheck="false"></label>';}
function select(id,label,options){return '<label class="field"><span>'+label+'</span><select id="'+id+'">'+options.map(([v,t])=>'<option value="'+E(v)+'">'+E(t)+'</option>').join('')+'</select></label>';}
function check(id,label,checked=false){return '<label class="check"><input type="checkbox" id="'+id+'" '+(checked?'checked':'')+'>'+label+'</label>';}
function counters(root=document){root.querySelectorAll('[data-counter-for]').forEach(el=>{const t=document.getElementById(el.dataset.counterFor);if(t){const s=t.value;el.textContent=Array.from(s).length.toLocaleString()+'자 · '+C.lines(s).length.toLocaleString()+'줄';}});}
// Every screen carries a "사용 예시" button in its title row; the guide text lives in the catalog (D.guides).
const GUIDE_ORDER=['home','favorites'].concat(D.tools.map(t=>t.id),'settings');
function pageName(id){return id==='home'?'내 작업실':id==='favorites'?'즐겨찾기':id==='settings'?'내 포켓 관리':tool(id).title;}
function guideButton(id){return D.guides&&D.guides[id]?'<button class="btn small guide-link" data-guide="'+id+'" aria-haspopup="dialog" title="이 화면의 사용 예시 · ? 키">'+icon('book')+'사용 예시</button>':'';}
function pageHead(id){const t=tool(id);return '<div class="page-title"><div><div class="eyebrow">'+E(t.group.toUpperCase())+' / '+t.id.toUpperCase()+'</div><h1>'+E(t.title)+'</h1><p>'+E(t.desc)+'</p></div><div class="actions">'+guideButton(id)+'<button class="icon-btn '+(state.toolFavs.includes(id)?'starred':'')+'" data-tool-star="'+id+'" aria-label="도구 즐겨찾기" title="도구 즐겨찾기">'+icon('star')+'</button><span class="offline-pill">'+icon('shield')+'LOCAL ONLY</span></div></div>';}
function footer(){return '<footer class="footer"><span>'+icon('shield')+'이 페이지는 입력을 외부로 전송하지 않습니다.</span><span>POCKET OPS '+(window.PocketBuild?.version||D.version)+' · OFFLINE FIELD KIT</span></footer>';}
function nav(){
 let html='<button class="nav-btn active" data-go="home">'+icon('home')+'내 작업실</button><button class="nav-btn" data-go="favorites">'+icon('star')+'즐겨찾기</button>';
 for(const group of ['서버 운영','변환 도구','데이터 작업']){html+='<div class="nav-label">'+group+'</div>';for(const t of D.tools.filter(t=>t.group===group))html+='<button class="nav-btn" data-go="'+t.id+'">'+icon(t.icon)+t.title+'</button>';}
 $('#nav').innerHTML=html;
}
function card(t){return '<article class="tool-card" data-go="'+t.id+'" tabindex="0" role="link" aria-label="'+E(t.title)+' 열기"><div class="card-top"><div class="tool-icon '+t.color+'">'+icon(t.icon)+'</div><button class="icon-btn card-star '+(state.toolFavs.includes(t.id)?'starred':'')+'" data-tool-star="'+t.id+'" title="즐겨찾기" aria-label="'+E(t.title)+' 즐겨찾기" aria-pressed="'+state.toolFavs.includes(t.id)+'">'+icon('star')+'</button></div><h3>'+E(t.title)+'</h3><p>'+E(t.desc)+'</p><div class="card-footer"><span class="tag">'+t.tag+'</span>'+icon('arrow')+'</div></article>';}
// Dashboard: where to work, favorites first, every tool one click away but folded.
function dashFavCommands(){const cs=allCommands().filter(c=>state.cmdFavs.includes(c.id)).slice(0,8);return cs.length?cs.map(c=>'<div class="dash-row"><div class="dash-row-text"><strong>'+E(c.title)+'</strong>'+whereTag(whereLabel(c))+'</div><button class="btn small" data-command="'+c.id+'" aria-label="'+E(c.title)+' 열기">'+icon(hasFields(c)?'edit':'copy')+(hasFields(c)?'값 넣기':'확인 · 복사')+'</button></div>').join(''):'<p class="muted small">명령어 카드의 별표를 누르면 여기에 모입니다.</p>';}
function dashFavTools(){const ts=D.tools.filter(t=>state.toolFavs.includes(t.id));return ts.length?ts.map(t=>'<button class="dash-tool" data-go="'+t.id+'"><span class="tool-icon '+t.color+'">'+icon(t.icon)+'</span><span><strong>'+E(t.title)+'</strong><small>'+E(t.desc)+'</small></span></button>').join(''):'<p class="muted small">도구 화면 제목 옆 별표로 추가하세요.</p>';}
function home(){
 const count=domain=>D.commands.filter(c=>commandDomain(c)===domain).length;
 return '<div class="page-title"><div><div class="eyebrow">DASHBOARD · OFFLINE FIELD KIT</div><h1>내 작업실</h1><p>자주 쓰는 명령과 도구를 한 화면에 모았습니다. 입력과 결과는 이 탭 메모리에만 있습니다.</p></div><div class="actions">'+guideButton('home')+'<span class="offline-pill">'+icon('shield')+'로컬 처리</span></div></div>'+
 '<button class="dash-search" data-open-palette>'+icon('search')+'<span>명령어 · 도구 검색<small>포트, 로그, 한글, autocommit, 커밋…</small></span><kbd>Ctrl K</kbd></button>'+
 '<div class="env-grid">'+
  '<section class="env-card"><h2>'+icon('terminal')+'Windows PowerShell</h2><p>작업 PC의 로그·포트·해시·서비스 확인 · '+count('windows')+'개</p><button class="btn" data-open-domain="windows">PowerShell 명령 보기</button></section>'+
  '<section class="env-card"><h2>'+icon('terminal')+'Linux 셸 · SSH</h2><p>Ubuntu 22.04 · RHEL 7 · WAS · 로그 · '+count('linux')+'개</p><button class="btn" data-open-domain="linux">Linux 명령 보기</button></section>'+
  '<section class="env-card"><h2>'+icon('database')+'DB · SQL 작업대</h2><p>DB를 고르면 접속 → 확인 → 쿼리 → 확정 순서와 붙여넣을 프롬프트를 안내합니다.</p><div class="chip-row">'+Object.entries(DBS).map(([id,db])=>'<button class="chip" data-open-sql-db="'+id+'">'+E(db.label)+'</button>').join('')+'</div><button class="text-btn" data-open-domain="db">DB 명령 전체 보기 '+icon('arrow')+'</button></section>'+
 '</div>'+
 '<div class="dash-grid"><section class="panel"><div class="panel-head"><h2>즐겨찾는 명령</h2><button class="text-btn" data-go="commands">전체 명령어 '+icon('arrow')+'</button></div><div id="home-fav-commands" class="dash-list">'+dashFavCommands()+'</div></section>'+
 '<section class="panel"><div class="panel-head"><h2>즐겨찾는 도구</h2><button class="text-btn" data-go="favorites">즐겨찾기 '+icon('arrow')+'</button></div><div id="home-fav-tools" class="dash-list">'+dashFavTools()+'</div></section></div>'+
 '<details class="all-tools"><summary>모든 도구 '+D.tools.length+'개 · 명령어 '+D.commands.length+'개</summary><div id="home-cards" class="tool-grid section-gap">'+homeCards()+'</div></details>'+
 '<div class="note compact section-gap">'+icon('lock')+' 명령을 실행하거나 서버에 접속하지 않습니다. 카드의 “입력:” 위치(Linux 셸 · PowerShell · csql> 등)를 확인하고 복사한 뒤 직접 붙여넣으세요.</div>';}
function sqlPresetButton(command) {
 if (!command.editorSql) return '';
 return '<button class="btn small" data-open-sql-preset="' + E(command.id) + '">' +
  icon('edit') + '쿼리 정렬로 열기</button>';
}
// Changing the DB re-renders the workbench guide and drops results checked under the previous DB's rules.
function setSqlDialect(dialect) {
 if (!DBS[dialect]) return;
 const changed = dialect !== sqlDialect;
 sqlDialect = dialect;
 const root = views.get('sqlformat');
 if (!root) return;
 renderSqlDb(root);
 if (changed) {
  invalidateSqlReview();
  setEditorValue(root.querySelector('#sqlformat-output'), '');
  const status = root.querySelector('#sqlformat-status');
  status.className = 'status';
  status.textContent = DBS[dialect].label + ' 기준으로 바꿨습니다. 붙여넣을 곳: ' + DBS[dialect].prompt + '. 다시 정렬하거나 복사하세요.';
  counters(root);
 }
}
function openSqlPreset(id, dialect) {
 const preset = D.commands.find(command => command.id === id);
 if (!preset?.editorSql) return;
 const existing = views.get('sqlformat')?.querySelector('#sqlformat-input');
 if (existing && existing.value.trim() && existing.value !== preset.editorSql &&
     !confirm('SQL 원문에 작성한 내용이 있습니다. 이 프리셋으로 교체할까요?')) return;
 if ($('#modal').open) $('#modal').close();
 if (dialect) setSqlDialect(dialect);
 go('sqlformat');
 const input = $('#sqlformat-input');
 input.value = preset.editorSql;
 input.dispatchEvent(new Event('input', {bubbles: true}));
 setStatus('sqlformat-status', DBS[sqlDialect].label + ' · 테이블명·값·조건을 수정한 뒤 복사를 누르세요. 붙여넣을 곳: ' + DBS[sqlDialect].prompt);
 input.focus();
 const sampleTable = 'pocket_ops_sample';
 const start = input.value.indexOf(sampleTable);
 if (start >= 0) input.setSelectionRange(start, start + sampleTable.length);
}
function commandCard(c){const risk={read:['green','조회 중심'],load:['orange','부하 주의'],change:['red','실제 변경'],custom:['orange','사용자 명령']}[c.risk]||['orange','확인 필요'];return '<article class="command-card"><div class="command-top"><span class="tag '+risk[0]+'">'+risk[1]+'</span><h3>'+E(c.title)+'</h3><button class="icon-btn card-star '+(state.cmdFavs.includes(c.id)?'starred':'')+'" data-cmd-star="'+c.id+'" title="명령어 즐겨찾기" aria-label="명령어 즐겨찾기" aria-pressed="'+state.cmdFavs.includes(c.id)+'">'+icon('star')+'</button></div><div class="where-row">'+whereTag(whereLabel(c))+(c.db?'<span class="tag accent">'+E(DBS[c.db].label)+'</span>':'')+'</div><pre>'+E(c.command)+'</pre><p>'+E(c.note)+'</p><div class="actions"><div class="chip-row"><span class="tag">'+E(c.group)+'</span><span class="tag '+(c.permission==='limited'?'orange':'')+'">'+(c.permission==='limited'?'권한 확인':'일반 계정')+'</span></div><button class="btn small" data-command="'+c.id+'">'+icon(hasFields(c)?'edit':'copy')+(hasFields(c)?'값 넣기 · 복사':'확인 · 복사')+'</button>'+sqlPresetButton(c)+'</div></article>';}
function commandsPage(){return pageHead('commands')+domainButtons('command')+'<div class="command-controls"><input id="command-query" placeholder="상황이나 명령어 검색 · 포트, 로그, 한글, JEUS…" aria-label="명령어 검색"><select id="command-group" aria-label="명령어 분류"><option value="">모든 분류</option>'+[...new Set(allCommands().map(c=>c.group))].map(s=>'<option>'+E(s)+'</option>').join('')+'</select><select id="command-permission" aria-label="권한 필터"><option value="">모든 권한</option><option value="user">일반 계정 중심</option><option value="limited">권한 확인 필요</option></select></div><div class="actions spread command-tools"><div class="chip-row command-quick" aria-label="자주 찾는 검색어">'+['포트','로그','권한','JEUS','Tomcat','한글'].map(x=>'<button class="chip" data-command-search="'+x+'">'+x+'</button>').join('')+'</div><button class="btn small" id="add-command">'+icon('plus')+'내 명령어</button></div><div class="note compact" id="command-domain-guide">환경 선택 → 분류 / 검색 → 확인 · 복사. 카드의 “입력:”이 붙여넣을 곳입니다. 실행 조건과 대체 명령을 함께 확인하세요. 조회 결과가 없다고 미설치로 판단하지 마세요.</div><div class="db-filter" id="command-db-filter" hidden></div><div class="section-head"><h2>필요한 명령어 <span class="count" id="command-count"></span></h2>'+check('command-favorites','즐겨찾기만')+'</div><div class="command-list" id="command-list"></div>';
}
function matches(text,query){return query.trim().toLowerCase().split(/\s+/).filter(Boolean).every(w=>text.toLowerCase().includes(w));}
function renderCommands(){if(!$('#command-list'))return;const q=$('#command-query').value,group=$('#command-group').value,perm=$('#command-permission').value,fav=$('#command-favorites').checked,domain=$('[data-command-domain].active')?.dataset.commandDomain||'',db=domain==='db'?commandDb:'';const results=allCommands().filter(c=>(!domain||commandDomain(c)===domain)&&(!db||!c.db||c.db===db)&&(!group||c.group===group)&&(!perm||c.permission===perm)&&(!fav||state.cmdFavs.includes(c.id))&&matches([c.title,c.group,c.command,c.note,c.tags,c.prerequisite,c.where||''].join(' '),q)).sort((a,b)=>Number(state.cmdFavs.includes(b.id))-Number(state.cmdFavs.includes(a.id)));$('#command-count').textContent=results.length+' / '+allCommands().length;$('#command-list').innerHTML=results.length?results.map(commandCard).join(''):'<div class="empty">'+icon('search')+'<p>일치하는 명령어가 없어요. 다른 단어나 분류를 사용해 보세요.</p></div>';}
function setCommandDb(db){
 commandDb=DBS[db]?db:'';
 const workbench=$('#command-db-filter [data-open-sql-db]');
 if(workbench)workbench.dataset.openSqlDb=commandDb;
 $$('[data-command-db]').forEach(b=>{const active=b.dataset.commandDb===commandDb;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 renderCommands();
}
function setCommandDomain(domain){
 $$('[data-command-domain]').forEach(b=>{const active=b.dataset.commandDomain===domain;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 if(domain!=='db')commandDb='';
 $('#command-group').innerHTML='<option value="">모든 분류</option>'+[...new Set(allCommands().filter(c=>!domain||commandDomain(c)===domain).map(c=>c.group))].map(s=>'<option>'+E(s)+'</option>').join('');
 const guide=$('#command-domain-guide');
 guide.classList.toggle('show',Boolean(domain));guide.textContent=({windows:'Windows 11: 시작 → Windows PowerShell → 열기. 카드에 “입력: Windows PowerShell”로 표시된 명령만 이곳에 붙여넣으세요. 권한 확인이 표시되면 승인된 계정 권한을 확인하세요.',linux:'Ubuntu 22 / RHEL 7: 승인된 SSH 도구 → 대상 서버 접속 → 셸($)에 붙여넣기. 패키지·서비스 이름과 설치 조건은 명령마다 확인하세요.',db:'DB 고르기 → 1 접속(Linux 셸) → 2 대상·자동 커밋 확인 → 3 쿼리 → 4 확정 순서입니다. 카드의 “입력:”이 Linux 셸인지 csql> · MariaDB> · SQL> · psql => 프롬프트인지 확인하세요.'})[domain]||'환경 선택 → 분류 / 검색 → 확인 · 복사. 카드의 “입력:”이 붙여넣을 곳입니다. 실행 조건과 대체 명령을 함께 확인하세요. 조회 결과가 없다고 미설치로 판단하지 마세요.';
 const filter=$('#command-db-filter');
 filter.hidden=domain!=='db';
 filter.innerHTML=domain==='db'?dbChips('command',commandDb,true)+'<button class="btn small primary" data-open-sql-db="'+commandDb+'">'+icon('database')+'SQL 작업대에서 순서대로 보기</button>':'';
 renderCommands();
}
// Same-name values follow the user into an alternative; FILE/PATH style fields are treated as one location.
const PARAM_FALLBACK={PATH:['FILE','DIR','LOG'],FILE:['PATH','LOG'],LOG:['FILE','PATH'],DIR:['PATH']};
function openCommand(id,carry={}){const c=cmd(id);if(!c)return;const fields=c.risk==='custom'?[]:[...new Set(Array.from(c.command.matchAll(/\{\{([A-Z_]+)\}\}/g),m=>m[1]))];let caution=c.risk==='change'?'변경 작업에 사용하는 명령입니다. 대상과 영향 범위를 먼저 확인하세요.':c.risk==='load'?'조회 중에도 CPU·메모리·디스크 부하 또는 JVM 일시 지연이 발생할 수 있습니다.':c.risk==='custom'?'사용자가 저장하거나 가져온 명령입니다. 안전성을 검증하지 않았습니다. 내용을 확인하세요.':'실행 전 서버·계정·설치 경로를 확인하세요. 이 페이지는 복사만 합니다.';
 const carried=carry.values||{},source=n=>[n].concat(PARAM_FALLBACK[n]||[]).find(name=>typeof carried[name]==='string');
 const initial=n=>{const from=source(n);if(from)return carried[from];const p=D.params[n]||{label:n,default:''};return c.shell==='powershell'?(p.defaultPowerShell??p.default):p.default;};
 const kept=fields.filter(source),back=carry.back&&cmd(carry.back.id);
 const alternatives=(c.alternatives||[]).map(cmd).filter(Boolean);
 modal(c.title,(back?'<button class="btn small subtle back-command" id="command-back">← 원래 명령으로: '+E(back.title)+'</button>':'')+(c.prerequisite?'<div class="note"><b>실행 조건</b> '+E(c.prerequisite)+'</div>':'')+'<p class="muted">'+E(c.note)+'</p><div class="note '+(c.risk!=='read'?'warn':'')+'">'+caution+'</div>'+(kept.length?'<div class="note compact" id="command-carried">이전 명령에서 입력한 값을 이어받았습니다: '+E(kept.join(', '))+'. 이 명령에도 맞는지 확인하세요.</div>':'')+'<div class="form-grid two">'+fields.map(n=>field('param-'+n,(D.params[n]||{label:n}).label,initial(n))).join('')+'</div><div class="panel-head"><span class="field-label">입력: '+E(whereLabel(c))+' · 최종 명령어</span><span class="tag">자동 실행 안 함</span></div><textarea id="command-preview" readonly class="short" spellcheck="false" aria-label="생성된 명령어"></textarea><div id="command-status" class="status"></div>'+(c.risk!=='read'?'<div class="actions" style="margin:12px 0">'+check('command-ack','대상과 명령 내용을 확인했습니다.')+'</div>':'')+(alternatives.length?'<div class="alternative-commands"><span class="field-label">사용할 수 없을 때 · 조건을 비교하고 하나씩 선택 · 입력한 값은 이어집니다</span>'+alternatives.map(a=>'<div class="alt-row"><button class="btn small" data-command="'+a.id+'" data-alt>'+E(a.title)+'</button><p class="alt-meta"><span>입력: '+E(whereLabel(a))+'</span><span>조건: '+E(a.prerequisite||'명령 설명 확인')+'</span></p></div>').join('')+'</div>':'')+'<div class="actions spread"><div>'+(c.risk==='custom'?'<button class="btn small" id="edit-command">'+icon('edit')+'수정</button>':sqlPresetButton(c))+'</div><button class="btn primary" id="copy-command">'+icon('copy')+'명령어 복사</button></div>',()=>{
  const values=()=>Object.fromEntries(fields.map(n=>[n,$('#param-'+n).value]));
  activeCommand={id:c.id,back:carry.back||null,values};
  function preview(){try{const vals=values();$('#command-preview').value=fields.length?C.fillCommand(c.command,vals,D.params,c.shell):c.command;setStatus('command-status',fields.length?'입력한 셸 인수를 인용했습니다. 대상과 최종 명령을 확인하세요.':'표시된 원문을 복사합니다.');$('#copy-command').disabled=c.risk!=='read'&&!$('#command-ack').checked;}catch(e){$('#command-preview').value='';setStatus('command-status',e.message,'error');$('#copy-command').disabled=true;}}
  fields.forEach(n=>$('#param-'+n).addEventListener('input',()=>{if($('#command-ack'))$('#command-ack').checked=false;preview();}));if($('#command-ack'))$('#command-ack').onchange=preview;$('#copy-command').onclick=()=>copy($('#command-preview').value);if($('#edit-command'))$('#edit-command').onclick=()=>customCommand(c.id);
  if(back)$('#command-back').onclick=()=>openCommand(back.id,{values:{...carry.back.values,...values()},back:carry.back.back});
  preview();
 });
}
function customCommand(id){const existing=id?cmd(id):null;
 modal(existing?'내 명령어 수정':'내 명령어 추가','<div class="note warn">명령어 본문은 브라우저에 평문 저장되며 백업에도 포함됩니다. 비밀번호·토큰·내부 개인정보는 넣지 마세요. 저장만 하며 실행하지 않습니다.</div>'+field('custom-title','짧은 제목',existing?existing.title:'')+select('custom-shell','실행 환경',[['bash','Bash / Linux'],['powershell','PowerShell']])+'<label class="field"><span>명령어 · 자동 치환하지 않는 원문</span><textarea id="custom-body" class="short" maxlength="8000" spellcheck="false"></textarea></label>'+field('custom-note','설명 / 주의사항',existing?existing.note:'')+field('custom-tags','검색 태그',existing?existing.tags:'')+'<div id="custom-status" class="status"></div><div class="actions spread">'+(existing?'<button class="btn danger" id="custom-delete">삭제</button>':'<span></span>')+'<button class="btn primary" id="custom-save">'+icon('check')+'내 명령어 저장</button></div>',()=>{
  $('#custom-title').maxLength=80;$('#custom-note').maxLength=400;$('#custom-tags').maxLength=200;if(existing){$('#custom-body').value=existing.command;$('#custom-shell').value=existing.shell;}
  $('#custom-save').onclick=()=>run('custom-status',()=>{const title=$('#custom-title').value.trim(),body=$('#custom-body').value;if(!title||!body.trim())throw new Error('제목과 명령어를 입력하세요.');const item={id:existing?existing.id:'custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),title,command:body,note:$('#custom-note').value,group:'내 명령어',tags:$('#custom-tags').value,risk:'custom',permission:'limited',shell:$('#custom-shell').value};const next={...state,customCommands:state.customCommands.filter(c=>c.id!==item.id).concat(item)};state=validateState(next);save();$('#modal').close();views.delete('commands');views.delete('settings');go('commands');toast(canStore?'내 명령어를 저장했어요.':'현재 탭에 추가했어요. 설정 백업이 필요합니다.');});
  if(existing)$('#custom-delete').onclick=()=>{if(!confirm('이 명령어를 내 보관함에서 삭제할까요?'))return;state.customCommands=state.customCommands.filter(c=>c.id!==id);state.cmdFavs=state.cmdFavs.filter(x=>x!==id);save();$('#modal').close();views.delete('commands');go('commands');toast('내 명령어를 삭제했어요.');};
 });
}
// Labels of fields the example would overwrite that already hold the user's own text.
function guideOverwrites(id){
 const ex=D.guides[id]?.example,root=views.get(id);
 if(!ex||!ex.fill||!root)return [];
 return Object.entries(ex.fill).map(([name,value])=>{const el=root.querySelector('#'+name);return el&&(el.tagName==='TEXTAREA'||el.type==='text')&&el.value.trim()&&el.value!==el.defaultValue&&el.value!==String(value)?el:null;})
  .filter(Boolean).map(el=>((el.closest('label')||el.closest('.panel'))?.querySelector('span,h2')?.textContent)||el.id);
}
function openGuide(id){
 const g=D.guides&&D.guides[id];if(!g)return;
 const ex=g.example,runnable=Boolean(ex&&(ex.fill||ex.click)),overwrite=runnable?guideOverwrites(id):[];
 modal('사용 예시 · '+pageName(id),'<div class="guide" data-guide-id="'+id+'">'+
  '<p class="guide-when"><b>이럴 때</b>'+E(g.when)+'</p>'+
  '<ol class="help-steps guide-steps">'+g.steps.map((s,i)=>'<li class="help-step"><b class="num">'+(i+1)+'</b><div><strong>'+E(s[0])+'</strong>'+(s[1]?'<p>'+E(s[1])+'</p>':'')+'</div></li>').join('')+'</ol>'+
  (ex?'<div class="guide-example"><div><span class="field-label">입력 예</span><pre id="guide-example-input">'+E(ex.input)+'</pre></div><div><span class="field-label">결과 예</span><pre id="guide-example-output">'+E(ex.output)+'</pre></div></div>':'')+
  g.cautions.map(c=>'<div class="note compact warn">'+E(c)+'</div>').join('')+
  (overwrite.length?'<div class="note compact error" id="guide-overwrite">지금 입력한 내용이 예시로 바뀝니다: '+E(overwrite.join(', '))+'</div>':'')+
  '<div class="actions spread guide-actions">'+(id===current?'<span class="muted small guide-key">? 키로 다시 열기 · Esc 닫기</span>':'<button class="btn" id="guide-open">'+icon('arrow')+'이 화면 열기</button>')+
  (runnable?'<button class="btn primary" id="guide-try">'+icon('spark')+E(overwrite.length?'입력을 예시로 바꾸고 해보기':(ex.label||'이 예시로 해보기'))+'</button>':'')+'</div>'+
  '<label class="field guide-switch"><span>다른 화면의 사용 예시</span><select id="guide-switch">'+GUIDE_ORDER.map(k=>'<option value="'+k+'"'+(k===id?' selected':'')+'>'+E(pageName(k))+'</option>').join('')+'</select></label></div>',d=>{
  d.querySelector('#guide-switch').onchange=e=>{openGuide(e.target.value);$('#guide-switch')?.focus();};
  const open=d.querySelector('#guide-open');if(open)open.onclick=()=>{d.close();go(id);};
  const tryButton=d.querySelector('#guide-try');if(tryButton)tryButton.onclick=()=>runGuideExample(id);
 });
}
// Puts the guide's example into that screen's own fields and presses its own buttons, so the result
// comes from the same code path as manual use. Values come from the catalog, never from imports.
function runGuideExample(id){
 const ex=D.guides[id]?.example;if(!ex)return;
 if($('#modal').open)$('#modal').close();
 if(current!==id)go(id);
 const root=views.get(id);if(!root)return;
 for(const [name,value] of Object.entries(ex.fill||{})){
  const el=root.querySelector('#'+name);if(!el)continue;
  if(el.type==='checkbox')el.checked=Boolean(value);else setEditorValue(el,String(value));
  el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
 }
 (ex.click||[]).forEach(selector=>root.querySelector(selector)?.click());
 counters(root);
 const target=ex.result&&root.querySelector('#'+ex.result);
 if(target)target.scrollIntoView({block:'center'});
 if(ex.fill)toast('사용 예시를 넣었습니다. 결과와 상태 줄을 확인하세요.');
}
function favorites(){const ts=D.tools.filter(t=>state.toolFavs.includes(t.id)),cs=allCommands().filter(c=>state.cmdFavs.includes(c.id));return '<div class="page-title"><div><div class="eyebrow">YOUR PERSONAL SHORTLIST</div><h1>자주 쓰는 것만, 가까이에</h1><p>각 도구·명령어의 별표 → 왼쪽 메뉴의 즐겨찾기에서 한 번에 확인하세요.</p></div><div class="actions">'+guideButton('favorites')+'</div></div><div class="section-head"><h2>즐겨찾는 도구 <span class="count">'+ts.length+'</span></h2></div><div class="tool-grid">'+(ts.length?ts.map(card).join(''):'<div class="empty">아직 즐겨찾는 도구가 없어요.</div>')+'</div><div class="section-head"><h2>즐겨찾는 명령어 <span class="count">'+cs.length+'</span></h2></div><div class="command-list">'+(cs.length?cs.map(commandCard).join(''):'<div class="empty">명령어 카드의 별을 눌러 모아 보세요.</div>')+'</div>';}
function encodingPage(){return pageHead('encoding')+'<div class="note">가장 확실한 출발점은 <b>깨지기 전의 원본 파일</b>입니다. 파일을 다른 문자셋으로 다시 읽는 기능과, 이미 깨진 문자열을 되짚는 기능을 구분했습니다.</div><section class="panel"><div class="panel-head"><h2>01 / 원본 파일 다시 읽기</h2><span class="tag">최대 8 MiB · 원본 덮어쓰기 없음</span></div><div class="editor-grid"><label class="dropzone" id="encoding-drop">'+icon('upload')+'<strong>파일을 놓거나 클릭해서 선택</strong>TXT, CSV, LOG, XML, JSON 등 텍스트 파일<input type="file" id="encoding-file" aria-label="문자셋을 확인할 원본 파일"></label><div>'+select('file-charset','이 문자셋으로 읽기',[['utf-8','UTF-8'],['euc-kr','EUC-KR / Windows-949 계열'],['utf-16le','UTF-16 Little Endian'],['utf-16be','UTF-16 Big Endian'],['windows-1252','Windows-1252']])+'<div class="file-info" id="encoding-info">아직 선택된 파일이 없습니다.</div></div></div><div class="file-info" id="encoding-hex"></div><textarea id="encoding-output" readonly class="short section-gap" aria-label="원본 파일 디코딩 결과" placeholder="파일의 문자셋을 바꾸며 한글이 올바르게 보이는지 확인하세요."></textarea><div id="encoding-file-status" class="status"></div><div class="actions section-gap"><button class="btn" id="encoding-copy">'+icon('copy')+'전체 결과 복사</button><button class="btn primary" id="encoding-save">'+icon('download')+'UTF-8로 저장</button>'+check('encoding-bom','UTF-8 BOM 추가 · 일부 Excel용')+'</div></section><div class="section-head"><h2>02 / 이미 깨진 문자열 · 복구 후보 찾기</h2><button class="btn small" id="repair-sample">샘플 넣기</button></div><div class="panel"><div class="form-grid two">'+select('repair-source','잘못 읽힌 문자셋 가정',[['latin1','ISO-8859-1 (Latin-1)로 읽혔다고 가정'],['windows-1252','Windows-1252로 읽혔다고 가정']])+select('repair-target','원래 바이트의 문자셋 가정',[['utf-8','원래 UTF-8 바이트'],['euc-kr','원래 EUC-KR / Windows-949 바이트']])+'</div><button class="btn primary" id="repair-run">'+icon('spark')+'복구 후보 만들기</button><div id="repair-status" class="status"></div></div><div class="editor-grid">'+editor('repair-input','깨져 보이는 문자열','ì… 처럼 잘못 보이는 문자를 붙여넣으세요.',false,'short')+editor('repair-output','복구 후보 · 원문 대조 필수','복구 결과는 원본과 반드시 대조하세요.',true,'short')+'</div><div class="note warn">이미 <b>�</b> 또는 대체된 <b>?</b>로 저장되었다면 소실된 문자를 확정 복원할 수 없습니다. 정상적으로 디코딩되어도 올바른 인코딩이라는 증거는 아닙니다. EUC-KR/CP949 저장은 제공하지 않으며 UTF-8 내보내기만 지원합니다.</div>';}
function codecPage(){return pageHead('codec')+'<div class="panel"><div class="form-grid two">'+select('codec-mode','변환 형식',[['url','URL component · encodeURIComponent'],['base64','Base64 / Base64URL 읽기 · UTF-8 텍스트'],['hex','HEX 바이트 ↔ UTF-8 텍스트'],['unicode','Java 스타일 \\uXXXX 이스케이프'],['html','HTML 기본 엔티티 · &amp; &lt; &gt; 등']])+'<div><span class="field-label">실행 방향</span><div class="actions"><button class="btn primary" id="codec-encode">'+icon('arrow')+'인코딩</button><button class="btn" id="codec-decode">'+icon('arrows')+'디코딩</button><button class="btn small subtle" id="codec-sample">샘플</button></div></div></div><div class="actions spread">'+check('codec-plus','URL 디코딩에서 +를 공백으로 해석 · form 데이터용')+'<button class="text-btn" id="codec-swap">결과를 입력으로 옮기기 '+icon('arrows')+'</button></div><div id="codec-status" class="status"></div></div><div class="editor-grid">'+editor('codec-input','입력','한글도 이모지도, 원문 그대로 붙여넣으세요.')+editor('codec-output','결과','변환 결과가 여기에 표시됩니다.',true)+'</div><div class="note">입력과 결과는 각각 2,000,000자까지 처리합니다. 결과가 더 길어지면 입력을 나눠 주세요. Base64는 암호화가 아닙니다. 텍스트 변환은 UTF-8 기준이며 바이너리 Base64를 억지로 문자로 바꾸지 않습니다. HTML 디코딩은 기본 이름 엔티티 6종과 숫자 엔티티를 지원합니다. 입력 HTML을 실행하지 않습니다.</div>';}
function jsonPage(){return pageHead('json')+'<div class="panel"><div class="actions spread"><div class="actions"><button class="btn primary" id="json-pretty">'+icon('braces')+'보기 좋게 정리</button><button class="btn" id="json-minify">공백 압축</button><button class="btn" id="json-validate">문법 검증</button><select id="json-indent" class="w-small" aria-label="JSON 들여쓰기"><option value="2">2칸 들여쓰기</option><option value="4">4칸 들여쓰기</option></select></div><button class="text-btn" id="json-sample">샘플 넣기</button></div><div id="json-status" class="status"></div></div><div class="editor-grid">'+editor('json-input','JSON 원문','API 응답이나 설정 JSON을 붙여넣으세요.',false,'tall')+editor('json-output','정리된 JSON','문자열·숫자 표기를 바꾸지 않고 공백만 정리합니다.',true,'tall')+'</div><div class="note success">큰 정수, 소수 표기, <code>-0</code>, 키 순서, 중복 키를 임의로 바꾸지 않습니다. 파싱한 숫자를 다시 직렬화하지 않고 <b>원래 토큰을 보존</b>합니다. 정렬은 들여쓰기 정리이며 키 재배열이 아닙니다.</div>';}
function textPage(){return pageHead('text')+'<div class="panel"><div class="actions">'+check('text-trim','줄 앞뒤 공백 제거',true)+check('text-empty','빈 줄 제거',true)+check('text-unique','중복 줄 제거',true)+'</div><div class="form-grid two section-gap">'+select('text-sort','줄 순서',[['keep','원래 순서 유지'],['asc','자연 오름차순 · 2 다음 10'],['desc','자연 내림차순']])+select('text-eol','결과 줄바꿈',[['lf','LF · Linux'],['crlf','CRLF · Windows']])+'</div><div class="actions spread"><button class="btn primary" id="text-run">'+icon('spark')+'선택한 정리 적용</button><div class="actions"><button class="text-btn" id="text-sample">샘플 넣기</button><button class="text-btn" id="text-swap">결과 → 입력</button></div></div><div id="text-status" class="status"></div></div><div class="editor-grid">'+editor('text-input','원문','복사한 목록을 한 줄에 하나씩 넣어 보세요.')+editor('text-output','정리된 목록','원문은 바꾸지 않고 결과만 만듭니다.',true)+'</div><div class="note">선택한 공백·중복 제거는 의미 있는 공백이나 중복 데이터를 없앨 수 있습니다. 코드·CSV 원본에는 필요한 옵션만 켜세요. 내려받기에는 선택한 줄바꿈 형식을 적용합니다.</div>';}
function diffPage(){return pageHead('diff')+'<div class="panel"><div class="actions spread"><div class="actions"><button class="btn primary" id="diff-run">'+icon('diff')+'변경점 비교</button>'+check('diff-space','줄 앞뒤 공백 무시')+check('diff-changes','바뀐 줄만 표시')+'</div><div class="actions"><button class="text-btn" id="diff-sample">샘플 넣기</button><button class="btn small" id="diff-save">'+icon('download')+'비교 결과 저장</button></div></div><div id="diff-status" class="status"></div></div><div class="editor-grid">'+editor('diff-before','변경 전','기존 설정을 붙여넣으세요.',false,'short')+editor('diff-after','변경 후','변경된 설정을 붙여넣으세요.',false,'short')+'</div><div id="diff-stats" class="stat-row"></div><div id="diff-result" class="diff-view"><div class="empty">변경 전·후 내용을 넣고 비교해 보세요.</div></div><div class="note compact">줄 단위 비교입니다. 각 2,500줄·500,000자 이하이며 차이가 큰 대형 입력은 분할이 필요합니다. LF/CRLF는 동일하게 비교하고 마지막 개행 유무는 별도 빈 줄로 반영합니다. 저장 파일은 참고용 비교 보고서이며 git patch가 아닙니다.</div>';}
function logsPage(){return pageHead('logs')+'<div class="panel"><div class="form-grid">'+field('logs-include','포함 단어 · 쉼표로 OR','ERROR,Exception')+field('logs-exclude','제외 단어 · 쉼표로 OR','')+select('logs-context','일치 줄 주변 문맥',[['0','일치 줄만'],['1','앞뒤 1줄'],['3','앞뒤 3줄'],['5','앞뒤 5줄'],['10','앞뒤 10줄']])+'</div><div class="actions spread"><div class="actions"><button class="btn primary" id="logs-run">'+icon('search')+'로그 추려보기</button>'+check('logs-case','대소문자 무시',true)+'</div><div class="actions"><label class="btn small">'+icon('upload')+'UTF-8 파일 열기<input type="file" id="logs-file" class="sr-only"></label><button class="text-btn" id="logs-sample">샘플</button></div></div><div id="logs-status" class="status"></div></div><div id="logs-stats" class="stat-row"></div><div class="editor-grid">'+editor('logs-input','원본 로그','로그를 붙여넣거나 UTF-8 파일을 선택하세요.',false,'tall')+editor('logs-output','필터 결과','필터에 해당하는 줄과 선택한 문맥이 표시됩니다.',true,'tall')+'</div><div class="note">고정 문자열 검색이며 정규식이 아닙니다. 문맥 옵션을 켜면 제외 단어가 있는 줄도 <b>주변 문맥으로</b> 포함될 수 있습니다. 최대 50,000줄·2,000,000자, 포함 / 제외 검색어는 각각 2,000자·50개까지입니다. 원본 로그에는 토큰·개인정보가 포함될 수 있으니 반출에 유의하세요.</div>';}
function sqlPage(){return pageHead('sql')+'<div class="panel"><div class="form-grid">'+field('sql-column','컬럼명 · 최대 512자','ITEM_ID')+select('sql-kind','값의 형식',[['string','문자열 · 작은따옴표 이스케이프'],['number','숫자 · 숫자 표현식만 허용']])+select('sql-chunk','IN 묶음당 최대 개수',[['1000','1,000개 · Oracle 11g 고려'],['500','500개'],['100','100개'],['50','50개']])+'</div><div class="actions spread"><div class="actions"><button class="btn primary" id="sql-run">'+icon('database')+'IN 조건 만들기</button>'+check('sql-unique','중복 제거',true)+check('sql-trim','앞뒤 공백 제거',true)+'</div><button class="text-btn" id="sql-sample">샘플 넣기</button></div><div id="sql-status" class="status"></div></div><div class="editor-grid">'+editor('sql-input','값 목록 · 한 줄에 하나','A001\nA002\nO\'Brien\n00123')+editor('sql-output','생성된 조건절','DB에 접속하거나 SQL을 실행하지 않습니다.',true)+'</div><div class="note warn">입력은 최대 1,000,000자, 생성 결과는 최대 2,000,000자입니다. 결과가 한도를 넘으면 나누어 처리하세요. 문자열의 작은따옴표는 두 번 써서 이스케이프합니다. 역슬래시·제어문자는 DB별 해석 차이 때문에 거부합니다. DB 종류·SQL 모드에 따라 결과를 검토하세요. 1,000개를 넘으면 OR 묶음으로 나눕니다. 이것이 DB의 다른 제한·성능까지 해결하지는 않습니다. <code>NULL</code>이라는 줄은 문자열 모드에서 문자 그대로 처리합니다. 애플리케이션 코드에는 바인드 변수를 사용하세요.</div>';}
function unicodePage(){return pageHead('unicode')+'<div class="panel"><label class="field"><span>검사할 문자 · 최대 2,000 코드 포인트</span><textarea id="unicode-input" class="short" spellcheck="false" placeholder="A 한글 😀 또는 보이지 않는 공백을 붙여넣으세요."></textarea></label><div class="actions spread"><div class="actions"><button class="btn primary" id="unicode-run">'+icon('scan')+'문자 분석</button><button class="btn" id="unicode-ascii">ASCII 0~127 표</button></div><button class="text-btn" id="unicode-sample">숨은 공백 샘플</button></div><div id="unicode-status" class="status"></div><div id="unicode-stats" class="stat-row"></div><div id="unicode-table" class="table-wrap"><div class="empty">문자의 코드 포인트와 실제 UTF-8 바이트를 나란히 확인하세요.</div></div></div><div class="panel"><div class="panel-head"><h2>숫자 코드 → 문자</h2><span class="tag">10진수 / 0x / U+</span></div>'+field('unicode-codes','공백 또는 쉼표로 구분','65 U+D55C U+AE00 0x1F600')+'<div class="actions"><button class="btn" id="unicode-decode">문자로 바꾸기</button><button class="btn small" data-copy-id="unicode-decoded">'+icon('copy')+'복사</button></div><textarea id="unicode-decoded" readonly class="short section-gap" aria-label="숫자 코드를 변환한 문자"></textarea><div id="unicode-code-status" class="status"></div></div><div class="note">ASCII는 0~127 범위입니다. 한글과 이모지는 ASCII 값이 아니라 <b>유니코드 코드 포인트</b>와 <b>UTF-8 바이트</b>로 구분해 표시합니다. 화면에서 한 글자처럼 보이는 조합도 여러 코드 포인트일 수 있습니다.</div>';}
function timePage(){return pageHead('time')+'<div class="editor-grid"><section class="panel"><div class="panel-head"><h2>타임스탬프 → 날짜</h2><button class="text-btn" id="time-now">지금 시각 넣기</button></div>'+field('time-epoch','Unix 타임스탬프','0')+select('time-unit','단위를 명시하세요',[['s','초 · seconds'],['ms','밀리초 · milliseconds']])+'<button class="btn primary" id="time-from-epoch">'+icon('clock')+'날짜로 변환</button></section><section class="panel"><div class="panel-head"><h2>날짜 → 타임스탬프</h2></div>'+field('time-date','날짜와 시간','','datetime-local')+select('time-zone','입력 날짜의 시간대',[['540','KST · UTC+09:00'],['0','UTC · UTC+00:00']])+'<button class="btn primary" id="time-from-date">'+icon('arrows')+'타임스탬프로 변환</button></section></div><div class="panel"><div class="panel-head"><h2>같은 시각, 다른 표기</h2><button class="btn small" data-copy-id="time-output">'+icon('copy')+'복사</button></div><textarea id="time-output" readonly class="short" aria-label="시간 변환 결과"></textarea><div id="time-status" class="status"></div></div><div class="note">시간대 없는 문자열을 브라우저의 지역 설정에 맡기지 않습니다. KST는 고정 UTC+9, UTC는 고정 UTC+0으로 계산합니다. 서버의 실제 시간대·시계 오차는 별도로 확인하세요.</div>';}
function chmodPage(){return pageHead('chmod')+'<div class="panel"><div class="permission-grid">'+['소유자 · USER','그룹 · GROUP','기타 · OTHER'].map((g,i)=>'<div class="permission-group"><h3>'+g+'</h3>'+[[4,'읽기 r'],[2,'쓰기 w'],[1,'실행 x']].map(([n,l])=>'<label><input type="checkbox" data-perm="'+i+'" value="'+n+'" '+((Number('640'[i])&n)?'checked':'')+'>'+l+'<span class="muted right mono">'+n+'</span></label>').join('')+'</div>').join('')+'</div><div class="form-grid two">'+field('chmod-octal','숫자 권한 · 일반 권한 3자리','640')+field('chmod-path','대상 경로','/path/to/file')+'</div><div class="big-result"><div class="octal" id="chmod-number">640</div><code id="chmod-symbol">rw-r-----</code></div><div class="section-gap"><span class="field-label">복사할 명령어 · 실제로 실행하면 권한이 바뀝니다</span><textarea id="chmod-output" class="short" readonly aria-label="chmod 명령어"></textarea></div><div class="actions section-gap"><button class="btn" id="chmod-copy">'+icon('copy')+'내용 확인 후 복사</button><button class="chip" data-octal="644">일반 파일 644</button><button class="chip" data-octal="640">제한 파일 640</button><button class="chip" data-octal="755">디렉터리 755</button><button class="chip" data-octal="750">제한 디렉터리 750</button></div><div id="chmod-status" class="status"></div></div><div class="note warn">제시한 권한은 예시이며 정답이 아닙니다. 디렉터리의 x는 경로 통과 권한입니다. 서비스 계정·그룹·ACL을 함께 확인하세요. 이 계산기는 일반 권한 3자리만 다루며 setuid·setgid·sticky 비트는 지원하지 않습니다.</div>';}
function cronPage(){return pageHead('cron')+'<div class="panel"><div class="form-grid">'+field('cron-expression','크론 표현식 · 분 시 일 월 요일','0 2 * * *')+select('cron-zone','계산 시간대',[['540','KST · UTC+09:00'],['0','UTC · UTC+00:00']])+field('cron-start','이 날짜 이후의 실행 시각','','datetime-local')+'</div><div class="actions spread"><button class="btn primary" id="cron-run">'+icon('calendar')+'다음 실행 미리보기</button><div class="chip-row"><button class="chip" data-cron="*/5 * * * *">5분마다</button><button class="chip" data-cron="0 2 * * *">매일 새벽 2시</button><button class="chip" data-cron="30 9 * * 1-5">평일 9시 30분</button></div></div><div id="cron-status" class="status"></div><div id="cron-fields" class="cron-slots"></div><div class="result-box" id="cron-output">표현식을 넣어 실행 일정을 확인하세요.</div></div><div class="note">5필드 숫자형 Vixie/Cronie 스타일의 부분집합입니다. <code>*</code>, 목록, 범위, <code>*/n</code>, <code>a-b/n</code>을 지원합니다. 초·연도, Quartz의 <code>?</code>·<code>L</code>·<code>W</code>·<code>#</code>, 이름형 월·요일, <code>@reboot</code>는 지원하지 않습니다. 일·요일의 별표 여부에 따른 AND/OR 규칙을 적용합니다.</div><div class="note warn">미리보기일 뿐 서버에 예약하지 않습니다. 서버 시간대·cron 구현·작업 환경변수·권한은 별도로 확인하세요. KST/UTC 고정 오프셋만 계산하며 DST는 지원하지 않습니다. 최대 4년 범위에서 다음 5회를 찾습니다.</div>';}
function hashPage(){return pageHead('hash')+'<div class="panel"><div class="form-grid two">'+select('hash-algorithm','해시 알고리즘',[['SHA-256','SHA-256'],['SHA-384','SHA-384'],['SHA-512','SHA-512']])+field('hash-expected','비교할 해시 · 선택사항','')+'</div><div class="editor-grid"><div><label class="field"><span>UTF-8 텍스트 · 공백과 줄바꿈도 포함됩니다</span><textarea id="hash-input" class="short" spellcheck="false" placeholder="abc"></textarea></label><button class="btn primary" id="hash-text">'+icon('fingerprint')+'텍스트 해시 계산</button></div><div><label class="dropzone">'+icon('file')+'<strong>파일 지문 확인</strong>최대 32 MiB · 파일을 메모리에 읽어서 계산<input id="hash-file" type="file" aria-label="해시를 계산할 파일"></label><div id="hash-file-info" class="file-info">파일을 선택하세요.</div><button class="btn section-gap" id="hash-file-run">파일 해시 계산</button></div></div><div id="hash-status" class="status"></div></div><div class="panel"><div class="panel-head"><h2>계산된 지문</h2><button class="btn small" data-copy-id="hash-output">'+icon('copy')+'복사</button></div><textarea id="hash-output" readonly class="short" aria-label="계산된 해시"></textarea><div id="hash-compare" class="status"></div></div><div class="note">브라우저 Web Crypto를 사용합니다. 제한된 보안 컨텍스트에서는 계산이 비활성화될 수 있습니다. 대형 파일은 명령어 포켓의 <code>sha256sum</code> 또는 <code>Get-FileHash</code>를 이용하세요. 일치하는 해시는 내용 비교용이지 파일의 신뢰성·무해함을 증명하지는 않습니다.</div>';}
function regexPage(){return pageHead('regex')+'<div class="panel"><div class="form-grid two">'+field('regex-pattern','패턴 · 양쪽 / 없이 입력','(ERROR|WARN)\\s+(.+)')+field('regex-flags','플래그 · g i m s u 중 선택','gm')+'</div><div class="actions spread"><button class="btn primary" id="regex-run">'+icon('regex')+'정규식 테스트</button><button class="text-btn" id="regex-sample">샘플 넣기</button></div><div id="regex-status" class="status"></div></div><div class="editor-grid">'+editor('regex-input','테스트 문자열','ERROR connection timeout\nINFO ready\nWARN pool almost full',false,'tall')+editor('regex-output','매치 · 캡처 결과','최대 1,000개 매치 · 캡처 포함 결과 500,000자까지 표시합니다.',true,'tall')+'</div><div class="note">JavaScript 정규식입니다. Java·grep·sed의 문법과 다를 수 있습니다. 별도 Worker에서 실행하며 약 1.2초를 초과하면 중단합니다. Worker가 차단되면 실행하지 않습니다. 입력은 200,000자, 패턴은 2,000자, 캡처를 포함한 결과 텍스트는 500,000자까지입니다.</div>';}
function settingsPage(){let euc=false;try{new TextDecoder('euc-kr');euc=true;}catch(_){}return '<div class="page-title"><div><div class="eyebrow">PACK LIGHT. WORK ANYWHERE.</div><h1>내 포켓 관리</h1><p>개인 설정은 가볍게 보관하고, 업무 입력은 자동 저장하지 않습니다.</p></div><div class="actions">'+guideButton('settings')+'</div></div><div class="settings-grid"><section class="panel"><div class="panel-head"><h2>설정 백업 · 가져오기</h2>'+icon('download')+'</div><p class="muted small">즐겨찾기, 내 명령어, 테마만 JSON 파일로 옮깁니다. 변환 입력·로그·파일 내용·결과는 포함하지 않습니다. 가져오기 파일은 최대 16 MiB입니다.</p><div class="stat-row"><span class="stat"><b>'+state.toolFavs.length+'</b>도구 즐겨찾기</span><span class="stat"><b>'+state.customCommands.length+'</b>내 명령어</span></div><div class="actions"><button class="btn primary" id="settings-export">'+icon('download')+'설정 백업</button><label class="btn">'+icon('upload')+'백업 가져오기<input type="file" id="settings-import" accept="application/json,.json" class="sr-only"></label></div><div id="settings-status" class="status"></div><div class="note compact warn">백업에는 직접 저장한 명령어가 평문으로 포함됩니다. 내부 주소·경로·비밀번호를 넣었는지 확인하고 망간 반입·반출 규정을 준수하세요.</div></section><section class="panel"><div class="panel-head"><h2>이 브라우저의 준비 상태</h2>'+icon('shield')+'</div><div class="list-row"><span>TextEncoder / TextDecoder</span><span class="tag '+(typeof TextDecoder!=='undefined'?'green':'red')+'">'+(typeof TextDecoder!=='undefined'?'지원':'미지원')+'</span></div><div class="list-row"><span>EUC-KR 읽기</span><span class="tag '+(euc?'green':'red')+'">'+(euc?'지원':'미지원')+'</span></div><div class="list-row"><span>Web Crypto</span><span class="tag '+(window.crypto&&window.crypto.subtle?'green':'orange')+'">'+(window.crypto&&window.crypto.subtle?'지원 가능':'제한됨')+'</span></div><div class="list-row"><span>설정 저장소</span><span class="tag '+(canStore?'green':'orange')+'">'+(canStore?'현재 사용 가능':'세션 한정')+'</span></div><div class="list-row"><span>실행 방식</span><code>'+E(location.protocol==='file:'?'로컬 HTML 파일':location.protocol+' 정적 페이지')+'</code></div><div class="note compact">로컬 file:// 저장소는 브라우저·파일 경로·정책에 따라 달라집니다. 파일을 옮기기 전에 설정을 백업하세요. 지원 표시는 관리 정책상 사용 허가를 의미하지 않습니다.</div></section><section class="panel"><div class="panel-head"><h2>입력과 저장 범위</h2>'+icon('lock')+'</div><div class="safe-list"><div>'+icon('check')+'이 페이지에는 API 호출·CDN·광고·분석 스크립트가 없습니다.</div><div>'+icon('check')+'선택한 파일은 로컬에서 읽고 원본을 수정하지 않습니다.</div><div>'+icon('check')+'도구 전환 시 입력은 현재 탭의 메모리에 유지합니다.</div><div>'+icon('check')+'즐겨찾기·테마·명시적으로 추가한 명령어만 저장합니다.</div></div><div class="actions section-gap"><button class="btn" id="clear-inputs">'+icon('trash')+'열린 도구의 입력 비우기</button></div><p class="small muted section-gap">입력 비우기는 현재 화면과 앱 메모리를 초기화합니다. 시스템 클립보드·다운로드한 파일·브라우저 복원 기능·OS 메모리의 보안 삭제까지 보장하지 않습니다.</p></section><section class="panel"><div class="panel-head"><h2>한 페이지, 그대로 들고 가기</h2>'+icon('pocket')+'</div><div class="help-steps"><div class="help-step"><b class="num">1</b><div><strong>상단 → 배포하기 → ZIP 저장.</strong><p>HTML과 안내문을 함께 받습니다. 현재 버전이며 온라인 업데이트를 조회하지 않습니다. 입력·설정·내 명령어는 제외합니다.</p></div></div><div class="help-step"><b class="num">2</b><div><strong>허용된 방식으로 폐쇄망에 반입하세요.</strong><p>기관의 파일·JavaScript 반입 정책을 먼저 확인합니다.</p></div></div><div class="help-step"><b class="num">3</b><div><strong>실행은 pocket-ops.html 파일 하나로.</strong><p>PC: 탐색기 → 파일 우클릭 → 연결 프로그램 → Edge / Chrome. 갤럭시: 앱스 → 내 파일 → 다운로드 → 파일 → 표시되는 HTML 뷰어. 별도 폴더나 설치는 필요하지 않습니다. 방문 전에 네트워크를 끄고 다시 열어 보세요.</p></div></div></div><div class="keys"><span><kbd>Ctrl K</kbd> 도구 · 명령 검색</span><span><kbd>/</kbd> 빠른 검색</span><span><kbd>?</kbd> 현재 화면 사용 예시</span><span><kbd>Esc</kbd> 창 닫기</span></div><div class="note compact">휴대폰 파일 연결 앱에 따라 지원 기능이 다릅니다. JavaScript가 꺼진 HTML 뷰어에서는 같은 파일의 읽기 전용 명령어 참고를 표시합니다. HTML 자체를 차단하는 앱은 지원하지 않습니다. 설정 이전: 메뉴 → 내 포켓 관리 → 설정 백업 / 백업 가져오기.</div></section></div><section class="panel"><div class="panel-head"><h2>내 명령어</h2><button class="btn small" id="settings-add-command">'+icon('plus')+'추가</button></div>'+(state.customCommands.length?state.customCommands.map(c=>'<div class="list-row"><div><strong>'+E(c.title)+'</strong><p>'+E(c.note)+'</p></div><button class="btn small" data-edit-command="'+c.id+'">수정</button></div>').join(''):'<p class="muted small">반복해서 사용하는 명령어를 저장해 두세요. 실행은 하지 않습니다.</p>')+'</section><div class="actions spread"><span class="muted small">POCKET OPS '+(window.PocketBuild?.version||D.version)+' · 외부 라이브러리 없이 제작</span><button class="btn danger small" id="settings-reset">이 앱의 저장 설정 초기화</button></div>';}
function regexJob(pattern, flags, text, signal) {
 C.limit(text, 200_000);
 C.limit(pattern, 2000);
 if (!/^[gimsu]*$/.test(flags) || new Set(flags).size !== flags.length) throw new Error('플래그는 중복 없이 g, i, m, s, u만 사용하세요.');
 if (!window.Worker) throw new Error('이 브라우저는 Worker를 지원하지 않아 정규식을 실행하지 않습니다.');
 function workerMain() {
  self.onmessage = ({data: {pattern, flags, text}}) => {
   try {
    const regex = new RegExp(pattern, flags);
    const rows = [];
    let match, reason = '', length = 4; // Opening and closing brackets and newlines.
    while ((match = regex.exec(text)) !== null) {
     const groups = match.groups || null;
     // Reject an oversized row before allocating escaped copies of repeated captures.
     const rawLength = match.reduce((sum, v) => sum + (v || '').length, 0) +
       Object.values(groups || {}).reduce((sum, v) => sum + (v || '').length, 0);
     if (length + rawLength > 500_000) { reason = 'output'; break; }
     const row = JSON.stringify({index: match.index, match: match[0], captures: match.slice(1), groups});
     length += row.length + (rows.length ? 2 : 0);
     if (length > 500_000) { reason = 'output'; break; }
     rows.push(row);
     if (!regex.global) break;
     if (rows.length === 1000) { reason = 'matches'; break; }
     if (!match[0]) regex.lastIndex += regex.unicode && text.codePointAt(regex.lastIndex) > 0xffff ? 2 : 1;
    }
    self.postMessage({output: rows.length ? '[\n' + rows.join(',\n') + '\n]' : '[]', count: rows.length, reason});
   } catch (error) { self.postMessage({error: error.message}); }
  };
 }
 return new Promise((resolve, reject) => {
  let worker, url, timer;
  function finish(error, result) {
   clearTimeout(timer);
   signal.removeEventListener('abort', cancel);
   if (worker) worker.terminate();
   if (url) URL.revokeObjectURL(url);
   if (error) reject(error); else resolve(result);
  }
  const cancel = () => finish(new Error('작업을 중단했습니다.'));
  try {
   url = URL.createObjectURL(new Blob(['(' + workerMain.toString() + ')()'], {type: 'text/javascript'}));
   worker = new Worker(url);
   signal.addEventListener('abort', cancel, {once: true});
   timer = setTimeout(() => finish(new Error('약 1.2초 제한을 초과하여 정규식을 중단했습니다. 패턴이나 입력을 단순하게 바꿔 보세요.')), 1200);
   worker.onmessage = ({data}) => finish(data.error ? new Error(data.error) : null, data);
   worker.onerror = () => finish(new Error('Worker 실행이 차단되었습니다. 브라우저의 보안 정책을 확인하세요.'));
   worker.postMessage({pattern, flags, text});
  } catch (error) { finish(new Error('안전한 별도 실행 환경을 만들 수 없어 중단했습니다: ' + error.message)); }
 });
}
function invalidateSqlReview() {
 copySequence++;
 const dialog = $('#modal');
 if (dialog.open && dialog.querySelector('#sql-review-confirm')) dialog.close();
}
function handleSqlAction(action) {
 const input = $('#sqlformat-input');
 const output = $('#sqlformat-output');
 if (!input || !output) return;
 const source = editorValue(input);
 const dialect = sqlDialect, db = DBS[dialect];
 let result;
 try {
  result = C.prepareSql(source, dialect);
 } catch (error) {
  setEditorValue(output, '');
  setStatus('sqlformat-status', db.label + ' 기준: ' + error.message, 'error');
  counters();
  return;
 }
 setEditorValue(output, result.sql);
 const danger = result.checks.some(check => check.level === 'danger');
 setStatus('sqlformat-status', (result.checks.length ? '주의 · ' + result.checks.map(check => check.message).join(' ') :
  '정렬했습니다. 원문과 결과를 대조하세요.') + ' 붙여넣을 곳: ' + db.prompt, danger ? 'error' : result.checks.length ? '' : 'success');
 counters();
 if (action === 'format') return;
 const saveFile = action === 'save';
 const deliver = () => saveFile ? download('pocket-query.sql', result.sql) : copy(result.sql);
 if (!result.review) {
  deliver();
  return;
 }
 const label = saveFile ? '저장' : '복사';
 // The review shows the exact text that will be delivered, the paste target and the DB's transaction steps.
 modal(result.verb + ' 최종 쿼리 확인 · ' + db.label,
  '<p class="note">붙여넣을 곳: <b>' + E(db.prompt) + '</b> · ' + E(db.client) + '</p>' +
  (result.checks.length ? '<ul class="sql-checks" id="sql-review-checks">' + result.checks.map(check =>
   '<li class="' + check.level + '">' + E(check.message) + '</li>').join('') + '</ul>' :
   '<p class="note warn">대상 테이블과 변경할 값·행의 범위를 확인하세요.</p>') +
  '<label class="field"><span>최종 SQL · 이 내용을 그대로 ' + label + '합니다</span><textarea id="sql-review-preview" readonly spellcheck="false"></textarea></label>' +
  (result.verb !== 'SELECT' ? '<p class="note compact" id="sql-review-flow"><b>' + E(db.label) + ' 순서</b> ' + E(db.flow) + '</p>' : '') +
  (danger ? '<div class="sql-review-ack">' + check('sql-review-ack', '위 위험을 확인했고 이 SQL을 그대로 ' + label + '합니다.') + '</div>' : '') +
  '<div class="actions"><button class="btn" id="sql-review-edit">수정으로 돌아가기</button>' +
  '<button class="btn primary" id="sql-review-confirm"' + (danger ? ' disabled' : '') + '>확인 후 ' + label + '</button></div>', dialog => {
   const preview = dialog.querySelector('#sql-review-preview');
   const confirmButton = dialog.querySelector('#sql-review-confirm');
   const ack = dialog.querySelector('#sql-review-ack');
   preview.value = result.sql;
   if (ack) ack.onchange = () => { confirmButton.disabled = !ack.checked; };
   dialog.querySelector('#sql-review-edit').onclick = () => { dialog.close(); input.focus(); };
   confirmButton.onclick = () => {
    if (!dialog.open || !confirmButton.isConnected || confirmButton.disabled) return;
    dialog.close();
    if (!input.isConnected || editorValue(input) !== source || sqlDialect !== dialect) return;
    deliver();
   };
  });
}
const SQL_STEPS = [['connect', '1 접속'], ['check', '2 대상 · 자동 커밋 확인'], ['begin', '3 트랜잭션 시작'], ['query', '4 쿼리 작성'], ['finish', '5 확정 · 취소 · 종료']];
function renderSqlDb(root) {
 const db = DBS[sqlDialect];
 root.querySelectorAll('[data-sql-db]').forEach(button => {
  const active = button.dataset.sqlDb === sqlDialect;
  button.classList.toggle('active', active);
  button.setAttribute('aria-pressed', String(active));
 });
 root.querySelector('#sql-db-where').textContent = '붙여넣을 곳: ' + db.prompt + ' · ' + db.client;
 root.querySelector('#sql-db-flow').textContent = db.flow;
 root.querySelector('#sql-steps').innerHTML = SQL_STEPS.map(([step, label]) => {
  let body;
  if (step === 'query') {
   body = PRESETS.map(id => '<button class="btn small" data-open-sql-preset="' + id + '">' + icon('edit') +
    E(cmd(id).editorSql.split(/\s/)[0]) + '</button>').join('') + '<span class="muted small">아래 SQL 원문에 예시를 넣습니다.</span>';
  } else {
   const items = D.commands.filter(c => c.db === sqlDialect && c.step === step);
   body = items.length ? items.map(c => '<button class="btn small" data-command="' + c.id + '">' +
    E(c.title.replace(/^(CSQL|MariaDB|Oracle|PostgreSQL)\s+/, '')) + '</button>').join('') :
    '<span class="muted small">' + E(db.label) + ': 변경 작업용 접속(수동 커밋)으로 시작했다면 별도 명령이 없습니다.</span>';
  }
  const place = step === 'connect' ? 'Linux 셸 · $' : step === 'query' ? db.prompt + ' · SQL' : db.prompt;
  return '<div class="sql-step" data-sql-step="' + step + '"><div class="sql-step-head"><strong>' + label + '</strong>' + whereTag(place) +
   '</div><div class="actions">' + body + '</div></div>';
 }).join('');
}
function sqlFormatPage() {
 return pageHead('sqlformat') +
  '<div class="panel"><div class="panel-head"><h2>DB 선택</h2><span class="where-tag" id="sql-db-where"></span></div>' +
  dbChips('sql', sqlDialect, false) + '<p class="note compact" id="sql-db-flow"></p></div>' +
  '<details class="panel sql-steps-panel" open><summary><h2>작업 순서</h2><span class="muted small">버튼 → 값 확인 · 복사 창</span></summary>' +
  '<div id="sql-steps" class="sql-steps"></div></details>' +
  '<div class="panel"><div class="actions spread"><button class="btn primary" id="sqlformat-run">쿼리 정렬 · 점검</button>' +
  '<button class="text-btn" id="sqlformat-sample">샘플 넣기</button></div><div id="sqlformat-status" class="status" role="status"></div></div>' +
  '<div class="editor-grid">' +
  editor('sqlformat-input','SQL 원문','SELECT, INSERT, UPDATE, DELETE 한 문장을 붙여넣으세요.',false,'tall') +
  editor('sqlformat-output','정렬된 SQL','복사·저장을 누르면 현재 원문을 정렬합니다. 변경 SQL은 최종 내용을 확인한 뒤 전달합니다.',true,'tall') +
  '</div><div class="note">바깥쪽 절과 쉼표 목록에 줄바꿈만 넣고 대소문자·인용문·주석은 그대로 둡니다. 입력 100,000자 · 결과 200,000자. ' +
  '선택한 DB 규칙으로 점검합니다: WHERE 없는 UPDATE·DELETE와 결과를 기록·잠그는 SELECT는 확인 후 전달, Oracle은 빈 줄·/ 줄 거부와 & 경고, ' +
  'PostgreSQL은 :변수 경고, MariaDB는 /*! */ 실행 주석과 공백 없는 -- 거부, // 주석은 CUBRID에서만 허용합니다. ' +
  '세션 명령, 여러 문장, 역슬래시 인용, DB 전용 특수 인용문은 지원 범위 밖입니다. 결과 저장 버튼은 UTF-8 pocket-query.sql을 받습니다.</div>';
}

// textarea.value normalizes CR and CRLF to LF. Keep exact results for copy, swap and download.
const exactEditorValues=new WeakMap();
function setEditorValue(element,text){
 element.value=text;
 if(element.tagName==='TEXTAREA'&&text.includes('\r')) exactEditorValues.set(element,text);
 else exactEditorValues.delete(element);
}
function editorValue(element){
 return exactEditorValues.get(element)??element.value;
}
function bindPage(id,root){
 const q=s=>root.querySelector(s),qa=s=>Array.from(root.querySelectorAll(s)),value=id=>editorValue(q('#'+id));
 const set=(id,v)=>setEditorValue(q('#'+id),v);
 root.addEventListener('input',e=>exactEditorValues.delete(e.target),true);
 const status=(id,msg,kind='')=>{const el=q('#'+id);el.className='status '+kind;el.textContent=msg;};
 const act=(button,statusID,fn,outputs=[])=>{q('#'+button).onclick=async()=>{outputs.forEach(x=>set(x,''));status(statusID,'');try{await fn();counters(root);}catch(e){outputs.forEach(x=>set(x,''));status(statusID,e.message,'error');}};};
 const invalidation={encoding:['repair-output','repair-status'],codec:['codec-output','codec-status'],json:['json-output','json-status'],text:['text-output','text-status'],logs:['logs-output','logs-status','logs-stats'],sql:['sql-output','sql-status'],sqlformat:['sqlformat-output','sqlformat-status'],unicode:['unicode-decoded','unicode-code-status'],time:['time-output','time-status'],cron:['cron-output','cron-status','cron-fields']}[id];
 if(invalidation){const clearResult=()=>{invalidation.forEach(name=>{const el=q('#'+name);if(el){if('value' in el)setEditorValue(el,'');else el.textContent='';}});};const sourceChanged=e=>{if(!e.target.matches('input,select,textarea')||e.target.readOnly||e.target.type==='file')return;if(id==='encoding'&&!e.target.id.startsWith('repair-'))return;if(id==='unicode'&&e.target.id!=='unicode-codes')return;clearResult();};root.addEventListener('input',sourceChanged);root.addEventListener('change',sourceChanged);root.addEventListener('click',e=>{if(e.target.closest('[id$="-sample"]'))clearResult();},true);}
 if(id==='commands'){
  ['command-query','command-group','command-permission','command-favorites'].forEach(x=>q('#'+x).addEventListener(x==='command-query'?'input':'change',renderCommands));q('#add-command').onclick=()=>customCommand();renderCommands();
 }
 if(id==='encoding'){
  let bytes=null,fullText=null,filename='converted',fileSeq=0;
  cleanupTasks.add(()=>{fileSeq++;bytes=null;fullText=null;});
  function renderFile(){if(!bytes)return;try{const encoding=value('file-charset');let strict=true;try{C.decode(bytes,encoding,true);}catch(_){strict=false;}fullText=C.decode(bytes,encoding,false);set('encoding-output',fullText.slice(0,200_000));status('encoding-file-status',(strict?'선택 문자셋으로 읽었습니다. 원문 대조가 필요합니다.':'잘못된 바이트가 있어 대체문자가 생성되었습니다. 문자셋을 바꿔 보세요.')+(fullText.length>200_000?' 미리보기는 앞 200,000자이며 복사·저장은 전체 결과입니다.':''),strict?'success':'error');}catch(e){fullText=null;set('encoding-output','');status('encoding-file-status',e.message,'error');}}
  async function loadFile(file){const seq=++fileSeq;bytes=null;fullText=null;set('encoding-output','');status('encoding-file-status','파일 읽는 중…');q('#encoding-info').textContent='파일 읽는 중…';q('#encoding-hex').textContent='';try{checkFile(file);const data=new Uint8Array(await file.arrayBuffer());if(seq!==fileSeq)return;bytes=data;filename=file.name.replace(/\.[^.]*$/,'');const info=C.fileInfo(bytes);if(info.bom==='UTF-16LE BOM')set('file-charset','utf-16le');else if(info.bom==='UTF-16BE BOM')set('file-charset','utf-16be');else set('file-charset','utf-8');q('#encoding-info').textContent=file.name+' · '+bytes.length.toLocaleString()+' bytes\nBOM: '+info.bom+' · UTF-8 바이트 유효성: '+(info.validUtf8?'통과 (확정 아님)':'실패');q('#encoding-hex').textContent='처음 64바이트: '+info.head;renderFile();}catch(e){if(seq!==fileSeq)return;q('#encoding-info').textContent='파일을 읽지 못했습니다.';status('encoding-file-status',e.message,'error');}}
  q('#encoding-file').onchange=e=>loadFile(e.target.files[0]);q('#file-charset').onchange=renderFile;const drop=q('#encoding-drop');drop.ondragover=e=>{e.preventDefault();drop.classList.add('drag');};drop.ondragleave=()=>drop.classList.remove('drag');drop.ondrop=e=>{e.preventDefault();drop.classList.remove('drag');loadFile(e.dataTransfer.files[0]);};
  q('#encoding-copy').onclick=()=>fullText!==null?copy(fullText):toast('복사할 결과가 없습니다. 원본 파일과 문자셋을 확인하세요.');q('#encoding-save').onclick=()=>{if(fullText===null){toast('저장할 결과가 없습니다. 원본 파일과 문자셋을 확인하세요.');return;}if(fullText.includes('\ufffd')&&!confirm('결과에 대체문자 �가 있습니다. 원본 손실 가능성을 확인했고 이 결과를 저장할까요?'))return;download(filename+'.utf8.txt',(q('#encoding-bom').checked?'\ufeff':'')+fullText);};
  q('#repair-sample').onclick=()=>{set('repair-input',String.fromCharCode(...C.utf8('한글 복구 테스트: 안녕하세요!')));set('repair-source','latin1');set('repair-target','utf-8');counters(root);};
  act('repair-run','repair-status',()=>{const text=C.repair(value('repair-input'),value('repair-source'),value('repair-target'));set('repair-output',text);status('repair-status','변환 가능한 후보입니다. 실제 원문과 같은지는 별도로 확인하세요.','success');},['repair-output']);
 }
 if(id==='codec'){
  ['encode','decode'].forEach(direction=>act('codec-'+direction,'codec-status',()=>{set('codec-output',C.codec(value('codec-input'),value('codec-mode'),direction,q('#codec-plus').checked));status('codec-status',value('codec-mode')+' '+(direction==='encode'?'인코딩':'디코딩')+' 완료','success');},['codec-output']));
  q('#codec-sample').onclick=()=>{set('codec-input','안녕하세요, Pocket Ops! 😀 & <hello>');counters(root);};q('#codec-swap').onclick=()=>{set('codec-input',value('codec-output'));set('codec-output','');status('codec-status','');counters(root);};
 }
 if(id==='json'){
  q('#json-sample').onclick=()=>{set('json-input','{"project":"Pocket Ops","online":false,"tools":14,"bigId":900719925474099312345,"amount":1.2300,"labels":["한글","offline"],"nested":{"ready":true}}');counters(root);};
  ['pretty','minify','validate'].forEach(mode=>act('json-'+mode,'json-status',()=>{const result=C.formatJson(value('json-input'),mode!=='pretty',Number(value('json-indent')));if(mode!=='validate')set('json-output',result);status('json-status',mode==='validate'?'JSON 문법 검증 통과 · 중복 키/업무 스키마는 검증하지 않습니다.':'정리 완료 · 숫자 표기와 원문 토큰을 보존했습니다.','success');},['json-output']));
 }
 if(id==='text'){
  q('#text-sample').onclick=()=>{set('text-input','  apple\napple\nbanana\n\nitem10\nitem2\n한글  \nbanana');counters(root);};
  act('text-run','text-status',()=>{const input=value('text-input');const exact=C.cleanText(input,{trim:q('#text-trim').checked,empty:q('#text-empty').checked,unique:q('#text-unique').checked,sort:value('text-sort'),eol:value('text-eol')});set('text-output',exact);status('text-status',C.lines(input).length+'줄 → '+C.lines(exact).length+'줄 · '+(value('text-eol')==='crlf'?'CRLF':'LF')+' 내보내기','success');},['text-output']);
  q('#text-swap').onclick=()=>{set('text-input',value('text-output'));set('text-output','');counters(root);};
 }
 if(id==='diff'){
  let result=[];function render(){const shown=q('#diff-changes').checked?result.filter(x=>x.type!=='same'):result;q('#diff-result').innerHTML=shown.length?shown.map(r=>'<div class="diff-line '+r.type+'"><span class="ln">'+(r.a||'')+'</span><span class="ln">'+(r.b||'')+'</span><span class="mark">'+(r.type==='add'?'+':r.type==='del'?'−':'')+'</span><span class="txt">'+E(r.text||' ')+'</span></div>').join(''):'<div class="empty">표시할 변경점이 없습니다.</div>';}
  act('diff-run','diff-status',()=>{result=[];q('#diff-result').textContent='';q('#diff-stats').textContent='';result=C.diffLines(value('diff-before'),value('diff-after'),q('#diff-space').checked);const adds=result.filter(x=>x.type==='add').length,dels=result.filter(x=>x.type==='del').length;q('#diff-stats').innerHTML='<span class="stat"><b>'+adds+'</b>추가</span><span class="stat"><b>'+dels+'</b>삭제</span><span class="stat"><b>'+(result.length-adds-dels)+'</b>동일</span>';render();status('diff-status',adds||dels?'변경점을 찾았습니다.':'차이가 없습니다.','success');});
  q('#diff-space').onchange=()=>{result=[];q('#diff-result').innerHTML='<div class="empty">공백 비교 옵션이 바뀌었습니다. 다시 비교해 주세요.</div>';q('#diff-stats').textContent='';};q('#diff-changes').onchange=render;q('#diff-sample').onclick=()=>{set('diff-before','# Application\nserver.port=8080\nlogging.level=INFO\npool.max=100\nencoding=UTF-8\n');set('diff-after','# Application\nserver.port=8111\nlogging.level=WARN\npool.max=30\nencoding=UTF-8\nhealth.enabled=true\n');result=[];q('#diff-result').innerHTML='<div class="empty">새 샘플을 비교해 주세요.</div>';counters(root);};
  q('#diff-save').onclick=()=>{if(!result.length){toast('먼저 변경점을 비교하세요.');return;}download('pocket-diff-report.txt','Pocket Ops · 줄 단위 비교 보고서 (git patch 아님)\n'+result.map(r=>(r.type==='add'?'+':r.type==='del'?'-':' ')+' '+String(r.a||'').padStart(4)+' '+String(r.b||'').padStart(4)+' | '+r.text).join('\n'));};
  ['diff-before','diff-after'].forEach(x=>q('#'+x).addEventListener('input',()=>{result=[];q('#diff-result').innerHTML='<div class="empty">입력이 바뀌었습니다. 다시 비교해 주세요.</div>';q('#diff-stats').textContent='';}));
 }
 if(id==='logs'){
  let fileSeq=0;cleanupTasks.add(()=>{fileSeq++;});q('#logs-input').addEventListener('input',()=>{fileSeq++;});
  q('#logs-sample').onclick=()=>{fileSeq++;set('logs-input','2026-10-03 09:00:00 INFO  application started\n2026-10-03 09:00:01 INFO  healthcheck OK\n2026-10-03 09:00:02 WARN  connection pool nearly full\n2026-10-03 09:00:03 ERROR request failed\njava.sql.SQLException: connection timeout\n  at app.service.DataService.find(DataService.java:82)\nCaused by: java.net.SocketTimeoutException\n2026-10-03 09:00:05 INFO  request completed\n2026-10-03 09:00:06 ERROR retry failed');counters(root);};
  act('logs-run','logs-status',()=>{const r=C.filterLogs(value('logs-input'),value('logs-include'),value('logs-exclude'),Number(value('logs-context')),q('#logs-case').checked);set('logs-output',r.text);q('#logs-stats').innerHTML=[['전체',r.total],['직접 일치',r.matched],['문맥 포함',r.shown],['원본 ERROR',r.errors],['원본 WARN',r.warnings]].map(([n,v])=>'<span class="stat"><b>'+v+'</b>'+n+'</span>').join('');status('logs-status',r.matched+'줄 일치 · '+r.shown+'줄 출력','success');},['logs-output']);
  q('#logs-file').onchange=async e=>{const seq=++fileSeq;set('logs-input','');set('logs-output','');q('#logs-stats').textContent='';status('logs-status','파일 읽는 중…');try{const f=e.target.files[0];checkFile(f,2*1024*1024);const bytes=new Uint8Array(await f.arrayBuffer());if(seq!==fileSeq)return;set('logs-input',C.decode(bytes,'utf-8',true));status('logs-status',f.name+' · UTF-8로 읽었습니다.');counters(root);}catch(e){if(seq!==fileSeq)return;status('logs-status','파일 읽기 실패: '+e.message+' EUC-KR 파일: 왼쪽 메뉴 → 인코딩 진료소 → 원본 파일 다시 읽기.','error');}};
 }
 if(id==='sql'){
  q('#sql-column').maxLength=512;
  q('#sql-sample').onclick=()=>{set('sql-input',"A001\nA002\nO'Brien\n00123\nA001\n한글 코드");counters(root);};
  act('sql-run','sql-status',()=>{const r=C.makeSql(value('sql-input'),value('sql-column').trim(),value('sql-kind'),Number(value('sql-chunk')),q('#sql-unique').checked,q('#sql-trim').checked);set('sql-output',r.sql);status('sql-status',r.count.toLocaleString()+'개 값 · '+r.groups+'개 IN 묶음 · 실행하지 않음','success');},['sql-output']);
 }
 if (id === 'sqlformat') {
  q('#sqlformat-sample').onclick = () => {
   set('sqlformat-input', "SELECT item_id, item_name FROM sample_items WHERE item_name = '검색, 예시' ORDER BY item_id;");
   q('#sqlformat-input').dispatchEvent(new Event('input', {bubbles: true}));
   counters(root);
  };
  q('#sqlformat-input').addEventListener('input', invalidateSqlReview);
  q('#sqlformat-run').onclick = () => handleSqlAction('format');
  renderSqlDb(root);
 }
 if(id==='unicode'){
  q('#unicode-input').addEventListener('input',()=>{q('#unicode-table').textContent='';q('#unicode-stats').textContent='';status('unicode-status','');});
  const controls=['NUL','SOH','STX','ETX','EOT','ENQ','ACK','BEL','BS','TAB','LF','VT','FF','CR','SO','SI','DLE','DC1','DC2','DC3','DC4','NAK','SYN','ETB','CAN','EM','SUB','ESC','FS','GS','RS','US'];
  const names={32:'SPACE',127:'DEL',160:'NBSP',0x200b:'ZERO WIDTH SPACE',0x200c:'ZERO WIDTH NON-JOINER',0x200d:'ZERO WIDTH JOINER',0x200e:'LEFT-TO-RIGHT MARK',0x200f:'RIGHT-TO-LEFT MARK',0x2028:'LINE SEPARATOR',0x2029:'PARAGRAPH SEPARATOR',0x202a:'BIDI EMBEDDING',0x202b:'BIDI EMBEDDING',0x202c:'BIDI POP',0x202d:'BIDI OVERRIDE',0x202e:'BIDI OVERRIDE',0xfeff:'BOM / ZWNBSP'};
  function analyze(s){q('#unicode-table').textContent='';q('#unicode-stats').textContent='';const rows=C.characterRows(s),stats=C.textStats(s);q('#unicode-table').innerHTML='<table><thead><tr><th>#</th><th>문자 / 제어문자 이름</th><th>코드 포인트</th><th>10진수</th><th>ASCII</th><th>UTF-8 HEX</th></tr></thead><tbody>'+rows.map((r,i)=>'<tr><td class="muted">'+(i+1)+'</td><td><code>'+E(controls[r.cp]||names[r.cp]||r.ch)+'</code></td><td class="mono">'+r.unicode+'</td><td class="mono">'+r.cp+'</td><td class="mono">'+(r.ascii===null?'—':r.ascii)+'</td><td class="mono">'+r.hex+'</td></tr>').join('')+'</tbody></table>';q('#unicode-stats').innerHTML=[['코드 포인트',stats.chars],['UTF-16 코드 유닛',stats.units],['UTF-8 바이트',stats.bytes]].map(([n,v])=>'<span class="stat"><b>'+v+'</b>'+n+'</span>').join('');status('unicode-status',rows.length+'개 코드 포인트를 표시했습니다.','success');}
  act('unicode-run','unicode-status',()=>analyze(value('unicode-input')));q('#unicode-ascii').onclick=()=>analyze(Array.from({length:128},(_,i)=>String.fromCharCode(i)).join(''));q('#unicode-sample').onclick=()=>{set('unicode-input','A 한글 😀\t\u200b\u00a0\n');analyze(value('unicode-input'));};
  act('unicode-decode','unicode-code-status',()=>{const raw=value('unicode-codes').trim();if(!raw)throw new Error('숫자 코드를 입력하세요.');const tokens=raw.split(/[\s,]+/);if(tokens.length>2000)throw new Error('최대 2,000개 코드를 입력하세요.');const text=tokens.map(token=>{let n;if(/^U\+[\da-f]+$/i.test(token))n=parseInt(token.slice(2),16);else if(/^0x[\da-f]+$/i.test(token))n=parseInt(token.slice(2),16);else if(/^\d+$/.test(token))n=Number(token);else throw new Error('해석할 수 없는 코드: '+token);if(n>0x10ffff||n>=0xd800&&n<=0xdfff)throw new Error('유효한 유니코드 스칼라 값이 아닙니다: '+token);return String.fromCodePoint(n);}).join('');set('unicode-decoded',text);status('unicode-code-status','문자로 변환했습니다. 제어문자는 보이지 않을 수 있습니다.','success');},['unicode-decoded']);
 }
 if(id==='time'){
  q('#time-date').step='1';set('time-date',C.formatTime(Date.now(),540).slice(0,19).replace(' ','T'));
  function result(ms){set('time-output','UTC        '+C.formatTime(ms,0)+' UTC+00:00\nKST        '+C.formatTime(ms,540)+' UTC+09:00\nUnix 초    '+String(ms/1000)+'\nUnix ms    '+String(ms)+'\nISO 8601   '+new Date(ms).toISOString());status('time-status','같은 시각을 UTC / KST로 변환했습니다.','success');}
  act('time-from-epoch','time-status',()=>result(C.timestamp(value('time-epoch'),value('time-unit'))),['time-output']);act('time-from-date','time-status',()=>result(C.dateInputToMs(value('time-date'),Number(value('time-zone')))),['time-output']);q('#time-now').onclick=()=>{const ms=Date.now();set('time-epoch',value('time-unit')==='ms'?String(ms):String(Math.floor(ms/1000)));result(C.timestamp(value('time-epoch'),value('time-unit')));};
 }
 if(id==='chmod'){
  q('#chmod-octal').maxLength=3;const boxes=qa('[data-perm]');
  function render(octal){try{const symbolic=C.permission(octal);q('#chmod-number').textContent=octal;q('#chmod-symbol').textContent=symbolic;const p=value('chmod-path');if(!p.trim())throw new Error('대상 경로를 입력하세요.');set('chmod-output','chmod '+octal+' -- '+C.shellQuote(p));status('chmod-status',octal==='777'?'모든 사용자에게 쓰기 권한을 줍니다. 777 사용은 신중하게 검토하세요.':'일반 권한만 계산합니다. 복사 전 대상 파일/디렉터리를 확인하세요.',octal==='777'?'error':'');}catch(e){set('chmod-output','');status('chmod-status',e.message,'error');}}
  function setOctal(v){try{C.permission(v);boxes.forEach(b=>b.checked=Boolean(Number(v[Number(b.dataset.perm)])&Number(b.value)));set('chmod-octal',v);render(v);}catch(e){set('chmod-output','');status('chmod-status',e.message,'error');}}
  boxes.forEach(b=>b.onchange=()=>{const v=[0,1,2].map(i=>boxes.filter(x=>Number(x.dataset.perm)===i&&x.checked).reduce((a,b)=>a+Number(b.value),0)).join('');set('chmod-octal',v);render(v);});q('#chmod-octal').oninput=()=>setOctal(value('chmod-octal'));q('#chmod-path').oninput=()=>render(value('chmod-octal'));qa('[data-octal]').forEach(b=>b.onclick=()=>setOctal(b.dataset.octal));q('#chmod-copy').onclick=()=>{const s=value('chmod-output');if(s&&confirm('실제 실행 시 파일/디렉터리 권한이 바뀝니다. 대상과 권한을 확인했나요?'))copy(s);};render('640');
 }
 if(id==='cron'){
  q('#cron-start').step='1';set('cron-start',C.formatTime(Date.now(),540).slice(0,19).replace(' ','T'));
  act('cron-run','cron-status',()=>{q('#cron-fields').textContent='';q('#cron-output').textContent='';const offset=Number(value('cron-zone')),start=C.dateInputToMs(value('cron-start'),offset),r=C.nextCron(value('cron-expression'),start,offset);q('#cron-fields').innerHTML=r.fields.map((f,i)=>'<div class="cron-slot" title="'+E(f.values.join(', '))+'"><strong>'+E(f.raw)+'</strong><span>'+['분 0~59','시 0~23','일 1~31','월 1~12','요일 0~7'][i]+'</span></div>').join('');q('#cron-output').textContent=r.times.length?r.times.map((ms,i)=>(i+1)+'.  '+C.formatTime(ms,offset).slice(0,19)+'  '+(offset===540?'KST':'UTC')+'  ('+['일','월','화','수','목','금','토'][new Date(ms+offset*60000).getUTCDay()]+')').join('\n'):'4년 범위에서 실행 시각을 찾지 못했습니다. 날짜·요일 조건을 다시 확인하세요.';status('cron-status',r.times.length+'회 계산 · 서버 예약을 변경하지 않습니다.',r.times.length?'success':'error');});
  qa('[data-cron]').forEach(b=>b.onclick=()=>{set('cron-expression',b.dataset.cron);q('#cron-run').click();});q('#cron-zone').onchange=()=>{set('cron-start',C.formatTime(Date.now(),Number(value('cron-zone'))).slice(0,19).replace(' ','T'));status('cron-status','시간대가 바뀌었습니다. 현재 시각을 기준으로 다시 계산하세요.');};
 }
 if(id==='hash'){
  let sequence=0,lastAlgorithm='';const comparison=()=>{const expected=value('hash-expected').trim().toLowerCase(),actual=value('hash-output');if(!expected||!actual){status('hash-compare','');return;}if(!/^[0-9a-f]+$/.test(expected)||expected.length!==actual.length){status('hash-compare','비교 해시의 형식·길이가 '+lastAlgorithm+' 결과와 다릅니다.','error');return;}status('hash-compare',expected===actual?'일치합니다. 같은 해시 값입니다.':'불일치합니다. 파일·공백·줄바꿈·인코딩을 확인하세요.',expected===actual?'success':'error');};
  cleanupTasks.add(()=>{sequence++;});
  async function calculate(isFile){const seq=++sequence;set('hash-output','');status('hash-compare','');status('hash-status','로컬에서 계산 중…');try{const algorithm=value('hash-algorithm');let bytes,label;if(isFile){const f=q('#hash-file').files[0];checkFile(f,32*1024*1024);bytes=new Uint8Array(await f.arrayBuffer());if(seq!==sequence)return;label=f.name;}else{bytes=C.utf8(C.limit(value('hash-input')));label='UTF-8 텍스트';}const hash=await C.digest(bytes,algorithm);if(seq!==sequence)return;lastAlgorithm=algorithm;set('hash-output',hash);status('hash-status',algorithm+' · '+label+' · '+bytes.length.toLocaleString()+' bytes','success');comparison();}catch(e){if(seq!==sequence)return;set('hash-output','');status('hash-status',e.message,'error');}}

  act('hash-text','hash-status',()=>calculate(false));act('hash-file-run','hash-status',()=>calculate(true));q('#hash-expected').oninput=comparison;q('#hash-input').oninput=()=>{sequence++;set('hash-output','');status('hash-compare','');status('hash-status','입력이 바뀌었습니다. 다시 계산하세요.');};q('#hash-file').onchange=()=>{sequence++;set('hash-output','');status('hash-compare','');status('hash-status','선택한 파일을 다시 계산하세요.');const f=q('#hash-file').files[0];q('#hash-file-info').textContent=f?f.name+' · '+f.size.toLocaleString()+' bytes':'파일을 선택하세요.';};q('#hash-algorithm').onchange=()=>{sequence++;set('hash-output','');status('hash-status','알고리즘이 바뀌었습니다. 다시 계산하세요.');status('hash-compare','');};
 }
 if(id==='regex'){
  let seq=0, controller;const invalidate=()=>{seq++;controller?.abort();set('regex-output','');status('regex-status','입력이 바뀌었습니다. 다시 테스트하세요.');};cleanupTasks.add(invalidate);
  ['regex-input','regex-pattern','regex-flags'].forEach(name=>q('#'+name).addEventListener('input',invalidate));
  q('#regex-run').onclick=async()=>{const thisSeq=++seq;controller?.abort();controller=new AbortController();set('regex-output','');status('regex-status','분리된 Worker에서 테스트 중…');try{const r=await regexJob(value('regex-pattern'),value('regex-flags'),value('regex-input'),controller.signal);if(thisSeq!==seq)return;set('regex-output',r.output);status('regex-status',r.count+'개 매치'+(r.reason?(r.reason==='output'?' · 캡처 포함 결과 500,000자 상한에서 중단 (나머지는 미검사)':' · 1,000개 상한에서 중단 (나머지는 미검사)'):'')+' · 인덱스는 UTF-16 코드 유닛 기준','success');counters(root);}catch(e){if(thisSeq!==seq)return;set('regex-output','');status('regex-status',e.message,'error');}};
  q('#regex-sample').onclick=()=>{invalidate();set('regex-input','ERROR connection timeout\nINFO ready\nWARN pool almost full');set('regex-pattern','(ERROR|WARN)\\s+(.+)');set('regex-flags','gm');counters(root);};
 }
 if(id==='settings'){
  let importSeq=0;
  q('#settings-export').onclick=()=>download('pocket-ops-settings.json',JSON.stringify({...state,app:'Pocket Ops',exportedAt:new Date().toISOString()},null,2),'application/json;charset=utf-8');
  q('#settings-import').onchange=async e=>{const seq=++importSeq;try{const f=e.target.files[0];checkFile(f,16*1024*1024);const incoming=validateState(JSON.parse(C.decode(new Uint8Array(await f.arrayBuffer()))));if(seq!==importSeq||!root.isConnected)return;modal('설정을 가져올까요?','<div class="note warn">현재 즐겨찾기·내 명령어·테마를 가져온 설정으로 <b>교체</b>합니다. 로그·변환 입력은 가져오지 않습니다. 가져온 명령어의 안전성은 검증되지 않습니다.</div><p class="muted">도구 '+incoming.toolFavs.length+'개 · 명령어 즐겨찾기 '+incoming.cmdFavs.length+'개 · 내 명령어 '+incoming.customCommands.length+'개</p><button class="btn primary" id="confirm-import">교체하여 가져오기</button>',()=>{$('#confirm-import').onclick=()=>{state=incoming;save();applyTheme();$('#modal').close();views.delete('commands');views.delete('settings');go('settings');toast('설정을 가져왔어요.');};});}catch(e){if(seq===importSeq&&root.isConnected)status('settings-status',e.message,'error');}};
  q('#settings-add-command').onclick=()=>customCommand();q('#clear-inputs').onclick=clearInputs;
  q('#settings-reset').onclick=()=>{if(!confirm('이 앱의 즐겨찾기·내 명령어·테마를 초기화할까요? 다른 사이트 저장소는 건드리지 않습니다.'))return;state={...BASE,toolFavs:[...BASE.toolFavs],cmdFavs:[...BASE.cmdFavs],customCommands:[]};save();applyTheme();views.delete('commands');views.delete('settings');go('settings');toast('앱 설정을 초기화했어요.');};
 }
}
const renderers={home,favorites,commands:commandsPage,encoding:encodingPage,codec:codecPage,json:jsonPage,text:textPage,diff:diffPage,logs:logsPage,sql:sqlPage,sqlformat:sqlFormatPage,unicode:unicodePage,time:timePage,chmod:chmodPage,cron:cronPage,hash:hashPage,regex:regexPage,settings:settingsPage};
function applyTheme(){document.documentElement.dataset.theme=state.theme;const b=$('#theme-toggle');b.innerHTML=icon(state.theme==='dark'?'sun':'moon');b.title=state.theme==='dark'?'밝은 테마로':'어두운 테마로';b.setAttribute('aria-label',b.title);}
function syncStars(){
 $$('[data-tool-star]').forEach(b=>{const active=state.toolFavs.includes(b.dataset.toolStar);b.classList.toggle('starred',active);b.setAttribute('aria-pressed',String(active));});
 $$('[data-cmd-star]').forEach(b=>{const active=state.cmdFavs.includes(b.dataset.cmdStar);b.classList.toggle('starred',active);b.setAttribute('aria-pressed',String(active));});
}
function go(id,updateHash=true){
 if(!Object.prototype.hasOwnProperty.call(renderers,id))id='home';
 if(current==='sqlformat' && id!=='sqlformat')invalidateSqlReview();
 current=id;
 if(['home','favorites','settings'].includes(id))views.delete(id);
 let root=views.get(id),fresh=!root;if(!root){root=document.createElement('section');root.dataset.page=id;root.innerHTML=renderers[id]()+footer();views.set(id,root);}
 $('#view').replaceChildren(root);if(fresh)bindPage(id,root);else if(id==='commands')renderCommands();
 $('#page-crumb').textContent=pageName(id);
 document.title=(id==='home'?'작지만 든든한 내 작업실':$('#page-crumb').textContent)+' · Pocket Ops';
 $$('.nav-btn').forEach(b=>{const active=b.dataset.go===id;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 setMenu(false);syncStars();counters(root);window.scrollTo(0,0);
 /*@platform navigate*/if(updateHash&&location.hash!=='#'+id){try{history.replaceState(null,'','#'+id);}catch(_){location.hash=id;}}/*@end*/
}
function clearInputs(){if(!confirm('열린 모든 도구의 입력·선택한 파일·결과를 비울까요? 즐겨찾기와 저장한 명령어는 유지됩니다.'))return;
 copySequence++;
 if($('#palette').open)$('#palette').close();
 $('#palette-input').value='';
 $('#palette-input').removeAttribute('aria-activedescendant');
 $('#palette-results').replaceChildren();
 paletteItems=[];paletteIndex=0;
 cleanupTasks.forEach(fn=>fn());cleanupTasks.clear();if($('#modal').open)$('#modal').close();$('#modal').innerHTML='';views.clear();go(current);toast('열린 도구의 입력을 비웠어요. 클립보드와 저장 파일은 그대로입니다.');}
function openPalette(){setMenu(false);if($('#modal').open)$('#modal').close();const p=$('#palette');if(!p.open)p.showModal();$('#palette-input').value='';paletteIndex=0;renderPalette();$('#palette-input').focus();}
function renderPalette(){const text=$('#palette-input').value.trim(),ts=D.tools.filter(t=>matches([t.title,t.desc,t.keywords].join(' '),text)).map(t=>({type:'tool',id:t.id,title:t.title,detail:t.desc,icon:t.icon})),cs=allCommands().filter(c=>matches([c.title,c.command,c.tags,c.group,c.where||''].join(' '),text)).map(c=>({type:'command',id:c.id,title:c.title,detail:'입력: '+whereLabel(c)+' · '+c.command,icon:'terminal'}));paletteItems=text?ts.concat(cs).slice(0,24):ts.filter(t=>state.toolFavs.includes(t.id)).concat(cs.filter(c=>state.cmdFavs.includes(c.id))).slice(0,12);paletteIndex=0;$('#palette-results').innerHTML=paletteItems.length?paletteItems.map((r,i)=>'<button class="palette-item '+(!i?'selected':'')+'" id="palette-item-'+i+'" role="option" aria-selected="'+(!i)+'" data-palette-index="'+i+'" tabindex="-1">'+icon(r.icon)+'<span><strong>'+E(r.title)+'</strong><small>'+E(r.detail)+'</small></span><span class="tag right">'+(r.type==='tool'?'도구':'명령어')+'</span></button>').join(''):'<div class="empty">다른 단어로 찾아보세요.</div>';$('#palette-input').setAttribute('aria-activedescendant',paletteItems.length?'palette-item-0':'');}
function selectPalette(index){const item=paletteItems[index];if(!item)return;$('#palette').close();if(item.type==='tool')go(item.id);else openCommand(item.id);}
function outputText(id){const el=document.getElementById(id);return el.value!==undefined?editorValue(el):el.textContent;}
document.addEventListener('click',e=>{
 const b=e.target.closest('button,[data-go],a');if(!b)return;
 if(b.hasAttribute('data-tool-star')){e.stopPropagation();const id=b.dataset.toolStar;state.toolFavs=state.toolFavs.includes(id)?state.toolFavs.filter(x=>x!==id):state.toolFavs.concat(id);save();syncStars();if(current==='favorites')go('favorites');if(current==='home'){$('#home-cards').innerHTML=homeCards();$('#home-fav-tools').innerHTML=dashFavTools();}$('[data-tool-star="'+id+'"]')?.focus();return;}
 if(b.hasAttribute('data-cmd-star')){const id=b.dataset.cmdStar;state.cmdFavs=state.cmdFavs.includes(id)?state.cmdFavs.filter(x=>x!==id):state.cmdFavs.concat(id);save();syncStars();if(current==='favorites')go('favorites');if(current==='commands')renderCommands();$('[data-cmd-star="'+id+'"]')?.focus();return;}
 if (b.hasAttribute('data-open-sql-preset')) {
  // A preset opened from a DB-filtered command list keeps that DB in the workbench.
  openSqlPreset(b.dataset.openSqlPreset, current === 'commands' ? commandDb : '');
  return;
 }
 if(b.hasAttribute('data-sql-db')){setSqlDialect(b.dataset.sqlDb);return;}
 if(b.hasAttribute('data-open-sql-db')){setSqlDialect(b.dataset.openSqlDb);go('sqlformat');return;}
 if(b.hasAttribute('data-command-db')){setCommandDb(b.dataset.commandDb);return;}
 if ((b.dataset.copyId || b.dataset.downloadId) === 'sqlformat-output') {
  handleSqlAction(b.hasAttribute('data-download-id') ? 'save' : 'copy');
  return;
 }
 if(b.hasAttribute('data-copy-id')){copy(outputText(b.dataset.copyId));return;}
 if (b.hasAttribute('data-download-id')) {
  const id = b.dataset.downloadId;
  download('pocket-' + id + '.txt', outputText(id));
  return;
 }
 if(b.hasAttribute('data-clear-id')){const el=document.getElementById(b.dataset.clearId);el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));el.focus();counters();return;}
 if(b.hasAttribute('data-command')){
  // An alternative inherits the values typed in the open command and can return to it.
  const from=b.hasAttribute('data-alt')&&b.closest('#modal')&&activeCommand;
  openCommand(b.dataset.command,from?{values:from.values(),back:{id:from.id,values:from.values(),back:from.back}}:{});return;}
 if(b.hasAttribute('data-edit-command')){customCommand(b.dataset.editCommand);return;}
 if(b.hasAttribute('data-command-search')){const search=b.dataset.commandSearch;go('commands');$('#command-query').value=search;$('#command-group').value='';$('#command-permission').value='';$('#command-favorites').checked=false;renderCommands();return;}
 if(b.hasAttribute('data-open-palette')){openPalette();return;}
 if(b.hasAttribute('data-palette-index')){selectPalette(Number(b.dataset.paletteIndex));return;}
 if(b.hasAttribute('data-command-domain')){setCommandDomain(b.dataset.commandDomain);return;}
 if(b.hasAttribute('data-open-domain')){go('commands');$('#command-query').value='';$('#command-permission').value='';$('#command-favorites').checked=false;setCommandDomain(b.dataset.openDomain);return;}
 if(b.hasAttribute('data-guide')){openGuide(b.dataset.guide);return;}
 if(b.hasAttribute('data-go')){go(b.dataset.go);return;}
});
let counterTimer;document.addEventListener('input',e=>{if(e.target.matches('textarea')){clearTimeout(counterTimer);counterTimer=setTimeout(()=>counters(),120);}});
document.addEventListener('keydown',e=>{
 const editable=e.target.matches('input,textarea,select,[contenteditable=true]');
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette();return;}
 if(e.key==='/'&&!editable&&!$('dialog[open]')){e.preventDefault();openPalette();return;}
 if(e.key==='?'&&!editable&&!$('dialog[open]')){e.preventDefault();openGuide(current);return;}
 if(e.key==='Escape')setMenu(false);
 if(e.key==='Tab'&&$('#sidebar').classList.contains('open')){const buttons=Array.from($('#sidebar').querySelectorAll('button:not(:disabled)')),first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&e.target===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&e.target===last){e.preventDefault();first.focus();}}
 if($('#palette').open){if(e.target!==$('#palette-input'))return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!paletteItems.length)return;paletteIndex=(paletteIndex+(e.key==='ArrowDown'?1:-1)+paletteItems.length)%paletteItems.length;$$('.palette-item').forEach((el,i)=>{el.classList.toggle('selected',i===paletteIndex);el.setAttribute('aria-selected',String(i===paletteIndex));});$('#palette-input').setAttribute('aria-activedescendant','palette-item-'+paletteIndex);$('#palette-item-'+paletteIndex).scrollIntoView({block:'nearest'});}if(e.key==='Enter'){e.preventDefault();selectPalette(paletteIndex);}return;}
 if(!editable&&e.target.classList.contains('tool-card')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.target.click();}
});
/*@platform listen*/window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(id!==current)go(id,false);});/*@end*/
$('#palette-input').addEventListener('input',renderPalette);
$('#palette-close').onclick=()=>$('#palette').close();
$('#theme-toggle').onclick=()=>{state.theme=state.theme==='light'?'dark':'light';save();applyTheme();};
$('#mobile-menu').onclick=()=>setMenu(true);
$('#mobile-close').onclick=()=>setMenu(false);
$('#menu-scrim').onclick=()=>setMenu(false);
mobileLayout.addEventListener('change',()=>setMenu(false));
$('#clear-all-button').onclick=clearInputs;
/*@platform download*/$('#release-download').onclick=async()=>{const b=$('#release-download');b.disabled=true;try{if(!window.PocketRelease)throw new Error('배포 파일이 포함되지 않은 빌드입니다.');await window.PocketRelease.download();toast('현재 열린 버전 '+(window.PocketBuild?.version||D.version)+'의 배포 ZIP을 저장합니다.');}catch(e){toast('배포 파일 저장 실패: '+e.message);}finally{b.disabled=false;}};/*@end*/
// The read-only reference stays visible until the interactive app has started, so a blocked or
// unsupported script never leaves an empty page.
try{nav();$('#brand-icon').innerHTML=icon('pocket');$('#mobile-menu').innerHTML=icon('menu');$('#top-search-icon').innerHTML=icon('search');$('#clear-all-button').innerHTML=icon('trash');$('#settings-icon').innerHTML=icon('settings');$('#palette-icon').innerHTML=icon('search');applyTheme();refreshStorage();/*@platform start*/go(location.hash.slice(1)||'home',false);/*@end*/document.documentElement.classList.add('app-ready');}catch(e){$('#view').innerHTML='<div class="note error">시작하지 못했습니다: '+E(e.message)+'<br>허용된 최신 Chromium 기반 브라우저에서 다시 열어 주세요.</div>';console.error(e);}
})();
