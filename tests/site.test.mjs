import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve('dist'),base='/lvglplus-website/';
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);out.push(...e.isDirectory()?await walk(p):[p]);}return out;}
test('every bilingual page and internal URL resolves under project Pages base',async()=>{
 const files=(await walk(root)).filter(f=>f.endsWith('.html'));assert.equal(files.length,19);
 for(const file of files){const html=await readFile(file,'utf8');assert.match(html,/<html[^>]+lang="(?:zh-CN|en)"/);assert.match(html,/<title>[^<]+<\/title>/);assert.match(html,/rel="canonical"/);
 for(const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){
 const url=match[1].split('#')[0].split('?')[0];if(/^(?:https?:|data:|mailto:)/.test(url))continue;
 assert.ok(url.startsWith(base),`${file}: unexpected base ${url}`);let target=path.join(root,decodeURIComponent(url.slice(base.length)));if(url.endsWith('/'))target=path.join(target,'index.html');assert.ok((await stat(target)).isFile(),`${file}: ${url}`);
 }
 }
});
test('committed runtime matches recorded source provenance',async()=>{
 const p=JSON.parse(await readFile('public/demo/provenance.json','utf8'));assert.match(p.commit,/^[a-f0-9]{40}$/);assert.equal(p.lvgl,'9.5.0');assert.equal(p.irVersion,2);
 for(const f of p.files){const bytes=await readFile('public/demo/'+f.path);assert.equal(bytes.length,f.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);}
 const wasm=await readFile('public/demo/lvp.wasm');assert.equal(wasm.subarray(0,4).toString('hex'),'0061736d');
});
test('actual C/WASM core evaluates the instrument view model',async()=>{
 const {default:create}=await import('../public/demo/lvp.js');
 const m=await create({wasmBinary:await readFile('public/demo/lvp.wasm')});
 const load=m.cwrap('lvp_preview_load','number',['number','number']);
 const bytes=await readFile('public/demo/vehicle.lvp'),ptr=m._malloc(bytes.length);m.HEAPU8.set(bytes,ptr);assert.equal(load(ptr,bytes.length),0);m._free(ptr);
 const signals=JSON.parse(await readFile('public/demo/model.json')).signals;
 const set=m.cwrap('lvp_preview_set','number',['number','number','number','number']);
 const get=m.cwrap('lvp_preview_number','number',['number']);
 const quality=m.cwrap('lvp_preview_quality','number',['number']);
 const index=name=>signals.findIndex(s=>s.name===name);
 assert.equal(set(index('vehicle.speed'),50,100,0),0);
 assert.ok(Math.abs(get(index('vm.speedMph'))-31.06855)<0.001);
 set(index('vehicle.speed'),50,200,3);assert.equal(quality(index('vehicle.speed')),3);
 m.cwrap('lvp_preview_close',null,[])();
});
