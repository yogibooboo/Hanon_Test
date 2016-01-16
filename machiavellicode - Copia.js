function log(msg) {
    if (window.console && log.enabled) {
        console.log(msg);
    } 
} // log  
log.enabled = true;

//log(location.href);
log(location.search);

longstep=false;

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

var adjustscreen=function(){
	zm=1,wh=$(window).height(),ww=$(window).width();
	if (wh<750) zm=wh/750;
	if (ww<1600) zm=Math.min(zm,ww/1600)
	//$('body').css('zoom',zm+'%'); /* Webkit browsers */
  	//$('body').css('zoom',zm); /* Other non-webkit browsers */
  	//$('body').css('-moz-transform',"scale("+zm+", "+zm+")"); /* Moz-browsers */
  	$("body").css({transform:"scale("+zm+")"});
	//$("body").css({transform:"translate("+($("body").offset().left)+"px,"+($("body").offset().top)+"px)"});
};
adjustscreen();

$(window).resize(function () {
	scala.offsetxx=$("#campogioco").offset().left;
	scala.offsetyy=$("#campogioco").offset().top;
	adjustscreen();
});


var DESTRA=1;SINISTRA=2;CENTRO=3;


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
var tick=document.getElementById("tick");
var dindon=document.getElementById("dindon");

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
        this.rowtris=0;   //riga sulla quale è visualizzato il tris
        this.split=false;   //tris spezzato
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
		this.numeroavversari=3;


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
		this.fautosort=true;
       	$("#autosort").css({"border-color":"yellow"});

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
		this.fscartigiocatore=false;		//il giocatore ha già scartato qualcosa
		//this.fscartipesca=false;		//pescato dagli scarti
		this.modale=false;

		//this.altezzacampo=600/(2+this.numeroavversari*2);
		this.altezzacampo=120;

		/*for (var i=0;i<this.numeroavversari;i++){
			this.crealabcampo("avversario"+String.fromCharCode(97+i));
		}
		this.crealabcampo("giocatore");*/
    	
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

    crealabcampo:function (nome,posizione,parnomecampo) {



		$("#campogioco #"+nome).append('<div id="et'+nome+'" class="etichetta" style="position:absolute; top: -10px; left: 400px;"> &nbsp'+
		nome+'</div>')

		

    },


    creamazzi: function () {
        
        this.stock=[];

        var offy=5,moffx=25,moffy=22;
        //if (this.numeroavversari>1) offy=4;
        //if (this.numeroavversari>2) {moffx=35,moffy=35};
        
        this.mazzo={carte:[], top:parseInt($("#mazzo").css("top")), 
                    left:parseInt($("#mazzo").css("left")),offsetx:moffx,offsety:moffy,deltax:0.1,deltay:0.1,xtris:0,rotated:0};
        this.scarti={carte:[], top:parseInt($("#scarti").css("top")), 
                    left:parseInt($("#scarti").css("left")),offsetx:moffx,offsety:moffy,deltax:0.1,deltay:0.1,xtris:0,rotated:0};
        this.giocatore={carte:[], top:parseInt($("#giocatore").css("top")), 
                    left:parseInt($("#giocatore").css("left")),offsetx:15,offsety:offy,deltax:20,deltay:0,xtris:80,rotated:0};
        this.avversarioa={carte:[], top:0, 
                    left:170,offsetx:offy,offsety:0,deltax:0,deltay:20,xtris:80,rotated:90};
        this.avversariob={carte:[], top:0, 
                    left:270,offsetx:15,offsety:offy,deltax:20,deltay:0,xtris:0,rotated:0};
        this.avversarioc={carte:[], top:700, 
                    left:1330,offsetx:20,offsety:-25,deltax:0,deltay:-20,xtris:80,rotated:270};

        this.etichette=["a","b","c"];
        this.avversario1=this.avversarioa;this.avversario2=this.avversariob;this.avversario3=this.avversarioc;
        if (this.numeroavversari==2) {this.avversario1=this.avversarioa;this.avversario2=this.avversarioc;this.etichette=["a","c","b"];};
        if (this.numeroavversari==1) {this.avversario1=this.avversariob;this.etichette=["b","a","c"];}
        this.campiavversario=[this.avversario1,this.avversario2,this.avversario3];
        //this.campitrisavversario=[this.trisavversario1,this.trisavversario2,this.trisavversario3];
        for (var i=0;i<this.numeroavversari;i++){
        	$("#etavversario"+scala.etichette[i]).text("avversario"+(i+1))
        }
       	while (i<3){
       		$("#etavversario"+scala.etichette[i]).text("");i++;
       	}
        var indice=0;
        for (var retro = 0; retro < 2; retro++) {     //il retro può essere ROSSO (0) o BLU (1)
            for (var i = 1; i <= 13; i++) {
                this.stock[indice]=(new Card(CUORI, i,retro,indice++));
                this.stock[indice]=(new Card(QUADRI, i,retro,indice++));
                this.stock[indice]=(new Card(FIORI, i,retro,indice++));
                this.stock[indice]=(new Card(PICCHE, i,retro,indice++));
            }
            //this.stock[indice]=(new Card(JOLLY, 50,retro,indice++));   //Jolly rosso
            //this.stock[indice]=(new Card(JOLLY, 51,retro,indice++));    //jolly nero
        }
        for (i=0;i<104;i++){
        	this.mazzo.carte[i]=this.stock[i];
        }
		this.numerocampitris=5;
		this.campitris=[];
		
		/*this.trisgiocatore={carte:[], top:parseInt($("#trisgiocatore").css("top")), 
           left:parseInt($("#trisgiocatore").css("left")),offsetx:25,offsety:offy,deltax:20,deltay:0,xtris:80,rotated:0};
        this.trisavversario1={carte:[], top:parseInt($("#trisavversario1").css("top")), 
            	left:parseInt($("#trisavversario1").css("left")),offsetx:25,offsety:offy,deltax:20,deltay:0,xtris:80,rotated:0};
        this.trisavversario2={carte:[], top:parseInt($("#trisavversario2").css("top")),left:parseInt($("#trisavversario2").css("left")),offsetx:25,offsety:offy,deltax:20,deltay:0,xtris:80,rotated:0};
        this.trisavversario3={carte:[], top:parseInt($("#trisavversario3").css("top")), 
                left:parseInt($("#trisavversario3").css("left")),offsetx:25,offsety:offy,deltax:20,deltay:0,xtris:80,rotated:0};  */



        
        this.campotris={carte:[], top:parseInt($("#campotris").css("top")), 
            	left:parseInt($("#campotris").css("left")),offsetx:15,offsety:offy,deltax:20,deltay:0,xtris:80,rotated:0};
        
    },
    
    shuffle: function () {
        var i = 104;
        while (--i) {
            var j = Math.floor(Math.random() * (i + 1));
            var tempi = this.mazzo.carte[i];
            var tempj = this.mazzo.carte[j];
            this.mazzo.carte[i] = tempj;
            this.mazzo.carte[j] = tempi;
        }
    },
    
    createDeckElements: function () {
        for (var i = 0; i < 104; i++) {
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


        //this.muovicarta(this.mazzo,this.scarti,"faceUp");
        this.render();

		distribuisci.play();
        for (var i=0;i<10;i++){
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
			},4500);
        
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

        $("#autosort").bind("click", function(ev) {
            return  scala.autosort();
        });

        $("#sort").bind("click", function(ev) {
            return  scala.sort();
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


        $('#group').click(function () {
            scala.compattascale();
            scala.render();
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
    	stato.campotris=[]; copia (scala.campotris.carte,stato.campotris);
    	stato.mazzo=[]; copia (scala.mazzo.carte,stato.mazzo);
    	stato.scarti=[]; copia (scala.scarti.carte,stato.scarti);
	  	stato.pescato=scala.pescato;
	  	stato.fscartigiocatore=scala.fscartigiocatore;
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
    	copia(scala.campotris.carte,stato.campotris);
    	copia(scala.mazzo.carte,stato.mazzo);
    	copia(scala.scarti.carte,stato.scarti);
    	scala.carteselezionate.splice(0,scala.carteselezionate.length);
    	scala.pescato=stato.pescato;
	  	copia(scala.f40avversario,stato.f40avversario);
	  	scala.fscartigiocatore=stato.fscartigiocatore;

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


        if (!this.pointerinelement(ev,"#giocatore")){

        	if (!divCard.card.split) return;
        } 
        
        this.scaladown=true;
        this.scalamove=false;
        this.scaladownx=ev.pageX/zm;
        this.scaladowny=ev.pageY/zm;
        
        return;
    },
    
    scalamousemove:function(ev){
        
        var deltax=ev.pageX/zm-this.scaladownx;
        var deltay=ev.pageY/zm-this.scaladowny;
        if (!this.scalamove) { if((Math.abs(deltax)<5)&& (Math.abs(deltay)<5)) return;}

        var divCard=this.cartadown;
        $(divCard).css({"z-index":1000});
        $(this.cartadown).css({"top":this.cartadown.card.top+deltay,"left":this.cartadown.card.left+deltax})
        this.scalamove=true;

        for (var j=0;j<scala.numerocampitris;j++) {
			if ((this.pointerinelement(ev,("#campotris"+(j))))&&(!this.pescato)) {
				 this.taon(j);
				 this.cercamatch(j,NOESEGUI);
			}
			else this.taoff(j);
        }
 
        return;
    },
    
    scalamouseup:function(ev){
        

		

        if (!scala.scaladown){
            if  (this.pointerinelement(ev,"#mazzo")&&(!this.pescato)) return this.cartapesca();
            if  (this.pointerinelement(ev,"#giocatore")&&(!this.pescato)) return this.cartapesca();
            //if  (this.pointerinelement(ev,"#scarti")) return this.scartipesca();
            if  (this.pointerinelement(ev,"#campotris")&&(!this.pescato)) return this.scartatrisgiocatore();
            return;
        }
        this.scaladown=false;

        var divCard=this.cartadown;
        var carta=divCard.card;
        
        
        if ((!scala.scalamove)&&(!this.pescato)) {this.selezionacartagiocatore(divCard); return;}
        
        
        
        
        var newindex=0;
        var currentindex=(carta.left-(this.giocatore.left+this.giocatore.offsetx))/this.giocatore.deltax; //dove era la carta prima di muoverla
        
        if (this.pointerinelement(ev,"#giocatore")&&(carta.left>0)&&(this.scalamove)&&(carta.gruppo==scala.giocatore)) {
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
			
			$(".card").removeClass("cardselected");

			for (var j=0;j<scala.numerocampitris;j++){

				if ((this.pointerinelement(ev,("#campotris"+(j))))
				&&(!this.pescato))
				{
					this.taon(j);
					this.cercamatch(j,ESEGUI);
				}
				this.taoff(j);
			}
		}

        this.scalamove=false;
        this.render();
        return;
    },
    
    
	cercamatch:function(subcont,esegui)  {                 //subcont è il sottocontenitore (riga) in cui cercare
		var SINISTRA=true;
		var DESTRA = false;
		var cont=scala.campotris;
		if (cont.carte.length==0) return
		var indexrow=0;                       //prima carta sulla riga selezionata
		var ncarte=0;
		for (var i=0;i<cont.carte.length;i++){  //localizza il gruppo di carte nel subcontenitore
			if (cont.carte[i].rowtris==subcont){
				if (ncarte==0) indexrow=i;     //inizio riga
				ncarte++
			}
		}
		if (ncarte==0) return;
		//for (var i=0;i<ncarte;i++) $(cont.carte[i].gui).removeClass("cardselected");
		$(".card").removeClass("cardselected");
		var cartaleft=parseInt($(this.cartadown).css("left"));				//la carta che sto spostando

		//lavoro con il bordo sinistro della carta.
		//se è più a sinistra della prima carta vede se può andare prima della prima, 
		//altrimenti sceglie di mattersi a destra dalla prima che si trova a sinistra.
		//misura la distanza, e se è molto maggiore del deltax del contenitore 
		//allora si mette a sinistra della carta successiva (se esiste)

		
		
		for (var i=indexrow;i<indexrow+ncarte;i++) {
			if(cont.carte[i].left>cartaleft) break;
		} //trova prima carta successiva
		if (i==indexrow) return this.checkcarta(cont,i,SINISTRA,esegui);				//era prima della prima
		if (i==indexrow+ncarte) return this.checkcarta(cont,i-1,DESTRA,esegui);    //era oltre l'ultima
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
			if (carta.gruppo==scala.giocatore) scala.fscartigiocatore=true;
			var posizione=this.rimuovicarta(carta);
			scala.vismoved(carta);
			if ((carta.gruppo==scala.campotris)&&(posizione<indice)) indice--;  //se ho tolto una carta prima dell'indice'
			carta.ntris=cartasel.ntris;
			carta.tipotris=cartasel.tipotris;
			carta.faceUp=true;
			cont.carte.splice(indice,0,carta);
			carta.gruppo=cont;
			//this.render();
			$(cartasel.gui).removeClass("cardselected");
			scala.checkvinto();
		}
	},
	vismoved:function(carta){
		gruppo=carta.gruppo
		if (gruppo==scala.giocatore) {$(carta.gui).addClass("cardmoved"); return;}
		if ((gruppo==scala.avversario1)||(gruppo==scala.avversario2)||(gruppo==scala.avversario3))  $(carta.gui).addClass("cardmovedavv");
	},
	//elimina eventuali buchi nella numerazione dei tris  (max 1)
	verificanumerotris:function(){
		var ntris=-1; 
		cont=scala.campotris.carte;
		for (var i=0;i<cont.length;i++){
			if (cont[i].ntris!=ntris) ntris++;
			if (cont[i].ntris!=ntris) {
				for (;i<cont.length;i++){
					cont[i].ntris--
				}
				return
			}
		}
	},


	rimuovicarta:function(carta){
		var cont=carta.gruppo.carte;
		var posizione=cont.indexOf(carta);
        cont.splice(posizione,1);
 		return posizione;
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

   
	mostradialogo:function(dialogo){
			$(dialogo).show();
			
			$("#schermo").css({"width":$(window).width()/zm});
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
    	//if (!scala.fautosort) return (scala.recupera(divCard.card.shortName));
    	if  (divCard.card.gruppo==scala.campotris) {
			//var carta=divCard.card;
			this.pushstato();

			scala.splittatris(divCard.card);
			scala.render();
    	} 
    },

    splittatris:function (carta){
    		var cont=scala.campotris.carte;
			var id=carta.id; 											//posizione=cont.indexOf(carta);
    		//splitta il tris a cui appartiene la carta in due parti
    		var iniziotris=0;ntris=carta.ntris;ltris=0;posizione=0;posizionecarta=0;
    		for (i=0;i<cont.length;i++){
				if (cont[i].ntris==ntris){
					if (ltris==0) iniziotris=i;
					if (cont[i].id==id) {posizione=i;posizionecarta=i;}
					ltris++
				}
    		}

    		//log ("posizione: "+posizione+", iniziotris: "+iniziotris+" lunghezzatris: "+ ltris +" numerotris: "+ntris)

    		//se è un tris di 4 carte con lo stesso numero estrae solo la carta selezionata

    		if ((ltris==4)&&(carta.tipotris==TRIS)){
    			cont.splice(posizione,1);
    			cont.splice(iniziotris,0,carta);
    			posizione=iniziotris+1;
    			posizionecarta=iniziotris;
    		}
    		
    		else if (posizione==iniziotris) posizione++   //non c'è niente da splittare. allora parto dalla seconda
    		
    		/*if ((posizione-iniziotris)<3){	                   //le carte a sinistra non bastano per un tris
    			for (i=iniziotris;i<posizione;i++){
    				cont[i].split=true;
    			}
			}
			if ((iniziotris+ltris-posizione)<3){				//le carte a destra non bastano per un tris
    			for (i=posizione;i<iniziotris+ltris;i++){
    				cont[i].split=true;
    			}
			} */
			for (i=posizione;i<cont.length;i++){
				cont[i].ntris++;
			}
			return posizionecarta;
    	
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
        if (toggle=="faceUp") {
        	carta.faceUp=true;
        }
        if (toggle=="faceDown") carta.faceUp=false;
        this.showcard(carta);
        carta.gruppo=destinazione;
        destinazione.carte.push(carta);
        // this.render();                 //*****************attivare par dare le carte una alla volta
        return carta;

    },

	scartatrisgiocatore:function(){
			//if (this.carteselezionate.length==this.giocatore.carte.length) scala.myalert("non è possibile rimanere senza carte");
			//else {
				this.scartatris(this.carteselezionate);
				
			//}
            this.carteselezionate=[];
            this.render();
            scala.checkvinto();

            return;
	},

    
	checkvinto:function(){
		if (scala.giocatore.carte.length!=0) return false;
		if (!(scala.checksplit())){
			window.setTimeout(function(){tada.play();scala.mydialog("haivinto",scala.nuovo)},1000)
		}

	},


      scartatris:function(tris){
        var ncarte=tris.length;
        if (ncarte<3) return;
        
        var gruppo=tris[0].gruppo.carte;
		var gruppotris=this.campotris;
        
        var ntris=0;
        if (gruppotris.carte.length!=0) ntris=gruppotris.carte[gruppotris.carte.length-1].ntris+1;

        this.pushstato();
        if (tris[0].gruppo==scala.giocatore)scala.fscartigiocatore=true;
		this.checktris(tris,SORTED);
		for(var i=0;i<ncarte;i++){
			var carta=tris[i];
			carta.ntris=ntris;
			$(carta.gui).removeClass("cardselected");
			carta.selected=false;

			scala.vismoved(carta);

			this.muovicarta(carta,gruppotris,"faceUp");
		}
		scartatris.play();

        return;
    },

  
 

    
    render:function(){

		if (this.cartescoperte) this.displaypunti(this.calcolapunti(this.avversario1.carte),"avversario1");
		else this.displaypunti(0,"puntiavversario1");
		//this.displaypunti(this.calcolapuntitris(this.trisavversario1.carte),"trisavversario1");

		if (this.numeroavversari>1){
			if (this.cartescoperte) this.displaypunti(this.calcolapunti(this.avversario2.carte),"avversario2");
			else this.displaypunti(0,"puntiavversario2");
			//this.displaypunti(this.calcolapuntitris(this.trisavversario2.carte),"trisavversario2");
		}

		if (this.numeroavversari>2){
			if (this.cartescoperte) this.displaypunti(this.calcolapunti(this.avversario3.carte),"avversario3");
			else this.displaypunti(0,"puntiavversario3");
			//this.displaypunti(this.calcolapuntitris(this.trisavversario3.carte),"trisavversario3");
		}
		

		this.displaypunti(this.calcolapunti(this.giocatore.carte),"giocatore");
		//this.displaypunti(this.calcolapuntitris(this.trisgiocatore.carte),"trisgiocatore");
		this.displaypunti(this.totaleavversario1,"totaleavversario1");
		if (this.numeroavversari>1) this.displaypunti(this.totaleavversario2,"totaleavversario2");
		if (this.numeroavversari>2)this.displaypunti(this.totaleavversario3,"totaleavversario3");
		this.displaypunti(this.totalegiocatore,"totalegiocatore");
		this.displaypunti(this.totalelimite,"totalelimite");
		this.displaypunti(this.totalepartite,"totalepartite");

    	
        $(".card").removeClass("cardsplit");


        this.rendicontenitore(this.mazzo);
        this.rendicontenitore(this.scarti);
        this.rendicontenitore(this.giocatore);
        
        this.verificanumerotris();  //elimina eventuali buchi nella numerazione dei tris
		this.checksplit();
        this.rendicontenitore(this.campotris);
		
		for (var j=0;j<this.numeroavversari;j++){
			this.rendicontenitore(this.campiavversario[j]);
			//this.rendicontenitore(this.campitrisavversario[j]);
		}

        if (!this.pescato) $("#giocatore").css({"border-color":"yellow" });
        else $("#giocatore").css({"border-color":"grey" });
		if (this.turno==-1) $("#etgiocatore").css({"color":"yellow"});
		else $("#etgiocatore").css({"color":"#888888"});
		for (var j=0;j<this.numeroavversari;j++) {
			if (j==this.turno) $("#etavversario"+scala.etichette[j]).css({"color":"yellow"});
        	else $("#etavversario"+scala.etichette[j]).css({"color":"#888888"});
		}
		if (scala.fscartigiocatore) $("#etgiocatore").css({"color":"red"});
    },
    

    checksplit:function(){
    	var cont=this.campotris.carte;
    	var trovatosplit=false;
    	if (cont.length==0) return;
    	var ntris=0;cartetris=0;
    	for (var i=0;i<cont.length;i++){
    		cont[i].split=false;
    		if (cont[i].ntris==ntris){
    			cartetris++;
    		}
    		else {
    			if (cartetris<3){
    				for (var j=i-cartetris;j<i;j++) 
    					cont[j].split=true;
    					trovatosplit=true;
    			}
    			cartetris=1;
    			ntris++;
    		}
    	}
    	if (cartetris<3) {
    		trovatosplit=true;
    		for (var j=i-cartetris;j<i;j++) cont[j].split=true;
    	}  //per l'ultimo tris'
    	return trovatosplit;
    },
    
    rendicontenitore:function(cont,speed){
    	var velocita=speed||400;
        var newtop,newleft,carta;
        var contatris=0;contarow=0;cartetris=0;offseti=0;offsettris=0;
        for (var i=0;i<cont.carte.length;i++){
            carta=cont.carte[i];
            newleft=cont.left+cont.offsetx+Math.floor((i-offseti)*cont.deltax)+cont.xtris*(carta.ntris-offsettris);
            if (carta.ntris!=contatris){  //è un nuovo tris, se non ci sta salto alla riga successiva
            	contatris++;
            	//conto di quante carte è formato il trisdata
            	cartetris=0;
            	for (var j=i;j<cont.carte.length;j++){
            		if (cont.carte[j].ntris!=carta.ntris) break;
            		cartetris++;
            	}
            	var limitex=1000;
            	if (carta.rowtris==contarow) limitex=1250;  //favorisco il permanere di un tris sulla sua riga precedente
            	if ((newleft+cont.deltax*cartetris)>limitex){  //se sborda salto alla riga successiva
            		contarow++;
            		offseti=i;
            		offsettris=carta.ntris;
            		newleft=cont.left+cont.offsetx+Math.floor((i-offseti)*cont.deltax)+cont.xtris*(carta.ntris-offsettris);

            	}
            	
            }
            newtop=cont.top+cont.offsety+Math.floor(i*cont.deltay)+contarow*110;

            carta.top=newtop;
            carta.left=newleft;
            carta.zindex=i;
            carta.rowtris=contarow;

            if (carta.split) $(carta.gui).addClass("cardsplit");;
            $(carta.gui).css({transform:("rotate("+cont.rotated+"deg)")})
            $(carta.gui).animate({"top":newtop,"left":newleft,"z-index":i},velocita);
			this.showcard(carta);        

        }
    },
 

    /* rendicontenitore:function(cont,speed){
    	var velocita=speed||400;
        var newtop,newleft,carta;
        for (var i=0;i<cont.carte.length;i++){
            carta=cont.carte[i];
            newtop=cont.top+cont.offsety+Math.floor(i*cont.deltay);
            newleft=cont.left+cont.offsetx+Math.floor(i*cont.deltax)+cont.xtris*carta.ntris;
            carta.top=newtop;
            carta.left=newleft;
            carta.zindex=i;
            $(carta.gui).css({transform:("rotate("+cont.rotated+"deg)")})
            $(carta.gui).animate({"top":newtop,"left":newleft,"z-index":i},velocita);
			this.showcard(carta);        

        }
    },    */   



  
    cartapesca:function(){

		var annulla40=(function(){
			while (scala.checksplit()) scala.undo();
			scala.hidedialog();
		})


    	
    	if (scala.checksplit()) {
    		ding.play();
    		this.mydialog("oltre40",annulla40);
	   		return;
    	}
		$(".card").removeClass("cardmoved");
		$(".card").removeClass("cardmovedavv");
    	if (this.turno!=-1) return;
    	//this.fscartipesca=false;
		this.pushstato();
        if (!scala.fscartigiocatore) {
        	this.muovicarta(this.mazzo,this.giocatore,"faceUp");
        	$(this.giocatore.carte[this.giocatore.carte.length-1].gui).addClass("cardmoved");
			pesca.play();
        }
 		else tick.play();
 		
		scala.fscartigiocatore=false;
	   	for (i=0; i<this.carteselezionate.length;i++) {      //cancella selezioni
			this.carteselezionate[i].selected=false;
		}
		$(".card").removeClass("cardselected");
		
        this.pescato=true;
        if (scala.fautosort) scala.ordinacarte(scala.giocatore);
        this.render();

        window.setTimeout(function(){scala.mossaavversario(0)},1000);   

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
    
    checktris:function (carte,nosort){  //nosort parametro opzionale  
        var ncarte=carte.length; 
        if (ncarte<3) {

        	if (ncarte!=2) return false;
			//verifica se è una coppia accettabile
			if (carte[0].numero==carte[1].numero){
				if (carte[0].seme==carte[1].seme) return false
				this.trisdata.tipotris=TRIS;
				return true;
			}
        	
        }
        if (ncarte>15) return false;
        
        

  
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
        	if (oltrekappa&&(primonumero==4)) {trovatotris = false; break} //il 4 oltre il kappa non si mette
            if (primonumero==14) {primonumero=1,oltrekappa=true};   //dopo il K viene l'asse
            if (carte[i].numero!=primonumero) {trovatotris = false; break}
            if (carte[i].seme!=primoseme) {trovatotris = false; break}
            if (primonumero==13) {primonumero=0,oltrekappa=true};   //dopo il K viene l'asse
        }
         if (trovatotris) {
         	//if (primonumero<3) primonumero+=13;
         	this.trisdata.primonumero=carte[0].numero;
         	for (var j=0;j<ncarte;j++) {carte[j].tipotris=SCALA};  
         	this.trisdata.tipotris=SCALA;
         	this.trisdata.semescala=primoseme;      	
            return true;
		}
        return false;

       
    },
        
    selezionacarta:function(divCard){
    	$(divCard).removeClass("cardmoved");
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
        //if (this.numeroavversari>2) {stepx=-52,stepy=-70,bsx=903,bsy=280}
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
        if((ev.pageX/zm)<minx) return false;
        if((ev.pageX/zm)>maxx) return false;
        if((ev.pageY/zm<miny)) return false;
        if((ev.pageY/zm>maxy)) return false;
        return true;
    },
  
    /*tgon:function(ev){
        $("#trisgiocatore").css({"border-color": "yellow"});        
    },
    tgoff:function(ev){
        $("#trisgiocatore").css({"border-color": "gray"});        
    },*/
    
	taon:function(avv){
		$("#campotris"+(avv)).css({"border-color": "yellow"});        
    },
    taoff:function(avv){
        $("#campotris"+(avv)).css({"border-color": "gray"});        
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
		if (!this.pescato) this.undo();
		while(this.pescato) {	this.undo();}
		$(".card").removeClass("cardselected")
		$(".card").removeClass("cardmoved")
		$(".card").removeClass("cardmovedavv")
    },



	undo:function(){
		this.jollymodificabili=[];
    	this.popstato();
        this.render();
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
		/*
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

		*/
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
			//if (carta.numero>49) return true; //non esamina il jolly e non lo fa esaminare al buffer successivo (ret true)
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
					if ((scala.trisdata.primonumero==1)&&(tris.length<4)&&(carta.numero==13)) return salvacarta(ultimacartatris+1-tris.length);//k davanti a 123
					var prossimacarta =scala.trisdata.primonumero+tris.length;
					if (prossimacarta>=14) {
						prossimacarta-=13;
						if (carta.numero>3) continue;   //dopo il K non posso mettere oltre il 3
					}
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
			checkattaccabili(this.campotris,cont[i]);
			/*	for (var j=0;j<scala.numerocampitris;j++) {
					if (checkattaccabili(this.campitrisavversario[j],cont[i])) break;
				}  */
			

			
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
			checkattaccabili(this.campotris,cont[i]);
				/*for (var j=0;j<scala.numeroavversari;j++) {
					if (checkattaccabili(this.campitrisavversario[j],cont[i])) break;
				}*/

			
		}
		return;
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
		var stringone="coppie: ";
		for (var i=0;i<this.coppie.length;i++){
			stringone+=(this.coppie[i].carta1.shortName+ "-"+this.coppie[i].carta2.shortName+" ("+this.coppie[i].punticonjolly+"),  ")
		}
		log(stringone);
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




    mossaavversario:function(){
    	if (scala.checkvinto()) return
    	if (scala.giocatore.carte.length==0) return;
    	scala.astato=0;
   		return scala.alavorastato();
    },


	alavorastato:function(){
		scala.ritardo=1000;

		switch (scala.astato){
			case 0:  //solo alla prima entrata del primo avversario;
				scala.turno=0; //primo avversario;
				scala.astato="nextavv";
			
			case "nextavv":  //rientro per un nuovo avversario
				

				scala.numcarte= scala.campiavversario[scala.turno].carte.length  //per vedere se alla fine si sono riodotte
				scala.numcarteloop=scala.numcarte;   //setve per ripetere fino a che si è depositato tutto
				if (scala.numcarte==0) {   //se un giocatore ha già vinto (senza carte) passa al successivo 
					scala.astato="next2";
					scala.ritardo=10;
					break;
				}
				scala.astato ="compatta"
			
			case "compatta":
				if (scala.compattascale()) break;
				scala.astato="tris";
				if (longstep) break;//
			case "tris":
				if (scala.alavoratris(scala.turno)) break;
				scala.astato="cpqrt";
				if (longstep) break;//

			case "cpqrt":    //cerca di completare coppie con quartine

				if (scala.alavoracpqrt(scala.turno)) break;
				scala.astato="cpscl";
				if (longstep) break;//
			case "cpscl":    //cerca di completare coppie con carte derivate da scale lunghe

				if (scala.alavoracpscale(scala.turno)) break;
				scala.astato="attacca";
				if (longstep) break;//
			case "attacca":

				if (scala.alavoraattaccabili(scala.turno)) break;
				scala.astato="magic";
				if (longstep) break;//
			case "magic":
				if (scala.magic(scala.turno)) break;
				scala.astato="next";

				if (longstep) break;//
			case "next":    //passa al prossimo avversario;
				var ncarte=scala.campiavversario[scala.turno].carte.length;
				if (ncarte==0) {
					window.setTimeout(function(){haiperso.play();scala.mydialog("haiperso",scala.nuovo,scala.testfine)},500);

					return;
				} 
				if (scala.numcarte==ncarte) {   //pesca solo se non ha posizionato carte
   					pesca.play();
        			if (scala.mazzo.carte.length!=0) scala.muovicarta(scala.mazzo,scala.campiavversario[scala.turno],"faceDown");   
       			}
				else {
					
					if (scala.numcarteloop==ncarte) tick.play();
					else{
						scala.astato="cpqrt";
						scala.ritardp=10; //fa acpettare solo 10 ms
						scala.numcarteloop=ncarte;  //ripete da cpqrt fino a che non resta
						break;															     //niente da attaccare
					}	
				}

			case "next2":  //prosegue da next	
				
				$(".card").removeClass("cardjoined")

				if (scala.turno<(scala.numeroavversari-1))  {
					scala.turno++;		//passa al prossimo avversario
					scala.astato="nextavv";
				}
        		else scala.astato="exit";
        		break;
        	
        	case "exit":

				scala.turno=-1;  //torna  al giocatore
				scala.pescato=false;
				scala.fscartigiocatore=false;
				scala.carteselezionate=[];
				scala.render();
				//scala.pushstato();
				return;
				break;

			default: 
				log("errore switch")
				scala.turno=-1;  //passa al giocatore
				return
		}
		scala.render();
		window.setTimeout(scala.alavorastato,scala.ritardo)
	},

	

	testfine:function(avv){
		if((scala.campiavversario[0].carte.length==0)&&(scala.campiavversario[1].carte.length==0)&&(scala.campiavversario[2].carte.length==0))
			scala.nuovo();   //hanno finito tutti i giocatori
		else {
			scala.hidedialog();
			scala.astato="next2";    //passa al prossimo avversario
			scala.ritardo=10;
			scala.render();
			window.setTimeout(scala.alavorastato,scala.ritardo)


		}

	},
	

	//se ci sono frammenti di scale le collega insieme
	compattascale:function(){
		scala.mappatris();
		var map=scala.maptris;
		var cont=scala.campotris.carte;
		var ultima;
		var prima;
		for (var i=0;i<map.length;i++){
			if (map[i].tipotris==SCALA){
				//cerca una scala che si accodi;
				for (var j=0;j<map.length;j++){
					if ((i==j)||(map[j].tipotris!=SCALA)) continue;
					if (map[j].seme!=map[i].seme) continue;
					ultima= cont[map[i].posizione+map[i].ltris-1];
					prima= cont[map[j].posizione];
					if (ultima.numero+1!=prima.numero){
						//vedo se era un K e un asse
						if (ultima.numero!=13)continue;
						if (prima.numero!=1) continue;
						if (map[j].ltris!=3) continue;
					}
					if (cont[map[i].posizione].numero>ultima.numero) continue;    //il primo tris contiene un K
					if (map[i].ltris+map[j].ltris>15) continue;   //la lunghezza finale non deve eccedere 16

					//decremento il numero di tris a tutte le carte oltre il tris che estrarrò
					for (var k=map[j].posizione+map[j].ltris;k<cont.length;k++){
						cont[k].ntris--;
					}
					//estraggo il secondo tris
					var estratto=scala.campotris.carte.splice(map[j].posizione,map[j].ltris)
					//aggiungo il secondo tris in coda al primo

					var ntris=ultima.ntris;
					var posizione=map[i].posizione+map[i].ltris;
					if (map[j].posizione<map[i].posizione) posizione-=map[j].ltris;  //se tris estratto era prima dell'inserimento'
					
					for (var k=0;k<estratto.length;k++) {
						estratto[k].ntris=ntris;
						estratto[k].split=false;
						$(estratto[k].gui).addClass("cardjoined")
						scala.campotris.carte.splice(posizione+k,0,estratto[k]);
					}
					dindon.play();
					return true;
				}
			}
		}
		return false;
	
	},

	alavoratris:function(avv){
		scala.calcolatrispossibili(avv);
		//scala.ottimizzatris();
		if (scala.trispossibili.length==0) {
			return false;   //se non ci sono tris passa alla fase successiva
		}
		scala.scartatris(scala.trispossibili[0]);
		return true;
	},


	
	
	alavoraattaccabili: function(avv) {
		this.calcolacarteattaccabili(avv);
		var stringone="carte attaccabili"+avv+": ";
		for (var i=0;i<this.carteattaccabili.length;i++){
			stringone+=(this.carteattaccabili[i].carta.shortName+ ", ")
		}

	

		log(stringone);

		var temp;
		if (this.carteattaccabili.length>0){
			temp=this.carteattaccabili.pop();													
			temp.carta.faceUp=true;
			this.aggiungitris(temp.cont,temp.indice,temp.carta,temp.cartatris,ESEGUI);
			return true;
		}
		else {
			//prova a mettere la carta in mezzo a un tris lungo;
			scala.mappatris();
			var carta; var short;
			var campo=scala.campiavversario[avv].carte;
			var cartatris;
			var ntris;
			var ltris;
			var iniziotris;
			var seme
			for (var i=0;i<campo.length;i++){
				carta=campo[i];
				short=carta.shortName;
				seme=carta.seme;
				//vede se c'è una carta uguale in un tris lungo;
				for (var j=0;j<scala.campotris.carte.length;j++){
					cartatris=scala.campotris.carte[j];
					ntris=cartatris.ntris;
					ltris=scala.maptris[ntris].ltris;
					if (scala.maptris[ntris].tipotris!=SCALA) continue;
					iniziotris=scala.maptris[ntris].posizione;
					if (cartatris.seme!=seme) continue;
					var numerotris=cartatris.numero;
					
					if (j==iniziotris){  //inizio tris, vede se può attaccare con una carta intermedia;

						if (numerotris==2) continue;
						if((numerotris==1)&&(ltris>3)) continue;
					
						var numerointer=numerotris-1;
						if (numerointer==0) numerointer=13;
						if(numerotris<3) numerotris+=13;
						if ((numerotris-carta.numero)==2){
							var puntalog=scala.statostack.length;
							scala.pushstato();
							var carte={};
							if (scala.recupera(seme+numerointer,carte,"carta1","pos1")){

								$(carte.carta1.gui).addClass("cardjoined")
								$(cartatris.gui).addClass("cardjoined")

								scala.aggiungitris(scala.campotris,iniziotris,carte.carta1,cartatris,ESEGUI);
                				//se la carta tolta era prima della posizione di aggiunta tolgo 1 a poscartatris
                				if (carte.pos1<iniziotris) iniziotris--;
								scala.aggiungitris(scala.campotris,iniziotris,carta,cartatris,ESEGUI);
								return true;
							}
							while (scala.statostack.length>puntalog) scala.popstato();
						}

					}
					
					if (j==iniziotris+ltris-1){  //fine tris, vede se può attaccare con una carta intermedia;
					
						if (numerotris==2) continue;
						if((numerotris==3)&&(ltris>3)) continue;
						var numerointer=numerotris+1;
						if (numerointer==14) numerointer=1;
						if(numerotris>11) numerotris-=13;
						if ((carta.numero-numerotris)==2){
							var puntalog=scala.statostack.length;
							scala.pushstato();
							var carte={};
							if (scala.recupera(seme+numerointer,carte,"carta1","pos1")){

								$(carte.carta1.gui).addClass("cardjoined")
								$(cartatris.gui).addClass("cardjoined")

								scala.aggiungitris(scala.campotris,iniziotris+ltris,carte.carta1,cartatris,ESEGUI);
                				//se la carta tolta era prima della posizione di aggiunta tolgo 1 a poscartatris
                				if (carte.pos1<iniziotris) iniziotris--;
								scala.aggiungitris(scala.campotris,iniziotris+ltris+1,carta,cartatris,ESEGUI);

								return true;
							}
							while (scala.statostack.length>puntalog) scala.popstato();
						}


					}



					if (cartatris.shortName==short){
						if (cartatris.tipotris!=SCALA) continue;
						if (ltris<5) continue;
						if ((j-iniziotris)<2) continue;
						if ((iniziotris+ltris-j)<3) continue;
						scala.splittatris(cartatris);
						scala.aggiungitris(scala.campotris,j,carta,scala.campotris.carte[j-1],ESEGUI);
						return true;
					}
				}
			}
		}

		return false;
	},

	alavoracpscale: function(avv) { //cerca di completare coppie con scale lunghe
		this.cancellapuntietris(avv);
		this.cercacoppie(avv);
		

		var cont=scala.campotris.carte;
		if (cont.length==0) return false;
		
		var ntris=0;
		var iniziotris=0;
		var ltris=0;
		var carta;
		var coppia;
		var cartatris;
		var posizione;

		for (var i=0; i<cont.length;i++){
			carta=cont[i];
			
			if ((carta.ntris==ntris)&&(i<cont.length-1)) {
				ltris++;
				if (carta.tipotris==TRIS) ltris=0;
			}
			else {
				if (i==cont.length-1) ltris++;
				if (ltris>=4) {  //vedo se posso recuperare gli estremi
					//provo con l'inizio
					var inizio=true;
					cartatris=cont[iniziotris];
					if (cartatris.numero<3) {coppia==-1;break}
					coppia=scala.checkcoppia(cartatris);
					//e provo con la fine
					if (coppia==-1) {
						inizio=false;
						cartatris=cont[iniziotris+ltris-1];
						if (cartatris.numero<4) {coppia==-1;break}
						coppia=scala.checkcoppia(cartatris);
					}
					if (coppia!=-1) {
						
						var posizione=cont.indexOf(cartatris);
						if((inizio&&coppia.posizionecarta==SINISTRA)
						||(!inizio&&coppia.posizionecarta==DESTRA)
						||(coppia.posizionejolly==1)
						||((!inizio) && coppia.posizionecarta==SINISTRA && coppia.carta1.numero==3)
						||((inizio) && coppia.posizionecarta==DESTRA && coppia.carta2.numero==13)
						||(coppia.tipotris==TRIS)) scala.splittatris(cartatris);	//isola la carta dal tris che viene messa nella posizione di inizio tris
						cartatris.tipotris=coppia.tipotris;
						this.aggiungitris(scala.campotris,posizione+coppia.posizione1,coppia.carta1,cartatris,ESEGUI);
						this.aggiungitris(scala.campotris,posizione+coppia.posizione2,coppia.carta2,cartatris,ESEGUI);
						return true;
					} 
					else {
						if (ltris>=5){
							//vedo se posso usare una carta centrale per una coppia o per attaccare una carta
							// solo per lo split sulla terza carta vedo se posso attaccare a destra della seconda
							for (var w=iniziotris+2;w<iniziotris+ltris-1;w++){   //w è il punto di split
								// solo per lo split sulla terza carta vedo se posso attaccare a destra della seconda
								if (w==iniziotris+2) {
									cartatris=cont[w-1]
									coppia=scala.checkcoppia(cartatris);
									if ((coppia!=-1)&&(coppia.tipotris==SCALA)&&(coppia.posizionecarta==SINISTRA)){
										scala.splittatris(cont[w]);
										posizione=w-1;
										this.aggiungitris(scala.campotris,posizione+coppia.posizione1,coppia.carta1,cartatris,ESEGUI);
										this.aggiungitris(scala.campotris,posizione+coppia.posizione2,coppia.carta2,cartatris,ESEGUI);
										return true;

									}
									else continue;
									/*else{   //verifico se una carta dell'avversario si attacca a sinistra
										var cardavv;
										cartatest=cont[w].shortName; //deve aggiungere una carta uguale alla successiva
										//if (cartatris.numero==13) numerotest=0;
										for (var x=0;x<scala.campiavversario[avv].length;x++){
											cardavv=scala.campiavversario[avv][x];
											if (cardavv.shortName==cartatest){
												scala.splittatris(cont[w]);
												this.aggiungitris(scala.campotris,w,cardavv,cartatris,ESEGUI);
												return true;
											}
										}
									}*/
								} //if (w==iniziotris+2) 
								//per tutte verifico se posso usare la carta a destra

								cartatris=cont[w];
								coppia=scala.checkcoppia(cartatris);
								if (coppia!=-1) {
									if((!(((w>=(iniziotris+ltris-3))||(w<(iniziotris+3)))&&((coppia.posizionejolly==1)||(coppia.tipotris==TRIS))))   //non posso isolare la carta
										&&(coppia.posizionecarta==DESTRA)) {   //   e devo attaccare a destra
										
										scala.splittatris(cont[w]);
										if ((coppia.posizionejolly==1)||(coppia.tipotris==TRIS)) scala.splittatris(cont[w+1]);
										this.aggiungitris(scala.campotris,w+coppia.posizione1,coppia.carta1,cartatris,ESEGUI);
										this.aggiungitris(scala.campotris,w+coppia.posizione2,coppia.carta2,cartatris,ESEGUI);
										return true;
									}
								} //if (coppia!=-1) 
								//verifico se una carta dell'avversario si attacca a sinistra o a destra
								var cardavv;
								
								//if (cartatris.numero==13) numerotest=0;
								for (var x=0;x<scala.campiavversario[avv].carte.length;x++){
									cardavv=scala.campiavversario[avv].carte[x];
									if ((w!=iniziotris+ltris-2)&&(cardavv.shortName==cont[w].shortName)){ //si attacca a sinistra
										scala.splittatris(cont[w]);
										this.aggiungitris(scala.campotris,w,cardavv,cont[w-1],ESEGUI);
										return true;
									}
									if ((w!=iniziotris+2)&&(cardavv.shortName==cont[w-1].shortName)) { //si attacca a destra
										scala.splittatris(cont[w]);
										this.aggiungitris(scala.campotris,w,cardavv,cont[w],ESEGUI);
										return true;

									}
								}


							}
						}
					} //if (ltris>=5)

				} //if (ltris>=4)
				ntris=carta.ntris;
				iniziotris=i;
				ltris=1;
				continue;   //superfluo...
			}

			
		
		}


	},

	//verifica se la carta serve a completare la coppia.
	//mette in carta.posizione1/2 le posizioni di inserimento
	//ritorna il numero di coppia oppure -1
	checkcoppia: function(carta) {
		if (scala.coppie.length==0) return -1;
		var numero=carta.numero;
		var seme=carta.seme;
		var cercanumero;
		for (var z=0; z<scala.coppie.length;z++){
			var coppia=scala.coppie[z];
			if (coppia.tipotris==TRIS){
				coppia.posizionecarta=CENTRO;
				coppia.posizione1=1;coppia.posizione2=2;
				if ((seme!=coppia.carta1.seme)&&(seme!=coppia.carta2.seme)&&(numero==coppia.carta1.numero)) return coppia;
				continue;
			}
			else {  //coppia tipo SCALA
				if (coppia.carta1.seme!= seme) continue;
				//se posizionejolly=1 la coppia ha un buco in mezzo
				if (coppia.posizionejolly==1) {
					coppia.posizione1=0;coppia.posizione2=2;
					coppia.posizionecarta=CENTRO;
					cercanumero=coppia.carta1.numero+1;
					if (cercanumero==14) cercanumero=1;
					if (numero==cercanumero) return coppia;
					continue;
				}
				//verifica se va prima della prima carta
				coppia.posizione1=1;coppia.posizione2=2;
				coppia.posizionecarta=SINISTRA;
				if (numero==coppia.carta1.numero-1) return coppia;
				if ((coppia.carta1.numero==1)&&(numero==13)) return coppia;
				//verifica se va dopo la seconda carta
				coppia.posizione1=0;coppia.posizione2=1;
				coppia.posizionecarta=DESTRA;
				if (numero==coppia.carta2.numero+1) return coppia;
				if ((coppia.carta1.numero==13)&&(numero==1)) return coppia;
				continue;

			}
		}
		return -1;
	},

 	alavoracpqrt: function(avv) { //cerca di completare coppie con quartine

		this.cancellapuntietris(avv);
		this.cercacoppie(avv);
		this.cercaquartine(avv);

		if (scala.quartine.length==0) return false;
		for (var i=0; i<this.coppie.length;i++){
			var coppia=this.coppie[i];
			if (coppia.tipotris==TRIS){
				//se è una coppia da TRIS vede se c'è una quartina corrispondente
				var numero=coppia.carta1.numero;
				for (var j=0; j<scala.quartine.length;j++){
					if (numero==scala.quartine[j].numero){
						//trovata. Scelgo una carta con seme diverso dalla coppia
						var posizione=scala.quartine[j].pos;
						for (var k=posizione; k<posizione+4;k++){
							cartatris=scala.campotris.carte[k];
							if ((cartatris.seme!=coppia.carta1.seme)&&(cartatris.seme!=coppia.carta2.seme)) break;
						}
						//trovata la carta
						scala.splittatris(cartatris);	//isola la carta dal tris che viene messa nella posizione di inizio tris
						cartatris.tipotris=coppia.tipotris;    //probabilmente superfluo
						$(cartatris.gui).addClass("cardjoined")
						this.aggiungitris(scala.campotris,posizione+1,coppia.carta1,cartatris,ESEGUI);
						this.aggiungitris(scala.campotris,posizione+2,coppia.carta2,cartatris,ESEGUI);
						return true;												
					}
				}
			}
			else {
				//coppia tipo SCALA
				//se posizionejolly=1 la coppia ha un buco in mezzo
				var quartina;
				var cercanumero;
				var posizionea=0;
				var posizioneb=2;
				if (coppia.posizionejolly==1) {
					cercanumero=coppia.carta1.numero+1;
					if (cercanumero==14) cercanumero=1;
					quartina=scala.cercaquartina(cercanumero);
					if (quartina==-1) continue  //passa alla prossima coppia
				}
				//è una coppia normale
				else {
					posizionea=1;posizioneb=2;
					cercanumero=coppia.carta1.numero-1;
					if (cercanumero==0) cercanumero=13;    //mcerca il K prima dell'asse
					quartina=scala.cercaquartina(cercanumero);
					if (quartina==-1) {
						posizionea=0;posizioneb=1;
						cercanumero=coppia.carta2.numero+1;
						if (cercanumero==14) cercanumero=1;
						quartina=scala.cercaquartina(cercanumero);
						if (quartina==-1) continue  //passa alla prossima coppia
					} 
				}
				//trovata. Scelgo una carta con seme uguale alla coppia
				var posizione=scala.quartine[quartina].pos;
				for (var k=posizione; k<posizione+4;k++){
					cartatris=scala.campotris.carte[k];
					if ((cartatris.seme==coppia.carta1.seme)) break;
				}
				//trovata la carta
				scala.splittatris(cartatris);	//isola la carta dal tris che viene messa nella posizione di inizio tris
				cartatris.tipotris=coppia.tipotris; 
				$(cartatris.gui).addClass("cardjoined")
				this.aggiungitris(scala.campotris,posizione+posizionea,coppia.carta1,cartatris,ESEGUI);
				this.aggiungitris(scala.campotris,posizione+posizioneb,coppia.carta2,cartatris,ESEGUI);
				return true;												
			}


		}

		return false;

 	},

	cercaquartina: function(numero) {
		for (var j=0; j<scala.quartine.length;j++){
			if (numero==scala.quartine[j].numero) return j;
		}
		return -1;
	},

	cercaquartine: function(avv) {
		scala.quartine=[];
		cont=scala.campotris.carte;
		var ltris=0;ntris=0;
		var carta;
		for (var i=0; i<cont.length;i++){
			carta=cont[i];
			if (carta.ntris!=ntris){
				ntris=carta.ntris;
				ltris=0;
			}
			if (carta.tipotris==TRIS){
				ltris++;
				if (ltris==4) {
					scala.quartine.push({numero:carta.numero, pos:i-3,ntris:ntris});
				}
			}
		}
		var stringone="quartine: ";
		for (var i=0;i<scala.quartine.length;i++){
			stringone+=(" numero: "+this.quartine[i].numero+ " pos: "+this.quartine[i].pos+ " ntris: "+this.quartine[i].ntris)
		}
		log(stringone);

	},





    alavora2:function(avv){
   		this.ordinacarte(this.campiavversario[avv]);
   		this.cancellapuntietris(avv);
   		if (this.campiavversario[avv].carte.length>3){
    		this.calcolatrispossibili(avv);
	   		this.ottimizzatris();
	   		this.cercacoppie(avv);
			this.ottimizzacoppie();

	   		//if (!this.f40avversario[avv]) this.verifica40(avv);
	   		this.f40avversario[avv]=true;
			while ((this.f40avversario[avv])&&(this.trispossibili.length>0)){
					if (this.trispossibili[0].length==this.campiavversario[avv].carte.length) this.trispossibili[0].splice(0,1);
					this.scartatris(this.trispossibili[0]);
					this.cancellapuntietris(avv);
					this.calcolatrispossibili(avv);
					this.ottimizzatris();

			this.cercacoppie(avv);
			this.ottimizzacoppie();
			}
		
  			
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

		this.gestisciattaccabili(avv); //ripeto nel caso il tris con jolly potesser avere carte attaccabili



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


     
    ascarta:function(avv){

   		//scarta.play();
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
   		    	
		//this.muovicarta(this.campiavversario[avv].carte[indiceminimo],this.scarti,"faceUp");
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


     autosort:function(){
       if (this.fautosort) {
			this.fautosort=false;
			$("#autosort").css({"border-color":"#888888"});
       } 
       else{
       		this.fautosort=true;
       		$("#autosort").css({"border-color":"yellow"});
       		scala.sort();

       }
       
    }, 
    sort:function(){
       scala.ordinacarte(scala.giocatore); 
       scala.render();
       ordina.play();
    	
 	},

}  //scala


$(document) .ready(function () {

    scala.start();
    scala.collegaeventi();
});

 
