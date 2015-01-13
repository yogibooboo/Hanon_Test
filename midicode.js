function log(msg) {
    if (window.console && log.enabled) {
        console.log(msg);
    } 
} // log  
log.enabled = true;

  // recupera l'elemento canvas
  canvass = document.getElementById("grafs");
  // richiede al canvas il contesto 2D
  ctxs = canvass.getContext('2d');
  
  canvasd = document.getElementById("grafd");
  ctxd = canvasd.getContext('2d');

  canvasvs = document.getElementById("grafvs");
  ctxvs = canvasvs.getContext('2d');


  canvasvd = document.getElementById("grafvd");
  ctxvd = canvasvd.getContext('2d');

  canvassp = document.getElementById("spartito");
  ctxsp = canvassp.getContext('2d');




  ecanvass = document.getElementById("egrafs");
  ectxs = ecanvass.getContext('2d');
  
  ecanvasd = document.getElementById("egrafd");
  ectxd = ecanvasd.getContext('2d');

  ecanvasvs = document.getElementById("egrafvs");
  ectxvs = ecanvasvs.getContext('2d');


  ecanvasvd = document.getElementById("egrafvd");
  ectxvd = ecanvasvd.getContext('2d');


  ecanvassp = document.getElementById("espartito");
  ectxsp = ecanvassp.getContext('2d');

  canvasdati = document.getElementById("canvasdati");
  ctxdati = canvasdati.getContext('2d');


$(window).resize(function () {
	tmidi.offsetxx=$("#campogioco").offset().left;
	tmidi.offsetyy=$("#campogioco").offset().top;
});

var immagine = new Image();

immagine.src = "images/clefs.png";




$('#bstart').click(function () {
	tmidi.startstop();
});

$('#esamina').click(function () {
	$("#campoesamina").show();
	tmidi.esamina();
});

$('#esaminao').click(function () {
	$("#campoesamina").hide();
});


$('#noteoff').click(function () {
	tmidi.noteonoff();
});

$('#campoesamina').mousedown(function (ev) {
	tmidi.esaminadown(ev);
});

$('#campoesamina').mousemove(function (ev) {
	tmidi.esaminamove(ev);
});  

/* $(document).mousemove(function(ev) {
	tmidi.esaminamove(ev);

});*/

$('#campoesamina').mouseup(function (ev) {
	tmidi.esaminaup(ev);
});

/*
var scarta=document.getElementById("scarta");
var scartatris=document.getElementById("scartatris");
var ordina=document.getElementById("ordina");
var pesca=document.getElementById("pesca");
var perjolly=document.getElementById("perjolly");
var tada=document.getElementById("tada");
var haiperso=document.getElementById("perso");
var dascarti=document.getElementById("dascarti");
var slitta=document.getElementById("slitta");
var ding=document.getElementById("ding");
var thunder=document.getElementById("thunder");
var applause=document.getElementById("applause");
var distribuisci=document.getElementById("distribuisci");
*/

var Jazz = document.getElementById("Jazz1"); if(!Jazz || !Jazz.isJazz) Jazz = document.getElementById("Jazz2");



var active_element;
var current_in;
var msg;
var sel;




//// Listbox
function changeMidi(){
 try{
  if(sel.selectedIndex){
   current_in=Jazz.MidiInOpen(sel.options[sel.selectedIndex].value,midiProc);
  } else {
   Jazz.MidiInClose(); current_in='';
  }
  for(var i=0;i<sel.length;i++){
   if(sel[i].value==current_in) sel[i].selected=1;
  }
 }
 catch(err){}
}

//// Connect/disconnect
function connectMidiIn(){
 try{
  var str=Jazz.MidiInOpen(current_in,midiProc);
  for(var i=0;i<sel.length;i++){
   if(sel[i].value==str) sel[i].selected=1;
  }
 }
 catch(err){}
}
function disconnectMidiIn(){
 try{
  Jazz.MidiInClose(); sel[0].selected=1;
 }
 catch(err){}
}
function onFocusIE(){
 active_element=document.activeElement;
 connectMidiIn();
}
function onBlurIE(){
 if(active_element!=document.activeElement){ active_element=document.activeElement; return;}
 disconnectMidiIn();
}

//// Initialize
Jazz=document.getElementById("Jazz1"); if(!Jazz || !Jazz.isJazz) Jazz = document.getElementById("Jazz2");
msg=document.getElementById("msg");
sel=document.getElementById("midiIn");
try{
 current_in=Jazz.MidiInOpen(0,midiProc);
 var list=Jazz.MidiInList();
 for(var i in list){
  sel[sel.options.length]=new Option(list[i],list[i],list[i]==current_in,list[i]==current_in);
 }
}
catch(err){}

if(navigator.appName=='Microsoft Internet Explorer'){ document.onfocusin=onFocusIE; document.onfocusout=onBlurIE;}
//else{ window.onfocus=connectMidiIn; window.onblur=disconnectMidiIn;}



//// Callback function
function midiProc(t,a,b,c){

	var tempo=performance.now()-tmidi.latenza;
   	log ("IN : "+a+" "+b+" "+c+" "+tempo);

	//Jazz.MidiOut(a+9,b,120);
	
   	if ((a==0x90)&&(b==21)) return tmidi.startstop()     //primo tasto
	if ((a==0x90)&&(b==23)) return (tmidi.setbpm(-5))	 //secondo tasto bianco
	if ((a==0x90)&&(b==24)) return (tmidi.setbpm(5))	 //terzo tasto bianco	
   	

   
	//L'esercizio parte da tmidi.inizioinput  (dopo l'intro)
	//L'intervallo tra le note è tmidi.intervallo
	//Il puntatore alla prossima nota in uscita è tmidi.notacorrente. (attuale=notacorrente-1)
	//il valore dell'ultima nota in ingresso è tmidi.sinistranota e tmidi.destranota.
	//il buffer in esecuzione è puntato da tmidi.cbuffer

 	if (tmidi.fsuona&&!tmidi.fintro) {  	//stiamo suonando ed è finita l'introduzione

		if (a==0x90){ //inizio nota
			var pospresunta=Math.round((tempo-tmidi.inizioinput)/tmidi.intervallo);

			gestnote=(function(sin,des,prima) {
				var ritardo=tempo-tmidi.inizioinput-tmidi.intervallo*pospresunta;
				if ((des)&&(b==tmidi.cbuffer[pospresunta])) {  //mano destra
					tmidi.deltastartd[pospresunta]=ritardo;
					tmidi.notain.push({"nota":b,"pos":pospresunta,"vel":c,"dx":true});
					tmidi.veld[pospresunta]=c;
					log ("DX   pos= " + pospresunta + " nota on" + b + " nota teor" + tmidi.cbuffer[pospresunta]+" "+prima
					+" tempo="+tempo+" inizio="+tmidi.inizioinput+" delta="+ritardo)
					return true
				} 
				if ((sin)&&(b==(tmidi.cbuffer[pospresunta]-12))) {  //mano sinistra
					tmidi.deltastarts[pospresunta]=ritardo;
					//tmidi.sinistracorrente=pospresunta;
					tmidi.notain.push({"nota":b,"pos":pospresunta,"vel":c,"dx":false});
					tmidi.vels[pospresunta]=c;
					log ("SX   pos= " + pospresunta + " nota on" + b + " nota teor" + (tmidi.cbuffer[pospresunta]-12)+" "+prima
					+" tempo="+tempo+" inizio="+tmidi.inizioinput+" delta="+ritardo)
					return true
				}
				return false 

			})
			if (gestnote(true,true,true)) return;  //gestisce sinistra e destra
			
			//se non ha trovatp destra ne sinistra potrebbe essere una nota iniziata in ritardo,
			//oltre mezzo intervallo dopo l'inizio teorico.
			//in questo caso sontrolla se la lunghezza del buffer compilato è minore di pospresunta
			// e verifica se la nota attuale corrisponde a quell precedente.

			if (pospresunta>0){
				var sx=false,dx=false;
				if (tmidi.barrasinistra.length<(pospresunta)) sx=true;
				if (tmidi.barradestra.length<(pospresunta)) dx=true;
				pospresunta--
				if (gestnote(sx,dx,false)) return;
				pospresunta++;
			}


			log ("NULL pos= " + pospresunta + " nota on" + b + " nota teor" + tmidi.cbuffer[pospresunta]
				+" tempo="+tempo+" inizio="+tmidi.inizioinput+" delta="+ritardo)
  
		}
		var colore;

		if (a==0x80){ //fine nota

			var pos,vel,dx,trovato=false;
			for (var i=0;i<tmidi.notain.length;i++){
				if (b==tmidi.notain[i].nota){
					trovato=true;
					pos=tmidi.notain[i].pos;
					vel=tmidi.notain[i].vel;
					dx=tmidi.notain[i].dx;
					tmidi.notain.splice(i,1);
				}
			}
			if ((trovato&&dx)) {
				var ritardo=tempo-tmidi.inizioinput-tmidi.intervallo*(pos+1);  //rispetto a inizio nota successiva
				
				tmidi.deltastopd[pos]=ritardo;
				log("DXOFF "+ (pos)+ " notain:");
				while (tmidi.barradestra.length<(pos)){
					tmidi.barradestra.push({"s":0,"w":200,"c":"red","e":true,"v":0});
					tmidi.colorenotadestra[tmidi.barradestra.length-1]="#FF0000"  //red
				}
				calcoladestra=(function(pos,vel){
					var s = Math.floor(40+tmidi.deltastartd[pos]/tmidi.intervallo*40);
					var w = Math.floor(40+tmidi.deltastopd[pos]/tmidi.intervallo*40);
					var errpercento=Math.min(Math.floor(tmidi.deltastopd[pos]/tmidi.intervallo*150),255)
					colore="rgb("+errpercento+","+errpercento+",255)";
					return({"s":s,"w":w,"c":colore,"e":false,"v":vel});
				})
				tmidi.barradestra[pos]=(calcoladestra(pos,vel));
				tmidi.drawdestra();
				var bstart=300+(tmidi.deltastartd[pos]/tmidi.intervallo)*400;
				var bwidth=Math.min(400+ritardo/tmidi.intervallo*400,1000-bstart)
				$("#barrad").css({left:bstart,width:bwidth, "background-color":colore});
				$("#barrad").text("DESTRA "+ (pos))

				tmidi.colorenotadestra[pos]=colore  //blue
				return
			}
			if ((trovato&&!dx)) {
				var ritardo=tempo-tmidi.inizioinput-tmidi.intervallo*(pos+1);  //rispetto a inizio nota successiva
				tmidi.deltastops[pos]=ritardo;
				log("SXOFF "+ (pos));
				while (tmidi.barrasinistra.length<(pos)){
					tmidi.barrasinistra.push({"s":0,"w":200,"c":"red","e":true,"v":0});
					tmidi.colorenotasinistra[tmidi.barrasinistra.length-1]="#FF0000"  //red
				}
				calcolasinistra=(function(pos,vel){
					var s = Math.floor(40+tmidi.deltastarts[pos]/tmidi.intervallo*40);
					var w = Math.floor(40+tmidi.deltastops[pos]/tmidi.intervallo*40);
					var errpercento=Math.min(Math.floor(tmidi.deltastops[pos]/tmidi.intervallo*150),255)
					colore="rgb("+errpercento+",255,"+errpercento+")";

					return({"s":s,"w":w,"c":colore,"e":false,"v":vel});
				})
				tmidi.barrasinistra[pos]=(calcolasinistra(pos,vel));
				tmidi.drawsinistra();
				var bstart=300+(tmidi.deltastarts[pos]/tmidi.intervallo)*400;
				var bwidth=Math.min(400+ritardo/tmidi.intervallo*400,1000-bstart)
				$("#barras").css({left:bstart,width:bwidth, "background-color":"green"});
				$("#barras").text("SINISTRA "+ (pos))

				tmidi.colorenotasinistra[pos]=colore;
				return
				
			}
			log("NULLOFF");



			return;
		}
   	}



}



var tmidi = {
    
    
    start:function(){
    	this.inizializzazioni();
    	this.initbuffernote();
    	this.initnotecolori();
    	this.resetgrafici();
    	window.requestAnimationFrame(tmidi.refresh);
        return;
    },

    resetgrafici:function(){
    	this.initgrafico(ctxs,canvass.width,canvass.height);
    	this.initgrafico(ctxd,canvasd.width,canvasd.height);
    	this.initgraficov(ctxvs,canvasvs.width,canvasvs.height);
    	this.initgraficov(ctxvd,canvasvd.width,canvasvd.height);
    	this.initgraficodati(ctxdati,canvasdati.width,canvasdati.height);
		setTimeout(this.initgraficosp,100,ctxsp,canvassp.width,canvassp.height);

    },

    initgrafico:function(b,w,h){
    	b.clearRect(0, 0, w,h);

    	b.fillStyle="#A0522D";
    	b.fillRect(20,0,20,h);
    	b.fillRect(80,0,20,h);
    },
    
    initgraficov:function(b,w,h){
    	b.clearRect(0, 0, w,h);

    	b.fillStyle="#000000";
    	b.fillRect(25,0,1,h);
    	b.fillRect(49,0,2,h);
    	b.fillRect(75,0,1,h);
    },


    initgraficoe:function(b,w,h,destro){
    	b.clearRect(0, 0, w,h);
    	b.fillStyle="#A0522D";
    	if (destro){
			b.fillRect(0,160,w,20);
			b.fillRect(0,80,w,20);
    	}
    	else {
			b.fillRect(0,20,w,20);
			b.fillRect(0,100,w,20);
    	}
    	b.fillStyle="#FFFFFF";
		b.fillRect(500,0,1,h);

    },
    
    initgraficoev:function(b,w,h,destro){
    	b.clearRect(0, 0, w,h);

    	b.fillStyle="#000000";
    	b.fillRect(0,25,w,1);
    	b.fillRect(0,49,w,2);
    	b.fillRect(0,75,w,1);
    	b.fillStyle="#FFFFFF";
		b.fillRect(500,0,1,h);

    },

  	initgraficodati:function(b,w,h){
    	b.clearRect(0, 0, w,h);

    	b.fillStyle="#000000";
   		b.fillStyle="#FFFFFF";
    	b.font="18px Verdana";
		b.fillText("bpm",18,36);
		b.fillRect(0,50,w,1);
		b.fillText("Note errate destra: "+tmidi.numerrnoted+ " ("+tmidi.errnoted+ " %)",18,70);
		b.fillText("Errore medio attacco destra: "+tmidi.errad+ " %",18,95);
		b.fillText("Errore medio distacco destra: "+tmidi.errdd+ " %",18,120);
		b.fillText("Stabilità pressione destra: "+tmidi.errpd+ " %",18,145);
		b.fillText("Giudizio finale destra: "+tmidi.gfd+ " %",18,170);
		b.fillRect(0,175,w,1);
		b.fillText("Note errate sinistra: "+tmidi.numerrnotes+ " ("+tmidi.errnotes+ " %)",18,195);
		b.fillText("Errore medio attacco sinistra :"+tmidi.erras+ " %",18,220);
		b.fillText("Errore medio distacco sinistra :"+tmidi.errds+ " %",18,245);
		b.fillText("Stabilità pressione destra: "+tmidi.errps+ " %",18,270);
		b.fillText("Giudizio finale sinistra: "+tmidi.gfs+ " %",18,295);
		b.fillRect(0,300,w,1);

    },

  
    initgraficosp:function(b,w,h){

    	var esamina=(b==ectxsp);

		if (esamina){
    	this.initgraficoe(ectxs,ecanvass.width,ecanvass.height,false);
    	this.initgraficoe(ectxd,ecanvasd.width,ecanvasd.height,true);
    	this.initgraficoev(ectxvs,ecanvasvs.width,ecanvasvs.height,false);
    	this.initgraficoev(ectxvd,ecanvasvd.width,ecanvasvd.height,true);
			
		}

    	var limite=1000;
    	if (esamina) limite=1300;
    	b.clearRect(0, 0, w,h);
    	b.fillStyle="#D2691E";
    	if (esamina) {
    		b.fillStyle="#FFFFFF";
			b.fillRect(500,0,1,h);
			var trovanota=true;
    	}
    	else {
    		b.fillRect(473,0,30,h);
    	}
    	
    	b.fillStyle="#000000";
    	b.strokeStyle="#000000";

    	for (var i=2;i<13;i++) {
			
			if (i!=7) b.fillRect(50,i*8,limite,1);
		}

		b.font="14px Arial";

    	b.lineWidth=3;

		var ztempo=performance.now(),zinizio=ztempo,znotacorrente,zoffset;
		var cnd=tmidi.colorenotadestra,cns=tmidi.colorenotasinistra;
		
		if ((tmidi.fsuona)&&!(tmidi.fintro)) zinizio=tmidi.inizioinput;   //zeppa nel caso di prima inizializzazzione
		//la nota attuale dipende da quanti intervalli sono passati
    	//zdeltapixel=Math.floor((ztempo-zinizio)*15/tmidi.intervallo)-znotacorrente*15;
    	zoffset=Math.floor((ztempo-zinizio)*16/tmidi.intervallo);
    	if (esamina) zoffset=-tmidi.eoffset;
    	
		var d=500,posy,posx=0,nota,oldnota,oldposx,oldposy;
		var cols,cold;
		var td=tmidi.barradestra,ts=tmidi.barrasinistra;

		drawline=(function(py){
			b.fillRect(posx-7,py,14,1);
		})
		var lung=tmidi.BufferNote.length;
    	for (var i=0;((i<lung)&&(posx<limite));i++){
    		b.beginPath();
    		//var snota=i+znotacorrente-30;
    		//if (snota<0) continue;

    		posx=d+i*12-zoffset;
    		if (posx>100){
    			cold=cnd[i];
    			cols=cns[i];
    			if (i==tmidi.notacorrente-1) {cold="yellow";cols="yellow";}
    			nota=tmidi.BufferNote[i];
				posy=112-(nota)*4;

				b.fillRect(posx+3,posy,1,-25);
				b.fillRect(posx-4,posy+32,1,25);

				
				b.fillStyle=cold;
				b.arc(posx, posy, 4, 0, 2*Math.PI);
				b.fill();
				if ((nota==14)||(nota==26)) drawline(posy);
				b.fillStyle=cols;
				b.beginPath();
				b.arc(posx, posy+32, 4, 0, 2*Math.PI);
				b.fill();
				if ((nota==9)||(nota==21)||(nota==7)) drawline(posy+32);
				if ((nota==7)||(nota==8)) b.fillRect(posx-6,76+32,10,1);

				if (esamina){
					
					
			
					if (i<ts.length) {
						ectxvs.fillStyle="yellow";
						ectxvs.fillRect(posx-7,0,14,Math.floor((ts[i].v-30)/0.7));
						ectxs.fillStyle=ts[i].c;
						ectxs.fillRect(posx-7,ts[i].s,14,ts[i].w);
					}
					
					if (i<td.length) {
						ectxvd.fillStyle="yellow";
						ectxvd.fillRect(posx-7,100-Math.floor((td[i].v-30)/0.7),14,100);
						ectxd.fillStyle=td[i].c;
						ectxd.fillRect(posx-7,200-(td[i].s+td[i].w),14,td[i].w);
					}

					if ((trovanota)&&(posx>499)&&(i>0)&&(tmidi.feinavanti)){
						trovanota=false;
						if (!(tmidi.notainesame==i-1)){
							//log ("inesame= "+tmidi.notainesame+" diventa= "+(i-1)+" posx "+posx+" deltax "+tmidi.feinavanti)
							tmidi.notainesame=i-1;

							if (tmidi.fnoteon) {
								Jazz.MidiOut(0x90,tmidi.cbuffer[tmidi.notainesame],tmidi.velocitaout);
								setTimeout(tmidi.midiout,100,0x80,tmidi.cbuffer[tmidi.notainesame],tmidi.velocitaout);	
							}
						}
					}

				}


				b.fillStyle="#000000";
				

				if ((i%4)==3) {
					oldnota=tmidi.BufferNote[i-3];
					oldposx=d+(i-3)*12-zoffset;
					oldposy=112-(oldnota)*4;
					b.beginPath();
					b.moveTo(oldposx+3,oldposy-25);
					b.lineTo(posx+3,posy-25);
					b.moveTo(oldposx+3,oldposy-20);
					b.lineTo(posx+3,posy-20);
					b.moveTo(oldposx-4,oldposy+57);
					b.lineTo(posx-4,posy+57);
					b.moveTo(oldposx-4,oldposy+52);
					b.lineTo(posx-4,posy+52);

					b.stroke();
					d+=11;
				}
				if ((i%8)==7) {
					b.fillRect(posx+18,16,1,80);
					b.fillText(Math.floor(i/8)+2,posx+18,14);

					d+=10;
				}
    		}   //if (posx>100)
    		else {
    				if ((i%4)==3) {
						d+=11;
					}
					if ((i%8)==7) {
						d+=10;
					}
    		}
    	}
    	    	
		b.clearRect(0, 0, 90,h);


		for (var i=2;i<13;i++) {
			
			if (i!=7) b.fillRect(50,i*8,90,1);
		}
		b.fillRect(50,16,1,80);

		
 	    b.drawImage(immagine, 0, 0);

 	    b.fillText("Hanon 1, bpm:"+tmidi.bpm,50,120);


    	//log("tempo grafico= " +(performance.now()-ztempo));
    },
  
    refresh: function() {
    	
    	if ((tmidi.fsuona)&&!(tmidi.fintro)) tmidi.initgraficosp(ctxsp,canvassp.width,canvassp.height);
    	window.requestAnimationFrame(tmidi.refresh);	
    },

    initnotecolori: function() {
    	for (i=0;i<this.cbuffer.length;i++){
    		this.colorenotadestra[i]="#000000";  //nero
    		this.colorenotasinistra[i]="#000000";  //nero
    		
    	}
    },

    midiout : function(a,b,c){
    	Jazz.MidiOut(a,b,c);	

    },

	fedown:false,
	femove:false,
	feinavanti:true,
	edownx:0, eprevx:0,
	edowny:0, eprevy:0,
	eoffset:0,estartoffset:0,
	notainesame:0,

	esamina:function(){
		
		tmidi.eoffset=0;
		tmidi.notainesame=1000;
		tmidi.fnoteon=false;
   		$("#noteoff").css({"border-color":"#888888"});
   		$("#noteoff").text("NOTE ON");

		tmidi.initgraficosp(ectxsp,ecanvassp.width,ecanvassp.height);

	},

	



	esaminadown:function(ev){
		//log ("offsetX "+ev.offsetX+" offsetY "+ev.offsetY)
	
		tmidi.fedown=true;
		tmidi.feinavanti=true;
		tmidi.femove=false;
		tmidi.edownx=ev.offsetX;
		tmidi.eprevx=ev.offsetX;
		tmidi.estartoffset=tmidi.eoffset;
		tmidi.deltax=0;
	},

	esaminamove:function(ev){

		tmidi.feinavanti=false;
		if (ev.offsetX<tmidi.eprevx) tmidi.feinavanti=true;
		tmidi.eprevx=ev.offsetX;
		if(!tmidi.fedown) return;
		tmidi.deltax=ev.offsetX-tmidi.edownx;
		//log ("deltax " +tmidi.feinavanti+ " offsetx "+ev.offsetX)
		if (!tmidi.femove){
			if (Math.abs(tmidi.deltax)>3) tmidi.femove=true;
		}
		if (tmidi.femove){
			tmidi.eoffset=tmidi.estartoffset+tmidi.deltax;
		tmidi.initgraficosp(ectxsp,ecanvassp.width,ecanvassp.height);

		}
	},

	esaminaup:function(ev){
		if(!tmidi.fedown) return;

		tmidi.fedown=false;
		tmidi.femove=false;

	},

	inizializzazioni: function(){
		this.fsuona=false;
		this.fnoteon=false;
		this.fintro=false;
		this.fcancellaintro=false;
		this.fcancellasuona=false;
		this.inizio=performance.now();
		this.inizioinput=this.inizio;
		Jazz.MidiOut(0x90,60,0);   //sembra che il MidiOut si debba inizializzare...
    	Jazz.MidiOut(0x80,60,0);
    	this.notacorrente=0;
    	//this.sinistracorrente=-1;
    	//this.sinistranota=[];
    	//this.destranota=[];
    	this.notain=[];
    	this.deltastarts=[];
    	this.deltastops=[];
    	this.vels=[];
    	this.deltastartd=[];
    	this.deltastopd=[];
    	this.veld=[];
    	this.barrasinistra=[];  //{"s":start,"w":width,"c":color,"e":error}
    	this.barradestra=[];
    	this.colorenotadestra=[];
    	this.colorenotasinistra=[];

    	this.numerrnoted=0;
    	this.errnoted=0;
    	this.errad=0;
    	this.errdd=0;
    	this.errpd=0;
    	this.gfd=0;
    	this.numerrnotes=0;
    	this.errnotes=0;
    	this.erras=0;
    	this.errds=0;
    	this.errps=0;
    	this.gfs=0;

    	
    	this.bpm=80;
    	this.aggiustatempi();
		this.velocitaout=120;
		this.cbuffer=this.Hanon1;
		this.notein=[];
		this.notestart=[];
		this.latenza=100;
		this.BufferNote=[];   //note con 0 a partire da do sotto due ottave
		tmidi.creacontatore("contabpm",90,40,"dati",70,10,"4pulsanti");
		this.displaypunti(tmidi.bpm,"contabpm");
		$('#contabpm').click(function (ev) {
			tmidi.setbpmx(ev);
		});		

		


    },

    aggiornaerrori: function(){

    	var lung,b,sdeltastart,sdeltastop,notebuone;

    	//destra
    	
    	b=tmidi.barradestra;
    	lung=b.length;
    	if (lung<10) return tmidi.azzeraerrori();
    	tmidi.numerrnoted=0;sdeltastart=0;sdeltastop=0;
    	for (var i=0;i<lung;i++) {
			if (b[i].e) tmidi.numerrnoted++;
			else{
				sdeltastart+=Math.abs(tmidi.deltastartd[i]);
				sdeltastop+=Math.abs(tmidi.deltastopd[i]);
			}
    	}
		tmidi.errnoted=Math.floor(tmidi.numerrnoted/lung*100);
		nutebuone=lung-tmidi.numerrnoted;
		tmidi.errad=Math.floor(sdeltastart/tmidi.intervallo/lung*100);
		tmidi.errdd=Math.floor(sdeltastop/tmidi.intervallo/lung*100);
		tmidi.gfd=Math.floor(Math.max(100-Math.pow(tmidi.errnoted,1.6)-tmidi.errad/4-tmidi.errdd/4,0))
    	//sinistra
    	
    	b=tmidi.barrasinistra;
    	lung=b.length;
    	tmidi.numerrnotes=0;sdeltastart=0;sdeltastop=0;
    	for (var i=0;i<lung;i++) {
			if (b[i].e) tmidi.numerrnotes++;
			else{
				sdeltastart+=Math.abs(tmidi.deltastarts[i]);
				sdeltastop+=Math.abs(tmidi.deltastops[i]);
			}

    	}
		tmidi.errnotes=Math.floor(tmidi.numerrnotes/lung*100)
		nutebuone=lung-tmidi.numerrnotes;
		tmidi.erras=Math.floor(sdeltastart/tmidi.intervallo/lung*100);
		tmidi.errds=Math.floor(sdeltastop/tmidi.intervallo/lung*100);
		tmidi.gfs=Math.floor(Math.max(100-Math.pow(tmidi.errnotes,1.6)-tmidi.erras/4-tmidi.errds/4,0))


		
		tmidi.initgraficodati(ctxdati,canvasdati.width,canvasdati.height);
    },

     azzeraerrori: function(){
    	this.numerrnoted=0;
    	this.errnoted=0;
    	this.errad=0;
    	this.errdd=0;
    	this.errpd=0;
    	this.gfd=0;
    	this.numerrnotes=0;
    	this.errnotes=0;
    	this.erras=0;
    	this.errds=0;
    	this.errps=0;
    	this.gfs=0;
    },


	aggiustatempi: function(){
    	this.quarto=60000/(this.bpm);
    	this.ottavo=60000/(this.bpm*2);
    	this.sedicesimo=60000/(this.bpm*4);
    	this.intervallo=this.sedicesimo;
    	this.durata=this.intervallo*0.9;
	},


	setbpmx: function(ev){

		var x=ev.offsetX,y=ev.offsetY;
		if (x<87){
			//form imposta bpm
			tmidi.aggiustatempi();
			tmidi.aggiornaerrori();   ///7PROVVISORIO
			return
		}
		
		if ((x<108)&&(y<20)) return tmidi.setbpm(1);
		if ((x<108)) return tmidi.setbpm(-1);
		if ((x>108)&&(y<20)) return tmidi.setbpm(5);
		return tmidi.setbpm(-5);
	},

	setbpm: function(delta){
		tmidi.bpm+=delta;
		if (tmidi.bpm>120) tmidi.bpm=120;
		if (tmidi.bpm<40) tmidi.bpm=40;
		tmidi.aggiustatempi();
		this.displaypunti(tmidi.bpm,"contabpm");
	},


	initbuffernote: function(){

    	for (var i=0;i<tmidi.cbuffer.length;i++) {

			var nota=tmidi.cbuffer[i]-36;
			var ottava=Math.floor(nota/12);
			nota-=ottava*12;
			if (nota>4) nota++;
			tmidi.BufferNote[i]=nota/2+ottava*7;   //note con 0 a partire da do sotto due ottave
		}
    },
	


    noteonoff: function(){
    	if (tmidi.fnoteon) {
    		tmidi.fnoteon=false;
    		$("#noteoff").css({"border-color":"#888888"});
    		$("#noteoff").text("NOTE ON");

    	}
    	else {
    		tmidi.fnoteon=true;
    		$("#noteoff").css({"border-color":"red"});
    		$("#noteoff").text("NOTE OFF");

    	}
    },
		
    startstop: function(){
    	if (tmidi.fsuona) {tmidi.stopsuona();return};
    	tmidi.fsuona=true;
    	tmidi.fintro=true;
    	tmidi.fcancellaintro=false;
    	tmidi.fcancellasuona=false;
   	   	$("#bstart").css({"border-color":"red"});
    	$("#bstart").text("STOP");

    	this.initnotecolori();
    	this.resetgrafici();
		tmidi.aggiornaerrori();
  
    	this.inizio=performance.now()+1000;  //comincerà fra un secondo
		this.next=this.inizio;
		this.inizioinput=this.inizio+1000;
		this.notacorrente=0;
		//this.sinistracorrente=-1;
		//this.sinistranota=[];
    	//this.destranota=[];
    	this.notain=[];
    	this.barrasinistra=[];  //{"s":start,"w":width,"c":color,"e":error}
    	this.barradestra=[];


		$("#barrad").css({left:300, width:400, "background-color":"black"});
		$("#barrad").text("DESTRA");
		$("#barras").css({left:300, width:400, "background-color":"black"});
		$("#barras").text("SINISTRA");


		setTimeout(tmidi.startnota,this.inizio-performance.now())
		tmidi.notestart[tmidi.cbuffer[0]]=this.inizio+this.latenza;
		tmidi.notestart[tmidi.cbuffer[0]-12]=this.inizio+this.latenza;

    	/*var prima=60;
    	var bpm=60;
    	var ottavo=60000/(bpm*2)
    	var sedicesimo=60000/(bpm*4)
    	var ritardo=500;
    	var durata=sedicesimo;
    	log (performance.now()+" "+Jazz.Time())
    	Jazz.MidiOut(0x90,prima,120)
    	Jazz.MidiOut(0x80,prima,120)
    	for (var i=0;i<this.Hanon1.length;i++){
    		var nota=this.Hanon1[i];
    		setTimeout(tmidi.MidiO,(i)*durata+ritardo,0x90,nota,120)
    		setTimeout(tmidi.MidiO,(i+0.9)*durata+ritardo,0x80,nota,120)
    	}
		*/
    	
    },

        stopsuona: function(){
    	this.fsuona=false;
   		$("#bstart").css({"border-color":"#888888"});
   		$("#bstart").text("START");
   		tmidi.aggiornaerrori();


    },


     startnota: function(){ 
     	if (!tmidi.fsuona) return;
     	if (tmidi.fcancellaintro){tmidi.fcancellaintro=false;tmidi.fintro=false}
     	if (tmidi.fintro) {
			var nota=tmidi.drumsintro[tmidi.Bintro[tmidi.notacorrente]];
			//log ("OUT: 99 "+nota+" "+tmidi.velocitaout+" "+performance.now()+" "+Jazz.Time())
			Jazz.MidiOut(0x99,nota,tmidi.velocitaout);
			setTimeout(tmidi.stopnotaintro,tmidi.next+duratanota-performance.now(),nota);  //richiede nota off
			tmidi.next+=tmidi.quarto;
   			setTimeout(tmidi.startnota,tmidi.next-performance.now());
   			tmidi.notacorrente++;
			if (tmidi.notacorrente>=tmidi.Bintro.length){
    			tmidi.fcancellaintro=true;
    			setTimeout(function(){$("#bstart").css({"border-color":"yellow"})},tmidi.next-performance.now());
    			tmidi.notacorrente=0;
    			tmidi.inizioinput=tmidi.next;
 			}
	    	setTimeout(tmidi.stopnotaintro,tmidi.next-tmidi.intervallo+duratanota-performance.now(),nota);  //richiede nota off
			return
     	}
		if (tmidi.notacorrente>tmidi.barradestra.length+2){
				$("#barrad").css({left:300, width:400, "background-color":"red"});
				while (tmidi.notacorrente>tmidi.barradestra.length+2) {
					tmidi.barradestra.push({"s":0,"w":200,"c":"red","e":true,"v":0});
					tmidi.colorenotadestra[tmidi.barradestra.length-1]="#FF0000";  //red
				}
				$("#barrad").text("DESTRA "+(tmidi.barradestra.length-1));
				tmidi.drawdestra();
		}
		if (tmidi.notacorrente>tmidi.barrasinistra.length+2){
				$("#barras").css({left:300, width:400, "background-color":"red"});
				while (tmidi.notacorrente>tmidi.barrasinistra.length+2) {
					tmidi.barrasinistra.push({"s":0,"w":200,"c":"red","e":true,"v":0});
					tmidi.colorenotasinistra[tmidi.barrasinistra.length-1]="#FF0000";  //red
				}
				$("#barras").text("SINISTRA "+(tmidi.barrasinistra.length-1));
				
				tmidi.drawsinistra();

		}



  		


     	var nota=tmidi.cbuffer[tmidi.notacorrente];
    	//log ("OUT: 90 "+nota+" "+tmidi.velocitaout+" "+performance.now()+" "+Jazz.Time())
		if (tmidi.notacorrente%4==0){
			Jazz.MidiOut(0x99,75,tmidi.velocitaout);
			setTimeout(tmidi.stopnotaintro,tmidi.next+duratanota-performance.now(),nota);  //richiede nota off

		}


    	Jazz.MidiOut(0x90,nota,tmidi.velocitaout);
    	tmidi.notestart[nota]=performance.now()+tmidi.latenza;
    	tmidi.notestart[nota-12]=performance.now()+tmidi.latenza;
    	var duratanota = tmidi.durata;
    	  //richiede nota off
    	tmidi.next+=tmidi.intervallo;
    	if (tmidi.notacorrente>=tmidi.cbuffer.length-1) {
    		duratanota=tmidi.intervallo*3+tmidi.durata;  //ultima nota lunga
    		tmidi.fcancellasuona=true;

    	}
    	else {
    		setTimeout(tmidi.startnota,tmidi.next-performance.now());
    		tmidi.notacorrente++;
 			tmidi.notestart[tmidi.notacorrente]=tmidi.next;

    	}

    	setTimeout(tmidi.stopnota,tmidi.next-tmidi.intervallo+duratanota-performance.now(),nota);  //richiede nota off
    	tmidi.aggiornaerrori();
    }, 


     stopnota: function(nota){ 
     	if (tmidi.fcancellasuona) {
     		tmidi.fcancellasuona=false;
     		tmidi.fsuona=false;
     		$("#bstart").css({"border-color":"#888888"});
    		$("#bstart").text("START");
    		tmidi.aggiornaerrori();
		}
    	//log ("OUT: 80 "+nota+" "+tmidi.velocitaout+" "+performance.now()+" "+Jazz.Time())
    	Jazz.MidiOut(0x80,nota,tmidi.velocitaout);
    }, 

    stopnotaintro: function(nota){ 
    	//log ("OUT: 89 "+nota+" "+tmidi.velocitaout+" "+performance.now()+" "+Jazz.Time())
    	Jazz.MidiOut(0x89,nota,tmidi.velocitaout);
    }, 

	drawsinistra:function(){
		a=2;
		tmidi.initgrafico(ctxs,canvass.width,canvass.height);
		tmidi.initgraficov(ctxvs,canvasvs.width,canvasvs.height);
  		var b=tmidi.barrasinistra;
  		var l=b.length;
  		ctxvs.fillStyle="yellow";
  		for (var i=0;i<l;i++){
  			ctxs.fillStyle = b[i].c;
  			ctxs.fillRect(b[i].s, 500-(l-i)*a,b[i].w,-a);
  			ctxvs.fillRect(0,500-(l-i)*a,Math.floor((b[i].v-30)/0.7),-a);
  		}

	},

	drawdestra:function(){
		a=2;
		tmidi.initgrafico(ctxd,canvasd.width,canvasd.height);
		tmidi.initgraficov(ctxvd,canvasvd.width,canvasvd.height);
  		var b=tmidi.barradestra;
  		var l=b.length;
  		ctxvd.fillStyle="yellow";
  		for (var i=0;i<l;i++){
  			ctxd.fillStyle = b[i].c;
  			ctxd.fillRect(b[i].s, 500-(l-i)*a,b[i].w,-a);
  			ctxvd.fillRect(0,500-(l-i)*a,Math.floor((b[i].v-30)/0.8),-a);
  			//ctxvd.fillRect(0,600-(l-i)*3,120/1.6,-3)
  		}

	},


	
    creacontatore:function (nome,larghezza,altezza,contenitore,posx,posy) {

		var wdigit=Math.floor(larghezza*0.9/3),hdigit=Math.floor(altezza*9/10);
		var offsetx=Math.round(1+larghezza/50);
		var offsety=Math.round(1+altezza/50);

		$("#"+contenitore).append('<div id="'+nome +'" style="top: '+posy+'px; left: '+posx+'px;" class="contatore">'+
		'<img src="images/vassoiod.png" height="'+altezza+'px" width="'+larghezza+'px">'
		
		+'<div id="digit3" class="digitx" style="top: '+offsety+'px; left: '+offsetx+'px; width:'+wdigit+'px; height:'+hdigit+'px;'+
		'	background-size: '+wdigit+'px '+(hdigit*10)+'px; background-position: -0px 0px; "  > </div>'
		+'<div id="digit2" class="digitx" style="top: '+offsety+'px; left: '+Math.floor(offsetx+larghezza/3.2)+'px; width:'+wdigit+'px; height:'+hdigit+'px;'+
		'	background-size: '+wdigit+'px '+(hdigit*10)+'px; background-position: -0px 0px; "  > </div>'
		+'<div id="digit1" class="digitx" style="top: '+offsety+'px; left: '+Math.floor(offsetx+larghezza/3.2*2)+'px; width:'+wdigit+'px; height:'+hdigit+'px;'+
		'	background-size: '+wdigit+'px '+(hdigit*10)+'px; background-position: -0px 0px; "  > </div> </div>'

		)

    },

    creacontatore:function (nome,larghezza,altezza,contenitore,posx,posy,opzione) {

		var wdigit=Math.floor(larghezza*0.9/3),hdigit=Math.floor(altezza*9/10);
		var offsetx=Math.round(1+larghezza/50);
		var offsety=Math.round(1+altezza/50);
		var largopzione=0;
		var immagine="images/vassoiod.png";
		if (opzione="4pulsanti"){
			immagine="images/vassoiodpuls.png";
			largopzione=Math.round(larghezza*0.5);
		}

		$("#"+contenitore).append('<div id="'+nome +'" style="top: '+posy+'px; left: '+posx+'px;" class="contatore">'+
		'<img src='+immagine+' height="'+altezza+'px" width="'+(larghezza+largopzione)+'px">'
		
		+'<div id="digit3" class="digitx" style="top: '+offsety+'px; left: '+offsetx+'px; width:'+wdigit+'px; height:'+hdigit+'px;'+
		'	background-size: '+wdigit+'px '+(hdigit*10)+'px; background-position: -0px 0px; "  > </div>'
		+'<div id="digit2" class="digitx" style="top: '+offsety+'px; left: '+Math.floor(offsetx+larghezza/3.2)+'px; width:'+wdigit+'px; height:'+hdigit+'px;'+
		'	background-size: '+wdigit+'px '+(hdigit*10)+'px; background-position: -0px 0px; "  > </div>'
		+'<div id="digit1" class="digitx" style="top: '+offsety+'px; left: '+Math.floor(offsetx+larghezza/3.2*2)+'px; width:'+wdigit+'px; height:'+hdigit+'px;'+
		'	background-size: '+wdigit+'px '+(hdigit*10)+'px; background-position: -0px 0px; "  > </div> </div>'

		)

    },



	displaypunti: function(punti,display) {
		var centinaia,decine,unita,altezza;
		if (punti>999) punti=999;
		centinaia=Math.floor(punti/100); punti-=(centinaia*100);
		decine=Math.floor(punti/10); punti-=(decine*10);
		unita=punti;
		altezza=(parseInt(document.querySelector("#"+display+" #digit3").style.height));
		//altezza=$("#"+display+" #digit3").height();

		var pippocentinaia= parseInt(($("#"+display+" #digit3").css("background-position")).slice(4));
		$("#"+display+" #digit3").animate({"pippocentinaia":((-altezza*centinaia) + "px" )}, {
			 step: function( now, fx ) {
				$("#"+display+" #digit3").css({"background-position":("0px "+ now + "px" )});
			}
		});


		var pippodecine= parseInt(($("#"+display+" #digit2").css("background-position")).slice(4));
		$("#"+display+" #digit2").animate({"pippodecine":((-altezza*decine) + "px" )}, {
			 step: function( now, fx ) {
				$("#"+display+" #digit2").css({"background-position":("0px "+ now + "px" )});
			}
		});


		var pippounita= parseInt(($("#"+display+" #digit1").css("background-position")).slice(4));
		$("#"+display+" #digit1").animate({"pippounita":((-altezza*unita) + "px" )}, {
			 step: function( now, fx ) {
				$("#"+display+" #digit1").css({"background-position":("0px "+ now + "px" )});
			}
		});
	},

/*    MidiO: function(a,b,c){ 
    	log ("OUT: "+a+" "+b+" "+c+" "+performance.now()+" "+Jazz.Time())
    	Jazz.MidiOut(a,b,c);
    	Jazz.MidiOut(a,b-12,c)
    }, */

	drumsintro:[77,76],
	Bintro:  [01,00,01,00],
	
	Hanon2: [48,52,53,55,57,55,53,52],
	Hanon1: [48,52,53,55,57,55,53,52,
			 50,53,55,57,59,57,55,53,
			 52,55,57,59,60,59,57,55,
			 53,57,59,60,62,60,59,57,
			 55,59,60,62,64,62,60,59,
			 57,60,62,64,65,64,62,60,
			 59,62,64,65,67,65,64,62,
			 60,64,65,67,69,67,65,64,
			 62,65,67,69,71,69,67,65,
			 64,67,69,71,72,71,69,67,
			 65,69,71,72,74,72,71,69,
			 67,71,72,74,76,74,72,71,
			 69,72,74,76,77,76,74,72,
			 71,74,76,77,79,77,76,74,
			 79,76,74,72,71,72,74,76,
			 77,74,72,71,69,71,72,74,
			 76,72,71,69,67,69,71,72,
			 74,71,69,67,65,67,69,71,
			 72,69,67,65,64,65,67,69,
			 71,67,65,64,62,64,65,67,
			 69,65,64,62,60,62,64,65,
			 67,64,62,60,59,60,62,64,
			 65,62,60,59,57,59,60,62,
			 64,60,59,57,55,57,59,60,
			 62,59,57,55,53,55,57,59,
			 60,57,55,53,52,53,55,57,
			 59,55,53,52,50,52,53,55,
			 57,53,52,50,48,50,52,53,
			 55,52,50,48,47,48,50,52,
			 48
			 
			 ],



}  //tmidi


$(document) .ready(function () {

    tmidi.start();

}); 
