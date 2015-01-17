/**
 *  JZZ.Midi.js
 *
 *  This module defines the MIDI event class and helper functions.
 *
 *  This script is free to use, modify and distribute.
 *
 *  More information is available at http://jazz-soft.net
 *
 **/

var JZZ;
if(!JZZ) JZZ={};
else if(typeof JZZ!='object') throw new Error("JZZ namespace conflict");

JZZ.MIDI=function(){
 var tmp=function(){};
 tmp.prototype=JZZ.Midi.prototype;
 var obj=new tmp();
 JZZ.Midi.apply(obj,arguments);
 return obj;
}
JZZ.Midi=function(){
 var d='';
 if(arguments.length==1){
  var arg=arguments[0];
  if(arg instanceof JZZ.Midi){
   d=arg.data();
  }
  else if(typeof arg =='string'){
   for(var i=0;i<arg.length;i++) if(arg.charCodeAt(i)>255) throw new Error("JZZ.Midi: Bad input parameters");
   d=arg;
  }
  else if(arg instanceof Array){
   for(var i=0;i<arg.length;i++){
    var x=parseInt(arg[i]);
    if(isNaN(x)||!isFinite(x)||x<0||x>255) throw new Error("JZZ.Midi: Bad input parameters");
    d+=String.fromCharCode(x);
   }
  }
  else {
   var x=parseInt(arg);
   if(isNaN(x)||!isFinite(x)||x<0||x>255) throw new Error("JZZ.Midi: Bad input parameters");
   d+=String.fromCharCode(x);
  }
 }
 else if(arguments.length>0){
  for(var i=0;i<arguments.length;i++){
   var x=parseInt(arguments[i]);
   if(isNaN(x)||!isFinite(x)||x<0||x>255) throw new Error("JZZ.Midi: Bad input parameters");
   d+=String.fromCharCode(x);
  }
 }
 else throw new Error("JZZ.Midi: Bad input parameters");
 this.data=(function(x){ return function(){ return x;}})(d);
}
JZZ.Midi.len=function(x){
 var r={0xf1:2,0xf2:3,0xf3:2,0xf4:1,0xf5:1,0xf6:1,0xf8:1,0xf9:1,0xfa:1,0xfb:1,0xfc:1,0xfd:1,0xfe:1}[x];
 if(r!=undefined) return r;
 return {8:3,9:3,10:3,11:3,12:2,13:2,14:3}[x>>4];
}
for(var i=0;i<128;i++){
 var o=Math.floor(i/12);
 var n=i%12;
 var k=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][n]+o;
 JZZ.Midi[k]=i; JZZ.MIDI[k]=i;
 k=[,'Db',,'Eb',,,'Gb',,'Ab',,'Bb'][n];
 if(k){ k+=o; JZZ.Midi[k]=i; JZZ.MIDI[k]=i;}
}

JZZ.Midi.prototype.hex=function(){
 var s=this.data();
 var a=[];
 for(var i=0;i<s.length;i++){
  a[i]=(s.charCodeAt(i)<16?'0':'')+s.charCodeAt(i).toString(16);
 }
 return a.join(' ');
}
JZZ.Midi.prototype.array=function(){
 var s=this.data();
 var a=[];
 for(var i=0;i<s.length;i++) a.push(s.charCodeAt(i));
 return a;
}
JZZ.Midi.prototype.toString=function(){
 var str=this.hex();
 var s0=this.data().charCodeAt(0);
 if(s0<0x80) return str;
 str+=' -- ';
 var ss={241:'Time Code',242:'Song Position',243:'Song Select',244:'Undefined',245:'Undefined',246:'Tune request',
  248:'Timing clock',249:'Undefined',250:'Start',251:'Continue',252:'Stop',253:'Undefined',254:'Active Sensing',255:'Reset'}[s0];
 if(ss) return str+ss;
 s0>>=4;
 ss={8:'Note Off',10:'Aftertouch',12:'Program Change',13:'Channel Aftertouch',14:'Pitch Wheel'}[s0];
 if(ss) return str+ss;
 if(s0==9) return str+(this.data().charCodeAt(2)?'Note On':'Note Off');
 if(s0!=11) return str;
 ss={
0:'Bank Select MSB',
1:'Modulation Wheel MSB',
2:'Breath Controller MSB',
4:'Foot Controller MSB',
5:'Portamento Time MSB',
6:'Data Entry MSB',
7:'Channel Volume MSB',
8:'Balance MSB',
10:'Pan MSB',
11:'Expression Controller MSB',
12:'Effect Control 1 MSB',
13:'Effect Control 2 MSB',
16:'General Purpose Controller 1 MSB',
17:'General Purpose Controller 2 MSB',
18:'General Purpose Controller 3 MSB',
19:'General Purpose Controller 4 MSB',
32:'Bank Select LSB',
33:'Modulation Wheel LSB',
34:'Breath Controller LSB',
36:'Foot Controller LSB',
37:'Portamento Time LSB',
38:'Data Entry LSB',
39:'Channel Volume LSB',
40:'Balance LSB',
42:'Pan LSB',
43:'Expression Controller LSB',
44:'Effect control 1 LSB',
45:'Effect control 2 LSB',
48:'General Purpose Controller 1 LSB',
49:'General Purpose Controller 2 LSB',
50:'General Purpose Controller 3 LSB',
51:'General Purpose Controller 4 LSB',
64:'Damper Pedal On/Off',
65:'Portamento On/Off',
66:'Sostenuto On/Off',
67:'Soft Pedal On/Off',
68:'Legato Footswitch',
69:'Hold 2',
70:'Sound Controller 1',
71:'Sound Controller 2',
72:'Sound Controller 3',
73:'Sound Controller 4',
74:'Sound Controller 5',
75:'Sound Controller 6',
76:'Sound Controller 7',
77:'Sound Controller 8',
78:'Sound Controller 9',
79:'Sound Controller 10',
80:'General Purpose Controller 5',
81:'General Purpose Controller 6',
82:'General Purpose Controller 7',
83:'General Purpose Controller 8',
84:'Portamento Control',
88:'High Resolution Velocity Prefix',
91:'Effects 1 Depth',
92:'Effects 2 Depth',
93:'Effects 3 Depth',
94:'Effects 4 Depth',
95:'Effects 5 Depth',
96:'Data Increment',
97:'Data Decrement',
98:'Non-Registered Parameter Number LSB',
99:'Non-Registered Parameter Number MSB',
100:'Registered Parameter Number LSB',
101:'Registered Parameter Number MSB',
120:'All Sound Off',
121:'Reset All Controllers',
122:'Local Control On/Off',
123:'All Notes Off',
124:'Omni Mode Off',
125:'Omni Mode On',
126:'Mono Mode On',
127:'Poly Mode On'}[this.data().charCodeAt(1)];
 if(!ss) ss='Undefined';
 return str+ss;
}

