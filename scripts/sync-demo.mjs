// SPDX-License-Identifier: Apache-2.0
// Run only when deliberately updating the public demo from a verified source checkout.
import {cp,writeFile,readFile,mkdir} from 'node:fs/promises';import path from 'node:path';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const root=path.resolve(process.env.LVGLPLUS_SOURCE??'../lvglplus');
const {loadProject}=await import(pathToFileURL(path.join(root,'packages/cli/dist/project.js')).href);
const {encodePackage}=await import(pathToFileURL(path.join(root,'packages/compiler/dist/index.js')).href);
const project=await loadProject(path.join(root,'examples/vehicle'));
await mkdir('public/demo',{recursive:true});await mkdir('public/images',{recursive:true});
for(const name of ['lvp.js','lvp.wasm'])await cp(path.join(root,'packages/studio/dist/runtime',name),'public/demo/'+name);
await writeFile('public/demo/vehicle.lvp',encodePackage(project.ir));
await writeFile('public/demo/model.json',JSON.stringify({signals:project.ir.signals},null,2)+'\n');
await cp(path.join(root,'examples/vehicle/baselines/parked.png'),'public/images/instrument.png');
await cp(path.join(root,'.deps/lvgl/LICENCE.txt'),'public/demo/LVGL-LICENSE.txt');
await cp(path.join(root,'LICENSE'),'public/demo/LVGLPLUS-LICENSE.txt');
const names=['lvp.js','lvp.wasm','vehicle.lvp','model.json'];
const files=[];for(const file of names){const b=await readFile('public/demo/'+file);files.push({path:file,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});}
await writeFile('public/demo/provenance.json',JSON.stringify({repository:'https://github.com/luxingxiao/lvglplus',commit:execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),lvgl:'9.5.0',irVersion:project.ir.formatVersion,updated:new Date().toISOString().slice(0,10),files},null,2)+'\n');
console.log('Synced actual C/WASM runtime, compiled package and native LVGL screenshot.');
