'use strict';

const $ = id => document.getElementById(id);
const templates = [
  {id:'oscorp',label:'tasm: oscorp staff id',title:'richard parker id from tasm',prefix:'oscorp_richard_parker_id',width:640,height:1014,exportWidth:3030,defaults:{name:'',department:'GENETICS LABORATORY',number:'A00473',company:'OSCORP',staff:'STAFF'}},
  {id:'tva',label:'doomsday: loki tva id',title:'doomsday: loki tva id',prefix:'loki_tva_id',width:640,height:1014,exportWidth:3030,defaults:{heading:'TIME VARIANCE AUTHORITY',number:'414-620701-401220'}},
  {id:'mclovin',label:'superbad: mclovin’s driver license',title:'superbad: mclovin’s driver license',prefix:'mclovin_driver_license',width:1000,height:630,exportWidth:2048,defaults:{name:'McLOVIN',number:'01-47-87441',dob:'06/03/1981',expiry:'06/03/2008',height:'5-10',weight:'150',hair:'BRO',eyes:'BRO',sex:'M',county:'0',issue:'06/18/1998',class:'3',restrictions:'',endorsements:'',signature:'McLovin',address:'892 MOMONA ST',city:'HONOLULU, HI 96820',backRestrictions:'CORRECTIVE LENSES',backEndorsements:'',backClass:'PASSENGER VEHICLES OF ANY GWR. BUSES DESIGNED TO TRANSPORT FIFTEEN OR FEWER OCCUPANTS. TRUCKS AND VANS W/15,000 LBS GWR OR LESS.'}},
  {id:'stark',label:'iron man: stark industries id',title:'stark industries personnel id',width:640,height:1000,exportWidth:2560,defaults:{name:'Tony Stark',department:'President / CEO',number:'SI-001970',company:'STARK INDUSTRIES',level:'10',sector:'RESEARCH / 01',backHeading:'THE FUTURE IS BUILT HERE.',backNote:'AUTHORIZED PERSONNEL ONLY'}},
  {id:'travel',label:'the traveller’s license',title:'the traveller’s license',width:1000,height:634,exportWidth:2014,defaults:{name:'am',dob:'',place:'',issue:'06/25/2021',number:'TTC6252021',signature:'AM',heading:'PERMANENT LICENSE OF TRAVEL',license:'LICENSE OF TRAVEL',body:'This is to Certify that the person named and described above is permitted to travel and explore freely unless detained by law.',important:'IMPORTANT',note:'The holder of this license wrote, composed, and arranged all songs within the attached record, unless stated otherwise.',caption:'Photograph of Authorized traveller',backHeading:'THE WORLD IS WAITING',backBody:'A permanent invitation to wander. Take the scenic route, follow your curiosity, and collect a little wonder along the way.',backNote:'Keep this little piece of your adventure. A fictional keepsake, made just for you.'}}
];
templates.push({id:'fightclub',label:'fight club: tyler durden id',title:'fight club: tyler durden id',width:1000,height:714,exportWidth:2800,defaults:{name:'DURDEN, TYLER',chinese:'傅動斯',grade:'A2C',number:'FC14793036',age:'29',section:'FIGHT CLUB',serial:'632025',expiry:'28 October 1965',backHeading:'PAPER STREET / FIGHT CLUB',backBody:'A fictional keepsake from the world of Fight Club. This card belongs to its holder and carries no official authority.',backNote:'FAN-MADE MOVIE COLLECTIBLE'}});
const assets = {};
const assetNames = [...templates.filter(t=>t.prefix).flatMap(t=>[t.prefix+'_front',t.prefix+'_back']),'oscorp-custom-front-clean','oscorp-back-symbol','oscorp-custom-back','tva-custom-front','mclovin-custom-front','traveller-blank','traveller-cat-default','fightclub-default'];
let selected=templates[0],custom=false,photo=null,photoVersion=0,values={},changed=new Set(),cardColor='#dfc2c8',zoom=1,position=.5,filter=0,activeInput=null,photoAnchor=null;
let assetsLoaded=false;
const tintCache=new Map();
const assetsReady=Promise.all(assetNames.map(name=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{assets[name]=im;resolve();};im.onerror=()=>reject(new Error('Could not load '+name+'. Please refresh.'));im.src='assets/'+name+(name==='fightclub-default'?'.jpg':'.png');})));

function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
function text(c,value,x,y,size=22,color='#111',font='Arial',align='left',maxWidth){c.fillStyle=color;c.font=`${size}px ${font}`;c.textAlign=align;c.textBaseline='alphabetic';if(maxWidth)c.fillText(String(value),x,y,maxWidth);else c.fillText(String(value),x,y);c.textAlign='left';}
function fitted(c,value,x,y,w,h,size=22,font='Georgia',color='#111',align='center'){
  const lines=String(value||'').split('\n');let fontSize=size;
  for(;fontSize>8;fontSize--){c.font=`${fontSize}px ${font}`;if(lines.every(line=>c.measureText(line).width<=w-6)&&lines.length*fontSize*1.15<=h)break;}
  lines.forEach((line,i)=>text(c,line,align==='center'?x+w/2:x+3,y+(h-lines.length*fontSize*1.15)/2+fontSize+(i*fontSize*1.15)-2,fontSize,color,font,align,w-6));
}
function wrapped(c,value,x,y,w,h,size=16,font='Georgia',color='#111'){
  let lines=[],fontSize=size;
  for(;fontSize>=8;fontSize--){c.font=`${fontSize}px ${font}`;lines=[];let line='';for(const word of String(value).split(/\s+/)){const next=(line+' '+word).trim();if(c.measureText(next).width>w&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);if(lines.length*fontSize*1.25<=h)break;}
  lines.forEach((line,i)=>text(c,line,x,y+fontSize+i*fontSize*1.25,fontSize,color,font));
}
function qr(c,value,x,y,size){if(!value)return;const q=qrcode(0,'M');q.addData(value);q.make();const n=q.getModuleCount(),unit=size/(n+8);rect(c,x,y,size,size,'white');c.fillStyle='#111';for(let r=0;r<n;r++)for(let col=0;col<n;col++)if(q.isDark(r,col))c.fillRect(x+(col+4)*unit,y+(r+4)*unit,unit+.05,unit+.05);}
function photoDraw(c,box,defaultCat=false){
  const [x,y,w,h]=box;c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
  if(photo){const scale=Math.max(w/photo.width,h/photo.height)*zoom,dw=photo.width*scale,dh=photo.height*scale;c.filter=`sepia(${filter}%)`;c.drawImage(photo,x+(w-dw)/2,y+(h-dh)*position,dw,dh);}
  else if(defaultCat){const cat=assets['traveller-cat-default'];c.drawImage(cat,cat.width*.077,cat.height*.181,cat.width*.397,cat.height*.63,x,y,w,h);}
  else{rect(c,x,y,w,h,'#d7d7d7');text(c,'↑',x+w/2,y+h*.42,Math.min(45,w*.3),'#111','Arial','center');text(c,'Upload your image',x+w/2,y+h*.61,Math.min(16,w*.08),'#111','Georgia','center',w*.9);}
  c.restore();
}
function tintedTravel(color){
  if(tintCache.has(color))return tintCache.get(color);
  const base=assets['traveller-blank'],canvas=document.createElement('canvas');canvas.width=base.width;canvas.height=base.height;const c=canvas.getContext('2d');c.drawImage(base,0,0);const pixels=c.getImageData(0,0,canvas.width,canvas.height),data=pixels.data;
  const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
  for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2];if(r>95&&g>85&&b>65&&Math.max(r,g,b)-Math.min(r,g,b)<115){const luminance=(r*.25+g*.6+b*.15)/230;for(let channel=0;channel<3;channel++)data[i+channel]=Math.min(255,rgb[channel]*luminance);}}
  c.putImageData(pixels,0,0);if(tintCache.size>=5)tintCache.delete(tintCache.keys().next().value);tintCache.set(color,canvas);return canvas;
}
function travelPatch(c,base,x,y,w,h){c.drawImage(base,base.width*.12,base.height*.25,base.width*.12,base.height*.12,x,y,w,h);}
function drawTravel(c,back,edited){
  const base=tintedTravel(edited?cardColor:'#dfc2c8');
  if(!edited&&!back){c.drawImage(assets['traveller-cat-default'],0,0,1000,634);return;}
  c.drawImage(base,0,0,1000,634);
  if(back){
    travelPatch(c,base,74,72,854,492);
    fitted(c,values.backHeading||selected.defaults.backHeading,110,100,780,55,34,'Georgia');
    wrapped(c,values.backBody||selected.defaults.backBody,125,190,750,100,23);
    fitted(c,values.name||'Your name',125,320,460,40,28,'Georgia');
    fitted(c,values.number||selected.defaults.number,125,365,460,30,20,'monospace');
    fitted(c,values.signature||'Your signature',125,414,460,40,29,'cursive');
    wrapped(c,values.backNote||selected.defaults.backNote,125,478,750,55,16);
    if($('qr-enabled').checked)qr(c,$('qr-url').value||'https://example.com',660,310,150);else text(c,'✳',735,428,110,'#446b5d','Georgia','center');
    return;
  }
  photoDraw(c,[85,106,380,410],true);
  const specs=fieldSpecs('travel').filter(f=>f.kind!=='photo'&&f.side!=='back');
  for(const f of specs){const [x,y,w,h]=f.box;travelPatch(c,base,x,y,w,h);const value=values[f.key]||f.placeholder||'';if(f.multiline)wrapped(c,value,x+2,y,w-4,h,f.size||16,'Georgia');else fitted(c,value,x,y,w,h,f.size||24,f.font||'cursive',values[f.key]?'#111':'#7b7368');}
}
function drawOscorp(c,back,edited){
  const qrOn=$('qr-enabled').checked;
  if(back){c.drawImage(assets[qrOn?'oscorp-custom-back':'oscorp_richard_parker_id_back'],0,0,640,1014);if(qrOn)qr(c,$('qr-url').value||'https://oscorp.com/verify/A00473',338,616,177);return;}
  c.drawImage(assets[edited?'oscorp-custom-front-clean':'oscorp_richard_parker_id_front'],0,0,640,1014);
  if(!edited)return;
  if(photo)photoDraw(c,[169,384,318,397]);
  fitted(c,values.name||'Add your name',82,827,474,55,41,'Georgia',values.name?'#111':'#999');
  for(const key of ['company','department'])if(changed.has(key)){const f=fieldSpecs('oscorp').find(f=>f.key===key);rect(c,...f.box,'#fff');fitted(c,values[key],...f.box,key==='company'?88:30,key==='company'?'Arial':'Georgia');}
  if(changed.has('number')){rect(c,530,470,58,292,'white');[...values.number].slice(0,9).forEach((v,i)=>text(c,v,559,495+i*31,27,'#111','Georgia','center'));}
  if(changed.has('staff')){rect(c,65,371,76,421,'white');[...values.staff].slice(0,6).forEach((v,i)=>text(c,v,103,425+i*75,57,'#111','Georgia','center'));}
}
function drawTva(c,back,edited){
  c.drawImage(assets[back?'loki_tva_id_back':edited?'tva-custom-front':'loki_tva_id_front'],0,0,640,1014);
  if(edited&&!back){if(photo)photoDraw(c,[155,464,331,428]);for(const key of ['heading','number'])if(changed.has(key)){const f=fieldSpecs('tva').find(f=>f.key===key);rect(c,...f.box,'#292721');fitted(c,values[key],...f.box,key==='heading'?24:23,'monospace','#cb9869');}}
  if(back&&$('qr-enabled').checked)qr(c,$('qr-url').value,245,750,150);
}
function drawMclovin(c,back,edited){
  c.drawImage(assets['mclovin_driver_license_'+(back?'back':'front')],0,0,1000,630);
  if(!edited)return;
  photoDraw(c,back?[135,493,98,111]:[24,24,306,346]);
  for(const f of fieldSpecs('mclovin').filter(f=>f.kind!=='photo'&&(f.side==='back')===back))if(changed.has(f.key)){rect(c,...f.box,'#f5f5f5');if(f.multiline)wrapped(c,values[f.key],f.box[0]+2,f.box[1],f.box[2]-4,f.box[3],f.size||18,'Arial');else fitted(c,values[f.key],...f.box,f.size||28,f.font||'Arial','#111',f.align||'left');}
  if(back&&$('qr-enabled').checked)qr(c,$('qr-url').value,760,390,160);
  text(c,'FICTIONAL MOVIE PROP • NOT VALID IDENTIFICATION',500,621,9,'#666','Arial','center');
}
function drawStark(c,back,edited){
  rect(c,0,0,640,1000,'#deedef');rect(c,25,30,590,155,'#123239');fitted(c,edited?values.company:'STARK INDUSTRIES',40,65,560,90,54,'Arial','white');
  if(back){wrapped(c,values.backHeading||selected.defaults.backHeading,85,250,470,120,46,'Arial','#123239');qr(c,$('qr-url').value||'https://www.marvel.com/characters/iron-man-tony-stark',170,450,300);fitted(c,values.backNote||selected.defaults.backNote,40,820,560,65,20,'Arial','#123239');}
  else{photoDraw(c,[35,220,245,350]);fitted(c,edited?values.name:'Tony Stark',303,235,295,55,30,'Arial');fitted(c,edited?values.department:'President / CEO',303,300,295,55,22,'Arial');text(c,'PERSONNEL',308,395,15,'#4d7277');fitted(c,edited?values.number:'SI-001970',300,405,310,45,22,'monospace');fitted(c,edited?values.sector:'RESEARCH / 01',300,485,310,45,22,'Arial');text(c,'LEVEL',35,650,48,'#b51d27');fitted(c,edited?values.level:'10',25,662,255,140,140,'Arial','#b51d27');text(c,'CLEARANCE',35,845,28,'#b51d27');qr(c,$('qr-url').value||'https://www.marvel.com/characters/iron-man-tony-stark',310,610,270);}
  text(c,'FAN-MADE PROP • NOT VALID IDENTIFICATION',320,976,11,'#526663','Arial','center');
}
function fightPatch(c,box,color){rect(c,...box,color);c.save();c.globalAlpha=.08;for(let i=0;i<160;i++){const x=box[0]+((i*79.7)%box[2]),y=box[1]+((i*43.3)%box[3]);rect(c,x,y,1,1,'#102d22');}c.restore();}
function fightTint(color){
  const cacheKey='fight-'+color;if(tintCache.has(cacheKey))return tintCache.get(cacheKey);const source=assets['fightclub-default'],canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(source,0,0);const pixels=c.getImageData(0,0,canvas.width,canvas.height),d=pixels.data,rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(g>60&&g>r*.95&&g>b*.95){const shade=(r*.25+g*.6+b*.15)/172;for(let channel=0;channel<3;channel++)d[i+channel]=Math.min(255,rgb[channel]*shade);}}c.putImageData(pixels,0,0);if(tintCache.size>=5)tintCache.delete(tintCache.keys().next().value);tintCache.set(cacheKey,canvas);return canvas;
}
function drawFightclub(c,back,edited){
  const color=edited?cardColor:'#a2c4a8';c.drawImage(edited?fightTint(color):assets['fightclub-default'],0,0,1000,714);
  if(back){fightPatch(c,[28,28,944,658],color);fitted(c,values.backHeading||selected.defaults.backHeading,70,70,860,80,48,'monospace','#49326b');wrapped(c,values.backBody||selected.defaults.backBody,95,210,810,160,30);fitted(c,values.name||selected.defaults.name,80,440,550,55,36,'monospace');fitted(c,values.number||selected.defaults.number,80,510,550,45,27,'monospace');fitted(c,values.backNote||selected.defaults.backNote,80,620,840,35,20,'monospace');if($('qr-enabled').checked)qr(c,$('qr-url').value||'https://example.com',710,435,155);else text(c,'✳',790,555,115,'#49326b','Georgia','center');return;}
  if(edited){photoDraw(c,[53,87,285,277]);for(const f of fieldSpecs('fightclub').filter(f=>f.kind!=='photo'&&f.side!=='back'))if(changed.has(f.key)){fightPatch(c,f.box,color);fitted(c,values[f.key],...f.box,f.size||40,f.font||'monospace',f.key==='section'?'#49326b':'#102d22');}if(changed.has('name')||changed.has('number')){fightPatch(c,[49,372,289,113],'#17271f');fitted(c,values.name,55,382,277,48,24,'Georgia','#d9d6b8');fitted(c,values.number,55,431,277,42,22,'monospace','#d9d6b8');}text(c,'FICTIONAL MOVIE PROP • NOT VALID IDENTIFICATION',500,698,11,'#203b2d','Arial','center');}
}
const renderers={travel:drawTravel,oscorp:drawOscorp,tva:drawTva,mclovin:drawMclovin,stark:drawStark,fightclub:drawFightclub};
function draw(canvas,back=false,exporting=false,t=selected,edited=custom){
  const width=exporting?t.exportWidth:t.width;canvas.width=width;canvas.height=Math.round(width*t.height/t.width);
  const c=canvas.getContext('2d',{willReadFrequently:true});c.scale(canvas.width/t.width,canvas.height/t.height);c.imageSmoothingQuality='high';
  renderers[t.id](c,back,edited);
  if($('cutting').checked){c.strokeStyle='#777';c.lineWidth=1;c.setLineDash([5,5]);c.strokeRect(4,4,t.width-8,t.height-8);}
}
function render(){if(!assetsLoaded)return;draw($('front'));draw($('rear'),true);$('workspace').classList.toggle('landscape',selected.width>selected.height);$('filter-value').value=filter+'%';}

// Rectangles use each template's design coordinates, shared by rendering and hit targets.
function fieldSpecs(id){
  const f=(key,label,box,options={})=>({key,label,box,...options});
  if(id==='fightclub')return[f('photo','Photo',[53,87,285,277],{kind:'photo'}),f('chinese','Chinese name',[470,30,275,85],{size:62,font:'serif'}),f('name','Name',[470,126,470,52]),f('grade','Grade',[570,246,300,65]),f('number','Service number',[585,354,350,54]),f('age','Age',[555,457,100,51]),f('section','Section',[574,510,350,80],{size:60}),f('serial','Card serial number',[40,537,286,80],{size:62}),f('expiry','Expiry date',[615,628,353,55],{size:32}),f('backHeading','Back heading',[70,70,860,80],{side:'back'}),f('backBody','Back description',[95,210,810,160],{side:'back',multiline:true}),f('name','Name',[80,440,550,55],{side:'back'}),f('number','Service number',[80,510,550,45],{side:'back'}),f('backNote','Back notice',[80,620,840,35],{side:'back'})];
  if(id==='oscorp')return[f('company','Company name',[30,110,580,130]),f('staff','Staff label',[65,371,76,421]),f('photo','Photo',[169,384,318,397],{kind:'photo'}),f('number','Card number',[530,470,58,292]),f('name','Name',[82,827,474,55]),f('department','Department',[65,890,510,50])];
  if(id==='tva')return[f('heading','Authority name',[135,70,375,48]),f('number','Card number',[145,145,355,38]),f('photo','Photo',[155,464,331,428],{kind:'photo'})];
  if(id==='stark')return[f('company','Company name',[40,65,560,90]),f('photo','Photo',[35,220,245,350],{kind:'photo'}),f('name','Name',[303,235,295,55]),f('department','Title',[303,300,295,55]),f('number','Card number',[300,405,310,45]),f('sector','Sector',[300,485,310,45]),f('level','Clearance level',[25,662,255,140]),f('backHeading','Back heading',[85,250,470,120],{side:'back',multiline:true}),f('backNote','Back notice',[40,820,560,65],{side:'back'})];
  if(id==='mclovin')return[
    f('photo','Photo',[24,24,306,346],{kind:'photo'}),f('number','Card number',[467,131,240,45],{size:40}),f('dob','Date of birth',[413,195,223,42],{size:39}),f('expiry','Expiry date',[716,195,225,42],{size:39}),
    ...[['height','Height',352,266,80],['weight','Weight',455,266,80],['hair','Hair',566,266,80],['eyes','Eyes',671,266,80],['sex','Sex',791,266,60],['county','County',900,266,60],['issue','Issue date',350,345,170],['class','Class',565,345,80],['restrictions','Restrictions',660,345,100],['endorsements','Endorsements',790,345,160]].map(([key,label,x,y,w])=>f(key,label,[x,y,w,30],{size:26})),
    f('signature','Signature',[390,394,215,67],{size:40,font:'cursive'}),f('name','Name',[20,480,600,38],{size:30}),f('address','Street address',[20,519,650,38],{size:30}),f('city','City and postcode',[20,558,750,38],{size:30}),
    f('photo','Photo',[135,493,98,111],{kind:'photo',side:'back'}),f('backRestrictions','Back restrictions',[245,405,300,38],{side:'back',size:18}),f('backEndorsements','Back endorsements',[620,405,320,55],{side:'back',size:18}),f('backClass','Vehicle class description',[245,516,700,91],{side:'back',multiline:true,size:20})
  ];
  return[
    f('heading','License heading',[535,74,370,28],{size:20,font:'monospace'}),f('number','License number',[609,103,264,32],{size:24,font:'Arial Black'}),f('photo','Photo',[85,106,380,410],{kind:'photo'}),
    f('name','Name',[588,136,310,24],{size:27,placeholder:'Name'}),f('dob','Date of birth',[623,176,275,24],{size:26,placeholder:'Date of Birth'}),f('place','Place of issue',[631,216,267,24],{size:25,placeholder:'Location'}),f('issue','Date of issue',[631,245,267,32],{size:26}),
    f('license','License title',[605,302,298,27],{size:20,font:'monospace'}),f('body','License description',[500,335,410,57],{multiline:true,size:17}),f('important','Notice heading',[650,408,165,25],{size:19,font:'monospace'}),f('note','Important notice',[500,439,410,65],{multiline:true,size:17}),f('signature','Signature',[574,514,325,32],{size:30}),f('caption','Photo caption',[190,514,275,16],{size:13,font:'Georgia'}),
    f('backHeading','Back heading',[110,100,780,55],{side:'back'}),f('backBody','Back description',[125,190,750,100],{side:'back',multiline:true}),f('name','Name',[125,320,460,40],{side:'back'}),f('number','License number',[125,365,460,30],{side:'back'}),f('signature','Signature',[125,414,460,40],{side:'back'}),f('backNote','Back notice',[125,478,750,55],{side:'back',multiline:true})
  ];
}
function positionField(element,f){const [x,y,w,h]=f.box;Object.assign(element.style,{left:x/selected.width*100+'%',top:y/selected.height*100+'%',width:w/selected.width*100+'%',height:h/selected.height*100+'%'});}
function commitInline(){if(activeInput)activeInput.blur();}
function buildFields(){
  $('front-fields').replaceChildren();$('rear-fields').replaceChildren();
  if(!custom)return;
  for(const f of fieldSpecs(selected.id)){
    const button=document.createElement('button');button.type='button';button.className='card-field'+(f.kind==='photo'?' photo-field':'');button.setAttribute('aria-label','Edit '+f.label);button.dataset.field=f.key;button.title=f.kind==='photo'?'Upload or change your photo':'Click to edit '+f.label;positionField(button,f);
    button.onclick=()=>f.kind==='photo'?openPhoto(button):editField(button,f);
    $(f.side==='back'?'rear-fields':'front-fields').append(button);
  }
}
function editField(button,f){
  commitInline();closePopovers();const input=document.createElement(f.multiline?'textarea':'input');input.className='inline-editor';input.setAttribute('aria-label',f.label);input.value=values[f.key]||'';input.placeholder=f.placeholder||f.label;input.maxLength=f.multiline?500:(f.key==='number'?30:80);positionField(input,f);
  input.style.fontSize=Math.max(11,Math.min(22,button.getBoundingClientRect().height*.55))+'px';button.parentElement.append(input);button.hidden=true;activeInput=input;const original=values[f.key]||'';let cancel=false;
  input.addEventListener('input',()=>{values[f.key]=input.value;changed.add(f.key);render();});
  input.onkeydown=e=>{if(e.key==='Escape'){cancel=true;input.blur();}else if(e.key==='Enter'&&(!f.multiline||e.ctrlKey||e.metaKey)){e.preventDefault();input.blur();}};
  input.onblur=()=>{if(cancel){values[f.key]=original;render();}activeInput=null;button.hidden=false;input.remove();};input.focus();input.select();
}
let popoverTrigger=null;
function closePopovers(restoreFocus=false){$('photo-editor').hidden=true;$('color-editor').hidden=true;if(restoreFocus&&popoverTrigger?.isConnected)popoverTrigger.focus();}
function openPopover(id,anchor){closePopovers();popoverTrigger=anchor;const popover=$(id);popover.hidden=false;const bounds=anchor.getBoundingClientRect(),rect=popover.getBoundingClientRect();const top=bounds.bottom+8+rect.height<innerHeight?bounds.bottom+8:Math.max(12,bounds.top-rect.height-8);popover.style.left=Math.max(12,Math.min(innerWidth-rect.width-12,bounds.left))+'px';popover.style.top=Math.max(12,Math.min(innerHeight-rect.height-12,top))+'px';popover.querySelector('button,input,label[for]')?.focus();}
function openPhoto(button){commitInline();photoAnchor=button;openPopover('photo-editor',button);}
function freshState(){photoVersion++;photo=null;values={...selected.defaults};changed=new Set();zoom=1;position=.5;filter=selected.id==='tva'?45:0;cardColor=selected.id==='fightclub'?'#a2c4a8':'#dfc2c8';$('zoom').value=zoom;$('position').value=position;$('filter').value=filter;$('photo').value='';$('photo-url').value='';$('custom-color').value=cardColor;$('cutting').checked=false;$('qr-enabled').checked=false;$('qr-url').value=selected.id==='oscorp'?'https://oscorp.com/verify/A00473':'';document.querySelectorAll('.swatch').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===cardColor)));}
function updateControls(){
  $('return-default').hidden=!custom;$('custom-mode').hidden=custom;$('edit-hint').hidden=!custom;$('select-color').hidden=!['travel','fightclub'].includes(selected.id);$('filter-control').hidden=!custom||selected.id!=='tva';$('qr-link-row').hidden=!$('qr-enabled').checked;$('download').textContent=custom?'↓ download custom id':'↓ download default';document.body.classList.toggle('customizing',custom);
}
function mode(value){commitInline();closePopovers();if(!value)freshState();custom=value;updateControls();render();buildFields();$('status').textContent=custom?'Click directly on the card to make it yours.':'';}
function openEditor(t){commitInline();closePopovers();selected=t;custom=false;freshState();$('templates').hidden=true;$('editor').hidden=false;$('editor-title').textContent=t.title;updateControls();render();buildFields();$('status').textContent=assetsLoaded?'':'Loading card images…';window.scrollTo({top:0,behavior:'smooth'});}
$('back').onclick=()=>{commitInline();closePopovers();photoVersion++;$('editor').hidden=true;$('templates').hidden=false;window.scrollTo({top:0,behavior:'smooth'});};
$('custom-mode').onclick=()=>mode(true);$('return-default').onclick=()=>mode(false);
$('cutting').oninput=render;$('qr-enabled').oninput=()=>{updateControls();render();};$('qr-url').oninput=()=>{try{render();$('status').textContent='';}catch{$('status').textContent='Please use a shorter QR link.';}};
for(const id of ['zoom','position','filter'])$(id).oninput=()=>{zoom=Number($('zoom').value);position=Number($('position').value);filter=Number($('filter').value);render();};
async function setPhoto(blob,version){
  if(blob.size>10*1024*1024)throw new Error('Choose an image smaller than 10 MB.');if(!/^image\/(png|jpeg|webp)$/.test(blob.type))throw new Error('Use a JPG, PNG or WebP image.');
  const url=URL.createObjectURL(blob);try{const im=new Image();im.src=url;await im.decode();if(version!==photoVersion)return;photo=im;zoom=1;position=.5;$('zoom').value=1;$('position').value=.5;render();$('status').textContent='Photo added. Adjust its crop in the photo options.';}finally{URL.revokeObjectURL(url);}
}
$('photo').onchange=async e=>{if(!e.target.files[0])return;const version=++photoVersion;try{await setPhoto(e.target.files[0],version);}catch(err){$('status').textContent=err.message;}};
$('load-url').onclick=async()=>{const version=++photoVersion;try{const url=new URL($('photo-url').value);if(!['http:','https:'].includes(url.protocol))throw new Error('Enter an HTTP or HTTPS image URL.');$('load-url').disabled=true;$('status').textContent='Loading photo…';const response=await fetch(url,{credentials:'omit',signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('Could not load that image.');await setPhoto(await response.blob(),version);}catch(err){$('status').textContent=err.name==='TypeError'?'That image host blocks imports. Save the image and use Upload photo.':err.message;}finally{$('load-url').disabled=false;}};
$('reset-photo').onclick=()=>{photoVersion++;photo=null;zoom=1;position=.5;$('zoom').value=1;$('position').value=.5;$('photo').value='';render();};
document.querySelectorAll('.close-popover').forEach(b=>b.onclick=()=>closePopovers(true));
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.popover')&&!e.target.closest('.photo-field')&&!e.target.closest('#select-color'))closePopovers();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePopovers(true);});window.addEventListener('resize',()=>closePopovers());window.addEventListener('scroll',()=>closePopovers(),{passive:true});
const colors=[['Sand','#e4d4a0'],['Green','#b0d4ae'],['Rose','#dfc2c8'],['Blue','#b7ced2']];
function selectColor(color){if(!custom){custom=true;updateControls();buildFields();}cardColor=color;$('custom-color').value=color;document.querySelectorAll('.swatch').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===color)));render();}
colors.forEach(([label,color])=>{const b=document.createElement('button');b.type='button';b.className='swatch';b.dataset.color=color;b.style.background=color;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(color===cardColor));b.onclick=()=>selectColor(color);$('swatches').append(b);});
$('select-color').onclick=()=>{commitInline();openPopover('color-editor',$('select-color'));};$('custom-color').oninput=e=>selectColor(e.target.value);$('reset-color').onclick=()=>selectColor(selected.id==='fightclub'?'#a2c4a8':'#dfc2c8');
function downloadBlob(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function pngBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image export failed.')),'image/png'));}
$('download').onclick=async()=>{
  commitInline();closePopovers();const button=$('download');button.disabled=true;
  try{
    if(!custom&&selected.prefix&&!$('cutting').checked&&!$('qr-enabled').checked){const a=document.createElement('a');a.href='assets/'+selected.prefix+'_cards.zip';a.download=selected.prefix+'_cards.zip';a.click();$('status').textContent='Original high-quality front and back PNGs downloaded in a ZIP.';return;}
    $('status').textContent='Preparing high-quality front and back…';
    const t=selected,front=document.createElement('canvas'),back=document.createElement('canvas');draw(front,false,true);draw(back,true,true);
    const [frontBlob,backBlob]=await Promise.all([pngBlob(front),pngBlob(back)]),zip=new JSZip();zip.file('front.png',frontBlob);zip.file('back.png',backBlob);
    zip.file('README.txt',`Fictional collectible: ${t.label}\nSeparate front and back PNG images.\nFront: ${front.width} x ${front.height} pixels\nBack: ${back.width} x ${back.height} pixels\nPrint at ${t.width>t.height?'85 x 54':'54 x 85'} mm.\nFor personal fan use only. Not valid identification.\n`);
    const blob=await zip.generateAsync({type:'blob',compression:'STORE'});downloadBlob(blob,`${t.id}_${custom?'custom':'default'}_cards.zip`);$('status').textContent='Downloaded ZIP with separate high-quality front.png and back.png.';
  }catch(err){$('status').textContent='Download failed: '+err.message;}finally{button.disabled=false;}
};
$('print').onclick=()=>{commitInline();closePopovers();render();window.print();};
function createGallery(){
  for(const t of templates){const button=document.createElement('button');button.className='template';button.type='button';button.dataset.template=t.id;const art=document.createElement('div');art.className='template-art'+(t.width>t.height?' wide-stack':'');
    if(t.prefix||t.id==='travel'){for(const side of ['back','front']){const im=document.createElement('img');im.className='stack-'+side;im.alt=t.label+' '+side;im.src=t.id==='travel'?'assets/'+(side==='front'?'traveller-cat-default':'traveller-blank')+'.png':'assets/'+t.prefix+'_'+side+'.png';art.append(im);}}
    else{const canvas=document.createElement('canvas');const old=selected;selected=t;draw(canvas,false,false,t,false);selected=old;art.append(canvas);}
    const heading=document.createElement('h3');heading.textContent=t.label;button.append(art,heading);if(t.id==='mclovin'){const note=document.createElement('p');note.textContent='(fictional movie prop only)';button.append(note);}button.onclick=()=>openEditor(t);$('gallery').append(button);
  }
}
assetsReady.then(()=>{assetsLoaded=true;freshState();createGallery();$('download').disabled=false;$('custom-mode').disabled=false;$('status').textContent='';document.body.dataset.ready='true';}).catch(err=>{$('status').textContent=err.message;$('templates').insertAdjacentHTML('beforeend','<p role="alert">Card images could not load. Please refresh this page.</p>');});
