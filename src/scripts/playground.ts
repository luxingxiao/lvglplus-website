// SPDX-License-Identifier: Apache-2.0
// This module injects telemetry; all bindings, expressions, and pixels come from C/LVGL.
const root=document.querySelector<HTMLElement>('[data-demo]');
if(root){
 const en=root.dataset.lang==='en',base=root.dataset.base!,load=root.querySelector<HTMLButtonElement>('.load-demo')!,status=root.querySelector<HTMLElement>('.demo-status')!,canvas=root.querySelector<HTMLCanvasElement>('canvas')!,fallback=root.querySelector<HTMLImageElement>('.instrument-fallback')!,cover=root.querySelector<HTMLElement>('.demo-load-cover')!,mode=root.querySelector<HTMLSelectElement>('#demo-mode')!,pause=root.querySelector<HTMLButtonElement>('.demo-pause')!,offlineButton=root.querySelector<HTMLButtonElement>('.demo-offline')!,speed=root.querySelector<HTMLInputElement>('#demo-speed')!,soc=root.querySelector<HTMLInputElement>('#demo-soc')!;
 const speedOutput=root.querySelector<HTMLOutputElement>('#demo-speed-output')!,socOutput=root.querySelector<HTMLOutputElement>('#demo-soc-output')!;
 let m:any,api:Record<string,(...args:any[])=>any>={},signals:{name:string;type:string;initial:unknown;derived?:unknown}[]=[],running=false,offline=false,ready=false,raf=0,epoch=0,lastInject=0,lastPaint=0,elapsed=0,lastTime=0,visible=true;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const say=(zh:string,english:string)=>status.textContent=en?english:zh;
 const find=(name:string)=>signals.findIndex(s=>s.name===name);
 const write=(name:string,value:number,now:number,quality=0)=>{const i=find(name);if(i>=0)api.set(i,value,now,quality);};
 function seed(now:number){api.begin();for(let i=0;i<signals.length;i++){const s=signals[i];if(s.derived)continue;if(s.type==='string')api.set_text(i,String(s.initial),now,offline?3:0);else api.set(i,Number(s.initial),now,offline?3:0);}api.end();}
 function inject(now:number){
  if(!ready)return;const replay=mode.value==='replay',manual=mode.value==='manual';
  const value=manual?Number(speed.value):replay?[0,20,48,78,112,65,25,0][Math.floor(elapsed/1400)%8]:Math.round(68+34*Math.sin(elapsed/3800));
  const charge=manual?Number(soc.value):replay?78:82;
  api.begin();write('vehicle.speed',value,now,offline?3:0);write('battery.soc',charge,now,offline?3:0);write('motor.temperature',Math.round(40+value/3),now,offline?3:0);write('vehicle.trip',124.6+elapsed/3600000*value,now,offline?3:0);write('lights.left',manual?0:Number(Math.floor(elapsed/700)%2===0&&elapsed%12000<4200),now,offline?3:0);write('lights.right',0,now,offline?3:0);write('lights.highBeam',0,now,offline?3:0);write('vehicle.alarm',value>125?1:0,now,offline?3:0);api.end();speed.value=String(value);soc.value=String(charge);speedOutput.value=String(value);socOutput.value=String(charge);
 }
 function paint(now:number){api.tick(now);const p=api.pixels(),heap=m.HEAPU8,context=canvas.getContext('2d')!,image=context.createImageData(800,480);for(let i=0;i<image.data.length;i+=4){image.data[i]=heap[p+i+2];image.data[i+1]=heap[p+i+1];image.data[i+2]=heap[p+i];image.data[i+3]=255;}context.putImageData(image,0,0);}
 function frame(now:number){if(!ready)return;if(visible&&!document.hidden){if(running)elapsed+=Math.min(100,Math.max(0,now-lastTime));if(now-lastInject>120){inject(now);lastInject=now;}if(now-lastPaint>33){paint(now);lastPaint=now;}}lastTime=now;raf=requestAnimationFrame(frame);}
 const sync=()=>{pause.textContent=running?(en?'Pause':'暂停'):(en?'Play':'播放');pause.setAttribute('aria-pressed',String(!running));offlineButton.setAttribute('aria-pressed',String(offline));offlineButton.textContent=offline?(en?'Reconnect':'恢复连接'):(en?'Go offline':'模拟断线');say(offline?'通信失效 · 无效数据不会被当作零值':'正在运行真实 LVGL / C 核心',offline?'Disconnected · invalid data is never treated as zero':'Running the real LVGL / C core');};
 load.addEventListener('click',async()=>{
  load.disabled=true;say('正在加载 C/WASM 运行时…','Loading the C/WASM runtime…');
  try{
   const runtimeResponse=await fetch(base+'demo/lvp.js');if(!runtimeResponse.ok)throw Error('Runtime unavailable');
   const runtimeURL=URL.createObjectURL(new Blob([await runtimeResponse.text()],{type:'text/javascript'}));
   let create;try{({default:create}=await import(/* @vite-ignore */ runtimeURL));}finally{URL.revokeObjectURL(runtimeURL);}
   m=await create({locateFile:(name:string)=>base+'demo/'+name});
   const signatures:Record<string,[string|null,string[]]>={load:['number',['number','number']],error:['string',[]],tick:[null,['number']],pixels:['number',[]],set:['number',['number','number','number','number']],set_text:['number',['number','string','number','number']],begin:[null,[]],end:[null,[]],pointer:[null,['number','number','number']],number:['number',['number']],quality:['number',['number']],close:[null,[]]};
   for(const [name,[ret,args]]of Object.entries(signatures))api[name]=m.cwrap('lvp_preview_'+name,ret,args);
   const [packageResponse,modelResponse]=await Promise.all([fetch(base+'demo/vehicle.lvp'),fetch(base+'demo/model.json')]);if(!packageResponse.ok||!modelResponse.ok)throw Error('Demo assets unavailable');
   signals=(await modelResponse.json()).signals;const bytes=new Uint8Array(await packageResponse.arrayBuffer()),ptr=m._malloc(bytes.length);try{m.HEAPU8.set(bytes,ptr);if(api.load(ptr,bytes.length))throw Error(api.error());}finally{m._free(ptr);}
   ready=true;root.dataset.ready='true';running=!reduced.matches;mode.disabled=false;pause.disabled=false;offlineButton.disabled=false;speed.disabled=false;soc.disabled=false;mode.value=reduced.matches?'manual':'simulation';epoch=performance.now();lastTime=epoch;seed(epoch);inject(epoch);paint(epoch);canvas.hidden=false;fallback.hidden=true;cover.hidden=true;sync();raf=requestAnimationFrame(frame);
  }catch(e){say('加载失败，请重试；静态 LVGL 画面仍可查看。','Could not load the demo. Retry or explore the native LVGL image.');load.disabled=false;load.textContent=en?'Retry demo':'重新加载';root.dataset.error=(e as Error).message;}
 });
 mode.addEventListener('change',()=>{elapsed=0;running=mode.value!=='manual'&&!reduced.matches;inject(performance.now());sync();});
 pause.addEventListener('click',()=>{running=!running;if(running&&mode.value==='manual')mode.value='simulation';sync();});
 for(const input of [speed,soc])input.addEventListener('input',()=>{mode.value='manual';running=false;inject(performance.now());sync();});
 offlineButton.addEventListener('click',()=>{offline=!offline;inject(performance.now());sync();});
 for(const type of ['pointerdown','pointerup','pointermove','pointercancel'])canvas.addEventListener(type,event=>{if(!ready)return;const e=event as PointerEvent;if(type==='pointermove'&&!e.buttons)return;const r=canvas.getBoundingClientRect();api.pointer(Math.round((e.clientX-r.left)*800/r.width),Math.round((e.clientY-r.top)*480/r.height),type==='pointerdown'||(type==='pointermove'&&e.buttons)?1:0);if(type==='pointerdown')canvas.setPointerCapture(e.pointerId);});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(root);
 reduced.addEventListener('change',()=>{if(reduced.matches){running=false;mode.value='manual';sync();}});
 window.addEventListener('pagehide',event=>{if(!event.persisted){cancelAnimationFrame(raf);if(ready)api.close();ready=false;}});
}
