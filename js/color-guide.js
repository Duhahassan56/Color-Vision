const colors = [
  {name:'Sky Blue',hex:'#60A5FA',category:'blue',tone:'bright'},
  {name:'Rose Pink',hex:'#F472B6',category:'pink',tone:'bright'},
  {name:'Lavender Mist',hex:'#A78BFA',category:'purple',tone:'light'},
  {name:'Honey Gold',hex:'#EAB308',category:'yellow',tone:'bright'},
  {name:'Teal Tide',hex:'#14B8A6',category:'green',tone:'bright'},
  {name:'Coral Pop',hex:'#F97316',category:'orange',tone:'bright'},
  {name:'Sage Green',hex:'#84CC16',category:'green',tone:'bright'},
  {name:'Cocoa Brown',hex:'#7C4A2D',category:'brown',tone:'dark'},
  {name:'Vanilla Cream',hex:'#FFF7E6',category:'neutral',tone:'light'},
  {name:'Ocean Depth',hex:'#2563EB',category:'blue',tone:'dark'},
  {name:'Peach Fuzz',hex:'#FDBA74',category:'orange',tone:'light'},
  {name:'Plum Dream',hex:'#A855F7',category:'purple',tone:'bright'},
  {name:'Mint Leaf',hex:'#6EE7B7',category:'green',tone:'light'},
  {name:'Ruby Red',hex:'#DC2626',category:'red',tone:'dark'},
  {name:'Lemon Glow',hex:'#FDE047',category:'yellow',tone:'light'},
  {name:'Slate Gray',hex:'#64748B',category:'gray',tone:'dark'}
];
const grid=document.querySelector('#color-grid');
const search=document.querySelector('#search');
const colorFilter=document.querySelector('#color-filter');
const toneFilter=document.querySelector('#tone-filter');
const sort=document.querySelector('#sort');
const empty=document.querySelector('#empty');
const toast=document.querySelector('#toast');
let toastTimer;
function hexToRgb(hex){const value=hex.replace('#','');return [0,2,4].map(i=>parseInt(value.slice(i,i+2),16));}
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1800);}
function render(){
  const query=search.value.trim().toLowerCase();
  const chosenColor=colorFilter.value;
  const chosenTone=toneFilter.value;
  const results=colors.filter(c=>(c.name.toLowerCase().includes(query)||c.hex.toLowerCase().includes(query))&&(chosenColor==='all'||c.category===chosenColor)&&(chosenTone==='all'||c.tone===chosenTone));
  if(sort.value==='az')results.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort.value==='za')results.sort((a,b)=>b.name.localeCompare(a.name));
  if(sort.value==='hue')results.sort((a,b)=>rgbToHue(hexToRgb(a.hex))-rgbToHue(hexToRgb(b.hex)));
  grid.replaceChildren();
  for(const c of results){
    const rgb=hexToRgb(c.hex).join(', ');
    const card=document.createElement('article');card.className='color-card';
    const swatch=document.createElement('div');swatch.className='swatch';swatch.style.backgroundColor=c.hex;swatch.setAttribute('aria-label',c.name+' color sample');
    const title=document.createElement('h2');title.textContent=c.name;
    card.append(swatch,title);
    for(const [label,value] of [['HEX',c.hex],['RGB',rgb]]){
      const row=document.createElement('div');row.className='color-detail';
      const code=document.createElement('code');code.textContent=label+': '+value;
      const button=document.createElement('button');button.className='copy-btn';button.type='button';button.textContent='▢';button.title='Copy '+label+' for '+c.name;button.setAttribute('aria-label',button.title);
      button.addEventListener('click',async()=>{try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value);}else{const input=document.createElement('textarea');input.value=value;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();const ok=document.execCommand('copy');input.remove();if(!ok)throw new Error('Copy unavailable');}showToast(label+' copied: '+value);}catch{showToast('Copy failed. Select the value manually.');}});
      row.append(code,button);card.append(row);
    }
    grid.append(card);
  }
  empty.hidden=results.length!==0;
}
function rgbToHue([r,g,b]){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;if(!d)return 0;let h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;return (h*60+360)%360;}
[search,colorFilter,toneFilter,sort].forEach(el=>el.addEventListener(el===search?'input':'change',render));
render();
