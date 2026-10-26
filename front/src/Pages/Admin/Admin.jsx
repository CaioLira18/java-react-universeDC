import React, { useEffect, useState, useCallback } from 'react'
import './Admin.css'
import { AUTH_KEY } from '../../auth'

const API_URL = 'http://localhost:8080';

/*
  Para cadastrar um campo novo, basta adicionar uma linha em "fields".
  type: 'text' | 'textarea' | 'number' | 'url' | 'checkbox'
  O "name" precisa ser igual ao atributo da entidade no Java.
*/
const RESOURCES = {
  characters: {
    label: 'Personagens',
    singular: 'personagem',
    path: '/characters',
    titleField: 'name',
    imageField: 'background',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'true_name', label: 'Nome verdadeiro', type: 'text' },
      { name: 'description', label: 'Descrição', type: 'textarea' },
      { name: 'powers', label: 'Poderes', type: 'textarea' },
      { name: 'planet', label: 'Planeta', type: 'text' },
      { name: 'first_appearance', label: 'Primeira aparição', type: 'text' },
      { name: 'first_appearance_year', label: 'Ano da primeira aparição', type: 'number' },
    ],
  },
  movies: {
    label: 'Filmes',
    singular: 'filme',
    path: '/movies',
    titleField: 'title',
    imageField: 'verticalImage',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
      { name: 'year', label: 'Ano de lançamento', type: 'text' },
      { name: 'duration', label: 'Duração', type: 'text' },
    ],
  },
  series: {
    label: 'Séries',
    singular: 'série',
    path: '/series',
    titleField: 'title',
    imageField: 'serieLogo',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
    ],
  },
  games: {
    label: 'Jogos',
    singular: 'jogo',
    path: '/games',
    titleField: 'title',
    imageField: 'gameLogo',
    fields: [
      { name: 'title', label: 'Nome do jogo', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
    ],
  },
  homeSlides: {
    label: 'Destaques da Home',
    singular: 'destaque',
    path: '/home-slides',
    listPath: '/home-slides/admin',
    titleField: 'title',
    imageField: 'image',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'subtitle', label: 'Chamada curta', type: 'text' },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
      { name: 'buttonText', label: 'Texto do botão', type: 'text' },
      { name: 'buttonLink', label: 'Link do botão', type: 'text' },
      { name: 'displayOrder', label: 'Ordem de exibição', type: 'number', defaultValue: 0 },
      { name: 'active', label: 'Publicado na página inicial', type: 'checkbox', defaultValue: true },
    ],
  },
  sagas: {
    label: 'Sagas',
    singular: 'saga',
    path: '/sagas',
    listPath: '/sagas/admin',
    titleField: 'name',
    imageField: 'banner',
    fields: [
      { name: 'name', label: 'Nome da saga', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
      { name: 'startYear', label: 'Ano inicial', type: 'number' },
      { name: 'endYear', label: 'Ano final', type: 'number' },
      { name: 'displayOrder', label: 'Ordem de exibição', type: 'number', defaultValue: 0 },
      { name: 'active', label: 'Publicado', type: 'checkbox', defaultValue: true },
    ],
  },
  groups: {
    label: 'Equipes',
    singular: 'equipe',
    path: '/groups',
    listPath: '/groups/admin',
    titleField: 'name',
    imageField: 'banner',
    fields: [
      { name: 'name', label: 'Nome da equipe', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea' },
      { name: 'groupType', label: 'Tipo de equipe', type: 'text' },
      { name: 'universe', label: 'Universo ou continuidade', type: 'text' },
      { name: 'base', label: 'Base de operações', type: 'text' },
      { name: 'foundedYear', label: 'Ano de formação', type: 'number' },
      { name: 'firstAppearance', label: 'Primeira aparição', type: 'text' },
      { name: 'displayOrder', label: 'Ordem de exibição', type: 'number', defaultValue: 0 },
      { name: 'active', label: 'Publicada', type: 'checkbox', defaultValue: true },
    ],
  },
  planets: {
    label: 'Planetas',
    singular: 'planeta',
    path: '/planets',
    titleField: 'name',
    imageField: 'image',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea' },
      { name: 'sector', label: 'Setor ou galáxia', type: 'text' },
      { name: 'color', label: 'Cor do planeta (hexadecimal)', type: 'text' },
      { name: 'notableResidents', label: 'Habitantes notáveis', type: 'textarea' },
      { name: 'positionX', label: 'Posição X no mapa', type: 'number' },
      { name: 'positionY', label: 'Posição Y no mapa', type: 'number' },
      { name: 'positionZ', label: 'Posição Z no mapa', type: 'number' },
      { name: 'size', label: 'Tamanho no mapa', type: 'number' },
    ],
  },
  timelines: {
    label: 'Linha do tempo',
    singular: 'marco da timeline',
    path: '/timelines',
    listPath: '/timelines/admin',
    titleField: 'title',
    imageField: 'image',
    fields: [
      { name: 'year', label: 'Ano', type: 'text', required: true },
      { name: 'era', label: 'Era', type: 'text', required: true },
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea' },
      { name: 'imageAlt', label: 'Texto alternativo da imagem', type: 'text' },
      { name: 'accent', label: 'Cor do destaque (blue, yellow ou red)', type: 'text', defaultValue: 'yellow' },
      { name: 'displayOrder', label: 'Ordem de exibição', type: 'number', defaultValue: 0 },
      { name: 'active', label: 'Publicado', type: 'checkbox', defaultValue: true },
    ],
  },
};

const emptyForm = (fields) =>
  Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? '']));

const newSagaComic = () => ({
  name: '',
  releaseYear: '',
  description: '',
  coverImage: '',
  file: null,
})

const CHARACTER_PRESETS = {
  superman: {
    name: 'Superman',
    true_name: 'Clark Kent (Kal-El)',
    description: 'Último filho de Krypton, criado em Smallville e protetor de Metrópolis.',
    powers: 'Superforça, voo, supervelocidade, visão de calor, visão de raio X e invulnerabilidade.',
    planet: 'Krypton',
    first_appearance: 'Action Comics #1',
    first_appearance_year: '1938',
  },
  batman: {
    name: 'Batman',
    true_name: 'Bruce Wayne',
    description: 'Vigilante de Gotham City que combate o crime usando inteligência, preparo físico e tecnologia.',
    powers: 'Sem superpoderes; mestre em artes marciais, estratégia, investigação e uso de equipamentos.',
    planet: 'Terra',
    first_appearance: 'Detective Comics #27',
    first_appearance_year: '1939',
  },
  beastBoy: {
    name: 'Mutano',
    true_name: 'Garfield Logan',
    description: 'Herói e integrante dos Jovens Titãs, conhecido por seu humor e espírito de equipe.',
    powers: 'Pode se transformar em diferentes animais e assumir as habilidades físicas deles.',
    planet: 'Terra',
    first_appearance: 'Doom Patrol #99',
    first_appearance_year: '1965',
  },
  aquaman: {
    name: 'Aquaman',
    true_name: 'Arthur Curry',
    description: 'Rei da Atlântida e protetor dos oceanos, ligado tanto ao mundo submarino quanto à superfície.',
    powers: 'Respiração subaquática, força e resistência ampliadas, natação em alta velocidade e comunicação com a vida marinha.',
    planet: 'Terra',
    first_appearance: 'More Fun Comics #73',
    first_appearance_year: '1941',
  },
  mera: {
    name: 'Mera',
    true_name: 'Mera',
    description: 'Guerreira de Xebel, rainha da Atlântida e aliada de Aquaman.',
    powers: 'Hidrocinésia: controla e molda a água, além de possuir força e resistência sobre-humanas.',
    planet: 'Xebel',
    first_appearance: 'Aquaman #11',
    first_appearance_year: '1963',
  },
  flash: {
    name: 'Flash',
    true_name: 'Barry Allen',
    description: 'Cientista forense de Central City que usa seus poderes para proteger pessoas e combater o crime.',
    powers: 'Supervelocidade, reflexos ampliados e conexão com a Força de Aceleração.',
    planet: 'Terra',
    first_appearance: 'Showcase #4',
    first_appearance_year: '1956',
  },
  wonderWoman: {
    name: 'Mulher-Maravilha',
    true_name: 'Diana de Themyscira',
    description: 'Princesa amazona e embaixadora de Themyscira, dedicada à justiça e à paz.',
    powers: 'Força, velocidade e resistência sobre-humanas; grande habilidade de combate e uso do laço da verdade.',
    planet: 'Terra',
    first_appearance: 'All Star Comics #8',
    first_appearance_year: '1941',
  },
  greenLantern: {
    name: 'Lanterna Verde',
    true_name: 'Hal Jordan',
    description: 'Piloto terrestre escolhido para integrar a Tropa dos Lanternas Verdes.',
    powers: 'Anel de poder que cria construções de energia e permite voo e proteção, alimentado pela força de vontade.',
    planet: 'Terra',
    first_appearance: 'Showcase #22',
    first_appearance_year: '1959',
  },
  cyborg: {
    name: 'Ciborgue',
    true_name: 'Victor Stone',
    description: 'Herói cuja vida mudou após um acidente que o deixou integrado a tecnologia avançada.',
    powers: 'Força ampliada, sistemas tecnológicos integrados, interface com computadores e armamentos cibernéticos.',
    planet: 'Terra',
    first_appearance: 'DC Comics Presents #26',
    first_appearance_year: '1980',
  },
  raven: {
    name: 'Ravena',
    true_name: 'Rachel Roth',
    description: 'Empata reservada e integrante dos Jovens Titãs, que busca controlar sua herança mística.',
    powers: 'Empatia, telecinese, projeção astral e magia.',
    planet: 'Terra',
    first_appearance: 'DC Comics Presents #26',
    first_appearance_year: '1980',
  },
  starfire: {
    name: 'Estelar',
    true_name: "Koriand'r",
    description: 'Princesa de Tamaran e integrante dos Jovens Titãs, conhecida por sua coragem e energia.',
    powers: 'Voo, força sobre-humana e rajadas de energia estelar.',
    planet: 'Tamaran',
    first_appearance: 'DC Comics Presents #26',
    first_appearance_year: '1980',
  },
  greenArrow: {
    name: 'Arqueiro Verde',
    true_name: 'Oliver Queen',
    description: 'Herói de Star City que usa suas habilidades de arqueiro para defender sua comunidade.',
    powers: 'Sem superpoderes; arqueiro de elite, estrategista e combatente experiente.',
    planet: 'Terra',
    first_appearance: 'More Fun Comics #73',
    first_appearance_year: '1941',
  },
  nightwing: {
    name: 'Asa Noturna',
    true_name: 'Dick Grayson',
    description: 'Herói de Blüdhaven, antigo parceiro de Batman e líder experiente dos Jovens Titãs.',
    powers: 'Sem superpoderes; acrobata excepcional, estrategista e especialista em artes marciais.',
    planet: 'Terra',
    first_appearance: 'Tales of the Teen Titans #44',
    first_appearance_year: '1984',
  },
  joker: {
    name: 'Coringa',
    true_name: 'Desconhecido',
    description: 'Criminoso imprevisível de Gotham City e um dos adversários mais conhecidos de Batman.',
    powers: 'Sem superpoderes; especialista em crimes elaborados, manipulação e uso de toxinas.',
    planet: 'Terra',
    first_appearance: 'Batman #1',
    first_appearance_year: '1940',
  },
  johnConstantine: {
    name: 'John Constantine',
    true_name: 'John Constantine',
    description: 'Detetive do oculto e mago inglês que enfrenta ameaças sobrenaturais usando conhecimento, astúcia e métodos pouco convencionais.',
    powers: 'Conhecimento avançado de ocultismo, rituais e exorcismo; habilidade em investigação, ilusionismo e manipulação.',
    planet: 'Terra',
    first_appearance: 'The Saga of the Swamp Thing #37',
    first_appearance_year: '1985',
  },
  etrigan: {
    name: 'Etrigan',
    true_name: 'Jason Blood',
    description: 'Demônio ligado por Merlin ao cavaleiro Jason Blood, alternando entre a vida humana e uma poderosa forma demoníaca.',
    powers: 'Força e resistência sobre-humanas, fogo infernal, longevidade e conhecimento místico.',
    planet: 'Inferno',
    first_appearance: 'The Demon #1',
    first_appearance_year: '1972',
  },
  swampThing: {
    name: 'Monstro do Pântano',
    true_name: 'Alec Holland',
    description: 'Guardião do Verde, força elemental conectada à vida vegetal e protetor do equilíbrio natural.',
    powers: 'Controle e regeneração de matéria vegetal, conexão com o Verde, mudança de forma e consciência distribuída pela vegetação.',
    planet: 'Terra',
    first_appearance: 'House of Secrets #92',
    first_appearance_year: '1971',
  },
  deadman: {
    name: 'Desafiador',
    true_name: 'Boston Brand',
    description: 'Artista de circo assassinado que retorna como espírito e ajuda os vivos enquanto busca justiça.',
    powers: 'Como espírito, pode possuir temporariamente pessoas vivas e atravessar objetos.',
    planet: 'Terra',
    first_appearance: 'Strange Adventures #205',
    first_appearance_year: '1967',
  },
  zatanna: {
    name: 'Zatanna',
    true_name: 'Zatanna Zatara',
    description: 'Mágica de palco e poderosa feiticeira que protege o mundo de ameaças místicas.',
    powers: 'Magia conjurada principalmente ao pronunciar palavras ao contrário; grande conhecimento de artes arcanas.',
    planet: 'Terra',
    first_appearance: 'Hawkman #4',
    first_appearance_year: '1964',
  },
  doctorFate: {
    name: 'Doutor Destino',
    true_name: 'Kent Nelson',
    description: 'Um dos principais usuários de magia da Terra, ligado ao elmo de Nabu e à antiga Ordem dos Senhores da Ordem.',
    powers: 'Magia poderosa, voo, proteção mística, teletransporte e conhecimento arcano concedidos pelo elmo de Nabu.',
    planet: 'Terra',
    first_appearance: 'More Fun Comics #55',
    first_appearance_year: '1940',
  },
  madameXanadu: {
    name: 'Madame Xanadu',
    true_name: 'Nimue Inwudu',
    description: 'Vidente e conselheira mística que auxilia heróis em conflitos envolvendo magia e forças sobrenaturais.',
    powers: 'Clarividência, leitura de tarô, longevidade e conhecimento de magia e ocultismo.',
    planet: 'Terra',
    first_appearance: 'Doorway to Nightmare #1',
    first_appearance_year: '1978',
  },
  frankenstein: {
    name: 'Frankenstein',
    true_name: 'Frankenstein',
    description: 'Criatura reanimada de grande longevidade que atua como guerreiro e investigador de ameaças sobrenaturais.',
    powers: 'Força e resistência sobre-humanas, longevidade e experiência em combate.',
    planet: 'Terra',
    first_appearance: 'Frankenstein #1',
    first_appearance_year: '1973',
  },
  detectiveChimp: {
    name: 'Detetive Chimp',
    true_name: 'Bobo T. Chimpanzee',
    description: 'Chimpanzé inteligente e detetive excepcional, frequentemente envolvido em mistérios e casos sobrenaturais.',
    powers: 'Inteligência extraordinária, habilidades de investigação e domínio de diversos idiomas.',
    planet: 'Terra',
    first_appearance: 'The Adventures of Rex the Wonder Dog #4',
    first_appearance_year: '1952',
  },
}

const DCAMU_MOVIE_PRESETS = [
  {
    title: 'Justice League: The Flashpoint Paradox',
    year: '2013',
    duration: '81 min',
    description: 'Flash altera o passado ao tentar salvar sua família e desperta uma realidade devastada por uma guerra entre Atlântida e Themyscira.',
  },
  {
    title: 'Justice League: War',
    year: '2014',
    duration: '79 min',
    description: 'Uma invasão alienígena reúne Batman, Superman, Mulher-Maravilha, Flash, Lanterna Verde, Shazam e Ciborgue na formação da Liga da Justiça.',
  },
  {
    title: 'Son of Batman',
    year: '2014',
    duration: '74 min',
    description: 'Batman descobre a existência de Damian Wayne e precisa lidar com o filho enquanto enfrenta uma disputa ligada à Liga dos Assassinos.',
  },
  {
    title: 'Justice League: Throne of Atlantis',
    year: '2015',
    duration: '72 min',
    description: 'A Liga da Justiça enfrenta uma ameaça vinda de Atlântida enquanto Arthur Curry descobre sua ligação com o reino submarino.',
  },
  {
    title: 'Batman vs. Robin',
    year: '2015',
    duration: '80 min',
    description: 'O conflito entre Batman e Damian aumenta quando Robin se aproxima de uma sociedade secreta que atua nas sombras de Gotham.',
  },
  {
    title: 'Batman: Bad Blood',
    year: '2016',
    duration: '72 min',
    description: 'Batwoman desaparece após um confronto, levando Batman e seus aliados a investigar uma conspiração que ameaça Gotham.',
  },
  {
    title: 'Justice League vs. Teen Titans',
    year: '2016',
    duration: '78 min',
    description: 'Damian se junta aos Jovens Titãs, que precisam enfrentar uma força sobrenatural capaz de colocar a Liga da Justiça sob controle.',
  },
  {
    title: 'Justice League Dark',
    year: '2017',
    duration: '75 min',
    description: 'Batman se une a John Constantine, Zatanna e outros especialistas em magia para investigar ataques de origem sobrenatural.',
  },
  {
    title: 'Teen Titans: The Judas Contract',
    year: '2017',
    duration: '84 min',
    description: 'Os Jovens Titãs recebem uma nova integrante enquanto enfrentam um plano de Exterminador que ameaça a equipe.',
  },
  {
    title: 'Suicide Squad: Hell to Pay',
    year: '2018',
    duration: '86 min',
    description: 'Amanda Waller envia o Esquadrão Suicida em uma missão perigosa para recuperar um objeto místico disputado por vários inimigos.',
  },
  {
    title: 'The Death of Superman',
    year: '2018',
    duration: '81 min',
    description: 'A chegada de Apocalypse desencadeia uma batalha de proporções inéditas e coloca Superman diante de seu maior sacrifício.',
  },
  {
    title: 'Constantine: City of Demons',
    year: '2018',
    duration: '90 min',
    description: 'John Constantine busca salvar a filha de um velho amigo e enfrenta forças demoníacas em uma jornada marcada por magia e consequências pessoais.',
  },
  {
    title: 'Reign of the Supermen',
    year: '2019',
    duration: '87 min',
    description: 'Após a ausência de Superman, novos heróis surgem para ocupar seu lugar enquanto Lois Lane procura descobrir o que realmente aconteceu.',
  },
  {
    title: 'Batman: Hush',
    year: '2019',
    duration: '82 min',
    description: 'Um inimigo misterioso manipula aliados e adversários de Batman, colocando em risco sua identidade e seus relacionamentos.',
  },
  {
    title: 'Wonder Woman: Bloodlines',
    year: '2019',
    duration: '83 min',
    description: 'Mulher-Maravilha enfrenta uma organização criminosa e criaturas mitológicas enquanto tenta proteger uma jovem em perigo.',
  },
  {
    title: 'Justice League Dark: Apokolips War',
    year: '2020',
    duration: '90 min',
    description: 'Após uma derrota devastadora diante de Darkseid, os heróis sobreviventes tentam organizar uma última resistência para salvar a Terra.',
  },
]

const SAGA_PRESETS = {
  new52: {
    name: 'New 52',
    description: 'Iniciativa editorial da DC que relançou suas séries em 2011, apresentando novas origens e uma continuidade compartilhada para seus heróis. A fase principal foi substituída pela iniciativa DC Rebirth em 2016.',
    startYear: '2011',
    endYear: '2016',
    displayOrder: '1',
    active: true,
  },
  absolute: {
    name: 'Universo Absolute',
    description: 'Uma linha alternativa da DC que reimagina seus heróis em um mundo mais hostil e com menos recursos. Batman, Superman e Mulher-Maravilha seguem origens próprias, em histórias independentes da continuidade principal.',
    startYear: '2024',
    endYear: '',
    displayOrder: '2',
    active: true,
  },
  goldenAge: {
    name: 'Era de Ouro',
    description: 'Período inicial dos quadrinhos de super-heróis da DC, marcado pela estreia de personagens como Superman, Batman, Flash, Lanterna Verde, Mulher-Maravilha e pela formação da Sociedade da Justiça. É geralmente situado entre o fim da década de 1930 e meados da década de 1950.',
    startYear: '1938',
    endYear: '1956',
    displayOrder: '0',
    active: true,
  },
}

const GOLDEN_AGE_COMICS = [
  {
    name: 'Action Comics #1',
    releaseYear: '1938',
    description: 'Edição histórica que apresentou Superman e é considerada um marco no início da era dos super-heróis.',
  },
  {
    name: 'Detective Comics #27',
    releaseYear: '1939',
    description: 'Primeira aparição de Batman, em uma aventura de investigação que apresentou o vigilante de Gotham.',
  },
  {
    name: 'Superman #1',
    releaseYear: '1939',
    description: 'Primeira revista solo do Superman, reunindo histórias do herói em uma publicação própria.',
  },
  {
    name: 'Flash Comics #1',
    releaseYear: '1940',
    description: 'Edição de estreia de Flash, na versão de Jay Garrick, e de Hawkman.',
  },
  {
    name: 'All-American Comics #16',
    releaseYear: '1940',
    description: 'Apresenta a primeira aparição de Alan Scott, o Lanterna Verde da Era de Ouro.',
  },
  {
    name: 'All-Star Comics #3',
    releaseYear: '1940',
    description: 'Reúne heróis que formariam a Sociedade da Justiça, uma das primeiras equipes de super-heróis dos quadrinhos.',
  },
  {
    name: 'Batman #1',
    releaseYear: '1940',
    description: 'Primeira edição da revista solo de Batman, com as primeiras aparições do Coringa e da Mulher-Gato.',
  },
  {
    name: 'All-Star Comics #8',
    releaseYear: '1941',
    description: 'Apresenta a primeira aparição de Mulher-Maravilha, personagem que se tornaria uma das principais heroínas da DC.',
  },
  {
    name: 'Wonder Woman #1',
    releaseYear: '1942',
    description: 'Primeira edição da revista solo de Mulher-Maravilha, expandindo as aventuras de Diana.',
  },
]

const NEW52_COMICS = [
  {
    name: 'Justice League: Origin',
    releaseYear: '2012',
    description: 'A formação inicial da Liga da Justiça enfrenta uma invasão que reúne pela primeira vez alguns dos maiores heróis da Terra.',
  },
  {
    name: 'Batman: The Court of Owls',
    releaseYear: '2012',
    description: 'Batman investiga uma sociedade secreta ligada à história de Gotham e descobre uma ameaça que conhece a cidade melhor do que ele.',
  },
  {
    name: 'Batman: The City of Owls',
    releaseYear: '2012',
    description: 'A conspiração da Corte das Corujas avança sobre Gotham, colocando a cidade e seus aliados em risco.',
  },
  {
    name: 'Aquaman: The Trench',
    releaseYear: '2012',
    description: 'Aquaman investiga criaturas desconhecidas que emergem das profundezas e ameaçam a população costeira.',
  },
  {
    name: 'Wonder Woman: Blood',
    releaseYear: '2012',
    description: 'Uma nova origem para Diana a envolve em conflitos entre os deuses do Olimpo e em revelações sobre sua família.',
  },
  {
    name: 'The Flash: Move Forward',
    releaseYear: '2012',
    description: 'Barry Allen encara um novo inimigo e tenta compreender as consequências de seus poderes enquanto protege Central City.',
  },
  {
    name: 'Batman: Death of the Family',
    releaseYear: '2013',
    description: 'O Coringa retorna com um plano para separar Batman dos aliados que se tornaram parte de sua família.',
  },
  {
    name: 'Superman Unchained',
    releaseYear: '2013',
    description: 'Superman enfrenta uma força de poder extraordinário e questiona seu papel em um mundo que também desenvolve novas armas.',
  },
  {
    name: 'Forever Evil',
    releaseYear: '2014',
    description: 'Com a Liga da Justiça fora de ação, os vilões assumem o controle e os sobreviventes precisam formar alianças improváveis.',
  },
  {
    name: 'Darkseid War',
    releaseYear: '2015',
    description: 'A Liga da Justiça fica no centro de uma guerra cósmica entre Darkseid e o Anti-Monitor, com consequências para seus integrantes.',
  },
]

const DC_SERIES_PRESETS = [
  {
    title: 'Smallville',
    description: 'Acompanha a juventude de Clark Kent em Smallville, sua descoberta dos poderes e o caminho que o levará a se tornar Superman.',
  },
  {
    title: 'Arrow',
    description: 'Após anos desaparecido, Oliver Queen retorna a Starling City e assume a missão de proteger a cidade como um arqueiro vigilante.',
  },
  {
    title: 'The Flash',
    description: 'Depois de um acidente no acelerador de partículas, o investigador Barry Allen ganha supervelocidade e passa a proteger Central City.',
  },
  {
    title: 'Supergirl',
    description: 'Kara Danvers decide usar seus poderes kryptonianos para defender National City e encontrar seu próprio lugar como heroína.',
  },
  {
    title: 'DC’s Legends of Tomorrow',
    description: 'Um grupo improvável de heróis e fora da lei viaja pelo tempo para impedir ameaças que podem alterar a história.',
  },
  {
    title: 'Gotham',
    description: 'Antes da ascensão de Batman, o jovem detetive James Gordon enfrenta o crime e acompanha o surgimento de figuras marcantes de Gotham.',
  },
  {
    title: 'Titans',
    description: 'Dick Grayson reúne jovens heróis como Rachel Roth, Kory Anders e Gar Logan para enfrentar ameaças e construir uma nova equipe.',
  },
  {
    title: 'Jovens Titãs (2003)',
    description: 'Robin, Estelar, Ciborgue, Ravena e Mutano formam uma equipe de jovens heróis que protege Jump City e enfrenta vilões enquanto aprendem a trabalhar juntos.',
  },
  {
    title: 'Os Jovens Titãs em Ação! (2013)',
    description: 'Em uma versão cômica e mais leve, Robin, Estelar, Ciborgue, Ravena e Mutano vivem aventuras e situações cotidianas na Torre dos Titãs.',
  },
  {
    title: 'Doom Patrol',
    description: 'Um grupo de pessoas marginalizadas, transformadas por acidentes extraordinários, encontra uma família e enfrenta perigos surreais.',
  },
  {
    title: 'Superman & Lois',
    description: 'Clark Kent e Lois Lane equilibram a vida familiar em Smallville com os desafios de proteger o mundo como Superman.',
  },
  {
    title: 'Peacemaker',
    description: 'Christopher Smith, o Pacificador, é recrutado para missões secretas que colocam à prova sua visão distorcida de justiça.',
  },
  {
    title: 'Harley Quinn',
    description: 'Depois de romper com o Coringa, Harley Quinn busca seu espaço no submundo de Gotham ao lado de uma equipe de aliados excêntricos.',
  },
  {
    title: 'Young Justice',
    description: 'Jovens heróis como Robin, Superboy, Miss Martian e Aqualad formam uma equipe secreta e assumem missões próprias.',
  },
  {
    title: 'Batman: The Animated Series',
    description: 'Batman combate o crime em Gotham em uma série animada reconhecida por sua atmosfera noir e por reinterpretar personagens clássicos.',
  },
  {
    title: 'Justice League Unlimited',
    description: 'A Liga da Justiça amplia sua equipe e reúne heróis de todo o universo DC para enfrentar ameaças globais e cósmicas.',
  },
]

const DC_GAME_PRESETS = [
  {
    title: 'Batman: Arkham Asylum',
    description: 'Batman precisa deter o Coringa após ele assumir o controle do Asilo Arkham e libertar diversos criminosos de Gotham.',
  },
  {
    title: 'Batman: Arkham City',
    description: 'Batman investiga uma enorme prisão a céu aberto construída dentro de Gotham e descobre um plano que ameaça seus habitantes.',
  },
  {
    title: 'Batman: Arkham Origins',
    description: 'Uma aventura ambientada nos primeiros anos de Batman, quando uma recompensa atrai assassinos perigosos para Gotham na véspera de Natal.',
  },
  {
    title: 'Batman: Arkham Knight',
    description: 'Batman enfrenta o Espantalho e uma nova ameaça que mobiliza Gotham, enquanto tenta proteger a cidade durante uma noite decisiva.',
  },
  {
    title: 'Injustice: Gods Among Us',
    description: 'Em uma realidade alternativa, Superman estabelece um regime mundial e antigos aliados se dividem entre apoiá-lo ou resistir.',
  },
  {
    title: 'Injustice 2',
    description: 'Heróis e vilões se enfrentam em um mundo ainda abalado pelo regime de Superman, enquanto uma nova ameaça se aproxima da Terra.',
  },
  {
    title: 'LEGO Batman: The Videogame',
    description: 'Batman e Robin enfrentam vilões de Gotham em uma aventura de ação e quebra-cabeças construída no universo LEGO.',
  },
  {
    title: 'LEGO Batman 2: DC Super Heroes',
    description: 'Batman e Robin se unem a Superman e outros heróis da DC para impedir os planos de Lex Luthor e do Coringa.',
  },
  {
    title: 'LEGO Batman 3: Beyond Gotham',
    description: 'Batman e diversos heróis da DC viajam pelo espaço para enfrentar Brainiac e proteger os Lanternas e seus mundos.',
  },
  {
    title: 'DC Universe Online',
    description: 'Um RPG online ambientado no universo DC em que jogadores criam seus próprios heróis ou vilões e participam de aventuras ao lado de personagens conhecidos.',
  },
  {
    title: 'Batman: The Telltale Series',
    description: 'Uma aventura narrativa que acompanha Bruce Wayne e Batman diante de escolhas difíceis que afetam Gotham e seus aliados.',
  },
  {
    title: 'Gotham Knights',
    description: 'Após a morte de Bruce Wayne, Batgirl, Asa Noturna, Capuz Vermelho e Robin protegem Gotham e investigam a Corte das Corujas.',
  },
  {
    title: 'Suicide Squad: Kill the Justice League',
    description: 'Arlequina, Pistoleiro, Tubarão-Rei e Capitão Bumerangue recebem a missão de enfrentar membros da Liga da Justiça sob controle de Brainiac.',
  },
]

const DC_PLANET_PRESETS = [
  {
    name: 'Terra',
    description: 'Mundo natal da maioria dos heróis da Liga da Justiça e centro de inúmeras ameaças cósmicas.',
    sector: 'Setor 2814',
    color: '#4da6ff',
    notableResidents: 'Superman, Batman, Mulher-Maravilha, Flash, Lanterna Verde',
    positionX: '0',
    positionY: '0',
    positionZ: '0',
    size: '1.3',
  },
  {
    name: 'Marte',
    description: 'Mundo natal dos marcianos, devastado por uma guerra que deixou poucos sobreviventes.',
    sector: 'Setor 2814',
    color: '#d95745',
    notableResidents: 'Caçador de Marte (J’onn J’onzz), marcianos verdes e brancos',
    positionX: '3',
    positionY: '4',
    positionZ: '-4',
    size: '0.95',
  },
  {
    name: 'Tamaran',
    description: 'Mundo de alta gravidade conhecido por sua cultura guerreira e pelos habitantes de pele alaranjada.',
    sector: 'Sistema Vega',
    color: '#ff9c43',
    notableResidents: 'Estelar (Koriand’r), Komand’r, tamaraneanos',
    positionX: '-22',
    positionY: '8',
    positionZ: '-14',
    size: '1.1',
  },
  {
    name: 'Xebel',
    description: 'Reino extradimensional ligado à Atlântida, de onde Mera veio antes de se tornar uma de suas principais líderes.',
    sector: 'Dimensão de Xebel',
    color: '#42c9c4',
    notableResidents: 'Mera, Nereus, xebelianos',
    positionX: '23',
    positionY: '3',
    positionZ: '-11',
    size: '0.9',
  },
  {
    name: 'Rann',
    description: 'Planeta avançado que mantém uma ligação histórica com a Terra por meio do cientista e aventureiro Adam Strange.',
    sector: 'Sistema Alpha Centauri',
    color: '#71a7ff',
    notableResidents: 'Adam Strange, Alanna, rannianos',
    positionX: '-26',
    positionY: '-4',
    positionZ: '-24',
    size: '1.05',
  },
  {
    name: 'Daxam',
    description: 'Mundo habitado por descendentes de kryptonianos; seus habitantes compartilham poderes semelhantes sob um sol amarelo, mas são vulneráveis ao chumbo.',
    sector: 'Setor 1760',
    color: '#e6a64a',
    notableResidents: 'Mon-El, daxamitas',
    positionX: '25',
    positionY: '10',
    positionZ: '-26',
    size: '1.0',
  },
  {
    name: 'Colu',
    description: 'Planeta conhecido por sua população altamente inteligente e por avanços extraordinários em ciência e tecnologia.',
    sector: 'Setor 2810',
    color: '#72d696',
    notableResidents: 'Brainiac, Brainiac 5, coluanos',
    positionX: '-1',
    positionY: '18',
    positionZ: '-32',
    size: '0.95',
  },
  {
    name: 'Korugar',
    description: 'Planeta natal de Sinestro, cuja história está ligada à Tropa dos Lanternas Verdes e à criação da Tropa Sinestro.',
    sector: 'Setor 1417',
    color: '#e24c43',
    notableResidents: 'Sinestro, Soranik Natu, korugarianos',
    positionX: '29',
    positionY: '-10',
    positionZ: '-8',
    size: '1.0',
  },
  {
    name: 'Qward',
    description: 'Mundo antimatéria e lar dos Armeiros de Qward, inimigos históricos dos Lanternas Verdes.',
    sector: 'Universo de antimatéria',
    color: '#d8c64a',
    notableResidents: 'Armeiros de Qward, Anti-Monitor',
    positionX: '-31',
    positionY: '5',
    positionZ: '-12',
    size: '1.0',
  },
  {
    name: 'Warworld',
    description: 'Planeta artificial transformado em uma fortaleza e arena de combate, conhecido por seus governantes conquistadores.',
    sector: 'Espaço profundo',
    color: '#b95d48',
    notableResidents: 'Mongul, gladiadores e povos conquistados',
    positionX: '0',
    positionY: '-18',
    positionZ: '-32',
    size: '1.5',
  },
  {
    name: 'Gemworld',
    description: 'Mundo mágico dividido em reinos associados a pedras preciosas e conectado às aventuras de Amethyst.',
    sector: 'Dimensão mágica',
    color: '#bd78e8',
    notableResidents: 'Amethyst, Lorde Opal, habitantes dos reinos-gema',
    positionX: '30',
    positionY: '14',
    positionZ: '-18',
    size: '0.9',
  },
  {
    name: 'Ysmault',
    description: 'Mundo-prisão devastado que se tornou o refúgio e centro de poder da Tropa dos Lanternas Vermelhos.',
    sector: 'Setor 666',
    color: '#f04437',
    notableResidents: 'Atrocitus, Lanternas Vermelhos',
    positionX: '-28',
    positionY: '-13',
    positionZ: '-30',
    size: '0.9',
  },
  {
    name: 'Czarnia',
    description: 'Planeta natal dos czarnianos, destruído após a ação de um de seus habitantes mais perigosos.',
    sector: 'Setor 2813',
    color: '#b7c7d9',
    notableResidents: 'Lobo, czarnianos',
    positionX: '3',
    positionY: '24',
    positionZ: '-24',
    size: '0.85',
  },
  {
    name: 'Htrae (Mundo Bizarro)',
    description: 'Planeta de forma cúbica associado ao universo Bizarro, onde muitas coisas acontecem ao contrário.',
    sector: 'Universo Bizarro',
    color: '#c7a5e8',
    notableResidents: 'Bizarro, habitantes Bizarro',
    positionX: '34',
    positionY: '-19',
    positionZ: '-32',
    size: '0.85',
  },
]

const DC_GROUP_PRESETS = [
  {
    name: 'Liga da Justiça',
    description: 'A principal aliança de heróis da Terra, reunida para proteger o planeta de ameaças que nenhum integrante conseguiria enfrentar sozinho.',
    groupType: 'Equipe de super-heróis',
    universe: 'Universo DC',
    base: 'Sala de Justiça / Torre de Vigilância',
    foundedYear: '1960',
    firstAppearance: 'The Brave and the Bold #28',
    displayOrder: '1',
    active: true,
    memberAliases: [
      ['Superman', 'Clark Kent'],
      ['Batman', 'Bruce Wayne'],
      ['Mulher-Maravilha', 'Wonder Woman', 'Diana'],
      ['Flash', 'Barry Allen'],
      ['Lanterna Verde', 'Green Lantern', 'Hal Jordan'],
      ['Aquaman', 'Arthur Curry'],
      ['Ciborgue', 'Cyborg', 'Victor Stone'],
    ],
  },
  {
    name: 'Jovens Titãs',
    description: 'Equipe de jovens heróis que une diferentes gerações e poderes para proteger o mundo, crescer como indivíduos e provar seu valor ao lado dos grandes heróis.',
    groupType: 'Equipe de jovens super-heróis',
    universe: 'Universo DC',
    base: 'Torre dos Titãs',
    foundedYear: '1964',
    firstAppearance: 'The Brave and the Bold #54',
    displayOrder: '2',
    active: true,
    memberAliases: [
      ['Robin', 'Dick Grayson'],
      ['Mutano', 'Beast Boy', 'Garfield Logan'],
      ['Ravena', 'Raven', 'Rachel Roth'],
      ['Estelar', 'Starfire', 'Koriand’r', "Koriand'r"],
      ['Ciborgue', 'Cyborg', 'Victor Stone'],
    ],
  },
  {
    name: 'Liga da Justiça Sombria',
    description: 'Grupo especializado em ameaças mágicas e sobrenaturais, reunindo especialistas e seres extraordinários para defender a realidade de perigos ocultos.',
    groupType: 'Equipe de heróis sobrenaturais',
    universe: 'Universo DC',
    base: 'Casa dos Mistérios',
    foundedYear: '2011',
    firstAppearance: 'Justice League Dark #1',
    displayOrder: '3',
    active: true,
    memberAliases: [
      ['John Constantine', 'Constantine'],
      ['Etrigan', 'Jason Blood'],
      ['Zatanna', 'Zatanna Zatara'],
      ['Desafiador', 'Deadman', 'Boston Brand'],
      ['Monstro do Pântano', 'Swamp Thing', 'Alec Holland'],
      ['Madame Xanadu', 'Nimue Inwudu'],
      ['Doutor Destino', 'Doctor Fate', 'Kent Nelson'],
      ['Frankenstein', 'Victor Frankenstein'],
      ['Detetive Chimp', 'Detective Chimp', 'Bobo T. Chimpanzee'],
    ],
  },
]

const STARFIRE_HOME_SLIDE_PRESET = {
  title: 'Starfire',
  subtitle: 'Conheça a Starfire',
  description: 'Princesa guerreira de Tamaran, Koriand’r encontrou uma nova família entre os Jovens Titãs. Com coragem, compaixão e seus poderes estelares, ela protege seus amigos e a Terra.',
  buttonText: 'Conheça mais',
  buttonLink: '/characters',
  displayOrder: '0',
  active: true,
}

const JUSTICE_LEAGUE_WAR_HOME_SLIDE_PRESET = {
  title: 'Liga da Justiça: War',
  subtitle: 'Uma aliança contra Darkseid',
  description: 'Quando uma invasão ameaça a Terra, Batman, Superman, Mulher-Maravilha e outros heróis precisam unir forças. A batalha contra Darkseid marca o início de uma nova Liga da Justiça.',
  buttonText: 'Ver filme',
  buttonLink: '/catalog?category=movie',
  displayOrder: '1',
  active: true,
}

const normalizeCharacterName = (name) => String(name || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('pt-BR')
  .replace(/[^a-z0-9]/g, '')

const request = async (method, path, body) => {
  let auth = null
  try {
    auth = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch (error) {
    console.error('Não foi possível ler a sessão para a chamada administrativa.', error)
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const responseText = await res.text()
    throw new Error(responseText || `Erro ${res.status} ao falar com a API`)
  }
  return res.status === 204 ? null : res.json();
};

const uploadMedia = async (path, file) => {
  let auth = null
  try {
    auth = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch (error) {
    console.error('Não foi possível ler a sessão para o envio da mídia.', error)
  }

  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
    body: formData,
  })
  if (!res.ok) {
    const responseText = await res.text()
    throw new Error(responseText || `Erro ${res.status} ao enviar a mídia`)
  }
  return res.json()
}

const uploadGameMedia = (gameId, file) => uploadMedia(`/games/${gameId}/media`, file)
const uploadMovieMedia = (movieId, file) => uploadMedia(`/movies/${movieId}/media`, file)
const uploadSeriesMedia = (seriesId, file) => uploadMedia(`/series/${seriesId}/media`, file)
const uploadCatalogMedia = (resourceKey, itemId, file) =>
  uploadMedia(`/${resourceKey}/${itemId}/media`, file)
const uploadHomeSlideMedia = (slideId, file) =>
  uploadMedia(`/home-slides/${slideId}/media`, file)
const uploadTimelineMedia = (timelineId, file) =>
  uploadMedia(`/timelines/${timelineId}/media`, file)

const uploadGameCharacterMedia = (gameId, characterId, file) =>
  uploadMedia(`/games/${gameId}/characters/${characterId}/media`, file)

const uploadCharacterMedia = (characterId, field, file) => {
  const query = new URLSearchParams({ field })
  return uploadMedia(`/characters/${characterId}/media?${query}`, file)
}

const uploadAppearanceMedia = (characterId, contentId, file) => {
  const query = new URLSearchParams({ characterId, contentId })
  return uploadMedia(`/character-appearances/media?${query}`, file)
}

export const Admin = () => {

  const [resourceKey, setResourceKey] = useState('characters');
  const resource = RESOURCES[resourceKey];
  const itemsPath = resource.listPath || resource.path;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm(resource.fields));
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');
  const [games, setGames] = useState([])
  const [movies, setMovies] = useState([])
  const [series, setSeries] = useState([])
  const [availableCharacters, setAvailableCharacters] = useState([])
  const [selectedCharacterIds, setSelectedCharacterIds] = useState([])
  const [selectedGameId, setSelectedGameId] = useState('')
  const [gameCharacterImage, setGameCharacterImage] = useState('')
  const [gameCharacterImageFile, setGameCharacterImageFile] = useState(null)
  const [gameMediaFile, setGameMediaFile] = useState(null)
  const [movieMediaFile, setMovieMediaFile] = useState(null)
  const [seriesMediaFile, setSeriesMediaFile] = useState(null)
  const [bannerMediaFile, setBannerMediaFile] = useState(null)
  const [sagaComics, setSagaComics] = useState([])
  const [openSagaComicIndex, setOpenSagaComicIndex] = useState(null)
  const [galleryMediaFiles, setGalleryMediaFiles] = useState([])
  const [galleryImagesToRemove, setGalleryImagesToRemove] = useState([])
  const [planetPrimaryImageFile, setPlanetPrimaryImageFile] = useState(null)
  const [characterBackgroundFile, setCharacterBackgroundFile] = useState(null)
  const [characterVerticalFile, setCharacterVerticalFile] = useState(null)
  const [selectedCharacterPreset, setSelectedCharacterPreset] = useState('superman')
  const [selectedMoviePreset, setSelectedMoviePreset] = useState(0)
  const [selectedSeriesPreset, setSelectedSeriesPreset] = useState(0)
  const [selectedGamePreset, setSelectedGamePreset] = useState(0)
  const [selectedPlanetPreset, setSelectedPlanetPreset] = useState(0)
  const [selectedGroupPreset, setSelectedGroupPreset] = useState(0)
  const [linkingGame, setLinkingGame] = useState(false)
  const [appearanceType, setAppearanceType] = useState('movie')
  const [selectedContentId, setSelectedContentId] = useState('')
  const [appearanceImageFile, setAppearanceImageFile] = useState(null)
  const [linkingAppearance, setLinkingAppearance] = useState(false)
  const [toast, setToast] = useState(null); // { type: 'ok' | 'error', text }

  const notify = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadItems = useCallback(() => {
    setLoading(true);
    request('GET', itemsPath)
      .then(setItems)
      .catch((err) => {
        setItems([]);
        notify('error', `${err.message}. A API está rodando em ${API_URL}?`);
      })
      .finally(() => setLoading(false));
  }, [itemsPath]);

  useEffect(() => {
    request('GET', '/games')
      .then((data) => {
        setGames(data)
        setSelectedGameId((current) => current || data[0]?.id || '')
      })
      .catch((err) => notify('error', `Não foi possível carregar os jogos: ${err.message}`))
  }, []);

  useEffect(() => {
    Promise.all([request('GET', '/movies'), request('GET', '/series')])
      .then(([movieItems, seriesItems]) => {
        setMovies(movieItems)
        setSeries(seriesItems)
      })
      .catch((err) => notify('error', `Não foi possível carregar filmes e séries: ${err.message}`))
  }, []);

  useEffect(() => {
    request('GET', '/characters')
      .then(setAvailableCharacters)
      .catch((err) => notify('error', `Não foi possível carregar os personagens para as equipes: ${err.message}`))
  }, []);

  // trocou de aba: limpa o formulário e recarrega a lista
  useEffect(() => {
    setEditing(null);
    setForm(emptyForm(resource.fields));
    setSagaComics([]);
    setOpenSagaComicIndex(null);
    setSelectedCharacterIds([]);
    setFilter('');
    loadItems();
  }, [resourceKey, resource.fields, loadItems]);

  useEffect(() => {
    if (resourceKey !== 'characters' || !editing) return

    const linkedGameIds = new Set(
      (editing.gameAppearances || []).map((appearance) => appearance.game?.id)
    )
    const currentGameIsAvailable = games.some(
      (game) => game.id === selectedGameId && !linkedGameIds.has(game.id)
    )
    if (!currentGameIsAvailable) {
      setSelectedGameId(games.find((game) => !linkedGameIds.has(game.id))?.id || '')
    }
  }, [resourceKey, editing, games, selectedGameId])

  const startEdit = (item) => {
    setEditing(item);
    setGameMediaFile(null)
    setMovieMediaFile(null)
    setSeriesMediaFile(null)
    setBannerMediaFile(null)
    setGalleryMediaFiles([])
    setGalleryImagesToRemove([])
    setPlanetPrimaryImageFile(null)
    setGameCharacterImageFile(null)
    setCharacterBackgroundFile(null)
    setCharacterVerticalFile(null)
    setAppearanceImageFile(null)
    const values = {};
    resource.fields.forEach((f) => {
      values[f.name] = item[f.name] ?? '';
    });
    setForm(values);
    setSelectedCharacterIds(resourceKey === 'groups'
      ? (item.characters || []).map((character) => character.id)
      : [])
    setSagaComics(resourceKey === 'sagas'
      ? (item.comics || []).map((comic) => (
          typeof comic === 'string'
            ? { ...newSagaComic(), name: comic }
            : { ...comic, file: null }
        ))
      : [])
    setOpenSagaComicIndex(null)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm(resource.fields));
    setSagaComics([]);
    setOpenSagaComicIndex(null)
    setSelectedCharacterIds([])
    setGameMediaFile(null)
    setMovieMediaFile(null)
    setSeriesMediaFile(null)
    setBannerMediaFile(null)
    setGalleryMediaFiles([])
    setGalleryImagesToRemove([])
    setPlanetPrimaryImageFile(null)
    setGameCharacterImageFile(null)
    setGameCharacterImage('')
    setCharacterBackgroundFile(null)
    setCharacterVerticalFile(null)
    setAppearanceImageFile(null)
    setCharacterBackgroundFile(null)
    setCharacterVerticalFile(null)
    setAppearanceImageFile(null)
  };

  const handleChange = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const fillCharacterPreset = () => {
    setEditing(null)
    setForm({ ...emptyForm(resource.fields), ...CHARACTER_PRESETS[selectedCharacterPreset] })
    setCharacterBackgroundFile(null)
    setCharacterVerticalFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fillStarfireHomeSlidePreset = () => {
    setEditing(null)
    setForm({ ...emptyForm(resource.fields), ...STARFIRE_HOME_SLIDE_PRESET })
    setBannerMediaFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fillJusticeLeagueWarHomeSlidePreset = () => {
    setEditing(null)
    setForm({ ...emptyForm(resource.fields), ...JUSTICE_LEAGUE_WAR_HOME_SLIDE_PRESET })
    setBannerMediaFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fillMoviePreset = () => {
    const preset = DCAMU_MOVIE_PRESETS[selectedMoviePreset]
    setEditing(null)
    setForm({ ...emptyForm(resource.fields), ...preset })
    setMovieMediaFile(null)
    setBannerMediaFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fillSeriesPreset = () => {
    const preset = DC_SERIES_PRESETS[selectedSeriesPreset]
    setEditing(null)
    setForm({ ...emptyForm(resource.fields), ...preset })
    setSeriesMediaFile(null)
    setBannerMediaFile(null)
    setGalleryMediaFiles([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fillGamePreset = () => {
    const preset = DC_GAME_PRESETS[selectedGamePreset]
    setEditing(null)
    setForm({ ...emptyForm(resource.fields), ...preset })
    setGameMediaFile(null)
    setBannerMediaFile(null)
    setGalleryMediaFiles([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fillPlanetPreset = () => {
    const preset = DC_PLANET_PRESETS[selectedPlanetPreset]
    setEditing(null)
    setForm({ ...emptyForm(resource.fields), ...preset })
    setPlanetPrimaryImageFile(null)
    setGalleryMediaFiles([])
    setGalleryImagesToRemove([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fillGroupPreset = () => {
    const { memberAliases, ...preset } = DC_GROUP_PRESETS[selectedGroupPreset]
    const matches = memberAliases.map((aliases) => {
      const normalizedAliases = aliases.map(normalizeCharacterName)
      return {
        name: aliases[0],
        character: availableCharacters.find((character) => (
          normalizedAliases.includes(normalizeCharacterName(character.name))
          || normalizedAliases.includes(normalizeCharacterName(character.true_name))
        )),
      }
    })

    setEditing(null)
    setForm({ ...emptyForm(resource.fields), ...preset })
    setSelectedCharacterIds(matches
      .flatMap(({ character }) => character ? [character.id] : []))
    setBannerMediaFile(null)
    const missingMembers = matches
      .filter(({ character }) => !character)
      .map(({ name }) => name)
    if (missingMembers.length > 0) {
      notify('error', `Não encontrei estes personagens cadastrados; você pode selecioná-los manualmente: ${missingMembers.join(', ')}.`)
    } else {
      notify('ok', 'Dados da equipe e integrantes disponíveis preenchidos. Envie o banner e revise antes de salvar.')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fillSagaPreset = (preset) => {
    setEditing(null)
    setForm({ ...emptyForm(resource.fields), ...SAGA_PRESETS[preset] })
    setSagaComics([])
    setOpenSagaComicIndex(null)
    setBannerMediaFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resourceKey === 'characters' && !editing && !characterBackgroundFile) {
      notify('error', 'Selecione a imagem de fundo do personagem.')
      return
    }
    if (['games', 'movies', 'series', 'homeSlides', 'sagas', 'groups', 'timelines'].includes(resourceKey) && !editing && !bannerMediaFile) {
      notify('error', resourceKey === 'homeSlides' ? 'Selecione a imagem do destaque.' : resourceKey === 'timelines' ? 'Selecione a imagem do marco.' : 'Selecione o banner estático.')
      return
    }
    if (resourceKey === 'sagas' && sagaComics.some((comic) => (
      !comic.name.trim() || (!comic.coverImage && !comic.file)
    ))) {
      notify('error', 'Cada HQ precisa de um nome e uma imagem de capa.')
      return
    }
    setSaving(true);

    // campos vazios viram null; números viram number
    const clean = {};
    resource.fields.forEach((f) => {
      const v = form[f.name];
      if (v === '' || v === undefined) clean[f.name] = null;
      else if (f.type === 'number') clean[f.name] = Number(v);
      else if (f.type === 'checkbox') clean[f.name] = Boolean(v);
      else clean[f.name] = v;
    });

    let savedItem = null
    try {
      const comicPayload = sagaComics.map((comic, index) => ({
        ...(comic.id ? { id: comic.id } : {}),
        name: comic.name.trim(),
        releaseYear: comic.releaseYear ? Number(comic.releaseYear) : null,
        description: comic.description.trim() || null,
        coverImage: comic.coverImage || null,
        readingOrder: index + 1,
      }))
      if (editing) {
        const updatePayload = resourceKey === 'characters'
          ? {
              ...clean,
              background: editing.background,
              logo: editing.logo,
              verticalmage: editing.verticalmage,
            }
          : resourceKey === 'series'
            ? {
                ...clean,
                serieLogo: editing.serieLogo,
                banner: editing.banner,
                images: editing.images || [],
              }
          : resourceKey === 'movies'
            ? {
                ...clean,
                verticalImage: editing.verticalImage,
                movieLogo: null,
                year: clean.year,
                duration: clean.duration,
                banner: editing.banner,
                images: editing.images || [],
              }
          : resourceKey === 'games'
            ? {
                ...clean,
                gameLogo: editing.gameLogo,
                banner: editing.banner,
                images: editing.images || [],
              }
          : resourceKey === 'sagas'
            ? { ...editing, ...clean, comics: comicPayload }
          : resourceKey === 'groups'
            ? {
                ...editing,
                ...clean,
                characters: selectedCharacterIds.map((id) => ({ id })),
                banner: editing.banner,
              }
          : resourceKey === 'timelines'
            ? { ...editing, ...clean, image: editing.image }
          : resourceKey === 'planets'
            ? {
                ...editing,
                ...clean,
                images: (editing.images || []).filter((image) => !galleryImagesToRemove.includes(image)),
              }
            : { ...editing, ...clean }
        savedItem = await request('PUT', `${resource.path}/${editing.id}`, updatePayload);
      } else {
        savedItem = await request('POST', resource.path, resourceKey === 'sagas'
          ? { ...clean, comics: comicPayload }
          : resourceKey === 'groups'
            ? { ...clean, characters: selectedCharacterIds.map((id) => ({ id })) }
            : resourceKey === 'planets'
              ? { ...clean, images: [] }
              : clean);
      }

      if (resourceKey === 'games' && gameMediaFile) {
        const { url } = await uploadGameMedia(savedItem.id, gameMediaFile)
        savedItem = await request('PUT', `/games/${savedItem.id}`, {
          ...savedItem,
          gameLogo: url,
        })
      }

      if (resourceKey === 'movies' && movieMediaFile) {
        const { url } = await uploadMovieMedia(savedItem.id, movieMediaFile)
        savedItem = await request('PUT', `/movies/${savedItem.id}`, {
          ...savedItem,
          verticalImage: url,
          movieLogo: null,
        })
      }

      if (resourceKey === 'series' && seriesMediaFile) {
        const { url } = await uploadSeriesMedia(savedItem.id, seriesMediaFile)
        savedItem = await request('PUT', `/series/${savedItem.id}`, {
          ...savedItem,
          serieLogo: url,
        })
      }

      if (resourceKey === 'homeSlides' && bannerMediaFile) {
        const { url } = await uploadHomeSlideMedia(savedItem.id, bannerMediaFile)
        savedItem = await request('PUT', `/home-slides/${savedItem.id}`, {
          ...savedItem,
          image: url,
        })
      }

      if (resourceKey === 'sagas' && bannerMediaFile) {
        const { url } = await uploadCatalogMedia(resourceKey, savedItem.id, bannerMediaFile)
        savedItem = await request('PUT', `${resource.path}/${savedItem.id}`, {
          ...savedItem,
          banner: url,
        })
      }

      if (resourceKey === 'groups' && bannerMediaFile) {
        const { url } = await uploadCatalogMedia(resourceKey, savedItem.id, bannerMediaFile)
        savedItem = await request('PUT', `${resource.path}/${savedItem.id}`, {
          ...savedItem,
          banner: url,
        })
      }

      if (resourceKey === 'timelines' && bannerMediaFile) {
        const { url } = await uploadTimelineMedia(savedItem.id, bannerMediaFile)
        savedItem = await request('PUT', `/timelines/${savedItem.id}`, {
          ...savedItem,
          image: url,
        })
      }

      if (resourceKey === 'sagas') {
        for (const [index, comic] of sagaComics.entries()) {
          if (!comic.file) continue
          const savedComic = comic.id
            ? savedItem.comics.find((item) => item.id === comic.id)
            : savedItem.comics.find((item) => item.readingOrder === index + 1)
          if (!savedComic) {
            throw new Error(`Não foi possível localizar a HQ "${comic.name}" para enviar a capa.`)
          }
          await uploadMedia(`/sagas/${savedItem.id}/comics/${savedComic.id}/media`, comic.file)
        }
      }

      if (resourceKey === 'planets') {
        if (planetPrimaryImageFile) {
          const { url } = await uploadMedia(`/planets/${savedItem.id}/primary-media`, planetPrimaryImageFile)
          savedItem = { ...savedItem, image: url }
          setPlanetPrimaryImageFile(null)
        }
        for (const file of galleryMediaFiles) {
          const { url } = await uploadMedia(`/planets/${savedItem.id}/media`, file)
          savedItem = { ...savedItem, images: [...(savedItem.images || []), url] }
          setGalleryMediaFiles((current) => current.filter((selectedFile) => selectedFile !== file))
        }
      }

      if (
        ['games', 'movies', 'series'].includes(resourceKey) &&
        (bannerMediaFile || galleryMediaFiles.length > 0 || galleryImagesToRemove.length > 0)
      ) {
        const banner = bannerMediaFile
          ? await uploadCatalogMedia(resourceKey, savedItem.id, bannerMediaFile).then(({ url }) => url)
          : savedItem.banner || editing?.banner || null
        const images = (savedItem.images || editing?.images || [])
          .filter((image) => !galleryImagesToRemove.includes(image))
        for (const file of galleryMediaFiles) {
          const { url } = await uploadCatalogMedia(resourceKey, savedItem.id, file)
          images.push(url)
        }
        savedItem = await request('PUT', `${resource.path}/${savedItem.id}`, {
          ...savedItem,
          banner,
          images,
        })
      }

      if (resourceKey === 'characters' && characterBackgroundFile) {
        savedItem = await uploadCharacterMedia(savedItem.id, 'background', characterBackgroundFile)
      }
      if (resourceKey === 'characters' && characterVerticalFile) {
        savedItem = await uploadCharacterMedia(savedItem.id, 'verticalmage', characterVerticalFile)
      }

      notify('ok', `${resource.singular} ${editing ? 'atualizado' : 'cadastrado'}!`);
      cancelEdit();
      loadItems();
    } catch (err) {
      if (savedItem?.id && (resourceKey === 'games' || resourceKey === 'movies' || resourceKey === 'series' || resourceKey === 'homeSlides' || resourceKey === 'sagas' || resourceKey === 'groups' || resourceKey === 'characters' || resourceKey === 'planets')) {
        setEditing(savedItem)
        if (!editing) {
          const values = {}
          resource.fields.forEach((field) => { values[field.name] = savedItem[field.name] ?? '' })
          setForm(values)
        }
        loadItems()
        notify('error', `O ${resource.singular} foi salvo, mas não foi possível concluir o envio da mídia: ${err.message}`)
      } else {
        notify('error', err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const addSagaComic = () => {
    setOpenSagaComicIndex(sagaComics.length)
    setSagaComics((current) => [...current, newSagaComic()])
  }

  const removeSagaComic = (index) => {
    setSagaComics((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setOpenSagaComicIndex((current) => {
      if (current === index) return null
      if (current !== null && current > index) return current - 1
      return current
    })
  }

  const addSagaComicPreset = (presetComics, sagaName) => {
    const existingNames = new Set(sagaComics.map((comic) => (
      comic.name.trim().toLocaleLowerCase('pt-BR')
    )))
    const additions = presetComics
      .filter((comic) => !existingNames.has(comic.name.toLocaleLowerCase('pt-BR')))
      .map((comic) => ({ ...newSagaComic(), ...comic }))

    if (additions.length === 0) {
      notify('ok', `As principais HQs da ${sagaName} já estão na lista.`)
      return
    }

    setOpenSagaComicIndex(sagaComics.length)
    setSagaComics((current) => [...current, ...additions])
    notify('ok', `${additions.length} HQs principais da ${sagaName} adicionadas. Envie uma capa para cada uma antes de salvar.`)
  }

  const handleDelete = async (item) => {
    const name = item[resource.titleField] || 'este item';
    if (!window.confirm(`Excluir "${name}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await request('DELETE', `${resource.path}/${item.id}`);
      notify('ok', `${resource.singular} excluído.`);
      if (editing?.id === item.id) cancelEdit();
      loadItems();
    } catch (err) {
      notify('error', err.message);
    }
  };

  const linkGameToCharacter = async () => {
    if (!editing || !selectedGameId || (!gameCharacterImage.trim() && !gameCharacterImageFile)) {
      notify('error', 'Selecione um jogo e informe uma URL ou selecione a imagem do personagem.')
      return
    }

    setLinkingGame(true)
    try {
      const characterImage = gameCharacterImageFile
        ? (await uploadGameCharacterMedia(selectedGameId, editing.id, gameCharacterImageFile)).url
        : gameCharacterImage.trim()
      await request('POST', '/character-game-appearances', {
        characterId: editing.id,
        gameId: selectedGameId,
        characterImage,
      })
      const updatedCharacter = await request('GET', `/characters/${editing.id}`)
      setEditing(updatedCharacter)
      setGameCharacterImage('')
      setGameCharacterImageFile(null)
      loadItems()
      notify('ok', 'Jogo relacionado ao personagem!')
    } catch (err) {
      notify('error', err.message)
    } finally {
      setLinkingGame(false)
    }
  }

  const unlinkGameFromCharacter = async (appearance) => {
    try {
      await request('DELETE', `/character-game-appearances/${appearance.id}`)
      const updatedCharacter = await request('GET', `/characters/${editing.id}`)
      setEditing(updatedCharacter)
      loadItems()
      notify('ok', 'Relação com o jogo removida.')
    } catch (err) {
      notify('error', err.message)
    }
  }

  const linkContentToCharacter = async () => {
    if (!editing || !selectedContentId || !appearanceImageFile) {
      notify('error', 'Selecione um filme ou série e envie a imagem do personagem.')
      return
    }

    setLinkingAppearance(true)
    try {
      const { url: characterImage } = await uploadAppearanceMedia(
        editing.id,
        selectedContentId,
        appearanceImageFile
      )
      await request('POST', '/character-appearances', {
        characterId: editing.id,
        contentId: selectedContentId,
        characterImage,
      })
      const updatedCharacter = await request('GET', `/characters/${editing.id}`)
      setEditing(updatedCharacter)
      setAppearanceImageFile(null)
      setSelectedContentId('')
      loadItems()
      notify('ok', 'Filme ou série relacionado ao personagem!')
    } catch (err) {
      notify('error', err.message)
    } finally {
      setLinkingAppearance(false)
    }
  }

  const unlinkContentFromCharacter = async (appearance) => {
    try {
      await request('DELETE', `/character-appearances/${appearance.id}`)
      const updatedCharacter = await request('GET', `/characters/${editing.id}`)
      setEditing(updatedCharacter)
      loadItems()
      notify('ok', 'Relação com filme ou série removida.')
    } catch (err) {
      notify('error', err.message)
    }
  }

  const visibleItems = items.filter((item) =>
    String(item[resource.titleField] || '')
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  const previewUrl = form[resource.imageField] || editing?.[resource.imageField];
  const linkedGameIds = new Set(
    (editing?.gameAppearances || []).map((appearance) => appearance.game?.id)
  )
  const availableGames = games.filter((game) => !linkedGameIds.has(game.id))
  const contentOptions = (appearanceType === 'movie' ? movies : series).filter(
    (content) => !(editing?.appearances || []).some((appearance) => appearance.content?.id === content.id)
  )

  return (
    <div className="admin">
      <header className="admin__header">
        <h1 className="admin__title">Painel de controle</h1>
        <nav className="admin__tabs" aria-label="Tipo de cadastro">
          {Object.entries(RESOURCES).map(([key, r]) => (
            <button
              key={key}
              type="button"
              className={`admin__tab${key === resourceKey ? ' active' : ''}`}
              onClick={() => {
                setResourceKey(key)
                setGameMediaFile(null)
                setMovieMediaFile(null)
                setSeriesMediaFile(null)
                setBannerMediaFile(null)
                setGalleryMediaFiles([])
                setGalleryImagesToRemove([])
                setPlanetPrimaryImageFile(null)
                setGameCharacterImageFile(null)
                setGameCharacterImage('')
              }}
              aria-pressed={key === resourceKey}
            >
              {r.label}
            </button>
          ))}
        </nav>
      </header>

      {toast && (
        <div className={`admin__toast admin__toast--${toast.type}`} role="status">
          {toast.text}
        </div>
      )}

      <div className="admin__layout">

        {/* ---------- Formulário ---------- */}
        <form className="admin__form" onSubmit={handleSubmit}>
          <h2 className="admin__form-title">
            {editing ? `Editar ${resource.singular}` : `Novo ${resource.singular}`}
          </h2>

          {resourceKey === 'characters' && !editing && (
            <div className="admin__preset-actions">
              <label className="admin__field admin__character-preset">
                <span className="admin__label">Modelo de personagem</span>
                <select
                  value={selectedCharacterPreset}
                  onChange={(event) => setSelectedCharacterPreset(event.target.value)}
                >
                  {Object.entries(CHARACTER_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>{preset.name}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="admin__btn admin__btn--preset"
                onClick={fillCharacterPreset}
              >
                Preencher dados
              </button>
            </div>
          )}

          {resourceKey === 'homeSlides' && !editing && (
            <div className="admin__preset-actions">
              <button
                type="button"
                className="admin__btn admin__btn--preset"
                onClick={fillStarfireHomeSlidePreset}
              >
                Preencher destaque da Starfire
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--preset"
                onClick={fillJusticeLeagueWarHomeSlidePreset}
              >
                Preencher destaque de Liga da Justiça: War
              </button>
            </div>
          )}

          {resourceKey === 'movies' && !editing && (
            <div className="admin__preset-actions">
              <label className="admin__field admin__movie-preset">
                <span className="admin__label">Filmes do DCAMU</span>
                <select
                  value={selectedMoviePreset}
                  onChange={(event) => setSelectedMoviePreset(Number(event.target.value))}
                >
                  {DCAMU_MOVIE_PRESETS.map((movie, index) => (
                    <option key={movie.title} value={index}>
                      {movie.year} — {movie.title}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="admin__btn admin__btn--preset"
                onClick={fillMoviePreset}
              >
                Preencher dados do filme
              </button>
            </div>
          )}

          {resourceKey === 'series' && !editing && (
            <div className="admin__preset-actions">
              <label className="admin__field admin__series-preset">
                <span className="admin__label">Séries principais da DC</span>
                <select
                  value={selectedSeriesPreset}
                  onChange={(event) => setSelectedSeriesPreset(Number(event.target.value))}
                >
                  {DC_SERIES_PRESETS.map((seriesPreset, index) => (
                    <option key={seriesPreset.title} value={index}>
                      {seriesPreset.title}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="admin__btn admin__btn--preset"
                onClick={fillSeriesPreset}
              >
                Preencher dados da série
              </button>
            </div>
          )}

          {resourceKey === 'games' && !editing && (
            <div className="admin__preset-actions">
              <label className="admin__field admin__game-preset">
                <span className="admin__label">Jogos principais da DC</span>
                <select
                  value={selectedGamePreset}
                  onChange={(event) => setSelectedGamePreset(Number(event.target.value))}
                >
                  {DC_GAME_PRESETS.map((game, index) => (
                    <option key={game.title} value={index}>{game.title}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="admin__btn admin__btn--preset"
                onClick={fillGamePreset}
              >
                Preencher dados do jogo
              </button>
            </div>
          )}

          {resourceKey === 'planets' && !editing && (
            <div className="admin__preset-actions">
              <label className="admin__field admin__planet-preset">
                <span className="admin__label">Outros planetas importantes da DC</span>
                <select
                  value={selectedPlanetPreset}
                  onChange={(event) => setSelectedPlanetPreset(Number(event.target.value))}
                >
                  {DC_PLANET_PRESETS.map((planet, index) => (
                    <option key={planet.name} value={index}>{planet.name}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="admin__btn admin__btn--preset"
                onClick={fillPlanetPreset}
              >
                Preencher dados do planeta
              </button>
            </div>
          )}

          {resourceKey === 'sagas' && !editing && (
            <div className="admin__preset-actions">
              <button
                type="button"
                className="admin__btn admin__btn--preset"
                onClick={() => fillSagaPreset('new52')}
              >
                Preencher dados do New 52
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--preset"
                onClick={() => fillSagaPreset('absolute')}
              >
                Preencher dados do Universo Absolute
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--preset"
                onClick={() => fillSagaPreset('goldenAge')}
              >
                Preencher dados da Era de Ouro
              </button>
            </div>
          )}

          {resourceKey === 'groups' && !editing && (
            <div className="admin__preset-actions">
              <label className="admin__field admin__group-preset">
                <span className="admin__label">Equipes principais da DC</span>
                <select
                  value={selectedGroupPreset}
                  onChange={(event) => setSelectedGroupPreset(Number(event.target.value))}
                >
                  {DC_GROUP_PRESETS.map((group, index) => (
                    <option key={group.name} value={index}>{group.name}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="admin__btn admin__btn--preset"
                onClick={fillGroupPreset}
              >
                Preencher dados da equipe
              </button>
            </div>
          )}

          {resource.fields.map((f) => (
            <label key={f.name} className="admin__field">
              <span className="admin__label">
                {f.label}{f.required && ' *'}
              </span>
              {f.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={form[f.name] ?? ''}
                  required={f.required}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              ) : f.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  checked={Boolean(form[f.name])}
                  onChange={(e) => handleChange(f.name, e.target.checked)}
                />
              ) : (
                <input
                  type={f.type}
                  value={form[f.name] ?? ''}
                  required={f.required}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              )}
            </label>
          ))}

          {resourceKey === 'groups' && (
            <label className="admin__field">
              <span className="admin__label">Personagens da equipe</span>
              <select
                multiple
                size={Math.min(Math.max(availableCharacters.length, 4), 8)}
                value={selectedCharacterIds}
                onChange={(event) => setSelectedCharacterIds(
                  Array.from(event.target.selectedOptions, (option) => option.value)
                )}
                aria-describedby="group-character-help"
              >
                {availableCharacters.map((character) => (
                  <option key={character.id} value={character.id}>{character.name}</option>
                ))}
              </select>
              <span className="admin__file-name" id="group-character-help">
                Selecione um ou mais personagens. Use Ctrl (Windows) ou Cmd (Mac) para múltiplas seleções no computador.
                {selectedCharacterIds.length > 0 && ` ${selectedCharacterIds.length} selecionado(s).`}
              </span>
            </label>
          )}

          {resourceKey === 'planets' && (
            <section className="admin__game-link">
              <h3 className="admin__game-link-title">Imagem principal</h3>
              {editing?.image && (
                <div className="admin__game-link-row">
                  <img src={editing.image} alt={`Imagem principal atual de ${editing.name}`} />
                  <span>Imagem principal atual</span>
                </div>
              )}
              <label className="admin__field">
                <span className="admin__label">Substituir imagem principal</span>
                <input
                  key={planetPrimaryImageFile?.name || 'planet-primary-image-empty'}
                  type="file"
                  accept="image/*"
                  onChange={(event) => setPlanetPrimaryImageFile(event.target.files?.[0] || null)}
                />
                <span className="admin__file-name">
                  {planetPrimaryImageFile
                    ? `${planetPrimaryImageFile.name} (${(planetPrimaryImageFile.size / (1024 * 1024)).toFixed(1)} MB)`
                    : editing?.image
                      ? 'Imagem atual mantida se nenhum arquivo for escolhido'
                      : 'Nenhuma imagem principal selecionada'}
                </span>
                <span className="admin__file-name">
                  Para uma textura mais nítida no mapa, prefira uma imagem quadrada em alta resolução (idealmente 1024 × 1024 px ou maior).
                </span>
              </label>
              <h3 className="admin__game-link-title">Galeria do planeta</h3>
              <label className="admin__field">
                <span className="admin__label">Adicionar imagens à galeria</span>
                <input
                  key={galleryMediaFiles.map((file) => file.name).join('|') || 'planet-gallery-empty'}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => setGalleryMediaFiles(Array.from(event.target.files || []))}
                />
                <span className="admin__file-name">
                  {galleryMediaFiles.length > 0
                    ? `${galleryMediaFiles.length} imagem(ns) selecionada(s)`
                    : `Imagens na galeria: ${editing?.images?.length || 0} — arquivos de até 25 MB cada`}
                </span>
              </label>
              {editing?.images?.length > 0 && (
                <ul className="admin__game-links" aria-label="Imagens atuais do planeta">
                  {editing.images.map((image) => {
                    const markedForRemoval = galleryImagesToRemove.includes(image)
                    return (
                      <li className="admin__game-link-row" key={image}>
                        <img src={image} alt="" />
                        <span>{markedForRemoval ? 'Será removida ao salvar' : 'Imagem da galeria'}</span>
                        <button
                          type="button"
                          className={`admin__btn admin__btn--small${markedForRemoval ? '' : ' admin__btn--danger'}`}
                          onClick={() => setGalleryImagesToRemove((current) => (
                            markedForRemoval
                              ? current.filter((url) => url !== image)
                              : [...current, image]
                          ))}
                        >
                          {markedForRemoval ? 'Manter' : 'Remover'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )}

          {resourceKey === 'sagas' && (
            <section className="admin__game-link admin__saga-comics">
              <div className="admin__saga-comics-heading">
                <h3 className="admin__game-link-title">HQs desta saga</h3>
                <button
                  type="button"
                  className="admin__btn admin__btn--small"
                  onClick={addSagaComic}
                >
                  Adicionar HQ
                </button>
              </div>
              {(String(form.name || '').toLocaleLowerCase('pt-BR').includes('new 52')
                || String(form.name || '').toLocaleLowerCase('pt-BR').includes('era de ouro')) && (
                <div className="admin__saga-comic-presets">
                  {String(form.name || '').toLocaleLowerCase('pt-BR').includes('new 52') && (
                    <button
                      type="button"
                      className="admin__btn admin__btn--small admin__btn--preset"
                      onClick={() => addSagaComicPreset(NEW52_COMICS, 'New 52')}
                    >
                      Adicionar principais HQs do New 52
                    </button>
                  )}
                  {String(form.name || '').toLocaleLowerCase('pt-BR').includes('era de ouro') && (
                    <button
                      type="button"
                      className="admin__btn admin__btn--small admin__btn--preset"
                      onClick={() => addSagaComicPreset(GOLDEN_AGE_COMICS, 'Era de Ouro')}
                    >
                      Adicionar principais HQs da Era de Ouro
                    </button>
                  )}
                  <span>As capas precisam ser enviadas individualmente.</span>
                </div>
              )}
              {sagaComics.length === 0 ? (
                <p className="admin__empty">Nenhuma HQ adicionada.</p>
              ) : (
                <ol className="admin__saga-comic-list">
                  {sagaComics.map((comic, index) => (
                    <li
                      className={`admin__saga-comic${openSagaComicIndex === index ? ' admin__saga-comic--open' : ''}`}
                      key={comic.id || `new-${index}`}
                    >
                      <div className="admin__saga-comic-summary">
                        <button
                          type="button"
                          className="admin__saga-comic-toggle"
                          aria-expanded={openSagaComicIndex === index}
                          aria-controls={`saga-comic-fields-${index}`}
                          onClick={() => setOpenSagaComicIndex((current) => current === index ? null : index)}
                        >
                          {comic.coverImage ? (
                            <img src={comic.coverImage} alt="" />
                          ) : (
                            <span className="admin__saga-comic-thumb-empty" aria-hidden="true">HQ</span>
                          )}
                          <span className="admin__saga-comic-summary-text">
                            <strong>HQ {index + 1}: {comic.name.trim() || 'Nova HQ'}</strong>
                            <span>
                              {comic.releaseYear || 'Ano não informado'}
                              {' · '}
                              {comic.coverImage || comic.file ? 'Capa adicionada' : 'Capa pendente'}
                            </span>
                          </span>
                          <span className="admin__saga-comic-chevron" aria-hidden="true">
                            {openSagaComicIndex === index ? '−' : '+'}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="admin__btn admin__btn--small admin__btn--danger"
                          onClick={() => removeSagaComic(index)}
                        >
                          Remover
                        </button>
                      </div>
                      {openSagaComicIndex === index && (
                        <div className="admin__saga-comic-fields" id={`saga-comic-fields-${index}`}>
                          {comic.coverImage && !comic.file && (
                            <img className="admin__saga-comic-cover" src={comic.coverImage} alt={`Capa atual de ${comic.name}`} />
                          )}
                          <label className="admin__field">
                            <span className="admin__label">Nome da HQ *</span>
                            <input
                              type="text"
                              required
                              value={comic.name}
                              onChange={(event) => setSagaComics((current) => current.map((item, itemIndex) => (
                                itemIndex === index ? { ...item, name: event.target.value } : item
                              )))}
                            />
                          </label>
                          <label className="admin__field">
                            <span className="admin__label">Ano de lançamento</span>
                            <input
                              type="number"
                              min="1900"
                              max="2100"
                              value={comic.releaseYear}
                              onChange={(event) => setSagaComics((current) => current.map((item, itemIndex) => (
                                itemIndex === index ? { ...item, releaseYear: event.target.value } : item
                              )))}
                            />
                          </label>
                          <label className="admin__field">
                            <span className="admin__label">Descrição</span>
                            <textarea
                              rows={3}
                              value={comic.description}
                              onChange={(event) => setSagaComics((current) => current.map((item, itemIndex) => (
                                itemIndex === index ? { ...item, description: event.target.value } : item
                              )))}
                            />
                          </label>
                          <label className="admin__field">
                            <span className="admin__label">Capa da HQ{!comic.coverImage && ' *'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              required={!comic.coverImage && !comic.file}
                              onChange={(event) => setSagaComics((current) => current.map((item, itemIndex) => (
                                itemIndex === index ? { ...item, file: event.target.files?.[0] || null } : item
                              )))}
                            />
                            <span className="admin__file-name">
                              {comic.file
                                ? `${comic.file.name} (${(comic.file.size / (1024 * 1024)).toFixed(1)} MB)`
                                : comic.coverImage
                                  ? 'Capa atual mantida se nenhum arquivo for escolhido'
                                  : 'Obrigatória — limite de 25 MB'}
                            </span>
                          </label>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}

          {resourceKey === 'characters' && (
            <>
              <label className="admin__field">
                <span className="admin__label">Imagem de fundo do personagem{!editing && ' *'}</span>
                <input
                  key={characterBackgroundFile?.name || 'character-background-empty'}
                  type="file"
                  accept="image/*"
                  required={!editing && !characterBackgroundFile}
                  onChange={(event) => setCharacterBackgroundFile(event.target.files?.[0] || null)}
                />
                <span className="admin__file-name">
                  {characterBackgroundFile
                    ? `${characterBackgroundFile.name} (${(characterBackgroundFile.size / (1024 * 1024)).toFixed(1)} MB)`
                    : editing?.background
                      ? 'Imagem atual mantida se nenhum arquivo for escolhido'
                      : 'Obrigatória no cadastro — limite de 25 MB'}
                </span>
              </label>
              <label className="admin__field">
                <span className="admin__label">Imagem das polaroids (opcional)</span>
                <input
                  key={characterVerticalFile?.name || 'character-vertical-empty'}
                  type="file"
                  accept="image/*"
                  onChange={(event) => setCharacterVerticalFile(event.target.files?.[0] || null)}
                />
                <span className="admin__file-name">
                  {characterVerticalFile
                    ? `${characterVerticalFile.name} (${(characterVerticalFile.size / (1024 * 1024)).toFixed(1)} MB)`
                    : editing?.verticalmage
                      ? 'Imagem atual mantida se nenhum arquivo for escolhido'
                      : 'Limite de 25 MB'}
                </span>
              </label>
            </>
          )}

          {resourceKey === 'games' && (
            <label className="admin__field">
              <span className="admin__label">Enviar logo ou capa para o armazenamento do jogo</span>
              <input
                key={gameMediaFile?.name || 'game-media-empty'}
                type="file"
                accept="image/*"
                onChange={(event) => setGameMediaFile(event.target.files?.[0] || null)}
              />
              <span className="admin__file-name">
                {gameMediaFile
                  ? `${gameMediaFile.name} (${(gameMediaFile.size / (1024 * 1024)).toFixed(1)} MB)`
                  : 'Nenhum arquivo selecionado — limite de 25 MB'}
              </span>
            </label>
          )}

          {resourceKey === 'series' && (
            <label className="admin__field">
              <span className="admin__label">Logo da série (opcional)</span>
              <input
                key={seriesMediaFile?.name || 'series-media-empty'}
                type="file"
                accept="image/*"
                onChange={(event) => setSeriesMediaFile(event.target.files?.[0] || null)}
              />
              <span className="admin__file-name">
                {seriesMediaFile
                  ? `${seriesMediaFile.name} (${(seriesMediaFile.size / (1024 * 1024)).toFixed(1)} MB)`
                  : editing?.serieLogo
                    ? 'Imagem atual mantida se nenhum arquivo for escolhido'
                    : 'Nenhum arquivo selecionado — limite de 25 MB'}
              </span>
            </label>
          )}

          {resourceKey === 'movies' && (
            <label className="admin__field">
              <span className="admin__label">Pôster do filme (opcional)</span>
              <input
                key={movieMediaFile?.name || 'movie-media-empty'}
                type="file"
                accept="image/*"
                onChange={(event) => setMovieMediaFile(event.target.files?.[0] || null)}
              />
              <span className="admin__file-name">
                {movieMediaFile
                  ? `${movieMediaFile.name} (${(movieMediaFile.size / (1024 * 1024)).toFixed(1)} MB)`
                  : editing?.verticalImage
                    ? 'Pôster atual mantido se nenhum arquivo for escolhido'
                    : 'Nenhum arquivo selecionado — limite de 25 MB'}
              </span>
            </label>
          )}

          {['games', 'movies', 'series'].includes(resourceKey) && (
            <>
              <label className="admin__field">
                <span className="admin__label">Banner estático{!editing && ' *'}</span>
                <input
                  key={bannerMediaFile?.name || 'catalog-banner-empty'}
                  type="file"
                  accept="image/*"
                  required={!editing && !bannerMediaFile}
                  onChange={(event) => setBannerMediaFile(event.target.files?.[0] || null)}
                />
                <span className="admin__file-name">
                  {bannerMediaFile
                    ? `${bannerMediaFile.name} (${(bannerMediaFile.size / (1024 * 1024)).toFixed(1)} MB)`
                    : editing?.banner
                      ? 'Banner atual mantido se nenhum arquivo for escolhido'
                      : 'Nenhum arquivo selecionado — limite de 25 MB'}
                </span>
              </label>
              <label className="admin__field">
                <span className="admin__label">Imagens da galeria (opcional)</span>
                <input
                  key={galleryMediaFiles.map((file) => file.name).join('|') || 'catalog-gallery-empty'}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => setGalleryMediaFiles(Array.from(event.target.files || []))}
                />
                <span className="admin__file-name">
                  {galleryMediaFiles.length > 0
                    ? `${galleryMediaFiles.length} imagem(ns) selecionada(s)`
                    : `Imagens atuais: ${editing?.images?.length || 0} — arquivos de até 25 MB cada`}
                </span>
              </label>
              {editing?.images?.length > 0 && (
                <ul className="admin__game-links" aria-label="Imagens atuais da galeria">
                  {editing.images.map((image) => {
                    const markedForRemoval = galleryImagesToRemove.includes(image)
                    return (
                      <li className="admin__game-link-row" key={image}>
                        <img src={image} alt="" />
                        <span>{markedForRemoval ? 'Será removida ao salvar' : 'Imagem da galeria'}</span>
                        <button
                          type="button"
                          className={`admin__btn admin__btn--small${markedForRemoval ? '' : ' admin__btn--danger'}`}
                          onClick={() => setGalleryImagesToRemove((current) => (
                            markedForRemoval
                              ? current.filter((url) => url !== image)
                              : [...current, image]
                          ))}
                        >
                          {markedForRemoval ? 'Manter' : 'Remover'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}

          {(resourceKey === 'homeSlides' || resourceKey === 'sagas' || resourceKey === 'groups' || resourceKey === 'timelines') && (
            <label className="admin__field">
              <span className="admin__label">
                {resourceKey === 'homeSlides'
                  ? 'Imagem de fundo'
                  : resourceKey === 'groups'
                    ? 'Banner da equipe'
                    : resourceKey === 'sagas'
                      ? 'Banner da saga'
                      : 'Imagem do marco'}
                {!editing && ' *'}
              </span>
              <input
                key={bannerMediaFile?.name || 'home-slide-image-empty'}
                type="file"
                accept="image/*"
                required={!editing && !bannerMediaFile}
                onChange={(event) => setBannerMediaFile(event.target.files?.[0] || null)}
              />
              <span className="admin__file-name">
                {bannerMediaFile
                  ? `${bannerMediaFile.name} (${(bannerMediaFile.size / (1024 * 1024)).toFixed(1)} MB)`
                  : editing?.[resource.imageField]
                  ? `${resourceKey === 'homeSlides' ? 'Imagem' : resourceKey === 'timelines' ? 'Imagem' : 'Banner'} atual mantido se nenhum arquivo for escolhido`
                    : 'Obrigatória no cadastro — limite de 25 MB'}
              </span>
            </label>
          )}

          {resourceKey === 'characters' && editing && (
            <>
            <section className="admin__game-link">
              <h3 className="admin__game-link-title">Aparições em jogos</h3>
              {editing.gameAppearances?.length > 0 ? (
                <ul className="admin__game-links">
                  {editing.gameAppearances.map((appearance) => (
                    <li key={appearance.id} className="admin__game-link-row">
                      <img src={appearance.characterImage} alt="" />
                      <span>{appearance.game?.title || 'Jogo'}</span>
                      <button
                        type="button"
                        className="admin__btn admin__btn--small admin__btn--danger"
                        onClick={() => unlinkGameFromCharacter(appearance)}
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="admin__empty">Nenhum jogo relacionado.</p>
              )}

              <div className="admin__game-link-form">
                <label className="admin__field">
                  <span className="admin__label">Jogo</span>
                  <select
                    value={selectedGameId}
                    onChange={(event) => setSelectedGameId(event.target.value)}
                  >
                    <option value="" disabled>Selecione um jogo</option>
                    {availableGames.map((game) => (
                      <option key={game.id} value={game.id}>{game.title}</option>
                    ))}
                  </select>
                </label>
                <label className="admin__field">
                  <span className="admin__label">Imagem do personagem nesse jogo (URL opcional)</span>
                  <input
                    type="url"
                    value={gameCharacterImage}
                    onChange={(event) => setGameCharacterImage(event.target.value)}
                    placeholder="https://..."
                  />
                </label>
                <label className="admin__field">
                  <span className="admin__label">Ou enviar imagem para a pasta deste jogo</span>
                  <input
                    key={gameCharacterImageFile?.name || 'character-image-empty'}
                    type="file"
                    accept="image/*"
                    onChange={(event) => setGameCharacterImageFile(event.target.files?.[0] || null)}
                  />
                  <span className="admin__file-name">
                    {gameCharacterImageFile
                      ? `${gameCharacterImageFile.name} (${(gameCharacterImageFile.size / (1024 * 1024)).toFixed(1)} MB)`
                      : 'Nenhum arquivo selecionado — limite de 25 MB'}
                  </span>
                </label>
                <button
                  type="button"
                  className="admin__btn admin__btn--primary"
                  disabled={linkingGame || availableGames.length === 0}
                  onClick={linkGameToCharacter}
                >
                  {linkingGame ? 'Relacionando...' : 'Relacionar jogo'}
                </button>
              </div>
            </section>
            <section className="admin__game-link">
              <h3 className="admin__game-link-title">Aparições em filmes e séries</h3>
              {editing.appearances?.length > 0 ? (
                <ul className="admin__game-links">
                  {editing.appearances.map((appearance) => (
                    <li key={appearance.id} className="admin__game-link-row">
                      <img src={appearance.characterImage} alt="" />
                      <span>
                        {appearance.content?.title || 'Conteúdo'}
                        {' · '}
                        {appearance.content?.movieLogo !== undefined ? 'Filme' : 'Série'}
                      </span>
                      <button
                        type="button"
                        className="admin__btn admin__btn--small admin__btn--danger"
                        onClick={() => unlinkContentFromCharacter(appearance)}
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="admin__empty">Nenhum filme ou série relacionado.</p>
              )}

              <div className="admin__game-link-form">
                <label className="admin__field">
                  <span className="admin__label">Tipo</span>
                  <select
                    value={appearanceType}
                    onChange={(event) => {
                      setAppearanceType(event.target.value)
                      setSelectedContentId('')
                      setAppearanceImageFile(null)
                    }}
                  >
                    <option value="movie">Filme</option>
                    <option value="series">Série</option>
                  </select>
                </label>
                <label className="admin__field">
                  <span className="admin__label">Filme ou série</span>
                  <select
                    value={selectedContentId}
                    onChange={(event) => setSelectedContentId(event.target.value)}
                  >
                    <option value="" disabled>Selecione um título</option>
                    {contentOptions.map((content) => (
                      <option key={content.id} value={content.id}>{content.title}</option>
                    ))}
                  </select>
                </label>
                <label className="admin__field">
                  <span className="admin__label">Imagem do personagem neste conteúdo</span>
                  <input
                    key={appearanceImageFile?.name || 'appearance-image-empty'}
                    type="file"
                    accept="image/*"
                    onChange={(event) => setAppearanceImageFile(event.target.files?.[0] || null)}
                  />
                  <span className="admin__file-name">
                    {appearanceImageFile
                      ? `${appearanceImageFile.name} (${(appearanceImageFile.size / (1024 * 1024)).toFixed(1)} MB)`
                      : 'Obrigatória — limite de 25 MB'}
                  </span>
                </label>
                <button
                  type="button"
                  className="admin__btn admin__btn--primary"
                  disabled={linkingAppearance || contentOptions.length === 0 || !appearanceImageFile}
                  onClick={linkContentToCharacter}
                >
                  {linkingAppearance ? 'Relacionando...' : 'Relacionar filme/série'}
                </button>
                {contentOptions.length === 0 && (
                  <p className="admin__empty">
                    Não há {appearanceType === 'movie' ? 'filmes' : 'séries'} disponíveis para relacionar.
                  </p>
                )}
              </div>
            </section>
            </>
          )}

          {previewUrl && (
            <div className="admin__preview">
              <img src={previewUrl} alt="Pré-visualização" />
            </div>
          )}

          <div className="admin__actions">
            <button type="submit" className="admin__btn admin__btn--primary" disabled={saving}>
              {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar'}
            </button>
            {editing && (
              <button type="button" className="admin__btn" onClick={cancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* ---------- Lista ---------- */}
        <section className="admin__list">
          <div className="admin__list-head">
            <h2 className="admin__list-title">
              {resource.label} <span className="admin__count">{items.length}</span>
            </h2>
            <input
              type="search"
              className="admin__search"
              placeholder="Buscar pelo nome"
              aria-label="Buscar pelo nome"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          {loading && <p className="admin__empty">Carregando...</p>}

          {!loading && visibleItems.length === 0 && (
            <p className="admin__empty">
              {items.length === 0
                ? `Nenhum ${resource.singular} cadastrado ainda. Use o formulário para criar o primeiro.`
                : 'Nada encontrado para essa busca.'}
            </p>
          )}

          <ul className="admin__rows">
            {visibleItems.map((item) => (
              <li
                key={item.id}
                className={`admin__row${editing?.id === item.id ? ' editing' : ''}`}
              >
                <div className="admin__thumb">
                  {item[resource.imageField] && (
                    <img src={item[resource.imageField]} alt="" loading="lazy" />
                  )}
                </div>
                <span className="admin__row-name">{item[resource.titleField]}</span>
                <div className="admin__row-actions">
                  <button type="button" className="admin__btn admin__btn--small" onClick={() => startEdit(item)}>
                    Editar
                  </button>
                  <button type="button" className="admin__btn admin__btn--small admin__btn--danger" onClick={() => handleDelete(item)}>
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default Admin;
