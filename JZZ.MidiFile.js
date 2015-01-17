/**
 *  JZZ.MidiFile.js
 *
 *  This module defines the MIDI File class and related classes.
 *  Presented methods allow to read, write and play MIDI files.
 *
 *  This script is free to use, modify and distribute.
 *
 *  More information is available at http://jazz-soft.net
 *
 **/

var JZZ;
if(!JZZ) JZZ={};
else if(typeof JZZ!='object') throw new Error('JZZ namespace conflict');

JZZ.MidiFile=function(){
 var type=1;
 var ppqn=96;
 var fps;
 var ppf;
 if(arguments.length==1){
  if(arguments[0] instanceof JZZ.MidiFile){
   this.dup(arguments[0]); return;
  }
  if(typeof arguments[0]=='string' && arguments[0]!='0' && arguments[0]!='1' && arguments[0]!='2'){
   this.load(arguments[0]); return;
  }
  type=parseInt(arguments[0]);
 }
 else if(arguments.length==2){
  type=parseInt(arguments[0]);
  ppqn=parseInt(arguments[1]);
 }
 else if(arguments.length==3){
  type=parseInt(arguments[0]);
  fps=parseInt(arguments[1]);
  ppf=parseInt(arguments[2]);
 }
 else if(arguments.length) throw new Error('Invalid parameters');
 if(isNaN(type)||type<0||type>2) throw new Error('Invalid parameters');
 this.type=type;
 if(fps==undefined){
  if(isNaN(ppqn)||ppqn<0||type>0xffff) throw new Error('Invalid parameters');
  this.ppqn=ppqn;
 }
 else{
  if(fps!=24&&fps!=25&&fps!=29&&fps!=30) throw new Error('Invalid parameters');
  if(isNaN(ppf)||ppf<0||type>0xff) throw new Error('Invalid parameters');
  this.fps=fps; this.ppf=ppf;
 }
}
JZZ.MidiFile.prototype=(function(p){ function f(){}; f.prototype=p; return new f();})(Array.prototype);
JZZ.MidiFile.prototype.dup=function(x){
 throw new Error('Copy-constructor not yet implemented');
}
JZZ.MidiFile.prototype.load=function(s){
 if(s.substr(0,4)=='RIFF' && s.substr(8,8)=='RMIDdata'){
  s=s.substr(20,s.charCodeAt(16) + s.charCodeAt(17)*0x100 + s.charCodeAt(18)*0x10000 + s.charCodeAt(19)*0x1000000);
 }
 this.loadSMF(s);
}
JZZ.MidiFile.prototype.loadSMF=function(s){
 if(s.substr(0,8)!='MThd\0\0\0\6') throw new Error('Not a MIDI file');
 this.type=s.charCodeAt(8)*16+s.charCodeAt(9);
 this.ntrk=s.charCodeAt(10)*16+s.charCodeAt(11);
 if(s.charCodeAt(12)>0x7f){
  this.fps=0x100-s.charCodeAt(12);
  this.ppf=s.charCodeAt(13);
 }
 else{
  this.ppqn=s.charCodeAt(12)*256+s.charCodeAt(13);
 }
 if(this.type>2 || (this.type==0 && this.ntrk>1) || (!this.ppf && !this.ppqn)) throw new Error('Invalid MIDI header');
 var n=0;
 var p=14;
 while(p<s.length){
  var type=s.substr(p,4);
  if(type=='MTrk') n++;
  var len=(s.charCodeAt(p+4)<<24)+(s.charCodeAt(p+5)<<16)+(s.charCodeAt(p+6)<<8)+s.charCodeAt(p+7);
  p+=8;
  var data=s.substr(p,len);
  this.push(new JZZ.MidiFile.Chunk(type,data));
  p+=len;
 }
 if(p!=s.length || n!=this.ntrk) throw new Error("Corrupted MIDI file");;
}
JZZ.MidiFile.prototype.dump=function(){
 var s=''; var k=0;
 for(var i=0;i<this.length;i++){
  if(this[i] instanceof JZZ.MidiFile.MTrk) k++;
  s+=this[i].dump();
 }
 s=(this.ppqn?String.fromCharCode(this.ppqn>>8)+String.fromCharCode(this.ppqn&0xff):String.fromCharCode(0x100-this.fps)+String.fromCharCode(this.ppf))+s;
 s='MThd\0\0\0\6\0'+String.fromCharCode(this.type)+String.fromCharCode(k>>8)+String.fromCharCode(k&0xff)+s;
 return s;
}
JZZ.MidiFile.prototype.toString=function(){ return "Midi File "+this.length};
JZZ.MidiFile.prototype.var2num=function(s){
 if(s.charCodeAt(0)<0x80) return s.charCodeAt(0);
 var x=s.charCodeAt(0)&0x7f; x<<=7;
 if(s.charCodeAt(1)<0x80) return x+s.charCodeAt(1);
 x+=s.charCodeAt(1)&0x7f; x<<=7;
 if(s.charCodeAt(2)<0x80) return x+s.charCodeAt(2);
 x+=s.charCodeAt(2)&0x7f; x<<=7;
 if(s.charCodeAt(3)<0x80) return x+s.charCodeAt(3);
 throw new Error("Corrupted MIDI track");
};
JZZ.MidiFile.prototype.msglen=function(n){
 switch(n&0xf0){
  case 0x80: case 0x90: case 0xa0: case 0xb0: case 0xe0: return 2;
  case 0xc0: case 0xD0: return 1;
  default: throw new Error("Corrupted MIDI track");
 }
}
JZZ.MidiFile.prototype.player=function(){
 var pl=new JZZ.MidiFile.Player;
 pl.ppqn=this.ppqn; pl.fps=this.fps; pl.ppf=this.ppf;
 var i;
 var tt=[];
 for(i=0;i<this.length;i++) if(this[i] instanceof JZZ.MidiFile.MTrk) tt.push(this[i]);
 pl.tracks=tt.length;
 if(this.type==2) throw new Error("Playing MIDI file type 2 not yet implemented");
 var pp=[]; for(i=0;i<tt.length;i++) pp[i]=0;
 var t=0;
 while(true){
  var b=true;
  var m;
  for(i=0;i<tt.length;i++){
   while(pp[i]<tt[i].length && tt[i][pp[i]].time==t){
    var obj=tt[i][pp[i]];
    var evt=new JZZ.MidiFile.Event;
    for(var attr in obj) if(obj.hasOwnProperty(attr)) evt[attr]=obj[attr];
    evt.track=i;
    pl.push(evt); pp[i]++;
   }
   if(pp[i]>=tt[i].length) continue;
   if(b) m=tt[i][pp[i]].time;
   b=false;
   if(m>tt[i][pp[i]].time) m=tt[i][pp[i]].time;
  }
  t=m;
  if(b) break;
 }
 return pl;
}


JZZ.MidiFile.Chunk=function(t,d){
 if(this.sub[t]) return this.sub[t](t,d);
 if(typeof t!='string' || t.length!=4) throw new Error("Invalid chunk type: "+t);
 this.type=t;
 this.data=d;
};
JZZ.MidiFile.Chunk.prototype=(function(p){ function f(){}; f.prototype=p; return new f();})(Array.prototype);
JZZ.MidiFile.Chunk.prototype.sub={
 'MThd':function(){ throw new Error("Illegal chunk type: MThd");},
 'MTrk':function(t,d){ return new JZZ.MidiFile.MTrk(d);}
};
JZZ.MidiFile.Chunk.prototype.dump=function(){
 var len=this.data.length;
 return this.type+String.fromCharCode((len>>24)&255)+String.fromCharCode((len>>16)&255)+String.fromCharCode((len>>8)&255)+String.fromCharCode(len&255)+this.data;
}


JZZ.MidiFile.MTrk=function(s){
 if(s==undefined){
  this.push(new JZZ.MidiFile.Event(0,'\xff\x2f',''));
  return;
 }
 var t=0;
 var p=0;
 var w='';
 while(p<s.length){
  var d=JZZ.MidiFile.prototype.var2num(s.substr(p,4));
  p++; if(d>0x7f) p++; if(d>0x3fff) p++; if(d>0x1fffff) p++;
  t+=d;
  if(s.charCodeAt(p)==0xff){
   var st=s.substr(p,2); p+=2;
   var m=JZZ.MidiFile.prototype.var2num(s.substr(p,4));
   p++; if(m>0x7f) p++; if(m>0x3fff) p++; if(m>0x1fffff) p++;
   this.push(new JZZ.MidiFile.Event(t,st,s.substr(p,m)));
   p+=m;
  }
  else if(s.charCodeAt(p)==0xf0 || s.charCodeAt(p)==0xf7){
   var st=s.substr(p,1); p+=1;
   var m=JZZ.MidiFile.prototype.var2num(s.substr(p,4));
   p++; if(m>0x7f) p++; if(m>0x3fff) p++; if(m>0x1fffff) p++;
   this.push(new JZZ.MidiFile.Event(t,st,s.substr(p,m)));
   p+=m;
  }
  else if(s.charCodeAt(p)&0x80){
   w=s.substr(p,1); p+=1;
   var m=JZZ.MidiFile.prototype.msglen(w.charCodeAt(0));
   this.push(new JZZ.MidiFile.Event(t,w,s.substr(p,m)));
   p+=m;
  }
  else if(w.charCodeAt(0)&0x80){
   var m=JZZ.MidiFile.prototype.msglen(w.charCodeAt(0));
   this.push(new JZZ.MidiFile.Event(t,w,s.substr(p,m)));
   p+=m;
  }
 }
}
JZZ.MidiFile.MTrk.prototype=(function(p){ function f(){}; f.prototype=p; return new f();})(JZZ.MidiFile.Chunk.prototype);
JZZ.MidiFile.MTrk.prototype.type='MTrk';
JZZ.MidiFile.MTrk.prototype.dump=function(){
 var s='';
 var t=0;
 var m='';
 for(var i=0;i<this.length;i++){
  var d=this[i].time-t;
  t=this[i].time;
  if(d>0x1fffff) s+=String.fromCharCode(((d>>21)&0x7f)+0x80);
  if(d>0x3fff) s+=String.fromCharCode(((d>>14)&0x7f)+0x80);
  if(d>0x7f) s+=String.fromCharCode(((d>>7)&0x7f)+0x80);
  s+=String.fromCharCode(d&0x7f);
  if(this[i].status.charCodeAt(0)==0xff || this[i].status.charCodeAt(0)==0xf0 || this[i].status.charCodeAt(0)==0xf7){
   s+=this[i].status;
   var len=this[i].data.length;
   if(len>0x1fffff) s+=String.fromCharCode(((len>>21)&0x7f)+0x80);
   if(len>0x3fff) s+=String.fromCharCode(((len>>14)&0x7f)+0x80);
   if(len>0x7f) s+=String.fromCharCode(((len>>7)&0x7f)+0x80);
   s+=String.fromCharCode(len&0x7f);
  }
  else if(this[i].status!=m){
   m=this[i].status;
   s+=this[i].status;
  }
  s+=this[i].data;
 }
 var len=s.length;
 return 'MTrk'+String.fromCharCode((len>>24)&255)+String.fromCharCode((len>>16)&255)+String.fromCharCode((len>>8)&255)+String.fromCharCode(len&255)+s;
}
JZZ.MidiFile.MTrk.prototype.getTime=function(){ return this[this.length-1].time;}
JZZ.MidiFile.MTrk.prototype.setTime=function(t){
 t=parseInt(t);
 if(isNaN(t)||t<0) throw new Error('Invalid parameter');
 var e=this[this.length-1];
 if(t<e.time){
 throw new Error("not yet implemented");
 }
 e.time=t;
}
JZZ.MidiFile.MTrk.prototype.eventOrder=function(s,d){
 var x={'\xff\x00':0,'\xff\x03':1,'\xff\x02':2,'\xff\x54':3,'\xff\x51':4,'\xff\x58':5,'\xff\x59':6,'\xff\x20':7,
  '\xff\x21':7,'\xff\x06':8,'\xff\x04':9,'\xff\x01':16,'\xff\x05':16,'\xff\x7f':17,'\xff\x2f':20}[s];
 if(x!=undefined) return x;
 x={8:10,15:11,11:12,12:13,10:15,13:15,14:15}[s.charCodeAt(0)>>4];
 if(x!=undefined) return x;
 if((s.charCodeAt(0)>>4)==9) return d.charCodeAt(1)?14:10;
 return 18;
}
JZZ.MidiFile.MTrk.prototype.addEvent=function(t,s,d){
 t=parseInt(t); if(isNaN(t)||t<0) throw new Error('Invalid parameter');
 s=s.toString();
 d=d.toString();
 var i;
 if(this.getTime()<t) this.setTime(t);
 var x=this.eventOrder(s,d);
 for(i=0;i<this.length;i++){
  if(this[i].time>t) break;
  if(this[i].time==t && this.eventOrder(this[i].status,this[i].data)>x) break;
 }
 this.splice(i,0,new JZZ.MidiFile.Event(t,s,d));
}
JZZ.MidiFile.MTrk.prototype.addMidi=function(){
 var t=arguments[0];
 var args=[];
 for(var i=1;i<arguments.length;i++) args.push(arguments[i]);
 var msg=JZZ.MIDI.apply(undefined,args).data();
 var x=msg.charCodeAt(0);
 if(x<0x80 || x>0xfe) throw new Error('Invalid MIDI message');
 var y=JZZ.Midi.len(x);
 if(y!=undefined && y!=msg.length) throw new Error('Invalid MIDI message');
 this.addEvent(t,msg.substr(0,1),msg.substr(1));
}
JZZ.MidiFile.MTrk.prototype.addNote=function(t,ch,note,vel,dur){
 var n=parseInt(note);
 if(isNaN(n)) n=parseInt(JZZ.Midi[note]);
 if(isNaN(n)||n<0||n>127) throw new Error('Invalid parameter');
 ch=parseInt(ch); if(isNaN(ch)||ch<0||ch>15) throw new Error('Invalid parameter');
 if(dur==undefined) dur=0;
 dur=parseInt(dur); if(isNaN(dur)||dur<0) throw new Error('Invalid parameter');
 if(vel==undefined) vel=127;
 vel=parseInt(vel); if(isNaN(vel)||vel<0||vel>127) throw new Error('Invalid parameter');
 this.addMidi(t,0x90+ch,n,vel);
 if(dur) this.addMidi(t+dur,0x90+ch,n,0);
}
JZZ.MidiFile.MTrk.prototype.addName=function(t,str){ this.addEvent(t,'\xff\x03',str);}
JZZ.MidiFile.MTrk.prototype.addText=function(t,str){ this.addEvent(t,'\xff\x01',str);}
JZZ.MidiFile.MTrk.prototype.addTempo=function(t,bpm){
 var mspq=Math.round(60000000./bpm);
 var s=String.fromCharCode(0xff&(mspq>>16))+String.fromCharCode(0xff&(mspq>>8))+String.fromCharCode(0xff&mspq);
 this.addEvent(t,'\xff\x51',s);
}

JZZ.MidiFile.Event=function(t,s,d){
 this.time=t;
 this.status=s;
 this.data=d;
};
JZZ.MidiFile.Event.prototype.toString=function(){
 var str;
 var s0=this.status.charCodeAt(0);
 if(s0>0x7f && s0!=0xff && s0!=0xf0 && s0!=0xf7) return JZZ.MIDI(this.status+this.data).toString();
 if(s0==0xff){
  var s1=this.status.charCodeAt(1);
  str="ff"+(s1>15?'':'0')+s1.toString(16)+' ';
  if(s1==0){
   str+='Sequence number: '+this.data.charCodeAt(0); return str;
  }
  else if(s1<10){
   str+={1:'Text',2:'Copyright',3:'Track name',4:'Instrument',5:'Lyrics',6:'Marker',7:'Cue point',8:'Program name',9:'Device name'}[s1];
   str+=': '+this.data; return str;
  }
  else if(s1==0x20) str+='MIDI channel: ';
  else if(s1==0x21) str+='MIDI port: ';
  else if(s1==0x2f){
   str+='End of track'; return str;
  }
  else if(s1==0x51){
   var ms=this.data.charCodeAt(0)*65536 + this.data.charCodeAt(1)*256 + this.data.charCodeAt(2);
   var bpm=Math.round(60000000*100/ms)/100;
   str+='Tempo: '+bpm+' bpm'; return str;
  }
  else if(s1==0x54){
   str+='SMPTE offset: '+(this.data.charCodeAt(0)>9?'':'0')+this.data.charCodeAt(0).toString();
   for(var i=1;i<this.data.length;i++) str+=':'+(this.data.charCodeAt(i)>9?'':'0')+this.data.charCodeAt(i);
   return str;
  }
  else if(s1==0x58){
   var d=1<<this.data.charCodeAt(1);
   str+='Time signature: '+this.data.charCodeAt(0)+'/'+d;
   str+=' '+this.data.charCodeAt(2)+' '+this.data.charCodeAt(3);
   return str;
  }
  else if(s1==0x59){
   str+='Key signature: ';
   var sf=this.data.charCodeAt(0);
   var mi=this.data.charCodeAt(1);
   if(sf&0x80) sf=sf-0x100;
   sf+=7;
   if(sf>=0 && sf<=14 && mi>=0 && mi<=1){
    if(mi) sf+=3;
    str+=['Cb','Gb','Db','Ab','Eb','Bb','F','C','G','D','A','E','B','F#','C#','G#','D#','A#'][sf];
    if(mi) str+='min';
    return str;
   }
  }
  else if(s1==0x7f) str+='Proprietary event: ';
 }
 else if(s0==0xf0) str='SysEx: f0';
 else if(s0==0xf7) str='SysEx cont.:';
 else str=(s0>15?'':'0')+s0.toString(16);
 for(var i=0;i<this.data.length;i++) str+=' '+(this.data.charCodeAt(i)>15?'':'0')+this.data.charCodeAt(i).toString(16);
 return str;
};


JZZ.MidiFile.Player=function(){
 this.tracks=0;
 this.playing=false;
 this.looped=false;
};
JZZ.MidiFile.Player.prototype=(function(p){ function f(){}; f.prototype=p; return new f();})(Array.prototype);
JZZ.MidiFile.Player.prototype.loop=function(b){ this.looped=b?true:false;}
JZZ.MidiFile.Player.prototype.play=function(){
 this.onEvent({control:'play'});
 if(this.ppqn) this.mul=this.ppqn/500.;
 else this.mul=this.fps*this.ppf/1000.;
 this.playing=true;
 this.ptr=0;
 this.c0=0;
 this.t0=(new Date()).getTime();
 this.tick();
}
JZZ.MidiFile.Player.prototype.stop=function(){
 this.event='stop'; this.paused=undefined;
 if(this.playing) this.playing=false;
 else this.onEvent({control:this.event});
}
JZZ.MidiFile.Player.prototype.pause=function(){
 this.event='pause'; this.playing=false;
}
JZZ.MidiFile.Player.prototype.resume=function(){
 if(this.playing || this.paused==undefined) return;
 var t=(new Date()).getTime();
 this.t0+=(new Date()).getTime()-this.paused;
 this.onEvent({control:'resume'});
 this.playing=true; this.tick();
}
JZZ.MidiFile.Player.prototype.tick=function(){
 var t=(new Date()).getTime();
 var c=this.c0+(t-this.t0)*this.mul;
 for(;this.ptr<this.length;this.ptr++){
  var e=this[this.ptr];
  if(e.time>c) break;
  var evt={};
  if(e.status=='\xff\x51' && this.ppqn){
   this.mul=this.ppqn*1000./((e.data.charCodeAt(0)<<16)+(e.data.charCodeAt(1)<<8)+e.data.charCodeAt(2));
   this.t0=t; this.c0=c;
  }
  else if(e.status.charCodeAt(0)==0xf7){ evt.midi=JZZ.MIDI(e.data);}
  else if(e.status.charCodeAt(0)!=0xff){ evt.midi=JZZ.MIDI(e.status+e.data);}
  else { evt.status=e.status; evt.data=e.data;};
  evt.track=e.track;
  if(typeof e.user != 'undefined') evt.user=e.user;
  this.onEvent(evt);
 }
 if(this.ptr>=this.length){
  this.onEvent({control:'end'});
  if(this.looped){
   this.ptr=0; this.c0=0; this.t0=t;
  }
  else this.stop();
 }
 var f=(function(x){return function(){x.tick();};})(this);
 if(this.playing){ window.setTimeout(f,0); return;}
 if(this.event=='pause') this.paused=t;
 this.onEvent({control:this.event});
}

JZZ.MidiFile.b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
JZZ.MidiFile.fromBase64=function(input){
 var output='';
 var chr1,chr2,chr3;
 var enc1,enc2,enc3,enc4;
 var i=0;
 input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");
 while(i<input.length){
  enc1=JZZ.MidiFile.b64.indexOf(input.charAt(i++));
  enc2=JZZ.MidiFile.b64.indexOf(input.charAt(i++));
  enc3=JZZ.MidiFile.b64.indexOf(input.charAt(i++));
  enc4=JZZ.MidiFile.b64.indexOf(input.charAt(i++));
  chr1=(enc1<<2)|(enc2>>4);
  chr2=((enc2&15)<<4)|(enc3>>2);
  chr3=((enc3&3)<<6)|enc4;
  output=output+String.fromCharCode(chr1);
  if(enc3!=64){
   output=output+String.fromCharCode(chr2);
  }
  if(enc4!=64){
   output=output+String.fromCharCode(chr3);
  }
 }
 return output;
}
JZZ.MidiFile.toBase64=function(data){
 var o1,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,enc="",tmp_arr=[];
 if(!data) return data;
 do{
  o1=data.charCodeAt(i++); o2=data.charCodeAt(i++); o3=data.charCodeAt(i++);
  bits=o1<<16|o2<<8|o3;
  h1=bits>>18&0x3f; h2=bits>>12&0x3f; h3=bits>>6&0x3f; h4=bits&0x3f;
  tmp_arr[ac++]=JZZ.MidiFile.b64.charAt(h1)+JZZ.MidiFile.b64.charAt(h2)+JZZ.MidiFile.b64.charAt(h3)+JZZ.MidiFile.b64.charAt(h4);
 } while(i<data.length);
 enc=tmp_arr.join('');
 var r=data.length%3;
 return (r?enc.slice(0,r-3):enc)+'==='.slice(r||3);
}
