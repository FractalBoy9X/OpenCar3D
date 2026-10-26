/* Studio Small 08 HDRI by Poly Haven, CC0. Embedded for offline use.
   https://polyhaven.com/a/studio_small_08 */
'use strict';
window.installMeganeStudio=function({THREE,renderer,scene}){
  scene.background=new THREE.Color('#e5e3df');scene.fog=new THREE.Fog('#e5e3df',16,38);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.98;
  const hemi=new THREE.HemisphereLight(0xf4f6ff,0x65615c,.58);scene.add(hemi);
  const key=new THREE.DirectionalLight(0xfff7ed,2.1);key.position.set(3,7,4);key.castShadow=false;
  key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.5,far:18});
  key.shadow.normalBias=.006;key.shadow.bias=-.00004;key.shadow.radius=4;scene.add(key);
  const fill=new THREE.DirectionalLight(0xdfe9ff,.35);fill.position.set(-4,3,-5);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xffffff,.65);rim.position.set(-4,5,2);scene.add(rim);
  const pmrem=new THREE.PMREMGenerator(renderer);
  let hdrReady=false;
  try{
    const raw=atob(window.MEGANE_STUDIO_HDR),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    const parsed=new window.RGBELoader().parse(bytes.buffer);
    const texture=new THREE.DataTexture(parsed.data,parsed.width,parsed.height,THREE.RGBAFormat,parsed.type);
    texture.colorSpace=THREE.LinearSRGBColorSpace;texture.mapping=THREE.EquirectangularReflectionMapping;
    texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.flipY=true;texture.needsUpdate=true;
    scene.environment=pmrem.fromEquirectangular(texture).texture;texture.dispose();hdrReady=true;
  }catch(error){
    const room=new THREE.Scene();room.background=new THREE.Color('#85888c');
    for(const [x,y,z,w,h,d] of [[0,5,0,7,.1,3],[-5,2,0,.1,4,8],[1,3,5,5,3,.1]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:0xffffff}));m.position.set(x,y,z);room.add(m);}
    scene.environment=pmrem.fromScene(room,.04).texture;room.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
  }
  pmrem.dispose();
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:'#d9d7d2',roughness:.78,metalness:.02}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.005;ground.receiveShadow=true;scene.add(ground);
  const grid=new THREE.GridHelper(16,40,0xc8d2c1,0xd9e0d4);grid.visible=false;
  // A feathered contact shadow gives the four tires a grounded appearance.
  const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');
  const r=g.createRadialGradient(128,128,16,128,128,128);r.addColorStop(0,'rgba(12,13,14,.44)');r.addColorStop(.5,'rgba(12,13,14,.23)');r.addColorStop(1,'rgba(12,13,14,0)');g.fillStyle=r;g.fillRect(0,0,256,256);
  const shadowTexture=new THREE.CanvasTexture(c),contact=new THREE.Group();scene.add(contact);
  const soft=new THREE.Mesh(new THREE.PlaneGeometry(5.1,2.45),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.78}));soft.rotation.x=-Math.PI/2;soft.position.y=-.003;contact.add(soft);
  for(const x of [1.35,-1.336])for(const z of [-.82,.82]){const tireShadow=new THREE.Mesh(new THREE.PlaneGeometry(.63,.43),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.85}));tireShadow.rotation.x=-Math.PI/2;tireShadow.position.set(x,-.002,z);contact.add(tireShadow);}
  function setLight(name){
    const p={soft:{key:2.1,fill:.35,rim:.65,hemi:.58,exposure:.98,bg:'#e5e3df',floor:'#d9d7d2'},day:{key:3.2,fill:.70,rim:.2,hemi:.8,exposure:1.02,bg:'#e8edf1',floor:'#d9dde1'},contrast:{key:1.5,fill:.12,rim:1.2,hemi:.25,exposure:.86,bg:'#a8a9ac',floor:'#929397'}}[name];if(!p)return;
    key.intensity=p.key;key.castShadow=name==='day';fill.intensity=p.fill;rim.intensity=p.rim;hemi.intensity=p.hemi;renderer.toneMappingExposure=p.exposure;scene.background.set(p.bg);scene.fog.color.set(p.bg);ground.material.color.set(p.floor);
  }
  return{ground,grid,contact,key,fill,rim,hemi,setLight,hdrReady};
};

window.buildMeganeStudioWheels=function({THREE,mat,groups,add,cylinder,rounded,wheelGroups}){
  const tireCanvas=document.createElement('canvas');tireCanvas.width=1024;tireCanvas.height=256;const tc=tireCanvas.getContext('2d');tc.fillStyle='#a6a6a6';tc.fillRect(0,0,1024,256);
  // A fine tread bump replaces the coarse boxes on the tire shoulders.
  tc.strokeStyle='#555';tc.lineWidth=3;for(const y of [86,111,144,169]){tc.beginPath();tc.moveTo(0,y);tc.lineTo(1024,y);tc.stroke();}
  tc.lineWidth=1.5;for(let x=-30;x<1050;x+=18){tc.beginPath();tc.moveTo(x,56);tc.lineTo(x+11,107);tc.moveTo(x+11,149);tc.lineTo(x,200);tc.stroke();}
  const bump=new THREE.CanvasTexture(tireCanvas);bump.wrapS=THREE.RepeatWrapping;bump.anisotropy=8;
  const tireMat=new THREE.MeshStandardMaterial({color:'#1c1d1f',roughness:.83,metalness:0,bumpMap:bump,bumpScale:.00065,envMapIntensity:.45});
  const rc=document.createElement('canvas');rc.width=rc.height=512;const gc=rc.getContext('2d');gc.fillStyle='#b0b0b0';gc.fillRect(0,0,512,512);for(let i=68;i<256;i+=1.5){gc.strokeStyle=`rgba(40,42,44,${.045+.04*Math.sin(i*9)})`;gc.lineWidth=.7;gc.beginPath();gc.arc(256,256,i,0,Math.PI*2);gc.stroke();}
  const rotorMap=new THREE.CanvasTexture(rc);rotorMap.colorSpace=THREE.SRGBColorSpace;
  const rotorMat=new THREE.MeshStandardMaterial({color:'#bfc1c3',metalness:.88,roughness:.39,map:rotorMap});
  const tireProfile=[new THREE.Vector2(.202,-.105),new THREE.Vector2(.244,-.110),new THREE.Vector2(.284,-.103),new THREE.Vector2(.310,-.082),new THREE.Vector2(.325,-.047),new THREE.Vector2(.327,0),new THREE.Vector2(.325,.047),new THREE.Vector2(.310,.082),new THREE.Vector2(.284,.103),new THREE.Vector2(.244,.110),new THREE.Vector2(.202,.105),new THREE.Vector2(.198,.092),new THREE.Vector2(.198,-.092),new THREE.Vector2(.202,-.105)];
  function smoothProfile(points){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p.x,p.y,0)),false,'centripetal');return curve.getPoints(112).map(p=>new THREE.Vector2(p.x,p.y));}
  for(const x of [1.35,-1.336])for(const side of [-1,1]){
    const wg=new THREE.Group();wg.position.set(x,.327,side*.82);groups.wheels.add(wg);wheelGroups.push(wg);
    const tire=add(new THREE.LatheGeometry(smoothProfile(tireProfile),112),tireMat,wg,'wheels');tire.rotation.x=Math.PI/2;
    // Rolled alloy rim lip and a dark, hollow barrel behind the spokes.
    const rimProfile=[new THREE.Vector2(.181,.110),new THREE.Vector2(.193,.116),new THREE.Vector2(.205,.126),new THREE.Vector2(.210,.137),new THREE.Vector2(.207,.143),new THREE.Vector2(.199,.143),new THREE.Vector2(.194,.135),new THREE.Vector2(.191,.112)];
    const rim=add(new THREE.LatheGeometry(smoothProfile(rimProfile),112),mat.chrome,wg,'wheels');rim.rotation.x=side*Math.PI/2;
    const barrel=add(new THREE.CylinderGeometry(.193,.193,.18,80,1,true),mat.darkMetal,wg,'wheels');barrel.rotation.x=Math.PI/2;
    for(let i=0;i<6;i++)for(const dir of [-1,1]){
      const path=new THREE.Shape();path.moveTo(dir*.012-.008,.040);path.bezierCurveTo(dir*.018-.006,.083,dir*.025-.006,.147,dir*.017-.007,.193);path.lineTo(dir*.017+.007,.193);path.bezierCurveTo(dir*.025+.006,.147,dir*.018+.006,.083,dir*.012+.008,.040);path.closePath();
      const g=new THREE.ExtrudeGeometry(path,{depth:.016,bevelEnabled:true,bevelSize:.0018,bevelThickness:.0018,bevelSegments:4,curveSegments:14});g.translate(0,0,-.008);
      const spoke=add(g,mat.chrome,wg,'wheels');spoke.position.z=side*.136;spoke.rotation.z=i/6*Math.PI*2;
    }
    cylinder(.053,.053,.028,0,0,side*.140,mat.chrome,'wheels',wg,'z');cylinder(.032,.032,.031,0,0,side*.147,mat.chrome,'wheels',wg,'z');
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2;cylinder(.010,.010,.010,.043*Math.sin(a),.043*Math.cos(a),side*.157,mat.darkMetal,'wheels',wg,'z');cylinder(.0065,.0065,.011,.043*Math.sin(a),.043*Math.cos(a),side*.160,mat.metal,'wheels',wg,'z');}
    // Four circular bead lines are visible under glancing studio light.
    for(const r of [.214,.225,.272,.282]){const bead=add(new THREE.TorusGeometry(r,.0009,6,112),tireMat,wg,'wheels');bead.position.z=side*.108;}
    cylinder(.169,.169,.022,x,.327,side*.791,rotorMat,'brakes',null,'z');
    cylinder(.067,.067,.038,x,.327,side*.797,mat.darkMetal,'brakes',null,'z');
    rounded(.078,.122,.058,.012,x+.119,.365,side*.799,mat.darkMetal,'brakes');
  }
};
