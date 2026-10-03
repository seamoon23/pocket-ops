// Run with Node.js 22+; zero packages, zero network. Never executes shell commands.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '..');
vm.runInThisContext(fs.readFileSync(path.join(root,'src/core.js'),'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(root,'src/data.js'),'utf8').replace('window.PocketData','globalThis.PocketData'));
const C=globalThis.PocketCore,D=globalThis.PocketData;
let pass=0, fail=0;const results=[];
async function test(name, fn){try{await fn();pass++;results.push({name,pass:true});}catch(e){fail++;results.push({name,pass:false,error:e.stack});console.error('FAIL',name,e.message);}}
(async()=>{
 for(const mode of ['base64','url','hex','unicode','html'])for(const text of ['', 'abc', '한글 😀\n<T> & " \\uD55C', 'a\u0000b\t\r\n'])await test(mode+' roundtrip '+JSON.stringify(text),()=>assert.equal(C.codec(C.codec(text,mode,'encode'),mode,'decode'),text));
 await test('base64url and no padding',()=>assert.equal(C.fromBase64('8J-YgA'),'😀'));
 await test('base64 invalid padding',()=>assert.throws(()=>C.fromBase64('YQ=')));
 await test('base64 rejects binary as text',()=>assert.throws(()=>C.fromBase64('/w==')));
 await test('Base64 and HEX preserve leading BOM as text',()=>{for(const mode of ['base64','hex'])assert.equal(C.codec(C.codec('\ufeff한글',mode,'encode'),mode,'decode'),'\ufeff한글');});
 await test('UTF8 rejects lone surrogates instead of replacing data',()=>{for(const value of ['\ud800','\udfff','a\ud800b'])assert.throws(()=>C.utf8(value),/서로게이트/);assert.deepEqual([...C.utf8('😀')],[240,159,152,128]);});
 await test('URL plus form decode',()=>{assert.equal(C.codec('a+b%2Bc','url','decode',true),'a b+c');assert.equal(C.codec('a+b','url','decode'),'a+b');});
 await test('invalid URL percent rejected',()=>assert.throws(()=>C.codec('%GG','url','decode')));
 await test('HEX formats',()=>assert.deepEqual([...C.fromHex('0xED:95-9C')],[237,149,156]));
 await test('HEX rejects odd nibble',()=>assert.throws(()=>C.fromHex('ABC')));
 await test('unicode scalar notation',()=>assert.equal(C.unicodeUnescape('\\u{1F600}'),'😀'));
 await test('unicode malformed escape',()=>assert.throws(()=>C.unicodeUnescape('\\u123')));
 await test('HTML numeric and named',()=>assert.equal(C.htmlUnescape('&lt;&#54620;&#xAE00;&apos;&nbsp;'),"<한글'\u00a0"));
 await test('HTML surrogate rejected',()=>assert.throws(()=>C.htmlUnescape('&#xD800;')));
 // Node ICU differs for Windows-949 extension bytes. The browser suite tests 0x81 0x41 explicitly.
 await test('EUC-KR common Hangul decoder',()=>assert.equal(C.decode(Uint8Array.from([0xc7,0xd1,0xb1,0xdb]),'euc-kr'),'한글'));
 for(const source of ['latin1','windows-1252'])await test('mojibake repair '+source,()=>{const bytes=C.utf8('한글 테스트');const broken=source==='latin1'?String.fromCharCode(...bytes):C.decode(bytes,source,false);assert.equal(C.repair(broken,source),'한글 테스트');});
 await test('replacement character not recoverable',()=>assert.throws(()=>C.repair('�')));
 await test('file BOM and strict UTF8 flags',()=>{assert.equal(C.fileInfo(Uint8Array.of(0xef,0xbb,0xbf)).bom,'UTF-8 BOM');assert.equal(C.fileInfo(Uint8Array.of(0xff)).validUtf8,false);});
 const raw='{"id":900719925474099312345,"id":-0,"d":1.2300,"e":1e+999,"s":"a \\" b"}';
 await test('JSON lexical preservation',()=>assert.equal(C.formatJson(C.formatJson(raw),true),raw));
 await test('JSON duplicate key preserved',()=>assert.equal(C.formatJson('{"a":1,"a":2}',true),'{"a":1,"a":2}'));
 await test('JSON strings / nested empty arrays',()=>{const source=JSON.stringify({x:[{},[],true,null,' \n " x']});assert.equal(C.formatJson(C.formatJson(source),true),source);});
 await test('JSON BOM permitted',()=>assert.equal(C.formatJson('\ufeff { "a" : 1 }',true),'{"a":1}'));
 await test('JSON invalid syntax rejected',()=>assert.throws(()=>C.formatJson('{"a":}')));
 await test('JSON nesting limit',()=>assert.throws(()=>C.formatJson('['.repeat(162)+'0'+']'.repeat(162))));
 await test('JSON nesting limit also protects minify and empty containers',()=>{for(const compact of [false,true])assert.throws(()=>C.formatJson('['.repeat(161)+']'.repeat(161),compact),/160/);});
 await test('JSON whitespace expansion is bounded',()=>{const source='['.repeat(160)+Array(4000).fill('0').join(',')+']'.repeat(160);assert.throws(()=>C.formatJson(source,false,4),/2,000,000/);assert.equal(C.formatJson(source,true),source);});
 await test('text clean preserves ordering',()=>assert.equal(C.cleanText(' a \n\na\nb\r\n',{trim:true,empty:true,unique:true}),'a\nb'));
 await test('text natural sort and CRLF',()=>assert.equal(C.cleanText('item10\nitem2',{sort:'asc',eol:'crlf'}),'item2\r\nitem10'));
 await test('text stats code point vs units',()=>assert.deepEqual(C.textStats('A😀\r\n'),{chars:4,units:5,bytes:7,lines:2,crlf:1,lf:0}));
 await test('SQL escapes quotes and deduplicates',()=>{const r=C.makeSql("O'Brien\nA\nA");assert.equal(r.count,2);assert.ok(r.sql.includes("'O''Brien'"));});
 await test('SQL 1001 split OR',()=>{const r=C.makeSql(Array.from({length:1001},(_,i)=>''+i).join('\n'));assert.equal(r.groups,2);assert.ok(r.sql.includes('\nOR\n'));});
 await test('SQL numeric precision preserved',()=>assert.ok(C.makeSql('900719925474099312345','T.ID','number').sql.includes('900719925474099312345')));
 await test('SQL rejects DB-dependent backslash quoting and controls',()=>{for(const value of ["\\' OR 1=1 -- ",'C:\\logs\\app','a\u0000b','a\tb'])assert.throws(()=>C.makeSql(value),/바인드 변수/);});
 for(const [name,fn] of [['invalid column',()=>C.makeSql('1','ID);DROP TABLE X--')],['empty list',()=>C.makeSql('')],['numeric injection',()=>C.makeSql('1 OR 1=1','ID','number')],['oversized chunk',()=>C.makeSql('1','ID','string',1001)]])await test('SQL rejects '+name,()=>assert.throws(fn));
 await test('diff simple additions',()=>assert.deepEqual(C.diffLines('a\nb','a\nc').map(r=>r.type),['same','del','add']));
 await test('diff empty input',()=>assert.deepEqual(C.diffLines('',''),[]));
 await test('diff distinguishes final newline',()=>assert.equal(C.diffLines('a','a\n').filter(r=>r.type==='add').length,1));
 await test('diff whitespace option',()=>assert.equal(C.diffLines(' a ','a',true)[0].type,'same'));
 let seed=1765;function rnd(n){seed=(seed*1664525+1013904223)>>>0;return seed%n;}
 await test('diff 200 randomized reconstruction properties',()=>{for(let i=0;i<200;i++){const a=Array.from({length:rnd(24)},()=>String(rnd(8))).join('\n'),b=Array.from({length:rnd(24)},()=>String(rnd(8))).join('\n'),r=C.diffLines(a,b);assert.equal(r.filter(x=>x.type!=='add').map(x=>x.text).join('\n'),a);assert.equal(r.filter(x=>x.type!=='del').map(x=>x.text).join('\n'),b);}});
 await test('log OR, exclude and context',()=>{const r=C.filterLogs('INFO ready\nERROR ignore\nWARN close\nERROR timeout\nINFO end','error','ignore',1,true);assert.equal(r.matched,1);assert.equal(r.text,'WARN close\nERROR timeout\nINFO end');assert.equal(r.errors,2);});
 await test('Log search bounds and integer context',()=>{assert.throws(()=>C.filterLogs('abc','x'.repeat(2001)));assert.throws(()=>C.filterLogs('abc',Array.from({length:51},(_,i)=>'term'+i).join(',')));assert.equal(C.filterLogs('one\nERROR\nthree','ERROR','',1.5).text,'one\nERROR\nthree');});
 await test('epoch explicit units',()=>{assert.equal(C.timestamp('1.234'),1234);assert.equal(C.timestamp('-0.001'),-1);assert.equal(C.timestamp('1','ms'),1);});
 await test('epoch invalid units precision',()=>assert.throws(()=>C.timestamp('1.2','ms')));
 await test('KST epoch zero conversion',()=>assert.equal(C.dateInputToMs('1970-01-01T09:00:00',540),0));
 await test('date rejects nonexistent leap day',()=>assert.throws(()=>C.dateInputToMs('2025-02-29T00:00:00')));
 await test('date handles leap day',()=>assert.equal(C.formatTime(C.dateInputToMs('2024-02-29T00:00:00',0),0),'2024-02-29 00:00:00.000'));
 await test('permissions rwx',()=>{assert.equal(C.permission('640'),'rw-r-----');assert.equal(C.permission('755'),'rwxr-xr-x');assert.throws(()=>C.permission('4755'));});
 await test('shell quoting literal apostrophes and command substitution',()=>assert.equal(C.shellQuote("a'$(whoami)"),"'a'\"'\"'$(whoami)'"));
 await test('PowerShell quoting',()=>assert.equal(C.shellQuote("a'b",'powershell'),"'a''b'"));
 await test('PowerShell quotes all smart single quotation marks',()=>{for(const quote of ['\u2018','\u2019','\u201a','\u201b'])assert.equal(C.shellQuote('a'+quote+'b','powershell'),"'a"+quote+quote+"b'");});
 if(process.platform==='win32')await test('PowerShell parser keeps hostile arguments as one literal (no execution)',()=>{
  const {spawnSync}=require('node:child_process');
  const samples=["a'$(Write-Output injected)",...['\u2018','\u2019','\u201a','\u201b'].map(q=>'a'+q+'; Write-Output injected #')].map(value=>({value,command:'Write-Output '+C.shellQuote(value,'powershell')}));
  const check=`$samples = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${Buffer.from(JSON.stringify(samples)).toString('base64')}')) | ConvertFrom-Json
foreach ($sample in $samples) {
 $tokens = $null; $parseErrors = $null
 $ast = [System.Management.Automation.Language.Parser]::ParseInput($sample.command,[ref]$tokens,[ref]$parseErrors)
 $commands = @($ast.FindAll({param($item) $item -is [System.Management.Automation.Language.CommandAst]},$true))
 if ($parseErrors.Count -ne 0 -or $commands.Count -ne 1 -or $commands[0].CommandElements.Count -ne 2 -or $commands[0].CommandElements[1].Value -cne $sample.value) { exit 1 }
}`;
  const result=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(check,'utf16le').toString('base64')],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||String(result.error||''));
 });
 await test('template numeric validation',()=>assert.throws(()=>C.fillCommand('kill {{PID}}',{PID:'123;id'},D.params)));
 await test('template port range',()=>assert.throws(()=>C.fillCommand('ss {{PORT}}',{PORT:'65536'},D.params)));
 await test('shell control characters rejected',()=>assert.throws(()=>C.shellQuote('a\nb')));
 await test('template bounds and option-looking identifiers',()=>{assert.throws(()=>C.shellQuote('x'.repeat(4097)));assert.throws(()=>C.fillCommand('tool {{HOST}}',{HOST:'--help'},{HOST:{kind:'identifier'}}));});
 await test('HTTP templates reject credentials and non-HTTP protocols',()=>{const spec={URL:{kind:'http-url'}};for(const url of ['file:///etc/passwd','gopher://localhost','https://user:secret@localhost','https:example.com'])assert.throws(()=>C.fillCommand('curl {{URL}}',{URL:url},spec));assert.equal(C.fillCommand('curl {{URL}}',{URL:'https://internal.example/a?b=1'},spec),"curl 'https://internal.example/a?b=1'");});
 const from=Date.parse('2026-10-03T00:00:00Z');
 await test('cron every5 excludes exact start',()=>assert.equal(C.nextCron('*/5 * * * *',from,0,1).times[0],from+300000));
 await test('cron KST daily',()=>assert.equal(C.nextCron('0 9 * * *',from,540,1).times[0],Date.parse('2026-10-04T00:00:00Z')));
 await test('cron DOM/DOW OR',()=>{const r=C.nextCron('0 0 1 * 1',Date.parse('2026-09-30T00:00Z'),0,2);assert.deepEqual(r.times.map(x=>new Date(x).toISOString()),['2026-10-01T00:00:00.000Z','2026-10-05T00:00:00.000Z']);});
 await test('cron leap year lookahead',()=>assert.equal(new Date(C.nextCron('0 0 29 2 *',from,0,1).times[0]).getUTCFullYear(),2028));
 await test('cron impossible date no fabricated result',()=>assert.equal(C.nextCron('0 0 31 2 *',from,0).times.length,0));
 await test('cron Sunday7 alias',()=>assert.ok(C.parseCron('0 0 * * 7')[4].values.has(0)));
 for(const s of ['* * * * * *','0 24 * * *','*/0 * * * *','0 0 * JAN MON','0 0 ? * *'])await test('cron rejects '+s,()=>assert.throws(()=>C.parseCron(s)));
 for(const alg of ['SHA-256','SHA-384','SHA-512'])await test('hash known abc '+alg,async()=>assert.equal(await C.digest(C.utf8('abc'),alg),createHash(alg.toLowerCase().replace('-','')).update('abc').digest('hex')));
 await test('Unicode ASCII boundaries',()=>{const r=C.characterRows('A한😀');assert.equal(r[0].ascii,65);assert.equal(r[1].ascii,null);assert.equal(r[2].cp,128512);assert.equal(r[2].hex,'F0 9F 98 80');});
 await test('Command catalog unique and supported metadata',()=>{assert.ok(D.commands.length>=93);assert.equal(new Set(D.commands.map(x=>x.id)).size,D.commands.length);for(const c of D.commands){assert.ok(['read','load','change'].includes(c.risk));assert.ok(['user','limited'].includes(c.permission));assert.ok(c.title&&c.note&&c.command);}});
 await test('All command placeholders resolved; Docker Go template retained',()=>{for(const c of D.commands){const params=Object.fromEntries(Object.entries(D.params).map(([k,v])=>[k,v.default||'1234']));const out=C.fillCommand(c.command,params,D.params,c.shell);assert.ok(!/\{\{[A-Z_]+\}\}/.test(out));}assert.ok(D.commands.find(c=>c.id==='cmd-080').command.includes('{{.State.Status}}'));});
 const report={environment:process.version,total:pass+fail,passed:pass,failed:fail,results};fs.writeFileSync(path.join(__dirname,'core-results.json'),JSON.stringify(report,null,2));console.log(`Core: ${pass} passed, ${fail} failed`);process.exitCode=fail?1:0;
})();
