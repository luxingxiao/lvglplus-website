import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir=new URL('../public/demo/energy/',import.meta.url);
const hash=b=>createHash('sha256').update(b).digest('hex');
test('energy artifacts have pinned source provenance and complete hashes',async()=>{
 const p=JSON.parse(await readFile(new URL('provenance.json',dir),'utf8'));
 assert.match(p.commit,/^[a-f0-9]{40}$/);assert.equal(p.example,'examples/energy-console');assert.equal(p.irVersion,3);assert.equal(p.sdkAbi,2);assert.equal(p.lvgl,'9.5.0');
 for(const f of p.files){assert(!f.path.includes('..'));const b=await readFile(new URL(f.path,dir));assert.equal(b.length,f.bytes);assert.equal(hash(b),f.sha256,f.path);}
 const manifest=JSON.parse(await readFile(new URL('source/plus.project.json',dir),'utf8'));assert.equal(manifest.native,undefined);
});
test('actual energy WASM matches native pixels and executes model commands',async()=>{
 const {default:create}=await import('../public/demo/energy/lvp.js');
 const m=await create({wasmBinary:await readFile(new URL('lvp.wasm',dir))});
 const f=(n,r,args=[])=>m.cwrap('lvp_preview_'+n,r,args);
 const bytes=await readFile(new URL('ui.lvp',dir)),p=m._malloc(bytes.length);
 try{
  m.HEAPU8.set(bytes,p);assert.equal(f('load','number',['number','number'])(p,bytes.length),0);
  const tick=f('tick',null,['number']),get=f('number','number',['number']),command=f('command','number',['string']),state=f('command_state','number',['number']);
  const signals=JSON.parse(await readFile(new URL('model.json',dir),'utf8')).signals;
  const read=name=>get(signals.findIndex(s=>s.name===name));
  tick(0);assert.equal(f('width','number')(),1024);assert.equal(f('height','number')(),600);
  const ptr=f('pixels','number')(),rgb=Buffer.alloc(1024*600*3);
  for(let i=0,j=0;i<rgb.length;i+=3,j+=4){rgb[i]=m.HEAPU8[ptr+j+2];rgb[i+1]=m.HEAPU8[ptr+j+1];rgb[i+2]=m.HEAPU8[ptr+j];}
  assert.equal(hash(rgb),JSON.parse(await readFile(new URL('provenance.json',dir),'utf8')).initialRgbSha256);
  const send=n=>assert.equal(state(command(n)),1,n);
  tick(1000);assert.equal(read('plant.ms'),1000);send('pause');tick(2000);assert.equal(read('plant.ms'),1000);assert.equal(read('rpm'),0);
  send('stress');assert.equal(read('load'),94);assert.equal(read('temperature'),86);assert.equal(read('warning'),1);
  send('speed');send('reverse');send('quality');assert.equal(read('rate'),2);assert.equal(read('direction'),-1);assert.equal(read('economy'),1);
  send('reset');tick(2000);assert.equal(read('plant.ms'),0);assert.equal(read('load'),62);assert.equal(read('running'),1);
 }finally{m._free(p);f('close',null)();}
});
