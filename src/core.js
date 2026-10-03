/* Pocket Ops — pure, dependency-free transformations. All text stays local. */
(function(global){
'use strict';
const fail = message => { throw new Error(message); };
const limit = (text, max=2_000_000) => { if(typeof text!=='string') fail('문자열 입력이 필요합니다.'); if(text.length>max) fail(`입력은 ${max.toLocaleString()}자 이하로 나누어 주세요.`); return text; };
const utf8 = text => {if(/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/.test(text))fail('짝이 없는 UTF-16 서로게이트는 UTF-8로 손실 없이 변환할 수 없습니다. 유니코드 이스케이프 원문을 확인하세요.');return new TextEncoder().encode(text);};
const decode = (bytes,encoding='utf-8',strict=true,preserveBom=false) => new TextDecoder(encoding,{fatal:strict,ignoreBOM:preserveBom}).decode(bytes);
const hex = bytes => Array.from(bytes,b=>b.toString(16).padStart(2,'0').toUpperCase()).join(' ');
const lines = s => s===''?[]:s.replace(/\r\n?/g,'\n').split('\n');
function fromHex(input){
 const s=limit(input).replace(/\b0x/gi,'').replace(/[\s:\-]/g,'');
 if(s.length%2 || /[^0-9a-f]/i.test(s)) fail('HEX는 두 자리 바이트로 입력하세요. 예: ED 95 9C 또는 ED959C');
 return Uint8Array.from(s.match(/.{2}/g)||[],v=>parseInt(v,16));
}
function toBase64(text){ const bytes=utf8(limit(text)); let binary=''; for(let i=0;i<bytes.length;i+=8192) binary+=String.fromCharCode(...bytes.subarray(i,i+8192)); return btoa(binary); }
function fromBase64(input){
 let s=limit(input).replace(/\s/g,'').replace(/-/g,'+').replace(/_/g,'/');
 if(!/^[A-Za-z0-9+/]*={0,2}$/.test(s)||s.length%4===1) fail('올바른 Base64 / Base64URL 문자열이 아닙니다.');
 if(s.includes('=')&&s.length%4!==0) fail('Base64 패딩(=) 길이가 올바르지 않습니다.');
 s=s.padEnd(Math.ceil(s.length/4)*4,'=');
 let binary;try{binary=atob(s);}catch(_){fail('Base64 디코딩에 실패했습니다.');}
 return decode(Uint8Array.from(binary,c=>c.charCodeAt(0)),'utf-8',true,true);
}
function unicodeEscape(text){
 let out='';for(let i=0;i<limit(text).length;i++){const n=text.charCodeAt(i),ch=text[i]; out+= ch==='\\'?'\\\\':(n<32||n>126)?'\\u'+n.toString(16).padStart(4,'0'):ch; } return out;
}
function unicodeUnescape(text){
 limit(text);let out='';const simple={n:'\n',r:'\r',t:'\t',b:'\b',f:'\f','\\':'\\','"':'"',"'":"'"};
 for(let i=0;i<text.length;i++){
  if(text[i]!=='\\'){out+=text[i];continue;}
  if(++i>=text.length) fail('문자열 끝에 단독 역슬래시가 있습니다.');
  if(text[i]==='u'){
   if(text[i+1]==='{'){
    const end=text.indexOf('}',i+2),v=text.slice(i+2,end);
    if(end<0||!/^[0-9a-f]{1,6}$/i.test(v)||parseInt(v,16)>0x10ffff) fail('유니코드 코드 포인트가 올바르지 않습니다.');
    out+=String.fromCodePoint(parseInt(v,16));i=end;
   }else{const v=text.slice(i+1,i+5);if(!/^[0-9a-f]{4}$/i.test(v)) fail('\\u 뒤에는 16진수 4자리가 필요합니다.');out+=String.fromCharCode(parseInt(v,16));i+=4;}
  }else if(Object.prototype.hasOwnProperty.call(simple,text[i]))out+=simple[text[i]];
  else fail('지원하지 않는 이스케이프: \\'+text[i]);
 }
 return out;
}
function htmlEscape(text){ return limit(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function htmlUnescape(text){
 return limit(text).replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(all,v)=>{
  const map={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:'\u00a0'};
  if(v[0]!=='#')return map[v.toLowerCase()];
  const cp=v[1].toLowerCase()==='x'?parseInt(v.slice(2),16):parseInt(v.slice(1),10);
  if(cp>0x10ffff||cp<0||(cp>=0xd800&&cp<=0xdfff))fail('범위를 벗어난 HTML 문자 코드입니다.');
  return String.fromCodePoint(cp);
 });
}
function codec(text,mode,direction,plus=false){
 limit(text);const enc=direction==='encode';
 if(mode==='base64')return enc?toBase64(text):fromBase64(text);
 if(mode==='url')return enc?encodeURIComponent(text):decodeURIComponent(plus?text.replace(/\+/g,' '):text);
 if(mode==='hex')return enc?hex(utf8(text)):decode(fromHex(text),'utf-8',true,true);
 if(mode==='unicode')return enc?unicodeEscape(text):unicodeUnescape(text);
 if(mode==='html')return enc?htmlEscape(text):htmlUnescape(text);
 fail('지원하지 않는 변환입니다.');
}
let cp1252;
function singleByteEncode(text,source){
 if(source==='windows-1252'&&!cp1252){cp1252=new Map();for(let i=0;i<256;i++){const c=decode(new Uint8Array([i]),'windows-1252',false);if(c!=='\ufffd')cp1252.set(c,i);}}
 const out=[];for(const ch of limit(text)){
  const n=source==='latin1'?ch.codePointAt(0):cp1252.get(ch);
  if(n===undefined||n>255)fail('해당 문자셋으로 바이트를 되살릴 수 없는 문자가 있습니다: '+ch+' (원본 파일을 불러와 주세요)');out.push(n);
 }
 return new Uint8Array(out);
}
function repair(text,source='latin1',target='utf-8'){
 if(text.includes('\ufffd'))fail('대체문자 �가 있습니다. 이 문자열만으로 손실된 바이트를 복구할 수 없습니다. 원본 파일을 사용하세요.');
 const bytes=singleByteEncode(text,source);return decode(bytes,target,true);
}
function fileInfo(bytes){
 let bom='없음 / 미확인';if(bytes[0]===0xef&&bytes[1]===0xbb&&bytes[2]===0xbf)bom='UTF-8 BOM';
 else if(bytes[0]===0xff&&bytes[1]===0xfe)bom='UTF-16LE BOM';else if(bytes[0]===0xfe&&bytes[1]===0xff)bom='UTF-16BE BOM';
 let validUtf8=true;try{decode(bytes);}catch(_){validUtf8=false;}
 return{bom,validUtf8,head:hex(bytes.subarray(0,64)),bytes:bytes.length};
}
// Only whitespace outside JSON strings is changed. Number lexemes, key order,
// duplicate keys, escaping and -0 are preserved instead of reserializing Numbers.
function formatJson(text,compact=false,indentSize=2){
 limit(text,1_000_000);const source=text.replace(/^\ufeff/,'');
 const tokens=source.match(/"(?:[^"\\]|\\[\s\S])*"|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?|true|false|null|[{}\[\],:]/g)||[];
 let nesting=0;for(const t of tokens){if(t==='{'||t==='['){if(++nesting>160)fail('중첩 깊이가 160단계를 넘습니다.');}else if(t==='}'||t===']')nesting--;}
 try{JSON.parse(source);}catch(e){fail('JSON 문법 오류: '+e.message);}
 if(compact)return tokens.join('');
 if(![2,4].includes(indentSize))fail('들여쓰기는 2칸 또는 4칸을 선택하세요.');
 let depth=0,size=0;const out=[],indent=()=> ' '.repeat(depth*indentSize);
 const append=(...parts)=>{for(const part of parts){size+=part.length;if(size>2_000_000)fail('정리 결과가 2,000,000자를 넘습니다. 입력을 나누거나 공백 압축을 사용하세요.');out.push(part);}};
 for(let i=0;i<tokens.length;i++){
  const t=tokens[i],n=tokens[i+1],p=tokens[i-1];
  if(t==='{'||t==='['){append(t);if(n!=='}'&&n!==']'){depth++;append('\n',indent());}}
  else if(t==='}'||t===']'){if(p!=='{'&&p!=='['){depth--;append('\n',indent());}append(t);}
  else if(t===',')append(',\n',indent());else if(t===':')append(': ');else append(t);
 }
 return out.join('');
}
function textStats(s){const raw=limit(s);return{chars:Array.from(raw).length,units:raw.length,bytes:utf8(raw).length,lines:lines(raw).length,crlf:(raw.match(/\r\n/g)||[]).length,lf:(raw.match(/(?<!\r)\n/g)||[]).length};}
function cleanText(text,options={}){
 let arr=lines(limit(text));if(options.trim)arr=arr.map(x=>x.trim());if(options.empty)arr=arr.filter(x=>x.trim()!=='');
 if(options.unique)arr=Array.from(new Set(arr));
 if(options.sort==='asc')arr.sort((a,b)=>a.localeCompare(b,'ko',{numeric:true}));
 if(options.sort==='desc')arr.sort((a,b)=>b.localeCompare(a,'ko',{numeric:true}));
 const ending=options.eol==='crlf'?'\r\n':'\n';return arr.join(ending);
}
function makeSql(text,column='ITEM_ID',kind='string',chunk=1000,unique=true,trim=true){
 limit(text,1_000_000);if(!/^[A-Za-z_][\w$#]*(?:\.[A-Za-z_][\w$#]*)*$/.test(column))fail('컬럼명은 영문·숫자·_·$·# 및 점(.)만 사용하며 숫자로 시작할 수 없습니다.');
 if(!Number.isInteger(chunk)||chunk<1||chunk>1000)fail('묶음 크기는 1~1000 정수로 지정하세요.');
 let vals=lines(text);if(trim)vals=vals.map(x=>x.trim());vals=vals.filter(x=>x!=='');if(unique)vals=Array.from(new Set(vals));
 if(!vals.length)fail('값을 한 줄에 하나씩 입력하세요. 빈 IN 절은 만들지 않습니다.');if(vals.length>20_000)fail('값은 20,000개 이하로 나누어 주세요.');
 const quoted=vals.map(v=>{if(kind==='number'){if(!/^[+\-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+\-]?\d+)?$/.test(v))fail('숫자 형식이 아닌 값: '+v.slice(0,80));return v;}if(/[\\\u0000-\u001f\u007f]/.test(v))fail('문자열의 역슬래시·제어문자는 DB 설정에 따라 다르게 해석되어 지원하지 않습니다. 해당 값에는 바인드 변수를 사용하세요.');return "'"+v.replace(/'/g,"''")+"'";});
 const groups=[];for(let i=0;i<quoted.length;i+=chunk){const part=quoted.slice(i,i+chunk),rows=[];for(let j=0;j<part.length;j+=6)rows.push('  '+part.slice(j,j+6).join(', '));groups.push(column+' IN (\n'+rows.join(',\n')+'\n)');}
 return {sql:groups.length===1?groups[0]:'(\n'+groups.join('\nOR\n')+'\n)',count:vals.length,groups:groups.length};
}
function diffLines(before,after,ignoreSpace=false){
 const a=lines(limit(before,500_000)),b=lines(limit(after,500_000));if(a.length>2500||b.length>2500)fail('비교는 각 2,500줄 이하로 나누어 주세요.');
 const normalize=s=>ignoreSpace?s.trim():s,ak=a.map(normalize),bk=b.map(normalize);let prefix=0,suffix=0;
 while(prefix<a.length&&prefix<b.length&&ak[prefix]===bk[prefix])prefix++;
 while(suffix<a.length-prefix&&suffix<b.length-prefix&&ak[a.length-1-suffix]===bk[b.length-1-suffix])suffix++;
 const aa=ak.slice(prefix,a.length-suffix),bb=bk.slice(prefix,b.length-suffix),n=aa.length,m=bb.length;
 if((n+1)*(m+1)>2_000_000)fail('차이가 많은 대형 입력입니다. 변경 구간을 작게 나누어 비교해 주세요.');
 const dp=Array.from({length:n+1},()=>new Uint16Array(m+1));
 for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i][j]=aa[i]===bb[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
 const out=[];let ai=0,bi=0;const emit=type=>{out.push({type,a:type==='add'?null:ai+1,b:type==='del'?null:bi+1,text:type==='add'?b[bi]:a[ai]});if(type!=='add')ai++;if(type!=='del')bi++;};
 for(let i=0;i<prefix;i++)emit('same');let i=0,j=0;
 while(i<n&&j<m){if(aa[i]===bb[j]){emit('same');i++;j++;}else if(dp[i+1][j]>=dp[i][j+1]){emit('del');i++;}else{emit('add');j++;}}
 while(i++<n)emit('del');while(j++<m)emit('add');for(let k=0;k<suffix;k++)emit('same');return out;
}
function filterLogs(text,include='',exclude='',context=0,ignoreCase=true){
 const arr=lines(limit(text));if(arr.length>50_000)fail('로그는 50,000줄 이하로 나누어 주세요.');
 const normalize=s=>ignoreCase?s.toLowerCase():s,words=s=>[...new Set(limit(s,2000).split(',').map(x=>normalize(x.trim())).filter(Boolean))],inc=words(include),exc=words(exclude);
 if(inc.length>50||exc.length>50)fail('포함·제외 검색어는 각각 50개 이하로 나누어 주세요.');
 const match=[],keep=new Set();context=Math.floor(Math.min(10,Math.max(0,Number(context)||0)));
 arr.forEach((line,i)=>{const x=normalize(line);if((!inc.length||inc.some(w=>x.includes(w)))&&!exc.some(w=>x.includes(w)))match.push(i);});
 match.forEach(i=>{for(let j=Math.max(0,i-context);j<=Math.min(arr.length-1,i+context);j++)keep.add(j);});
 const indexes=Array.from(keep).sort((a,b)=>a-b);
 return{text:indexes.map(i=>arr[i]).join('\n'),matched:match.length,shown:indexes.length,total:arr.length,errors:arr.filter(s=>/\bERROR\b/i.test(s)).length,warnings:arr.filter(s=>/\bWARN(?:ING)?\b/i.test(s)).length};
}
function timestamp(input,unit='s'){
 const raw=String(input).trim();if(!/^-?\d+(?:\.\d{1,3})?$/.test(raw)||unit==='ms'&&raw.includes('.'))fail('초는 소수점 3자리까지, 밀리초는 정수로 입력하세요.');
 const ms=Math.round(Number(raw)*(unit==='s'?1000:1));if(!Number.isSafeInteger(ms)||!Number.isFinite(new Date(ms).getTime()))fail('날짜로 표현할 수 없는 타임스탬프입니다.');return ms;
}
function dateInputToMs(s,offset=540){
 const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(s);if(!m)fail('날짜와 시간을 모두 입력하세요.');
 const [y,mo,d,h,mi,se]=m.slice(1).map(x=>Number(x||0));if(y<1000||y>9999)fail('연도는 1000~9999 범위로 입력하세요.');
 const utc=Date.UTC(y,mo-1,d,h,mi,se),v=new Date(utc);if(v.getUTCFullYear()!==y||v.getUTCMonth()!==mo-1||v.getUTCDate()!==d||h>23||mi>59||se>59)fail('존재하지 않는 날짜 또는 시간입니다.');return utc-offset*60_000;
}
function formatTime(ms,offset=0){const d=new Date(ms+offset*60_000);if(!Number.isFinite(d.getTime()))fail('날짜 범위 초과');return d.toISOString().replace('T',' ').replace('Z','');}
function permission(octal){
 if(!/^[0-7]{3}$/.test(String(octal)))fail('일반 권한 3자리를 입력하세요. 예: 640, 755');
 return String(octal).split('').map(n=>{n=Number(n);return (n&4?'r':'-')+(n&2?'w':'-')+(n&1?'x':'-');}).join('');
}
function shellQuote(s,shell='bash'){limit(s,4096);if(/[\u0000-\u001f\u007f]/.test(s))fail('매개변수에 개행·제어문자를 넣을 수 없습니다.');return shell==='powershell'?"'"+s.replace(/['\u2018-\u201b]/g,ch=>ch+ch)+"'":"'"+s.replace(/'/g,"'\"'\"'")+"'";}
function fillCommand(template,values,spec,shell='bash'){
 return limit(template,16_000).replace(/\{\{([A-Z_]+)\}\}/g,(_,name)=>{
  const v=limit(String(values[name]===undefined?'':values[name]),4096);if(!v.trim())fail(name+' 값을 입력하세요.');const kind=(spec[name]||{}).kind;
  if(kind==='path'&&v.startsWith('-'))fail('하이픈으로 시작하는 경로에는 ./를 앞에 붙이세요. 명령 옵션으로 해석되지 않도록 차단했습니다.');
  if(kind==='identifier'&&v.startsWith('-'))fail(name+'는 하이픈(-)으로 시작할 수 없습니다. 명령 옵션으로 해석되지 않도록 차단했습니다.');
  if(kind==='http-url'){
   let url;try{url=new URL(v);}catch(_){fail('올바른 HTTP 또는 HTTPS URL을 입력하세요.');}
   if(!/^https?:\/\//i.test(v)||!['http:','https:'].includes(url.protocol)||url.username||url.password)fail('인증정보가 없는 HTTP 또는 HTTPS URL만 지원합니다.');
  }
  if(['pid','port','positive'].includes(kind)){
   if(!/^\d+$/.test(v)||!Number.isSafeInteger(Number(v))||Number(v)<1)fail(name+'는 양의 정수로 입력하세요.');
   if(kind==='port'&&Number(v)>65535)fail('포트 범위는 1~65535입니다.');return String(Number(v));
  }
  return shellQuote(v,shell);
 });
}
function cronField(text,min,max,isDow=false){
 const values=new Set();if(text.length>120||!/^[0-9*,/\-]+$/.test(text))fail('크론은 숫자·*·범위(-)·목록(,)·간격(/)만 지원합니다.');
 for(const part of text.split(',')){
  const m=/^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(part);if(!m)fail('잘못된 크론 필드: '+text);
  const step=m[2]?Number(m[2]):1;if(step<1||step>max-min+1)fail('크론 간격 값의 범위를 확인하세요.');let start,end;
  if(m[1]==='*'){start=min;end=max;}else if(m[1].includes('-'))[start,end]=m[1].split('-').map(Number);else {start=Number(m[1]);end=start;if(m[2])fail('간격은 */n 또는 a-b/n 형태로 입력하세요.');}
  if(start<min||end>max||start>end)fail('크론 필드 범위는 '+min+'~'+max+'입니다.');
  for(let n=start;n<=end;n+=step)values.add(isDow&&n===7?0:n);
 }
 return{values,star:text.startsWith('*'),raw:text};
}
function parseCron(expr){
 const f=expr.trim().split(/\s+/);if(f.length!==5)fail('5필드(분 시 일 월 요일)만 지원합니다. 초·연도·명령어는 제외하세요.');
 return f.map((x,i)=>cronField(x,...[[0,59],[0,23],[1,31],[1,12],[0,7]][i],i===4));
}
function nextCron(expr,from=Date.now(),offset=540,count=5){
 const fields=parseCron(expr),[mins,hours,dom,months,dow]=fields,results=[],start=new Date(from+offset*60_000);
 const firstDay=Date.UTC(start.getUTCFullYear(),start.getUTCMonth(),start.getUTCDate());
 // Fixed-offset KST/UTC only; no DST emulation. Look ahead four years for Feb 29.
 for(let day=0;day<=366*4&&results.length<count;day++){
  const dayms=firstDay+day*86400000,d=new Date(dayms);if(!months.values.has(d.getUTCMonth()+1))continue;
  const md=dom.values.has(d.getUTCDate()),wd=dow.values.has(d.getUTCDay());
  const dayMatches=dom.star||dow.star?md&&wd:md||wd;if(!dayMatches)continue;
  for(const h of [...hours.values].sort((a,b)=>a-b))for(const m of [...mins.values].sort((a,b)=>a-b)){
   const ms=dayms+h*3600000+m*60000-offset*60000;if(ms>from&&results.length<count)results.push(ms);
  }
 }
 return{fields:fields.map(x=>({raw:x.raw,values:[...x.values].sort((a,b)=>a-b),star:x.star})),times:results};
}
async function digest(bytes,algorithm='SHA-256'){
 if(!global.crypto||!global.crypto.subtle)fail('이 브라우저/보안 컨텍스트에서 Web Crypto를 사용할 수 없습니다. 파일 명령어 포켓의 SHA-256 명령을 사용하세요.');
 const result=await global.crypto.subtle.digest(algorithm,bytes);return hex(new Uint8Array(result)).replace(/ /g,'').toLowerCase();
}
function characterRows(text){
 limit(text,40_000);const out=[];for(const ch of text){if(out.length>=2000)fail('문자 검사는 코드 포인트 2,000개 이하로 나누어 주세요.');const cp=ch.codePointAt(0);out.push({ch,cp,unicode:'U+'+cp.toString(16).toUpperCase().padStart(4,'0'),hex:hex(utf8(ch)),ascii:cp<=127?cp:null});}return out;
}
global.PocketCore={limit,utf8,decode,hex,fromHex,lines,toBase64,fromBase64,unicodeEscape,unicodeUnescape,htmlEscape,htmlUnescape,codec,repair,singleByteEncode,fileInfo,formatJson,textStats,cleanText,makeSql,diffLines,filterLogs,timestamp,dateInputToMs,formatTime,permission,shellQuote,fillCommand,parseCron,nextCron,digest,characterRows};
})(typeof window!=='undefined'?window:globalThis);
