// SPDX-License-Identifier: Apache-2.0
// Only transport input and copy the framebuffer here. All simulation, commands and pixels run in C.
const root=document.querySelector<HTMLElement>('[data-energy]');
if(root){
 const en=root.dataset.lang==='en',base=root.dataset.base!+'demo/energy/';
 const launch=root.querySelector<HTMLButtonElement>('.energy-launch')!,canvas=root.querySelector<HTMLCanvasElement>('canvas')!,poster=root.querySelector<HTMLImageElement>('.energy-poster')!,cover=root.querySelector<HTMLElement>('.energy-cover')!,status=root.querySelector<HTMLElement>('.energy-status')!;
 const buttons=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-command]'));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let m:any,api:Record<string,(...args:any[])=>any>={},signals:{name:string}[]=[],ready=false,raf=0,clock=0,last=0,lastPaint=0,lastRead=0,visible=true;
 let image:ImageData,context:CanvasRenderingContext2D;
 const get=(name:string)=>api.number(signals.findIndex(s=>s.name===name));
 const say=(zh:string,english:string)=>{const value=en?english:zh;if(status.textContent!==value)status.textContent=value;};
 function sync(){
  const running=Boolean(get('running')),stress=Boolean(get('stress')),economy=Boolean(get('economy')),rate=get('rate'),direction=get('direction');
  Object.assign(root!.dataset,{running:String(running),stress:String(stress),economy:String(economy),rate:String(rate),direction:String(direction),clock:String(get('plant.ms'))});
  const pressed:Record<string,boolean>={pause:!running,speed:rate===2,reverse:direction<0,stress,quality:economy};
  for(const b of buttons)if(b.dataset.command!=='reset')b.setAttribute('aria-pressed',String(pressed[b.dataset.command!]));
  const readings:Record<string,string>={power:Math.round(get('power'))+' kW',temperature:Math.round(get('temperature'))+' °C',rpm:Math.round(get('rpm'))+' RPM',clock:Math.round(get('plant.ms'))+' ms'};
  for(const [key,value]of Object.entries(readings))root!.querySelector<HTMLOutputElement>('[data-reading="'+key+'"]')!.value=value;
  say((running?'运行中':'已暂停')+' · '+rate+'× · '+(stress?'过载工况':'正常工况')+' · '+(economy?'草图精度':'精细模式'),(running?'Running':'Paused')+' · '+rate+'× · '+(stress?'Overload':'Normal load')+' · '+(economy?'Draft detail':'High detail'));
 }
 function paint(){
  const p=api.pixels(),heap=m.HEAPU8;
  for(let i=0;i<image.data.length;i+=4){image.data[i]=heap[p+i+2];image.data[i+1]=heap[p+i+1];image.data[i+2]=heap[p+i];image.data[i+3]=255;}
  context.putImageData(image,0,0);
 }
 function dispose(){cancelAnimationFrame(raf);ready=false;root!.dataset.ready='false';try{api.close?.();}finally{api={};m=undefined;}}
 function fail(error:unknown){
  dispose();canvas.hidden=true;poster.hidden=false;cover.hidden=false;buttons.forEach(b=>b.disabled=true);launch.disabled=false;launch.textContent=en?'Retry preview':'重新加载';root!.dataset.error=String(error instanceof Error?error.message:error);
  say('预览加载或运行失败。可重试，或查看原生 LVGL 截图。','Preview unavailable. Retry or view the native LVGL screenshot.');
 }
 function send(command:string){
  const id=api.command(command);if(id<=0||api.command_state(id)!==1)throw Error('Command failed: '+command);
  api.tick(clock);paint();sync();
 }
 function frame(now:number){
  if(!ready)return;
  try{
   if(visible&&!document.hidden){clock+=Math.min(100,Math.max(0,now-last));if(now-lastPaint>=33){api.tick(clock);paint();lastPaint=now;}if(now-lastRead>=250){sync();lastRead=now;}}
   last=now;raf=requestAnimationFrame(frame);
  }catch(error){fail(error);}
 }
 launch.addEventListener('click',async()=>{
  launch.disabled=true;say('正在加载真实 LVGL/WASM…','Loading real LVGL/WASM…');delete root!.dataset.error;
  try{
   const {default:create}=await import(/* @vite-ignore */ new URL(base+'lvp.js',location.href).href);
   m=await create({locateFile:(name:string)=>base+name});
   const signatures:Record<string,[string|null,string[]]>={load:['number',['number','number']],error:['string',[]],tick:[null,['number']],pixels:['number',[]],width:['number',[]],height:['number',[]],number:['number',['number']],command:['number',['string']],command_state:['number',['number']],action:['number',['string']],pointer:[null,['number','number','number']],close:[null,[]]};
   for(const [name,[ret,args]]of Object.entries(signatures))api[name]=m.cwrap('lvp_preview_'+name,ret,args);
   const [packageResponse,modelResponse]=await Promise.all([fetch(base+'ui.lvp'),fetch(base+'model.json')]);
   if(!packageResponse.ok||!modelResponse.ok)throw Error('Energy demo assets unavailable');
   signals=(await modelResponse.json()).signals;
   const bytes=new Uint8Array(await packageResponse.arrayBuffer()),p=m._malloc(bytes.length);
   try{m.HEAPU8.set(bytes,p);if(api.load(p,bytes.length))throw Error(api.error());}finally{m._free(p);}
   canvas.width=api.width();canvas.height=api.height();
   if(canvas.width!==1024||canvas.height!==600)throw Error('Unexpected demo dimensions');
   context=canvas.getContext('2d')!;image=context.createImageData(canvas.width,canvas.height);clock=0;api.tick(0);
   if(reduced.matches)send('pause');
   paint();sync();ready=true;root!.dataset.ready='true';buttons.forEach(b=>b.disabled=false);canvas.hidden=false;poster.hidden=true;cover.hidden=true;last=performance.now();lastPaint=last;lastRead=last;raf=requestAnimationFrame(frame);
  }catch(error){fail(error);}
 });
 for(const b of buttons)b.addEventListener('click',()=>{if(ready)try{send(b.dataset.command!);}catch(error){fail(error);}});
 canvas.addEventListener('keydown',e=>{
  if(!ready||e.altKey||e.metaKey||e.ctrlKey)return;
  const action:Record<string,string>={Enter:'confirm',ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Escape:'back'};
  if(action[e.key]){e.preventDefault();try{const id=api.action(action[e.key]);if(id<=0||api.command_state(id)!==1)throw Error('Input failed');api.tick(clock);paint();sync();}catch(error){fail(error);}}
 });
 for(const type of ['pointerdown','pointerup','pointermove','pointercancel'])canvas.addEventListener(type,event=>{
  if(!ready)return;const e=event as PointerEvent;if(type==='pointermove'&&!e.buttons)return;
  e.preventDefault();const r=canvas.getBoundingClientRect();
  try{
   if(type==='pointerdown'){canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);}
   api.pointer(Math.round((e.clientX-r.left)*canvas.width/r.width),Math.round((e.clientY-r.top)*canvas.height/r.height),type==='pointerdown'||(type==='pointermove'&&e.buttons)?1:0);
   // Process short taps even if down/up both arrive between animation frames.
   clock+=40;api.tick(clock);paint();sync();
  }catch(error){fail(error);}
 });
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'150px'}).observe(root);
 reduced.addEventListener('change',()=>{if(ready&&reduced.matches&&get('running'))try{send('pause');}catch(error){fail(error);}});
 window.addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
}
