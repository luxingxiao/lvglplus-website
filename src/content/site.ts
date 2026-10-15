export type Lang='zh'|'en';
export const repo='https://github.com/luxingxiao/lvglplus';
export const webRepo='https://github.com/luxingxiao/lvglplus-website';
export const base='/lvglplus-website/';
export const home=(lang:Lang)=>base+(lang==='en'?'en/':'');
export const docLink=(lang:Lang,slug:string)=>home(lang)+'docs/'+slug+'/';
export const tr=(lang:Lang,zh:string,en:string)=>lang==='zh'?zh:en;
export const quickstart=`git clone https://github.com/luxingxiao/lvglplus.git
cd lvglplus
pnpm install
python3 scripts/bootstrap.py --wasm
pnpm build:wasm && pnpm build
pnpm dev`;
