function log(msg) {
    if (window.console && log.enabled) {
        console.log(msg);
    } 
} // log  
log.enabled = true;

//log(location.href);
log(location.search);



Array.prototype.togli =function(elemento){
	var indice=this.indexOf(elemento);
	this.splice(indice,1);
}


//var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
//    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
//var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
//var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
//var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
//var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6


$(window).resize(function () {
	scala.offsetxx=$("#campogioco").offset().left;
	scala.offsetyy=$("#campogioco").offset().top;
});




var CUORI ="C",QUADRI="Q",FIORI="F",PICCHE="P",JOLLY="J";
var valoreseme = {"F":0,"Q":1,"C":2,"P":3,"J":4};
var semevalore =["F","Q","C","P","J"];
var RETROROSSO=0,RETROBLU=1;
var TRIS=1,SCALA=2;
var ESEGUI=true;
var NOESEGUI=false;
var PUNTI=true;
var NOPUNTI=false;
var SORTED=true;

var PUNTITRIS=100; //punti assegnati se la carta è in un tris
var PUNTIATTACCABILI=50; //punti assegnati se la carta è attaccabile
var PUNTICOPPIA=40;
var PUNTIMEZZACOPPIA=20;
var PUNTICARTEUGUALI = 30;
var PUNTIJOLLY = 200;
var JOLLYRECUPERABILE = 150;

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

function Card(suit, rank,back,indice) {                                                                                                         
    this.init(suit, rank,back,indice);
}


Card.prototype = {                                                            
    init: function (suit, rank,back,indice) {                                                                                                    
        this.shortName = suit + rank;
        this.seme = suit;
        this.numero = rank;
        this.retro=back;
        this.faceUp = false;
        this.id=indice;   //id univoco per ogni carta
        this.selected=false;
        this.ntris=0;
        this.tipotris=0;  // Può essere TRIS=1,SCALA=2;
        this.tipojolly="J";    //diventa il seme richiesto quando viene messo in un tris
        this.numerojolly=0;		//diventa il numero richiesto quando viene messo in un tris
        this.intris=0;			//fa parte di quanti tris dell'avversario?
        this.puntitris=0;
        this.puntiattacca=0;
        this.puntijollyrecuperabile=0;
        this.punticoppia=0;
        this.punteggio=0;		//assegna un valore strategico alla carta (somma degli altri punti)
    }
}

//carte: 1-13   = 1 - RE,  50=jolly rosso, 51=jolly nero

var scala = {
    


	statostack:[],
	trispossibili:[],
	jollyincampo:[],
	jollyrecuperabili:[],
	carteattaccabili:[],
	coppie:[],
	coppiecontris:[],
	jollymodificabili:[],
	

    
    start:function(){
    	this.inizializzazioni();
        this.creamazzi();
        this.shuffle();
        this.shuffle();   //provo a mescolare 2 volte
        this.createDeckElements();
        this.givecards();
        return;
    },

    inizializzazioni: function(){

		

		this.totalelimite=100;
		this.totalepartite=0;
		this.totaleavversario1=0;
		this.totaleavversario2=0;
		this.totaleavversario3=0;
		this.totalegiocatore=0;
		this.numeroavversari=1;


		//this.start();
		var stp= location.search;
		var indice,valore;
		
		indice=stp.indexOf("ta");
		if (indice>0) {
			stp=stp.slice(indice+2)
			valore=(parseInt(stp));
			if (valore!="NaN") this.totaleavversario1=valore;
		}

		indice=stp.indexOf("tb");
		if (indice>0) {
			stp=stp.slice(indice+2)
			valore=(parseInt(stp));
			if (valore!="NaN") this.totaleavversario2=valore;
		}
				indice=stp.indexOf("tc");
		if (indice>0) {
			stp=stp.slice(indice+2)
			valore=(parseInt(stp));
			if (valore!="NaN") this.totaleavversario3=valore;
		}



		indice=stp.indexOf("tg");
		if (indice>0) {
			stp=stp.slice(indice+2)
		valore=(parseInt(stp));
		if (valore!="NaN") this.totalegiocatore=valore;
		}

		indice=stp.indexOf("tl");
		if (indice>0) {
			stp=stp.slice(indice+2)
			valore=(parseInt(stp));
			if (valore!="NaN") this.totalelimite=valore;
		}

		indice=stp.indexOf("tp");
		if (indice>0) {
			stp=stp.slice(indice+2)
			valore=(parseInt(stp));
			if (valore!="NaN") this.totalepartite=valore;
		}

		indice=stp.indexOf("na");
		if (indice>0) {
			stp=stp.slice(indice+2)
			valore=(parseInt(stp));
			if ((valore>0)&&(valore<4)) this.numeroavversari=valore;
		}


		this.fscalauptouch=false;
		this.fmodale=false;
		this.turno=-1;						//turno del giocatore
		
    	this.cartescoperte=false;				//avversario e mazzo a carte scoperte
		this.duejolly=true;					//si possono mettere due jolly in un tris
		this.fscartiprima40=true;

    	this.carteselezionate=[];
    	this.trisdata = {
    		jollycontenuti:[],
    		tipotris:0,
			semidausare:[],
			semescala:0,
			primonumero:0,				//primo numero scala o numero del tris
    	};
		this.f40avversario=[false,false,false];		//l'avversario' ha già ottenuto 40
		this.f40giocatore=false;		//il giocatore ha già ottenuto 40
		this.fscartipesca=false;		//pescato dagli scarti
		this.modale=false;

		this.altezzacampo=600/(2+this.numeroavversari*2);

		for (var i=1;i<=this.numeroavversari;i++){
			this.creacampo("avversario"+i,2*i-2,true);
			this.creacampo("trisavversario"+i,2*i-1);
		}
		this.creacampo("trisgiocatore",2*this.numeroavversari);
		this.creacampo("giocatore",2*this.numeroavversari+1,true);
    	
    	//opzioni
		this.offsetxx=$("#campogioco").offset().left;
		this.offsetyy=$("#campogioco").offset().top;

		//crea totalizzarore


		var yg=115,ya1=50,ya2=110,ya3=110,ylim=182,wbig=90,hbig=40,xbig=40;
		if (this.numeroavversari==2){yg=130,ya1=40,ya2=76,ya3=110,ylim=182,wbig=83,hbig=35,xbig=45;}
		if (this.numeroavversari==3){yg=145,ya1=30,ya2=66,ya3=102,ylim=192,wbig=83,hbig=35,xbig=45;

			$("#totalizzatore").append('<div style="position:absolute; top: '+(ya3+3)+'px; left: 2px;">'+
			'<img src="images/scala40/totalea3.png" height="35" width="35">' );
			
			this.creacontatore("totaleavversario3",wbig,hbig,"totalizzatore",xbig,ya3);

		}

		if (this.numeroavversari>1){

			$("#totalizzatore").append('<div style="position:absolute; top: '+(ya2+3)+'px; left: 2px;">'+
			'<img src="images/scala40/totalea2.png" height="35" width="35">' );
			
			this.creacontatore("totaleavversario2",wbig,hbig,"totalizzatore",xbig,ya2);
		}
		


		$("#totalizzatore").append('<div style="position:absolute; top: '+(ya1+3)+'px; left: 2px;">'+
		'<img src="images/scala40/totalea1.png" height="35" width="35">' );

		$("#totalizzatore").append('<div style="position:absolute; top: '+yg+'px; left: -2px;">'+
		'<img src="images/scala40/totaleg.png" height="40" width="40">' );

		$("#totalizzatore").append('<div style="position:absolute; top: '+(ylim-5)+'px; left: -2px;">'+
		'<img src="images/scala40/totalelim.png" height="40" width="78">' );


		$("#totalizzatore").append('<div style="position:absolute; top: 215px; left: -4px;">'+
		'<img src="images/scala40/totalepartite.png" height="40" width="80">' );

		this.creacontatore("totaleavversario1",wbig,hbig,"totalizzatore",xbig,ya1);
		this.creacontatore("totalegiocatore",wbig,hbig,"totalizzatore",xbig,yg);
		this.creacontatore("totalelimite",60,25,"totalizzatore",67,ylim);
		this.creacontatore("totalepartite",60,25,"totalizzatore",67,225); 
		

/*	   	   <div id="totaleavversario1" style="top: 50px; left: 35px;" class="contatore">    <img src="images/scala40/vassoiod.png" height="40" width="90"> 
	   			<div id="digit3" class="digit1" style="top: 1px; left: 3px; background-position: -0px 0px; "  > </div>
	   			<div id="digit2" class="digit1" style="top: 1px; left: 31px; background-position: -0px 0px;"  > </div>
	   			<div id="digit1" class="digit1" style="top: 1px; left: 59px; background-position: -0px 0px;"  > </div>
	   	   </div>  <!--totaleavversario-->
	   <div id="totalegiocatore" style="top: 110px; left: 35px;" class="contatore">    <img src="images/scala40/vassoiod.png" height="40" width="90"> 
	   			<div id="digit3" class="digit1" style="top: 1px; left: 3px; background-position: -0px 0px; "  > </div>
	   			<div id="digit2" class="digit1" style="top: 1px; left: 31px; background-position: -0px 0px;"  > </div>
	   			<div id="digit1" class="digit1" style="top: 1px; left: 59px; background-position: -0px 0px;"  > </div>
	   	   </div>  <!--totalegiocatore-->
	   <div id="totalelimite" style="top: 170px; left: 72px;" class="contatore">    <img src="images/scala40/vassoiod.png" height="25" width="54"> 
	   			<div id="digit3" class="digit2" style="top: 1px; left: 3px; background-position: -0px 0px; "  > </div>
	   			<div id="digit2" class="digit2" style="top: 1px; left: 20px; background-position: -0px 0px;"  > </div>
	   			<div id="digit1" class="digit2" style="top: 1px; left: 37px; background-position: -0px 0px;"  > </div>
	   	   </div>  <!--totalelimite-->
	   <div id="totalepartite" style="top: 215px; left: 72px;" class="contatore">    <img src="images/scala40/vassoiod.png" height="25" width="54"> 
	   			<div id="digit3" class="digit2" style="top: 1px; left: 3px; background-position: -0px 0px; "  > </div>
	   			<div id="digit2" class="digit2" style="top: 1px; left: 20px; background-position: -0px 0px;"  > </div>
	   			<div id="digit1" class="digit2" style="top: 1px; left: 37px; background-position: -0px 0px;"  > </div>
	   	   </div>  <!--totalepartite-->  */


		
    },
    

    creacontatore:function (nome,larghezza,altezza,contenitore,posx,posy) {

		var wdigit=Math.floor(larghezza*0.9/3),hdigit=Math.floor(altezza*9/10);
		var offsetx=Math.round(1+larghezza/50);
		var offsety=Math.round(1+altezza/50);

		$("#"+contenitore).append('<div id="'+nome +'" style="top: '+posy+'px; left: '+posx+'px;" class="contatore">'+
		'<img src="images/scala40/vassoiod.png" height="'+altezza+'px" width="'+larghezza+'px">'
		
		+'<div id="digit3" class="digitx" style="top: '+offsety+'px; left: '+offsetx+'px; width:'+wdigit+'px; height:'+hdigit+'px;'+
		'	background-size: '+wdigit+'px '+(hdigit*10)+'px; background-position: -0px 0px; "  > </div>'
		+'<div id="digit2" class="digitx" style="top: '+offsety+'px; left: '+Math.floor(offsetx+larghezza/3.2)+'px; width:'+wdigit+'px; height:'+hdigit+'px;'+
		'	background-size: '+wdigit+'px '+(hdigit*10)+'px; background-position: -0px 0px; "  > </div>'
		+'<div id="digit1" class="digitx" style="top: '+offsety+'px; left: '+Math.floor(offsetx+larghezza/3.2*2)+'px; width:'+wdigit+'px; height:'+hdigit+'px;'+
		'	background-size: '+wdigit+'px '+(hdigit*10)+'px; background-position: -0px 0px; "  > </div> </div>'

		)

    },

    creacampo:function (nome,posizione,parnomecampo) {

/*
		var nomecampo="";
		if (parnomecampo) nomecampo=nome;
		$("#campogioco").append('<div id="'+
		nome+'" class="campo" style="top:'+
		(100+this.altezzacampo*(posizione))+'px; left: 12px; width:854px;height:'+
		this.altezzacampo+'px;">'+
		'<div id="punti'+
		nome+'" style="top: 2px; left: 725px;" class="contatore">  <img src="images/scala40/vassoiod.png" height="50" width="130">'+
		'<div id="digit3" class="digit" style="top: 2px; left: 5px;" background-position: -0px;"  > </div>'+
		'<div id="digit2" class="digit" style="top: 2px; left: 45px; background-position: -0px;"  > </div>'+
		'<div id="digit1" class="digit" style="top: 2px; left: 85px; background-position: -0px;"  > </div> </div></div>'
		); 
*/
		$("#campogioco").append('<div id="'+
		nome+'" class="campo" style="top:'+
		(100+this.altezzacampo*(posizione))+'px; left: 12px; width:854px;height:'+
		this.altezzacampo+'px;">' );

		this.creacontatore ("punti"+nome,100,40,nome,754,2);  //130 50

		if (parnomecampo) $("#campogioco").append('<div id="et'+nome+'" class="etichetta" style="top:'+
		(60+this.altezzacampo*(posizione+0.5))+'px; left: 350px; height:50px;">&nbsp'+
		nome+'</div>')

    },


    creamazzi: function () {
        
        this.stock=[];

        var offy=25,moffx=25,moffy=22;
        if (this.numeroavversari>1) offy=4;
        if (this.numeroavversari>2) {moffx=35,moffy=35};
        
        this.mazzo={carte:[], top:parseInt($("#mazzo").css("top")), 
                    left:parseInt($("#mazzo").css("left")),offsetx:moffx,offsety:moffy,deltax:0.1,deltay:0.1,xtris:0};
        this.scarti={carte:[], top:parseInt($("#scarti").css("top")), 
                    left:parseInt($("#scarti").css("left")),offsetx:moffx,offsety:moffy,deltax:0.1,deltay:0.1,xtris:0};
        this.giocatore={carte:[], top:parseInt($("#giocatore").css("top")), 
                    left:parseInt($("#giocatore").css("left")),offsetx:25,offsety:offy,deltax:20,deltay:0,xtris:80};
        this.trisgiocatore={carte:[], top:parseInt($("#trisgiocatore").css("top")), 
                    left:parseInt($("#trisgiocatore").css("left")),offsetx:25,offsety:offy,deltax:20,deltay:0,xtris:80};
        this.avversario1={carte:[], top:parseInt($("#avversario1").css("top")), 
                    left:parseInt($("#avversario1").css("left")),offsetx:25,offsety:offy,deltax:20,deltay:0,xtris:0};
        this.trisavversario1={carte:[], top:parseInt($("#trisavversario1").css("top")), 
                    left:parseInt($("#trisavversario1").css("left")),offsetx:25,offsety:offy,deltax:20,deltay:0,xtris:80};
        this.avversario2={carte:[], top:parseInt($("#avversario2").css("top")), 
                    left:parseInt($("#avversario2").css("left")),offsetx:25,offsety:offy,deltax:20,deltay:0,xtris:0};
        this.trisavversario2={carte:[], top:parseInt($("#trisavversario2").css("top")), 
                    left:parseInt($("#trisavversario2").css("left")),offsetx:25,offsety:offy,deltax:20,deltay:0,xtris:80};
        this.avversario3={carte:[], top:parseInt($("#avversario3").css("top")), 
                    left:parseInt($("#avversario3").css("left")),offsetx:25,offsety:offy,deltax:20,deltay:0,xtris:0};
        this.trisavversario3={carte:[], top:parseInt($("#trisavversario3").css("top")), 
                    left:parseInt($("#trisavversario3").css("left")),offsetx:25,offsety:offy,deltax:20,deltay:0,xtris:80};

        this.campiavversario=[this.avversario1,this.avversario2,this.avversario3];
        this.campitrisavversario=[this.trisavversario1,this.trisavversario2,this.trisavversario3];
       
        var indice=0;
        for (var retro = 0; retro < 2; retro++) {     //il retro può essere ROSSO (0) o BLU (1)
            for (var i = 1; i <= 13; i++) {
                this.stock[indice]=(new Card(CUORI, i,retro,indice++));
                this.stock[indice]=(new Card(QUADRI, i,retro,indice++));
                this.stock[indice]=(new Card(FIORI, i,retro,indice++));
                this.stock[indice]=(new Card(PICCHE, i,retro,indice++));
            }
            this.stock[indice]=(new Card(JOLLY, 50,retro,indice++));   //Jolly rosso
            this.stock[indice]=(new Card(JOLLY, 51,retro,indice++));    //jolly nero
        }
        for (i=0;i<108;i++){
        	this.mazzo.carte[i]=this.stock[i];
        }

        
    },
    
    shuffle: function () {
        var i = 108;
        while (--i) {
            var j = Math.floor(Math.random() * (i + 1));
            var tempi = this.mazzo.carte[i];
            var tempj = this.mazzo.carte[j];
            this.mazzo.carte[i] = tempj;
            this.mazzo.carte[j] = tempi;
        }
    },
    
    createDeckElements: function () {
        for (var i = 0; i < 108; i++) {
            var card = this.mazzo.carte[i];
            card.left=this.mazzo.left+this.mazzo.offsetx+Math.floor(i*this.mazzo.deltax);
            card.top=this.mazzo.top+this.mazzo.offsety+Math.floor(i*this.mazzo.deltay);
            var newDivCard=$('<div>') .addClass('card') .css({"top": card.top, "left": card.left,
                           "z-index":i, "background-position-x": -994, "background-position-y":-96*card.retro});
            $('#campogioco').append(newDivCard[0]);
            newDivCard[0].card=card;
            card.gruppo=this.mazzo;
            card.gui = newDivCard[0];
        }
    },
    

	    givecards:function(){


        this.muovicarta(this.mazzo,this.scarti,"faceUp");
        this.render();

		distribuisci.play();
        for (var i=0;i<13;i++){
			window.setTimeout(function(){
				scala.muovicarta(scala.mazzo,scala.giocatore,"faceUp");
				scala.rendicontenitore(scala.giocatore,180);
			},i*400);
			window.setTimeout(function(){
				for (var j=0;j<scala.numeroavversari;j++){
					scala.muovicarta(scala.mazzo,scala.campiavversario[j],"faceDown");
					scala.rendicontenitore(scala.campiavversario[j],180);
				}
			},i*400+200);

            
        }

		
		window.setTimeout(function(){
			scala.ordinacarte(scala.giocatore);

			for (var j=0;j<scala.numeroavversari;j++){
				scala.ordinacarte(scala.campiavversario[j]);
			}
			scala.render();
			ordina.play();
			},5500);
        
        this.pescato=false;
        this.carteselezionate=[];
    },


    
    
    ordinacarte:function(gruppo){
   		gruppo.carte.sort(function (a, b) {
            if (a.numero > b.numero) return 1;
            if (a.numero < b.numero) return -1;
            if (a.seme > b.seme) return 1;
            if (a.seme < b.seme) return -1;
			if (a.id > b.id) return 1;
            if (a.id < b.id) return -1;
            
        	return 0;    // a must be equal to b
   		});

    },

    ordinascale:function(gruppo){
     	gruppo.carte.sort(function (a, b) {
            if (a.seme > b.seme) return 1;
            if (a.seme < b.seme) return -1;
            if (a.numero > b.numero) return 1;
            if (a.numero < b.numero) return -1;
            if (a.id > b.id) return -1;    //ordina le carte uguali con ID al contrario (per eventualmente usare diverse per tris e scale)
            if (a.id < b.id) return 1;

            return 0;    // a must be equal to b
       });
	},

     //ordina coppie per valori decrescenti
     ordinacoppie:function(gruppo){
     	gruppo.sort(function (a, b) {
            if (a.punticonjolly < b.punticonjolly) return 1;
            if (a.punticonjolly > b.punticonjolly) return -1;
            return 0;    // a must be equal to b
       });
	},

    //ordina tris per punteggi decrescenti
     ordinatris:function(gruppo){
     	gruppo.sort(function (a, b) {
     		var primo=scala.calcolapuntitris(a);
     		var secondo=scala.calcolapuntitris(b);
            if (primo < secondo) return 1;
            if (primo > secondo) return -1;
            return 0;    // a must be equal to b
       });
	},


    collegaeventi:function(){
        
        this.scaladown=false;
        this.scalamove=false;
        

        $(".card").bind("contextmenu", function(ev) {
	
			ev.preventDefault();
			if (!scala.fmodale) return  scala.cartadestro(this,ev);
	   });

	   $(document).bind("contextmenu", function(ev) {
	
			ev.preventDefault();

	   });



       $(".card").bind("touchstart", function(ev) {
           
            ev.preventDefault();
            if ((!scala.fmodale)) return  scala.scalamousedown(this,ev.originalEvent.touches[0] || ev.originalEvent.changedTouches[0]);
        });  
		


       $(".card").bind("mousedown", function(ev) {
           
            
            if ((ev.button==0)&& (!scala.fmodale)) return  scala.scalamousedown(this,ev);
        });  


       $(document).bind("touchend", function(ev) {
           
            //ev.preventDefault();
            scala.fscalauptouch=true;
            if ((!scala.fmodale)) return  scala.scalamouseup(ev.originalEvent.touches[0] || ev.originalEvent.changedTouches[0]);
        });  
		



        $(document).bind("mouseup", function(ev) {
            //log("up"); 
            
            if (scala.fscalauptouch) {scala.fscalauptouch=false;return}
            if ((ev.button==0)&& (!scala.fmodale)) return  scala.scalamouseup(ev);
        });
        
        
        $(document).bind("touchmove", function(ev) {
            //log("move"); 
           
            //ev.preventDefault();
            if ((scala.scaladown)&& (!scala.fmodale)) return  scala.scalamousemove(ev.originalEvent.touches[0] || ev.originalEvent.changedTouches[0]);
        });
 


		/* document.addEventListener( "touchmove", function(ev){
			if ((scala.scaladown)&& (!scala.fmodale)) return scala.scalamousemove(ev)
		}); */

        $(document).bind("mousemove", function(ev) {
            //log("move"); 
           
            
            if ((ev.button==0)&&(scala.scaladown)&& (!scala.fmodale)) return  scala.scalamousemove(ev);
        });
        
 

 

        
        $("#pulsante2").bind("click", function(ev) {
            return  scala.multiundo();
        });
        $("#scoperte").bind("click", function(ev) {
            return  scala.scoperte();
        });

        $("#totalelimite").bind("click", function(ev) {
            return  scala.totalelim();
        });

		$('#istruzioni').click(function () {
            scala.istruzioni();
        });
          $('#nuovo').click(function () {
            scala.nuovo2();
        });
          $('#azzeratotale').click(function () {
            scala.azzeratotale();
        });

        $('.bottone1').click(function () {
            scala.funzbottone1();
        });
        $('.bottone2').click(function () {
            scala.funzbottone2();
        });



		scala.funzbottone1=(function(){});
		scala.funzbottone2=(function(){});
		

        return
    },
    
    pushstato:function(){
    	var stato ={};
    	stato.stock=[];
    	var copiastock = (function (da,a){
    		for (var i=0;i<da.length;i++) {
    			a[i]=(new Card(0, 0,0,0));
    			for (var member in da[i]) {a[i][member]=da[i][member]};  
    		}
    	})(scala.stock,stato.stock);
    	
		var copia = function (da,a){
   			a.splice(0,a.length);
    		for (var i=0;i<da.length;i++) {
    			a[i]=da[i];
    		}
    	};
    
    	stato.giocatore=[]; copia (scala.giocatore.carte,stato.giocatore);
    	stato.avversario1=[]; copia (scala.avversario1.carte,stato.avversario1);
    	stato.avversario2=[]; copia (scala.avversario2.carte,stato.avversario2);
    	stato.avversario3=[]; copia (scala.avversario3.carte,stato.avversario3);
    	stato.trisgiocatore=[]; copia (scala.trisgiocatore.carte,stato.trisgiocatore);
    	stato.trisavversario1=[]; copia (scala.trisavversario1.carte,stato.trisavversario1);
    	stato.trisavversario2=[]; copia (scala.trisavversario2.carte,stato.trisavversario2);
    	stato.trisavversario3=[]; copia (scala.trisavversario3.carte,stato.trisavversario3);
    	stato.mazzo=[]; copia (scala.mazzo.carte,stato.mazzo);
    	stato.scarti=[]; copia (scala.scarti.carte,stato.scarti);
	  	stato.pescato=scala.pescato;
	  	stato.f40giocatore=scala.f40giocatore;
	  	stato.f40avversario=[]; copia (scala.f40avversario,stato.f40avversario);
    	this.statostack.push(stato);
    	$("#pulsante2").css({"border-color":"yellow"});
    	$("#pulsante2").text("UNDO (" + this.statostack.length+")");
    },

    popstato:function(lasciacopia){
    	var miacopia=lasciacopia||false;
    	if (this.statostack.length==0) return;

    	if (miacopia) var stato =this.statostack[this.statostack.length-1];
    	else var stato =this.statostack.pop();


   		var copia = function (a,da){
  			a.splice(0,a.length);
    		for (var i=0;i<da.length;i++) {
    			a[i]=da[i];
    		}
     	};
    	copia(scala.giocatore.carte,stato.giocatore);
    	copia(scala.avversario1.carte,stato.avversario1);
    	copia(scala.avversario2.carte,stato.avversario2);
    	copia(scala.avversario3.carte,stato.avversario3);
    	copia(scala.trisgiocatore.carte,stato.trisgiocatore);
    	copia(scala.trisavversario1.carte,stato.trisavversario1);
    	copia(scala.trisavversario2.carte,stato.trisavversario2);
    	copia(scala.trisavversario3.carte,stato.trisavversario3);
    	copia(scala.mazzo.carte,stato.mazzo);
    	copia(scala.scarti.carte,stato.scarti);
    	scala.carteselezionate.splice(0,scala.carteselezionate.length);
    	scala.pescato=stato.pescato;
	  	copia(scala.f40avversario,stato.f40avversario);
	  	scala.f40giocatore=stato.f40giocatore;

    	$(".card").removeClass("cardselected");

   		var copiastock = (function (a,da){
    		for (var i=0;i<da.length;i++) {
    			for (var member in da[i]) {a[i][member]=da[i][member]; a[i].selected=false};  
    		}
    	})(scala.stock,stato.stock);


    	
    	if (this.statostack.length==0) $("#pulsante2").css({"border-color":"#888888"});
    	$("#pulsante2").text("UNDO (" + this.statostack.length+")");
    },
	

    scalamousedown:function(divCard,ev){
        
        this.cartadown=divCard;

        for (var i=0;i<scala.jollymodificabili.length;i++){
        	var carta=scala.jollymodificabili[i];
        	if (divCard.card.id==carta.id) {
        		var ntris=carta.ntris;
        		var incrementaseme=(function(){
        			var vseme=valoreseme[carta.tipojolly];
        			vseme++;
        			if (vseme==4) vseme=0;
        			carta.tipojolly=semevalore[vseme];
        		});
        		incrementaseme();
        		var cartat;
        		for (j=0;j<this.trisgiocatore.carte.length;j++){
        			cartat=this.trisgiocatore.carte[j];
        			if ((cartat.ntris==ntris)&&(cartat.id!=carta.id)&&
        			(((cartat.numero<50)&&(cartat.seme==carta.tipojolly))||
        			((cartat.numero>49)&&(cartat.tipojolly==carta.tipojolly)))) {
        				incrementaseme(); j=-1;
        			}
        		}
        		this.render();
        		return;
        	}
        }

        if (!this.pointerinelement(ev,"#giocatore")) return;
        
        this.scaladown=true;
        this.scalamove=false;
        this.scaladownx=ev.pageX-scala.offsetxx;
        this.scaladowny=ev.pageY-scala.offsetyy;
        
        return;
    },
    
    scalamousemove:function(ev){
        
        var deltax=ev.pageX-scala.offsetxx-this.scaladownx;
        var deltay=ev.pageY-scala.offsetyy-this.scaladowny;
        if (!this.scalamove) { if((Math.abs(deltax)<5)&& (Math.abs(deltay)<5)) return;}

        var divCard=this.cartadown;
        $(divCard).css({"z-index":1000});
        $(this.cartadown).css({"top":this.cartadown.card.top+deltay,"left":this.cartadown.card.left+deltax})
        this.scalamove=true;
        if ((this.pointerinelement(ev,"#trisgiocatore"))&&(this.pescato)&&(this.trisgiocatore.carte.length>0)) {
        	this.tgon();
        	this.cercamatch(this.trisgiocatore,NOESEGUI);
        }
        else this.tgoff();

        for (var j=0;j<scala.numeroavversari;j++) {
			if ((this.pointerinelement(ev,("#trisavversario"+(j+1))))&&(this.pescato)&&(this.campitrisavversario[j].carte.length>0)) {
				 this.taon(j);
				 this.cercamatch(this.campitrisavversario[j],NOESEGUI);
			}
			else this.taoff(j);
        }
 
        return;
    },
    
    scalamouseup:function(ev){
        

		

        if (!scala.scaladown){
            if  (this.pointerinelement(ev,"#mazzo")&&(!this.pescato)) return this.cartapesca();
            if  (this.pointerinelement(ev,"#giocatore")&&(!this.pescato)) return this.cartapesca();
            if  (this.pointerinelement(ev,"#scarti")) return this.scartipesca();
            if  (this.pointerinelement(ev,"#trisgiocatore")&&(this.pescato)) return this.scartatrisgiocatore();
            return;
        }
        this.scaladown=false;

        var divCard=this.cartadown;
        var carta=divCard.card;
        
        
        if ((!scala.scalamove)&&(this.pescato)) {this.selezionacartagiocatore(divCard); return;}
        
        
        
        
        var newindex=0;
        var currentindex=(carta.left-(this.giocatore.left+this.giocatore.offsetx))/this.giocatore.deltax; //dove era la carta prima di muoverla
        
        if (this.pointerinelement(ev,"#giocatore")&&(carta.left>0)&&(this.scalamove)) {
            var currentleft=parseInt($(divCard).css("left"));
            if (currentleft>(this.giocatore.left+this.giocatore.offsetx)){
                newindex=Math.floor((currentleft-(this.giocatore.left+this.giocatore.offsetx))/this.giocatore.deltax)+1;
                if (newindex>(this.giocatore.carte.length)) newindex=this.giocatore.carte.length;
            }
             if (currentindex!=newindex ) {
                this.giocatore.carte.splice(newindex,0,carta);
                if(newindex<currentindex) currentindex++;
                this.giocatore.carte.splice(currentindex,1);
                ordina.play();
            }
        }
        else {
            if (this.pointerinelement(ev,"#scarti")&&(this.pescato)) return this.scarta(carta);
           	if ((this.pointerinelement(ev,"#trisgiocatore"))
           	&&(this.pescato)
           	&&(this.trisgiocatore.carte.length>0)
           	&&(this.giocatore.carte.length!=1)) {
        		this.tgon();
        		this.cercamatch(this.trisgiocatore,ESEGUI);
			}
			else this.tgoff();
			
			for (j=0;j<scala.numeroavversari;j++){

				if ((this.pointerinelement(ev,("#trisavversario"+(j+1))))
				&&(this.pescato)
				&&(this.campitrisavversario[j].carte.length>0)
				&&(this.giocatore.carte.length!=1)
				&&(this.calcolapuntitris(this.trisgiocatore.carte)>39)) {
					this.taon(j);
					this.cercamatch(this.campitrisavversario[j],ESEGUI);
				}
				this.taoff(j);
				$(".card").removeClass("cardselected");
			}
		}

        this.scalamove=false;
        this.render();
        return;
    },
    
    
	cercamatch:function(cont,esegui)  {                 //cont è il contenitore in cui cercare
		var SINISTRA=true;
		var DESTRA = false;
		var ncarte=cont.carte.length;
		for (var i=0;i<ncarte;i++) $(cont.carte[i].gui).removeClass("cardselected");
		var cartaleft=parseInt($(this.cartadown).css("left"));				//la carta che sto spostando

		//lavoro con il bordo sinistro della carta.
		//se è più a sinistra della prima carta vede se può andare prima della prima, 
		//altrimenti sceglie di mattersi a destra dalla prima che si trova a sinistra.
		//misura la distanza, e se è molto maggiore del deltax del contenitore 
		//allora si mette a sinistra della carta successiva (se esiste)

		
		
		for (var i=0;i<ncarte;i++) {
			if(cont.carte[i].left>cartaleft) break;
		} //trova prima carta successiva
		if (i==0) return this.checkcarta(cont,0,SINISTRA,esegui);				//era prima della prima
		if (i==ncarte) return this.checkcarta(cont,ncarte-1,DESTRA,esegui);    //era oltre l'ultima
		if ((cartaleft-cont.carte[i-1].left)>(2*cont.deltax)) return this.checkcarta(cont,i,SINISTRA,esegui);
		else return this.checkcarta(cont,i-1,DESTRA,esegui);	
		
	},

	checkcarta: function(cont,indice,left,esegui){
		

		var carta=this.cartadown.card;
		var cartasel=cont.carte[indice];
		var tipotris=cartasel.tipotris;
		var ntris=cartasel.ntris;
		var tris=[];
		var indicetris=0;  //posizione carta selezionata nel tris
		
		
		for (var i=0;i<cont.carte.length;i++){  //estrae il tris
			if (cont.carte[i].ntris==ntris){
				if (i==indice) indicetris=tris.length;  //posizione carta selezionata nel tris
				tris.push(cont.carte[i]);
			}
		}


		if((cartasel.numero>49)&&(carta.numero<49)){      //sto cercando di rimpiazzare un jolly?
			var salvacarta=tris[indicetris];
			if (tipotris==SCALA) {   //provo a rimpiazzare il jolly con la mia carta
				tris[indicetris]=carta;
				if (this.checktris(tris,SORTED)) this.scambiacarte(carta,cartasel,esegui);				
				else { //prova anche ad attaccare la carta prima o dopo il Jolly
					tris[indicetris]=salvacarta;
					if (indicetris==0){ //prova ad attaccare a sinistra
						tris.splice(0,0,carta);
						if (this.checktris(tris,SORTED)) this.aggiungitris(cont,indice,carta,cartasel,esegui);
					}
					else {  //prova ad attaccare a destra
						
						if (indicetris==tris.length-1){ //prova ad attaccare a sinistra
						tris.splice(tris.length,0,carta);
						if (this.checktris(tris,SORTED)) this.aggiungitris(cont,indice+1,carta,cartasel,esegui);
						}
					}

				}
				return;
			}
			else{    //tipotris è uguale a TRIS
				if ((carta.seme==tris[indicetris].tipojolly)&&
					(carta.numero==tris[indicetris].numerojolly)) {  //se la mia carta non è un jolly
					//a questo punto so gia che va bene, 
					//ma faccio il checktris che mi produce trisdata che mi serve in scambiacarte
					
					//tris[indicetris]=carta; //provo a rimpiazzare il jolly con la mia carta
					//if (this.checktris(tris,SORTED)) 
					{this.scambiacarte(carta,cartasel,esegui);return}
				}
			}

		}   //non sto cercando di rimpiazzare un Jolly


		if (left) {
			tris.splice(indicetris,0,carta);
			if (this.checktris(tris,SORTED)) this.aggiungitris(cont,indice,carta,cartasel,esegui);   
		}
		else {
			tris.splice(indicetris+1,0,carta);
			if (this.checktris(tris,SORTED)) this.aggiungitris(cont,indice+1,carta,cartasel,esegui);
		}    
		return;
		
		
	},
	
	
	//seleziona cartasel
	//se (esegui) scambia le due carte  
	//usata per rimpiazzare un jolly in un tris          
	scambiacarte:function(carta,cartasel,esegui){
		$(cartasel.gui).addClass("cardselected");
		if (esegui) {
			var contenitore1=carta.gruppo;
			var posizione1=contenitore1.carte.indexOf(carta);
			var contenitore2=cartasel.gruppo;
			var posizione2=contenitore2.carte.indexOf(cartasel);
			var temp=carta.tipotris;
			carta.tipotris=cartasel.tipotris;
			cartasel.tipotris=temp;
			temp=carta.faceUp;
			carta.faceUp=cartasel.faceUp;
			cartasel.faceUp=temp;
			carta.gruppo=contenitore2;
			temp=carta.ntris;
			carta.ntris=cartasel.ntris;
			cartasel.ntris=temp;
			cartasel.gruppo=contenitore1;
			contenitore1.carte[posizione1]=cartasel;
			contenitore2.carte[posizione2]=carta;
			cartasel.tipojolly="J";
			this.render();
			$(cartasel.gui).removeClass("cardselected");
			perjolly.play();
		}
	},

	//seleziona cartasel
	////se (esegui) aggiunge carta a un tris esistente nel contenitore cont alla posizione indice
	// e la toglie dal suo contenitore
	aggiungitris: function(cont,indice,carta,cartasel,esegui){
		$(cartasel.gui).addClass("cardselected");
		if (esegui) {
			slitta.play();
			this.pushstato();
			this.rimuovicarta(carta);
			carta.gruppo=cont;
			carta.ntris=cartasel.ntris;
			carta.tipotris=cartasel.tipotris;
			if (carta.numero>49)  { //era un Jolly?
				if(carta.tipotris==SCALA){
					carta.tipojolly=scala.trisdata.semescala;
					//cerca la prima carta del tris
					for (var i=0;i<cont.carte.length;i++) {if (cont.carte[i].ntris==cartasel.ntris) break;}
					carta.numerojolly=scala.trisdata.primonumero+indice-i;
				}
				else{
					//toglie da semidausare quelli eventualmente già usati dai jolly preesistenti
					for (var i=0;i<cont.carte.length;i++) {
						if ((cont.carte[i].ntris==carta.ntris)&&(cont.carte[i].numero>49)) {
							scala.trisdata.semidausare.togli(cont.carte[i].tipojolly);
						}
					}
					carta.tipojolly=scala.trisdata.semidausare.pop();
					carta.numerojolly=scala.trisdata.primonumero;
					// scala.jollymodificabili.push(carta); non serve, se aggiungo a un tris sono già 4 carte
				}
			}
			carta.faceUp=true;
			cont.carte.splice(indice,0,carta);
			this.render();
			$(cartasel.gui).removeClass("cardselected");

		}
	},





	rimuovicarta:function(carta){
		var cont=carta.gruppo.carte;
		var posizione=cont.indexOf(carta);
        cont.splice(posizione,1);
 
	},


	myalert:function(messaggio){
		$("#testoallerta").text(messaggio);
		ding.play();
		scala.mydialog("allerta");
	},


	mydialog:function(form,button1,button2){
		scala.formtohide=("#"+form)
		scala.mostradialogo(scala.formtohide);
		scala.funzbottone1=(button1)||(this.hidedialog);
		scala.funzbottone2=(button2)||(this.hidedialog);

	},

	hidedialog :function(){
		$(scala.formtohide).hide();
		$("#schermo").hide();
		this.fmodale=false;

	},

    scarta: function(carta){

		var annulla40=(function(){
			while (scala.trisgiocatore.carte.length>0)
			{scala.undo()};
			while ((scala.fscartipesca)&&(scala.pescato))
			{scala.undo()};
			this.hidedialog();
		})

		scala.jollymodificabili=[];
    	var punti=this.calcolapuntitris(this.trisgiocatore.carte);
    	if ((!this.f40giocatore)&&((punti>0)||(this.fscartipesca))&&(punti<40)){
    		ding.play();
    		this.mydialog("oltre40",annulla40);
	   		return;
    	}



    	
		
		if (punti>39) this.f40giocatore=true;
		$(".card").removeClass("cardselected");
		scarta.play();


	   	for (i=0; i<this.carteselezionate.length;i++) {      //cancella selezioni
			this.carteselezionate[i].selected=false;
			$(this.carteselezionate[i].gui).removeClass("cardselected");
		}
		this.carteselezionate=[];
		this.pushstato();
		this.muovicarta(carta,this.scarti,"faceUp");
		this.pescato=false;


		if (this.giocatore.carte.length==0){
			this.cartescoperte=true;

			this.totalepartite++;


       		var vintotorneo=this.calcolatotali();


			if (vintotorneo){
				window.setTimeout(function(){applause.play();scala.mydialog("haivintotorneo",function(){scala.azzeratotale();scala.nuovo()},scala.nuovo);},1000);
			} 
			else {
				window.setTimeout(function(){tada.play();scala.mydialog("haivinto",scala.nuovo)},1000);
 				
       		}


		}
		else {
			window.setTimeout(function(){scala.mossaavversario(0)},1000);   
		}
		this.render();

    },
   
	mostradialogo:function(dialogo){
			$(dialogo).show();
			var larghezza=$("body").css("width");
			$("#schermo").css({"width":larghezza});
			$("#schermo").show();
			this.fmodale=true;
	},

	istruzioni:function() {
		scala.mydialog("formistruzioni");
	},


	totalelim:function() {
		$("#testoallerta").html("nuovo limite: <input type='number' id='limiteinput' value="+scala.totalelimite+"><br>");
		scala.mydialog("allerta",scala.limiteOK);
	},

	limiteOK:function() {
		var valore= document.getElementById("limiteinput").value;
		if (valore>999) {scala.myalert("valore troppo alto");return}
		if (valore<10) {scala.myalert("valore troppo basso");return}
		scala.totalelimite=valore;
		scala.hidedialog();
		scala.render();
	},
/*	
	vintoNEW:function() {
		this.vintoOK();
		this.nuovo();
		//this.start();
	},
	persoOK:function() {
		$("#haiperso").hide();
		$("#schermo").hide();
		this.fmodale=false;
	},
	
	persoNEW:function() {
		this.persoOK();
		this.nuovo();
		//this.start();
	}, */

	nuovo2:function() {
		scala.salvaavversari=scala.numeroavversari;
		$('input:radio[name="avversari"]').filter('[value='+scala.numeroavversari+']').click(); //attr('checked', true);
		scala.mydialog("formnuovo",scala.nuovo3);
	},
	
	nuovo3:function() {
		
		var tempavversari=$('input[name="avversari"]:checked').val();
		if (tempavversari!=scala.salvaavversari) scala.azzeratotale();
		this.numeroavversari=tempavversari;
		scala.nuovo();
	},

	nuovo:function() {
		location.search=("ta"+this.totaleavversario1+"tb"+this.totaleavversario2+"tc"+this.totaleavversario3+
		"tg"+this.totalegiocatore+"tl"+this.totalelimite+"tp"+this.totalepartite+"na"+this.numeroavversari);
	},
	
	azzeratotale:function(){
		this.totaleavversario1=0;
		this.totaleavversario2=0;
		this.totaleavversario3=0;
		this.totalegiocatore=0;
		this.totalepartite=0;
		this.render();
	},

    cartadestro: function(divCard,ev) {
    	if  (this.pointerinelement(ev,"#giocatore")) {
    		if (this.pescato) return this.scarta(divCard.card);
    		//else return this.cartapesca();
    	} 
    },
    
    //muovicarta accetta come sorgente un gruppo da cui farà un pop
    //oppure una card che varrà rimossa dal gruppo
    //fa il push in destinazione
    
    muovicarta:function(sorgente,destinazione,toggle){
        var carta;
        
        if (typeof (sorgente.carte) !="undefined") {carta=sorgente.carte.pop()}
        else {
            carta=sorgente;
            var posizione=sorgente.gruppo.carte.indexOf(carta);
            sorgente.gruppo.carte.splice(posizione,1);
        }
        
        if (toggle=="toggle") carta.faceUp=!carta.faceUp;
        if (toggle=="faceUp") carta.faceUp=true;
        if (toggle=="faceDown") carta.faceUp=false;
        this.showcard(carta);
        carta.gruppo=destinazione;
        destinazione.carte.push(carta);
        // this.render();                 //*****************attivare par dare le carte una alla volta
        return carta;

    },

	scartatrisgiocatore:function(){
			if (this.carteselezionate.length==this.giocatore.carte.length) scala.myalert("non è possibile rimanere senza carte");
			else this.scartatris(this.carteselezionate);
            this.carteselezionate=[];
            this.render();

            return;
	},

    
      scartatris:function(tris){
        var ncarte=tris.length;
        if (ncarte<3) return;
        var gruppo=tris[0].gruppo.carte;
        if (gruppo==this.giocatore.carte) gruppotris=this.trisgiocatore;
		if (gruppo==this.avversario1.carte) gruppotris=this.trisavversario1;
		if (gruppo==this.avversario2.carte) gruppotris=this.trisavversario2;
		if (gruppo==this.avversario3.carte) gruppotris=this.trisavversario3;

        
        var ntris=0;
        if (gruppotris.carte.length!=0) ntris=gruppotris.carte[gruppotris.carte.length-1].ntris+1;

        this.pushstato();
		this.checktris(tris,SORTED);
		for(var i=0;i<ncarte;i++){
			var carta=tris[i];
			carta.ntris=ntris;
			$(carta.gui).removeClass("cardselected");
			carta.selected=false;
			if (carta.seme=="J"){
				if (carta.tipotris==SCALA) {
					carta.tipojolly=this.trisdata.semescala;
					carta.numerojolly=this.trisdata.primonumero+i;
					if (carta.numerojolly==14) carta.numerojolly=1;   //era l'asse dopo il re
				}
				else{   //tipotris=TRIS
					carta.numerojolly=this.trisdata.primonumero;
					carta.tipojolly=(this.trisdata.semidausare).pop();
					if (gruppotris==this.trisgiocatore) scala.jollymodificabili.push(carta);
				}
			}
			this.muovicarta(carta,gruppotris,"faceUp");
		}
		scartatris.play();
        return;
    },

  
 

    
    render:function(){

		if (this.cartescoperte) this.displaypunti(this.calcolapunti(this.avversario1.carte),"avversario1");
		else this.displaypunti(0,"puntiavversario1");
		this.displaypunti(this.calcolapuntitris(this.trisavversario1.carte),"trisavversario1");

		if (this.numeroavversari>1){
			if (this.cartescoperte) this.displaypunti(this.calcolapunti(this.avversario2.carte),"avversario2");
			else this.displaypunti(0,"puntiavversario2");
			this.displaypunti(this.calcolapuntitris(this.trisavversario2.carte),"trisavversario2");
		}

		if (this.numeroavversari>2){
			if (this.cartescoperte) this.displaypunti(this.calcolapunti(this.avversario3.carte),"avversario3");
			else this.displaypunti(0,"puntiavversario3");
			this.displaypunti(this.calcolapuntitris(this.trisavversario3.carte),"trisavversario3");
		}
		

		this.displaypunti(this.calcolapunti(this.giocatore.carte),"giocatore");
		this.displaypunti(this.calcolapuntitris(this.trisgiocatore.carte),"trisgiocatore");
		this.displaypunti(this.totaleavversario1,"totaleavversario1");
		if (this.numeroavversari>1) this.displaypunti(this.totaleavversario2,"totaleavversario2");
		if (this.numeroavversari>2)this.displaypunti(this.totaleavversario3,"totaleavversario3");
		this.displaypunti(this.totalegiocatore,"totalegiocatore");
		this.displaypunti(this.totalelimite,"totalelimite");
		this.displaypunti(this.totalepartite,"totalepartite");

    	
        this.rendicontenitore(this.mazzo);
        this.rendicontenitore(this.scarti);
        this.rendicontenitore(this.giocatore);
        this.rendicontenitore(this.trisgiocatore);
		
		for (var j=0;j<this.numeroavversari;j++){
			this.rendicontenitore(this.campiavversario[j]);
			this.rendicontenitore(this.campitrisavversario[j]);
		}

        if (this.pescato) $("#giocatore").css({"border-color":"yellow" });
        else $("#giocatore").css({"border-color":"grey" });
		if (this.turno==-1) $("#etgiocatore").css({"color":"yellow"});
		else $("#etgiocatore").css({"color":"#888888"});
		for (var j=0;j<this.numeroavversari;j++) {
			if (j==this.turno) $("#etavversario"+(j+1)).css({"color":"yellow"});
        	else $("#etavversario"+(j+1)).css({"color":"#888888"});
		}
    },
    
    rendicontenitore:function(cont,speed){
    	var velocita=speed||400;
        var newtop,newleft,carta;
        for (var i=0;i<cont.carte.length;i++){
            carta=cont.carte[i];
            newtop=cont.top+cont.offsety+Math.floor(i*cont.deltay);
            newleft=cont.left+cont.offsetx+Math.floor(i*cont.deltax)+cont.xtris*carta.ntris;
            carta.top=newtop;
            carta.left=newleft;
            carta.zindex=i;
            $(carta.gui).animate({"top":newtop,"left":newleft,"z-index":i},velocita);
			this.showcard(carta);        

        }
    },
        
  
    cartapesca:function(){

    	if (this.turno!=-1) return;
    	this.fscartipesca=false;
		pesca.play();
        this.pushstato();
        this.muovicarta(this.mazzo,this.giocatore,"faceUp");
        this.pescato=true;
        this.render();
        return;
    },
    
    
    scartipesca:function(){
    	if (this.turno!=-1) return;
		if (this.pescato){   //se clicco sugli scarti avendo pescato e c'e' una carta selezionata la scarto
			if (this.carteselezionate.length==1){
				this.scarta(this.carteselezionate.pop());
			}
		return;
		}
		

    	if (!this.f40giocatore) {
    		if (!this.fscartiprima40) {scala.myalert("gioco non ancora aperto");return}
     	}
    	this.fscartipesca=true; 
		dascarti.play();
        this.pushstato();
        this.muovicarta(this.scarti,this.giocatore,"faceUp");
        this.pescato=true;
        this.render();
        return;
    },
    
    selezionacartagiocatore:function(divCard){
        
        if (divCard.card.selected){  //se era già selezionata la deseleziona
            this.deselezionacarta(divCard);
            return;
        }
        switch (this.carteselezionate.length) {
            
            case 0:  //se è la prima carta seleziona comunque
                this.selezionacarta(divCard);
            break;
            
            case 1:
                if (this.check1(divCard)) this.selezionacarta(divCard);
            break;

            default:
                this.selezionacarta(divCard);
                
                
                if (!this.checktris(this.carteselezionate)) this.deselezionacarta(divCard);
            break;
        }

    },
    
    check1:function(divCard) {
        var k=this.carteselezionate[0];
        var n=divCard.card;
        if (k.seme=="J"){
            if(n.seme!="J") return true;  //un solo jolly ok
            if(this.duejolly) return true; //se sono consentiti due jolly OK;
            return false;  //due jolly non ok
        }
        if (n.seme=="J") return true;
        if (n.seme==k.seme){
            if (Math.abs(n.numero-k.numero)==1) return true;
            if (Math.abs(n.numero-k.numero)==12) return true; //re e asse
            return false;
        }
        else if(n.numero==k.numero) return true;
        return false;
    },
    
    checktris:function(arraycards,nosort){  //nosort parametro opzionale
        var ncarte=arraycards.length;
        if (ncarte<3) return false;
        if (ncarte>13) return false;
        
        var carte=arraycards;

  
		if (typeof(nosort)=="undefined"){
			carte.sort(function (a, b) {                        //ordina le carte per zindex (ordine di esposizione sul tavolo) 
				if (a.zindex > b.zindex) return 1;
				if (a.zindex < b.zindex) return -1;
				return 0;    // a must be equal to b (non dovrebbe)
			});  
		}
        //per fare un tris le carte extra jolly devono avere lo stesso numero e seme diverso;
        //devono anche essere meno di 5

        var semidausare = {"C":true, "Q":true,"F":true, "P":true};
/*        var primonumero =carte[0].numero;
		semidausare[carte[0].seme]=false;   */
		
		var primonumero =100;    //verrà rimpiazzato al primo giro
		var numerojolly=0;
		this.trisdata.jollycontenuti=[];

        var trovatotris=true;
        if (ncarte<5){
        		//for (var i=1;i<ncarte;i++) {
                for (var i=0;i<ncarte;i++) {
                    if (carte[i].numero>49) {
                    	numerojolly++;
                    	this.trisdata.jollycontenuti.push(carte[i]);
                    	continue; 			//salta il Jolly
                    }
                    if (primonumero>49) primonumero=carte[i].numero;    //se il primo numero era jolly lo rimpiazza
                    if (carte[i].numero!=primonumero) {trovatotris = false; break}
                    if(!semidausare[carte[i].seme]) {trovatotris = false; break}
                    semidausare[carte[i].seme]=false;
                }
                if ((trovatotris)&&(ncarte!=numerojolly)&&(this.duejolly||(numerojolly<2))) {
                	for (var i=0;i<ncarte;i++) {
                		carte[i].tipotris=TRIS;
                	}
                	this.trisdata.tipotris=TRIS;
                	this.trisdata.semidausare=[];
                	this.trisdata.primonumero=primonumero;
                	for (var member in semidausare) {if (semidausare[member]) this.trisdata.semidausare.push(member)} 
                	     	
                	return true;
                }

            }
        //altrimenti per fare un tris le carte extra jolly devono avere lo stesso seme e numero crescente;


        var primonumero =carte[0].numero+1;
        var primoseme =carte[0].seme;
        var oltrekappa=false;
		var numerojolly=0;
		this.trisdata.jollycontenuti=[];

        var trovatotris=true;       
        for (var i=1;i<ncarte;i++,primonumero++) {
        	if (oltrekappa&&(primonumero==2)) {trovatotris = false; break} //il due oltre il kappa non si mette
            if (primonumero==14) {primonumero=1,oltrekappa=true};   //dopo il K viene l'asse
            if (carte[i].numero>49) {
                   	numerojolly++;
                   	this.trisdata.jollycontenuti.push(carte[i]);
            	continue;   //salta il Jolly
            }
            if (primonumero>49) {   //se il primo numero era jolly lo rimpiazza
            	primonumero=carte[i].numero; primoseme=carte[i].seme;
            	numerojolly++;
              	this.trisdata.jollycontenuti.splice(0,0,carte[i]);
            }   
            if (carte[i].numero!=primonumero) {trovatotris = false; break}
            if (carte[i].seme!=primoseme) {trovatotris = false; break}
            if (primonumero==13) {primonumero=0,oltrekappa=true};   //dopo il K viene l'asse
        }
         if (trovatotris) {
         	if (primonumero<3) primonumero+=13;
         	this.trisdata.primonumero=primonumero-i;
         	for (var j=0;j<ncarte;j++) {carte[j].tipotris=SCALA};  
         	this.trisdata.tipotris=SCALA;
         	this.trisdata.semescala=primoseme;      	
            return true;
		}
        return false;

       
    },
        
    selezionacarta:function(divCard){
        $(divCard).addClass("cardselected");
        this.carteselezionate.push(divCard.card);
        divCard.card.selected=true;
    },
    
     deselezionacarta:function(divCard){
        $(divCard).removeClass("cardselected");
        var a =this.carteselezionate.indexOf(divCard.card);
        this.carteselezionate.splice(a,1);
        
        divCard.card.selected=false;
    },
     
    showcard:function(carta){
        
        var backx,backy,stepx=-71,stepy=-96,bsx=1233,bsy=384;
        if (this.numeroavversari>2) {stepx=-52,stepy=-70,bsx=903,bsy=280}
        if ((carta.faceUp==true)||(this.cartescoperte)){
            if (carta.numero<50){  //non jolly
                backx=stepx*(carta.numero-1);
                backy=stepy*(valoreseme[carta.seme]);
            }
            else{          // jolly
            	if (carta.tipojolly=="J"){   //jolly non posizionato
            		backx=stepx*13;    
                	backy=stepy*(carta.numero-50);
            	}
            	else {
            		backx=stepx*(14+carta.numero-50);    
                	backy=stepy*(valoreseme[carta.tipojolly]);
            	}
                
            }
            
        }
        else{  //faccia in giu
            backx=stepx*16;
            backy=stepy*carta.retro;
        }
       	$(carta.gui).css({"background-position": (backx+ "px " + backy+ "px "),"background-size": (bsx+ "px " + bsy+ "px "),"width":-stepx,"height":-stepy});
        return;
    },
    
    pointerinelement:function(ev,element){
        var minx,maxx,miny,maxy;
        minx=parseInt($(element).css("left"));
        maxx=minx+parseInt($(element).css("width"));
        miny=parseInt($(element).css("top"));
        maxy=miny+parseInt($(element).css("height"));
        if((ev.pageX-scala.offsetxx)<minx) return false;
        if((ev.pageX-scala.offsetxx)>maxx) return false;
        if((ev.pageY-scala.offsetyy<miny)) return false;
        if((ev.pageY-scala.offsetyy>maxy)) return false;
        return true;
    },
  
    tgon:function(ev){
        $("#trisgiocatore").css({"border-color": "yellow"});        
    },
    tgoff:function(ev){
        $("#trisgiocatore").css({"border-color": "gray"});        
    },
    
	taon:function(avv){
		$("#trisavversario"+(avv+1)).css({"border-color": "yellow"});        
    },
    taoff:function(avv){
        $("#trisavversario"+(avv+1)).css({"border-color": "gray"});        
    },


	aggiornapunti:function(carta){
		carta.punteggio=carta.puntitris+carta.punticoppia+carta.puntiattacca+carta.puntijollyrecuperabile;
	},

//calcola tris possibili (escluso quelli con Jolly)

	calcolatrispossibili:function(avv){

		var mtest=scala.campiavversario[avv].carte;  //in modo da renderlo parametrizzabile
		var i,j;
		var temporaneo1=[];
		var temporaneo2=[];
        var semidausare = {"C":true, "Q":true,"F":true, "P":true};


		this.trispossibili=[];

		//azzero i parziali pet puntitris e ricalcolo i totali
		for (var i=0;i<mtest.length;i++){
			mtest[i].puntiattacca=0;
			scala.aggiornapunti(mtest[i]);
		}
		


		//cerco i TRIS a partire dalle assi fino ai re (13)

		for(i=1;i<14;i++) {
			var temporaneo1=[];
			var temporaneo2=[];
			for (var xseme in semidausare) semidausare[xseme]=true;
			for (j=0;j<mtest.length;j++){
				if (mtest[j].numero==i){
					if (semidausare[mtest[j].seme]){
						semidausare[mtest[j].seme]=false;
						temporaneo1.push(mtest[j])
					}
					else {temporaneo2.push(mtest[j])};
				}
				
			}
			if (temporaneo1.length>2)this.trispossibili.push(temporaneo1);
			if (temporaneo2.length>2)this.trispossibili.push(temporaneo2);

		} //for(i=1;i<14;i++)

		//cerco le scale
      	this.ordinascale(this.campiavversario[avv]);

		temporaneo1=[];
		temporaneo2=[];
		var assi= {"C":[], "Q":[],"F":[], "P":[]};
		var contscala1=0,contscala2=0,numscala1=0,numscala2=0,shortprec=0,seme1=0,seme2=0;
		for (i=0;i<mtest.length;i++){
			if (mtest[i].numero==1) assi[mtest[i].seme].push(mtest[i]);
			if (mtest[i].shortName!=shortprec)  {     //non sono due carte uguali?
				shortprec=mtest[i].shortName;
				if ((contscala1>0)&&(mtest[i].numero==numscala1+1)&&(mtest[i].seme==seme1)) { //carta conseguente?
					contscala1++; numscala1++;
					temporaneo1.push(mtest[i]);
				}
				else {  //non carta conseguente

					if ((numscala1==13)&&(contscala1>=2)&&(assi[seme1].length>0)) {
						temporaneo1.push(assi[seme1][0]);
						contscala1++
					}
					if (contscala1>=3) this.trispossibili.push(temporaneo1);
					temporaneo1=[]; contscala1=1;
					seme1=mtest[i].seme;
					numscala1=mtest[i].numero;
					temporaneo1.push(mtest[i]);

				}
			} 
			else { //erano due carte uguali
				if ((contscala2>0)&&(mtest[i].numero==numscala2+1)&&(mtest[i].seme==seme2)) { //carta conseguente?
					contscala2++; numscala2++;
					temporaneo2.push(mtest[i]);
				}
				else {  //non carta conseguente
					if ((numscala2==13)&&(contscala2>=2)&&(assi[seme2].length>1)){temporaneo2.push(assi[seme1][1]); contscala2++}
					if (contscala2>=3) this.trispossibili.push(temporaneo2);
					temporaneo2=[]; contscala2=1;
					seme2=mtest[i].seme;
					numscala2=mtest[i].numero;
					temporaneo2.push(mtest[i]);
				}

			}

		}
		if ((numscala1==13)&&(contscala1>=2)&&(assi[seme1].length>0)) {
						temporaneo1.push(assi[seme1][0]);
						contscala1++
		}
		if (contscala1>=3) this.trispossibili.push(temporaneo1);
		if ((numscala1==13)&&(contscala2>=2)&&(assi[seme2].length>1)){temporaneo2.push(assi[seme1][1]); contscala2++}
		if (contscala2>=3) this.trispossibili.push(temporaneo2);

		//segnala che la carta è in un tris e le somma PUNTITRIS punti

		for (i=0;i<this.trispossibili.length;i++){
			for (j=0;j<this.trispossibili[i].length;j++) { 
				this.trispossibili[i][j].intris++;
				this.trispossibili[i][j].puntitris+=PUNTITRIS;
				this.aggiornapunti(this.trispossibili[i][j]);
			}
		}


		var stris="tris:"
		for (i=0;i<this.trispossibili.length;i++){
			stris+=(" #TRIS" + i + " ("+this.calcolapuntitris(this.trispossibili[i])+") : ");
			for (j=0;j<this.trispossibili[i].length;j++){
				stris+=(this.trispossibili[i][j].shortName+", ");
			}
		}
		log(stris);
	},
    
	

	//ottimizza i tris contenuti in trispossibili 
	//serve per eliminare un tris se una carta è usata in due tris.
	//di default ottimizza per massimi punti allo scopo di scartare i 40,
	//in caso di opzione "valore" ottimizza per minimi valori in modo da tenere in mano le carte più utili


	ottimizzatris:function(option){
		this.ordinatris(this.trispossibili);
		var nmultipli,puntamultiplo,trovato;
		if (this.trispossibili.length==0) return;
		//esamina i tris uno a uno
		for (var i=0; i<this.trispossibili.length;i++){
			nmultipli=0;
			//per ogni tris vede quante carte hanno uso multiplo
			for (var j=0; j<this.trispossibili[i].length;j++) {
				if (this.trispossibili[i][j].intris>1) {nmultipli+=(this.trispossibili[i][j].intris-1);puntamultiplo=j}
			}
			//se più di una carta questo tris viene eliminato
			if (nmultipli==0) continue;
			if (nmultipli>1) {this.eliminatris(i); i=-1; continue} //ricomincia il loop da zero
			//altrimenti vede in quale altro tris la carta è presente e decide quale togliere
			//il tris può solo essere successivo a quello in esame
			trovato=false;
			for (var w=i+1;w<this.trispossibili.length;w++){
				for (var z=0; z<this.trispossibili[w].length;z++) {
					if (this.trispossibili[w][z].id==this.trispossibili[i][puntamultiplo].id) {trovato=true;break}
				}
				if (trovato) break;
			}

			//i due tris sono i (carta=puntamultiplo) oppure w (carta=z)
			//se uno dei due tris è una scala più lunga di 4 e la carta in comune è in una posizione tale da lasciare 
			//se rimossa un tris valido toglie la carta dal tris insieme con le carte in eccesso
			var checkscala=function(tris,indice){
				scala.checktris(tris,SORTED);
				if (scala.trisdata.tipotris==TRIS) return false;
				if (indice>2){  //rimuove tutte le carte da indice in poi. Al momento non prevedo il caso in cui oltre ci sta un altro tris
					for (var h=indice; h<tris.length;h++){
						var carta=tris[h];
						carta.intris--;
						carta.puntitris-=PUNTITRIS;
						scala.aggiornapunti(carta);
					}
					tris.splice(indice,tris.length-indice);
					return true;
				}
				if ((tris.length-indice-1)>3) {  //rimuove tutte le carte da indice in giu. Al momento non prevedo il caso in cui oltre ci sta un altro tris
					for (var h=0; h<=indice;h++){
						var carta=tris[h];
						carta.intris--;
						carta.puntitris-=PUNTITRIS;
						scala.aggiornapunti(carta);
					}
					tris.splice(0,indice+1);
					return true;
				}		
				
			};

			
			if (checkscala(scala.trispossibili[i],puntamultiplo)||checkscala(scala.trispossibili[w],z)) {i=-1;continue}


			if (option=="valore"){

			}
			else {  //massimizza i punti ottenibili cancellando chi ne ha di meno
				if (this.calcolapuntitris(this.trispossibili[i])>=this.calcolapuntitris(this.trispossibili[w])) this.eliminatris(w);
				else this.eliminatris(i);
				i=-1;  //ricomincia il loop
			}
		}
		var stris="ottimitris:"
		for (i=0;i<this.trispossibili.length;i++){
			stris+=(" #TRIS" + i + " ("+this.calcolapuntitris(this.trispossibili[i])+") : ");
			for (j=0;j<this.trispossibili[i].length;j++){
				stris+=(this.trispossibili[i][j].shortName+", ");
			}
		}
		log(stris);

	},

	//eliminatris elimina da trispossibili il tris numero ntris
	//a tutte le carte riduce intris e toglie PUNTITRIS
	
	eliminatris:function(ntris){
		var carta;
		for (var k=0; k<this.trispossibili[ntris].length;k++){
			carta=this.trispossibili[ntris][k];
			carta.intris--;
			carta.puntitris-=PUNTITRIS;
			this.aggiornapunti(carta);
		}
		this.trispossibili.splice(ntris,1)
	},


	multiundo:function(){
		if (this.pescato) this.undo();
		else while(!this.pescato) {	this.undo();}
    },



	undo:function(){
		this.jollymodificabili=[];
    	this.popstato();
        this.render();
    },
    
   


	 mossaavversario:function(avv){
	 scala.turno=avv; 
       if (this.campiavversario[avv].carte.length==0) return;
       this.apesca(avv);
       this.alavora(avv);
       window.setTimeout(function(){
       		
       		if ((scala.ascarta(avv))&&(avv<(scala.numeroavversari-1))) 
       		window.setTimeout(function(){
       			scala.mossaavversario(avv+1);},1000);
       		else window.setTimeout(function(){
       			scala.turno=-1;scala.render()},500);
       	
       },1000);
   }, 


	calcolapunti: function(gruppo){
		var punti=0,valore;
		for (var i=0;i<gruppo.length;i++){
			valore=gruppo[i].numero;   
			if (valore==1) {punti+=11;continue}         //asse vale 11 punti
			if (valore<11) {punti+=valore;continue}
			if (valore<49) {punti+=10;continue}         //figure 10 punti
			punti+=25;									//jolly 25 punti
		}
		return punti;
	},


calcolapuntitris: function(gruppo){
		var punti=0,valore,totale;
		var ncarte=gruppo.length;
		if (ncarte==0) return 0;
		var ntris=gruppo[ncarte-1].ntris;
		var tris=[];
		
		for (var i=0,j=0;i<=ntris;i++){  //per ogni tris
			tris=[];
			while ((j<ncarte)&&(gruppo[j].ntris==i)){
				tris.push(gruppo[j]); j++;
			}
			this.checktris(tris,SORTED);
			if (this.trisdata.tipotris==TRIS){
				valore=this.trisdata.primonumero;
				if (valore==1) valore=11;
				else if (valore>10) valore=10;
				punti+=valore*tris.length; 
			}
			else { //era una scala
				valore=this.trisdata.primonumero;
				for (var k=0;k<tris.length;k++,valore++){
					if (valore<11) {punti+=valore;continue};
					if (valore<14) {punti+=10;continue};  //figura
					punti+=11; //asse
					
				}
			}
		}
		return punti;
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

	calcolacarteattaccabili:function(avv){

		var checkattaccabili=(function(contx,carta){ 

			var salvacarta =(function(indice){
				var tempor={};
				tempor.carta=carta;
				tempor.cont=contx;
				tempor.indice=indice;
				tempor.cartatris=tris[0];
				scala.carteattaccabili.push(tempor);
				carta.puntiattacca+=PUNTIATTACCABILI; scala.aggiornapunti(carta);
				return true;
			});
			conten=contx.carte;
			if (carta.numero>49) return true; //non esamina il jolly e non lo fa esaminare al buffer successivo (ret true)
			var ncarte=conten.length;
			var tris=[];
			if (ncarte==0) return false;
			var maxtris=conten[ncarte-1].ntris;
			for (var j=0;j<=maxtris;j++){  //esamino un tris alla volta
				tris=[];
				var ultimacartatris=0;
				for (var k=0;k<ncarte;k++) { //estraggo il tris
					if (conten[k].ntris==j) {
						tris.push(conten[k]);
						ultimacartatris=k;
					}
				} 
				scala.checktris(tris,SORTED);  //mi serve per calcolare trisdata
				if (scala.trisdata.tipotris==TRIS){
					if (scala.trisdata.primonumero!=carta.numero) continue;
					if (scala.trisdata.semidausare.indexOf(carta.seme)<0)  continue;
					return salvacarta(ultimacartatris+1);
				}
				else { //era una scala
					if (scala.trisdata.semescala!=carta.seme) continue;
					if (scala.trisdata.primonumero==carta.numero+1) return salvacarta(ultimacartatris+1-tris.length);
					var prossimacarta =scala.trisdata.primonumero+tris.length;
					if (prossimacarta==14) prossimacarta=1;
					if (prossimacarta==carta.numero) return salvacarta(ultimacartatris+1);
				}
			}
			return false;
		}) 

		this.carteattaccabili=[];
		var cont=this.campiavversario[avv].carte;
		this.ordinacarte(this.campiavversario[avv]);
		//azzero i parziali pet puntiattacca e ricalcolo i totali
		for (var i=0;i<cont.length;i++){
			cont[i].puntiattacca=0;
			this.aggiornapunti(cont[i]);
		}
		
			
		for (var i=0;i<cont.length;i++){
			//se è uguale alla carta precedente la skippa
			if ((i>0)&&(cont[i].shortName==cont[i-1].shortName)) continue;
			if (!checkattaccabili(this.trisgiocatore,cont[i])) {
				for (var j=0;j<scala.numeroavversari;j++) {
					if (checkattaccabili(this.campitrisavversario[j],cont[i])) break;
				}
			}

			
		}
		return;
	},

	attaccabiliconjolly:function(avv){

		var checkattaccabili=(function(contx,carta){ 

			var salvacarta =(function(indice,flag){
				var tempor={};
				tempor.carta=carta;
				tempor.cont=contx;
				tempor.indice=indice;
				tempor.cartatris=tris[0];
				tempor.messeprima=flag;
				tempor.primonumero=scala.trisdata.primonumero;
				scala.carteattaccabili.push(tempor);
				return true;
			});
			conten=contx.carte;
			if (carta.numero>49) return true; //non esamina il jolly e non lo fa esaminare al buffer successivo (ret true)
			var ncarte=conten.length;
			var tris=[];
			if (ncarte==0) return false;
			var maxtris=conten[ncarte-1].ntris;
			for (var j=0;j<=maxtris;j++){  //esamino un tris alla volta
				tris=[];
				var ultimacartatris=0;
				for (var k=0;k<ncarte;k++) { //estraggo il tris
					if (conten[k].ntris==j) {
						tris.push(conten[k]);
						ultimacartatris=k;
					}
				} 
				scala.checktris(tris,SORTED);  //mi serve per calcolare trisdata
				if (scala.trisdata.tipotris==TRIS) continue;
				else { //era una scala
					if (scala.trisdata.semescala!=carta.seme) continue;
					if (scala.trisdata.primonumero==carta.numero+2) return salvacarta(ultimacartatris+1-tris.length,true);
					var prossimacarta =scala.trisdata.primonumero+tris.length+1;
					if (prossimacarta==15) continue;
					if (prossimacarta==14)prossimacarta=1;
					if (prossimacarta==carta.numero) return salvacarta(ultimacartatris+1,false);
				}
			}
			return false;
		}) 

		this.carteattaccabili=[];
		var cont=this.campiavversario[avv].carte;
		this.ordinacarte(this.campiavversario[avv]);
		
			
		for (var i=0;i<cont.length;i++){
			//se è uguale alla carta precedente la skippa
			if ((i>0)&&(cont[i].shortName==cont[i-1].shortName)) continue;
			if (!checkattaccabili(this.trisgiocatore,cont[i])) {
				for (var j=0;j<scala.numeroavversari;j++) {
					if (checkattaccabili(this.campitrisavversario[j],cont[i])) break;
				}
			}

			
		}
		return;
	},

	
	
	//mette in jolly recuperabili i jolly in campo che si possono recuperare con le carte del gruppo (cont)
	//ritorna il numero di jolly trovato
	cercajollyrecuperabili:function(cont){
		this.jollyincampo=[];
		this.jollyrecuperabili=[];
		var cercajolly=function(conten){
			if (conten.length==0) return;
			for (var i=0;i<conten.length;i++){
				if (conten[i].numero>49) scala.jollyincampo.push(conten[i]);
			}

		}

		
		for (var i=0;i<cont.carte.length;i++){
			cont.carte.puntijollyrecuperabile=0;
			scala.aggiornapunti(cont.carte[i]);
		}

		cercajolly(this.trisgiocatore.carte);
		for (var j=0;j<scala.numeroavversari;j++){
			cercajolly(this.campitrisavversario[j].carte);
		}
		var carta,dacercare;
		for (var i=0;i<this.jollyincampo.length;i++){
			carta=this.jollyincampo[i];
			dacercare=carta.tipojolly+carta.numerojolly;
			for (var j=0;j<cont.carte.length;j++){
				if (cont.carte[j].shortName==dacercare) {
					this.jollyrecuperabili.push({"jolly":carta,"cartagruppo":cont.carte[j]});
					cont.carte[j].puntijollyrecuperabile+=JOLLYRECUPERABILE;
					scala.aggiornapunti(cont.carte[j]);
					break;
				}	
			}
			
		}
		return this.jollyrecuperabili.length;
	},

	cercacoppie:function(avv){

		var salvacoppia =(function(c1,c2,tipotris,punteggio,punticonjolly,posizionejolly){
			
			var tempor={};
			tempor.carta1=cont[c1];
			tempor.carta2=cont[c2];
			tempor.tipotris=tipotris;
			tempor.punticonjolly=punticonjolly;     //punti che si possono ottenere aggiungendo un Jolly
			tempor.posizionejolly=posizionejolly;   //0 all inizio, 1 in mezzo, 2 alla fine

			if ((cont[c1].intris>0)&&(cont[c2].intris>0)) return; //se entrambe appartengono a tris non le usa
			//se una sola appartiene a un tris le mette in coppiecontris e rende 1/8 il punteggio;
			if ((cont[c1].intris>0)||(cont[c2].intris>0)) 
			{scala.coppiecontris.push(tempor); punteggio/=8}
			else scala.coppie.push(tempor);
			//per prova aggiungo ai punticoppia un metà dei punti che formerebbe con il tris 
			// solo se l'avversario non ha ancora aperto'
			var puntiextra = punticonjolly/2; if (scala.f40avversario[avv]) puntiextra=0;
			cont[c1].punticoppia+=(punteggio+puntiextra); scala.aggiornapunti(cont[c1]);
			cont[c2].punticoppia+=(punteggio+puntiextra); scala.aggiornapunti(cont[c2]);
		});

		cont=this.campiavversario[avv].carte;
		this.coppie=[];
		this.coppiecontris=[];
		var ncarte=cont.length;
		//azzero i parziali per punticoppia e ricalcolo i totali
		for (var i=0;i<cont.length;i++){
			cont[i].punticoppia=0;
			scala.aggiornapunti(cont[i]);
		}
		

		var differenza,flagskip=0;
		if (ncarte<2) return;  //ci devono essere almeno due carte
		for (var i=0; i<ncarte-1;i++) {  //mi fermo una carta prima della fine
			i+=flagskip;  flagskip=0;
			if (i>=ncarte-1) break;
			//salto i Jolly
			if (cont[i].numero>49) {cont[i].punticoppia+=PUNTIJOLLY; scala.aggiornapunti(cont[i]);continue};
			//in caso di due carte uguali tolgo PUNTICARTEUGUALI alla seconda e la faccio skippare (i++)
			if (cont[i].shortName==cont[i+1].shortName) 
			{cont[i+1].punticoppia-=PUNTICARTEUGUALI;scala.aggiornapunti(cont[i+1]); flagskip++ };

			//TEMPORANEAMENTE ELIMINATO escludo come partenza le carte che appartengono a un tris
			//if (cont[i].intris>0) continue;
			//per evitare doppioni cerco le coppie solo in avanti
			for (var j=i+1;j<ncarte;j++){
				if ((cont[i].seme!=cont[j].seme)&&(cont[i].numero==cont[j].numero)) {
					var puntitris =cont[i].numero*3;
					if (puntitris>30) puntitris=30;
					if (puntitris==3) puntitris=33;
					salvacoppia(i,j,TRIS,PUNTICOPPIA,puntitris,2);  //coppia per TRIS
				}
				else {
					//coppia per  SCALA - le carte si presuppongono in ordine crescente
					if (cont[i].seme!=cont[j].seme) continue;  //devono essere dello stesso seme
					differenza=cont[j].numero-cont[i].numero;
					if ((differenza<3)&&(differenza!=0)) {
						if ((differenza==1)&&(cont[i].numero!=1)) {
							var puntitris =cont[i].numero*3+3;
							if (cont[i].numero==9) puntitris=29;
							if (cont[i].numero>=10) puntitris=30;
							if (cont[i].numero==12) puntitris=31;
							salvacoppia(i,j,SCALA,PUNTICOPPIA,puntitris,2);
						}
						else {
							var puntitris =cont[i].numero*3+3;
							if (cont[i].numero==9) puntitris=29;
							if (cont[i].numero>10) puntitris=30;
							if ((differenza==1)&&(cont[i].numero==1)){
								salvacoppia(i,j,SCALA,PUNTIMEZZACOPPIA,puntitris,2);
							}
							else {
								salvacoppia(i,j,SCALA,PUNTIMEZZACOPPIA,puntitris,1);
							}
						}
					}
					//caso specifico per l'asse per cui si accettano differenze di 11 (donna) e 12 (re)
					//in questo caso scambio le carte
					else if ((differenza>10)&&(cont[i].numero==1)) salvacoppia(j,i,SCALA,PUNTIMEZZACOPPIA,31,differenza-10);
				}
				//se la carta successiva di confronto è uguale alla attuale la salto
				if (j<(ncarte-1)) {if (cont[j].shortName==cont[j+1].shortName) j++}
			}
		}
		//valorizzo il jolly dell'ultima carta che era esclusa dal loop
		if (cont[ncarte-1].numero>49) {cont[ncarte-1].punticoppia+=PUNTIJOLLY; scala.aggiornapunti(cont[ncarte-1])};
	},


	cancellapuntietris:function(avv){
		var buf=scala.campiavversario[avv];
		for (var i=0;i<buf.carte.length;i++) {
			buf.carte[i].puntitris=0;
			buf.carte[i].punticoppia=0;
			buf.carte[i].puntiattacca=0;
			buf.carte[i].punteggio=0;
			buf.carte[i].intris=0;
			buf.carte[i].puntijollyrecuperabile=0;
		}
	}, //cercacoppie

	ottimizzacoppie:function(){
		if (this.coppie.length<2) return;
		this.ordinacoppie(this.coppie);
		//analizzo ogni coppia partendo dalla prima.
		//se nelle coppie successive a quella in esame c'è una carta in comune le elimino.
		var i=0;
		var id11,id12,id21,id22;
		while (i<(this.coppie.length-1)){
			id11=this.coppie[i].carta1.id;
			id12=this.coppie[i].carta2.id;
			for (var j=i+1;j<this.coppie.length;j++){
				id21=this.coppie[j].carta1.id;
				id22=this.coppie[j].carta2.id;
				if ((id11==id21)||(id11==id22)||(id12==id21)||(id12==id22)) {this.coppie.splice(j,1);j--}
			}
			i++;
		}
		
		
	},


	trisconjolly:function(avv){
				this.ordinacarte(this.campiavversario[avv]);
				var jolly=this.campiavversario[avv].carte[this.campiavversario[avv].carte.length-1];
				var tempor=this.coppie[0];
				this.coppie.splice(0,1);
				tris=[];
				if (tempor.tipotris==TRIS){ //se è una coppia per un tris normale aggiunge il jolly in coda alle due carte
					tris.push(tempor.carta1);
					tris.push(tempor.carta2);
					tris.push(jolly);
				} 
				else{  //in caso di SCALA
					//se la ultima carta è un asse
					if (tempor.carta2.numero==1){
						//se la prima carta è un re metto il jolly prima di tutto
						if (tempor.carta1.numero==13){
							tris.push(jolly);
							tris.push(tempor.carta1);
							tris.push(tempor.carta2);
						}
						else{ //altrimenti era una donna e metto il jolly in mezzo
														
							tris.push(tempor.carta1);
							tris.push(jolly);
							tris.push(tempor.carta2);

						} 
					} //FINE  if (tempor.carta2.numero==1){
					else{
						if ((tempor.carta2.numero-tempor.carta1.numero)==2){  //c'è un buco e metto il jolly in mezzo

							tris.push(tempor.carta1);
							tris.push(jolly);
							tris.push(tempor.carta2);
						}  //altrimenti metto il jolly alla fine
						else {
							tris.push(tempor.carta1);
							tris.push(tempor.carta2);
							tris.push(jolly);
						}
					}

				}
				this.scartatris(tris);

	},

	jollydausare:0,

    apesca:function(avv){
    	this.pushstato();
   		this.jollydausare=0;

        if ((this.campiavversario[avv].carte.length>=3)) {
        	var scarto=this.scarti.carte[this.scarti.carte.length-1];
        	
        	this.ordinacarte(this.campiavversario[avv]);
   			this.cancellapuntietris(avv);
   			this.calcolatrispossibili(avv);
   			this.ottimizzatris();
	   		this.cercacoppie(avv);
	   		if (this.verifica40(avv)) this.f40avversario[avv]=true;  //alla prima pesca potrebbe gia avere i 40 punti
	   		var coppia,trovato=false;
			//vede se la carta negli scarti è utile per fare un tris
			for (var i=0;i<this.coppie.length;i++)  { 	
				if (scarto.numero>49) {trovato=true; break;}  //se è un jolly va bene
				coppia=this.coppie[i];
				if (coppia.tipotris==TRIS) { 
					if ((coppia.carta1.numero==scarto.numero)&&(coppia.carta1.seme!=scarto.seme)&&(coppia.carta2.seme!=scarto.seme)) {
						{trovato=true; break;}
					 } 
				}
				else { //era una scala
					if (coppia.carta1.seme==scarto.seme){
						if (coppia.posizionejolly==1){ //la carta va in mezzo
							if (coppia.carta1.numero==(scarto.numero-1)) {trovato=true; break;}
						}
						else {
							if (coppia.carta1.numero==(scarto.numero+1)) {trovato=true; break;}
							if ((coppia.carta2.numero!=1)&&(coppia.carta2.numero==(scarto.numero-1))) {trovato=true; break;}
							if ((coppia.carta2.numero==13)&&(scarto.numero==1)) {trovato=true; break;}
						}
					}
					
				}
			}

        	if (trovato){
				if (this.f40avversario[avv]){
   		   			dascarti.play();  //brutta duplicazione
        			this.muovicarta(this.scarti,this.campiavversario[avv],"faceDown");   
        			this.render(); 
        			return;  

				}
        	}

			if ((!this.f40avversario[avv])&&(this.fscartiprima40)){ //non abbiamo ancora aperto ma c'è l'opzione dipescare dagli scarti senza apertura
				//la pesca dagli scarti formerebbe un tris, ma abbiamo i 40 punti?
				this.muovicarta(this.scarti,this.campiavversario[avv],"faceDown");   //prova di nascosto
				this.cancellapuntietris(avv);


				this.calcolatrispossibili(avv);
				this.ottimizzatris();
				this.cercacoppie(avv);
				this.ottimizzacoppie();

				if (this.verifica40(avv)) {
					dascarti.play(); 
					this.render(); 
					return;
				}
				else {
					this.popstato(true); //ripesca dallo stack lasciando lo dtack inalterato
				}
			}

		} 


   		pesca.play();
        this.muovicarta(this.mazzo,this.campiavversario[avv],"faceDown");   
        this.render();
     }, 



    alavora:function(avv){
   		this.ordinacarte(this.campiavversario[avv]);
   		this.cancellapuntietris(avv);
   		if (this.campiavversario[avv].carte.length>3){
    		this.calcolatrispossibili(avv);
	   		this.ottimizzatris();
	   		this.cercacoppie(avv);
			this.ottimizzacoppie();

	   		if (!this.f40avversario[avv]) this.verifica40(avv);
			while ((this.f40avversario[avv])&&(this.trispossibili.length>0)){
					if (this.trispossibili[0].length==this.campiavversario[avv].carte.length) this.trispossibili[0].splice(0,1);
					this.scartatris(this.trispossibili[0]);
					this.cancellapuntietris(avv);
					this.calcolatrispossibili(avv);
					this.ottimizzatris();

			this.cercacoppie(avv);
			this.ottimizzacoppie();
			}
			while ((this.f40avversario[avv])&&(this.jollydausare>0)&&(this.coppie.length>0)) {
				this.trisconjolly(avv);
				this.jollydausare--;
			}
		
  			
   		}
   		this.cercajollyrecuperabili(this.campiavversario[avv]);

   		var coppia;
   		while (this.f40avversario[avv]&&(this.jollyrecuperabili.length>0)){
   			coppia=this.jollyrecuperabili.pop();
   			this.scambiacarte(coppia["cartagruppo"],coppia["jolly"],ESEGUI);
   			this.cercajollyrecuperabili(this.campiavversario[avv]);

   		}
   		this.gestisciattaccabili(avv);

		if (this.campiavversario[avv].carte.length>0) {
			
			this.ordinacarte(this.campiavversario[avv]);

			this.cercacoppie(avv);
			stringone="coppie: ";
			for (var i=0;i<this.coppie.length;i++){
				stringone+=(this.coppie[i].carta1.shortName+ "-"+this.coppie[i].carta2.shortName+" ("+this.coppie[i].punticonjolly+"),  ")
			}
			log(stringone);
			this.ordinacoppie(this.coppie);
			stringone="coppie: ";
			for (var i=0;i<this.coppie.length;i++){
				stringone+=(this.coppie[i].carta1.shortName+ "-"+this.coppie[i].carta2.shortName+" ("+this.coppie[i].punticonjolly+"),  ")
			}
			log(stringone);

			//usa i Jolly che sono ordinati alla fine del gruppo
			//var tempor={},jolly=0;
			this.ottimizzacoppie();
			while (this.f40avversario[avv]
			&&(this.campiavversario[avv].carte.length>3)
			&&(this.campiavversario[avv].carte[this.campiavversario[avv].carte.length-1].numero>49)
			&&(this.coppie.length>0)){
				this.trisconjolly(avv);
				this.cercacoppie(avv);
				this.ottimizzacoppie();
			}

		this.gestisciattaccabili(avv); //ripeto nel caso il tris con jolly potesser avere carte attaccabili

   		this.attaccabiliconjolly(avv);
		var stringone="attaccabiliconjolly"+avv+": ";
		for (var i=0;i<this.carteattaccabili.length;i++){
			stringone+=(this.carteattaccabili[i].carta.shortName+ ", ")
		}
		log(stringone);

		var temp;
		//se ci sono carte attaccabili con jolly e ho meno di 7 carte 
		//e almeno due carte che non siano jolly attacco le carte attacabili con jolly
		var lung=this.campiavversario[avv].carte.length;
		while (this.f40avversario[avv]&&(this.carteattaccabili.length>0)&&(lung>2)&&(lung<7)
		&&(this.campiavversario[avv].carte[lung-1].numero>49)&&(this.campiavversario[avv].carte[1].numero<49)){    
			temp=this.carteattaccabili.pop();
			temp.carta.faceUp=true;
			this.aggiungitris(temp.cont,temp.indice,temp.carta,temp.cartatris,ESEGUI);
			//ora mette il jolly
			scala.trisdata.semescala=temp.cartatris.seme;  //serve a aggiungitris per dare il seme al jolly
			scala.trisdata.primonumero=temp.primonumero;
 			if (!temp.messeprima) this.aggiungitris(temp.cont,temp.indice,this.campiavversario[avv].carte[lung-2],temp.cartatris,ESEGUI);
			else {
				scala.trisdata.primonumero-=2;
				this.aggiungitris(temp.cont,temp.indice+1,this.campiavversario[avv].carte[lung-2],temp.cartatris,ESEGUI);
			}
			//this.attaccabiliconjolly(avv); non dovrebbe servire
			lung=this.campiavversario[avv].carte.length;
		}


			//se sono rimaste due o tre o quattro carte e solo una di queste non è un jolly 
			//oppure se ci sono 3 carte e un jolly attacca il jolly da qualche parte
			this.ordinacarte(this.campiavversario[avv]);
			var lung=this.campiavversario[avv].carte.length;
			while ((lung<5)&&(lung>1)&&(this.campiavversario[avv].carte[1].numero>49)||
			(lung==3)&&(this.campiavversario[avv].carte[2].numero>49)){
				if (!this.attaccajolly(this.trisgiocatore,this.campiavversario[avv].carte[lung-1])){
					for (var j=0;j<scala.numeroavversari;j++) {
						if (this.attaccajolly(this.campitrisavversario[j],this.campiavversario[avv].carte[lung-1])) break;
					}
				}
				lung=this.campiavversario[avv].carte.length;

			}
			//se ci sono quattro carte e due jolly forma il tris con le ultime tre carte
			if ((this.campiavversario[avv].carte.length==4)&&(this.campiavversario[avv].carte[2].numero>49)){
				var tris=[];
				for (var i=1;i<4;i++) tris.push(this.campiavversario[avv].carte[i]);
				this.scartatris(tris);
			}
    		//se ci sono cinque carte e due jolly forma il tris con le ultime tre carte
			if ((this.campiavversario[avv].carte.length==5)&&(this.campiavversario[avv].carte[3].numero>49)){
				var tris=[];
				for (var i=2;i<5;i++) tris.push(this.campiavversario[avv].carte[i]);
				this.scartatris(tris);
			}

			//se ci sono due carte uguali aggiunge alla seconda un quarto dei punti della prima
			var carta; 
			var nomeprecedente=this.campiavversario[avv].carte[0].shortName;

			for (var i=1;i<this.campiavversario[avv].carte.length;i++){
				carta=this.campiavversario[avv].carte[i];
				if (carta.shortName==nomeprecedente){
					carta.punteggio+=(this.campiavversario[avv].carte[i-1].punteggio/4);
				}

				nomeprecedente=carta.shortName;
			}

			stringone="punti: ";
			for (var i=0;i<this.campiavversario[avv].carte.length;i++){
				carta=this.campiavversario[avv].carte[i];
				stringone+=(carta.shortName+ "="+carta.puntitris+":"+carta.puntiattacca+":"+carta.punticoppia+":"+carta.puntijollyrecuperabile+":"+carta.punteggio+",  ")
			}
			log(stringone);

   			this.render();

		}
    },

	
	
	gestisciattaccabili: function(avv) {
		this.calcolacarteattaccabili(avv);
		var stringone="carte attaccabili"+avv+": ";
		for (var i=0;i<this.carteattaccabili.length;i++){
			stringone+=(this.carteattaccabili[i].carta.shortName+ ", ")
		}

	

		log(stringone);

		var temp;
		while (this.f40avversario[avv]&&(this.carteattaccabili.length>0)&&(this.campiavversario[avv].carte.length>1)
		&&!((this.campiavversario[avv].carte.length==4)&&(this.carteattaccabili.length<2)&&(this.numeroavversari<3))){   //per non incartarsi, 
			temp=this.carteattaccabili.pop();													//se  ci sono 3 avversari si incarta
			temp.carta.faceUp=true;
			this.aggiungitris(temp.cont,temp.indice,temp.carta,temp.cartatris,ESEGUI);
			this.calcolacarteattaccabili(avv);
		}

	},

	verifica40: function(avv){
		//verifica se riesce a raggiungere i 40 punti.
		//prima calcola il totale punti dei tris
		var totaletris=0;
		for (var i=0; i<this.trispossibili.length;i++) {
			totaletris+=this.calcolapuntitris(this.trispossibili[i]);
		}
		if (totaletris>39) this.f40avversario[avv]=true;
		else {
			this.ottimizzacoppie();
			var numerojolly=0,totaletrisconjolly=totaletris;
			this.jollydausare=0;
			for (var i=0;i<this.campiavversario[avv].carte.length;i++) {if (this.campiavversario[avv].carte[i].numero>49) numerojolly++}
			for (var i=0; i<numerojolly;i++) {
				if (this.coppie.length<=i) break;
				this.jollydausare++;
				totaletrisconjolly+=this.coppie[i].punticonjolly;
				if (totaletrisconjolly>39) {this.f40avversario[avv]=true; break}
			}
		} 
		log("totaletris= "+ totaletris+ " ,con " +this.jollydausare + " jolly= " + totaletrisconjolly);
		return this.f40avversario[avv];

	},


	attaccajolly:function(contx,carta){ 

			conten=contx.carte;
			var ncarte=conten.length;
			var tris=[];
			if (ncarte==0) return false;
			var maxtris=conten[ncarte-1].ntris;
			for (var j=0;j<=maxtris;j++){  //esamino un tris alla volta
				tris=[];
				var ultimacartatris=0;
				for (var k=0;k<ncarte;k++) { //estraggo il tris
					if (conten[k].ntris==j) {
						tris.push(conten[k]);
						ultimacartatris=k;
					}
				} 
				scala.checktris(tris,SORTED);  //mi serve per calcolare trisdata
				if (scala.trisdata.tipotris==TRIS){
					if (tris.length>3) continue;    //se ci sono solo tre carte il jolly ci sta e lo metto a destra
					//aggiungitris: function(cont,indice,carta,cartasel,esegui)
					this.aggiungitris(contx,ultimacartatris+1,carta,contx.carte[ultimacartatris],ESEGUI);
					return true;
				}
				else { //era una scala, se non comincia con uno lo metto all'inizio
					
					if ((scala.trisdata.primonumero!=1)&&(tris.length<14)) {
						this.aggiungitris(contx,ultimacartatris-tris.length+1,carta,contx.carte[ultimacartatris-tris.length+1],ESEGUI);
						return true;
					}
					else {  //altrimenti lo metto alla fine
						this.aggiungitris(contx,ultimacartatris+1,carta,contx.carte[ultimacartatris],ESEGUI);
						return true;
					}
					
				}
			}
			return false;   
    },
     
    ascarta:function(avv){

   		scarta.play();
   		var indiceminimo=this.campiavversario[avv].carte.length-1;minimo=1000;
   		//cerca la carta con il minimo punteggio
   		if (this.campiavversario[avv].carte.length<4) {  //se non posso piu fare tris annullo il punteggio coppia (e tris che sarà già nullo)
   			for (var i=0;i<this.campiavversario[avv].carte.length;i++) {
   				if (scala.campiavversario[avv].carte[i].numero<50){   //non annullo il punteggio dei jolly
   					scala.campiavversario[avv].carte[i].puntitris=0;
					scala.campiavversario[avv].carte[i].punticoppia=0;
					scala.aggiornapunti(scala.campiavversario[avv].carte[i]);
				}

   			}
   		}
   		 
		//for (var i=0;i<this.avversario.carte.length;i++){
		if (this.f40avversario[avv]){									
			for (var i=this.campiavversario[avv].carte.length-1;i>=0;i--){     //dopo l'apertura
				if ((this.campiavversario[avv].carte[i].punteggio<minimo)		//comincia dal fondo per scegliere la carta con il valore più alto
				||((this.campiavversario[avv].carte[i].punteggio==minimo)&&(this.campiavversario[avv].carte[i].numero==1))) {  //caso speciale per l'asso
					minimo=this.campiavversario[avv].carte[i].punteggio;
					indiceminimo=i;
				}
			}
		} 
		else {
			for (var i=0;i<this.campiavversario[avv].carte.length;i++){     //prima dell'apertura
				if ((this.campiavversario[avv].carte[i].punteggio<minimo)		//comincia dall' inizio per scegliere la carta con il valore più basso
				||((this.campiavversario[avv].carte[i].punteggio==minimo)&&(this.campiavversario[avv].carte[indiceminimo].numero==1))) {  //caso speciale per l'asso
					minimo=this.campiavversario[avv].carte[i].punteggio;
					indiceminimo=i;
				}
			}

		}
   		    	
		this.muovicarta(this.campiavversario[avv].carte[indiceminimo],this.scarti,"faceUp");
		var finito=false;   
        if (this.campiavversario[avv].carte.length==0){
        	finito=true;
        	this.cartescoperte=true;

        	var salvapunti=this.totalegiocatore;
        	
       		var vintotorneo=this.calcolatotali();
			
			if ((this.totalegiocatore>=this.totalelimite)&&(salvapunti<this.totalelimite)){
				window.setTimeout(function(){thunder.play();scala.mydialog("haipersotorneo",function(){scala.azzeratotale();scala.nuovo()},scala.nuovo);},1000);
			} 
			else {
				 if (vintotorneo) {
					window.setTimeout(function(){applause.play();scala.mydialog("haivintotorneo",function(){scala.azzeratotale();scala.nuovo()},scala.nuovo);},1000);
				 }
				 else {
					window.setTimeout(function(){haiperso.play();scala.mydialog("haiperso",scala.nuovo)},1000);
				 }
 				
       		}
       }
            
       this.render(); 
	   return !finito;
    }, 

	
	calcolatotali:function(){

		this.totalepartite++;

		var vintot=true;

		if ((totaleavversario1>=this.totalelimite)
		   &&((this.numeroavversari<2)||(this.totaleavversario2>=this.totalelimite))
		   &&((this.numeroavversari<3)||(this.totaleavversario3>=this.totalelimite))
		   ) vintot=false;


		this.totalegiocatore+=this.calcolapunti(this.giocatore.carte);
		this.totaleavversario1+=this.calcolapunti(this.avversario1.carte);
		if (this.numeroavversari>1) this.totaleavversario2+=this.calcolapunti(this.avversario2.carte);
		if (this.numeroavversari>2) this.totaleavversario3+=this.calcolapunti(this.avversario3.carte);

		if (this.totaleavversario1<this.totalelimite) vintot=false;
		if ((this.numeroavversari>1)&&(this.totaleavversario2<this.totalelimite)) vintot=false;
		if ((this.numeroavversari>2)&&(this.totaleavversario3<this.totalelimite)) vintot=false;

		return vintot;

		
	},


    scoperte:function(){
       if (this.cartescoperte) {
			this.cartescoperte=false;
			$("#scoperte").css({"border-color":"#888888"});
       } 
       else{
       		this.cartescoperte=true;
       		$("#scoperte").css({"border-color":"yellow"});
       }
       this.render();            
    }, 


    
 

}  //scala


$(document) .ready(function () {

    scala.start();
    scala.collegaeventi();
});

 
