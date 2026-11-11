'use strict';

type Point3 = [x: number, y: number, z: number];
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const form=document.querySelector<HTMLFormElement>('#lead-form')!;
const whatsapp='https://wa.me/5571992390037?text=';
form.addEventListener('submit',e=>{
  e.preventDefault();
  const fields=new FormData(form);
  const product=fields.get('produto') as string;
  const room=String(fields.get('ambiente')||'').trim();
  const interest=product==='Quero orientação'?'Preciso de orientação para escolher os materiais.':'Tenho interesse em '+product.toLowerCase()+'.';
  const message='Olá, equipe Tríadee! Meu nome é '+String(fields.get('nome')).trim()+'. Vi os projetos no site e gostaria de solicitar um orçamento. '+interest+(room?' O ambiente é: '+room+'.':'')+' Podemos conversar?';
  window.open(whatsapp+encodeURIComponent(message),'_blank','noopener,noreferrer');
});
document.querySelectorAll<HTMLElement>('[data-product]').forEach(a=>a.addEventListener('click',()=>{
  form.querySelectorAll<HTMLInputElement>('input[name="produto"]').forEach(r=>r.checked=r.value===a.dataset.product);
}));
if(!motion.matches&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}
  }),{threshold:.15});
  document.querySelectorAll('.case,.process li,.showroom-copy').forEach(node=>observer.observe(node));
}
const button=document.querySelector<HTMLButtonElement>('#sculpture')!;
const canvas=button.querySelector('canvas')!;
const stage=document.querySelector('.hero-visual')!;
const masthead=document.querySelector('.masthead')!;
const ctx=canvas.getContext('2d')!;
let contour: [number, number][]=[];
let raf=0,spinAt=-Infinity,tiltX=0,tiltY=0,x=.15,y=-.62,lastX=0,lastY=0,pointerId: number | null=null,moved=false,pauseOffscreen=false;
const TAU=2*Math.PI;
let easedProgress=0;
function queue(){if(!raf&&!motion.matches&&!pauseOffscreen&&contour.length)raf=requestAnimationFrame(draw);}
function draw(now: number){
  raf=0;
  if(!contour.length||motion.matches||pauseOffscreen)return;
  const width=canvas.width,height=canvas.height;
  const t=Math.max(0,Math.min(1,(now-spinAt)/1320));
  const rotation=t===1?0:TAU*(1-(1-t)**3);
  const bounds=stage.getBoundingClientRect();
  const start=Math.min(window.innerHeight*.54,bounds.top+window.scrollY);
  const progress=Math.min(1,Math.max(0,(start-bounds.top)/(bounds.height*.62)));
  easedProgress+=(progress-easedProgress)*.17;
  const pitch=(x+=(tiltX+.16-x)*.14)+Math.sin(t*Math.PI)*.17+easedProgress*.25;
  const yaw=(y+=(tiltY-.62-y)*.14)+rotation+easedProgress*1.28;
  const cx=Math.cos(pitch),sx=Math.sin(pitch),cy=Math.cos(yaw),sy=Math.sin(yaw);
  const rotate=(px: number,py: number,pz: number): Point3=>{const u=px*cy+pz*sy,z=-px*sy+pz*cy;return [u,py*cx-z*sx,py*sx+z*cx];};
  const depth=17,scale=Math.min(width,height)*.0124;
  const project=(p: Point3)=>{const factor=scale*150/(150-p[2]);return [width/2+p[0]*factor,height/2+p[1]*factor];};
  const n=contour.length;
  ctx.clearRect(0,0,width,height);
  const fill=(points: Point3[],paint: string | CanvasGradient,stroke?: string)=>{ctx.beginPath();points.forEach((p,i)=>{const [a,b]=project(p);if(i)ctx.lineTo(a,b);else ctx.moveTo(a,b);});ctx.closePath();ctx.fillStyle=paint;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=Math.max(1,width/420);ctx.stroke();}};
  const faceFront=rotate(0,0,1)[2]>=0;
  {
    const front=contour.map(([a,b])=>rotate(a,b,depth));
    const back=contour.map(([a,b])=>rotate(a,b,-depth));
    const canvasRect=canvas.getBoundingClientRect();
    const projectedY=front.concat(back).map(point=>canvasRect.top+project(point)[1]*canvasRect.height/height);
    const top=Math.min(...projectedY);
    const bottom=Math.max(...projectedY);
    const visibleTop=Math.max(top,bounds.top,masthead.getBoundingClientRect().bottom,0);
    const visibleBottom=Math.min(bottom,bounds.bottom,window.innerHeight);
    const visibleRatio=Math.max(0,Math.min(1,(visibleBottom-visibleTop)/(bottom-top)));
    canvas.style.opacity=String(visibleRatio>0?.08+.92*visibleRatio:0);
    const sides=[];
    for(let i=0;i<n;i++){
      const j=(i+1)%n,dx=contour[j][0]-contour[i][0],dy=contour[j][1]-contour[i][1];
      const mag=Math.hypot(dx,dy)||1;
      const norm=rotate(-dy/mag,dx/mag,0);
      const shade=Math.max(0,Math.min(1,.52+.36*norm[2]-.22*norm[0]-.36*norm[1]));
      const col='rgb('+Math.round(62+129*shade)+','+Math.round(34+94*shade)+','+Math.round(23+68*shade)+')';
      const pts=[back[i],back[j],front[j],front[i]];
      sides.push({pts,col,z:pts.reduce((s,p)=>s+p[2],0)/4});
    }
    sides.sort((a,b)=>a.z-b.z).forEach(({pts,col})=>fill(pts,col,col));
    const shine=ctx.createLinearGradient(width*.25,height*.14,width*.73,height*.88);
    const tone=Math.abs(rotate(0,0,1)[2]);
    shine.addColorStop(0,tone>.55?'#f5d2a2':'#b3835a');
    shine.addColorStop(.47,tone>.55?'#bd8456':'#8e5936');
    shine.addColorStop(.54,tone>.55?'#9b623c':'#794b31');
    shine.addColorStop(1,tone>.55?'#d09b70':'#ab7551');
    fill(faceFront?front:back,shine,'#ddb283');
  }
  if(t<1||Math.abs(progress-easedProgress)>.002||Math.abs(tiltX+.16-x)+Math.abs(tiltY-.62-y)>.002)queue();
}
function onResize(){
  const rect=button.getBoundingClientRect();
  const dpr=Math.min(2,devicePixelRatio||1);
  canvas.width=Math.max(1,Math.round(rect.width*dpr));
  canvas.height=Math.max(1,Math.round(rect.height*dpr));queue();
}
async function initSculpture(){
  if(!ctx)return;
  try{
    const response=await fetch('assets/marca-simbolo.svg');
    if(!response.ok)throw new Error('Símbolo indisponível');
    const svg=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
    const d=svg.querySelector('path')!.getAttribute('d')!;
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',d);
    const len=path.getTotalLength();
    contour=Array.from({length:160},(_,i)=>{const p=path.getPointAtLength(i*len/160);return [p.x-32,p.y-33];});
    if(!len)return;
    onResize();
    button.classList.add('is-ready');
    if('ResizeObserver' in window)new ResizeObserver(onResize).observe(button);
    else (window as Window).addEventListener('resize',onResize,{passive:true});
    if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{pauseOffscreen=!entry.isIntersecting;queue();}).observe(button);
  }catch{button.classList.remove('is-ready');}
}
button.addEventListener('pointerdown',e=>{pointerId=e.pointerId;lastX=e.clientX;lastY=e.clientY;moved=false;});
button.addEventListener('pointermove',e=>{
  if(pointerId===e.pointerId){
    const dx=e.clientX-lastX,dy=e.clientY-lastY;
    if(Math.abs(dx)+Math.abs(dy)>5)moved=true;
    if(moved){
      tiltY=Math.max(-1.6,Math.min(1.6,tiltY+dx*.012));
      tiltX=Math.max(-.65,Math.min(.65,tiltX-dy*.012));lastX=e.clientX;lastY=e.clientY;queue();
    }
  }else if(e.pointerType==='mouse'){
    const r=button.getBoundingClientRect();
    tiltY=(e.clientX-r.left-r.width/2)/r.width*.72;tiltX=-(e.clientY-r.top-r.height/2)/r.height*.6;queue();
  }
});
function reset(){pointerId=null;tiltX=0;tiltY=0;queue();}
['pointerup','pointerleave','pointercancel'].forEach(event=>button.addEventListener(event,reset));
button.addEventListener('click',e=>{if(moved&&e.detail!==0){moved=false;return;}spinAt=performance.now();queue();});
function motionChanged(){button.disabled=motion.matches;if(!motion.matches)queue();}
motion.addEventListener('change',motionChanged);
motionChanged();
window.addEventListener('scroll',queue,{passive:true});
initSculpture();



const menuToggle=document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const mainNav=document.querySelector('#nav-principal')!;
const mobileNav=matchMedia('(max-width: 760px)');
function setMenu(open: boolean){
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  mainNav.classList.toggle('is-open',open);
}
menuToggle.addEventListener('click',()=>setMenu(menuToggle.getAttribute('aria-expanded')==='false'));
mainNav.addEventListener('click',event=>{if((event.target as Element).closest('a')){setMenu(false);if(mobileNav.matches)menuToggle.focus({preventScroll:true});}});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&menuToggle.getAttribute('aria-expanded')==='true'){
    setMenu(false);
    menuToggle.focus();
  }
});
mobileNav.addEventListener('change',()=>setMenu(false));
document.querySelector('.masthead')!.classList.add('menu-ready');
const caseDialog=document.querySelector<HTMLDialogElement>('#case-dialog')!;
if(typeof caseDialog.showModal==='function'){
  const closeCase=caseDialog.querySelector<HTMLButtonElement>('.case-close')!;
  const casePhoto=caseDialog.querySelector<HTMLImageElement>('.case-dialog-photo')!;
  const caseCopy=caseDialog.querySelector('.case-dialog-copy')!;
  let activeCase: HTMLAnchorElement | null=null;
  document.querySelectorAll<HTMLAnchorElement>('[data-case]').forEach(link=>{
    link.setAttribute('aria-haspopup','dialog');
    link.addEventListener('click',event=>{
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      const sourcePhoto=link.querySelector('img')!;
      const template=document.getElementById('case-'+link.dataset.case) as HTMLTemplateElement;
      caseCopy.replaceChildren(template.content.cloneNode(true));
      casePhoto.src=sourcePhoto.currentSrc||sourcePhoto.src;
      casePhoto.alt=sourcePhoto.alt;
      activeCase=link;
      caseDialog.showModal();
      closeCase.focus();
    });
  });
  closeCase.addEventListener('click',()=>caseDialog.close());
  caseDialog.addEventListener('click',event=>{
    if(event.target!==caseDialog)return;
    const box=caseDialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)caseDialog.close();
  });
  caseDialog.addEventListener('close',()=>activeCase?.focus({preventScroll:true}));
}


