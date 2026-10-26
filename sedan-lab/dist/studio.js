/* Studio Small 08 HDRI by Poly Haven, CC0. Embedded for offline use.
   https://polyhaven.com/a/studio_small_08 */
'use strict';
window.installSedanStudio=function({THREE,renderer,scene}){
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
    const raw=atob(window.SEDAN_STUDIO_HDR),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
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
