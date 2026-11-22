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
 await test('All expanding codecs bound output before displaying it',()=>{
  for(const [mode,char,count] of [['base64','a',1500001],['hex','한',222223],['url','한',222223],['unicode','한',333334],['html','&',400001]]){
   assert.throws(()=>C.codec(char.repeat(count),mode,'encode'),/결과가 2,000,000자/);
  }
  assert.equal(C.codec('&'.repeat(400000),'html','encode').length,2000000);
 });
 await test('Encoding chunks preserve a supplementary character across boundaries',()=>{
  const text='a'.repeat(8191)+'😀한글';
  for(const mode of ['url','html','unicode'])assert.equal(C.codec(C.codec(text,mode,'encode'),mode,'decode'),text);
 });
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
 await test('SQL formatting changes only outer clause and list whitespace for four CRUD verbs',()=>{
  const cases=[
   ['select p.id,p.title from product p left outer join stock s ON s.id=p.id where p.n=001 and s.n>1 order by p.id;',
    'select p.id,\n  p.title\nfrom product p\nleft outer join stock s ON s.id=p.id\nwhere p.n=001\n  and s.n>1\norder by p.id;'],
   ["INSERT INTO t(a,b) VALUES(1,'하나,둘')", "INSERT INTO t(a,b)\nVALUES(1,'하나,둘')"],
   ['UPDATE t SET a=-0,b=(select max(n) from z) WHERE id=900719925474099312345;',
    'UPDATE t\nSET a=-0,\n  b=(select max(n) from z)\nWHERE id=900719925474099312345;'],
   ['DELETE FROM t WHERE 1=0;', 'DELETE FROM t\nWHERE 1=0;']
  ];
  for(const [input,expected] of cases){
   assert.equal(C.formatSql(input),expected);
   assert.equal(C.formatSql(expected),expected);
  }
 });
 await test('SQL review uses the first SQL keyword after comments for the current query',()=>{
  const cases=[
   ["/* DELETE */ select 'UPDATE' from sample;",'SELECT'],
   ["-- SELECT\r\ninSeRt into sample values ('DELETE');",'INSERT'],
   ["// SELECT\n/* hint */ uPdAtE sample set title='SELECT';",'UPDATE'],
   ["/* SELECT; */ -- UPDATE\n  dElEtE from sample where id=42;",'DELETE']
  ];
  for(const [input,verb] of cases){
   const prepared=C.prepareSql(input);
   assert.equal(prepared.verb,verb);
   assert.equal(prepared.sql,C.formatSql(input));
  }
  for(const input of ['/* SELECT */','WITH t AS (SELECT 1) SELECT * FROM t;', 'SELECT 1; DELETE FROM sample;']){
   assert.throws(()=>C.prepareSql(input));
  }
 });
 await test('SQL hints, line comment endings, quoted identifiers and multibyte literals survive formatting',()=>{
  const select = '/* ; */ SELECT /*+ INDEX(t) */ \'O\'\'Brien; WHERE\',';
  const protectedText = '"order by", [from], `and`, \'a\r\nb\'';
  const input = select+protectedText+' FROM t -- abc WHERE 1;\r\n WHERE /* SELECT -- */ id=1 // where;\r\n AND n=2; -- 끝\r\n';
  assert.equal(C.formatSql(input),select+'\r\n  '+protectedText.split(', ').join(',\r\n  ')+
   '\r\nFROM t -- abc WHERE 1;\r\n WHERE /* SELECT -- */ id=1 // where;\r\n AND n=2; -- 끝\r\n');
 });
 await test('SQL formatting rejects ambiguous literals, unsupported scripts and unmatched structure',()=>{
  for(const input of ["SELECT 'unterminated",'select [unclosed','select (1','SELECT )','SELECT 1 /*x','SELECT /* /*bad*/ x',
                      'SELECT 1; UPDATE x SET a=1;', ';shell', 'SELECT 1\n;read other.sql',
                      "SELECT 'a\\b'", 'SELECT $tag$x where$tag$', "select q'[a\' where x]'",'/* comment only */']){
   assert.throws(()=>C.formatSql(input),input);
  }
 });
 await test('SQL format input and output caps fail without producing a partial query',()=>{
  assert.throws(()=>C.formatSql('SELECT '+'x'.repeat(100_000)),/100,000/);
  assert.throws(()=>C.formatSql('SELECT '+'a,'.repeat(48_000)+'b'),/200,000/);
 });
 await test('SQL intended for interactive CSQL rejects session command lines inside literals and comments',()=>{
  for(const value of ["SELECT 'first\n  ;help\nlast';",'/* note\r\n\t;.\r\n*/ SELECT 1;']){
   assert.throws(()=>C.formatSql(value),/CSQL 세션 명령/);
  }
  assert.equal(C.formatSql("SELECT ';help'\n  ;"), "SELECT ';help'\n  ;");
 });
 await test('SQL escapes quotes and deduplicates',()=>{const r=C.makeSql("O'Brien\nA\nA");assert.equal(r.count,2);assert.ok(r.sql.includes("'O''Brien'"));});
 await test('Archive listing treats colon filenames as local even when quoted',()=>{
  const listing=D.commands.find(entry=>entry.id==='cmd-027');
  assert.ok(listing.command.includes('tar --force-local '));
  assert.equal(listing.risk,'load');
 });
 await test('Dialect-dependent comment marker rejected only in SQL column names',()=>{
  assert.throws(()=>C.makeSql('ABC','DEMO.ITEM#ID'),/주석/);
  assert.ok(C.makeSql('#ABC','DEMO.ITEM_ID').sql.includes("'#ABC'"));
 });
 await test('SQL 1001 split OR',()=>{const r=C.makeSql(Array.from({length:1001},(_,i)=>''+i).join('\n'));assert.equal(r.groups,2);assert.ok(r.sql.includes('\nOR\n'));});
 await test('SQL numeric precision preserved',()=>assert.ok(C.makeSql('900719925474099312345','T.ID','number').sql.includes('900719925474099312345')));
 await test('SQL rejects DB-dependent backslash quoting and controls',()=>{for(const value of ["\\' OR 1=1 -- ",'C:\\logs\\app','a\u0000b','a\tb'])assert.throws(()=>C.makeSql(value),/바인드 변수/);});
 await test('SQL column and repeated group output are bounded',()=>{assert.throws(()=>C.makeSql('1','A'.repeat(513)),/512/);const values=Array(20_000).fill('x').join('\n'),column='A'.repeat(512);assert.throws(()=>C.makeSql(values,column,'string',1,false),/2,000,000/);const result=C.makeSql(values,column,'string',1000,false);assert.equal(result.count,20_000);assert.equal(result.groups,20);assert.ok(result.sql.length<2_000_000);});
 await test('SQL quote expansion is bounded without truncation',()=>{assert.throws(()=>C.makeSql("'".repeat(1_000_000)),/2,000,000/);const value="'".repeat(900_000),result=C.makeSql(value);assert.ok(result.sql.includes("'".repeat(1_800_002)));assert.equal(result.count,1);});
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
 await test('CSQL shell templates require a target and user, and never embed a password',()=>{
  const params={DBUSER:'user_a',DBTARGET:'testdb'};
  for(const id of ['cmd-123','cmd-124']){
   const entry=D.commands.find(c=>c.id===id);
   assert.equal(entry.shell,'bash');
   const result=C.fillCommand(entry.command,params,D.params,entry.shell);
   assert.ok(result.includes(id==='cmd-123'?' -r ':' --no-auto-commit '));
   assert.ok(!/--password| -p /.test(result));
   assert.throws(()=>C.fillCommand(entry.command,{...params,DBTARGET:'-x'},D.params,entry.shell));
  }
  for(const shell of ['sql','csql','sqlplus','psql','mariadb']) assert.throws(()=>C.fillCommand('sample {{DBUSER}}',params,D.params,shell));
 });
 await test('UPDATE/DELETE without a top-level WHERE are flagged as full-table changes',()=>{
  for(const [sql,verb] of [['UPDATE t SET a = 1;','UPDATE'],['delete from t','DELETE'],
                           ['UPDATE t SET a = (SELECT b FROM s WHERE s.id = t.id);','UPDATE'],
                           ['DELETE FROM t /* WHERE id = 1 */;','DELETE'],["UPDATE t SET note = 'WHERE id = 1';",'UPDATE']]){
   const r=C.prepareSql(sql);
   assert.equal(r.verb,verb);assert.equal(r.review,true);
   assert.equal(r.checks[0].code,'no-where',sql);assert.equal(r.checks[0].level,'danger');
  }
  for(const sql of ['UPDATE t SET a = 1 WHERE id = 1;','DELETE FROM t WHERE id IN (SELECT id FROM s);'])
   assert.ok(!C.prepareSql(sql).checks.some(c=>c.code==='no-where'),sql);
 });
 await test('SELECT that writes or locks is reviewed; plain SELECT is not',()=>{
  const codes=(sql,d)=>C.prepareSql(sql,d).checks.map(c=>c.code);
  assert.deepEqual(codes("SELECT * FROM t INTO OUTFILE '/tmp/x';",'mariadb'),['select-into']);
  assert.deepEqual(codes('SELECT * INTO new_t FROM t;','postgresql'),['select-into']);
  for(const [sql,d] of [['SELECT * FROM t WHERE id = 1 FOR UPDATE;','cubrid'],['SELECT * FROM t FOR NO KEY UPDATE;','postgresql'],
                        ['SELECT * FROM t FOR KEY SHARE;','postgresql'],['SELECT * FROM t LOCK IN SHARE MODE;','mariadb']]){
   assert.deepEqual(codes(sql,d),['select-lock'],sql);assert.equal(C.prepareSql(sql,d).review,true);
  }
  const plain=C.prepareSql("SELECT 'FOR UPDATE', a FROM t WHERE b IN (SELECT c INTO x FROM y);");
  assert.equal(plain.review,false);assert.deepEqual(plain.checks,[]);
 });
 await test('Sample table left in a preset is reported without blocking',()=>{
  for(const id of ['cmd-132','cmd-133','cmd-134','cmd-135']){
   const preset=D.commands.find(c=>c.id===id),r=C.prepareSql(preset.editorSql);
   assert.ok(r.checks.some(c=>c.code==='sample'),id);
   assert.equal(r.review,preset.risk==='change');
  }
 });
 await test('Subquery locks and client substitution require reviewing SELECT before delivery',()=>{
  for (const [db,sql,code] of [
   ['postgresql','SELECT id FROM (SELECT id FROM jobs FOR UPDATE) q;','select-lock'],
   ['postgresql','SELECT arr[:slot] FROM jobs;','psql-variable'],
   ['oracle',"SELECT 'A&B' FROM dual;",'oracle-define']
  ]) {
   const result=C.prepareSql(sql,db);
   assert.ok(result.review && result.checks.some(c=>c.code===code),sql);
  }
  assert.equal(C.prepareSql("SELECT arr[1], ':slot' FROM jobs;",'postgresql').review,false);
 });
 await test('Clipboard and UTF-8 SQL cannot silently truncate or replace hidden characters',()=>{
  for (const db of Object.keys(D.dbs)) {
   for (const value of ['\x00','\u001b','\ud800','\udfff']) {
    assert.throws(()=>C.prepareSql("UPDATE jobs SET note='x"+value+"y' WHERE id=1;",db),/제어 문자/);
    assert.throws(()=>C.prepareSql('SELECT 1 /*'+value+'*/;',db),/제어 문자/);
   }
   assert.ok(C.prepareSql("SELECT '한글 😀';",db).sql.includes('한글 😀'));
  }
 });
 await test('DB choice changes lexical rules only where the target client reads text differently',()=>{
  const portable="SELECT a, b FROM t WHERE x = 'y' -- note\n  AND z = 1 /* c */;";
  const expected=C.formatSql(portable);
  for(const d of ['cubrid','mariadb','oracle','postgresql']){assert.equal(C.formatSql(portable,d),expected,d);}
  assert.throws(()=>C.prepareSql('SELECT 1;','mysql'),/DB 종류/);
  // Oracle SQL*Plus: blank lines end the buffer and lone / or . lines run or close it.
  for(const sql of ['UPDATE t SET a = 1\n\nWHERE id = 1;','UPDATE t SET a = 1\r\n  \r\nWHERE id = 1;','UPDATE t SET a = 1 WHERE id = 1\n/','SELECT 1\n.\nFROM dual;',"SELECT 'a\n\nb' FROM dual;"])
   assert.throws(()=>C.prepareSql(sql,'oracle'),/SQL\*Plus/,JSON.stringify(sql));
  assert.ok(C.prepareSql('\nSELECT 1 FROM dual;\n\n','oracle'));
  assert.deepEqual(C.prepareSql("UPDATE t SET a = 'A&B' WHERE id = 1;",'oracle').checks.map(c=>c.code),['oracle-define']);
  assert.deepEqual(C.prepareSql("UPDATE t SET a = 'A&B' WHERE id = 1;",'cubrid').checks,[]);
  // MariaDB/MySQL execute /*! */ bodies in every dialect's copy target; "--x" is not a MariaDB comment.
  for(const d of ['cubrid','mariadb','oracle','postgresql']){
   assert.throws(()=>C.prepareSql('SELECT 1 /*! , 2 */;',d),/실행하는 주석/);
   assert.throws(()=>C.prepareSql('SELECT 1 /*M! , 2 */;',d),/실행하는 주석/);
   assert.ok(C.prepareSql('SELECT /*+ INDEX(t) */ 1 FROM t;',d));
  }
  assert.throws(()=>C.prepareSql('DELETE FROM t WHERE id = 5--1\nOR 1 = 1;','mariadb'),/공백/);
  assert.ok(C.prepareSql('DELETE FROM t WHERE id = 5 -- note\n;','mariadb'));
  assert.ok(C.prepareSql('DELETE FROM t WHERE id = 5--1\n;','cubrid'));
  // CUBRID alone treats // as a comment.
  for(const d of ['mariadb','oracle','postgresql'])assert.throws(()=>C.prepareSql('SELECT a // c\nFROM t;',d),/CUBRID 전용/);
  assert.equal(C.prepareSql('SELECT a // c\nFROM t;','cubrid').verb,'SELECT');
  // psql interpolates :name outside quotes; casts and literals are left alone.
  assert.deepEqual(C.prepareSql('DELETE FROM t WHERE id = :id;','postgresql').checks.map(c=>c.code),['psql-variable']);
  assert.deepEqual(C.prepareSql("DELETE FROM t WHERE a::text = ':id' AND b = 1;",'postgresql').checks,[]);
  assert.deepEqual(C.prepareSql("SELECT :'name' FROM t;",'postgresql').checks.map(c=>c.code),['psql-variable']);
 });
 await test('Each DB has independent connect, check and finish steps labeled with the paste target',()=>{
  assert.deepEqual(Object.keys(D.dbs),['cubrid','mariadb','oracle','postgresql']);
  const prompts={cubrid:'csql>',mariadb:'MariaDB>',oracle:'SQL>',postgresql:'psql =>'};
  for(const db of Object.keys(D.dbs)){
   assert.equal(D.dbs[db].prompt,prompts[db]);
   for(const step of ['connect','check','finish'])assert.ok(D.commands.some(c=>c.db===db&&c.step===step),db+' '+step);
   for(const c of D.commands.filter(c=>c.db===db&&c.step==='connect')){
    assert.equal(c.shell,'bash');assert.equal(c.where,'Linux 셸 · $');
    // Passwords are typed at the client prompt, never placed on the command line.
    assert.ok(!/(-p\S|--password|PGPASSWORD|\}\}\/|IDENTIFIED)/.test(c.command),c.id);
    const params=Object.fromEntries(Object.keys(D.params).map(k=>[k,'value_'+k.toLowerCase()]));
    const filled=C.fillCommand(c.command,params,D.params,c.shell);
    assert.ok(!/\{\{/.test(filled)&&filled.includes("'value_dbuser'"),c.id);
    assert.throws(()=>C.fillCommand(c.command,{...params,DBUSER:'-x',DBNAME:'-x',DBTARGET:'-x'},D.params,c.shell),c.id);
   }
   for(const c of D.commands.filter(c=>c.db===db&&c.step&&c.step!=='connect'))assert.ok(c.where.startsWith(prompts[db]),c.id+' '+c.where);
  }
  for(const c of D.commands){assert.ok(c.where,c.id);if(['sql','csql','sqlplus','psql','mariadb'].includes(c.shell))assert.ok(!/\{\{[A-Z_]+\}\}/.test(c.command),c.id);}
  // Oracle's default EXIT commits; the catalog's exit step must roll back explicitly.
  assert.ok(D.commands.some(c=>c.db==='oracle'&&c.step==='finish'&&c.command==='EXIT ROLLBACK'));
 });
 await test('Usage guide examples show what the tools actually produce',()=>{
  const G=D.guides,ex=id=>G[id].example,f=id=>ex(id).fill;
  assert.deepEqual(Object.keys(G),['home','favorites',...D.tools.map(t=>t.id),'settings']);
  for(const [id,g] of Object.entries(G)){assert.ok(g.when&&g.steps.length>=3&&g.cautions.length,id);const e=g.example;if(e&&(e.fill||e.click)){assert.ok(Array.isArray(e.click),id);for(const v of Object.values(e.fill||{}))assert.ok(['string','boolean'].includes(typeof v),id);}}
  const sql=f('sqlformat')['sqlformat-input'];
  for(const db of Object.keys(D.dbs))assert.equal(C.prepareSql(sql,db).sql,ex('sqlformat').output,db);
  assert.equal(C.formatJson(f('json')['json-input'],false,Number(f('json')['json-indent'])),ex('json').output);
  assert.equal(C.codec(f('codec')['codec-input'],f('codec')['codec-mode'],'encode',f('codec')['codec-plus']),ex('codec').output);
  const t=f('text');assert.equal(C.cleanText(t['text-input'],{trim:t['text-trim'],empty:t['text-empty'],unique:t['text-unique'],sort:t['text-sort'],eol:t['text-eol']}),ex('text').output);
  const l=f('logs');assert.equal(C.filterLogs(l['logs-input'],l['logs-include'],l['logs-exclude'],Number(l['logs-context']),l['logs-case']).text,ex('logs').output);
  const s=f('sql');assert.equal(C.makeSql(s['sql-input'],s['sql-column'],s['sql-kind'],Number(s['sql-chunk']),s['sql-unique'],s['sql-trim']).sql,ex('sql').output);
  const ms=C.timestamp(f('time')['time-epoch'],f('time')['time-unit']);
  assert.equal('UTC        '+C.formatTime(ms,0)+' UTC+00:00\nKST        '+C.formatTime(ms,540)+' UTC+09:00\nUnix 초    '+String(ms/1000)+'\nUnix ms    '+String(ms)+'\nISO 8601   '+new Date(ms).toISOString(),ex('time').output);
  const m=f('chmod');assert.equal('chmod '+m['chmod-octal']+' -- '+C.shellQuote(m['chmod-path']),ex('chmod').expect);assert.equal(ex('chmod').output,C.permission(m['chmod-octal'])+'\n'+ex('chmod').expect);
  const c=f('cron'),off=Number(c['cron-zone']),r=C.nextCron(c['cron-expression'],C.dateInputToMs(c['cron-start'],off),off);
  assert.equal(r.times.map((t,i)=>(i+1)+'.  '+C.formatTime(t,off).slice(0,19)+'  KST  ('+['일','월','화','수','목','금','토'][new Date(t+off*60000).getUTCDay()]+')').join('\n'),ex('cron').output);
  const h=f('hash');assert.equal(createHash('sha256').update(h['hash-input']).digest('hex'),ex('hash').expect);assert.equal(h['hash-expected'],ex('hash').expect);
  const d=C.diffLines(f('diff')['diff-before'],f('diff')['diff-after'],false),n=type=>d.filter(x=>x.type===type).length;
  assert.equal(n('add')+'추가'+n('del')+'삭제'+n('same')+'동일',ex('diff').expect);
  assert.equal(C.fillCommand(D.commands.find(x=>x.id==='cmd-044').command,{PORT:'8111'},D.params,'bash'),ex('commands').output.split('\n')[0]);
 });
 await test('Command catalog unique and supported metadata',()=>{assert.ok(D.commands.length>=93);assert.equal(new Set(D.commands.map(x=>x.id)).size,D.commands.length);for(const c of D.commands){assert.ok(['read','load','change'].includes(c.risk));assert.ok(['user','limited'].includes(c.permission));assert.ok(c.title&&c.note&&c.command);}});
 await test('All command placeholders resolved; Docker Go template retained',()=>{for(const c of D.commands){const params=Object.fromEntries(Object.entries(D.params).map(([k,v])=>[k,v.default||'1234']));const out=C.fillCommand(c.command,params,D.params,c.shell);assert.ok(!/\{\{[A-Z_]+\}\}/.test(out));}assert.ok(D.commands.find(c=>c.id==='cmd-080').command.includes('{{.State.Status}}'));});
 const report={environment:process.version,total:pass+fail,passed:pass,failed:fail,results};fs.writeFileSync(path.join(__dirname,'core-results.json'),JSON.stringify(report,null,2));console.log(`Core: ${pass} passed, ${fail} failed`);process.exitCode=fail?1:0;
})();
