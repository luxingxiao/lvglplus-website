// SPDX-License-Identifier: Apache-2.0
// Explicit maintainer operation. The normal site build only uses committed artifacts.
import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
if(Number(process.versions.node.split('.')[0])!==24)throw Error('Use Node.js 24 for the reviewed SDK visual baselines.');
const root=path.resolve(process.env.LVGLPLUS_SOURCE??'../lvglplus');
if(execFileSync('git',['-C',root,'status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim()) throw Error('SDK checkout must be clean before exporting public artifacts');
const commit=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const {loadProject}=await import(pathToFileURL(path.join(root,'packages/cli/dist/project.js')).href);
const {encodePackage}=await import(pathToFileURL(path.join(root,'packages/compiler/dist/index.js')).href);
const project=await loadProject(path.join(root,'examples/energy-console'));
if(project.manifest.native || project.manifest.fonts)throw Error('This demo must use the shared runtime without project C/fonts');
// Recheck the source's reviewed native baselines before exporting.
execFileSync(process.execPath,[path.join(root,'packages/cli/dist/main.js'),'test',project.root,'--json'],{cwd:root,stdio:'inherit'});
const out='public/demo/energy';await mkdir(out+'/source',{recursive:true});
for(const name of ['lvp.js','lvp.wasm'])await cp(path.join(root,'packages/studio/dist/runtime',name),out+'/'+name);
await writeFile(out+'/ui.lvp',encodePackage(project.ir));
await writeFile(out+'/model.json',JSON.stringify({signals:project.ir.signals},null,2)+'\n');
await cp(path.join(project.root,'baselines/initial.png'),out+'/poster.png');
for(const name of ['dashboard.xml','model.xml','plus.project.json'])await cp(path.join(project.root,name),out+'/source/'+name);
await cp(path.join(root,'LICENSE'),out+'/LVGLPLUS-LICENSE.txt');
await cp(path.join(root,'.deps/lvgl/LICENCE.txt'),out+'/LVGL-LICENSE.txt');
// CLI test renders the draft case last; generate initial frame separately for its RGB hash.
execFileSync(process.execPath,[path.join(root,'packages/cli/dist/main.js'),'screenshot',project.root,'--at','0','--out',path.join(root,'build/energy-website-poster.png')],{cwd:root,stdio:'ignore'});
const initial=await readFile(path.join(project.root,'.lvglplus/results/frame.ppm'));
const nativePng=await readFile(path.join(root,'build/energy-website-poster.png'));
if(!nativePng.equals(await readFile(out+'/poster.png')))throw Error('Initial poster does not match the native renderer');
const names=['lvp.js','lvp.wasm','ui.lvp','model.json','poster.png','source/dashboard.xml','source/model.xml','source/plus.project.json','LVGLPLUS-LICENSE.txt','LVGL-LICENSE.txt'];
const files=[];for(const file of names){const b=await readFile(out+'/'+file);files.push({path:file,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});}
await writeFile(out+'/provenance.json',JSON.stringify({repository:'https://github.com/luxingxiao/lvglplus',commit,example:'examples/energy-console',lvgl:'9.5.0',irVersion:project.ir.formatVersion,sdkAbi:2,width:1024,height:600,updated:new Date().toISOString().slice(0,10),initialRgbSha256:createHash('sha256').update(initial.subarray(initial.indexOf(Buffer.from('\n255\n'))+5)).digest('hex'),files},null,2)+'\n');
console.log('Synced independent energy UI, actual C/WASM runtime, native poster, source and SHA-256 provenance.');
