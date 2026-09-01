# Tareas pendientes — Transparencia institucional

La sección pública `/transparencia` ya está en el **frontend** con datos de ejemplo (Art. 42 de la Ley N.° 30512). No consume API. Este archivo lista lo que falta para que deje de ser un mock.

## Documentos reales que debe entregar la dirección

Reemplazan los valores de `frontend/src/app/pages/transparencia/transparencia.data.ts`. En PDF (o dato oficial) y, si aplica, vigencia:

| Ítem Art. 42 | Qué entregar |
|---|---|
| Datos generales | Nombre legal completo, **fecha de creación** (norma o acta), región/provincia/distrito oficiales, dirección, correo y teléfono vigentes. |
| Licenciamiento | **Resolución Ministerial (R.M.) de MINEDU** en PDF, número, fecha y **periodo de vigencia**. |
| RI / estatuto | **Reglamento Institucional** vigente (PDF). Hoy el ítem apunta a `/reglamentos` como paliativo. |
| Programas, horarios y matrícula | Lista oficial de programas, horarios del periodo y cronograma/requisitos de matrícula (PDF o tablas). |
| Becas y créditos del año en curso | Relación del **año en curso**: beneficiarios o montos, según lo que autorice publicar la dirección. |
| Pensiones, tasas y derechos | **Tarifario** vigente (matrícula, pensiones, derechos). |
| Investigación | Listado de **proyectos de investigación** y **gastos** que generan. |
| PEI | Proyecto Educativo Institucional (PDF). |
| PAT | Plan Anual de Trabajo (PDF). |
| PCI | Proyecto Curricular Institucional (PDF). |
| MPI | Manual de Procesos Institucionales (PDF). |
| Reglamento de Investigación | PDF vigente. |
| TUPA | Texto Único de Procedimientos Administrativos (PDF). Hoy el ítem apunta a `/procedimientos`. |
| Acceso a la información (Ley 27806) | Confirmar correo de mesa de partes y el texto del procedimiento (plazo de **10 días hábiles**). |
| Política de privacidad (Ley 29733) | Texto oficial para sustituir el placeholder de `/privacidad`. |

Los ítems con `vigente: false` y `urlArchivo: null` en el data file no deben publicarse como si fueran el documento oficial.

## Trabajo de backend pendiente

No implementar ahora. Cuando exista API:

1. **Tabla** (MySQL, ejemplo): `documentos_transparencia` con `id`, `categoria`, `titulo`, `descripcion`, `url_archivo`, `vigente`, `publicado_en`, `actualizado_en`.
2. **Tabla o campos** de ficha institucional: datos generales + número/periodo de la R.M.
3. **Endpoint público** de solo lectura, p. ej. `GET /api/transparencia` (ficha + lista de documentos vigentes).
4. **Admin**: alta/edición, marcar vigente/no vigente, y **subida de PDF** (disco o object storage) que rellene `url_archivo`.
5. En el frontend, sustituir el import de `transparencia.data.ts` por un servicio HTTP (`HttpClient` / `httpResource`) **sin cambiar la forma** `{ categoria, titulo, descripcion, urlArchivo, vigente }`.

## Referencias a “SUNEDU” encontradas

### Corregidas en el frontend (comentario CSS; el texto visible no las usaba)

Se reemplazó `SUNEDU` por `MINEDU` en comentarios. Líneas **antes** del cambio:

| Archivo | Líneas |
|---|---|
| `frontend/src/app/layout/header/header.css` | 13, 159 |
| `frontend/src/app/layout/footer/footer.css` | 1, 20, 66, 97, 169, 255 |
| `frontend/src/app/pages/inicio/inicio.css` | 36, 78, 519, 857, 915, 1180, 1228 |
| `frontend/src/app/pages/nosotros/nosotros.css` | 1, 19, 100, 176, 231, 280, 451 |
| `frontend/src/app/pages/admision/admision.css` | 1, 31 |
| `frontend/src/app/pages/programas/programas.css` | 1, 31 |
| `frontend/src/app/pages/mesa-de-partes/mesa-de-partes.css` | 2, 104, 219, 255 |
| `frontend/src/app/components/chatbot/chatbot.css` | 2, 70, 95, 172, 242, 452 |

Tras el reemplazo, **no queda “SUNEDU”** en `frontend/src`.

### No modificadas (fuera de esta tarea o archivo de archivo)

| Archivo | Línea | Motivo |
|---|---|---|
| `backend/helpers/chatbot.helper.js` | 128 | Patrón `'sunedu'` en el chatbot. **No se tocó el backend.** Conviene quitarlo o sustituirlo por `minedu` / `digedd` en una tarea aparte. |
| `.impeccable/critique/2026-09-01T14-24-30Z__frontend-src-app-pages-inicio.md` | 34, 59, 64, 91, 99 | Snapshot de una crítica previa; no es código de producción. |

## Otras inconsistencias del frontend (no bloquean Transparencia)

- **Pie de página:** el copyright dice “Instituto Superior Académico” y, si falla el API de contactos, muestra Lima (`Av. Principal 123`) y un correo genérico. El nombre legal es I.E.S.P.P. Virgen del Carmen (Paucartambo, Cusco).
- **Biblioteca virtual** en Inicio: el acceso del hero no tiene URL; la tarjeta de gestión apunta al login de Microsoft Teams.
- **Egresados** en Inicio enlaza a `/estadisticas`.
- **Cursos** en Inicio usan fotos de Unsplash y no son enlaces.
- Hay **páginas hermanas** (`/reglamentos`, `/costos`, `/becas`, `/procedimientos`, `/licenciamiento`) que se reutilizan desde Transparencia; hay que alinear su contenido con los PDF oficiales cuando existan.
- La página `/privacidad` es un **placeholder** (Ley 29733) hasta el texto jurídico oficial.
