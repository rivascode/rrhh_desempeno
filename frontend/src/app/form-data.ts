export type LikertOption = 'NUNCA' | 'CASI NUNCA' | 'A VECES' | 'CASI SIEMPRE' | 'SIEMPRE';

export interface ClimateQuestion {
  id: number;
  dimension: string;
  text: string;
}

export interface ScaleQuestion {
  id: number;
  dimension: string;
  text: string;
  lowLabel: string;
  highLabel: string;
}

export interface OpenQuestion {
  id: number;
  text: string;
}

export interface Competency {
  id: string;
  group: string;
  name: string;
  description: string;
  keyQuestion: string;
}

export const likertOptions: LikertOption[] = ['NUNCA', 'CASI NUNCA', 'A VECES', 'CASI SIEMPRE', 'SIEMPRE'];

export const likertScore: Record<LikertOption, number> = {
  NUNCA: 1,
  'CASI NUNCA': 2,
  'A VECES': 3,
  'CASI SIEMPRE': 4,
  SIEMPRE: 5,
};

export const climateQuestions: ClimateQuestion[] = [
  { id: 1, dimension: 'Generalidades', text: 'Al finalizar mi jornada diaria, me siento satisfecho con el trabajo que realizo.' },
  { id: 2, dimension: 'Generalidades', text: 'Los procedimientos y sistemas que existen en DACHASAC son simples y facilitan mi trabajo.' },
  { id: 3, dimension: 'Generalidades', text: 'Las normas y reglas de DACHASAC me parecen claras y faciles de entender.' },
  { id: 4, dimension: 'Generalidades', text: 'Conozco las tareas o funciones especificas que debo realizar en DACHASAC.' },
  { id: 5, dimension: 'Colaboracion', text: 'En mi equipo de trabajo, puedo expresar mi punto de vista, aun cuando contradiga al de los demas miembros.' },
  { id: 6, dimension: 'Colaboracion', text: 'Cuento con la colaboracion de mis companeros de area y de otras areas cuando lo necesito.' },
  { id: 7, dimension: 'Colaboracion', text: 'Mantengo buena relacion con los miembros de mi equipo de trabajo.' },
  { id: 8, dimension: 'Colaboracion', text: 'Existe una competencia sana entre mis companeros y yo.' },
  { id: 9, dimension: 'Valoracion y motivacion', text: 'El trabajo que realizo es valorado por mi jefe inmediato elevando mis niveles de desempeno.' },
  { id: 10, dimension: 'Valoracion y motivacion', text: 'Recibo retroalimentacion y/o capacitacion constante por parte de mi jefe inmediato.' },
  { id: 11, dimension: 'Valoracion y motivacion', text: 'Mi jefe inmediato se preocupa por crear un ambiente laboral agradable.' },
  { id: 12, dimension: 'Valoracion y motivacion', text: 'Me gusta lo que hago y me siento motivado a mejorar dia a dia.' },
  { id: 13, dimension: 'Valoracion y motivacion', text: 'Mi trabajo permite que desarrolle al maximo todas mis capacidades.' },
  { id: 14, dimension: 'Comunicacion', text: 'Mi jefe inmediato me mantiene informado acerca de temas y cambios importantes del area.' },
  { id: 15, dimension: 'Comunicacion', text: 'Mi jefe inmediato me comunica si estoy realizando bien o mal mi trabajo.' },
  { id: 16, dimension: 'Comunicacion', text: 'Mi jefe inmediato escucha mis opiniones y me hace participe de las decisiones.' },
  { id: 17, dimension: 'Comunicacion', text: 'En DACHASAC existen suficientes canales de comunicacion.' },
  { id: 18, dimension: 'Comunicacion', text: 'Las reuniones de coordinacion con los miembros de otras areas son frecuentes.' },
  { id: 19, dimension: 'Formacion', text: 'Las inducciones realizadas al momento de mi ingreso me ayudan a realizar las labores propias de mi puesto de trabajo.' },
  { id: 20, dimension: 'Formacion', text: 'DACHASAC me ofrece oportunidades para crecer profesionalmente.' },
  { id: 21, dimension: 'Formacion', text: 'DACHASAC me ofrece capacitaciones y/o entrenamientos para desarrollarme profesionalmente.' },
  { id: 22, dimension: 'Liderazgo', text: 'Mi jefe esta disponible cuando lo necesito.' },
  { id: 23, dimension: 'Liderazgo', text: 'Mi jefe inmediato es claro y especifico cuando define los objetivos de trabajo y los del equipo.' },
  { id: 24, dimension: 'Liderazgo', text: 'Considero que el trabajo que realiza mi jefe inmediato para manejar conflictos es bueno.' },
  { id: 25, dimension: 'Liderazgo', text: 'Mi jefe inmediato brinda apoyo para superar los obstaculos que se presentan.' },
  { id: 26, dimension: 'Liderazgo', text: 'Nuestros gerentes contribuyen a crear condiciones adecuadas para el progreso de DACHASAC.' },
  { id: 27, dimension: 'Seguridad', text: 'Trabajo en un ambiente seguro y me siento satisfecho.' },
  { id: 28, dimension: 'Seguridad', text: 'Dispongo de materiales, equipos de proteccion personal y recursos necesarios para trabajar de forma segura.' },
  { id: 29, dimension: 'Seguridad', text: 'DACHASAC me proporciona equipos, herramientas y materiales a tiempo.' },
  { id: 30, dimension: 'Remuneracion', text: 'Recibo mi remuneracion a tiempo.' },
  { id: 31, dimension: 'Remuneracion', text: 'Existe equidad en las remuneraciones.' },
  { id: 32, dimension: 'Remuneracion', text: 'Mi remuneracion es adecuada en relacion con el trabajo que realizo.' },
  { id: 33, dimension: 'Remuneracion', text: 'Mi salario y beneficios son razonables y cubren mis necesidades basicas.' },
  { id: 34, dimension: 'Innovacion', text: 'Tengo libertad para ser creativo e innovador en las soluciones de problemas laborales.' },
  { id: 35, dimension: 'Innovacion', text: 'Considero que DACHASAC es flexible y se adapta bien a los cambios.' },
  { id: 36, dimension: 'Innovacion', text: 'Mis companeros toman iniciativas para la solucion de problemas.' },
  { id: 37, dimension: 'Innovacion', text: 'Es facil que nuestras nuevas ideas sean consideradas.' },
  { id: 38, dimension: 'Recompensa', text: 'Considero que los beneficios que me ofrecen en DACHASAC son justos y adecuados.' },
  { id: 39, dimension: 'Recompensa', text: 'Existen incentivos laborales para que trate de hacer mejor mi trabajo.' },
  { id: 40, dimension: 'Recompensa', text: 'Considero que cada trabajador es factor clave para el exito de DACHASAC.' },
  { id: 41, dimension: 'Recompensa', text: 'Las recompensas y reconocimientos son distribuidos en forma justa.' },
  { id: 42, dimension: 'Toma de decisiones', text: 'Ante un problema, mi jefe inmediato obtiene informacion antes de tomar una decision.' },
  { id: 43, dimension: 'Toma de decisiones', text: 'Puedo participar en la definicion de objetivos y acciones para lograrlos.' },
  { id: 44, dimension: 'Toma de decisiones', text: 'En DACHASAC puedo participar en la toma de decisiones.' },
  { id: 45, dimension: 'Toma de decisiones', text: 'Mi jefe inmediato se reune regularmente con su equipo para coordinar soluciones.' },
];

export const scaleQuestions: ScaleQuestion[] = [
  { id: 46, dimension: 'Felicidad laboral', text: 'Cuan feliz se considera usted en el trabajo?', lowLabel: 'Definitivamente no soy feliz', highLabel: 'Definitivamente soy feliz' },
  { id: 47, dimension: 'Recomendacion', text: 'Que tan probable es que recomiende a amigos o colegas trabajar para DACHASAC?', lowLabel: 'Definitivamente no lo recomendaria', highLabel: 'Definitivamente si lo recomendaria' },
  { id: 48, dimension: 'Comodidad al expresarse', text: 'Que tan comodo se siente al darle sugerencias o comentarios a su jefe inmediato?', lowLabel: 'Definitivamente incomodo', highLabel: 'Definitivamente comodo' },
  { id: 49, dimension: 'Meta comun', text: 'Considera que todo el personal de su area se encuentra enfocado en una meta comun?', lowLabel: 'No estan enfocados', highLabel: 'Estan enfocados en una meta comun' },
];

export const openQuestions: OpenQuestion[] = [
  { id: 50, text: 'Hipoteticamente, si fuese a renunciar manana, cual seria su motivo?' },
  { id: 51, text: 'En que temas le gustaria recibir mas capacitaciones?' },
  { id: 52, text: 'Que considera que hace falta para sentirse mas seguro en su trabajo?' },
  { id: 53, text: 'Que cree que se deberia hacer para que este mas motivado?' },
];

export const competencies: Competency[] = [
  { id: 'planificacion', group: 'Competencias organizacionales', name: 'Planificacion y organizacion', description: 'Capacidad para fijar metas, prioridades, etapas, acciones, plazos y recursos requeridos para lograr objetivos.', keyQuestion: 'Organiza y planifica su trabajo de forma que garantiza el alcance de los objetivos?' },
  { id: 'cliente', group: 'Competencias organizacionales', name: 'Orientacion al cliente', description: 'Capacidad para entender necesidades de clientes internos o externos y orientar el trabajo hacia su satisfaccion.', keyQuestion: 'Entiende necesidades del cliente y ofrece alternativas que las satisfacen?' },
  { id: 'compromiso', group: 'Competencias organizacionales', name: 'Compromiso y pasion', description: 'Capacidad de sentir como propios los objetivos de la organizacion y apoyar decisiones frente al logro comun.', keyQuestion: 'Hace suyos los objetivos y metas de la organizacion o area?' },
  { id: 'logro', group: 'Competencias organizacionales', name: 'Orientacion al logro', description: 'Capacidad para orientar comportamientos propios y de otros hacia resultados, metas desafiantes y alto rendimiento.', keyQuestion: 'Mantiene exigencia constante para alcanzar alto desempeno?' },
  { id: 'presion', group: 'Competencias especificas', name: 'Tolerancia al trabajo bajo presion', description: 'Capacidad para trabajar con determinacion, firmeza y perseverancia ante objetivos retadores y mucha exigencia.', keyQuestion: 'Labora con eficiencia bajo presion, con actitud positiva y resolutiva?' },
  { id: 'flexibilidad', group: 'Competencias especificas', name: 'Flexibilidad y adaptacion al cambio', description: 'Capacidad para comprender perspectivas distintas y adecuarse a cambios del entorno de forma rapida y eficiente.', keyQuestion: 'Responde eficazmente ante cambios y nuevas exigencias?' },
  { id: 'equipo', group: 'Competencias especificas', name: 'Trabajo en equipo', description: 'Capacidad para participar activamente de una meta comun en un ambiente de cooperacion y responsabilidad compartida.', keyQuestion: 'Trabaja en equipo en funcion de una meta comun?' },
];

export const suggestedCourses = [
  'Inteligencia Emocional',
  'Gestion del Tiempo',
  'Comunicacion Asertiva',
  'Taller de Trabajo en Equipo',
  'Gestion por Indicadores',
  'Seguimiento y Feedback',
  'Manejo de Conflictos',
  'Herramientas para la Gestion de Personas',
  'Seguridad y Salud en el trabajo',
  'Sistemas y seguridad de la informacion',
];
