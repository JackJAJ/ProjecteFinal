import './styles.css';
/**
 * Funció de composició utilitzada després en tot el programa
 * @param  {...function} fns 
 * @returns {funcion} Una funció de composició que accepta un argument (x)
 */
const compose = (...fns) => x => fns.reduceRight(async (v, f) => f(await v), x);

/**
 * Fa un console.log de l'argument i el retorna. Útil per a passar com a argument point-free a una funció de composició.
 * @param {*} data 
 * @returns {*} El mateix que entra
 */
const consoleLog = data => (console.log(data), data);

//a) url => promise<partidos[]>
//const json = r => r.json()
/**
 * Necessita l'URL dels partits. Es connecta al servidor i descarrega i transforma en objecte el JSON de partits. 
 * @param {string} url 
 * @returns {Promise} La promesa d'un JSON de partits
 */
const getPartidos = async url => compose(r => r.json(),fetch)(url);


//b) partidos[] => partidos[]
/**
 * Alguns partits estan buits. Aquesta funció retorna un nou array de partits sense els buits.
 * @param {partidos[]} partidos 
 * @returns {partidos[]}
 */
const cleanPartidos = partidos => partidos.filter(p => p.Local != '')

//c) partidos[] => semanas[]
/**
 * Cal agrupar els partits en setmanes. Aquesta funció arreplega un array de partits i els agrupa en un array de setmanes.
 * Cada setmana és un array de partits 
 * @param {partidos[]} partidos 
 * @returns {setmanes[]}
 */
const groupPartidos = partidos => 
   // let semanas = [...new Set((await partidos).map(p => p['Sem.']))]
   // També es pot fer amb l'array de setmanes i fent un filter dels partits
    Object.values(partidos.reduce((semObject,partido) => {
                            semObject[`${partido['Sem.']}`] = semObject[`${partido['Sem.']}`] 
                                ? [...semObject[`${partido['Sem.']}`], partido] 
                                : [partido];
                            return semObject;
                             },{}))

/**
 * Retorna una string amb l'HTML d'un partit com a tr.
 * @param {partido} partido 
 * @returns {string} 
 */
const htmlPartido = partido => `<tr id="partido-${partido['Sem.']}-${partido['Local']}"><td>${partido['Local']}</td><td>${partido['Visitante']}</td> <td>${partido['Marcador']}</td> </tr>`;
/**
 * Retorna una string amb l'HTML d'un array de partits com a files d'una taula
 * @param {partido[]} partidos 
 * @returns {string}
 */
const htmlPartidos = partidos => partidos.map(htmlPartido).join('')

/**
 * Funció currificada que accepta un container i retorna una funció que accepta un array de partits i els clava al container
 * @param {Element} container 
 * @returns {function} 
 */
const renderPartidos = container =>  async partidos => container.innerHTML = htmlPartidos(await partidos);

//d)  semanas[] => table[]
/**
 * Accepta un array de setmanes, crida a la llista de partits de cada setmana i retorna un array de taules HTML.
 * @param {semanas[]} semanas 
 * @returns {Element[]} Les taules de totes les setmanes
 */
const semanaToTable =  semanas =>  semanas.map(semana => { 
    let table = document.createElement('table');
    table.innerHTML = htmlPartidos(semana);
    return table;
})

// e
/**
 * Accepta un element html, el buida i el retorna. Per a insertar en point-free 
 * @param {Element} container 
 * @returns {Element} container
 */
const cleanContainer = container => (container.innerHTML ='', container);
// e) container => tables[] => null (DOM append)
/**
 * Funció currificada que accepta un container i retorna una funció que accepta l'array de taules i les inserta. (Un poc imperativa) 
 * @param {Element} container 
 * @returns {function} La funció currificada que accepta les taules
 */
const addContainer = container => tables => { 
    cleanContainer(container);  
    tables.forEach(table => {
        let divTable = document.createElement('div');
        divTable.append(table);
        container.append(divTable);
        });
}

// f) semanas[] => equipo => semanas[partidos[](filtrados)] 
/**
 * Funció currificada que accepta l'array de setmanes i retorna una funció per filtrar-ho per equip.
 * @param {semana[]} arraySemanas 
 * @returns {function} La funció de filtre 
 */
const filterTeam = arraySemanas => equipo => arraySemanas.map(
    semana => semana.filter(
        partido => partido.Local.includes(equipo) || partido.Visitante.includes(equipo)  
        )
    );

/**
 * El marcador és una string que cal separar en un array
 * @param {string} marcador 
 * @returns {string[]} El marcador en forma d'array
 */
const splitMarcador = marcador => marcador.split('–');

/**
 * Accepta un partit, analitza el marcador i treu el guanyador.
 * @param {partido} partido 
 * @returns {string} 1, 2 o X
 */
const winner = partido => {
    let [golesLocal, golesVisitante] = splitMarcador(partido.Marcador);
    return golesLocal > golesVisitante ? '1' : golesLocal < golesVisitante ? '2' : 'X'; 
}

/**
 * Funció currificada que accepta un equip i retorna una funció que accepta un partit i diu els punts d'eixe equip en eixe partit
 * @param {equipo} equipo 
 * @returns {function} La funció que accepta un partit i retorna els punts de l'equip
 */
const points = equipo => partido => {
    if (partido.Local == equipo){
        return winner(partido) === '1' ? 3 : winner(partido) === 'X' ? 1 : 0;
    } else {
        return winner(partido) === '1' ? 0 : winner(partido) === 'X' ? 1 : 3;
    }
}

/**
 * Funció currificada que accepta un equip i retorna una funció que accepta un partit per treure finalment els gols
 * @param {equipo} equipo 
 * @returns {function} La funció que accepta el partit i retorna els gols
 */
const goals = equipo => partido => {
    let [golesLocal, golesVisitante] = splitMarcador(partido.Marcador);
    return partido.Local == equipo ? {gFavor: golesLocal, gContra : golesVisitante} :  {gFavor: golesVisitante, gContra : golesLocal} ;
}

//h) semanas[] => puntos[] 
/**
 * Funció que accepta un array de setmanes i retorna un array amb els punts finals de cada equip. (un poc imperativa)
 * @param {semana[]} semanas 
 * @returns {{equipo,puntuacion}} Array de objetos con el equipo y sus puntos
 */
const getPoints = (semanas) => {
    let partidos = semanas.flat();
    let equipos = semanas[0].map(p => [p.Local, p.Visitante]).flat();
    let puntos = equipos.map(equipo =>{
        let pointsEquipo = points(equipo);
        let goalsEquipo = goals(equipo);
        let puntuacion = partidos.filter(partido => partido.Local == equipo || partido.Visitante == equipo)
                                 .reduce((estadisticas,partido)=>{
                                   estadisticas.puntos += parseInt(pointsEquipo(partido));
                                   estadisticas.gFavor += parseInt(goalsEquipo(partido).gFavor);
                                   estadisticas.gContra += parseInt(goalsEquipo(partido).gContra);
                                   
                                   return estadisticas;
                                 },{puntos: 0, gFavor: 0, gContra: 0})
        return {equipo,puntuacion}
    });
    return puntos;
}

/**
 * Accepta un array d'objecte dels punts i el retorna ordenat.
 * @param {puntos[]} points 
 * @returns {puntos[]} L'array ordenat
 */
const sortPoints = points => points.sort((a,b) => a.puntuacion.puntos > b.puntuacion.puntos ? 0 : 1);

// h) puntos[] => table
/**
 * Accepta un array de punts i retorna la taula. (un poc imperatiu)
 * @param {puntos[]} points 
 * @returns {Element} La taula dels punts
 */
const pointsToTable = points => {
    let table = document.createElement('table');
    table.innerHTML = '<tr><th>Equipo</th><th>Goles a Favor</th><th>Goles en contra</th><th>Puntos</th></tr>' 
    table.innerHTML += points.map(p => `<tr><td>${p.equipo}</td><td>${p.puntuacion.gFavor}</td><td>${p.puntuacion.gContra}</td><td>${p.puntuacion.puntos}</td></tr>`).join('');
    return [table];
}


const getSemanas = compose(groupPartidos,cleanPartidos,getPartidos);
const renderSemanas = compose(addContainer(document.querySelector('#matches')),semanaToTable,consoleLog);
const renderPoints = compose(addContainer(document.querySelector('#points')),pointsToTable,sortPoints,getPoints,consoleLog);


document.addEventListener('DOMContentLoaded',()=>{
    
    let semanas = getSemanas('liga.json');
    renderSemanas(semanas);
    renderPoints(semanas);

// G)
    document.querySelector('#filter').addEventListener('keyup',async function(){
        compose(
            addContainer(document.querySelector('#matches')),
            semanaToTable,
            filterTeam(await semanas)
        )(this.value);
    });

});
