'use strict';
const assert=require('node:assert/strict');
const THREE=require('./dist/vendor/three.min.js');global.THREE=THREE;global.window={};
global.document={createElement:()=>({width:512,height:128,getContext:()=>({fillRect(){},fillText(){}})})};
require('./dist/vendor/RoundedBoxGeometry.js');require('./dist/catalog.js');require('./dist/model.js');
const root=new THREE.Group(),parts=window.SEDAN_PARTS,m=window.buildSedanLab({THREE,root,parts,seed:4821}),r=m.registry;
const close=(a,b,eps=1e-7)=>assert(Math.abs(a-b)<eps,`${a} != ${b}`);
const settle=(n=160)=>{for(let i=0;i<n;i++)m.step(1/60,i/60);};
assert.equal(parts.length,214);assert.equal(new Set(parts.map(p=>p.id)).size,214);assert.equal(Object.keys(r).length,214);
for(const p of parts){assert(r[p.id].meshes.length>0,p.id+' has no geometry');assert(p.description&&p.how&&p.check.length,p.id+' missing explanation');if(p.motion)assert(r[p.id].control,p.id+' missing control');}
for(const mesh of m.meshes)for(const n of mesh.geometry.attributes.position.array)assert(Number.isFinite(n),mesh.userData.part+' invalid vertex');
// Complete four-stroke cycle: no changing conrod length, and each upper pin meets its piston.
for(let k=0;k<=72;k++){
  m.globals.phase=k/72*4*Math.PI;m.step(1/60,0);
  for(let i=1;i<=4;i++){const rig=r['rod-'+i].markerRig,a=rig.localToWorld(new THREE.Vector3(0,-.095,0)),b=rig.localToWorld(new THREE.Vector3(0,.095,0)),p=r['piston-'+i].frame.getWorldPosition(new THREE.Vector3());close(a.distanceTo(b),.19);assert(b.distanceTo(p)<1e-7,'Conrod/piston pin separation');}
  for(const mesh of m.meshes)assert(mesh.matrixWorld.elements.every(Number.isFinite),mesh.userData.part+' invalid world transform');
}
m.globals.phase=.8;m.step(.016,0);close(r.crankshaft.frame.rotation.z,-.8);close(r['cam-in'].frame.rotation.z,-.4);close(r['cam-ex'].frame.rotation.z,-.4);
m.reset();settle();const before=m.point('window-lf');m.setControl('door-lf',1);settle();assert(m.point('window-lf').distanceTo(before)>.2,'Window must follow door');const y=m.point('window-lf').y;m.setControl('window-lf',1);settle();close(y-m.point('window-lf').y,.365,1e-5);
m.reset();settle();const head=m.point('headrest-l');m.setControl('seat-l',1);settle();close(m.point('headrest-l').x-head.x,.18,1e-5);
m.reset();m.setControl('steering-wheel',0);settle();assert(r['knuckle-lf'].frame.rotation.y<0,'Left steering direction');assert(Math.abs(r['knuckle-lf'].frame.rotation.y)>Math.abs(r['knuckle-rf'].frame.rotation.y),'Inner wheel must steer farther');
m.reset();m.step(.016,0);const pad=r['pads-lf'].meshes[0],rest=pad.position.z;m.setControl('brake-pedal',1);settle();close(pad.position.z-rest,.003);const held=pad.position.z;settle();close(pad.position.z,held);m.setControl('brake-pedal',0);settle();close(pad.position.z,rest);
m.reset();m.setControl('alternator',1);settle();close(r.alternator.frame.quaternion.angleTo(new THREE.Quaternion()),0);assert(Math.abs(r.alternator.rig.rotation.z)>1,'Pulley must rotate independently');
m.reset();settle();for(const p of parts)m.detach(p.id);settle();for(const c of Object.values(r)){assert(c.offset.position.length()>.01,c.id+' did not extract');assert(c.frame.matrixWorld.elements.every(Number.isFinite));}
m.reset();settle();const size=new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());assert(size.x>4.6&&size.x<4.9&&size.z<2.3&&size.y<1.7,'Vehicle dimensions');
const m2=window.buildSedanLab({THREE,root:new THREE.Group(),parts,seed:4821});assert.deepEqual(m.config,m2.config,'Seed must be reproducible');
console.log(JSON.stringify({status:'PASS',parts:parts.length,mechanismControls:parts.filter(p=>p.motion).length,meshes:m.meshes.length,cycleSamples:73,checks:['finite geometry','214 registrations','fixed conrod lengths','piston pin coupling','camshaft 2:1 ratio','door/window parenting','seat/headrest parenting','Ackermann steering','brake pad drift','alternator pulley','all-part extraction','seed reproducibility']}));
