// SPDX-License-Identifier: Apache-2.0
const menu=document.querySelector<HTMLButtonElement>('.mobile-menu'),nav=document.querySelector<HTMLElement>('#primary-nav');
function closeMenu(){menu?.setAttribute('aria-expanded','false');nav?.classList.remove('open');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav?.classList.toggle('open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();if(document.activeElement&&nav?.contains(document.activeElement))menu?.focus();}});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
let timer:number;document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const value=button.dataset.copy??'';const toast=document.querySelector<HTMLElement>('.toast')!;try{await navigator.clipboard.writeText(value);toast.textContent=document.documentElement.lang==='zh-CN'?'命令已复制':'Command copied';toast.classList.add('visible');clearTimeout(timer);timer=window.setTimeout(()=>toast.classList.remove('visible'),2400);}catch{toast.textContent=document.documentElement.lang==='zh-CN'?'无法访问剪贴板，请选中命令手动复制。':'Clipboard unavailable. Select and copy the command.';toast.classList.add('visible');}}));
