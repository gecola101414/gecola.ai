// Removed Google GenAI dependency for Vercel deployment compatibility
// import { GoogleGenAI } from "@google/genai";

export async function generateSafetyProcedures(
  scaffoldingType: string, 
  brand: string, 
  model: string,
  moduleWidth: number,
  moduleHeight: number,
  specialPieces: string,
  hasShadingNet: boolean,
  hasNightLights: boolean,
  preposto: string,
  soilType: string,
  baseElements: string,
  earthingSystem: string,
  signage: string[],
  employer: string,
  employerAddress: string,
  employerTaxCode: string
) {
  // Simulate API delay for better UX
  await new Promise(resolve => setTimeout(resolve, 1500));

  const prepostoName = preposto || 'incaricato';
  const employerName = employer || 'Ditta Esecutrice';

  return `
<div style="font-size: 12pt; line-height: 1.6; font-family: 'Inter', sans-serif;">
  <p style="margin-bottom: 16px; text-align: justify;">Il presente documento definisce le procedure operative per il ponteggio di tipo <strong>${scaffoldingType}</strong> (Marca: <strong>${brand || 'N/A'}</strong>, Modello: <strong>${model || 'N/A'}</strong>) installato dalla ditta <strong>${employerName}</strong>.</p>

  <h3 style="font-size: 14pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Modalità di tracciamento del ponteggio e impostazione della prima campata</h3>
  <p style="margin-bottom: 16px; text-align: justify;">I lavoratori addetti al montaggio devono, con la messa in opera di fili fissi corrispondenti con i montanti, eseguire il tracciamento del ponteggio. Al di sotto delle zone dove verranno poste le basette si devono disporre degli opportuni elementi di ripartizione dei carichi (<strong>${baseElements}</strong>).</p>

  <h3 style="font-size: 14pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Modalità di verifica della verticalità, livello/bolla del primo impalcato e distanza tra ponteggio e opera</h3>
  <p style="margin-bottom: 16px; text-align: justify;">La verifica dell'orizzontalità del traverso deve essere effettuata mediante l'uso della livella. Le compensazioni necessarie devono essere effettuate agendo, quando presenti, sulle basette regolabili. La planarità dei telai deve essere verificata con una livella e una staggia (riga) posta tra due traversi consecutivi. E' consentito un distacco dall'opera servita non superiore a 20 cm.</p>

  <h3 style="font-size: 14pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Modalità di verifica e controllo del piano di appoggio del ponteggio ed eventuali interventi migliorativi.</h3>
  <p style="margin-bottom: 16px; text-align: justify;">Deve essere garantita per tutto il periodo di installazione del ponteggio la stabilità del piano di appoggio (<strong>${soilType}</strong>). Prima del montaggio del ponteggio, il preposto al montaggio, <strong>Sig. ${prepostoName}</strong>, deve verificare, mediante sopralluogo, che il piano di appoggio del ponteggio abbia una resistenza idonea a reggere il ponteggio realizzando, dove necessario, interventi migliorativi come il riporto e la compattazione sul terreno di materiale inerte.</p>

  <h3 style="font-size: 14pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Messa a terra e dotazioni</h3>
  <p style="margin-bottom: 16px; text-align: justify;">Il ponteggio è dotato di <strong>${earthingSystem}</strong>. ${hasShadingNet ? 'È prevista l\'installazione di rete oscurante/antipolvere.' : ''} ${hasNightLights ? 'Sono previste luci notturne di segnalazione.' : ''}</p>

  <h3 style="font-size: 14pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Realizzazione degli ancoraggi</h3>
  <p style="margin-bottom: 16px; text-align: justify;">Il ponteggio è ancorato ad un elemento strutturale sicuro attraverso un sistema idoneo. Gli elementi d'ancoraggio devono essere certificati dal fabbricante o previsti dall'autorizzazione ministeriale. Il <strong>Sig. ${prepostoName}</strong> supervisionerà la corretta esecuzione degli ancoraggi secondo gli schemi dell'Allegato A.</p>

  <h3 style="font-size: 14pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px; text-transform: uppercase;">7. MISURE DI SICUREZZA DA ADOTTARE DURANTE IL MONTAGGIO E IN CONDIZIONI PARTICOLARI</h3>
  
  <p style="margin-bottom: 16px; text-align: justify;"><strong>Caduta di materiale dall'alto</strong><br/>
  Lesioni causate dall'investimento di materiale cadute dall'alto durante il trasporto con gru, argani ecc.<br/>
  <strong>Misure generali preventive e protettive</strong> - I principali provvedimenti da adottare sono di ordine tecnico. Prima di consentire l'inizio della manovra di sollevamento, i lavoratori, devono verificare che il carico sia stato imbracato correttamente. Durante le manovre di sollevamento del carico gli addetti devono accompagnarlo fuori dalla zona di interferenza con attrezzature, ostacoli o materiali eventualmente presenti, solo per lo stretto necessario. Gli addetti all'imbracatura e aggancio del carico, devono allontanarsi al più presto dalla sua traiettoria durante la fase di sollevamento, è vietato sostare in attesa sotto la traiettoria del carico, è consentito avvicinarsi al carico in arrivo, per pilotarlo fuori dalla zona di interferenza con eventuali ostacoli presenti, solo quando questo è giunto quasi al suo piano di destinazione. Prima di sganciare il carico dall'apparecchio di sollevamento, bisognerà accertarsi preventivamente della stabilità del carico stesso. Dopo aver comandato la manovra di richiamo del gancio da parte dell'apparecchio di sollevamento, esso non va semplicemente rilasciato, ma accompagnato fuori dalla zona impegnata da attrezzature o materiali, per evitare agganci accidentali. Altre misure sono: legare sempre le attrezzature alle cinture porta attrezzi, disporre opportuna segnaletica, disporre sistemi di protezione collettiva.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Caduta dall'alto</strong><br/>
  Caduta di persone dall'alto in seguito alla perdita di equilibrio del lavoratore e/o all'assenza di adeguate protezioni (collettive o individuali).<br/>
  <strong>Misure generali preventive e protettive</strong> - I lavoratori addetti a lavorare in quota, sotto la supervisione di <strong>${prepostoName}</strong>, prima di portarsi nelle zone di esposizione alla caduta dall'alto dovranno essere già agganciati ai DPI anticaduta.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Cambiamento delle condizioni meteorologiche</strong><br/>
  Improvviso cambiamento delle condizioni meteorologiche come neve, vento, ghiaccio e pioggia.<br/>
  <strong>Misure generali preventive e protettive</strong> - Nel caso di pessime condizioni meteorologiche come forte vento il ponteggio dovrà essere evacuato. Il preposto <strong>${prepostoName}</strong> ha l'autorità di sospendere i lavori.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Movimentazione manuale dei carichi</strong><br/>
  Rischi oggettivi di patologie muscolo scheletriche che potrebbero insorgere in seguito alla movimentazione manuale dei carichi degli elementi del ponteggio, ripetuta per tutto il turno di lavoro.<br/>
  <strong>Misure generali preventive e protettive</strong> - I principali provvedimenti da adottare sono di ordine tecnico e organizzativo come la possibilità di ricorrere a mezzi meccanici appropriati al fine di ridurre il rischio che comporta la movimentazione manuale nonché la sorveglianza sanitaria degli addetti.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Oscillazione del corpo con urto contro ostacoli, effetto pendolo</strong><br/>
  Quando esiste il rischio di caduta, può accadere che il lavoratore, sottoposto al cosiddetto "effetto pendolo", ha la possibilità di urtare contro un ostacolo o al suolo.<br/>
  <strong>Misure generali preventive e protettive</strong> - Nel caso ci sia la possibilità che il lavoratore, durante l'effetto pendolo, incontri un ostacolo, è necessario prevedere una configurazione diversa del dispositivo di ancoraggio del sistema anticaduta e valutare lo spazio libero di caduta in sicurezza sotto il sistema di arresto, necessario a consentire una caduta senza che il lavoratore urti contro il suolo o altri ostacoli analoghi.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Sollecitazioni trasmesse al corpo dall'imbracatura</strong><br/>
  Nella fase di arresto della caduta le decelerazioni devono essere contenute entro i limiti sopportabili senza danno per il corpo umano.<br/>
  <strong>Misure generali preventive e protettive</strong> - Questo tipo di prevenzione è automaticamente soddisfatto nel caso si utilizzino dispositivi di arresto conformi alle norme vigenti e secondo le istruzioni indicate dal produttore del dispositivo stesso.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Presenza di linee elettriche</strong><br/>
  Elettrocuzione per contatto diretto o indiretto con linee elettriche.<br/>
  <strong>Misure generali preventive e protettive</strong> - I principali provvedimenti da adottare sono di ordine tecnico e in particolare: mettere fuori tensione ed in sicurezza le parti attive per tutta la durata dei lavori, posizionare ostacoli rigidi che impediscano l'avvicinamento alle parti attive o mantenere un'opportuna distanza di sicurezza.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Sospensione inerte del lavoratore</strong><br/>
  La sospensione inerte, a seguito di perdita di conoscenza, può indurre la cosiddetta "patologia causata dall'imbracatura", che consiste in un rapido peggioramento delle funzioni vitali in particolari condizioni fisiche e patologiche. Per ridurre il rischio da sospensione inerte è fondamentale che il lavoratore sia staccato dalla posizione sospesa al più presto.<br/>
  <strong>Misure generali preventive e protettive</strong> - In ogni lavoro di montaggio, smontaggio e trasformazione di ponteggi, in seguito all'intervento di un dispositivo di arresto della caduta, la squadra deve essere sempre pronta al recupero del lavoratore in difficoltà. Il recuperò dovrà avvenire direttamente dal ponteggio già allestito in caso contrario attraverso un idoneo sistema anticaduta.</p>

  <h3 style="font-size: 14pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px; text-transform: uppercase;">DESCRIZIONE DEI DPI UTILIZZATI NELLE OPERAZIONI DI MONTAGGIO, TRASFORMAZIONE E SMONTAGGIO DEL PONTEGGIO E LORO MODALITÀ DI USO, CON ESPLICITO RIFERIMENTO ALL'EVENTUALE SISTEMA DI ARRESTO CADUTA UTILIZZATO ED AI RELATIVI PUNTI DI ANCORAGGIO.</h3>
  
  <p style="margin-bottom: 16px; text-align: justify;"><strong>Linea di ancoraggio orizzontale flessibile</strong><br/>
  Linea di ancoraggio orizzontale flessibile conforme alla norma UNI EN 795 classe C. Linea di ancoraggio orizzontale flessibile costituita da un cavo metallico collegato, mediante ancoraggi di estremità o ancoraggi intermedi, direttamente al ponteggio o a puntoni metallici a loro volta fissati ai montanti del ponteggio che permettono di alzare la quota della linea di ancoraggio rispetto al piano di calpestio.<br/>
  <strong>Regole generali d'uso</strong> - La linea di ancoraggio orizzontale flessibile deve essere impiegata per realizzare un ancoraggio del sistema anticaduta o del sistema di posizionamento che si sviluppa lungo il ponteggio in allestimento. Durante l'utilizzo, in particolare, si faccia riferimento alle istruzioni d'uso fornite dal fabbricante per la messa in tensione del cavo e per il numero di utilizzatori.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Connettore</strong><br/>
  Connettore conforme alla norma UNI EN 363, di forma ad anello dotato di un sistema di chiusura.<br/>
  <strong>Regole generali d'uso</strong> - Il connettore deve essere impiegato per realizzare l'unione degli elementi del sistema anticaduta o del sistema di posizionamento. Durante le fasi di montaggio, trasformazione e smontaggio del ponteggio evitare di sollecitare il dispositivo di chiusura del connettore con carichi laterali e di utilizzare connettori con sedi piccole rispetto al diametro delle funi.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Cordino di posizionamento regolabile</strong><br/>
  Cordino di posizionamento conforme alla norma UNI EN 358. Cordino di posizionamento costituito da un cordino regolabile in fibra tessile con estremità impalmate per l'aggancio dei connettori.<br/>
  <strong>Regole generali d'uso</strong> - Il cordino di posizionamento deve essere impiegato per realizzare un sistema di posizionamento quando si vuole impedire al "lavoratore in quota" di raggiungere zone pericolose. Da utilizzarsi, in particolare, durante le fasi di montaggio, trasformazione e smontaggio di mantovane, piazzole di carico, sbalzi sommitali, ecc…. Il cordino di posizionamento, accoppiato con una linea di ancoraggio, permette di realizzare un sistema di posizionamento per l'allestimento di un intero impalcato del ponteggio.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Cordino di trattenuta regolabile</strong><br/>
  Cordino di trattenuta regolabile conforme alla norma UNI EN 354. Cordino di trattenuta costituito da un cordino regolabile in fibra tessile, con estremità impalmate per l'aggancio dei connettori, e da un dissipatore di energia, conforme alla norma UNI EN 355, per mitigare l'effetto traumatizzante in caso di caduta.<br/>
  <strong>Regole generali d'uso</strong> - Il dispositivo anticaduta retrattile deve essere impiegato per realizzare un sistema anticaduta. Deve essere utilizzato dal "lavoratore in quota" durante le fasi di montaggio, trasformazione e smontaggio del ponteggio. Prima dell'utilizzo ci si deve assicurare che il dispositivo sia dotato di una lunghezza idonea a garantire un Tirante d'Aria sicuro per il posizionamento in quota.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Cintura di posizionamento</strong><br/>
  Cintura di posizionamento conforme alla norma UNI EN 358. Cintura di posizionamento dotata di due anelli metallici a D per l'aggancio di un cordino di posizionamento e di una fibbia per la regolazione alla vita del lavoratore.<br/>
  <strong>Regole generali d'uso</strong> - La cintura di posizionamento deve essere impiegata per realizzare un sistema di posizionamento. Da utilizzarsi, in particolare, durante le fasi di montaggio, trasformazione e smontaggio di mantovane, piazzole di carico, sbalzi sommitali, ecc….</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Imbracatura con aggancio dorsale</strong><br/>
  Imbracatura conforme alla norma UNI EN 361. Imbracatura composta da diverse cinghie a formare: cosciali, cintura e bretelle, regolabili mediante fibbie. Imbracatura con punto di collegamento al cordino posizionato sul dorso.<br/>
  <strong>Regole generali d'uso</strong> - L'imbracatura deve essere impiegata per realizzare un sistema anticaduta. Deve essere utilizzata dal "lavoratore in quota" durante le fasi di montaggio, trasformazione e smontaggio del ponteggio.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Guanti di protezione da azioni meccaniche</strong><br/>
  Guanti di protezione da azioni meccaniche conformi alla norma UNI EN 388 per uso generale e lavori pesanti, resistenti a tagli, abrasioni, strappi e perforazioni.<br/>
  <strong>Regole generali d'uso</strong> - I guanti di protezione da azioni meccaniche devono essere impiegati durante il maneggio dei vari elementi del ponteggio o l'uso delle attrezzature necessarie al montaggio, trasformazione e smontaggio del ponteggio.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Scarpe con suola imperforabile</strong><br/>
  Scarpe con suola imperforabile conformi alle norme UNI EN ISO 20344, UNI EN ISO 20345, UNI EN ISO 20346 e UNI EN ISO 20347. Scarpe di sicurezza realizzate con suola imperforabile, puntale di protezione e antisdrucciolo.<br/>
  <strong>Regole generali d'uso</strong> - Le scarpe con suola imperforabile devono essere utilizzate durante tutte le fasi di montaggio, trasformazione e smontaggio del ponteggio.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Elmetti di protezione</strong><br/>
  Elmetti di protezione conformi alla norma UNI EN 397. Elmetto dotato al suo interno di sostegni che lo mantengono distaccato dal capo in modo da attutire l'eventuale urto da cui deve proteggere. Dotati di cinghietta sottomento per evitarne la caduta quando si opera in determinate posizioni.<br/>
  <strong>Regole generali d'uso</strong> - Devono essere utilizzati durante tutte le fasi di montaggio, trasformazione e smontaggio del ponteggio.</p>

  <h3 style="font-size: 14pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px; text-transform: uppercase;">8. DESCRIZIONE DELLE ATTREZZATURE ADOPERATE NELLE OPERAZIONI DI MONTAGGIO, TRASFORMAZIONE E SMONTAGGIO DEL PONTEGGIO E LORO MODALITÀ DI INSTALLAZIONE ED USO.</h3>
  
  <p style="margin-bottom: 16px; text-align: justify;"><strong>Argano elettrico</strong><br/>
  Argano costituito da un motore elevatore e dalla relativa struttura di supporto. Argano a bandiera con supporto snodato che consente la rotazione dell'elevatore attorno ad un asse verticale. I carichi movimentati non devono essere eccessivamente pesanti ed ingombranti.<br/>
  <strong>Regole generali d'uso</strong> - L'argano deve essere utilizzato, durante le fasi di montaggio o trasformazione del ponteggio, per le operazioni di sollevamento o discesa degli elementi del ponteggio o d'altro materiale utile. Accertarsi che il braccio girevole, portante l'argano, sia stato fissato, mediante staffe, con bulloni a vite muniti di dado e controdado, a parti stabili del ponteggio (si ricorda che il montante su cui sarà ancorato deve essere raddoppiato). Verificare che sia stata efficacemente transennata l'area di tiro al piano terra e che l'intero perimetro del posto di manovra sia dotato di parapetto regolamentare; accertarsi che siano rispettate le distanze minime da linee elettriche aeree. Assicurarsi dell'affidabilità dello snodo di sostegno dell'argano; accertarsi che sussista il collegamento con l'impianto di messa a terra. Verificare l'efficienza dell'interruttore di linea presso l'elevatore; accertarsi della funzionalità della pulsantiera di comando; accertarsi che sul tamburo di avvolgimento del cavo sussistono almeno 3 spire in corrispondenza dello svolgimento massimo del cavo stesso. Verificare la corretta installazione e la perfetta funzionalità dei dispositivi di sicurezza (dispositivo di fine corsa di salita e discesa del gancio, dispositivo limitatore di carico, arresto automatico in caso di interruzione dell'alimentazione, dispositivo di frenata per il pronto arresto e fermo del carico, dispositivo di sicurezza del gancio). Prendere visione della portata della macchina; accertarsi della corretta imbracatura ed equilibratura del carico e della perfetta chiusura della sicura del gancio; utilizzare dispositivi e contenitori idonei allo specifico materiale da movimentare (secchio, cesta, cassone, ecc.); evitare assolutamente di utilizzare la fune dell'argano per imbracare carichi impedire a chiunque di sostare sotto il carico. Eseguire le operazioni di sollevamento o discesa del carico con gradualità, evitando brusche frenate o partenze, per non assegnare ulteriori sforzi dinamici. Durante le operazioni di sbarco degli elementi del ponteggio rimuovere le apposite barriere mobili solo dopo aver indossato la cintura di sicurezza. Sospendere immediatamente le operazioni quando vi sia presenza di persone esposte al pericolo di caduta di carichi dall'alto o in presenza di vento forte. Dopo l'uso liberare il gancio da eventuali carichi, riavvolgere la fune portando il gancio sotto il tamburo, ruotare l'elevatore verso l'interno del piano di lavoro, interrompere l'alimentazione. Effettuare tutte le operazioni di revisione e manutenzione della macchina, secondo quanto indicato nel libretto d'uso e segnalare eventuali anomalie riscontrate al preposto e/o al datore di lavoro.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Chiave per il ponteggio</strong><br/>
  Chiave metallica registrabile.<br/>
  <strong>Regole generali d'uso</strong> - La chiave deve essere utilizzata durante le fasi del montaggio, trasformazione e smontaggio per serrare o svitare gli elementi del ponteggio. Durante l'uso verificare che sia sempre legata, mediante cordino, alla cintura porta attrezzi.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Martello in gomma</strong><br/>
  Martello con manico in legno e testa in gomma dura.<br/>
  <strong>Regole generali d'uso</strong> - Il martello deve essere utilizzato durante le fasi di montaggio e/o trasformazione del ponteggio per l'assestamento dei dispositivi di blocco degli elementi del ponteggio. Durante l'uso verificare che sia sempre legato, mediante cordino, alla cintura porta attrezzi.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Trapano elettrico</strong><br/>
  Trapano azionato da un motore elettrico<br/>
  <strong>Regole generali d'uso</strong> - Il trapano deve essere utilizzato, durante le fasi di montaggio o trasformazione del ponteggio, per la messa in opera degli ancoraggi. Durante l'uso assicurarsi che l'utensile sia a doppio isolamento (220V), o alimentato a bassissima tensione di sicurezza (50V), in ogni caso non collegato a terra. Accertarsi che il cavo di alimentazione e la spina non presentano danneggiamenti, evitando assolutamente di utilizzare nastri isolanti adesivi per eseguire eventuali riparazioni; assicurarsi del corretto funzionamento dell'interruttore e del buon funzionamento dell'utensile. Assicurarsi del corretto fissaggio della punta. Accertarsi che le feritoie di raffreddamento, collocate sull'involucro esterno dell'utensile siano libere da qualsiasi ostruzione. Assicurarsi che l'elemento su cui operare non sia in tensione o attraversato da impianti tecnologici attivi; nelle pause di lavoro, ricordarsi di interrompere l'alimentazione elettrica. Posizionarsi in modo stabile prima di dare inizio alle lavorazioni. Evitare assolutamente di compiere operazioni di registrazione, manutenzione o riparazione su organi in movimento. Verificare la disposizione dei cavi di alimentazione affinché non intralcino i posti di lavoro e i passaggi, e non siano soggetti a danneggiamenti meccanici. Assicurarsi che terzi non possano inavvertitamente riavviare impianti tecnologici (elettricità, gas, acqua, ecc) che interessano la zona di lavoro. Durante le operazioni di taglio praticate su muri, pavimenti o altre strutture che possano nascondere cavi elettrici, evitare assolutamente di toccare le parti metalliche dell'utensile. Informare tempestivamente il preposto e/o il datore di lavoro, di malfunzionamenti o pericoli che dovessero evidenziarsi durante il lavoro. Durante l'uso del trapano bisogna evitare di esercitare su di esso una pressione eccessiva per evitare il rischio di danneggiare la punta. Al momento dell'uscita della punta dal foro, su di essa viene esercitata una forza notevole per questo, in questa fase, bisognerà avere particolare cura ed attenzione nell'impugnare l'attrezzo. Il moto della punta del trapano non deve mai essere arrestato sul pezzo in lavorazione. Dopo l'uso assicurarsi di aver interrotto il collegamento elettrico. Effettuare tutte le operazioni di revisione e manutenzione dell'attrezzo secondo quanto indicato nel libretto d'uso dopo essersi accertati di aver sconnesso l'alimentazione elettrica.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Livella a bolla</strong><br/>
  Livella a bolla d'aria costituita da una base metallica su cui sono montati degli indicatori in vetro, di forma cilindrica, riempiti da liquido con bolla d'aria.<br/>
  <strong>Regole generali d'uso</strong> - La livella a bolla deve essere utilizzata durante le fasi di montaggio e/o trasformazione del ponteggio o a seguito di violente perturbazioni atmosferiche o prolungata interruzione di lavoro per verificare l'orizzontalità e verticalità dei vari elementi del ponteggio. Durante l'uso verificare che sia sempre legata, mediante cordino, alla cintura porta attrezzi.</p>

  <p style="margin-bottom: 16px; text-align: justify;"><strong>Chiave dinamometrica a scatto</strong><br/>
  Chiave dinamometrica dotata di dispositivo dove impostare il valore di serraggio, il raggiungimento di tale valore è segnalato da uno scatto.<br/>
  <strong>Regole generali d'uso</strong> - La chiave dinamometrica deve essere utilizzata durante le fasi di montaggio e/o trasformazione del ponteggio o a seguito di violente perturbazioni atmosferiche o prolungata interruzione di lavoro per verificare il serraggio dei giunti e degli altri elementi del ponteggio secondo le istruzioni riportate dal fabbricante nel libretto d'uso di cui all'Autorizzazione Ministeriale. Durante l'uso verificare che sia sempre legata, mediante cordino, alla cintura porta attrezzi.</p>

  <h3 style="font-size: 14pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px; text-transform: uppercase;">9. MODALITÀ DI MONTAGGIO, TRASFORMAZIONE E SMONTAGGIO DEL PONTEGGIO (punto 8, Allegato XXII del D.Lgs. 81/2008)</h3>
  
  <p style="margin-bottom: 16px; text-align: justify;"><strong>ISTRUZIONI PER IL MONTAGGIO, TRASFORMAZIONE E SMONTAGGIO</strong><br/>
  <strong>Montaggio e Smontaggio Impalcati</strong><br/>
  <strong>Montaggio</strong><br/>
  La procedura di montaggio utilizzata per gli impalcati del ponteggio è descritta di seguito:<br/>
  <strong>Step A:</strong> I lavoratori dovranno realizzare, sul traverso di un telaio sovrapposto a quello di base, un punto di ancoraggio a cui collegare il DPI anticaduta retrattile. Il moschettone del DPI, che andrà collegato all'imbracatura, dovrà essere fissato temporaneamente al montante in corrispondenza della quota dell'impalcato superiore. I lavoratori, quindi, monteranno i telai sulle basette, i telaiparapetto e i correnti interni.<br/>
  <strong>Step B:</strong> Operando dal piano di posa i lavoratori monteranno le tavole dell'impalcato da allestire, le diagonali in pianta, le diagonali di facciata, gli ancoraggi e le scale d'accesso all'impalcato superiore sotto la diretta supervisione del preposto <strong>${prepostoName}</strong>.</p>
</div>
  `.trim();
}
