/**
 * Documentos de Transparencia institucional (Art. 42, Ley N.° 30512).
 * urlArchivo apunta a la página que ya muestra el PDF, o a /no-encontrado si aún no hay archivo.
 */

export type DocumentoTransparencia = {
  categoria: string;
  titulo: string;
  descripcion: string;
  urlArchivo: string;
};

export type DatoGeneral = {
  etiqueta: string;
  valor: string;
};

export const RUTA_NO_ENCONTRADO = '/no-encontrado';

export const DATOS_GENERALES: DatoGeneral[] = [
  {
    etiqueta: 'Nombre',
    valor: 'Instituto de Educación Superior Pedagógico Público Virgen del Carmen',
  },
  {
    etiqueta: 'Entidad licenciante',
    valor: 'Ministerio de Educación (MINEDU) — Dirección General de Educación Superior Pedagógica (DIGEDD)',
  },
  {
    etiqueta: 'Región / provincia / distrito',
    valor: 'Cusco / Paucartambo / Paucartambo',
  },
  {
    etiqueta: 'Dirección',
    valor: 'Sunchubamba Km. 07, carretera Paucartambo–Challabamba, Cusco',
  },
  {
    etiqueta: 'Correo institucional',
    valor: 'iesp-vc@eespvcpaucartambo.edu.pe',
  },
  {
    etiqueta: 'Teléfono',
    valor: '951 586 387',
  },
];

export const LICENCIAMIENTO = {
  entidad: 'MINEDU',
  instrumento: 'Resolución Ministerial (R.M.) de licenciamiento',
};

export const SOLICITUD_INFORMACION = {
  norma: 'Ley N.° 27806, Ley de Transparencia y Acceso a la Información Pública',
  canales: [
    {
      titulo: 'Mesa de partes virtual',
      detalle: 'Presentación de solicitudes por el portal institucional.',
      ruta: '/mesa-de-partes',
    },
    {
      titulo: 'Correo institucional',
      detalle: 'iesp-vc@eespvcpaucartambo.edu.pe',
      ruta: null as string | null,
    },
  ],
  plazo: '10 días hábiles como máximo, contados desde la presentación de la solicitud.',
};

/** Orden y rótulos exactos del Art. 42 de la Ley N.° 30512. */
export const CATEGORIAS_ART_42: string[] = [
  'Datos generales de la institución',
  'Periodo de vigencia del licenciamiento (R.M. de MINEDU)',
  'Estatuto o Reglamento Institucional (RI)',
  'Relación de programas de estudio, horarios y proceso de matrícula',
  'Becas y créditos educativos otorgados en el año en curso',
  'Pensiones, tasas y derechos de pago',
  'Proyectos de investigación y gastos que generan',
  'Documentos de gestión: PEI, PAT, PCI, MPI, Reglamento de Investigación, TUPA',
  'Procedimiento para solicitar información pública (Ley 27806)',
];

export const DOCUMENTOS_TRANSPARENCIA: DocumentoTransparencia[] = [
  {
    categoria: 'Periodo de vigencia del licenciamiento (R.M. de MINEDU)',
    titulo: 'Resolución Ministerial de licenciamiento',
    descripcion: 'R.M. emitida por el MINEDU que autoriza el funcionamiento y fija el periodo de vigencia.',
    urlArchivo: RUTA_NO_ENCONTRADO,
  },
  {
    categoria: 'Estatuto o Reglamento Institucional (RI)',
    titulo: 'Reglamento Institucional (RI)',
    descripcion: 'Normas internas de organización, gobierno y convivencia de la comunidad educativa.',
    urlArchivo: '/reglamentos',
  },
  {
    categoria: 'Relación de programas de estudio, horarios y proceso de matrícula',
    titulo: 'Programas de estudio',
    descripcion: 'Carreras y programas que ofrece la EESP.',
    urlArchivo: '/programas',
  },
  {
    categoria: 'Relación de programas de estudio, horarios y proceso de matrícula',
    titulo: 'Horarios de clases',
    descripcion: 'Horarios académicos del periodo vigente.',
    urlArchivo: '/horarios',
  },
  {
    categoria: 'Relación de programas de estudio, horarios y proceso de matrícula',
    titulo: 'Proceso de matrícula',
    descripcion: 'Cronograma, requisitos y procedimiento de matrícula.',
    urlArchivo: '/admision',
  },
  {
    categoria: 'Becas y créditos educativos otorgados en el año en curso',
    titulo: 'Becas y créditos educativos 2026',
    descripcion: 'Relación de apoyos económicos y créditos otorgados en el año en curso.',
    urlArchivo: '/becas',
  },
  {
    categoria: 'Pensiones, tasas y derechos de pago',
    titulo: 'Pensiones, tasas y derechos de pago',
    descripcion: 'Tarifario de matrícula, pensiones y derechos académicos.',
    urlArchivo: '/costos',
  },
  {
    categoria: 'Proyectos de investigación y gastos que generan',
    titulo: 'Proyectos de investigación',
    descripcion: 'Listado de proyectos y gastos asociados.',
    urlArchivo: '/repositorio',
  },
  {
    categoria: 'Documentos de gestión: PEI, PAT, PCI, MPI, Reglamento de Investigación, TUPA',
    titulo: 'Proyecto Educativo Institucional (PEI)',
    descripcion: 'Instrumento de planificación estratégica institucional.',
    urlArchivo: RUTA_NO_ENCONTRADO,
  },
  {
    categoria: 'Documentos de gestión: PEI, PAT, PCI, MPI, Reglamento de Investigación, TUPA',
    titulo: 'Plan Anual de Trabajo (PAT)',
    descripcion: 'Programación anual de actividades y metas.',
    urlArchivo: RUTA_NO_ENCONTRADO,
  },
  {
    categoria: 'Documentos de gestión: PEI, PAT, PCI, MPI, Reglamento de Investigación, TUPA',
    titulo: 'Proyecto Curricular Institucional (PCI)',
    descripcion: 'Propuesta curricular de la EESP.',
    urlArchivo: RUTA_NO_ENCONTRADO,
  },
  {
    categoria: 'Documentos de gestión: PEI, PAT, PCI, MPI, Reglamento de Investigación, TUPA',
    titulo: 'Manual de Procesos Institucionales (MPI)',
    descripcion: 'Descripción de procesos y responsables de la gestión.',
    urlArchivo: RUTA_NO_ENCONTRADO,
  },
  {
    categoria: 'Documentos de gestión: PEI, PAT, PCI, MPI, Reglamento de Investigación, TUPA',
    titulo: 'Reglamento de Investigación',
    descripcion: 'Normas de la actividad investigativa de docentes y estudiantes.',
    urlArchivo: RUTA_NO_ENCONTRADO,
  },
  {
    categoria: 'Documentos de gestión: PEI, PAT, PCI, MPI, Reglamento de Investigación, TUPA',
    titulo: 'TUPA',
    descripcion: 'Texto Único de Procedimientos Administrativos: trámites, requisitos y plazos.',
    urlArchivo: '/procedimientos',
  },
  {
    categoria: 'Procedimiento para solicitar información pública (Ley 27806)',
    titulo: 'Solicitud de acceso a la información pública',
    descripcion: 'Canal de mesa de partes para presentar la solicitud. Plazo máximo: 10 días hábiles.',
    urlArchivo: '/mesa-de-partes',
  },
];
