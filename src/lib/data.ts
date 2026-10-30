/**
 * CIRCULA — Modelo de Datos v0.1 (Documento Fundacional 30/08/2026)
 * Plataforma centralizada para la circulación gratuita de libros y materiales educativos.
 * El núcleo son libros de lectura general y textos/materiales de estudio.
 */

export type MaterialStatus = "borrador" | "disponible" | "reservado" | "entregado" | "inactivo";
export type DonationStatus = "pendiente" | "contactada" | "aceptada" | "recepcion" | "recibida" | "rechazada" | "cancelada";
export type RequestStatus = "recibida" | "coordinacion" | "reservada" | "entregada" | "cancelada" | "vencida";

// Solo lectura: libros y textos/apuntes de estudio (excluido instrumental/calculadoras)
export type TipoMaterial = "libro" | "texto_estudio" | "apuntes_catedra";
export type CondicionMaterial = "excelente" | "muy_bueno" | "bueno" | "regular";
export type AmbitoMaterial = "lectura_general" | "universitario" | "profesorado_docente" | "secundaria";

export interface HitoMaterial {
  fecha: string;
  evento: string;
  detalle?: string;
}

export interface Category {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
  descripcion?: string;
}

export interface Material {
  id: string;
  ref: string; // ej: MAT-1042
  titulo: string;
  subtitulo?: string;
  autor: string;
  tipo: TipoMaterial;
  ambito: AmbitoMaterial;
  categoriaId: string;
  materia?: string; // ej: "Historia Universal", "Cálculo 1", "Pedagogía y Didáctica"
  institucion?: string; // ej: "IPA / Formación Docente", "Facultad de Humanidades", "FING", "FCEA"
  carreraProfesorado?: string; // ej: "Profesorado de Literatura", "Medicina", "Abogacía", "Ingeniería"
  editorial?: string;
  añoEdicion?: string;
  edicion?: string;
  isbn?: string;
  paginas?: number;
  condicion: CondicionMaterial;
  descripcion: string;
  estado: MaterialStatus;
  zonaRetiro: string; // Zona aproximada (barrio/localidad) para privacidad
  puntoRetiroSugerido?: string; // ej: "Punto FING / Parque Rodó", "Punto Centro / Cordón"
  donationId?: string;
  fechaAlta: string;
  fechaBaja?: string;
  historial: HitoMaterial[];
  portadaGradient: string;
}

export type PublicMaterial = Omit<Material, "donationId">;

export interface Donation {
  id: string;
  ref: string; // ej: DON-2026-081
  nombreDonante: string;
  telefono: string; // Canal principal de WhatsApp
  email?: string;
  tipoOrigen: "biblioteca_particular" | "estudiante_egresado" | "profesor_docente" | "institucion";
  tipoMaterial: TipoMaterial;
  titulo: string;
  autor?: string;
  cantidadEstimada: number;
  descripcion: string;
  categoriaId: string;
  condicion: CondicionMaterial;
  zona: string; // Barrio / localidad del donante
  comentarios?: string;
  estado: DonationStatus;
  fechaCreacion: string;
  fechaActualizacion: string;
  notasInternas?: string;
}

export interface Request {
  id: string;
  ref: string; // ej: SOL-2026-044
  materialId: string;
  nombreSolicitante: string;
  telefono: string; // WhatsApp prioritario para coordinación
  email?: string;
  zona?: string; // Zona de preferencia del solicitante
  mensaje?: string;
  consentimiento: boolean;
  pin: string; // PIN de 4 dígitos para retiro
  qrToken: string; // Token único del pase digital
  estado: RequestStatus;
  operadorAsignado?: string;
  fechaCreacion: string;
  fechaExpiracion: string;
  fechaEntrega?: string;
  notasInternas?: string;
}

export interface AdminUser {
  email: string;
  nombre: string;
  rol: "operador" | "admin";
  cargo: string;
}

export interface AuditEntry {
  id: string;
  fecha: string;
  entidad: "Material" | "Donación" | "Solicitud" | "Categoría" | "Sistema";
  entidadRef: string;
  accion: string;
  usuario: string;
  detalle: string;
}

// Máquinas de estado según §9
export const DONATION_FLOW: Record<DonationStatus, DonationStatus[]> = {
  pendiente: ["contactada", "rechazada", "cancelada"],
  contactada: ["aceptada", "rechazada", "cancelada"],
  aceptada: ["recepcion", "cancelada"],
  recepcion: ["recibida", "cancelada"],
  recibida: [],
  rechazada: [],
  cancelada: [],
};

export const MATERIAL_FLOW: Record<MaterialStatus, MaterialStatus[]> = {
  borrador: ["disponible", "inactivo"],
  disponible: ["reservado", "inactivo"],
  reservado: ["disponible", "entregado", "inactivo"],
  entregado: ["disponible", "inactivo"],
  inactivo: ["disponible", "borrador"],
};

export const REQUEST_FLOW: Record<RequestStatus, RequestStatus[]> = {
  recibida: ["coordinacion", "cancelada", "vencida"],
  coordinacion: ["reservada", "cancelada", "vencida"],
  reservada: ["entregada", "cancelada", "vencida"],
  entregada: [],
  cancelada: [],
  vencida: [],
};

export const DEMO_USERS: (AdminUser & { pass: string })[] = [
  {
    email: "operador@circula.uy",
    nombre: "Mariana Silva",
    rol: "operador",
    cargo: "Mesa de Enlace & Catalogación",
    pass: "operador",
  },
  {
    email: "admin@circula.uy",
    nombre: "Ignacio Techera",
    rol: "admin",
    cargo: "Administración General y Parámetros",
    pass: "admin",
  },
];

export const seedCategories: Category[] = [
  { id: "c-lit", nombre: "Literatura, Novela & Poesía", orden: 1, activo: true, descripcion: "Obras clásicas, narrativa contemporánea, cuentos y poesía." },
  { id: "c-ens", nombre: "Filosofía, Ensayo & Pensamiento", orden: 2, activo: true, descripcion: "Reflexión social, humanidades y ensayos de pensamiento crítico." },
  { id: "c-doc", nombre: "Educación, Pedagogía & Profesorado", orden: 3, activo: true, descripcion: "Textos de formación docente, didáctica y ciencias de la educación." },
  { id: "c-his", nombre: "Historia, Sociedad & Geografía", orden: 4, activo: true, descripcion: "Historia universal, latinoamericana, sociología y ciencias sociales." },
  { id: "c-cie", nombre: "Ciencias Exactas & Naturales", orden: 5, activo: true, descripcion: "Matemáticas, física, química, biología y ecología." },
  { id: "c-sal", nombre: "Ciencias de la Salud & Medicina", orden: 6, activo: true, descripcion: "Anatomía, fisiología, psicología y tratados de enfermería." },
  { id: "c-eco", nombre: "Economía, Administración & Derecho", orden: 7, activo: true, descripcion: "Textos universitarios de ciencias jurídicas, contables y gestión." },
  { id: "c-ing", nombre: "Ingeniería, Tecnología & Computación", orden: 8, activo: true, descripcion: "Algoritmos, estructuras, cálculo y ciencias de la computación." },
  { id: "c-div", nombre: "Divulgación Científica & Biografías", orden: 9, activo: true, descripcion: "Lectura accesible sobre descubrimientos, naturaleza e historia." },
];

export const seedMaterials: Material[] = [
  // --- 50% LIBROS DE LECTURA GENERAL (Provenientes de bibliotecas particulares) ---
  {
    id: "m-lit1",
    ref: "MAT-0101",
    titulo: "Cien años de soledad",
    subtitulo: "Edición conmemorativa de la RAE",
    autor: "Gabriel García Márquez",
    tipo: "libro",
    ambito: "lectura_general",
    categoriaId: "c-lit",
    editorial: "Real Academia Española / Alfaguara",
    añoEdicion: "2017",
    isbn: "978-8420471839",
    paginas: 608,
    condicion: "excelente",
    descripcion: "Edición especial con notas filológicas e introducción crítica. Como nuevo, tapas duras impecables. Donado desde biblioteca particular familiar para que continúe siendo leído.",
    estado: "disponible",
    zonaRetiro: "Cordón / Parque Rodó",
    puntoRetiroSugerido: "Punto Cordón Cultural",
    fechaAlta: "2026-10-20",
    historial: [
      { fecha: "2026-10-18", evento: "Donación recibida de biblioteca privada", detalle: "Revisado y catalogado por Mariana Silva" },
      { fecha: "2026-10-20", evento: "Publicado en catálogo", detalle: "Disponible para solicitud inmediata" },
    ],
    portadaGradient: "from-amber-700 via-amber-800 to-stone-900",
  },
  {
    id: "m-lit2",
    ref: "MAT-0102",
    titulo: "Ficciones",
    subtitulo: "El jardín de senderos que se bifurcan y Artificios",
    autor: "Jorge Luis Borges",
    tipo: "libro",
    ambito: "lectura_general",
    categoriaId: "c-lit",
    editorial: "Debolsillo",
    añoEdicion: "2021",
    isbn: "978-8497592420",
    paginas: 224,
    condicion: "muy_bueno",
    descripcion: "Cuentos fundamentales de la literatura en español. Ejemplar cuidado sin subrayados, lomo firme. Ideal para lectores o estudiantes de letras.",
    estado: "disponible",
    zonaRetiro: "Pocitos / Punta Carretas",
    puntoRetiroSugerido: "Punto Pocitos Vecinal",
    fechaAlta: "2026-10-22",
    historial: [
      { fecha: "2026-10-21", evento: "Recepción de donación", detalle: "Donante particular liberó libro de estantería" },
      { fecha: "2026-10-22", evento: "Catalogado y disponible", detalle: "Disponible en catálogo público" },
    ],
    portadaGradient: "from-slate-700 via-slate-800 to-slate-950",
  },
  {
    id: "m-ens1",
    ref: "MAT-0103",
    titulo: "El laberinto de la soledad",
    subtitulo: "Posdata y otros ensayos",
    autor: "Octavio Paz",
    tipo: "libro",
    ambito: "lectura_general",
    categoriaId: "c-ens",
    editorial: "Fondo de Cultura Económica",
    añoEdicion: "2015",
    isbn: "978-9681603014",
    paginas: 340,
    condicion: "muy_bueno",
    descripcion: "Clásico ensayo sociológico y cultural sobre la identidad latinoamericana. Letra nítida, interior muy limpio.",
    estado: "disponible",
    zonaRetiro: "Centro / Ciudad Vieja",
    puntoRetiroSugerido: "Punto Biblioteca Central",
    fechaAlta: "2026-10-15",
    historial: [
      { fecha: "2026-10-15", evento: "Alta en catálogo", detalle: "Revisión física completada" },
    ],
    portadaGradient: "from-orange-800 to-amber-950",
  },
  {
    id: "m-div1",
    ref: "MAT-0104",
    titulo: "Sapiens: De animales a dioses",
    subtitulo: "Una breve historia de la humanidad",
    autor: "Yuval Noah Harari",
    tipo: "libro",
    ambito: "lectura_general",
    categoriaId: "c-div",
    editorial: "Debate",
    añoEdicion: "2019",
    isbn: "978-8499926223",
    paginas: 496,
    condicion: "excelente",
    descripcion: "Ensayo divulgativo global que recorre la evolución del Homo sapiens desde el Paleolítico hasta la era biotecnológica. Estado impecable.",
    estado: "disponible",
    zonaRetiro: "Pocitos / Parque Batlle",
    puntoRetiroSugerido: "Punto Espacio Pocitos",
    fechaAlta: "2026-10-25",
    historial: [
      { fecha: "2026-10-25", evento: "Ingreso al catálogo", detalle: "Donado por lector particular" },
    ],
    portadaGradient: "from-stone-800 via-stone-900 to-neutral-950",
  },
  {
    id: "m-lit3",
    ref: "MAT-0105",
    titulo: "Pedro Páramo",
    subtitulo: "Edición conmemorativa",
    autor: "Juan Rulfo",
    tipo: "libro",
    ambito: "lectura_general",
    categoriaId: "c-lit",
    editorial: "Editorial RM / Fundación Juan Rulfo",
    añoEdicion: "2018",
    isbn: "978-8492480371",
    paginas: 132,
    condicion: "excelente",
    descripcion: "Obra maestra de la narrativa breve latinoamericana. Libro en óptimas condiciones, sin dobleces en lomo ni esquinas.",
    estado: "disponible",
    zonaRetiro: "Cordón Sur",
    puntoRetiroSugerido: "Punto Café & Libros Cordón",
    fechaAlta: "2026-10-27",
    historial: [
      { fecha: "2026-10-27", evento: "Publicado", detalle: "Donación particular clasificada" },
    ],
    portadaGradient: "from-stone-700 via-amber-900 to-slate-900",
  },

  // --- 50% TEXTOS DE ESTUDIO Y FORMACIÓN (Universitarios y Profesorado) ---
  {
    id: "m-est1",
    ref: "MAT-0201",
    titulo: "Pedagogía del oprimido",
    subtitulo: "Fundamentos de la educación liberadora",
    autor: "Paulo Freire",
    tipo: "texto_estudio",
    ambito: "profesorado_docente",
    categoriaId: "c-doc",
    materia: "Pedagogía y Teoría de la Educación",
    institucion: "Institutos de Formación Docente / IPA",
    carreraProfesorado: "Profesorado en Educación Media",
    editorial: "Siglo XXI Editores",
    añoEdicion: "2020",
    isbn: "978-9876290159",
    paginas: 256,
    condicion: "muy_bueno",
    descripcion: "Lectura esencial en cursos de formación docente y pedagogía. Contiene algunas notas en lápiz al margen realizadas por una docente ya graduada.",
    estado: "disponible",
    zonaRetiro: "Centro / Barrio Sur",
    puntoRetiroSugerido: "Punto Formación Docente",
    fechaAlta: "2026-10-21",
    historial: [
      { fecha: "2026-10-21", evento: "Catalogado para profesorados", detalle: "Donado por egresada de IPA" },
    ],
    portadaGradient: "from-emerald-800 via-teal-900 to-slate-900",
  },
  {
    id: "m-est2",
    ref: "MAT-0202",
    titulo: "Cálculo: Trascendentes Tempranas",
    subtitulo: "Tomo I y II combinados",
    autor: "James Stewart",
    tipo: "texto_estudio",
    ambito: "universitario",
    categoriaId: "c-cie",
    materia: "Cálculo Diferencial e Integral 1 y 2",
    institucion: "Facultad de Ingeniería (UdelaR)",
    carreraProfesorado: "Ingeniería / Licenciatura en Física",
    editorial: "Cengage Learning",
    añoEdicion: "8va Edición (2018)",
    isbn: "978-6075265537",
    paginas: 1368,
    condicion: "bueno",
    descripcion: "El manual clásico de cálculo universitario. Tapas duras protegidas con forro, interior completo. Muy buscado por estudiantes de primer año.",
    estado: "disponible",
    zonaRetiro: "Parque Rodó",
    puntoRetiroSugerido: "Punto FING / Julio Herrera",
    fechaAlta: "2026-10-18",
    historial: [
      { fecha: "2026-10-16", evento: "Recepción de donación", detalle: "Donado por estudiante al terminar Cálculo" },
      { fecha: "2026-10-18", evento: "Publicado en catálogo", detalle: "Disponible para retiro" },
    ],
    portadaGradient: "from-blue-900 via-indigo-950 to-slate-950",
  },
  {
    id: "m-est3",
    ref: "MAT-0203",
    titulo: "Principios de Economía",
    subtitulo: "Teoría micro y macroeconómica para cursos iniciales",
    autor: "N. Gregory Mankiw",
    tipo: "texto_estudio",
    ambito: "universitario",
    categoriaId: "c-eco",
    materia: "Economía Descriptiva y Microeconomía 1",
    institucion: "Facultad de Ciencias Económicas y Administración",
    carreraProfesorado: "Contador Público / Licenciatura en Economía",
    editorial: "Cengage Learning",
    añoEdicion: "7ma Edición (2017)",
    isbn: "978-6075265506",
    paginas: 880,
    condicion: "muy_bueno",
    descripcion: "Manual de referencia indispensable para materias de primer año de economía y contabilidad. Cuadernillo de tablas completo.",
    estado: "reservado",
    zonaRetiro: "Parque Rodó",
    puntoRetiroSugerido: "Punto FCEA / Gonzalo Ramírez",
    fechaAlta: "2026-10-12",
    historial: [
      { fecha: "2026-10-12", evento: "Ingreso al catálogo", detalle: "Donación catalogada" },
      { fecha: "2026-10-27", evento: "Solicitud reservada", detalle: "En proceso de coordinación con estudiante de FCEA" },
    ],
    portadaGradient: "from-emerald-900 via-teal-950 to-stone-900",
  },
  {
    id: "m-est4",
    ref: "MAT-0204",
    titulo: "Apuntes y Guía de Trabajos Prácticos: Historia del Uruguay Independiente",
    subtitulo: "Siglo XIX y Modernización Batllista",
    autor: "Cátedra de Historia Nacional / Centro de Estudiantes",
    tipo: "apuntes_catedra",
    ambito: "profesorado_docente",
    categoriaId: "c-his",
    materia: "Historia Uruguaya I y II",
    institucion: "IPA / Facultad de Humanidades",
    carreraProfesorado: "Profesorado de Historia / Lic. en Historia",
    editorial: "Publicación de cátedra anillada",
    añoEdicion: "2025",
    paginas: 210,
    condicion: "muy_bueno",
    descripcion: "Compilación anillada con textos fuentes, cuadros cronológicos y ejercicios prácticos de examen. Muy útil para preparar parciales.",
    estado: "disponible",
    zonaRetiro: "Cordón / 18 de Julio",
    puntoRetiroSugerido: "Punto Biblioteca Central",
    fechaAlta: "2026-10-24",
    historial: [
      { fecha: "2026-10-24", evento: "Catalogado", detalle: "Apuntes anillados revisados completos" },
    ],
    portadaGradient: "from-amber-900 via-stone-800 to-slate-900",
  },
  {
    id: "m-est5",
    ref: "MAT-0205",
    titulo: "Atlas de Anatomía Humana",
    subtitulo: "Enfoque clínico regional",
    autor: "Frank H. Netter, MD",
    tipo: "texto_estudio",
    ambito: "universitario",
    categoriaId: "c-sal",
    materia: "Anatomía Descriptiva y Topográfica",
    institucion: "Facultad de Medicina (Campus Salud)",
    carreraProfesorado: "Doctor en Medicina / Lic. en Enfermería",
    editorial: "Elsevier Masson",
    añoEdicion: "6ta Edición",
    isbn: "978-8490227374",
    paginas: 640,
    condicion: "bueno",
    descripcion: "Tratado visual de referencia con láminas a color de cabeza, cuello, tórax, abdomen y miembros. Encuadernación firme.",
    estado: "entregado",
    zonaRetiro: "La Comercial / Aguada",
    puntoRetiroSugerido: "Punto Campus Salud",
    fechaAlta: "2026-09-15",
    fechaBaja: "2026-10-18",
    historial: [
      { fecha: "2026-09-15", evento: "Catalogado", detalle: "Donado por médico residente" },
      { fecha: "2026-10-18", evento: "Entregado a estudiante", detalle: "Retiro concretado con éxito en Punto Salud" },
    ],
    portadaGradient: "from-rose-950 via-slate-900 to-neutral-950",
  },
];

export const seedDonations: Donation[] = [
  {
    id: "don-01",
    ref: "DON-2026-012",
    nombreDonante: "Beatriz Méndez",
    telefono: "+598 99 123 456",
    email: "bmendez@correo.com",
    tipoOrigen: "biblioteca_particular",
    tipoMaterial: "libro",
    titulo: "Lote de 4 libros de Ensayo, Historia y Literatura",
    autor: "Zygmunt Bauman, Bourdieu y Mario Benedetti",
    cantidadEstimada: 4,
    descripcion: "Libros en excelente estado que estaban guardados en mi biblioteca familiar sin leer hace tiempo. Queremos que circulen entre estudiantes y nuevos lectores.",
    categoriaId: "c-ens",
    condicion: "muy_bueno",
    zona: "Cordón Sur",
    comentarios: "Puedo acercarlos en horario de tarde a cualquier punto de la zona Cordón o Centro.",
    estado: "pendiente",
    fechaCreacion: "2026-10-28",
    fechaActualizacion: "2026-10-28",
    notasInternas: "Oferta pertinente. Contactar por WhatsApp para coordinar recepción.",
  },
  {
    id: "don-02",
    ref: "DON-2026-009",
    nombreDonante: "Gonzalo Varela",
    telefono: "+598 98 765 432",
    email: "gvarela@gmail.com",
    tipoOrigen: "estudiante_egresado",
    tipoMaterial: "texto_estudio",
    titulo: "Química Orgánica: Estructura y Función",
    autor: "K. Peter C. Vollhardt",
    cantidadEstimada: 1,
    descripcion: "Texto en tapa dura para estudiantes de química o ingeniería química. Con algunas anotaciones en márgenes pero en muy buen estado general.",
    categoriaId: "c-cie",
    condicion: "bueno",
    zona: "Parque Rodó",
    comentarios: "Dejado en custodia provisoria.",
    estado: "recibida",
    fechaCreacion: "2026-10-20",
    fechaActualizacion: "2026-10-24",
    notasInternas: "Material recibido físicamente. Listo para catalogar y publicar.",
  },
  {
    id: "don-03",
    ref: "DON-2026-004",
    nombreDonante: "Prof. Laura Benítez",
    telefono: "+598 91 333 444",
    email: "lbenitez@docentes.edu.uy",
    tipoOrigen: "profesor_docente",
    tipoMaterial: "apuntes_catedra",
    titulo: "Colección de cuadernillos de Didáctica General y Planificación Docente",
    autor: "Cátedra de Formación Docente",
    cantidadEstimada: 6,
    descripcion: "Guías impresas y anilladas de apoyo para profesorados de enseñanza media.",
    categoriaId: "c-doc",
    condicion: "muy_bueno",
    zona: "Centro",
    estado: "aceptada",
    fechaCreacion: "2026-10-22",
    fechaActualizacion: "2026-10-26",
    notasInternas: "Coordinando retiro esta semana.",
  },
];

export const seedRequests: Request[] = [
  {
    id: "req-01",
    ref: "SOL-2026-044",
    materialId: "m-est3",
    nombreSolicitante: "Camila Rodríguez",
    telefono: "+598 91 222 333",
    email: "camila.rodriguez@fcea.edu.uy",
    zona: "Parque Rodó",
    mensaje: "Para cursar Microeconomía 1 este semestre en FCEA. Muchas gracias por la iniciativa.",
    consentimiento: true,
    pin: "4921",
    qrToken: "CIRCULA-PASS-SOL-2026-044-4921",
    estado: "reservada",
    operadorAsignado: "Mariana Silva",
    fechaCreacion: "2026-10-27",
    fechaExpiracion: "2026-11-04",
    notasInternas: "Pase emitido con PIN 4921. Estudiante avisada por WhatsApp para retiro.",
  },
  {
    id: "req-02",
    ref: "SOL-2026-039",
    materialId: "m-est5",
    nombreSolicitante: "Lucas Pereyra",
    telefono: "+598 94 888 777",
    email: "lucas.p@med.edu.uy",
    zona: "La Comercial",
    mensaje: "Para anatomía clínica de segundo año.",
    consentimiento: true,
    pin: "7109",
    qrToken: "CIRCULA-PASS-SOL-2026-039-7109",
    estado: "entregada",
    operadorAsignado: "Mariana Silva",
    fechaCreacion: "2026-10-10",
    fechaExpiracion: "2026-10-17",
    fechaEntrega: "2026-10-18",
    notasInternas: "Retirado y validado con PIN. Material en circulación.",
  },
];

export const seedAudit: AuditEntry[] = [
  {
    id: "aud-01",
    fecha: "2026-10-29 14:15",
    entidad: "Sistema",
    entidadRef: "—",
    accion: "Arranque del sistema v0.1",
    usuario: "sistema@circula.uy",
    detalle: "Catálogo centralizado de libros y textos de estudio iniciado correctamente.",
  },
  {
    id: "aud-02",
    fecha: "2026-10-27 16:30",
    entidad: "Solicitud",
    entidadRef: "SOL-2026-044",
    accion: "Reserva de material",
    usuario: "operador@circula.uy",
    detalle: "Pase emitido para 'Principios de Economía' con PIN 4921.",
  },
  {
    id: "aud-03",
    fecha: "2026-10-25 11:20",
    entidad: "Material",
    entidadRef: "MAT-0104",
    accion: "Catalogación de libro",
    usuario: "operador@circula.uy",
    detalle: "Catalogado 'Sapiens' de Yuval Noah Harari procedente de biblioteca particular en Pocitos.",
  },
];
