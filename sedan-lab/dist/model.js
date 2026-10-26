/* Seeded fictional sedan. The registry is the source of truth for geometry,
   movement, extraction, picking, ancestry and live marker positions. */
'use strict';
window.buildSedanLab=function({THREE,root,parts,seed}){
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),L=THREE.MathUtils.lerp,clamp=THREE.MathUtils.clamp;
let randomState=seed>>>0;const rand=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;};
const palette=['#435a70','#afb6bd','#302e35','#8b9385','#a99c88','#7e4043'];
const config={paint:palette[Math.floor(rand()*palette.length)],roof:1.455+rand()*.035,grille:rand()>.5?1:0,spokes:5+Math.floor(rand()*3),seed:seed>>>0};
const materials={paint:new THREE.MeshPhysicalMaterial({color:config.paint,metalness:.8,roughness:.27,clearcoat:1,clearcoatRoughness:.09,envMapIntensity:.95}),glass:new THREE.MeshPhysicalMaterial({color:'#36444f',roughness:.055,metalness:0,transparent:true,opacity:.72,clearcoat:1,depthWrite:false,side:THREE.DoubleSide}),black:new THREE.MeshStandardMaterial({color:'#292d32',roughness:.78}),rubber:new THREE.MeshStandardMaterial({color:'#191c20',roughness:.86}),chrome:new THREE.MeshStandardMaterial({color:'#c0c4cc',metalness:1,roughness:.21}),metal:new THREE.MeshStandardMaterial({color:'#9aa1a7',metalness:.78,roughness:.4}),dark:new THREE.MeshStandardMaterial({color:'#515961',metalness:.6,roughness:.43}),seat:new THREE.MeshStandardMaterial({color:'#42464e',roughness:.96}),fabric:new THREE.MeshStandardMaterial({color:'#5b626b',roughness:.98}),yellow:new THREE.MeshStandardMaterial({color:'#c8a550',roughness:.45}),blue:new THREE.MeshStandardMaterial({color:'#4b8eb0',roughness:.4}),fluid:new THREE.MeshPhysicalMaterial({color:'#cbd4bf',roughness:.32,clearcoat:.5}),red:new THREE.MeshStandardMaterial({color:'#a62e2f',roughness:.25,emissive:'#d92416',emissiveIntensity:0}),lamp:new THREE.MeshPhysicalMaterial({color:'#d8e2ed',metalness:.25,roughness:.09,clearcoat:1,emissive:'#fff4df',emissiveIntensity:0}),copper:new THREE.MeshStandardMaterial({color:'#ad7750',metalness:.7,roughness:.4})};
const registry={},links=[],meshes=[],motions=[],dynamic=[],data=Object.fromEntries(parts.map(p=>[p.id,p]));
const globals={engine:false,phase:0,steer:.5,gas:0,brake:0,clutch:0,screen:0,climate:0};
function C(id,anchor,opts={}){if(!data[id])throw Error('Unknown component '+id);if(registry[id])throw Error('Duplicate component '+id);const frame=new THREE.Group(),offset=new THREE.Group(),visual=new THREE.Group(),marker=new THREE.Object3D();frame.name=id;frame.position.set(...anchor);frame.add(offset);offset.add(visual,marker);root.add(frame);const c={id,frame,offset,visual,marker,anchor:V(...anchor),materials:new Map(),meshes:[],target:data[id].neutral||0,value:data[id].neutral||0,detach:0,detachTarget:0,...opts,dir:V(...(opts.dir||[anchor[0]>.7?.18:anchor[0]<-.7?-.18:0,.16,Math.sign(anchor[2])*.22]))};registry[id]=c;data[id].point=anchor;return c;}
function material(c,m){if(!c.materials.has(m)){const n=m.clone();n.userData={baseOpacity:m.opacity,baseTransparent:m.transparent,baseEmissive:m.emissive?.clone()};c.materials.set(m,n);}return c.materials.get(m);}
function M(c,g,m,pos=[0,0,0],rotation=null,scale=null){const mesh=new THREE.Mesh(g,material(c,m));mesh.position.copy(V(...pos)).sub(c.anchor);if(rotation)mesh.rotation.set(...rotation);if(scale)mesh.scale.set(...scale);mesh.userData.part=c.id;mesh.castShadow=true;mesh.receiveShadow=false;c.visual.add(mesh);c.meshes.push(mesh);meshes.push(mesh);return mesh;}
function box(c,w,h,d,x,y,z,m=materials.metal,r=.008){return M(c,new window.RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.47,h*.47,d*.47)),m,[x,y,z]);}
function cyl(c,r,h,x,y,z,m=materials.metal,axis='y',r2=r){return M(c,new THREE.CylinderGeometry(r,r2,h,32),m,[x,y,z],axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null);}
function torus(c,r,t,x,y,z,m=materials.metal,axis='z'){return M(c,new THREE.TorusGeometry(r,t,10,48),m,[x,y,z],axis==='y'?[Math.PI/2,0,0]:axis==='x'?[0,Math.PI/2,0]:null);}
function rod(c,a,b,r,m=materials.metal){const va=V(...a),vb=V(...b),mid=va.clone().add(vb).multiplyScalar(.5);const mesh=M(c,new THREE.CylinderGeometry(r,r,va.distanceTo(vb),12),m,mid.toArray());mesh.quaternion.setFromUnitVectors(V(0,1,0),vb.sub(va).normalize());return mesh;}
function tube(c,points,r,m=materials.black){const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p))),g=new THREE.TubeGeometry(curve,Math.max(20,points.length*7),r,10,false);g.translate(-c.anchor.x,-c.anchor.y,-c.anchor.z);return M(c,g,m,c.anchor.toArray());}
function surface(c,fn,nu,nv,m=materials.paint,normal=[0,1,0]){const pos=[],nor=[],uv=[],idx=[],out=V(...normal);for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){const u=i/nu,v=j/nv,p=fn(u,v),a=fn(Math.max(0,u-.0001),v),b=fn(Math.min(1,u+.0001),v),d=fn(u,Math.max(0,v-.0001)),e=fn(u,Math.min(1,v+.0001)),n=V(b[0]-a[0],b[1]-a[1],b[2]-a[2]).cross(V(e[0]-d[0],e[1]-d[1],e[2]-d[2]));if(n.lengthSq()<1e-20)n.copy(out);else n.normalize();if(n.dot(out)<0)n.negate();pos.push(p[0]-c.anchor.x,p[1]-c.anchor.y,p[2]-c.anchor.z);nor.push(...n.toArray());uv.push(u,v);}for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;idx.push(a,b,a+1,b,b+1,a+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);for(let i=0;i<idx.length;i+=3){const a=idx[i]*3,b=idx[i+1]*3,d=idx[i+2]*3,n=V(pos[b]-pos[a],pos[b+1]-pos[a+1],pos[b+2]-pos[a+2]).cross(V(pos[d]-pos[a],pos[d+1]-pos[a+1],pos[d+2]-pos[a+2]));if(n.dot(V(nor[a],nor[a+1],nor[a+2]))<0){g.index.array[i+1]=idx[i+2];g.index.array[i+2]=idx[i+1];}}const mesh=M(c,g,m,c.anchor.toArray());mesh.material.side=THREE.DoubleSide;return mesh;}
function link(child,parent){links.push([child,parent]);}
function control(c,kind,axis,amount,neutral=0){c.control={kind,axis,amount,neutral,label:data[c.id].motion};c.target=c.value=neutral;motions.push(c);return c;}
function hinge(c,axis,angle){return control(c,'rotate',axis,angle);}
function rig(c,pivot,elements){const g=new THREE.Group();g.position.copy(V(...pivot)).sub(c.anchor);c.visual.add(g);root.updateMatrixWorld(true);g.updateWorldMatrix(true,false);for(const mesh of elements)g.attach(mesh);return g;}
function text(c,text,w,h,pos,rotation=[0,0,0],color='#cbdad5',bg='#17252b'){const cv=document.createElement('canvas');cv.width=512;cv.height=128;const ctx=cv.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 40px sans-serif';ctx.fillText(text,256,67);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return M(c,new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:.4,emissive:'#223e45',emissiveIntensity:.15,side:THREE.DoubleSide}),pos,rotation);}
function coil(c,center,r,height,turns=6,m=materials.metal){const pts=[];for(let i=0;i<=turns*16;i++){const t=i/(turns*16),a=t*turns*2*Math.PI;pts.push([center[0]+r*Math.cos(a),center[1]+height*(t-.5),center[2]+r*Math.sin(a)]);}return tube(c,pts,.006,m);}
const H=config.roof,CRANK_Y=.466,ROD_L=.19; // 90 mm stroke, 84 mm bore ≈ 1.995 litres
const sideZ=y=>.835+.042*Math.sin(clamp((y-.28)/.77,0,1)*Math.PI)-.028*Math.pow(clamp((y-.82)/.23,0,1),2);
const glassZ=y=>.817-.26*(y-1.02);
function bodySide(c,x0,x1,upper,lower,side){surface(c,(u,v)=>{const x=L(x0,x1,u),y=L(lower(x),upper(x),v),edge=Math.min(u*(x1-x0),(1-u)*(x1-x0),v*.65,(1-v)*.65),z=sideZ(y)-.003*Math.pow(1-clamp(edge/.015,0,1),2);return[x,y,side*z];},60,24,materials.paint,[0,0,side]);}
function arch(x,cx){const dx=x-cx,r=.37;return Math.abs(dx)<r?Math.max(.29,.332+Math.sqrt(r*r-dx*dx)):.29;}
function windowPatch(c,x0,x1,upper,lower,side){surface(c,(u,v)=>{const x=L(x0,x1,u),y=L(lower(x),upper(x),v);return[x,y,side*(glassZ(y)+.007*Math.sin(v*Math.PI))];},40,18,materials.glass,[0,0,side]);}

// EXTERIOR — an unmistakable three-box sedan with a fixed rear window.
const structure=C('structure',[0,.45,0],{shell:true});box(structure,3.9,.10,1.51,-.03,.35,0,materials.dark);
for(const s of [-1,1]){box(structure,2.15,.10,.10,-.15,.31,s*.815,materials.paint);tube(structure,[[1.04,1.025,s*.805],[.71,1.245,s*.752],[.34,H-.055,s*.700]],.025,materials.paint);tube(structure,[[.34,H-.055,s*.700],[-.22,H-.015,s*.714],[-.98,H-.045,s*.694],[-1.57,1.015,s*.804]],.031,materials.paint);rod(structure,[-.22,1.025,s*.815],[-.22,H-.018,s*.714],.023,materials.black);rod(structure,[-1.10,.32,s*.74],[1.03,.32,s*.74],.026,materials.dark);}
const roof=C('roof',[-.32,H,0],{shell:true,roof:true,dir:[0,.55,0]});surface(roof,(u,v)=>{const x=L(-1.00,.35,u),q=v*2-1;return[x,H-.047+.036*Math.sin(u*Math.PI)+.027*(1-q*q),q*(.697+.023*Math.sin(u*Math.PI))];},56,28);
const windshield=C('windshield',[.70,1.23,0],{shell:true,glass:true,roof:true,dir:[.25,.25,0]});surface(windshield,(u,v)=>{const q=u*2-1;return[L(1.051,.35,v)+.027*(1-q*q)*Math.sin(v*Math.PI),L(1.028,H-.060,v)+.017*(1-q*q),q*L(.795,.688,v)];},48,26,materials.glass,[.6,.8,0]);
const rearGlass=C('rear-glass',[-1.28,1.23,0],{shell:true,glass:true,roof:true,dir:[-.25,.3,0]});surface(rearGlass,(u,v)=>{const q=u*2-1;return[L(-1.61,-1.00,v)-.018*(1-q*q),L(1.035,H-.057,v),q*L(.775,.683,v)];},48,26,materials.glass,[-.6,.8,0]);
for(let i=0;i<8;i++){const v=.10+i*.105,y=L(1.035,H-.057,v),x=L(-1.61,-1.00,v)-.020,w=L(.775,.683,v);rod(rearGlass,[x,y,-w*.94],[x,y,w*.94],.0009,materials.copper);}
const hood=C('hood',[1.057,1.005,0],{shell:true,dir:[.15,.45,0]});hinge(hood,'z',1.05);
function bonnet(u,v){const q=v*2-1,front=2.24-.19*Math.pow(Math.abs(q),3),x=L(1.06,front,u);return[x,1.01-.185*u+.025*Math.sin(Math.PI*u)+.025*(1-q*q)+.050*Math.pow(Math.abs(q),3)*u,q*L(.791,.774,u)];}
surface(hood,bonnet,64,36);surface(hood,(u,v)=>{const p=bonnet(u,v);p[1]-=.006;return p;},40,20,materials.black);
const trunk=C('trunk',[-1.604,1.028,0],{shell:true,dir:[-.15,.45,0]});hinge(trunk,'z',-1.13);surface(trunk,(u,v)=>{const q=v*2-1;return[L(-1.60,-2.235,u),1.026-.105*u+.026*(1-q*q)+.018*Math.sin(u*Math.PI),q*L(.785,.751,u)];},56,30);
surface(trunk,(u,v)=>[L(-1.61,-2.20,u),1.013-.10*u,L(-.72,.72,v)],28,16,materials.black);
const frontBumper=C('front-bumper',[2.25,.48,0],{shell:true,dir:[.55,.02,0]});const rearBumper=C('rear-bumper',[-2.27,.46,0],{shell:true,dir:[-.55,.02,0]});
function frontX(z,y){return 2.345-.31*Math.pow(Math.abs(z)/.89,3)+.012*Math.sin((y-.26)*Math.PI*2);}
function rearX(z,y){return -2.345+.26*Math.pow(Math.abs(z)/.89,3)-.014*Math.sin((y-.27)*Math.PI*3);}
surface(frontBumper,(u,v)=>{const z=L(-.875,.875,u),q=Math.abs(z)/.875,y=L(.265,.735-.025*q,v);return[frontX(z,y),y,z];},64,24,materials.paint,[1,0,0]);
surface(rearBumper,(u,v)=>{const z=L(-.875,.875,u),y=L(.265,.64,v),roll=.012*Math.pow(Math.abs(z)/.875,12);return[rearX(z,y)+roll,y,z];},64,24,materials.paint,[-1,0,0]);
surface(frontBumper,(u,v)=>{const z=L(-.443,.443,u),q=z/.774,h=bonnet(1,(q+1)/2),t=v;return[L(h[0],frontX(z,.842)-.006,t),L(h[1],.842,t)+.007*Math.sin(t*Math.PI),z];},44,12,materials.paint,[1,1,0]);
surface(trunk,(u,v)=>{const z=L(-.377,.377,u),y=L(.643,.922,v);return[-2.282-.008*Math.sin(v*Math.PI),y,z];},32,18,materials.paint,[-1,0,0]);
box(structure,.10,.10,1.55,2.145,.52,0,materials.dark);box(structure,.10,.10,1.5,-2.14,.49,0,materials.dark);
surface(frontBumper,(u,v)=>{const z=L(-.70,.70,u),y=L(.325,.415,v);return[frontX(z,y)+.004,y,z];},40,8,materials.black,[1,0,0]);
surface(rearBumper,(u,v)=>{const z=L(-.84,.84,u),y=L(.34,.405,v);return[rearX(z,y)-.004,y,z];},40,8,materials.black,[-1,0,0]);
text(frontBumper,'SEDAN / LAB',.47,.105,[2.372,.485,0],[0,Math.PI/2,0],'#203130','#f5f5ed');text(rearBumper,'SEDAN / LAB',.46,.10,[-2.372,.51,0],[0,-Math.PI/2,0],'#203130','#f5f5ed');
const grille=C('grille',[2.30,.774,0],{shell:true,dir:[.4,.1,0]});surface(grille,(u,v)=>{const z=L(-.43,.43,u),y=L(.716,.840+.018*(1-Math.pow(z/.43,2)),v);return[frontX(z,y)-.011,y,z];},40,12,materials.black,[1,0,0]);
for(let i=0;i<(config.grille?11:4);i++){if(config.grille){const z=L(-.39,.39,i/10);rod(grille,[frontX(z,.73),.73,z],[frontX(z,.835),.835,z],.003,materials.chrome);}else{const y=.735+i*.029,pts=[];for(let j=0;j<=20;j++){const z=L(-.41,.41,j/20);pts.push([frontX(z,y),y,z]);}tube(grille,pts,.0035,materials.chrome);}}
for(const [s,side] of [['l',1],['r',-1]]){
  const f=C('front-fender-'+s,[1.47,.79,side*.85],{shell:true,dir:[.12,.15,side*.35]});bodySide(f,.947,2.10,x=>1.018-.145*Math.pow(clamp((x-.95)/1.15,0,1),1.4),x=>arch(x,1.38),side);
  surface(f,(u,v)=>{const h=bonnet(u,side===1?1:0),x=h[0],y=1.018-.145*Math.pow(clamp((x-.95)/1.15,0,1),1.4),t=v,a=1-t,inner=Math.abs(h[2])+.002,outer=sideZ(y);return[x,a*a*a*h[1]+3*a*a*t*(h[1]+.004)+3*a*t*t*(y+.025)+t*t*t*y,side*(a*a*a*inner+3*a*a*t*(inner+.027)+3*a*t*t*(outer-.005)+t*t*t*outer)];},56,16);
  const r=C('rear-quarter-'+s,[-1.60,.76,side*.85],{shell:true,dir:[-.15,.15,side*.35]});bodySide(r,-2.14,-1.227,x=>1.025-.10*clamp((-x-1.60)/.54,0,1),x=>arch(x,-1.38),side);
  surface(r,(u,v)=>{const x=L(-2.23,-1.60,u),inner=.755,outer=sideZ(.96);return[x,L(.96,1.026,u)+.015*Math.sin(v*Math.PI),side*L(inner,outer,v)];},36,12);
  // C pillar fills the space between the sloping backlight and rear door frame.
  surface(r,(u,v)=>{const x=L(-1.60,-.98,u),lo=1.025,hi=L(1.04,H-.045,u),y=L(lo,hi,v);return[x,y,side*(glassZ(y)+.012)];},36,18);
  for(const cx of [1.38,-1.38]){const owner=cx>0?f:r;surface(owner,(u,v)=>{const a=L(-.05,Math.PI+.05,u),ra=L(.362,.371,v),x=cx+ra*Math.cos(a),y=.332+ra*Math.sin(a);return[x,y,side*(sideZ(y)-.012*(1-v)*(1-v))];},64,8,materials.paint,[0,0,side]);}
  const head=C('headlamp-'+s,[2.13,.81,side*.63],{shell:true,dir:[.35,.10,side*.17]});control(head,'light',null,1);
  const lamp=(u,v,d=0)=>{const z=side*L(.446,.855,u),y=L(.738+.033*u,.865+.015*u,v);return[2.275-.15*u-.08*v*u+d,y,z];};surface(head,(u,v)=>lamp(u,v,-.025),32,14,materials.chrome,[1,0,side*.2]);
  for(const [u,rad] of [[.24,.044],[.66,.053]]){const p=lamp(u,.5,-.006);cyl(head,rad,.018,...p,materials.dark,'x');torus(head,rad,.003,p[0]+.012,p[1],p[2],materials.chrome,'x');const bulb=cyl(head,rad*.6,.020,p[0]+.013,p[1],p[2],materials.lamp,'x');head.lights??=[];head.lights.push(bulb.material);}
  const lm=new THREE.MeshPhysicalMaterial({color:'#e8edf2',roughness:.055,clearcoat:1,transparent:true,opacity:.23,depthWrite:false,side:THREE.DoubleSide});surface(head,(u,v)=>lamp(u,v,.008),40,18,lm,[1,0,side*.2]);
  const tail=C('tail-lamp-'+s,[-2.22,.80,side*.66],{shell:true,dir:[-.35,.1,side*.15]});control(tail,'tail',null,1);surface(tail,(u,v)=>{const z=side*L(.38,.856,u),y=L(.722,.887,v);return[-2.29+.12*u+.04*u*v,y,z];},36,16,materials.red,[-1,0,side*.2]);tail.lights=[...tail.materials.values()];
  const w=C('wiper-'+s,[1.065,1.044,side*.15],{dir:[0,.13,0]});control(w,'wiper',null,1);const wm=rod(w,[1.065,1.044,side*.15],[1.025,1.06,side*.65],.005,materials.black);box(w,.013,.009,.40,1.023,1.065,side*.47,materials.black,.003);
  for(const [ax,x0,x1] of [['f',-.215,.943],['b',-1.223,-.219]]){
    const id='door-'+s+ax,anchor=[x1,.30,side*.813],door=C(id,anchor,{shell:true,dir:[0,.08,side*.4]});hinge(door,'y',side*1.05);
    bodySide(door,x0,x1,()=>1.022,x=>ax==='b'?arch(x,-1.38)+.003:.30,side);
    const strips=[];for(let i=0;i<=20;i++){const x=L(x0+.035,x1-.025,i/20);strips.push([x,.565,side*(sideZ(.565)+.007)]);}tube(door,strips,.011,materials.black);
    const hx=x0+.145;box(door,.152,.025,.024,hx,.868,side*(sideZ(.868)+.02),materials.chrome,.01);
    const win=C('window-'+s+ax,[L(x0,x1,.5),1.20,side*.77],{shell:true,glass:true,dir:[0,.20,side*.18]});control(win,'translate','y',-.365);
    const top=ax==='f'?(x=>H-.065-.403*Math.pow(clamp((x-.12)/.82,0,1),1.5)):(x=>H-.065-.27*Math.pow(clamp((-x-.88)/.343,0,1),1.3));
    windowPatch(win,x0+.014,x1-.012,top,()=>1.035,side);link(win.id,door.id);
    const framePts=[];for(let i=0;i<=24;i++){const x=L(x0,x1,i/24),y=top(x)+.008;framePts.push([x,y,side*(glassZ(y)+.008)]);}tube(door,framePts,.011,materials.black);rod(door,[x0,1.027,side*.815],[x1,1.027,side*.815],.009,materials.black);
    const card=C('door-card-'+s+ax,[L(x0,x1,.5),.66,side*.78],{dir:[0,.03,-side*.25]});box(card,(x1-x0)*.88,.43,.036,L(x0,x1,.5),.65,side*.775,materials.black,.016);box(card,.43,.045,.067,L(x0,x1,.5),.73,side*.735,materials.seat,.014);link(card.id,door.id);
    if(ax==='f'){
      const mirror=C('mirror-'+s,[.826,1.095,side*.838],{shell:true,dir:[0,.1,side*.24]});hinge(mirror,'y',-side*1.18);rod(mirror,[.825,1.095,side*.84],[.825,1.106,side*.967],.015,materials.black);M(mirror,new THREE.SphereGeometry(1,32,20),materials.paint,[.825,1.12,side*.978],null,[.13,.060,.086]);M(mirror,new THREE.CircleGeometry(1,40),materials.chrome,[.707,1.12,side*.978],[0,-Math.PI/2,0],[.070,.044,1]);link(mirror.id,door.id);
    }
  }
}
const flap=C('fuel-flap',[-1.63,.89,-.856],{shell:true,dir:[-.08,.07,-.23]});hinge(flap,'y',-1.12);box(flap,.17,.145,.010,-1.72,.89,-.863,materials.paint,.018);
const fuelCap=C('fuel-cap',[-1.72,.89,-.844],{dir:[0,0,-.18]});control(fuelCap,'cap','z',-1);cyl(fuelCap,.050,.025,-1.72,.89,-.844,materials.black,'z');

// CABIN — independent, parented motions for seat sliders, backs and head restraints.
const dash=C('dashboard',[.59,.91,0],{dir:[.05,.3,0]});box(dash,.38,.28,1.44,.62,.89,0,materials.black,.05);box(dash,.40,.05,1.45,.64,1.04,0,materials.seat,.02);
const cluster=C('cluster',[.424,1.061,.42],{dir:[-.15,.18,.05]});box(cluster,.10,.12,.29,.46,1.06,.42,materials.black,.024);text(cluster,'0 km/h   |   0 rpm',.245,.064,[.401,1.06,.42],[0,-Math.PI/2,0]);
const screen=C('screen',[.394,.98,0],{dir:[-.18,.15,0]});control(screen,'screen',null,1);box(screen,.055,.15,.235,.40,.97,0,materials.black,.016);screen.screenMesh=text(screen,'SEDAN / LAB',.205,.107,[.368,.978,0],[0,-Math.PI/2,0],'#8fcfc4','#10252e');
const sw=C('steering-wheel',[.295,.987,.42],{dir:[-.18,.12,.12]});control(sw,'steer',null,1,.5);torus(sw,.153,.014,.295,.987,.42,materials.black,'x');cyl(sw,.050,.05,.295,.987,.42,materials.black,'x');for(let i=0;i<3;i++){const a=i*Math.PI*2/3;rod(sw,[.295,.987,.42],[.295,.987+.139*Math.cos(a),.42+.139*Math.sin(a)],.011,materials.black);}
const hvac=C('hvac',[.79,.70,-.07],{dir:[.2,-.07,0]});box(hvac,.26,.30,.49,.80,.73,-.07,materials.black,.032);for(const z of [-.58,-.30,.30,.58]){box(hvac,.015,.055,.15,.425,.98,z,materials.dark,.006);tube(hvac,[[.80,.82,-.07],[.65,.89,z],[.49,.97,z]],.028,materials.black);}
const climate=C('climate-controls',[.38,.83,0],{dir:[-.15,.12,0]});control(climate,'climate',null,1);box(climate,.06,.075,.24,.392,.842,0,materials.dark,.010);for(const z of [-.074,0,.074])cyl(climate,.022,.015,.350,.84,z,materials.chrome,'x');
const cabinFilter=C('cabin-filter',[.72,.67,-.38],{dir:[0,-.12,-.22]});box(cabinFilter,.17,.035,.23,.72,.67,-.38,materials.fluid,.006);for(let i=0;i<12;i++)box(cabinFilter,.008,.039,.22,.645+i*.013,.67,-.38,materials.seat,.002);
const glove=C('glovebox',[.43,.74,-.46],{dir:[-.2,.04,-.1]});hinge(glove,'z',.95);box(glove,.020,.18,.43,.42,.825,-.46,materials.seat,.01);box(glove,.012,.018,.09,.405,.88,-.46,materials.chrome,.005);box(dash,.27,.18,.45,.61,.80,-.46,materials.black,.015);
const gear=C('gear-lever',[.16,.58,0],{dir:[-.05,.20,0]});hinge(gear,'z',.16);box(gear,.16,.04,.16,.16,.55,0,materials.black,.014);rod(gear,[.16,.57,0],[.16,.75,0],.009,materials.chrome);M(gear,new THREE.SphereGeometry(.034,24,16),materials.black,[.16,.775,0],null,[1,.8,.85]);
const hand=C('handbrake',[-.25,.56,.11],{dir:[0,.18,.1]});hinge(hand,'z',-.45);rod(hand,[-.25,.56,.11],[.01,.59,.11],.018,materials.black);
for(const [id,z,kind] of [['gas-pedal',.31,'gas'],['brake-pedal',.44,'brake'],['clutch-pedal',.57,'clutch']]){const c=C(id,[.72,.65,z],{dir:[-.14,.02,0]});control(c,kind,null,1);rod(c,[.72,.65,z],[.55,.43,z],.009,materials.dark);box(c,.035,.09,.058,.55,.43,z,materials.rubber,.009);}
for(const [s,side] of [['l',1],['r',-1]]){
  const seat=C('seat-'+s,[-.06,.59,side*.41],{dir:[-.12,.22,side*.17]});control(seat,'translate','x',.18);box(seat,.48,.14,.49,-.06,.60,side*.41,materials.seat,.055);box(seat,.34,.014,.34,-.06,.678,side*.41,materials.fabric,.005);for(const z of [side*.41-.16,side*.41+.16])rod(seat,[.18,.46,z],[-.32,.46,z],.015,materials.dark);
  const back=C('seat-back-'+s,[-.30,.67,side*.41],{dir:[-.15,.22,side*.15]});hinge(back,'z',-.26);const bm=box(back,.13,.51,.47,-.30,.91,side*.41,materials.seat,.05);bm.rotation.z=-.10;box(back,.025,.35,.32,-.224,.92,side*.41,materials.fabric,.01);link(back.id,seat.id);
  const rest=C('headrest-'+s,[-.33,1.24,side*.41],{dir:[0,.22,0]});control(rest,'translate','y',.085);box(rest,.10,.16,.29,-.33,1.255,side*.41,materials.seat,.035);for(const z of [side*.41-.09,side*.41+.09])rod(rest,[-.33,1.10,z],[-.33,1.21,z],.006,materials.chrome);link(rest.id,back.id);
  const belt=C('belt-'+s,[-.33,1.03,side*.63],{dir:[-.08,.15,side*.12]});rod(belt,[-.37,1.29,side*.70],[-.13,.66,side*.18],.012,materials.black);box(belt,.044,.055,.033,-.13,.66,side*.18,materials.red,.009);
  const visor=C('visor-'+s,[.34,H-.085,side*.38],{dir:[0,-.12,side*.09]});hinge(visor,'z',1.15);box(visor,.20,.022,.32,.24,H-.085,side*.38,materials.fabric,.01);
}
const rearSeat=C('rear-seat',[-.94,.59,0],{dir:[0,.3,0]});box(rearSeat,.49,.14,1.31,-.96,.59,0,materials.seat,.04);
for(const [s,z,w] of [['l',.27,.75],['r',-.40,.50]]){const back=C('rear-back-'+s,[-1.17,.65,z],{dir:[-.1,.3,Math.sign(z)*.10]});hinge(back,'z',-1.32);box(back,.12,.48,w,-1.17,.88,z,materials.seat,.035);for(const dz of w>.6?[-.20,.20]:[0]){box(back,.10,.14,.23,-1.18,1.19,z+dz,materials.seat,.025);rod(back,[-1.18,1.05,z+dz],[-1.18,1.14,z+dz],.006,materials.chrome);}}
const bootFloor=C('boot-floor',[-2.10,.53,0],{dir:[0,.3,0]});hinge(bootFloor,'z',-.9);box(bootFloor,.62,.028,1.30,-1.80,.535,0,materials.seat,.008);
const spare=C('spare',[-1.80,.43,0],{dir:[0,.35,0]});torus(spare,.225,.060,-1.80,.43,0,materials.rubber,'y');cyl(spare,.188,.035,-1.80,.43,0,materials.dark,'y');

// ENGINE castings and peripheral systems. Four cylinders run across the car, along Z.
const engineCover=C('engine-cover',[1.36,1.01,0],{dir:[.04,.42,0]});box(engineCover,.60,.065,.68,1.36,1.005,0,materials.black,.04);text(engineCover,'2.0 MPI · 16V',.36,.065,[1.35,1.043,0],[-Math.PI/2,0,Math.PI/2]);
const camCover=C('cam-cover',[1.36,.942,0],{dir:[.02,.28,0]});box(camCover,.41,.065,.56,1.36,.942,0,materials.dark,.025);
const head=C('head',[1.36,.819,0],{dir:[.1,.36,0]});box(head,.43,.17,.56,1.36,.815,0,materials.metal,.015);for(let i=0;i<6;i++)box(head,.44,.008,.023,1.36,.77,-.30+i*.12,materials.dark,.003);
const block=C('block',[1.36,.59,0],{dir:[.0,.1,-.38]});box(block,.41,.31,.53,1.36,.585,0,materials.metal,.022);for(let i=0;i<4;i++){const z=-.165+i*.110;torus(block,.0422,.002,1.36,.743,z,materials.dark,'y');}
const pan=C('oil-pan',[1.36,.385,0],{dir:[0,-.26,0]});box(pan,.44,.12,.68,1.36,.385,0,materials.dark,.025);for(const z of [-.28,.28])for(const x of [1.18,1.36,1.54])cyl(pan,.008,.014,x,.451,z,materials.chrome);
const oilCap=C('oil-cap',[1.49,.986,.26],{dir:[0,.15,0]});control(oilCap,'cap','y',1);cyl(oilCap,.041,.026,1.49,.986,.26,materials.yellow);box(oilCap,.045,.010,.013,1.49,1.004,.26,materials.black,.003);
const dip=C('dipstick',[1.62,.91,.31],{dir:[0,.23,0]});control(dip,'translate','y',.22);rod(dip,[1.62,.43,.31],[1.62,.88,.31],.003,materials.metal);torus(dip,.024,.006,1.62,.91,.31,materials.yellow,'z');
const oilFilter=C('oil-filter',[1.62,.51,.17],{dir:[.19,-.06,.03]});cyl(oilFilter,.048,.10,1.62,.51,.17,materials.black,'x');
const oilPump=C('oil-pump',[1.43,.43,-.34],{dir:[.16,-.1,-.16]});box(oilPump,.14,.12,.06,1.43,.43,-.34,materials.metal,.018);tube(oilPump,[[1.43,.43,-.34],[1.44,.385,-.18],[1.35,.37,0]],.012,materials.dark);
const crank=C('crankshaft',[1.36,CRANK_Y,0],{dir:[0,-.20,.15]});control(crank,'engine',null,1);cyl(crank,.019,.83,1.36,CRANK_Y,0,materials.dark,'z');const phases=[0,Math.PI,3*Math.PI,2*Math.PI];
for(let i=0;i<4;i++){const z=-.165+i*.110,p=phases[i],px=1.36+.045*Math.sin(p),py=CRANK_Y+.045*Math.cos(p);cyl(crank,.016,.065,px,py,z,materials.chrome,'z');for(const dz of [-.045,.045]){box(crank,.055,.09,.016,1.36+.0225*Math.sin(p),CRANK_Y+.0225*Math.cos(p),z+dz,materials.dark,.01);}}
for(const [id,x] of [['cam-in',1.278],['cam-ex',1.442]]){const cam=C(id,[x,.902,0],{dir:[id==='cam-in'?-.2:.2,.17,0]});control(cam,'engine',null,1);cyl(cam,.013,.69,x,.902,0,materials.dark,'z');for(let i=0;i<4;i++)for(const dz of [-.017,.017]){const z=-.165+i*.110+dz,alpha=(id==='cam-in'?.75:-.75)*Math.PI+phases[i]/2,path=new THREE.Shape();for(let k=0;k<=64;k++){const a=k/64*Math.PI*2,r=.014+.014*Math.pow(Math.max(0,Math.cos(a-alpha)),4),px=r*Math.sin(a),py=r*Math.cos(a);if(k===0)path.moveTo(px,py);else path.lineTo(px,py);}path.closePath();const g=new THREE.ExtrudeGeometry(path,{depth:.010,bevelEnabled:true,bevelSize:.0008,bevelThickness:.0008,bevelSegments:2,curveSegments:8});g.translate(0,0,-.005);M(cam,g,materials.chrome,[x,.902,z]);}}
const valveRigs=[],rodRigs=[],sparks=[];
for(let i=0;i<4;i++){
  const z=-.165+i*.110,n=i+1,phase=phases[i],pistonY=CRANK_Y+.045*Math.cos(phase)+Math.sqrt(ROD_L*ROD_L-Math.pow(.045*Math.sin(phase),2));
  const piston=C('piston-'+n,[1.36,pistonY,z],{dir:[0,.20,Math.sign(z||1)*.15]});control(piston,'engine',null,1);cyl(piston,.0417,.058,1.36,pistonY,z,materials.metal);for(const dy of [.016,.023])torus(piston,.0419,.0010,1.36,pistonY+dy,z,materials.dark,'y');cyl(piston,.011,.095,1.36,pistonY-.009,z,materials.chrome,'z');
  const px=1.36+.045*Math.sin(phase),py=CRANK_Y+.045*Math.cos(phase),mid=V(px,py,z).add(V(1.36,pistonY,z)).multiplyScalar(.5),rc=C('rod-'+n,mid.toArray(),{dir:[.14,0,Math.sign(z||1)*.16]});control(rc,'engine',null,1);
  const rr=new THREE.Group();rc.visual.add(rr);const shaft=new THREE.Mesh(new window.RoundedBoxGeometry(.024,ROD_L,.016,2,.005),material(rc,materials.metal));rr.add(shaft);shaft.userData.part=rc.id;rc.meshes.push(shaft);meshes.push(shaft);for(const y of [-ROD_L/2,ROD_L/2]){const ring=new THREE.Mesh(new THREE.TorusGeometry(y<0?.021:.013,.004,8,24),material(rc,materials.metal));ring.position.y=y;ring.userData.part=rc.id;rr.add(ring);rc.meshes.push(ring);meshes.push(ring);}rodRigs.push({c:rc,rig:rr,z,phase});rc.markerRig=rr;
  const co=C('coil-'+n,[1.36,.978,z],{dir:[0,.20,0]});cyl(co,.021,.17,1.36,.950,z,materials.black);box(co,.065,.030,.065,1.36,1.030,z,materials.black,.009);
  const sp=C('spark-'+n,[1.36,.855,z],{dir:[0,.16,0]});cyl(sp,.008,.118,1.36,.800,z,materials.fluid);cyl(sp,.011,.021,1.36,.754,z,materials.chrome);const glow=M(sp,new THREE.SphereGeometry(.009,12,8),materials.lamp,[1.36,.740,z]);sparks.push({mesh:glow,phase});
  const inj=C('injector-'+n,[1.15,.848,z],{dir:[-.14,.15,0]});cyl(inj,.011,.072,1.15,.848,z,materials.dark);box(inj,.026,.023,.026,1.15,.885,z,materials.black,.005);
  for(const type of ['in','ex'])for(let j=0;j<2;j++){
    const x=type==='in'?1.340:1.380,vz=z+(j?1:-1)*.017,c=C(`valve-${type}-${n}-${j+1}`,[x,.815,vz],{dir:[type==='in'?-.14:.14,.14,Math.sign(z||1)*.11]});control(c,'engine',null,1);
    const stem=cyl(c,.0035,.124,x,.800,vz,materials.chrome),disc=cyl(c,type==='in'?.014:.012,.005,x,.736,vz,materials.chrome);const vr=rig(c,[x,.815,vz],[stem,disc]);const spring=coil(c,[x,.842,vz],.009,.032,5,materials.metal),camX=type==='in'?1.278:1.442,a=[camX,.888,vz],b=[x,.860,vz],rocker=rod(c,a,b,.0045,materials.dark),rockerLength=V(...a).distanceTo(V(...b));valveRigs.push({c,rig:vr,spring,phase,type,rocker,rockerLength,camX,x,vz});
  }
}
const timingCover=C('timing-cover',[1.36,.715,-.414],{dir:[0,.02,-.25]});box(timingCover,.36,.50,.04,1.36,.715,-.414,materials.black,.033);
const timing=C('timing-belt',[1.36,.68,-.438],{dir:[0,.04,-.18]});control(timing,'engine',null,1);for(const x of [1.278,1.442])cyl(timing,.075,.018,x,.902,-.438,materials.dark,'z');cyl(timing,.0375,.022,1.36,.43,-.438,materials.dark,'z');tube(timing,[[1.203,.902,-.452],[1.22,.967,-.452],[1.442,.977,-.452],[1.515,.91,-.452],[1.49,.70,-.452],[1.40,.397,-.452],[1.33,.397,-.452],[1.203,.902,-.452]],.010,materials.rubber);
const tension=C('tensioner',[1.46,.64,-.442],{dir:[.12,0,-.16]});cyl(tension,.031,.032,1.46,.64,-.442,materials.metal,'z');
const acc=C('accessory-belt',[1.52,.56,-.49],{dir:[.1,.02,-.16]});tube(acc,[[1.36,.43,-.49],[1.72,.45,-.49],[1.73,.65,-.49],[1.50,.69,-.49],[1.36,.43,-.49]],.009,materials.rubber);
const alt=C('alternator',[1.70,.57,-.39],{dir:[.2,.02,-.14]});control(alt,'spin-rig','z',10);cyl(alt,.065,.15,1.70,.57,-.39,materials.metal,'z');for(let i=0;i<10;i++){const a=i/10*Math.PI*2;box(alt,.018,.008,.12,1.70+.058*Math.sin(a),.57+.058*Math.cos(a),-.39,materials.dark,.002);}const altPulley=cyl(alt,.047,.018,1.70,.57,-.48,materials.dark,'z');alt.rig=rig(alt,[1.70,.57,-.48],[altPulley]);
const starter=C('starter',[1.42,.50,.49],{dir:[.17,.03,.16]});cyl(starter,.044,.18,1.42,.50,.49,materials.dark,'z');cyl(starter,.021,.10,1.47,.54,.49,materials.black,'z');
const pump=C('water-pump',[1.28,.64,-.39],{dir:[-.1,.04,-.17]});cyl(pump,.039,.075,1.28,.64,-.39,materials.metal,'z');
const thermostat=C('thermostat',[1.56,.75,.31],{dir:[.15,.05,.15]});box(thermostat,.10,.09,.09,1.56,.75,.31,materials.black,.025);
const radiator=C('radiator',[2.065,.61,0],{dir:[.40,.1,0]});box(radiator,.065,.39,1.30,2.065,.61,0,materials.dark,.012);for(let i=0;i<31;i++)box(radiator,.009,.35,.012,2.103,.61,-.60+i*.04,materials.metal,.002);tube(radiator,[[2.03,.76,.47],[1.88,.80,.44],[1.56,.75,.31]],.026,materials.rubber);tube(radiator,[[2.03,.43,-.49],[1.78,.42,-.41],[1.28,.64,-.39]],.022,materials.rubber);
for(const [s,z] of [['l',.30],['r',-.30]]){const c=C('fan-'+s,[1.992,.61,z],{dir:[-.12,.05,Math.sign(z)*.12]});control(c,'spin','x',20);torus(c,.146,.008,1.992,.61,z,materials.black,'x');cyl(c,.027,.025,1.992,.61,z,materials.black,'x');for(let i=0;i<7;i++){const a=i/7*Math.PI*2,b=box(c,.015,.045,.12,1.992,.61+.075*Math.sin(a),z+.075*Math.cos(a),materials.black,.006);b.rotation.x=-a;}}
const ct=C('coolant-tank',[1.75,.80,-.65],{dir:[0,.18,-.13]});box(ct,.19,.23,.16,1.75,.78,-.65,materials.fluid,.035);
const cc=C('coolant-cap',[1.75,.915,-.65],{dir:[0,.14,0]});control(cc,'cap','y',1);cyl(cc,.042,.024,1.75,.915,-.65,materials.black);
const wt=C('washer-tank',[1.93,.55,.66],{dir:[.13,.14,.1]});box(wt,.16,.24,.14,1.93,.55,.66,materials.fluid,.022);rod(wt,[1.93,.65,.66],[1.93,.81,.66],.023,materials.fluid);
const wc=C('washer-cap',[1.91,.82,.66],{dir:[0,.13,0]});hinge(wc,'z',1.4);cyl(wc,.036,.015,1.93,.82,.66,materials.blue);
const battery=C('battery',[1.18,.77,.62],{dir:[0,.26,.08]});box(battery,.32,.24,.27,1.18,.75,.62,materials.black,.012);box(battery,.33,.035,.28,1.18,.887,.62,materials.dark,.008);box(battery,.045,.022,.045,1.08,.921,.56,materials.red,.005);box(battery,.045,.022,.045,1.28,.921,.68,materials.metal,.005);box(battery,.028,.014,.24,1.18,.915,.62,materials.chrome,.004);
const fuse=C('fusebox',[.90,.79,.60],{dir:[-.10,.20,.1]});box(fuse,.19,.14,.24,.90,.78,.60,materials.black,.014);const fuseLid=box(fuse,.195,.020,.245,.90,.86,.60,materials.black,.008);fuse.rig=rig(fuse,[.803,.86,.60],[fuseLid]);control(fuse,'rig-rotate','z',1.3);for(let i=0;i<8;i++)box(fuse,.018,.020,.025,.84+(i%4)*.036,.852,.55+Math.floor(i/4)*.07,i%2?materials.yellow:materials.blue,.003);
const ecu=C('ecu',[.85,.72,-.53],{dir:[-.08,.15,-.1]});box(ecu,.19,.04,.25,.85,.72,-.53,materials.metal,.012);for(let i=0;i<6;i++)box(ecu,.015,.012,.23,.78+i*.026,.751,-.53,materials.dark,.002);
const airbox=C('airbox',[.92,.79,-.22],{dir:[-.18,.18,0]});box(airbox,.23,.18,.35,.92,.78,-.22,materials.black,.018);const airLid=box(airbox,.24,.023,.36,.92,.886,-.22,materials.black,.009);airbox.rig=rig(airbox,[.80,.886,-.22],[airLid]);control(airbox,'rig-rotate','z',1.35);
const af=C('air-filter',[.92,.855,-.22],{dir:[0,.19,0]});box(af,.20,.022,.30,.92,.854,-.22,materials.fluid,.005);for(let i=0;i<14;i++)box(af,.007,.025,.29,.827+i*.014,.854,-.22,materials.fabric,.0015);link(af.id,airbox.id);
const throttle=C('throttle',[1.04,.85,-.02],{dir:[-.15,.10,.04]});control(throttle,'gas',null,1);cyl(throttle,.048,.07,1.04,.85,-.02,materials.metal,'x');const flapMesh=cyl(throttle,.041,.003,1.04,.85,-.02,materials.chrome,'x');throttle.rig=rig(throttle,[1.04,.85,-.02],[flapMesh]);
const intake=C('intake',[1.12,.82,0],{dir:[-.24,.16,0]});box(intake,.11,.11,.62,1.09,.84,0,materials.black,.04);for(let i=0;i<4;i++){const z=-.165+i*.110;tube(intake,[[1.09,.84,z],[1.17,.93,z],[1.22,.90,z],[1.25,.82,z]],.025,materials.black);}tube(intake,[[.96,.80,-.15],[.99,.84,-.08],[1.04,.85,-.02]],.040,materials.rubber);
const rail=C('fuel-rail',[1.15,.895,0],{dir:[-.12,.18,0]});cyl(rail,.014,.65,1.15,.895,0,materials.metal,'z');
for(const [id,a] of [['map',[1.09,.91,.24]],['ckp',[1.40,CRANK_Y,.39]],['cmp',[1.28,.915,.36]],['knock',[1.57,.61,0]],['temperature',[1.58,.77,.34]]]){const c=C(id,a,{dir:[.13,.13,Math.sign(a[2]||1)*.12]});cyl(c,.014,.035,...a,materials.dark);box(c,.023,.020,.024,a[0],a[1]+.025,a[2],materials.black,.004);tube(c,[a,[a[0]+.07,a[1]+.04,a[2]],[.9,.74,-.52]],.0035,materials.black);}

// DRIVELINE AND BRAKE HYDRAULICS.
const gearbox=C('gearbox',[1.36,.53,.55],{dir:[.05,.02,.38]});box(gearbox,.44,.30,.35,1.36,.52,.55,materials.metal,.04);for(let i=0;i<5;i++)box(gearbox,.026,.26,.31,1.18+i*.087,.52,.55,materials.dark,.006);
const fly=C('flywheel',[1.36,CRANK_Y,.43],{dir:[0,0,.22]});cyl(fly,.115,.022,1.36,CRANK_Y,.43,materials.dark,'z');for(let i=0;i<36;i++){const a=i/36*Math.PI*2;box(fly,.013,.010,.023,1.36+.114*Math.sin(a),CRANK_Y+.114*Math.cos(a),.43,materials.metal,.002);}
const clutch=C('clutch',[1.36,CRANK_Y,.462],{dir:[0,0,.25]});control(clutch,'clutch',null,1);cyl(clutch,.103,.017,1.36,CRANK_Y,.462,materials.metal,'z');cyl(clutch,.074,.010,1.36,CRANK_Y,.480,materials.black,'z');
const diff=C('differential',[1.38,.38,.51],{dir:[0,-.10,.26]});cyl(diff,.066,.18,1.38,.38,.51,materials.dark,'z');torus(diff,.066,.008,1.38,.38,.51,materials.chrome,'z');
const frontSub=C('front-subframe',[1.26,.29,0],{dir:[0,-.28,0]});for(const z of [-.43,.43])rod(frontSub,[.85,.28,z],[1.70,.28,z],.037,materials.dark);for(const x of [.93,1.61])rod(frontSub,[x,.28,-.43],[x,.28,.43],.037,materials.dark);
const rearSub=C('rear-subframe',[-1.33,.31,0],{dir:[0,-.28,0]});for(const z of [-.43,.43])rod(rearSub,[-1.59,.31,z],[-1.03,.31,z],.034,materials.dark);for(const x of [-1.52,-1.10])rod(rearSub,[x,.31,-.43],[x,.31,.43],.034,materials.dark);
const booster=C('brake-booster',[.85,.79,.33],{dir:[-.17,.10,.12]});cyl(booster,.09,.085,.85,.79,.33,materials.black,'x');
const master=C('master-cylinder',[.98,.79,.33],{dir:[.17,.08,.08]});cyl(master,.024,.16,.98,.79,.33,materials.metal,'x');
const br=C('brake-reservoir',[.99,.86,.33],{dir:[0,.19,0]});box(br,.12,.085,.09,.99,.86,.33,materials.fluid,.018);cyl(br,.031,.012,.99,.91,.33,materials.yellow);
const abs=C('abs',[.90,.63,.62],{dir:[-.13,.1,.15]});box(abs,.13,.13,.13,.90,.63,.62,materials.metal,.012);cyl(abs,.045,.10,.90,.63,.72,materials.black,'z');
const lines=C('brake-lines',[0,.37,0],{dir:[0,-.13,0]});for(const x of [1.38,-1.38])for(const side of [-1,1])tube(lines,[[.9,.65,.62],[.78,.40,side*.62],[x,.39,side*.68],[x,.34,side*.81]],.0035,materials.metal);
const rack=C('rack',[1.13,.39,0],{dir:[0,-.14,.05]});control(rack,'steer',null,1,.5);cyl(rack,.024,1.19,1.13,.39,0,materials.dark,'z');rod(rack,[1.13,.39,.25],[.34,.94,.42],.010,materials.metal);
for(const [s,side] of [['l',1],['r',-1]]){
  const half=C('halfshaft-'+s,[1.38,.37,side*.44],{dir:[.05,-.07,side*.23]});half.shaftMesh=rod(half,[1.38,.37,side*.11],[1.38,.35,side*.70],.019,materials.chrome);half.shaftLength=V(1.38,.37,side*.11).distanceTo(V(1.38,.35,side*.70));half.side=side;
  for(const [k,z] of [['inner',side*.22],['outer',side*.70]]){const c=C('cv-'+s+'-'+k,[1.38,.35,z],{dir:[0,.06,side*.16]});for(let i=0;i<6;i++)cyl(c,.037-i*.0025,.010,1.38,.35,z+(i-2.5)*.011,materials.rubber,'z');if(k==='outer')link(c.id,'knuckle-'+s+'f');}
  const tr=C('tie-rod-'+s,[1.13,.36,side*.62],{dir:[.1,-.07,side*.16]});control(tr,'steer',null,1,.5);tr.tieMesh=rod(tr,[1.13,.39,side*.51],[1.29,.345,side*.77],.012,materials.metal);tr.tieLength=V(1.13,.39,side*.51).distanceTo(V(1.29,.345,side*.77));tr.side=side;
  const ua=C('upper-arm-'+s,[-1.38,.48,side*.57],{dir:[-.12,.05,side*.18]});rod(ua,[-1.18,.47,side*.35],[-1.38,.47,side*.75],.017,materials.dark);
  const ta=C('trailing-arm-'+s,[-1.10,.33,side*.66],{dir:[-.1,-.08,side*.16]});rod(ta,[-.85,.33,side*.59],[-1.38,.332,side*.76],.024,materials.dark);
}

// Four complete corner assemblies. Steering parents the wheel, rotor and fixed caliper correctly.
const wheelNodes=[],knuckles=[],padNodes=[],springNodes=[],damperNodes=[];
for(const [id,x,side] of [['lf',1.38,1],['rf',1.38,-1],['lb',-1.38,1],['rb',-1.38,-1]]){
  const z=side*.82,front=x>0,k=C('knuckle-'+id,[x,.332,z],{dir:[.08,.06,side*.21]});if(front)control(k,'steer',null,1,.5);box(k,.073,.14,.070,x,.357,side*.765,materials.dark,.015);knuckles.push({c:k,side,front});
  const hub=C('hub-'+id,[x,.332,z],{dir:[0,0,side*.18]});cyl(hub,.047,.058,x,.332,z,materials.dark,'z');link(hub.id,k.id);
  const tire=C('tire-'+id,[x,.332,z],{dir:[0,.04,side*.30]});M(tire,new THREE.TorusGeometry(.255,.077,24,96),materials.rubber,[x,.332,z],null,[1,1,1.38]);for(const dz of [-.109,.109])M(tire,new THREE.RingGeometry(.202,.282,80),materials.rubber,[x,.332,z+dz]);link(tire.id,k.id);wheelNodes.push(tire);
  const rim=C('rim-'+id,[x,.332,z],{dir:[0,.02,side*.25]});torus(rim,.202,.010,x,.332,z+side*.130,materials.chrome);cyl(rim,.043,.028,x,.332,z+side*.137,materials.chrome,'z');
  for(let i=0;i<config.spokes;i++){const a=i/config.spokes*Math.PI*2;for(const off of [-.010,.010]){const m=box(rim,.013,.155,.022,x+.111*Math.sin(a)+off*Math.cos(a),.332+.111*Math.cos(a)-off*Math.sin(a),z+side*.130,materials.chrome,.003);m.rotation.z=-a;}}
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;cyl(rim,.007,.010,x+.032*Math.sin(a),.332+.032*Math.cos(a),z+side*.155,materials.dark,'z');}link(rim.id,k.id);wheelNodes.push(rim);
  const rotor=C('rotor-'+id,[x,.332,z-side*.040],{dir:[0,.02,side*.20]});cyl(rotor,front?.167:.148,.020,x,.332,z-side*.040,materials.metal,'z');torus(rotor,front?.133:.114,.0013,x,.332,z-side*.029,materials.dark);link(rotor.id,k.id);
  const cal=C('caliper-'+id,[x+.115,.36,z-side*.043],{dir:[.13,.05,side*.15]});control(cal,'brake',null,1);box(cal,.077,.124,.078,x+.115,.36,z-side*.043,materials.dark,.016);link(cal.id,k.id);
  const pad=C('pads-'+id,[x+.112,.36,z-side*.043],{dir:[.15,.02,side*.16]});control(pad,'brake',null,1);const pm=[];for(const q of [-1,1])pm.push(box(pad,.061,.10,.009,x+.112,.36,z-side*.043+q*.021,materials.black,.004));padNodes.push({c:pad,meshes:pm,base:pm.map(m=>m.position.z)});link(pad.id,k.id);
  const spring=C('spring-'+id,[x,.66,side*.65],{dir:[.06,.12,side*.18]});control(spring,'compress',null,1);const sm=coil(spring,[x,.65,side*.65],.059,.24,6,materials.dark);springNodes.push({c:spring,mesh:sm});
  const damper=C('damper-'+id,[x,.62,side*.65],{dir:[-.1,.07,side*.17]});control(damper,'damper',null,1);cyl(damper,.025,.30,x,.51,side*.65,materials.black);const piston=cyl(damper,.012,.25,x,.755,side*.65,materials.chrome);damperNodes.push({c:damper,mesh:piston});
  const arm=C('arm-'+id,[x,.28,side*.56],{dir:[.1,-.12,side*.15]});rod(arm,[x,.29,side*.74],[x-.24,.29,side*.34],.022,materials.dark);if(front)rod(arm,[x,.29,side*.74],[x+.20,.29,side*.34],.021,materials.dark);for(const p of [[x,.29,side*.74],[x-.24,.29,side*.34]])cyl(arm,.025,.04,...p,materials.rubber);
}

// Fuel supply and exhaust have separate paths underneath the floor.
const tank=C('tank',[-.89,.29,0],{dir:[0,-.25,0]});box(tank,.66,.20,1.04,-.89,.29,0,materials.black,.055);for(const z of [-.28,.28])box(tank,.68,.012,.036,-.89,.183,z,materials.metal,.004);
const fp=C('fuel-pump',[-.89,.41,.10],{dir:[0,.29,0]});cyl(fp,.063,.14,-.89,.36,.10,materials.fluid);cyl(fp,.071,.012,-.89,.438,.10,materials.dark);
const fuelLine=C('fuel-lines',[.03,.33,-.58],{dir:[0,-.12,-.13]});tube(fuelLine,[[-.89,.42,.10],[-.63,.37,-.58],[.60,.36,-.58],[1.0,.65,-.51],[1.15,.895,-.30]],.006,materials.dark);
const evap=C('evap',[-1.76,.41,-.58],{dir:[-.13,-.06,-.15]});box(evap,.22,.16,.16,-1.76,.41,-.58,materials.black,.022);tube(evap,[[-1.76,.46,-.58],[-1.65,.71,-.70],[-1.72,.89,-.84]],.007,materials.rubber);
const exhaust=C('exhaust-manifold',[1.62,.72,0],{dir:[.23,.09,0]});for(let i=0;i<4;i++){const z=-.165+i*.110;tube(exhaust,[[1.56,.79,z],[1.70,.74,z],[1.72,.54,z*.6],[1.52,.36,-.10]],.024,materials.dark);}
const catalyst=C('catalyst',[.81,.205,-.10],{dir:[0,-.16,.1]});cyl(catalyst,.075,.33,.81,.205,-.10,materials.metal,'x');
for(const [id,x] of [['lambda-before',1.06],['lambda-after',.56]]){const c=C(id,[x,.27,-.10],{dir:[0,.14,.05]});cyl(c,.014,.066,x,.27,-.10,materials.chrome);tube(c,[[x,.30,-.1],[x+.08,.36,-.20],[.92,.55,-.43]],.0035,materials.black);}
const pipe=C('exhaust-pipe',[-.24,.21,-.21],{dir:[0,-.17,.12]});tube(pipe,[[1.52,.36,-.10],[1.18,.21,-.10],[.9,.205,-.1],[.5,.205,-.1],[-.2,.205,-.22],[-.70,.205,-.56],[-1.22,.205,-.57],[-1.76,.23,-.42]],.026,materials.metal);box(pipe,.35,.11,.17,-.10,.205,-.19,materials.metal,.035);
const muffler=C('rear-muffler',[-1.85,.23,-.40],{dir:[-.12,-.14,0]});box(muffler,.52,.17,.32,-1.85,.23,-.40,materials.metal,.05);tube(muffler,[[-1.90,.23,-.42],[-2.12,.23,-.43],[-2.35,.25,-.49]],.032,materials.chrome);
const shield=C('heat-shield',[-.15,.30,-.18],{dir:[0,-.14,.20]});box(shield,2.30,.012,.29,-.15,.30,-.18,materials.metal,.005);for(let i=0;i<20;i++)box(shield,.012,.015,.27,-1.20+i*.11,.31,-.18,materials.dark,.002);

const engineMount=new THREE.Group();root.add(engineMount);for(const c of Object.values(registry))if((data[c.id].cat==='engine'||data[c.id].cat==='internals'||['gearbox','flywheel','clutch','exhaust-manifold'].includes(c.id)))engineMount.attach(c.frame);
engineMount.position.y=-.075;
// Resolve the hierarchy only after all world-coordinate geometry has been authored.
root.updateMatrixWorld(true);for(const [child,parent] of links){registry[parent].offset.attach(registry[child].frame);registry[child].parent=parent;root.updateMatrixWorld(true);}
for(const c of Object.values(registry)){
  c.homePosition=c.frame.position.clone();c.homeQuaternion=c.frame.quaternion.clone();c.homeRotation=c.frame.rotation.clone();
  const bounds=new THREE.Box3().setFromObject(c.visual),center=bounds.getCenter(V());c.marker.position.copy(c.offset.worldToLocal(center));if(c.markerRig){c.markerRig.add(c.marker);c.marker.position.set(0,0,0);}
  if(c.control?.kind==='spin'||c.control?.kind==='spin-rig'||c.control?.kind==='wiper'){c.active=false;c.spin=0;}
}
for(const p of parts)if(!registry[p.id]||registry[p.id].meshes.length===0)throw Error('No geometry for '+p.id);

function setControl(id,value){const c=registry[id];if(!c?.control)return;const kind=c.control.kind,v=clamp(value,0,1);if(['steer','gas','brake','clutch'].includes(kind))globals[kind]=v;else if(kind==='engine')globals.engine=!!v;else if(kind==='spin'||kind==='spin-rig'||kind==='wiper')c.active=!!v;else c.target=v;}
function controlValue(id){const c=registry[id];if(!c?.control)return 0;const k=c.control.kind;return k==='engine'?+globals.engine:['steer','gas','brake','clutch'].includes(k)?globals[k]:k==='spin'||k==='spin-rig'||k==='wiper'?+c.active:c.target;}
function descendants(id){const ids=new Set([id]);let added=true;while(added){added=false;for(const c of Object.values(registry))if(c.parent&&ids.has(c.parent)&&!ids.has(c.id)){ids.add(c.id);added=true;}}return ids;}
function reset(){Object.assign(globals,{engine:false,phase:0,steer:.5,gas:0,brake:0,clutch:0,screen:0,climate:0});for(const c of Object.values(registry)){c.target=c.control?.neutral||0;c.value=c.target;c.detachTarget=c.detach=0;c.active=false;c.spin=0;}}
function step(dt,time,explosion=0){
  if(globals.engine)globals.phase=(globals.phase+dt*2.1)%(Math.PI*4);const theta=globals.phase;
  for(const c of Object.values(registry)){
    c.frame.position.copy(c.homePosition);c.frame.quaternion.copy(c.homeQuaternion);c.value=THREE.MathUtils.damp(c.value,c.target,7,dt);c.detach=THREE.MathUtils.damp(c.detach,c.detachTarget,7,dt);
    c.offset.position.copy(c.dir).multiplyScalar(c.detach+explosion);const co=c.control;if(!co)continue;
    if(co.kind==='rotate')c.frame.rotateOnAxis(V(co.axis==='x'?1:0,co.axis==='y'?1:0,co.axis==='z'?1:0),co.amount*c.value);
    if(co.kind==='translate')c.frame.position[co.axis]+=co.amount*c.value;
    if(co.kind==='cap'){c.frame.rotateOnAxis(V(co.axis==='x'?1:0,co.axis==='y'?1:0,co.axis==='z'?1:0),Math.PI*3*c.value);c.frame.position[co.axis]+=.08*co.amount*c.value;}
    if(co.kind==='rig-rotate'&&c.rig)c.rig.rotation[co.axis]=co.amount*c.value;
    if(co.kind==='spin'){if(c.active)c.spin+=dt*co.amount;c.frame.rotateOnAxis(V(co.axis==='x'?1:0,co.axis==='y'?1:0,co.axis==='z'?1:0),c.spin);}
    if(co.kind==='spin-rig'){if(c.active)c.spin+=dt*co.amount;c.rig.rotation[co.axis]=c.spin;}
    if(co.kind==='wiper'){c.spin+=c.active?dt*3.0:0;const a=c.active?(.5-.5*Math.cos(c.spin))*.98:0;c.frame.rotateOnAxis(V(.55,.83,0).normalize(),a);}
    if(co.kind==='light'||co.kind==='tail')for(const m of c.lights||[])m.emissiveIntensity=co.kind==='tail'?Math.max(c.value*.55,globals.brake*.95):c.value*1.6;
    if(co.kind==='screen')c.screenMesh.material.emissiveIntensity=c.value>.5?1:.12;
    if(co.kind==='climate')for(const m of c.materials.values())m.emissive?.setRGB(0,.05*c.value,.07*c.value);
  }
  const steer=(.5-globals.steer)*.85;sw.frame.rotateX(steer*12);rack.frame.position.z+=steer*.06;
  for(const {c,side,front} of knuckles)if(front){const R=2.76/Math.max(.0001,Math.abs(Math.tan(steer))),a=Math.atan(2.76/(R-side*Math.sign(steer)*.82))*Math.sign(steer);c.frame.rotateY(-a);}
  for(const s of ['l','r']){const side=s==='l'?1:-1,k=registry['knuckle-'+s+'f'],tr=registry['tie-rod-'+s],a=V(1.13,.39,side*.51+steer*.06),b=V(-.09,.013,-side*.05).applyQuaternion(k.frame.quaternion).add(k.frame.position),d=b.clone().sub(a);tr.tieMesh.position.copy(a).add(b).multiplyScalar(.5).sub(tr.anchor);tr.tieMesh.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());tr.tieMesh.scale.y=d.length()/tr.tieLength;const half=registry['halfshaft-'+s],inner=V(1.38,.37,side*.11),outer=registry['cv-'+s+'-outer'].frame.getWorldPosition(V()),hd=outer.clone().sub(inner);half.shaftMesh.position.copy(inner).add(outer).multiplyScalar(.5).sub(half.anchor);half.shaftMesh.quaternion.setFromUnitVectors(V(0,1,0),hd.clone().normalize());half.shaftMesh.scale.y=hd.length()/half.shaftLength;}
  for(const id of ['gas-pedal','brake-pedal','clutch-pedal'])registry[id].frame.rotateZ(-globals[registry[id].control.kind]*.23);
  throttle.rig.rotation.z=globals.gas*Math.PI*.48;clutch.frame.position.z+=globals.clutch*.020;
  for(const {c,mesh} of springNodes){mesh.scale.y=1-c.value*.27;mesh.position.y=.030*c.value;}
  for(const {c,mesh} of damperNodes)mesh.position.y=(.755-c.anchor.y)-c.value*.065;
  for(const {meshes:pm,base} of padNodes){pm[0].position.z=base[0]+globals.brake*.003;pm[1].position.z=base[1]-globals.brake*.003;}
  crank.frame.rotateZ(-theta);registry['cam-in'].frame.rotateZ(-theta*.5);registry['cam-ex'].frame.rotateZ(-theta*.5);fly.frame.rotateZ(-theta);
  for(let i=0;i<4;i++){
    const a=theta+phases[i],py=CRANK_Y+.045*Math.cos(a)+Math.sqrt(ROD_L*ROD_L-Math.pow(.045*Math.sin(a),2)),p=registry['piston-'+(i+1)];p.frame.position.y=py;
    const r=rodRigs[i],pin=V(1.36+.045*Math.sin(a),CRANK_Y+.045*Math.cos(a),r.z),top=V(1.36,py,r.z),mid=pin.clone().add(top).multiplyScalar(.5);r.rig.position.copy(mid).sub(r.c.anchor);r.rig.quaternion.setFromUnitVectors(V(0,1,0),top.sub(pin).normalize());
    const phase=((a%(4*Math.PI))+4*Math.PI)%(4*Math.PI);sparks[i].mesh.material.emissiveIntensity=Math.abs(phase-2*Math.PI)<.11?4:0;
  }
  for(const v of valveRigs){const p=((theta+v.phase)%(4*Math.PI)+4*Math.PI)%(4*Math.PI),t=v.type==='in'?p:p-3*Math.PI,h=t>0&&t<Math.PI?Math.sin(t):0;v.rig.position.y=-.009*h;v.spring.scale.y=1-.28125*h;v.spring.position.y=.003094*h;const a=V(v.camX,.888-.014*h,v.vz),b=V(v.x,.860-.009*h,v.vz),d=b.clone().sub(a);v.rocker.position.copy(a).add(b).multiplyScalar(.5).sub(v.c.anchor);v.rocker.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());v.rocker.scale.y=d.length()/v.rockerLength;}
  root.updateMatrixWorld(true);
}
function point(id){const c=registry[id];return c.marker.getWorldPosition(V());}
function detach(id){registry[id].detachTarget=registry[id].detachTarget>.5?0:1;}
function allMeshes(){return meshes;}
function setPaint(color){materials.paint.color.set(color);for(const c of Object.values(registry))if(c.materials.has(materials.paint))c.materials.get(materials.paint).color.set(color);}
return{registry,materials,config,globals,step,setControl,controlValue,descendants,reset,point,detach,setPaint,meshes:allMeshes(),parts};
};
