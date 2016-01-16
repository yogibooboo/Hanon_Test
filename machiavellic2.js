scala.frecupera= false;
scala.maptris=[];
scala.numerosplit=0;
scala.cartatris=0;
scala.recstack=0;    //decide il livello più profondo di stack accettabile
var LIMRECSTACK=3;   //valore limite

scala.magic=(function(avv) {
    
    
    var provacoppia=(function(carta1,carta2,poscarta2,poscartatris,tipotris,ritorno){ 
        var carte={c1:carta1,c2:carta2}

        var prima=1,seconda=2;
        if (ritorno==true) {carte={c1:carta2,c2:carta1};prima=2;seconda=1}
        
        var puntalog=scala.statostack.length;
        // scala.pushstato("inizio magic");   //non serve?
        scala.recstack=0;  

        if (scala.recupera(carte.c1,carte,"carta"+prima,"pos"+prima)){
            if (scala.recupera(carte.c2,carte,"carta"+seconda,"pos"+seconda)){
                scala.render();
                carte.carta1.tipotris=tipotris;

                //ding.play();
                suona(ding);

                $(carte.carta1.gui).addClass("cardjoined")
                $(carte.carta2.gui).addClass("cardjoined")
                carte.pos1=scala.campotris.carte.indexOf(carte.carta1)  //per essere sicuri della attuale localizzazione
                carte.pos2=scala.campotris.carte.indexOf(carte.carta2)
                scala.attaccaquick(carte.pos1+poscarta2,carte.carta2,carte.carta1);
                //scala.aggiungitris(scala.campotris,carte.pos1+poscarta2,carte.carta2,carte.carta1,ESEGUI);  //aggiunge seconda carta della coppia
                //se la carta tolta era prima della posizione di aggiunta tolgo 1 a poscartatris
                if (carte.pos2<carte.pos1) poscartatris--;
                scala.attaccaquick(carte.pos1+poscartatris,scala.cartatris,carte.carta1);
                //scala.aggiungitris(scala.campotris,carte.pos1+poscartatris,scala.cartatris,carte.carta1,ESEGUI);     //aggiunge carta da avversario
                scala.render();
                return true;
            }
        }
        scala.recuperastack(puntalog);
        
        if (!(ritorno==true)){
            if (!(provacoppia(carta2,carta1,poscarta2,poscartatris,tipotris,true))) return false;
            return true;
        }

    })    

    var cercatris=(function(){

        //cerca di formare un tris. 
        //ha accesso a  cartatris;ctrisshort;ctrisseme;ctrisnumero;
        var semi=["C","Q","F","P"];
        for (var j=0;j<4;j++) {
            if (semi[j]==ctrisseme) {
                semi.splice(j,1);
                break;
            }
            
        }
        if (provacoppia(semi[0]+ctrisnumero,semi[1]+ctrisnumero,1,2,TRIS)) return true;
        if (provacoppia(semi[1]+ctrisnumero,semi[2]+ctrisnumero,1,2,TRIS)) return true;
        if (provacoppia(semi[0]+ctrisnumero,semi[2]+ctrisnumero,1,2,TRIS)) return true;
        return false;
    })


    var cercascala=(function(){
        //ha accesso a  cartatris;ctrisshort;ctrisseme;ctrisnumero;
        var ctrisnum=parseInt(ctrisnumero);
        var cm1=-1+ctrisnum; if (cm1<1) cm1+=13;
        var cm2=-2+ctrisnum; if (cm2<1) cm2+=13;
        var cp1=1+ctrisnum; if (cp1>13) cp1-=13;
        var cp2=2+ctrisnum; if (cp2>13) cp2-=13;
        if (provacoppia(ctrisseme+cm2,ctrisseme+cm1,1,2,SCALA)) return true;
        if (provacoppia(ctrisseme+cm1,ctrisseme+cp1,1,1,SCALA)) return true;
        if (provacoppia(ctrisseme+cp1,ctrisseme+cp2,1,0,SCALA)) return true;
        return false;
    })

	var lavoracoppie=(function(avv){

		scala.cancellapuntietris(avv);
		scala.cercacoppie(avv);
		var trovata={};
		var poscarta1=0;
		var poscarta2=0;
		var seme;
		for (var i=0;i<scala.coppie.length;i++){
			coppia=scala.coppie[i];
			if (coppia.tipotris==TRIS){
				var semitris=["C","Q","F","P"];
				var tagliare=semitris.indexOf(coppia.carta1.seme);
				semitris.splice(tagliare,1);
				tagliare=semitris.indexOf(coppia.carta2.seme);
				semitris.splice(tagliare,1);
				var numerotris=coppia.carta1.numero;
					if (!(scala.recupera(semitris[0]+numerotris,trovata,"carta","pos")))
						if (!(scala.recupera(semitris[0]+numerotris,trovata,"carta","pos"))) continue;
						poscarta1=1;poscarta2=2;
			}
			else{ //coppia tipo scala;
				seme=coppia.carta1.seme;
				numerotris=coppia.carta1.numero+1;
				if (numerotris==14) numerotris=1;
				if (coppia.posizionejolly==1){ //aggiungere carta centrale;
					if (!(scala.recupera(seme+numerotris,trovata,"carta","pos"))) continue;
					poscarta1=0;poscarta2=2;
				}
				else { //aggiungere carta laterale;
					//davanti
					numerotris=coppia.carta1.numero-1;
					if (numerotris==0) numerotris=13;
					poscarta1=1;poscarta2=2;
					if (!(scala.recupera(seme+numerotris,trovata,"carta","pos"))){
						//dietro
						numerotris=coppia.carta2.numero+1;
						if (numerotris==14) numerotris=1;
						poscarta1=0;poscarta2=1;
						if (!(scala.recupera(seme+numerotris,trovata,"carta","pos"))) continue;
					}
				}
			}
			trovata.carta.tipotris=coppia.tipotris;
			scala.attaccaquick(trovata.pos+poscarta1,coppia.carta1,trovata.carta);
			scala.attaccaquick(trovata.pos+poscarta2,coppia.carta2,trovata.carta);
			//scala.aggiungitris(scala.campotris,trovata.pos+poscarta1,coppia.carta1,trovata.carta,ESEGUI);
			//scala.aggiungitris(scala.campotris,trovata.pos+poscarta2,coppia.carta2,trovata.carta,ESEGUI);
			return true;



		}
		return false;
	})


    if (scala.campotris.carte.length==0) return false;
    var campo=scala.campiavversario[avv].carte;
    if (lavoracoppie(avv)) return true;   //è un doppione, se funziona tolgo cpscl e cpqrt

    for (var i=0;i<campo.length;i++){
        scala.cartatris=campo[i];
        var ctrisshort=scala.cartatris.shortName;
        var ctrisseme=ctrisshort.slice(0,1)
        var ctrisnumero=ctrisshort.slice(1)

        if (cercatris()) return true;
        if (cercascala()) return true;

    }
    return false;
})


scala.recupera=(function(shortcarta,carte,cartatrovata,indicecarte){
	scala.checksplit();
	scala.recstack=0;
	return scala.recuperaint(shortcarta,carte,cartatrovata,indicecarte);
}),

scala.recuperaint=(function(shortcarta,carte,cartatrovata,indicecarte){
        //carte è l'oggetto in cui mettere il puntatore alla carta trovata  
        //ritorna vero o falso;  
		scala.verificanumerotris(); 
        scala.recstack++;
        if (scala.recstack>LIMRECSTACK) 
        	return false;
    
        var short=shortcarta
        var seme=shortcarta.slice(0,1)
        var numero=shortcarta.slice(1)


        
    var cont=scala.campotris.carte;
    
    


        //*****************************************
        //******** recuperaloop *******************
        //*****************************************



    var recuperaloop=(function(rshort,carte,cartatrovata,indicecarte){

        var indici=locate(rshort);
        if (!indici.trovato) return false;
        if (!recuperalp1(indici.index1,indici)) 
            if (!recuperalp1(indici.index2,indici)) return false;
            carte[cartatrovata]=scala.campotris.carte[indici.index3];
             carte[indicecarte]=indici.index3
        return true;

    }) //recuperaloop
    
   

   var recuperalp1=(function(indice,indici){
        
        if (indice==-1) return false;
        //vede di recuperare la carta puntata da indice
        var puntalog=scala.statostack.length;
		scala.mappatris();
        var carta=cont[indice];
        //se la carta è già splittata o bloccata non la può prendere;
        if ((carta.split)||(carta.bloccata)) return false;
        var ntris=carta.ntris;
        var ltris=scala.maptris[ntris].ltris;
        scala.mappatris();
        if (scala.maptris[ntris].tipotris==TRIS) {
            //se il tris è da 4 carte la carta è recuperabile
            if (scala.maptris[ntris].ltris==4) {
                //scala.pushstato("recuperalp1 tris 4 carte");             //non serve?                         //zzzzzzzzzzzzzzz
                indici.index3=scala.splittatris (cont[indice]);         //zzzzzzzzzzzzzzz
                //scala.render();                                         //zzzzzzzzzzzzzzz
                return true;
            }
            //se il tris è da 3 carte vede se può recuperare la carta mancante
            if (scala.maptris[ntris].ltris==3) {



				//ho invertito i due tentativi per vedere se riesco a evitare l'inghippo del doppio tris
				//nel quale cercando di recuperare la carta mancante da un tris va a smembrarne un secondo attaccando
				//la carta che intendevo recuperare nel primo al posto in cui andava attaccata la prima
				//incasinato ma..
				//vede se riesce ad attaccare le altre due

				scala.mappatris();
				var puntalog2=scala.statostack.length;


				
				var posizione=scala.maptris[ntris].posizione;
				var cercacarte=[];
				for (var j=0;j<3;j++) {
					cont[posizione+j].bloccata=true;      // le carte di questo tris non sono disponibili per altri mastruzzi
					if ((posizione+j)==indice) continue   //salto la carta che mi serve
					cercacarte.push(cont[posizione+j])   // salva le due carte rimanenti
				}


				if (scala.attaccacarta(cercacarte[0])){
					if (scala.attaccacarta(cercacarte[1])) {
						indici.index3=cont.indexOf(carta);
						return true;
					}
				}

				scala.recuperastack(puntalog2);


				//vede se riesce a recuperare la carta che manca


				scala.mappatris();
            	var cartatris=cont[scala.maptris[ntris].posizione] //per avere un riferimento anche in caso di spostamenti
                //scala.pushstato("recuperalp1 tris 3 carte");       //non serve?           
				var semitris=["C","Q","F","P"];

				for (var j=0;j<3;j++) {
					cont[scala.maptris[ntris].posizione+j].bloccata=true; //su questo tris non si fanno ulteriori mastruzzi
				}

				for (var j=0;j<4;j++) {
					for (var k=0;k<3;k++) {
						if (semitris[j]==cont[scala.maptris[ntris].posizione+k].seme) break;
					}
					if (k==3) break;
				}
				carta.split=true; //per evitare che venga ripresa;
				var xcarta={};
				if (scala.recuperaint(semitris[j]+cont[scala.maptris[ntris].posizione].numero,xcarta,"cartatrovata","trovatapos")){
					//$(xcarta.cartatrovata.gui).addClass("cardjoined")
					scala.attaccaquick(cont.indexOf(cartatris),xcarta.cartatrovata,cartatris);
					//scala.aggiungitris(scala.campotris,cont.indexOf(cartatris),xcarta.cartatrovata,cartatris,ESEGUI);
					//libera il tris per ulteriori mastruzzi
					for (var j=0;j<cont.length;j++) {
						if (cont[j].ntris>carta.ntris) break;
						if (cont[j].ntris==carta.ntris) carta.blocata=false;
					}


					indici.index3=scala.splittatris (carta);
					return true;
				}
				
				for (var j=0;j<3;j++) {
					cont[scala.maptris[ntris].posizione+j].bloccata=false; 
				}

				carta.split=false;
				return false;
				
            } //if (scala.maptris[ntris].ltris==3) 

        }
        else { // era una scala
			if (scala.maptris[ntris].ltris<3) return false; //tris splittato
            if (scala.maptris[ntris].ltris<4) {  
            	
            	//se è un tris da tre prova ad attaccere una carta dall'altra parte
            	if ((indice==scala.maptris[ntris].posizione)&&  //inizio, prova ad attaccare alla fine
            		(cont[indice+scala.maptris[ntris].ltris-1].bloccata==false)) { //purchè essa non sia bloccata

            		//scala.pushstato("recuperalp1 fine scala con attacco inizio");       //non serve?   //zzzzzzzzzzzzzzz
            		var numeroattacca=cont[scala.maptris[ntris].posizione+ltris-1].numero+1
            		if (numeroattacca==14) numeroattacca=1;
            		var cartatris=cont[scala.maptris[ntris].posizione];
            		var xcarta={};
            		if (scala.recuperaint(scala.maptris[ntris].seme+numeroattacca,xcarta,"cartatrovata","trovatapos")){
            			scala.attaccaquick(scala.campotris.carte.indexOf(cartatris)+ltris,xcarta.cartatrovata,cartatris)
            			//scala.aggiungitris(scala.campotris,scala.campotris.carte.indexOf(cartatris)+ltris,xcarta.cartatrovata,cartatris,ESEGUI);
            			indici.index3=scala.splittatris (carta);
            			return true;
            		}
            	}
             	if ((indice==scala.maptris[ntris].posizione+scala.maptris[ntris].ltris-1)&& //fine, prova ad attaccare all'inizio
             		(cont[scala.maptris[ntris].posizione].bloccata==false)) { //purchè non sia bloccato
            		
            		//scala.pushstato("recuperalp1 inizio scala con attacco fine");    //non serve?  //zzzzzzzzzzzzzzz
            		var numeroattacca=cont[scala.maptris[ntris].posizione].numero-1
            		if (numeroattacca==0) numeroattacca=13;
            		var cartatris=cont[scala.maptris[ntris].posizione];
            		var xcarta={};
            		if (scala.recuperaint(scala.maptris[ntris].seme+numeroattacca,xcarta,"cartatrovata","trovatapos")){
            			scala.attaccaquick(scala.campotris.carte.indexOf(cartatris),xcarta.cartatrovata,cartatris)
            			//scala.aggiungitris(scala.campotris,scala.campotris.carte.indexOf(cartatris),xcarta.cartatrovata,cartatris,ESEGUI);
            			indici.index3=scala.splittatris (carta);
            			return true;
            		}
             	}


				//come alternativa vede se riesce ad attaccare le altre due

				scala.mappatris();
				var puntalog2=scala.statostack.length;


				
				var posizione=scala.maptris[ntris].posizione;
				var cercacarte=[];
				for (var j=0;j<3;j++) {
					cont[posizione+j].bloccata=true;      // le carte di questo tris non sono disponibili per altri mastruzzi
					if ((posizione+j)==indice) continue   //salto la carta che mi serve
					cercacarte.push(cont[posizione+j])   // salva le due carte rimanenti
				}

				//scala.splittatris(carta);  //per evitare che mi ricomponga lo stesso tris
				if (scala.attaccacarta(cercacarte[0])){
					if (scala.attaccacarta(cercacarte[1])) {
						indici.index3=cont.indexOf(carta);
						return true;
					}
				}

				scala.recuperastack(puntalog2);
				return false;
	
            	
            	return false;
            }  //

            
            //se è la prima o l'ultima di una scala maggiore di tre è recuperabile
            if (indice==scala.maptris[ntris].posizione){
                //scala.pushstato("recuperalp1 inizio scala");          ////non serve?                             //zzzzzzzzzzzzzzz
                indici.index3=scala.splittatris (cont[indice]);         //zzzzzzzzzzzzzzz
                //scala.render();                                         //zzzzzzzzzzzzzzz
                return true;                  
            }
            if (indice==scala.maptris[ntris].posizione+scala.maptris[ntris].ltris-1){ 
                //scala.pushstato("recuperalp1 fine scala");             //non serve?                          //zzzzzzzzzzzzzzz
                indici.index3=scala.splittatris (cont[indice]);         //zzzzzzzzzzzzzzz
                //scala.render();                                         //zzzzzzzzzzzzzzz
                return true;                  
            }

            //se il numero di carte prima o dopo è minore di tre per adesso lasciamo perdere
            
            //if (((indice-scala.maptris[ntris].posizione)<3)||((scala.maptris[ntris].posizione+scala.maptris[ntris].ltris-indice)<=3)) return false
            
            if ((indice-scala.maptris[ntris].posizione)<3) { //recupera quasi davanti
                if ((indice-scala.maptris[ntris].posizione)==2) return false    //per adesso
                //se è la seconda carta del tris vedo se la prima carta si può attaccare da qualche parte
                if (scala.maptris[ntris].ltris<5) return false;
                var cartaatt=scala.campotris.carte[scala.maptris[ntris].posizione];
                if (!scala.attaccacarta(cartaatt)) return false;
                //scala.pushstato("recuperalp1 seconda carta");                  //non serve?                     //zzzzzzzzzzzzzzz
               	indici.index3=scala.splittatris (carta);  //l'indice non dovrebbe muoversi
				return true;  
                
            }
            if ((scala.maptris[ntris].posizione+scala.maptris[ntris].ltris-indice)<=3) { //recupera quasi dietro
                if ((scala.maptris[ntris].posizione+scala.maptris[ntris].ltris-indice)!=2) return false    //per adesso
                //se è la penultima carta del tris vedo se la untima carta si può attaccare da qualche parte
                if (scala.maptris[ntris].ltris<5) return false;
                var cartaatt=scala.campotris.carte[scala.maptris[ntris].posizione+scala.maptris[ntris].ltris-1]
                if (!scala.attaccacarta(cartaatt)) return false;
                //scala.pushstato("recuperalp1 penultima carta");         //non serve?                              //zzzzzzzzzzzzzzz
               	indici.index3=scala.splittatris (carta);  //l'indice non dovrebbe muoversi

				return true;  
             }

            //else { 
                //scala.pushstato("recuperalp1 carta centrale");           //non serve?                            //zzzzzzzzzzzzzzz
                indici.index3=scala.splittatris (cont[indice]);
                scala.splittatris (cont[indice+1]);          //zzzzzzzzzzzzzzz
                //scala.render();                                         //zzzzzzzzzzzzzzz
                return true;                  
            //}


        }
       
   }) //recuperalp1


    var locate=(function(cshort){  //mette in index1 l'indice alla carta trovata, eventualmente in index2 l'indice alla seconda carta uguale
        var index1=-1;
        var index2=-1;
        var trovato=false;
        for (var i=0;i<cont.length;i++){
            if (cont[i].shortName==cshort) {
                trovato=true;
                if (index1==-1) index1=i;
                else {index2=i; break}
            }
        }
        return {trovato:trovato,index1:index1,index2:index2};
    }) //locate


        //*****************************************
        //***************************************** comincia qui
        //*****************************************
    

    return recuperaloop(short,carte,cartatrovata,indicecarte);

    
}) //scala.recupera


//salva in scala.maptris la mappa dei tris
//e in scala.numerosplit il numero di carte splittate

scala.mappatris=(function(){
	this.verificanumerotris();  //elimina eventuali buchi nella numerazione dei tris
    var nsplit=0;
    var ncarte=0;
    var ntris=0;
    var cont=scala.campotris.carte;
    var carta;

    scala.maptris=[];
    scala.numeriosplit=0;
         
    if (cont.length==0) return;

    for (var i=0;i<cont.length;i++){
        carta=cont[i];
        if (carta.split) nsplit++;
        if (carta.ntris==ntris) ncarte++;
        else{
            scala.maptris[ntris]={posizione:i-ncarte,ltris:ncarte,tipotris:cont[i-1].tipotris,split:cont[i-1].split,seme:cont[i-1].seme};
            ntris=carta.ntris;
            ncarte=1;
        }
    }
    scala.maptris[ntris]={posizione:i-ncarte,ltris:ncarte,tipotris:cont[i-1].tipotris,split:cont[i-1].split,seme:cont[i-1].seme};  //ultimo tris
    scala.numerosplit=nsplit;
})//scala mappatris


//è un pò un doppione che in futuro potrebbe rimpiazzare altre funzioni

scala.attaccacarta=(function(carta){

	
	var campo=scala.campotris.carte;
	scala.mappatris();
	var short=carta.shortName;
	var seme=carta.seme;
	var map=scala.maptris;
	
	var cartatris;
	var ncartatris;
	var ntris;
	var ltris;
	var iniziotris;
	var checkntris=carta.ntris;
	if (carta.gruppo!=scala.campotris) checkntris=-1;

	
	//provo a attacare all'inizio o alla fine di un tris

	for (var i=0;i<map.length;i++){
		if (i==checkntris) continue;
		if (map[i].ltris<3) continue;  //tris in lavorazione
		if (map[i].tipotris==TRIS) {
			if ((map[i].ltris)==4) continue;
			if ((campo[map[i].posizione].numero)!=carta.numero) continue;
			if ((campo[map[i].posizione+0].seme==seme)||(campo[map[i].posizione+1].seme==seme)||(campo[map[i].posizione+2].seme==seme)) continue;
			if ((campo[map[i].posizione+0].bloccata)||(campo[map[i].posizione+1].bloccata)||(campo[map[i].posizione+2].bloccata)) continue;
				
			cartatris=campo[map[i].posizione];
			//$(carta.gui).addClass("cardjoined");
			scala.attaccaquick(map[i].posizione,carta,cartatris)
			//scala.aggiungitris(scala.campotris,map[i].posizione,carta,cartatris,ESEGUI);  
			return true;
			
		}
		else {  //SCALA
			if ((map[i].seme)!=seme) continue;
			//provo all'inizio
			cartatris=campo[map[i].posizione];
			ncartatris=cartatris.numero;
			if (ncartatris==1) ncartatris=14;
			

			if ((carta.numero==(ncartatris-1))&&(!cartatris.bloccata))  {
				if ((map[i].ltris>3)&&(ncartatris==14)) break; //non posso mettere un K se il tris è più lungo di tre
				//$(carta.gui).addClass("cardjoined");
				scala.attaccaquick(map[i].posizione,carta,cartatris)
				//scala.aggiungitris(scala.campotris,map[i].posizione,carta,cartatris,ESEGUI);  
				return true;
			}
			
			//provo alla fine
			cartatris=campo[map[i].posizione+map[i].ltris-1];
			ncartatris=cartatris.numero;
			if (ncartatris==13){
				if (map[i].ltris>13) continue; //non posso mettere un 1 se il tris è più lungo di tredici
				ncartatris=0;
			}

			if ((carta.numero!=(ncartatris+1))||(cartatris.bloccata)) continue;
			
			if (carta.numero==4){ //se attacco un quattro in coda
				if (map[i].ltris!=3){ //se il tris è lungo 3 procede
					if (map[i].ltris==4) continue;  //se il tris è lungo 4 non posso attaccare
					//se il tris è più lungo di 4 stacco le ultime due carte
					scala.splittatris(campo[map[i].posizione+map[i].ltris-2]);
				}

			}


			//$(carta.gui).addClass("cardjoined");
			scala.attaccaquick(map[i].posizione+map[i].ltris,carta,cartatris)
			//scala.aggiungitris(scala.campotris,map[i].posizione+map[i].ltris,carta,cartatris,ESEGUI);  
			return true;

		}
	}  //for (var i=0;i<map.length;i++)

	//vede se c'è una carta uguale in un tris lungo;
	for (var j=0;j<scala.campotris.carte.length;j++){
		cartatris=scala.campotris.carte[j];
		if (cartatris.bloccata) continue;
		ntris=cartatris.ntris;
		ltris=scala.maptris[ntris].ltris;
		if (ntris==carta.ntris) continue;
		if (ltris<3) continue;
		if (scala.maptris[ntris].tipotris!=SCALA) continue;
		iniziotris=scala.maptris[ntris].posizione;
		if (cartatris.seme!=seme) continue;
		var numerotris=cartatris.numero;

		if ((j==iniziotris)&&(numerotris!=2)&&(!((numerotris==1)&&(ltris>3))))   {  //inizio tris, vede se può attaccare con una carta intermedia;

			var numerointer=numerotris-1;
			if (numerointer==0) numerointer=13;
			if(numerotris<3) numerotris+=13;
			if ((numerotris-carta.numero)==2){
				var puntalog=scala.statostack.length;
				//scala.pushstato("attacca carta "+scala.descrivi(carta)+"con seconda carta aggiunta");
				var carte={};
				cartatris.bloccata=true;
				if (scala.recuperaint(seme+numerointer,carte,"carta1","pos1")){

					//$(carte.carta1.gui).addClass("cardjoined")
					//$(cartatris.gui).addClass("cardjoined")

					var posizione=campo.indexOf(cartatris);

					scala.attaccaquick(posizione,carte.carta1,cartatris)
					//scala.aggiungitris(scala.campotris,iniziotris,carte.carta1,cartatris,ESEGUI);
					//se la carta tolta era prima della posizione di aggiunta tolgo 1 a poscartatris
					//if (carte.pos1<iniziotris) iniziotris--;
					var posizione=campo.indexOf(cartatris);

					scala.attaccaquick(posizione-1,carta,cartatris)
					cartatris.bloccata=false;
					//scala.aggiungitris(scala.campotris,iniziotris,carta,cartatris,ESEGUI);
					return true;
				}
				scala.recuperastack(puntalog);
			}

		}  //fine inizio tris con carta intermedia

		if ((j==iniziotris+ltris-1)&&(numerotris!=2)&&(!((numerotris==3)&&(ltris>3)))) {  //fine tris, vede se può attaccare con una carta intermedia;
			var numerointer=numerotris+1;
			if (numerointer==14) numerointer=1;
			if(numerotris>11) numerotris-=13;
			if ((carta.numero-numerotris)==2){
				var puntalog=scala.statostack.length;
				//scala.pushstato("attacca carta "+scala.descrivi(carta)+" con penultima carta aggiunta");
				var carte={};
				cartatris.bloccata=true;
				if (scala.recuperaint(seme+numerointer,carte,"carta1","pos1")){

					//$(carte.carta1.gui).addClass("cardjoined")
					//$(cartatris.gui).addClass("cardjoined")

					var posizione=campo.indexOf(cartatris);

					scala.attaccaquick(posizione+1,carte.carta1,cartatris);
					//scala.aggiungitris(scala.campotris,iniziotris+ltris,carte.carta1,cartatris,ESEGUI);
					//se la carta tolta era prima della posizione di aggiunta tolgo 1 a poscartatris
					//if (carte.pos1<posizione) iniziotris--;
					posizione=campo.indexOf(cartatris);
					scala.attaccaquick(posizione+2,carta,cartatris)
					//scala.aggiungitris(scala.campotris,iniziotris+ltris+1,carta,cartatris,ESEGUI);
					cartatris.bloccata=false;
					return true;
				}
				scala.recuperastack(puntalog);
			}


		} //fine fine tris con carta intermedia



		if (cartatris.shortName==short){
			if (cartatris.tipotris!=SCALA) continue;
			if (ltris<5) continue;
			if ((j-iniziotris)<2) continue;
			if ((iniziotris+ltris-j)<3) continue;
			scala.splittatris(cartatris)
			scala.attaccaquick(j,carta,scala.campotris.carte[j-1])
			//scala.aggiungitris(scala.campotris,j,carta,scala.campotris.carte[j-1],ESEGUI);
			return true;
		}
	}//for (var j=0;j<scala.campotris.carte.length;j++)

	

}) //scala.attaccacarta



scala.recuperastack=(function(puntastack){
	while (scala.statostack.length>puntastack) scala.popstato();
	scala.popstato(puntastack-1);

}) //scala.recuperastack