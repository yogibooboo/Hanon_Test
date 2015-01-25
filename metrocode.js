function log(msg) {
    if (window.console && log.enabled) {
        console.log(msg);
    } 
} // log  
log.enabled = true;

  // recupera l'elemento canvas

$(window).resize(function () {
	tmidi.offsetxx=$("#campogioco").offset().left;
	tmidi.offsetyy=$("#campogioco").offset().top;
});


var reader = new FileReader();

reader.onload = function(e) {
  var rawData = reader.result;
}





$('#bstart').click(function () {
	tmidi.startstop();
});


$('#canvasmetronomo').mousedown(function (ev) {
	tmidi.metronomodown(ev);
});

$('#canvasmetronomo').mousemove(function (ev) {
	tmidi.metronomomove(ev);
});  


$('#canvasmetronomo').mouseup(function (ev) {
	tmidi.metronomoup(ev);
});



$('#canvasimposta').click(function (ev) {
	tmidi.impostaclick(ev);
})


$('#canvasimposta').mousedown(function (ev) {
	tmidi.impostadown(ev);
});

$('#canvasimposta').mousemove(function (ev) {
	tmidi.impostamove(ev);
});  


$('#canvasimposta').mouseup(function (ev) {
	tmidi.impostaup(ev);
});


document.addEventListener("keydown", keyDownTextField, false);

 function keyDownTextField(ev){    
 	log (ev.keyCode==32)
 	if (ev.keyCode==32) return tmidi.startstop();
 	if (ev.keyCode==38) return tmidi.setbpm(tmidi.bpm-1)
 	if (ev.keyCode==40) return tmidi.setbpm(tmidi.bpm+1)
 }


var active_element;
var current_in;
var msg;
var sel;




  canvasmetronomo = document.getElementById("canvasmetronomo");
  ctxmt = canvasmetronomo.getContext('2d');

  canvasimposta = document.getElementById("canvasimposta");
  ctxim = canvasimposta.getContext('2d');



tmchiavi=new Image();
tmchiavi.src="images/clefs.png";
tmmetronomo=new Image();
tmmetronomo.src="images/metronome.png";
tmmetroasta=new Image();
tmmetroasta.src="images/metroasta.png";
tmmetroindex=new Image();
tmmetroindex.src="images/metroindex.png";
tmmetrosotto=new Image();
tmmetrosotto.src="images/metrosotto.png";


var buffers={};

var context;


window.AudioContext = window.AudioContext||window.webkitAudioContext;
context = new AudioContext();




function playSound(buffer,time) {
  var source = context.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect(context.destination);       // connect the source to the context's destination (the speakers)
  source.start(time);                           // play the source now
                                             // note: on older systems, may have to use deprecated noteOn(time);
}


var tmidi = {
    

	
	
    start:function(){
    	
    	tmidi.inizializzazioni();
    	//tmidi.initbuffernote();
    	tmidi.resetgrafici();
    	window.requestAnimationFrame(tmidi.refresh);
    	tmidi.readfile("sounds/tick.wav","tickbuffer");
    	tmidi.readfile("sounds/tack.wav","tackbuffer");
    	tmidi.readfile("sounds/tickshort.wav","shortbuffer");
    	for (var i=1;i<11;i++) {
    		tmidi.readfile("sounds/"+i+".wav",i+"buffer");
    		tmidi.readfile("sounds/"+i+"-8.wav",i+"-8buffer");
     	}
        return;
    },

   
	filemidi:[],
	

	





	readfile:function (url,buff) {

		
		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", url, true);
		rawFile.responseType = "arraybuffer";

  		rawFile.onload = function() {
    		context.decodeAudioData(rawFile.response, function(buffer) {
      			buffers[buff] = buffer;
    			});
  		}

		rawFile.send(); 
	},





    resetgrafici:function(){
		setTimeout(tmidi.initmetronomo,100,ctxmt,canvasmetronomo.width,canvasmetronomo.height);
		setTimeout(tmidi.initimposta,100,ctxim,canvasimposta.width,canvasimposta.height);

    },





	initmetronomo:function(b,w,h) {

		
		b.fillStyle="#FFFFFF";
		var angolo=0;
		var cursore=-100-300*((120-tmidi.bpm)/80);
		//log ("cursore= "+cursore)
		var tempo=context.currentTime;

		b.setTransform(1, 0, 0, 1, 0, 0);		
		b.clearRect(0, 0, w,h);

		if (tmidi.fsuona&&(tempo>tmidi.inizio)){
			var periodi=((tempo-tmidi.inizio)/(2*tmidi.quarto/1000))
			periodi-=Math.floor(periodi);
			angolo=20*(2-tmidi.bpm/80)*Math.PI/180*Math.sin(periodi*Math.PI*2);
		}
		
		b.drawImage(tmmetronomo, 0, -40,375,750);
		//b.drawImage(tmmetroasta, 220, 500,10,300);
		b.translate(187,570);
		b.rotate(angolo);
		b.fillRect(0,0,1,-330)
		//b.drawImage(tmmetroasta, -5,0,10,-330);
		b.drawImage(tmmetroasta, -7,-535,15,495);
		//b.drawImage(tmmetroindex, -24,cursore,50,-40);
		b.drawImage(tmmetroindex, -36,cursore-60,75,60);

		b.setTransform(1, 0, 0, 1, 0, 0);
		b.drawImage(tmmetrosotto, 0, 410,375,350);

	},
  
	nquarti:4,
	nsuddividi:3,
	metricasel:4,
	metrica:[],
	metricaleft:50,
	metricatop:230,
	indexleft:50,
	indextop:10,
	opzionileft:230,
	opzionitop:500,
	opzioniwidth:300,
	shuffle:50,

	initimposta:function(b,w,h,soloindex) {

		if (!soloindex){
		



			var zleft=tmidi.metricaleft,ztop=tmidi.metricatop;

			b.fillStyle="#FF8C00";


			b.fillRect(zleft,ztop,480,240);

			b.fillStyle="#FFFF00";
			b.fillRect(zleft+80*(tmidi.metricasel%6),ztop+80*Math.floor(tmidi.metricasel/6),80,80);


			b.fillStyle="#000000";

			for (var i=0; i<4;i++){
				b.fillRect(zleft,ztop+i*80,480,3)
			}
			for (var i=0; i<8;i++){
				b.fillRect(zleft+i*80,ztop,3,240)
			}

			var scrivi= function(y,x,num,den) {
				b.fillText(num,zleft+30+80*x,ztop+30+80*y)
				b.fillText(den,zleft+30+80*x-10*Math.floor(den/10),ztop+70+80*y)
				b.fillRect(zleft+25+80*x,ztop+38+80*y,30,3)
				var dati={num:num,den:den};
				tmidi.metrica[x+6*y]=dati;
			} 

			b.fillStyle="#000000";
			b.font="30px Verdana";
			scrivi (0,0,2,2);
			scrivi (0,1,1,4);
			scrivi (0,2,2,4);
			scrivi (0,3,3,4);
			scrivi (0,4,4,4);
			scrivi (0,5,5,4);
			scrivi (1,0,1,8);
			scrivi (1,1,2,8);
			scrivi (1,2,3,8);
			scrivi (1,3,4,8);
			scrivi (1,4,5,8);
			scrivi (1,5,6,8);
			scrivi (2,0,7,16);
			scrivi (2,1,2,16);
			scrivi (2,2,3,16);
			scrivi (2,3,4,16);
			scrivi (2,4,5,16);
			scrivi (2,5,6,16)


			var zleft=tmidi.opzionileft,ztop=tmidi.opzionitop,zw=tmidi.opzioniwidth;
			
			
			b.clearRect(zleft,ztop,zw,25*tmidi.numeroopzioni);
			
			b.font="18px Verdana";
			var nsw=tmidi.numeroopzioni;

			b.fillStyle="#A0522D";
			for (var i=0;i<nsw;i++){
				if (tmidi.opzioni[i]) b.fillRect(zleft+zw-40,ztop+i*25,40,25);
				else	b.fillRect(zleft+zw-80,ztop+i*25,40,25);
			}

			b.fillStyle="#FFFFFF";


			for (var i=0;i<nsw;i++){
				b.fillRect(zleft,ztop+i*25,zw,2);
				b.fillText("I",zleft+zw-25,ztop+20+i*25);
				b.fillText("O",zleft+zw-65,ztop+20+i*25);
			}
			b.fillRect(zleft,ztop+i*25,zw,2);

			b.fillRect(zleft+zw,ztop,2,25*nsw);
			b.fillRect(zleft+zw-40,ztop,2,25*nsw);
			b.fillRect(zleft+zw-80,ztop,2,25*nsw);
			b.fillRect(zleft,ztop,2,25*nsw);
			b.fillText("First beat accent",zleft+10,ztop+20);
			b.fillText("Beat subdivision",zleft+10,ztop+45);
			b.fillText("One two three four",zleft+10,ztop+70);
			b.fillText("Shuffle",zleft+10,ztop+95);
			b.fillText("intro",zleft+10,ztop+120);  

			b.fillStyle="#FF8C00";
			b.fillRect(zleft+80,ztop+3*25+2,110,23);
			b.font="12px Verdana";
			b.fillText(tmidi.shuffle,zleft+195,ztop+93);  
			b.strokeStyle="#000000";
			b.rect(zleft+82,ztop+3*25+2,106,21);
			b.stroke();
			b.fillStyle="#000000";
			b.fillRect(zleft+82+tmidi.shuffle,ztop+3*25+3,10,19);
		}






		var zleft=tmidi.indexleft,ztop=tmidi.indextop;
		var zden=tmidi.metrica[tmidi.metricasel].den,znum=tmidi.metrica[tmidi.metricasel].num;

		var angolo=0;
		var tempo=context.currentTime;

		if (tmidi.fsuona&&(tempo>tmidi.inizio)){
			var periodi=((tempo-tmidi.inizio)/(tmidi.periodo/1000))
			periodi=Math.floor(periodi);
			angolo=(tempo-tmidi.inizio-periodi*tmidi.periodo/1000)/(tmidi.periodo/1000)
		}




		b.fillStyle="#FF8C00";


		b.fillRect(zleft,ztop,480,200); 

		b.fillStyle="#FFFF00";

		b.fillRect(zleft+480*angolo,ztop+50,10,100);
		b.clearRect(zleft+480,ztop+50,10,100);

		b.fillStyle="#000000";

		for (var i=1; i<4;i++){
			b.fillRect(zleft,ztop+i*50,480,3)
		}

		b.font="14px Verdana";
				

		for (var i=0; i<znum;i++){
			b.fillStyle="#000000";
			b.fillText(((i+1)+"/"+zden),zleft+3+i*480/znum,ztop+40)
			b.fillText((1+"/"+zden*2),zleft+3+i*480/znum,ztop+170)
			b.fillText((2+"/"+zden*2),zleft+3+(i+0.5)*480/znum,ztop+170)
			b.fillStyle="#800000"
			b.fillRect(zleft+i*480/znum,ztop,1,200)
			b.fillRect(zleft+(i+0.5)*480/znum,ztop+150,1,30)
		}

		


	},

    
    impostaclick:function(ev){
    	var x  = (ev.offsetX || ev.clientX - $(ev.target).offset().left);
		var y  = (ev.offsetY || ev.clientY - $(ev.target).offset().top);
		
		if ((x>tmidi.metricaleft)&&(x<tmidi.metricaleft+480)&&(y>tmidi.metricatop)&&(y<tmidi.metricatop+240)){
			tmidi.metricasel=(Math.floor((x-tmidi.metricaleft)/80)+6*(Math.floor(((y-tmidi.metricatop))/80)))
			tmidi.initimposta(ctxim,canvasimposta.width,canvasimposta.height);
			tmidi.aggiustatempi();
		}
    	
    
		if (((x>tmidi.opzionileft+tmidi.opzioniwidth-80)&&(x<tmidi.opzionileft+tmidi.opzioniwidth)&&
			(y>tmidi.opzionitop)&&(y<tmidi.opzionitop+tmidi.numeroopzioni*25))) {
			var opz=Math.floor((y-tmidi.opzionitop)/25);
			var opzset = false;
			if (x>tmidi.opzionileft+tmidi.opzioniwidth-40) opzset=true;
			tmidi.opzioni[opz]=opzset;
			tmidi.initimposta(ctxim,canvasimposta.width,canvasimposta.height)
			
		}




    },

    refresh: function() {
    	
    	
		tmidi.initmetronomo(ctxmt,canvasmetronomo.width,canvasmetronomo.height);
			if (tmidi.fsuona) tmidi.initimposta(ctxim,canvasimposta.width,canvasimposta.height,true); //solo indice


    	window.requestAnimationFrame(tmidi.refresh);	
    },



    midiout : function(a,b,c){
    	Jazz.MidiOut(a,b,c);	

    },

	


	fmdown:false,
	fmmove:false,
	mdownx:0, mprevx:0,
	mdowny:0, mprevy:0,mdeltay:0,
	mbpm:0,mdeltabpm:8,
	moffset:0,mstartoffset:0,



	metronomodown:function(ev){

		var x  = (ev.offsetX || ev.clientX - $(ev.target).offset().left);
		var y  = (ev.offsetY || ev.clientY - $(ev.target).offset().top);


		if((tmidi.fsuona)||(x<150)||(x>225)) return;

		mbpm=Math.floor(120+(y-410)*80/300);

		mdeltabpm=mbpm-tmidi.bpm;
		if((mdeltabpm<0)||(mdeltabpm>15)) return;
	
		tmidi.fmdown=true;
		tmidi.fmmove=false;
		tmidi.mdowny=y;
		tmidi.mprevy=y;
		tmidi.mstartoffset=tmidi.moffset;
		tmidi.mdeltay=0;
	
	},

	metronomomove:function(ev){

		var x  = (ev.offsetX || ev.clientX - $(ev.target).offset().left);
		var y  = (ev.offsetY || ev.clientY - $(ev.target).offset().top);

		tmidi.mprevy=y;
		if(!tmidi.fmdown) return;
		tmidi.mdeltay=y-tmidi.mdowny;
		if (!tmidi.fmmove){
			if (Math.abs(tmidi.mdeltay)>3) tmidi.fmmove=true;
		}
		if (tmidi.fmmove){
			tmidi.moffset=tmidi.mstartoffset+tmidi.mdeltay;
		mbpm=Math.floor(120+(y-410)*80/300)-mdeltabpm;;

		tmidi.setbpm(mbpm);



		}
	},

	metronomoup:function(ev){
		if(!tmidi.fmdown) return;

		tmidi.fmdown=false;
		tmidi.fmmove=false;

	},



	fidown:false,
	fimove:false,
	idownx:0, iprevx:0,
	idowny:0, iprevy:0,ideltay:0,
	ishuffle:0,ideltashuffle:8,



	impostadown:function(ev){

		var x  = (ev.offsetX || ev.clientX - $(ev.target).offset().left);
		var y  = (ev.offsetY || ev.clientY - $(ev.target).offset().top);

		
		log (x+" "+y)

		if (((x>tmidi.opzionileft+80)&&(x<tmidi.opzionileft+180)&&
			(y>tmidi.opzionitop+77)&&(y<tmidi.opzionitop+100))) {

						



			tmidi.ishuffle=Math.floor(x-(tmidi.opzionileft+80));

			tmidi.ideltashuffle=tmidi.ishuffle-tmidi.shuffle;
			if((tmidi.ideltashuffle<-10)||(tmidi.ideltashuffle>10)) return;

			tmidi.fidown=true;
			tmidi.fimove=false;
			tmidi.idownx=x;
			tmidi.iprevx=x;
			tmidi.ideltax=0;
			tmidi.ishuffle=tmidi.shuffle;
		}
	},

	impostamove:function(ev){

		var x  = (ev.offsetX || ev.clientX - $(ev.target).offset().left);
		var y  = (ev.offsetY || ev.clientY - $(ev.target).offset().top);

		tmidi.iprevx=x;
		if(!tmidi.fidown) return;
		tmidi.ideltax=x-tmidi.idownx;
		if (!tmidi.fimove){
			if (Math.abs(tmidi.ideltax)>2) tmidi.fimove=true;
		}
		if (tmidi.fimove){
		tmidi.shuffle=tmidi.ishuffle+tmidi.ideltax;
		if (tmidi.shuffle>100) (tmidi.shuffle=100);
		if (tmidi.shuffle<0) (tmidi.shuffle=0);
		
		tmidi.initimposta(ctxim,canvasimposta.width,canvasimposta.height);



		}
	},

	impostaup:function(ev){
		if(!tmidi.fidown) return;

		tmidi.fidown=false;
		tmidi.fimove=false;

	},



	inizializzazioni: function(){

		tmidi.fsuona=false;
		tmidi.fnoteon=false;
		tmidi.fintro=false;
		tmidi.fpreintro=false;
		tmidi.fcancellasuona=false;
		tmidi.inizio=context.currentTime;
		tmidi.inizioinput=tmidi.inizio;
		//Jazz.MidiOut(0x90,60,0);   //sembra che il MidiOut si debba inizializzare...
    	//Jazz.MidiOut(0x80,60,0);
    	tmidi.notacorrente=0;
    	//tmidi.sinistracorrente=-1;
    	//tmidi.sinistranota=[];
    	//tmidi.destranota=[];
    	tmidi.notain=[];
    	tmidi.deltastarts=[];
    	tmidi.deltastops=[];
    	tmidi.vels=[];
    	tmidi.deltastartd=[];
    	tmidi.deltastopd=[];
    	tmidi.veld=[];
    	tmidi.barrasinistra=[];  //{"s":start,"w":width,"c":color,"e":error}
    	tmidi.barradestra=[];
    	tmidi.colorenotadestra=[];
    	tmidi.colorenotasinistra=[];

    	tmidi.numerrnoted=0;
    	tmidi.errnoted=0;
    	tmidi.errad=0;
    	tmidi.errdd=0;
    	tmidi.errpd=0;
    	tmidi.errdurd=0;
    	tmidi.gfd=0;
    	tmidi.numerrnotes=0;
    	tmidi.errnotes=0;
    	tmidi.erras=0;
    	tmidi.errds=0;
    	tmidi.errps=0;
    	tmidi.errdurs=0
    	tmidi.gfs=0;

    	
    	tmidi.bpm=80;
		tmidi.velocitaout=120;
		tmidi.cbuffer=tmidi.Hanon1;
		tmidi.notein=[];
		tmidi.notestart=[];
		tmidi.latenza=0;
		tmidi.BufferNote=[];   //note con 0 a partire da do sotto due ottave
		tmidi.creacontatore("contabpm",135,60,"metronomo",93,550,"4pulsanti");
		tmidi.displaypuntifast(tmidi.bpm,"contabpm");
		$('#contabpm').click(function (ev) {
			tmidi.setbpmx(ev);
		});


		tmidi.numeroopzioni=5;
		tmidi.opzioni=[]
		for (var i=0;i<tmidi.numeroopzioni;i++){
			tmidi.opzioni[i]=false;
		}
		tmidi.opzioni[0]=true;
		tmidi.opzioni[1]=true;


    },




	aggiustatempi: function(){
    	tmidi.quarto=60000/(tmidi.bpm);
    	tmidi.ottavo=60000/(tmidi.bpm*2);
    	tmidi.sedicesimo=60000/(tmidi.bpm*4);
    	tmidi.intervallo=60000*4/(tmidi.bpm*tmidi.metrica[tmidi.metricasel].den);
    	tmidi.durata=tmidi.intervallo*0.9;
    	tmidi.periodo=tmidi.intervallo*tmidi.metrica[tmidi.metricasel].num
	},


	


	setbpmx: function(ev){

		var x  = (ev.offsetX || ev.clientX - $(ev.target).offset().left);
		var y  = (ev.offsetY || ev.clientY - $(ev.target).offset().top);

		if (x<87){
			//form imposta bpm
			tmidi.aggiustatempi();
			tmidi.aggiornaerrori();   ///7PROVVISORIO
			return
		}
		
		if ((x<108)&&(y<20)) return tmidi.setbpm(tmidi.bpm+1);
		if ((x<108)) return tmidi.setbpm(tmidi.bpm-1);
		if ((x>108)&&(y<20)) return tmidi.setbpm(tmidi.bpm+5);
		return tmidi.setbpm(tmidi.bpm-5);
	},

	setbpm: function(newbpm){
		tmidi.bpm=newbpm;
		if (tmidi.bpm>120) tmidi.bpm=120;
		if (tmidi.bpm<40) tmidi.bpm=40;
		tmidi.aggiustatempi();
		tmidi.displaypuntifast(tmidi.bpm,"contabpm");

	},


	



		
    startstop: function(){
    	if (tmidi.fsuona) {tmidi.stopsuona();return};
    	tmidi.aggiustatempi();
    	tmidi.fsuona=true;
    	if (tmidi.opzioni[4]) {tmidi.fintro=true;tmidi.fpreintro=true}  //opzione intro
    	tmidi.fcancellaintro=false;
    	tmidi.fcancellasuona=false;
   	   	$("#bstart").css({"border-color":"red"});
    	$("#bstart").text("STOP");

    	tmidi.resetgrafici();
  
    	

    	
    	tmidi.inizio=context.currentTime+1 //+1000;  //comincerà fra 0,1 secondi
		tmidi.next=tmidi.inizio;
    		log ("inizio "+tmidi.inizio+" current "+context.currentTime+" next "+tmidi.next+" now "+performance.now())
	

		setTimeout(tmidi.startnota,(tmidi.inizio-context.currentTime)*1000)


    	
    },

        stopsuona: function(){
    	tmidi.fsuona=false;
   		$("#bstart").css({"border-color":"#888888"});
   		$("#bstart").text("START");


    },


	preparamisura: function() {
		var opz=tmidi.opzioni;
		var est=""; // estensione file;
		if (tmidi.metrica[tmidi.metricasel].den>4) est="-8";
		var subtime=tmidi.next+tmidi.intervallo/2000;
		if (opz[3]) subtime=tmidi.next+tmidi.intervallo*(1+(tmidi.shuffle)/100)/2000;  //shuffle

		if (tmidi.fintro){
			if (opz[0]) playSound(buffers.tickbuffer,tmidi.next); //first beat accent
			else playSound(buffers.shortbuffer,tmidi.next);
			if (!tmidi.fpreintro) playSound(buffers[1+est+"buffer"],tmidi.next);
			for (var i=1;i<tmidi.metrica[tmidi.metricasel].num;i++){
				playSound(buffers["shortbuffer"],tmidi.next+tmidi.intervallo*i/1000);
				if (!tmidi.fpreintro) playSound(buffers[i+1+est+"buffer"],tmidi.next+tmidi.intervallo*i/1000);
			}

		}
		else {
			if (opz[0]) playSound(buffers.tickbuffer,tmidi.next); //first beat accent
			else playSound(buffers.shortbuffer,tmidi.next);
			if (opz[2]) playSound(buffers[1+est+"buffer"],tmidi.next);
			if (opz[1]) playSound(buffers["shortbuffer"],subtime);
			for (var i=1;i<tmidi.metrica[tmidi.metricasel].num;i++){
				playSound(buffers["shortbuffer"],tmidi.next+tmidi.intervallo*i/1000);
				if (opz[1]) playSound(buffers["shortbuffer"],subtime+tmidi.intervallo*i/1000);
				if (opz[2]) playSound(buffers[i+1+est+"buffer"],tmidi.next+tmidi.intervallo*i/1000);
			}
		}
	},
	 
     startnota: function(){ 
     	if (!tmidi.fsuona) return;
    	tmidi.preparamisura();
    	if (tmidi.fpreintro) tmidi.fpreintro=false;
    	else tmidi.fintro=false;
    	tmidi.next+=tmidi.periodo/1000;

		//playSound(buffers.tickbuffer,context.currentTime+0.1);
		//playSound(buffers.tickbuffer,context.currentTime+0.2);
    	setTimeout(tmidi.startnota,(tmidi.next-context.currentTime)*1000);
    	log ("current "+context.currentTime+" next "+tmidi.next+" now "+performance.now())
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




	


    creacontatore:function (nome,larghezza,altezza,contenitore,posx,posy,opzione) {

		var wdigit=Math.floor(larghezza*0.9/3),hdigit=Math.floor(altezza*9/10);
		var offsetx=Math.round(1+larghezza/50);
		var offsety=Math.round(1+altezza/50);
		var largopzione=0;
		var immagine="images/vassoiod.png";
		if (opzione=="4pulsanti"){
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



	displaypuntifast: function(punti,display) {
		var centinaia,decine,unita,altezza;
		if (punti>999) punti=999;
		centinaia=Math.floor(punti/100); punti-=(centinaia*100);
		decine=Math.floor(punti/10); punti-=(decine*10);
		unita=punti;
		altezza=(parseInt(document.querySelector("#"+display+" #digit3").style.height));
		//altezza=$("#"+display+" #digit3").height();

		$("#"+display+" #digit3").css({"background-position":("0px "+ (-altezza*centinaia) + "px" )});
		$("#"+display+" #digit2").css({"background-position":("0px "+ (-altezza*decine) + "px" )});
		$("#"+display+" #digit1").css({"background-position":("0px "+(-altezza*unita) + "px" )});
	},



}  //tmidi


$(document) .ready(function () {

    tmidi.start();

}); 
