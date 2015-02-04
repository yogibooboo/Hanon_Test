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


$("#wc").hide()
var vediwc=false;

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

  wc = document.getElementById("wc");
  waveCanvas = wc.getContext('2d');


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
tmsiaudio=new Image();
tmsiaudio.src="images/metronome/siaudiog.png";
tmnoaudio=new Image();
tmnoaudio.src="images/metronome/noaudiog.png";

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


var rafID = null;
var tracks = null;
var buflen = 1024;
//var buf = new Float32Array( buflen );
var buf = new Uint8Array( buflen );


var tmidi = {
    

	
	
    start:function(){
    	
    	tmidi.inizializzazioni();
    	tmidi.resetgrafici();
    	window.requestAnimationFrame(tmidi.refresh);
    	tmidi.readfile("sounds/tick.wav","tickbuffer");
    	tmidi.readfile("sounds/tack.wav","tackbuffer");
    	tmidi.readfile("sounds/teck.wav","teckbuffer");
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

		


		if ((tmidi.fsuona||tmidi.fpoststop)&&(tempo>tmidi.inizio)){
			var xinizio=tmidi.prev,xquarto=tmidi.quartonext,xperiodo=tmidi.periodonext,xquarti=tmidi.quartinext;
			if (tempo<tmidi.prev) xinizio=tmidi.prev-tmidi.periodoprev/1000,xquarto=tmidi.quartoprev,xperiodo=tmidi.periodoprev,xquarti=tmidi.quartiprev;
			var periodi=((tempo-xinizio)/(2*xquarto/1000))+xquarti/2
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
	metricasel2:4,
	metrica:[],
	metrica2:[],
	
	metricaleft:00,
	metricatop:230,
	indexleft:00,
	indextop:10,
	opzionileft:180,
	opzionitop:530,
	opzioniwidth:300,
	shuffle:50,
	moreoptions:0,

	
	//snum e sden sono quello visualizzati
	//num e den per il calcolo dei tempi in realtà sno uguali e le chiameremi div (mcm)
	//mnum e mden per la suddivisione principale, utilizzata dal metronomo

	initmetrica:function(){   //t=tempo   l=livello
		tmidi.metrica2[0]={snum:2,sden:2,div:4,mnum:2,mden:2,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2}]};
		tmidi.metrica2[1]={snum:1,sden:4,div:2,mnum:1,mden:4,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2}]};
		tmidi.metrica2[2]={snum:2,sden:4,div:4,mnum:2,mden:4,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2}]};
		tmidi.metrica2[3]={snum:3,sden:4,div:6,mnum:3,mden:4,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2}]};
		tmidi.metrica2[4]={snum:4,sden:4,div:8,mnum:4,mden:4,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2}]};
		tmidi.metrica2[5]={snum:5,sden:4,div:10,mnum:5,mden:4,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2},{t:8,l:0},{t:8,l:1},{t:9,l:2}]};
		tmidi.metrica2[6]={snum:2,sden:8,div:4,mnum:2,mden:8,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2}]};
		tmidi.metrica2[7]={snum:3,sden:8,div:6,mnum:3,mden:8,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2}]};
		tmidi.metrica2[8]={snum:4,sden:8,div:8,mnum:4,mden:8,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2}]};
		tmidi.metrica2[9]={snum:5,sden:8,div:10,mnum:5,mden:8,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2},{t:8,l:0},{t:8,l:1},{t:9,l:2}]};
		tmidi.metrica2[10]={snum:6,sden:8,div:12,mnum:6,mden:8,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2},{t:8,l:0},{t:8,l:1},{t:9,l:2},
		{t:10,l:0},{t:10,l:1},{t:11,l:2}]};
		tmidi.metrica2[11]={snum:7,sden:8,div:14,mnum:7,mden:8,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2},{t:8,l:0},{t:8,l:1},{t:9,l:2},
		{t:10,l:0},{t:10,l:1},{t:11,l:2},{t:12,l:0},{t:12,l:1},{t:13,l:2}]};
		tmidi.metrica2[12]={snum:2,sden:16,div:4,mnum:2,mden:16,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2}]};
		tmidi.metrica2[13]={snum:3,sden:16,div:6,mnum:3,mden:16,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2}]};
		tmidi.metrica2[14]={snum:4,sden:16,div:8,mnum:4,mden:16,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2}]};
		tmidi.metrica2[15]={snum:5,sden:16,div:10,mnum:5,mden:16,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2},{t:8,l:0},{t:8,l:1},{t:9,l:2}]};
		tmidi.metrica2[16]={snum:6,sden:16,div:12,mnum:6,mden:16,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2},{t:8,l:0},{t:8,l:1},{t:9,l:2},
		{t:10,l:0},{t:10,l:1},{t:11,l:2}]};
		tmidi.metrica2[17]={snum:7,sden:16,div:14,mnum:7,mden:16,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:0},{t:2,l:1},{t:3,l:2},{t:4,l:0},{t:4,l:1},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2},{t:8,l:0},{t:8,l:1},{t:9,l:2},
		{t:10,l:0},{t:10,l:1},{t:11,l:2},{t:12,l:0},{t:12,l:1},{t:13,l:2}]};



		tmidi.metrica2[18]={snum:5,sden:8,div:10,mnum:2,mden:4,note:[{t:0,l:0},{t:0,l:1},{t:2,l:2},
		{t:4,l:2},{t:5,l:0},{t:6,l:1},{t:8,l:2}]};
		tmidi.metrica2[19]={snum:6,sden:8,div:6,mnum:2,mden:4,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:2},{t:3,l:0},{t:3,l:1},{t:4,l:2},{t:5,l:2}]};
		tmidi.metrica2[20]={snum:9,sden:8,div:9,mnum:3,mden:4,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:2},{t:3,l:0},{t:3,l:1},{t:4,l:2},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2},{t:8,l:2}]};
		tmidi.metrica2[21]={snum:12,sden:8,div:12,mnum:4,mden:4,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:2},{t:3,l:0},{t:3,l:1},{t:4,l:2},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2},
		{t:8,l:2},{t:9,l:0},{t:9,l:1},{t:10,l:2},{t:11,l:2}]};
		tmidi.metrica2[22]={snum:15,sden:8,div:15,mnum:5,mden:4,note:[{t:0,l:0},{t:0,l:1},{t:1,l:2},
		{t:2,l:2},{t:3,l:0},{t:3,l:1},{t:4,l:2},{t:5,l:2},{t:6,l:0},{t:6,l:1},{t:7,l:2},
		{t:8,l:2},{t:9,l:0},{t:9,l:1},{t:10,l:2},{t:11,l:2},{t:12,l:0},{t:12,l:1},{t:13,l:2},{t:14,l:2}]};
		tmidi.metrica2[23]={snum:"4s",sden:8,div:24,mnum:4,mden:4,note:[{t:0,l:0},{t:0,l:1},{t:2,l:2},
		{t:3,l:0},{t:4,l:2},{t:6,l:0},{t:6,l:1},{t:8,l:2},{t:9,l:0},{t:10,l:2},{t:12,l:0},{t:12,l:1},{t:14,l:2},
		{t:15,l:0},{t:16,l:2},{t:18,l:0},{t:18,l:1},{t:20,l:2},{t:21,l:0},{t:22,l:2}]};


	},

	initimposta:function(b,w,h,soloindex) {


		var m2=tmidi.metrica2;

		if (!soloindex){
		
			//Gestione riquadro selezione metrica


			var zleft=tmidi.metricaleft,ztop=tmidi.metricatop;

			b.fillStyle="#FF8C00";


			b.fillRect(zleft,ztop,480,280);  //cancella riquadro

			b.fillStyle="#FFFF00";   //evidenzia la selezione
			

			if ((tmidi.moreoptions==0)&&(tmidi.metricasel2<18)){
				b.fillRect(zleft+80*(tmidi.metricasel2%6),ztop+80*Math.floor(tmidi.metricasel2/6),80,80);
			}
			else {
				if ((tmidi.moreoptions!=0)&&(tmidi.metricasel2>17)) b.fillRect(zleft+240*(tmidi.metricasel2%2),ztop+80*Math.floor((tmidi.metricasel2-18)/2),240,80);

			}

			b.fillStyle="#000000";


			var scrivi= function(y,x,num,den) {
				b.fillText(num,zleft+30+80*x,ztop+30+80*y)
				b.fillText(den,zleft+30+80*x-10*Math.floor(den/10),ztop+70+80*y)
				b.fillRect(zleft+25+80*x,ztop+38+80*y,30,3)
				var dati={num:num,den:den};
				tmidi.metrica[x+6*y]=dati;
			} 


			//righe orizzontali

			for (var i=0; i<4;i++){
				b.fillRect(zleft,ztop+i*80,480,3)
			}
			b.fillRect(zleft,ztop+280,480,3)
			
			b.fillRect(zleft,ztop,3,280)
			b.fillRect(zleft+6*80,ztop,3,280)

			b.fillStyle="#000000";
			b.font="30px Verdana";


			if (tmidi.moreoptions!=0){

				b.fillRect(zleft+240,ztop,3,240)   //divisoria centrale


				for (var i=18; i<24;i++){
					var step=12;				//distanza tra note (intervallo) 12 px
					if (m2[i].div>15) step=6;  //se più di 15 intervalli distanza=6

					var qleft=zleft+240*(i%2);
					var qtop=ztop+80*(Math.floor((i-18)/2));
					var val=m2[i].snum,flagesse=false;
					if (isNaN(val)) {val=10; flagesse=true}
					b.fillText(m2[i].snum,qleft+20-(10*Math.floor(val/10)),qtop+34)             //scrive numeratore
					b.fillText(m2[i].sden,qleft+20-10*Math.floor(m2[i].sden/10),qtop+69)        //scrive denominatore
					b.fillRect(qleft+15,qtop+39,30,3);										    //barretta di divisione
					var salvastrart=zleft;

					var perottavi=false,primoottavo=0;
					for (var j=0; j<m2[i].note.length;j++){
						var livello=m2[i].note[j].l;


						var ktop=qtop+30;kleft=qleft+60+m2[i].note[j].t*step
						b.fillStyle="black";

						if 	((flagesse)&&(livello==0)){
							if (perottavi){
								perottavi=false;
								b.fillRect(primoottavo+4,qtop+10,kleft-primoottavo,3);
							}else{
								perottavi=true;
								primoottavo=kleft;
							}
							
						}	

						
						if (livello>0) ktop=qtop+70;
						if (livello==1) {b.fillStyle="red";salvastart=kleft}
						b.beginPath();
						b.arc(kleft, ktop, 4, 0, 2*Math.PI);
						b.fill();
						b.fillRect(kleft+4,ktop-20,1,20);
						if (livello==2){
							b.fillRect(salvastart+4,ktop-20,kleft-salvastart,3);
							if (m2[i].sden==16) b.fillRect(salvastart+4,ktop-15,kleft-salvastart,3);
						}
					}
					/*b.fillStyle="#666666";
					b.fillRect(qleft+60+m2[i].num*12,qtop+2,1,76);
					b.fillStyle="black";*/

				}

			}
			else {

				for (var i=1; i<6;i++){
					b.fillRect(zleft+i*80,ztop,3,240)
				}
				scrivi (0,0,2,2);
				scrivi (0,1,1,4);
				scrivi (0,2,2,4);
				scrivi (0,3,3,4);
				scrivi (0,4,4,4);
				scrivi (0,5,5,4);
				scrivi (1,5,7,8);
				scrivi (1,0,2,8);
				scrivi (1,1,3,8);
				scrivi (1,2,4,8);
				scrivi (1,3,5,8);
				scrivi (1,4,6,8);
				scrivi (2,0,2,16);
				scrivi (2,1,3,16);
				scrivi (2,2,4,16);
				scrivi (2,3,5,16);
				scrivi (2,4,6,16);
				scrivi (2,5,7,16)
			}
			
			b.fillText("More Options",zleft+140,ztop+269)

			//Gestisce riquadro opzioni

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
			//b.fillText("First beat accent",zleft+10,ztop+20);
			//b.fillText("Beat subdivision",zleft+10,ztop+45);
			b.fillText("One two three four",zleft+10,ztop+70);
			b.fillText("Swing",zleft+10,ztop+95);
			b.fillText("Intro",zleft+10,ztop+120);
			b.fillText("Clap start",zleft+10,ztop+145);  

			b.fillStyle="#FF8C00";
			b.fillRect(zleft+80,ztop+3*25+2,110,23);
			b.font="12px Verdana";
			b.fillText(tmidi.shuffle,zleft+195,ztop+93); 
			b.beginPath(); 
			b.strokeStyle="#000000";
			b.rect(zleft+82,ztop+3*25+2,106,21);
			b.stroke();
			b.fillStyle="#000000";
			b.fillRect(zleft+82+tmidi.shuffle,ztop+3*25+3,10,19);
		}



		//Gestisce riquadro index


		var zleft=tmidi.indexleft,ztop=tmidi.indextop;
		var zden=tmidi.metrica[tmidi.metricasel].den,znum=tmidi.metrica[tmidi.metricasel].num;

		var angolo=0;
		var tempo=context.currentTime;

		

		if ((tmidi.fsuona||tmidi.fpoststop)&&(tempo>tmidi.inizio)){
			var xinizio=tmidi.prev,xquarto=tmidi.quartonext,xperiodo=tmidi.periodonext,xquarti=tmidi.quartinext;
			if (tempo<tmidi.prev) 
			xinizio=tmidi.prev-tmidi.periodoprev/1000,xquarto=tmidi.quartoprev,xperiodo=tmidi.periodoprev,xquarti=tmidi.quartiprev;
			angolo=((tempo-xinizio)/(xperiodo/1000))
			//periodi-=Math.floor(periodi);
			//angolo=20*(2-tmidi.bpm/80)*Math.PI/180*Math.sin(periodi*Math.PI*2);
		}
		/*if ((tmidi.fsuona||tmidi.fpoststop)&&(tempo>tmidi.inizio)){
			var periodi=((tempo-tmidi.inizio)/(tmidi.periodo/1000))
			periodi=Math.floor(periodi);
			angolo=(tempo-tmidi.inizio-periodi*tmidi.periodo/1000)/(tmidi.periodo/1000)
		}*/




		b.fillStyle="#FF8C00";


		b.fillRect(zleft,ztop,480,200);  //cancella rettangolo principale



		b.fillStyle="#FFFF00";							//indice giallo
		if (tmidi.fpoststop) b.fillStyle="blue";		//blue se in poststop

		b.fillRect(zleft+480*angolo,ztop+50,10,100);  //indice giallo
		b.clearRect(zleft+480,ztop+50,10,100);		 //cancella indice se sborda

		b.fillStyle="#FF8C00";
		b.clearRect(zleft+480,ztop+50,100,100);    //cancella riquardo opzioni indice
		 
		

		if (tmidi.fnosound0) b.drawImage(tmnoaudio, zleft+490,ztop+50,50,50);  //icona abilitazione audio principale
		else  b.drawImage(tmsiaudio, zleft+490,ztop+50,50,50);


		if (tmidi.fnosound2) b.drawImage(tmnoaudio, zleft+490,ztop+100,50,50);  //icona abilitazione audio secondario
		else  b.drawImage(tmsiaudio, zleft+490,ztop+100,50,50);

		b.fillStyle="#000000";
		if (!tmidi.fnoaccent0) b.fillStyle="#ffffff";  
		b.fillRect(zleft+560,ztop+70,10,30)   //"icona"" abilitazione accento primario
		
		b.fillStyle="#000000";
		if (!tmidi.fnoaccent2) b.fillStyle="#cc0000";

		b.fillRect(zleft+560,ztop+120,10,30)  //"icona"" abilitazione accento secondario
		
		b.fillStyle="#000000";
		
		b.fillRect(zleft+490,ztop+50,100,3)		//griglia riquardo opzioni indice
		b.fillRect(zleft+490,ztop+100,100,3)
		b.fillRect(zleft+490,ztop+150,100,3)
		b.fillRect(zleft+490,ztop+50,3,100)
		b.fillRect(zleft+540,ztop+50,3,100)
		b.fillRect(zleft+590,ztop+50,3,100)


		b.fillStyle="#000000";

		for (var i=1; i<4;i++){
			b.fillRect(zleft,ztop+i*50,480,3)   //righe orizzontali
		}

		b.font="14px Verdana";
				
		if  (true){   //(tmidi.moreoptions!=0){

			ms=m2[tmidi.metricasel2]

			var znum=ms.mnum;
			for (var i=0; i<znum;i++){
				b.fillStyle="#000000";
				b.fillText(((i+1)+"/"+ms.mden),zleft+3+i*480/znum,ztop+40)    //scrive numerazione divisione principale
				b.fillStyle="#800000"
				b.fillRect(zleft+i*480/znum,ztop,1,200)						//barra suddivisione divisione principale
			}
			
			var secondario=0;
			for (var i=0; i<ms.note.length;i++){

				var nota=ms.note[i];
				var kleft=zleft+nota.t*480/ms.div;
				var livello=ms.note[i].l;


				if 	(livello==0){   //note livello principale
					b.fillStyle="#000000";
					if ((nota.t==0)&&(!tmidi.fnoaccent0)) b.fillStyle="#ffffff";  //nota principale accentata
					
					if (tmidi.fnosound0) {
						b.strokeStyle=b.fillStyle;
						b.beginPath();	
						b.rect(kleft,ztop+53,10,30);
						b.stroke();
					}
					else	b.fillRect(kleft,ztop+53,10,30);
				}
				else {
					secondario++
					b.fillStyle="#cc0000";  //nota secondaria accentata
					
					if 	((livello==2)||(tmidi.fnoaccent2)) b.fillStyle="#000000";
					if 	((livello==1)&&(!tmidi.fnoaccent2)) secondario=1;    //reinizializa numeratore secondario

					if ((livello==2)&&(tmidi.opzioni[3])&&(tmidi.metricasel2<18)) {  //swing

					kleft+=(480/ms.div)*tmidi.shuffle/100;

					}
					if (tmidi.fnosound2) {
						b.strokeStyle=b.fillStyle;
						b.beginPath();	
						b.rect(kleft,ztop+120,10,30);
						b.stroke();
					}
					
					else b.fillRect(kleft,ztop+120,10,30);
					b.fillText(secondario,kleft,ztop+172);
					
				}	



			}
	


		}
		else {

			for (var i=0; i<znum;i++){
				b.fillStyle="#000000";
				b.fillText(((i+1)+"/"+zden),zleft+3+i*480/znum,ztop+40)
				b.fillText((1+"/"+zden*2),zleft+3+i*480/znum,ztop+170)
				b.fillText((2+"/"+zden*2),zleft+3+(i+0.5)*480/znum,ztop+170)
				b.fillStyle="#800000"
				b.fillRect(zleft+i*480/znum,ztop,1,200)
				b.fillRect(zleft+(i+0.5)*480/znum,ztop+150,1,30)
			}

		}


	},

    
    impostaclick:function(ev){
    	var x  = (ev.offsetX || ev.clientX - $(ev.target).offset().left);
		var y  = (ev.offsetY || ev.clientY - $(ev.target).offset().top);
		
		if ((x>tmidi.metricaleft)&&(x<tmidi.metricaleft+480)&&(y>tmidi.metricatop)&&(y<tmidi.metricatop+240)){
			if (tmidi.moreoptions>0){
				tmidi.metricasel2=(Math.floor((x-tmidi.metricaleft)/240)+2*(Math.floor(((y-tmidi.metricatop))/80)))+18;
				tmidi.aggiustatempi();

			}
			else {
				tmidi.metricasel2=(Math.floor((x-tmidi.metricaleft)/80)+6*(Math.floor(((y-tmidi.metricatop))/80)))
				tmidi.aggiustatempi();
				
			}
		}
		if ((x>tmidi.metricaleft)&&(x<tmidi.metricaleft+480)&&(y>tmidi.metricatop+240)&&(y<tmidi.metricatop+280)){
			tmidi.moreoptions++;
			if (tmidi.moreoptions>1) tmidi.moreoptions=0;
		}
    	
    
		if (((x>tmidi.opzionileft+tmidi.opzioniwidth-80)&&(x<tmidi.opzionileft+tmidi.opzioniwidth)&&
			(y>tmidi.opzionitop)&&(y<tmidi.opzionitop+tmidi.numeroopzioni*25))) {
			var opz=Math.floor((y-tmidi.opzionitop)/25);
			var opzset = false;
			if (x>tmidi.opzionileft+tmidi.opzioniwidth-40) opzset=true;
			tmidi.opzioni[opz]=opzset;
			if ((opz==5)&&(opzset))  tmidi.setmicrofono();
			
		}

		if (((x>tmidi.indexleft+490)&&(x<tmidi.indexleft+590)&&
			(y>tmidi.indextop)&&(y<tmidi.indextop+150))) {
			if (x<tmidi.indexleft+540) {
				if(y<tmidi.indextop+100) tmidi.fnosound0=!tmidi.fnosound0;
				else tmidi.fnosound2=!tmidi.fnosound2;
			}
			else{
				if(y<tmidi.indextop+100) tmidi.fnoaccent0=!tmidi.fnoaccent0;
				else tmidi.fnoaccent2=!tmidi.fnoaccent2;
			} 
		}
		tmidi.initimposta(ctxim,canvasimposta.width,canvasimposta.height)



    },

    setmicrofono: function() {

    	tmidi.fmicrofono=true;
    	if ( typeof analyser!="undefined") return
    	if(!tmidi.opzioni[5]) return;
    	navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

		if (navigator.getUserMedia) {
   			navigator.getUserMedia (

      		// constraints
      		{video: false,audio: true},

     		 // successCallback
      		function(stream) {
         		mediaStreamSource = context.createMediaStreamSource(stream);
         		 //Do something with the audio here,

				if ( typeof analyser=="undefined") {
	         		analyser = context.createAnalyser();
					analyser.fftSize = 2048;
				}
				mediaStreamSource.connect( analyser );
				tmidi.updatepitch()
				
      		},

      		// errorCallback
      		function(err) {
         		log("The following error occured: " + err);
      		})  //if (navigator.getUserMedia)
   		
		} else { log("getUserMedia not supported")}
   

    },

    

    updatepitch: function() {
   		if(!tmidi.opzioni[5]) return;
     	
     	if ( typeof analyser=="undefined") return
   		
   		analyser.getByteFrequencyData(buf)

    	if((tmidi.fsuona||tmidi.fpoststop)) return;
    	if(!tmidi.fmicrofono) return;
   	//analyser.getFloatTimeDomainData( buf );
    	//analyser.getFloatFrequencyData( buf );

		var average=0,dat=0,max=0,posmax=0;
		for (var i=1;i<512;i++) {
			dat=Math.abs(buf[i]);
			average+=dat;
			if (dat>max){
				max=dat;
				posmax=i;
			}
			//average+=Math.abs(buf[i]);
		}
		if (average>30000) tmidi.startstop();

		if (!vediwc) return;		

    		waveCanvas.fillStyle = "green";
    		waveCanvas.fillRect(0,0,512,256);
			waveCanvas.strokeStyle = "red";
			waveCanvas.beginPath();
			waveCanvas.moveTo(0,0);
			waveCanvas.lineTo(0,256);
			waveCanvas.moveTo(128,0);
			waveCanvas.lineTo(128,256);
			waveCanvas.moveTo(256,0);
			waveCanvas.lineTo(256,256);
			waveCanvas.moveTo(384,0);
			waveCanvas.lineTo(384,256);
			waveCanvas.moveTo(512,0);
			waveCanvas.lineTo(512,256);
			waveCanvas.stroke();
			waveCanvas.strokeStyle = "black";
			waveCanvas.beginPath();
			waveCanvas.moveTo(0,buf[0]);
			for (var i=1;i<512;i++) {
				//waveCanvas.lineTo(i,128+(buf[i]*128));
				waveCanvas.lineTo(i,250-buf[i]);
			}
			waveCanvas.stroke();
			waveCanvas.font="14px Verdana";
			waveCanvas.fillStyle = "white";
			waveCanvas.fillText("posmax= "+posmax+" max= "+max+"sum= "+average/512,100,100);
			
    },

    refresh: function() {
    	
    	
		tmidi.initmetronomo(ctxmt,canvasmetronomo.width,canvasmetronomo.height);
			if ((tmidi.fsuona||tmidi.fpoststop)) tmidi.initimposta(ctxim,canvasimposta.width,canvasimposta.height,true); //solo indice

		tmidi.updatepitch();
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


		if((tmidi.fsuona||tmidi.fpoststop)||(x<150)||(x>225)) return;

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
		tmidi.fpoststop=false;  //dopo lo stop in attesa del fine battuta
		tmidi.fnoteon=false;
		tmidi.fintro=false;
		tmidi.fpreintro=false;
		tmidi.fcancellasuona=false;
		tmidi.inizio=context.currentTime;
		tmidi.prev=tmidi.inizio;
		tmidi.next=tmidi.inizio;
    	tmidi.fmicrofono=false;

		tmidi.fnosound0=false;  //disabilita i suoni principali
		tmidi.fnoaccent2=false;	//disabilita gli accenti sui suoni secondari	
		tmidi.fnosound2=false;	//disabilita suoni secondari
    	tmidi.fnoaccent0=false;  //disabilita accento suoni principali

    	tmidi.bpm=80;
		tmidi.velocitaout=120;
		tmidi.cbuffer=tmidi.Hanon1;
		tmidi.latenza=0;
		tmidi.creacontatore("contabpm",135,60,"metronomo",93,550,"4pulsanti");
		tmidi.displaypuntifast(tmidi.bpm,"contabpm");
		$('#contabpm').click(function (ev) {
			tmidi.setbpmx(ev);
		});


		tmidi.numeroopzioni=6;
		tmidi.opzioni=[]
		for (var i=0;i<tmidi.numeroopzioni;i++){
			tmidi.opzioni[i]=false;
		}
		tmidi.opzioni[0]=true;

		tmidi.initmetrica();

    },




	aggiustatempi: function(){
    	tmidi.quarto=60000/(tmidi.bpm);
    	tmidi.ottavo=60000/(tmidi.bpm*2);
    	tmidi.sedicesimo=60000/(tmidi.bpm*4);

    	if (false) {   //(tmidi.moreoptions==0){
			tmidi.intervallo=60000*4/(tmidi.bpm*tmidi.metrica[tmidi.metricasel].den); //lunghezza di un beat principale
			tmidi.periodo=tmidi.intervallo*tmidi.metrica[tmidi.metricasel].num   //lunghezza di una battuta
    	} else {
    		tmidi.intervallo=60000*4/(tmidi.bpm*tmidi.metrica2[tmidi.metricasel2].mden); //lunghezza di un beat principale
    		tmidi.periodo=tmidi.intervallo*tmidi.metrica2[tmidi.metricasel2].mnum   //lunghezza di una battuta
    	}
	},


	


	setbpmx: function(ev){

		var x  = (ev.offsetX || ev.clientX - $(ev.target).offset().left);
		var y  = (ev.offsetY || ev.clientY - $(ev.target).offset().top);
		log (ev.offsetX +" "+x)
		if (x<130){
			//form imposta bpm
			tmidi.aggiustatempi();
			return
		}
		
		if ((x<160)&&(y<20)) return tmidi.setbpm(tmidi.bpm+1);
		if ((x<160)) return tmidi.setbpm(tmidi.bpm-1);
		if ((x>160)&&(y<20)) return tmidi.setbpm(tmidi.bpm+5);
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
    	if (tmidi.fpoststop) return;  //attesa stop periodo
    	if (tmidi.fsuona) return tmidi.stopsuona();

		tmidi.mainaccent=buffers.tackbuffer;
		tmidi.mainsound=buffers.teckbuffer;
		tmidi.divaccent=buffers.tickbuffer;
		tmidi.divsound=buffers.shortbuffer;





    	
    	tmidi.fmicrofono=false;
    	tmidi.aggiustatempi();
    	tmidi.fsuona=true;
    	if (tmidi.opzioni[4]) {tmidi.fintro=true;tmidi.fpreintro=true}  //opzione intro
    	tmidi.fcancellaintro=false;
    	tmidi.fcancellasuona=false;
   	   	$("#bstart").css({"border-color":"red"});
    	$("#bstart").text("STOP");

    	tmidi.resetgrafici();
  
    	

    	
    	tmidi.inizio=context.currentTime+0.2 //+1000;  //comincerà fra 0,2 secondi
    	tmidi.prev=tmidi.inizio;
		tmidi.next=tmidi.inizio;
		tmidi.quartoprev=tmidi.quarto;
		tmidi.quartonext=tmidi.quarto;
		tmidi.periodoprev=tmidi.periodo;
		tmidi.periodonext=tmidi.periodo;
		tmidi.quartiprev=0;
		tmidi.quartinext=0;


    		log ("inizio "+tmidi.inizio+" current "+context.currentTime+" next "+tmidi.next+" now "+performance.now())
	

		setTimeout(tmidi.startnota,(tmidi.inizio-context.currentTime-0.1)*1000)  

    	
    },

        stopsuona: function(){
        if ( typeof analyser!="undefined")	analyser.getByteFrequencyData(buf)
		if (tmidi.opzioni[5]){
			setTimeout(function() {tmidi.fmicrofono=true},2000)
		}
    	tmidi.fsuona=false;
    	tmidi.fpoststop=true;
   		$("#bstart").css({"border-color":"blue"});
   		$("#bstart").text("START");


    },




preparamisura: function() {    
		var opz=tmidi.opzioni;
		var sel=tmidi.metrica2[tmidi.metricasel2];
		var est=""; // estensione file per one two three four;
		var suono="";tempo=0;
		if (sel.mden>4) est="-8"; //seleziona file breve

		var contabeats=-1;

		for (var i=0;i<sel.note.length;i++){

			tempo=tmidi.next+tmidi.periodo*(sel.note[i].t/sel.div)/1000;

			switch (sel.note[i].l){

				case 0:  //nota principale
					contabeats++;
					if ((opz[2])||((tmidi.fintro)&!(tmidi.fpreintro))) playSound(buffers[(contabeats+1)+est+"buffer"],tempo)
					if (tmidi.fnosound0) continue; //non sono abilitati i suoni principali
					suono=tmidi.mainsound;
					log (contabeats+" tempo "+tempo+" next "+tmidi.next+ " periodo "+tmidi.periodo+" current "+context.currentTime);
					if ((!tmidi.fnoaccent0)&&(sel.note[i].t==0)) suono=tmidi.mainaccent;
				break;
				
				case 1:
				if (tmidi.fnosound2) continue; 
				suono=tmidi.divaccent;
				if (!tmidi.fnoaccent2) break;         //se no accento primo beat va a suono 2

				case 2:
				if (tmidi.fnosound2) continue; 
				suono=tmidi.divsound;
				break;
				
				default:
					log("errore livello");
					return;
				break;

				
			} //switch

			if ((sel.note[i].l==2)&&(tmidi.opzioni[3])&&(tmidi.metricasel2<18)) {  //swing

				tempo+=(tmidi.periodo/sel.div/1000)*tmidi.shuffle/100;

			}

			playSound(suono,tempo);

		}//for
		

		
	},

	 
     startnota: function(){
     	if (tmidi.fpoststop) {
     		tmidi.fpoststop=false;
     		$("#bstart").css({"border-color":"#888888"}); 
     		tmidi.initimposta(ctxim,canvasimposta.width,canvasimposta.height);
     	}
     	if (!tmidi.fsuona) return;
    	tmidi.preparamisura();
    	if (tmidi.fpreintro) tmidi.fpreintro=false;
    	else tmidi.fintro=false;
    	tmidi.prev=tmidi.next
    	tmidi.next+=tmidi.periodo/1000;
    	tmidi.quartoprev=tmidi.quartonext;
		tmidi.quartonext=tmidi.quarto;
		tmidi.periodoprev=tmidi.periodonext;
		tmidi.periodonext=tmidi.periodo;
		tmidi.quartiprev=tmidi.quartinext;
		tmidi.quartinext+=(tmidi.periodo/tmidi.quarto);
		//se siamo in quarti o in mezzi allinea la prossima battuta
		if (tmidi.metrica2[tmidi.metricasel2].mden<8) tmidi.quartinext=Math.round(tmidi.quartinext); 
   		setTimeout(tmidi.startnota,(tmidi.next-context.currentTime-0.1)*1000);
    	log ("current "+context.currentTime+" next "+tmidi.next+" now "+performance.now())
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
