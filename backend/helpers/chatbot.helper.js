// ─── Normalización ──────────────────────────────────────────────────────────
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Base de conocimiento ────────────────────────────────────────────────────
const rules = [
  {
    patterns: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'buenas', 'saludos', 'hey', 'hi'],
    response: '¡Hola! Bienvenido al IESPP Virgen del Carmen 😊. ¿En qué puedo ayudarte hoy?',
    quickReplies: ['Programas de estudio', 'Admisión', 'Costos', 'Contacto'],
  },
  {
    patterns: ['quienes son', 'que es el instituto', 'sobre ustedes', 'historia', 'nosotros', 'institucional'],
    response: 'El **IESPP Virgen del Carmen** es una institución de Educación Superior Pedagógica dedicada a la formación de docentes de calidad.',
    links: [{ label: 'Conocer más sobre nosotros', path: '/nosotros' }],
    quickReplies: ['Misión y visión', 'Programas', 'Personal docente'],
  },
  {
    patterns: ['mision', 'vision', 'mision y vision', 'objetivos institucionales'],
    response: 'Nuestra **Misión** es formar docentes competentes, éticos y comprometidos. Nuestra **Visión** es ser referencia en educación pedagógica a nivel regional.',
    links: [{ label: 'Ver misión y visión', path: '/nosotros' }],
  },
  {
    patterns: ['organigrama', 'estructura', 'autoridades', 'director', 'directivos'],
    response: 'Puedes conocer la estructura organizacional y las autoridades en nuestra página de "Nosotros".',
    links: [{ label: 'Ver organigrama', path: '/nosotros#organigrama' }],
  },
  {
    patterns: ['programas', 'carreras', 'especialidades', 'que estudian', 'que ofrecen', 'educacion', 'inicial', 'primaria', 'computacion', 'ingles', 'secundaria'],
    response: 'Ofrecemos programas de formación docente en diversas especialidades. Revisa el detalle en nuestra sección de Programas.',
    links: [{ label: 'Ver todos los programas', path: '/programas' }],
    quickReplies: ['¿Cuánto dura la carrera?', 'Proceso de admisión', 'Costos de pensión'],
  },
  {
    patterns: ['duracion', 'cuanto dura', 'anos', 'semestres', 'años de estudio'],
    response: 'Los programas tienen una duración de **10 semestres académicos (5 años)**. Al concluir obtienes el título de Profesor en la especialidad correspondiente.',
    quickReplies: ['Costos', 'Programas disponibles'],
  },
  {
    patterns: ['titulo', 'grado', 'certificado', 'diploma', 'bachiller'],
    response: 'Al concluir obtienes el **Título Profesional de Profesor** en tu especialidad, reconocido por el Ministerio de Educación del Perú.',
    quickReplies: ['Programas disponibles', 'Proceso de admisión'],
  },
  {
    patterns: ['admision', 'ingreso', 'postular', 'inscripcion', 'inscribir', 'como entrar', 'proceso de admision', 'examen', 'postulacion', 'requisitos'],
    response: '**Proceso de Admisión:**\n\n📋 Necesitas:\n• DNI vigente\n• Certificado de estudios de secundaria\n• Partida de nacimiento\n• 2 fotos tamaño carné\n• Pago de derecho de inscripción',
    links: [{ label: 'Ver bases y documentos de admisión', path: '/admision' }],
    quickReplies: ['¿Cuándo es el examen?', 'Costos de admisión', 'Programas disponibles'],
  },
  {
    patterns: ['cuando es el examen', 'fecha examen', 'cronograma admision', 'fecha postulacion'],
    response: 'El cronograma de admisión se publica en nuestra sección oficial. Te recomendamos revisar los documentos o contactarnos directamente.',
    links: [{ label: 'Ver documentos de admisión', path: '/admision' }],
    quickReplies: ['Contacto', 'Requisitos'],
  },
  {
    patterns: ['costo', 'pension', 'mensualidad', 'matricula', 'cuanto cuesta', 'precio', 'pago', 'cuota', 'arancel'],
    response: 'Encuentra la información detallada sobre costos de matrícula, pensiones y aranceles en nuestra sección de Costos.',
    links: [{ label: 'Ver costos y pensiones', path: '/costos' }],
    quickReplies: ['Becas y financiamiento', 'Proceso de admisión'],
  },
  {
    patterns: ['beca', 'becas', 'credito', 'financiamiento', 'apoyo economico', 'pronabec'],
    response: 'Contamos con información sobre becas y créditos educativos. Revisa los programas de apoyo disponibles.',
    links: [{ label: 'Ver becas y créditos', path: '/becas' }],
    quickReplies: ['Requisitos de beca', 'Costos', 'Contacto'],
  },
  {
    patterns: ['servicios', 'servicios institucionales', 'apoyo estudiantil'],
    response: 'Servicios disponibles:\n\n🧠 **Soporte Psicopedagógico**\n🏥 **Soporte Médico**\n🤝 **Servicio Social**\n📄 **Mesa de Partes Virtual**',
    links: [{ label: 'Ver todos los servicios', path: '/servicios' }],
    quickReplies: ['Soporte psicopedagógico', 'Soporte médico', 'Mesa de partes'],
  },
  {
    patterns: ['psicopedagogico', 'psicologia', 'orientacion', 'tutoria', 'apoyo psicologico'],
    response: 'El **Soporte Psicopedagógico** ofrece orientación académica y psicológica a todos los estudiantes.',
    links: [{ label: 'Ir a Soporte Psicopedagógico', path: '/psicopedagogico' }],
  },
  {
    patterns: ['medico', 'salud', 'enfermeria', 'atencion medica', 'soporte medico'],
    response: 'El **Soporte Médico** brinda atención básica de salud a estudiantes y personal.',
    links: [{ label: 'Ir a Soporte Médico', path: '/soporte-medico' }],
  },
  {
    patterns: ['servicio social', 'bienestar', 'bienestar estudiantil', 'trabajo social'],
    response: 'El **Servicio Social** trabaja para el bienestar integral del estudiante y gestiona programas de apoyo social.',
    links: [{ label: 'Ir a Servicio Social', path: '/servicio-social' }],
  },
  {
    patterns: ['mesa de partes', 'tramite', 'solicitud', 'constancia', 'certificado estudios', 'virtual', 'enviar documento'],
    response: 'Realiza tus trámites a través de nuestra **Mesa de Partes Virtual**, disponible las 24 horas.',
    links: [{ label: 'Ir a Mesa de Partes Virtual', path: '/mesa-de-partes' }],
    quickReplies: ['¿Qué trámites puedo hacer?', 'Contacto'],
  },
  {
    patterns: ['que tramites', 'tramites disponibles', 'que puedo enviar', 'tipos de solicitud'],
    response: 'Puedes presentar:\n\n• Solicitudes de constancias y certificados\n• Recursos de apelación\n• Solicitudes de traslado\n• Documentos académicos en general',
    links: [{ label: 'Acceder a Mesa de Partes', path: '/mesa-de-partes' }],
  },
  {
    patterns: ['noticias', 'novedades', 'actividades', 'eventos', 'comunicados', 'anuncios'],
    response: 'Mantente informado sobre las últimas noticias y comunicados en nuestra sección de Noticias.',
    links: [{ label: 'Ver últimas noticias', path: '/noticias' }],
  },
  {
    patterns: ['repositorio', 'investigacion', 'investigaciones', 'biblioteca', 'documentos academicos', 'publicaciones', 'tesis'],
    response: 'En nuestro **Repositorio Institucional** encontrarás investigaciones y publicaciones académicas.',
    links: [{ label: 'Ir al Repositorio Institucional', path: '/repositorio' }],
    quickReplies: ['¿Cómo accedo a los documentos?'],
  },
  {
    patterns: ['transparencia', 'informacion publica', 'portal transparencia', 'presupuesto', 'gestion'],
    response: 'En nuestro **Portal de Transparencia** encontrarás documentos de gestión, presupuestos e información pública oficial.',
    links: [{ label: 'Ir al Portal de Transparencia', path: '/transparencia' }],
  },
  {
    patterns: ['reglamento', 'reglamentos', 'normas', 'normativa', 'estatuto'],
    response: 'Los reglamentos institucionales están disponibles en nuestra sección dedicada.',
    links: [{ label: 'Ver reglamentos', path: '/reglamentos' }],
  },
  {
    patterns: ['licenciamiento', 'licencia', 'acreditacion', 'reconocimiento', 'sunedu'],
    response: 'Puedes revisar el estado y documentación del licenciamiento institucional en la sección correspondiente.',
    links: [{ label: 'Ver información de licenciamiento', path: '/licenciamiento' }],
  },
  {
    patterns: ['horarios', 'horario', 'clases', 'turno', 'manana', 'tarde'],
    response: 'Los horarios de clases están publicados en nuestra sección de Horarios por programa y semestre.',
    links: [{ label: 'Ver horarios', path: '/horarios' }],
  },
  {
    patterns: ['docentes', 'profesores', 'personal', 'plana docente', 'maestros', 'staff'],
    response: 'Conoce a nuestra destacada plana docente en la sección "Nosotros".',
    links: [{ label: 'Conocer el personal académico', path: '/nosotros#personal' }],
  },
  {
    patterns: ['estadisticas', 'datos', 'cifras', 'indicadores', 'resultados institucionales'],
    response: 'Las estadísticas institucionales e indicadores de rendimiento están disponibles en nuestra sección de Estadísticas.',
    links: [{ label: 'Ver estadísticas', path: '/estadisticas' }],
  },
  {
    patterns: ['contacto', 'telefono', 'celular', 'email', 'correo', 'direccion', 'ubicacion', 'donde estan', 'whatsapp', 'facebook'],
    response: '📞 **Contáctanos:**\n\n• WhatsApp / Teléfono: disponible en el pie de página\n• Email: disponible en el pie de página\n• Redes sociales: Facebook, Instagram, TikTok',
    links: [{ label: 'Ir a Mesa de Partes', path: '/mesa-de-partes' }],
    quickReplies: ['Mesa de partes', 'Ubicación'],
  },
  {
    patterns: ['gracias', 'muchas gracias', 'chau', 'adios', 'hasta luego', 'bye'],
    response: '¡De nada! Fue un placer ayudarte 😊. Que tengas un excelente día. 🎓',
    quickReplies: ['Otra consulta'],
  },
  {
    patterns: ['ayuda', 'help', 'que puedes hacer', 'opciones', 'menu', 'informacion'],
    response: 'Puedo ayudarte con:\n\n📚 Programas de estudio\n📝 Proceso de admisión\n💰 Costos y pensiones\n🎓 Becas\n📋 Trámites\n📰 Noticias\n📞 Contacto',
    quickReplies: ['Programas', 'Admisión', 'Costos', 'Contacto'],
  },
];

// ─── Motor de matching ───────────────────────────────────────────────────────
function getResponse(userInput) {
  const normalized = normalize(userInput);
  let bestRule = null;
  let bestScore = 0;

  for (const rule of rules) {
    let score = 0;
    for (const pattern of rule.patterns) {
      if (normalized.includes(pattern)) score += pattern.split(' ').length;
    }
    if (score > bestScore) { bestScore = score; bestRule = rule; }
  }

  if (bestRule && bestScore > 0) {
    return {
      text: bestRule.response,
      links: bestRule.links || [],
      quickReplies: [...(bestRule.quickReplies || []), '🔍 Otras consultas'],
    };
  }

  return {
    text: 'Lo siento, no entendí tu consulta 🤔. Puedo ayudarte con programas, admisión, costos, servicios y más. ¿Puedes reformular?',
    links: [],
    quickReplies: ['Programas de estudio', 'Admisión', 'Costos', 'Servicios', 'Contacto'],
  };
}

module.exports = { getResponse };