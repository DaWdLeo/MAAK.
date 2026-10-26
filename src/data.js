export const PROJECT_ID = 'gemeinschaftswerkstatt-v1';
export const SECTIONS = [
 {id:'P1',title:'Vorbereitung und Sicherheit',subtitle:'Erst prüfen, dann renovieren',count:5},
 {id:'P2',title:'Winterfestmachung und Grundbeleuchtung',subtitle:'Gebäude sichern und nutzbar machen',count:5},
 {id:'P3',title:'Kleinen Raum fertigstellen',subtitle:'Erstes Etappenziel: trockene, warme Arbeitsbasis',count:6},
 {id:'P4',title:'Übrige Räume ausbauen',subtitle:'Hauptwerkstatt, Galerie und dritter Raum',count:4}
];
export const RHYTHM = [
 {day:'Montag',time:'15–20 Min. online',work:'Abstimmung, Material und Wochenplanung'},
 {day:'Dienstag',time:'18:30–21:00',work:'Renovierung, kleinere vorbereitende Arbeiten'},
 {day:'Donnerstag',time:'18:30–21:00',work:'Renovierung, kleinere vorbereitende Arbeiten'},
 {day:'Samstag',time:'10:00–16:00',work:'Gemeinsamer Hauptarbeitstag'},
 {day:'Sonntag',time:'Optional',work:'Nur bei Bedarf und zulässigen Tätigkeiten'}
];
export const WEEKS = [
 {number:1,title:'Aufräumen und Bestandsaufnahme',desc:'Zwei Feierabende zum Ausräumen, Sortieren und Vermessen. Samstag: Schäden dokumentieren, Fachprüfungen und Materialinventur planen.'},
 {number:2,title:'Gebäude sichern und winterfest machen',desc:'Erst nach fachlicher Klärung und Freigabe: Feuchtigkeitsursachen beheben oder Reparaturen koordinieren, Leitungen schützen, sichere Grundbeleuchtung.'},
 {number:3,title:'Kleinen Raum renovieren',desc:'Nur bei trockenem und saniertem Untergrund: Wände vorbereiten, streichen, Holzboden instand setzen und Fenster abdichten.'},
 {number:4,title:'Kleinen Raum einrichten',desc:'Beleuchtung fachgerecht fertigstellen, geeignete Heizung sicher in Betrieb nehmen und Möbel aufstellen.'}
];
export const MILESTONES = [
 {id:'M1',title:'Kleiner Raum als gemeinsame Arbeitsbasis',desc:'Trocken, sicher beheizbar, beleuchtet und möbliert',groups:['P3-01','P3-02','P3-03','P3-04','P3-05','P3-06']},
 {id:'M2',title:'Hauptwerkstatt nutzbar',desc:'Arbeitsplätze und sichere Galerie',groups:['P4-01','P4-02']},
 {id:'M3',title:'Alle drei Räume nutzbar',desc:'Auch dritter Raum und Organisation fertig',groups:['P4-03','P4-04']}
];
// Alle 49 Einzelmaßnahmen aus der ursprünglichen Checkliste sind einmalig einer der 20 Gemeinschaftsaufgaben zugeordnet.
export const TASKS = [
 {id:'P1-01',section:'P1',week:1,title:'Alle Räume ausräumen und Bestandsaufnahme durchführen',steps:[
  'Alle drei Räume vollständig ausräumen und reinigen']},
 {id:'P1-02',section:'P1',week:1,title:'Räume vermessen und Schäden dokumentieren',steps:[
  'Schimmelbefall und Feuchtigkeitsschäden erfassen','Beschädigte Deckenbereiche untersuchen','Raummaße des kleinen Raums aufnehmen']},
 {id:'P1-03',section:'P1',week:1,title:'Feuchtigkeitsursachen und Schimmelbefall fachlich klären',expert:true,steps:[
  'Ursache der Feuchtigkeit klären (Dach, Wände, Leitungen, Fenster)','Vor staubintensiven Arbeiten mögliche Schadstoffe in alten Baustoffen abklären']},
 {id:'P1-04',section:'P1',week:1,title:'Elektroinstallation und Heizgeräte prüfen lassen',expert:true,steps:[
  'Elektrische Anlagen und vorhandene Beleuchtung prüfen lassen','Vorhandene Heizgeräte auf Funktion und Sicherheit prüfen']},
 {id:'P1-05',section:'P1',week:1,title:'Sanierungsreihenfolge und Materialbedarf abstimmen',steps:[
  'Mit dem Vermieter notwendige Reparaturen und Zuständigkeiten klären']},
 {id:'P2-01',section:'P2',week:2,title:'Undichtigkeiten an Dach, Wänden und Fenstern beseitigen',expert:true,steps:[
  'Ursachen für Wassereintritt und Feuchtigkeit beseitigen']},
 {id:'P2-02',section:'P2',week:2,title:'Schimmel fachgerecht sanieren und Bauteile trocknen',expert:true,steps:[
  'Schimmel fachgerecht entfernen lassen bzw. kleinen oberflächlichen Befall unter geeigneten Voraussetzungen beseitigen','Betroffene Wände und Decken vollständig trocknen lassen','Luftfeuchtigkeit in den Räumen überwachen']},
 {id:'P2-03',section:'P2',week:2,title:'Fenster und Türen abdichten',steps:[
  'Fenster auf Undichtigkeiten prüfen','Türen und Türdichtungen überprüfen','Zugluft reduzieren']},
 {id:'P2-04',section:'P2',week:2,title:'Frostgefährdete Leitungen sichern',steps:[
  'Frostgefährdete Wasserleitungen prüfen und sichern']},
 {id:'P2-05',section:'P2',week:2,title:'Grundbeleuchtung in allen drei Räumen herstellen lassen',expert:true,steps:[
  'Vorhandene Deckenleuchten auf weitere Verwendbarkeit prüfen lassen','Sichere Grundbeleuchtung in allen Räumen sicherstellen','Dauerhafte Elektroinstallationen fachgerecht ausführen lassen']},
 {id:'P3-01',section:'P3',week:3,title:'Wände und Decke vorbereiten und ausbessern',steps:[
  'Wände und Decke nach abgeschlossener Feuchtesanierung vorbereiten','Beschädigte Wandstellen ausbessern']},
 {id:'P3-02',section:'P3',week:3,title:'Wände und Decke streichen',steps:[
  'Wände und Decke grundieren und weiß streichen']},
 {id:'P3-03',section:'P3',week:3,title:'Holzboden instand setzen und Raum abdichten',steps:[
  'Holzboden prüfen, reinigen und gegebenenfalls instand setzen','Fenster und Türen im kleinen Raum abdichten']},
 {id:'P3-04',section:'P3',week:4,title:'Endgültige Beleuchtung des kleinen Raums einrichten',expert:true,steps:[
  'LED-Beleuchtung für Raum 1 planen','Beleuchtung im kleinen Raum installieren lassen']},
 {id:'P3-05',section:'P3',week:4,title:'Elektroheizung sicher in Betrieb nehmen',steps:[
  'Geeignete Elektroheizung aufstellen','Raumtemperatur und Luftfeuchtigkeit kontrollieren']},
 {id:'P3-06',section:'P3',week:4,title:'Arbeits- und Aufenthaltsbereich einrichten',steps:[
  'Arbeitstisch, Sitzgelegenheiten und Stauraum einrichten']},
 {id:'P4-01',section:'P4',week:5,title:'Hauptwerkstatt renovieren und Arbeitsplätze einrichten',steps:[
  'LED-Beleuchtung für die Hauptwerkstatt planen','Zusätzliche Arbeitsplatzbeleuchtung vorsehen','Wände und Decken nach Schadensbeseitigung vorbereiten','Beschädigte Putzstellen instand setzen','Wände und Decke streichen','Betonboden reinigen und auf Schäden prüfen','Werkbänke und Maschinenstellplätze festlegen','Steckdosenbedarf und Leitungsführung planen','Arbeitsbereiche ausreichend beleuchten']},
 {id:'P4-02',section:'P4',week:5,title:'Treppe und Galerie auf sichere Nutzung prüfen lassen',expert:true,steps:[
  'Treppe und Galerie auf sichere Nutzung prüfen']},
 {id:'P4-03',section:'P4',week:6,title:'Dritten Raum renovieren und Lagerflächen einrichten',steps:[
  'LED-Beleuchtung für den dritten Raum planen','Spätere Nutzung des dritten Raums festlegen','Wände und Decke renovieren','Boden reinigen und instand setzen','Dauerhafte Beleuchtung herstellen','Regale und Lagerflächen einrichten','Gegebenenfalls zusätzliche Stromversorgung vorsehen','Feuchtigkeit und Raumklima kontrollieren']},
 {id:'P4-04',section:'P4',week:6,title:'Werkzeug-, Material- und Reinigungsorganisation aufbauen',steps:[
  'Sichere Material- und Werkzeuglagerung einrichten']}
];
export const MATERIAL_SEEDS = [
 {id:'MAT-001',title:'Reinigungsgeräte und Handschuhe',phase:'Vor Arbeitsbeginn'},
 {id:'MAT-002',title:'Abdeckmaterial und geeignete Schutzausrüstung',phase:'Vor Arbeitsbeginn'},
 {id:'MAT-003',title:'Sichere Arbeitsleuchten',phase:'Vor Arbeitsbeginn'},
 {id:'MAT-004',title:'Freigegebene Instandsetzungs- und Trocknungsmaterialien',phase:'Nach Schadensbewertung'},
 {id:'MAT-005',title:'Grundierung, Spachtel und Farbe',phase:'Vor Malerarbeiten'},
 {id:'MAT-006',title:'Rollen, Pinsel und Abdeckband',phase:'Vor Malerarbeiten'},
 {id:'MAT-007',title:'Türdichtungen und LED-Beleuchtung',phase:'Vor Fertigstellung Raum 1'},
 {id:'MAT-008',title:'Geeignete Elektroheizung und Thermo-Hygrometer',phase:'Vor Fertigstellung Raum 1'},
 {id:'MAT-009',title:'Werkbank, Stühle und Regale',phase:'Vor Einrichtung'},
 {id:'MAT-010',title:'Werkzeughalterungen und Aufbewahrung',phase:'Vor Einrichtung'}
];
export const MINUTES_PER_HOUR = 60;
