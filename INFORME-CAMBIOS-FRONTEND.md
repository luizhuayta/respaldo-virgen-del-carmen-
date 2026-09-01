# Informe técnico de cambios en el frontend público

**Proyecto:** Sitio web institucional del I.E.S.P.P. Virgen del Carmen  
**Ámbito:** Frontend Angular (portal público)  
**Fecha:** 1 de septiembre de 2026  
**Alcance:** Solo frontend. El backend no se modificó.  
**Formato:** Markdown, estructura estándar de 4 apartados

---

## 1. Introducción

### 1.1 Contexto institucional

El portal público corresponde al Instituto de Educación Superior Pedagógico Público Virgen del Carmen (EESP), con sede en Paucartambo, Cusco. No es una universidad. El ente rector aplicable es el **MINEDU**, a través de la **DIGEDD**, y no SUNEDU.

La aplicación pública está construida en **Angular 21** (componentes standalone, CSS propio, tipografía Poppins). La identidad visual usa azul marino `#1e3a8a`, azul `#3b82f6` y acento naranja `#f97316`.

### 1.2 Motivo del trabajo

En esta sesión se pidió, en este orden:

1. Evaluar si la página de **Inicio** estaba bien diseñada (tono de portal oficial, no landing comercial).
2. Corregir solo los tres problemas más graves de Inicio, en frontend.
3. Implementar **Transparencia institucional** según el artículo 42 de la Ley N.° 30512, con datos de ejemplo y sin backend.
4. Mejorar el diseño de Transparencia **sin quitar el contenido legal**.
5. Quitar los estados “Pendiente”, dejar **solo enlaces** (PDF si existe; 404 si no existe).
6. Documentar **todos** los cambios en un informe Markdown.

### 1.3 Criterios que se respetaron

- Tono de **portal institucional**, no de sitio de marketing.
- Cumplir el listado del **Art. 42** (rótulos legales intactos).
- No usar la palabra **SUNEDU** en el producto (código ni textos visibles del frontend).
- No tocar el backend.
- No inventar documentos oficiales: lo que no está publicado se trata como enlace a 404, no como “dato vigente”.

---

## 2. Objetivos y alcance

### 2.1 Objetivo general

Dejar el portal público más usable y formalmente correcto: Inicio legible en móvil, Transparencia alineada al Art. 42, navegación legal en el pie, y un comportamiento claro de documentos (PDF o 404).

### 2.2 Objetivos específicos

1. Corregir el hero de Inicio en móvil (solapamiento y jerarquía del H1).
2. Reorganizar las 14 tarjetas de gestión para que dejen de ser un muro uniforme.
3. Ajustar el encabezado: Admisión como acción principal; Transparencia como contorno, no naranja.
4. Construir `/transparencia` con las 9 categorías del Art. 42, Ley 27806 y datos de ejemplo.
5. Añadir `/privacidad` (placeholder Ley 29733) y enlaces legales en el footer.
6. Rediseñar Transparencia (índice, fichas, lista de archivos) sin perder contenido.
7. Eliminar el estado “Pendiente” y convertir cada documento en enlace.
8. Crear una página 404 típica (“No se encontró lo que buscas”).
9. Sustituir menciones a SUNEDU en comentarios CSS del frontend por MINEDU.

### 2.3 Fuera de alcance (no se hizo)

- Backend, API de transparencia ni panel admin de documentos.
- Corrección del copyright del footer (“Instituto Superior Académico”) y de los datos de Lima cuando falla el API de contactos.
- Biblioteca virtual, Egresados, fotos Unsplash y WhatsApp sin URL.
- Texto jurídico definitivo de privacidad (sigue siendo placeholder).
- PDF oficiales reales (PEI, PAT, PCI, MPI, R.M., etc.): aún no existen en el repositorio.

---

## 3. Desarrollo de los cambios

### 3.1 Página de Inicio (`/inicio`)

#### 3.1.1 Diagnóstico previo

Una crítica formal de diseño (modo portal oficial) situó Inicio en un nivel bajo: hero ilegible en móvil, muro de 14 tarjetas, CTA naranja de Transparencia y controles que no hacían lo que prometían.

#### 3.1.2 Hero en móvil

- El bloque del hero dejó de superponerse: pasa a un flujo en columna.
- El H1 queda legible.
- **Carreras** y **Licenciamiento** quedan lado a lado.
- EVA, aula virtual y biblioteca quedan debajo.
- En escritorio el escenario usa CSS Grid (`.hero-stage`).
- Se corrigieron enlaces anidados (`<a>` dentro de `<a>`).
- Se eliminó `toggleLicencia`: en móvil, Licenciamiento navega a `/licenciamiento`.

**Archivos:** `frontend/src/app/pages/inicio/inicio.html`, `inicio.css`, `inicio.ts`.

#### 3.1.3 Tarjetas de gestión

Las 14 tarjetas **no se borraron**. Se agruparon por tarea del usuario:

- Postulantes (4 tarjetas).
- Servicios académicos (lista).
- Gestión y normativa (lista).

El objetivo fue reducir el “muro” sin perder accesos.

#### 3.1.4 Encabezado global

- **Admisión:** botón de relleno azul marino, en `.nav-actions`.
- **Transparencia:** botón de contorno (ya no naranja).
- Admisión se quitó del menú de texto; vive en las acciones del header.

**Archivos:** `frontend/src/app/layout/header/header.html`, `header.css`.

---

### 3.2 Transparencia institucional — contenido legal (Art. 42)

#### 3.2.1 Base normativa aplicada

| Norma | Uso en el portal |
|---|---|
| Ley N.° 30512, artículo 42 | Lista de información pública que la EESP debe publicar |
| Ley N.° 27806 | Procedimiento de solicitud de información (10 días hábiles) |
| MINEDU — DIGEDD | Entidad licenciante / ente rector (no SUNEDU) |

#### 3.2.2 Las 9 categorías (rótulos exactos)

1. Datos generales de la institución  
2. Periodo de vigencia del licenciamiento (R.M. de MINEDU)  
3. Estatuto o Reglamento Institucional (RI)  
4. Relación de programas de estudio, horarios y proceso de matrícula  
5. Becas y créditos educativos otorgados en el año en curso  
6. Pensiones, tasas y derechos de pago  
7. Proyectos de investigación y gastos que generan  
8. Documentos de gestión: PEI, PAT, PCI, MPI, Reglamento de Investigación, TUPA  
9. Procedimiento para solicitar información pública (Ley 27806)

#### 3.2.3 Datos estáticos

Se creó `frontend/src/app/pages/transparencia/transparencia.data.ts` con:

- Ficha de datos generales (nombre, entidad licenciante, región, dirección, correo, teléfono).
- Bloque de licenciamiento (MINEDU + instrumento R.M.).
- Canales de solicitud (mesa de partes y correo) y plazo de 10 días hábiles.
- Lista de documentos con `categoria`, `titulo`, `descripcion` y `urlArchivo`.

No hay API: el archivo está preparado para sustituirse después por un servicio HTTP **sin cambiar la forma** de cada documento.

---

### 3.3 Transparencia institucional — rediseño visual

El Art. 42 obliga al **contenido**, no a una lista gris. Se rediseñó la página manteniendo los mismos datos.

#### 3.3.1 Layout

- Ancho de lectura ~1120 px.
- **Índice “En esta página”** a la izquierda en escritorio (sticky).
- En móvil: chips horizontales con desplazamiento.
- Hero alineado a la izquierda, reutilizando el degradé institucional (`.trans-hero` en `styles.css`).
- Fondo de página `#f3f6fb` y tarjetas blancas con borde azul claro.

#### 3.3.2 Bloques de contenido

- **Datos generales:** rejilla de dos columnas (`<dl>`), no un volcado en una sola columna.
- **Licenciamiento:** panel de estado (entidad + instrumento) más fila de documento.
- **Documentos:** lista tipo archivo (icono PDF, título, descripción, pastilla).
- **Ley 27806:** tres pasos numerados (mesa de partes, correo, plazo) más enlace al trámite.
- Búsqueda en vivo por título, descripción o categoría.
- Saltos de sección con `scroll-margin` para no tapar títulos bajo el header. Los ancla usan ruta absoluta `/transparencia#id` porque `<base href="/">` rompe los `href="#..."`.

#### 3.3.3 Lo que se quitó del diseño anterior

- Iconos cuadrados con degradé.
- Banner naranja de “datos de ejemplo / pendientes”.
- Filas no clicables con reloj y etiqueta “Pendiente”.
- Eyebrows / kickers decorativos y bordes laterales gruesos tipo pestaña.

---

### 3.4 Enlaces a PDF y página 404

Pedido del usuario: borrar lo “pendiente”, dejar solo enlaces; si hay archivo, ir al PDF; si no hay, ir a un 404 típico.

#### 3.4.1 Comportamiento actual de cada documento

| Documento | Destino | Motivo |
|---|---|---|
| Reglamento Institucional (RI) | `/reglamentos` | Página que ya muestra PDF del archivo institucional |
| Programas de estudio | `/programas` | Idem |
| Horarios de clases | `/horarios` | Idem |
| Proceso de matrícula | `/admision` | Idem |
| Becas y créditos 2026 | `/becas` | Idem |
| Pensiones, tasas y derechos | `/costos` | Idem |
| Proyectos de investigación | `/repositorio` | Idem |
| TUPA | `/procedimientos` | Idem |
| Solicitud de acceso a la información | `/mesa-de-partes` | Canal de trámite (no es un PDF) |
| Resolución Ministerial de licenciamiento | `/no-encontrado?recurso=...` | No hay PDF publicado |
| PEI | `/no-encontrado?recurso=...` | No hay PDF publicado |
| PAT | `/no-encontrado?recurso=...` | No hay PDF publicado |
| PCI | `/no-encontrado?recurso=...` | No hay PDF publicado |
| MPI | `/no-encontrado?recurso=...` | No hay PDF publicado |
| Reglamento de Investigación | `/no-encontrado?recurso=...` | No hay PDF publicado |

En el repositorio **no hay archivos `.pdf` estáticos**. Las rutas “que sí están” llevan a las páginas públicas que ya cargan PDF desde el API de `academic_papers`. Cuando la dirección entregue PDF propios de Transparencia, basta cambiar `urlArchivo` en `transparencia.data.ts`.

#### 3.4.2 Página 404

Nueva ruta `/no-encontrado` y comodín `**` (cualquier URL pública inexistente).

**Archivos nuevos:**

- `frontend/src/app/pages/no-encontrado/no-encontrado.ts`
- `frontend/src/app/pages/no-encontrado/no-encontrado.html`
- `frontend/src/app/pages/no-encontrado/no-encontrado.css`

Comportamiento del texto:

- Si se llega desde Transparencia (`?recurso=PEI`): “No hay un documento publicado para …”.
- Si se llega por una URL inventada (`/esto-no-existe`): “No existe la página …”.
- Acciones: volver a Transparencia o ir al inicio.

También se eliminó de datos generales el campo “Fecha de creación — Pendiente de consignar”, y de licenciamiento los textos de ejemplo “R.M. N.° — /MINEDU (pendiente…)”.

---

### 3.5 Política de privacidad y pie de página

#### 3.5.1 `/privacidad`

Página placeholder según la Ley N.° 29733 (protección de datos personales). Explica que falta el texto oficial y enlaza a mesa de partes y transparencia.

**Archivos nuevos:** `frontend/src/app/pages/privacidad/{privacidad.ts,privacidad.html,privacidad.css}`.

#### 3.5.2 Footer

En “Atención al Alumno” se añadieron:

- Libro de reclamaciones (`/reclamaciones`)
- Política de privacidad (`/privacidad`)
- Transparencia institucional (`/transparencia`)

**Archivos:** `frontend/src/app/layout/footer/footer.html` (y CSS menor).

**Nota:** el copyright sigue diciendo “Instituto Superior Académico”. No se corrigió en esta sesión (queda documentado como pendiente).

---

### 3.6 Identidad normativa: quitar SUNEDU del frontend

En comentarios CSS de varias páginas públicas se reemplazó `SUNEDU` por `MINEDU`. El texto visible del sitio no usaba SUNEDU.

Páginas/archivos tocados (comentarios): header, footer, inicio, nosotros, admisión, programas, mesa de partes, chatbot, y otros CSS de páginas institucionales.

**No se tocó** `backend/helpers/chatbot.helper.js` (sigue el patrón `'sunedu'`). Eso quedó escrito en `TAREAS-PENDIENTES.md`.

---

### 3.7 Enrutamiento y estilos globales

#### 3.7.1 Rutas nuevas (`app.routes.ts`)

| Ruta | Componente | Título |
|---|---|---|
| `/transparencia` | `Transparencia` | Transparencia institucional |
| `/privacidad` | `Privacidad` | Política de privacidad |
| `/no-encontrado` | `NoEncontrado` | No se encontró lo que buscas |
| `**` (cualquier ruta pública desconocida) | `NoEncontrado` | No se encontró lo que buscas |

#### 3.7.2 `app.config.ts`

Se habilitó `anchorScrolling: 'enabled'` junto al scroll in-memory ya existente, para anclas internas.

#### 3.7.3 `styles.css`

Se unificó el hero institucional (`.trans-hero`) con el mismo degradé y overlay que otras páginas públicas, para que Transparencia, Privacidad y 404 compartan cabecera visual.

---

### 3.8 Inventario de archivos

#### 3.8.1 Archivos nuevos

| Ruta | Función |
|---|---|
| `frontend/src/app/pages/transparencia/transparencia.data.ts` | Datos Art. 42 (estáticos) |
| `frontend/src/app/pages/privacidad/*` | Política de privacidad (placeholder) |
| `frontend/src/app/pages/no-encontrado/*` | Error 404 |
| `TAREAS-PENDIENTES.md` | Lista de lo que falta para dejar de ser mock |

#### 3.8.2 Archivos modificados (núcleo de esta sesión)

| Ruta | Qué cambió |
|---|---|
| `inicio.html` / `inicio.css` / `inicio.ts` | Hero móvil, grupos de tarjetas, sin `toggleLicencia` |
| `header.html` / `header.css` | Admisión fill, Transparencia outline |
| `transparencia.html` / `transparencia.css` / `transparencia.ts` | Portal Art. 42, rediseño, solo enlaces |
| `footer.html` / `footer.css` | Enlaces legales |
| `app.routes.ts` | Privacidad, 404, comodín |
| `app.config.ts` | Anchor scrolling |
| `styles.css` | Hero institucional compartido |
| Varios `*.css` de páginas públicas | Comentarios SUNEDU → MINEDU |

#### 3.8.3 Otros archivos sucios en el working tree

Al inicio de la sesión el `git status` ya mostraba cambios en Nosotros, Noticias, Servicios y CSS de páginas hermanas. Este informe describe **el trabajo de esta conversación**; esos otros diffs pueden incluir trabajo previo no comprometido. No se hizo commit.

---

## 4. Resultados, verificación y pendientes

### 4.1 Resultado funcional

El portal público ahora tiene:

1. Un Inicio más usable en móvil y con accesos agrupados, sin perder las 14 entradas.
2. Un encabezado con jerarquía clara: Admisión (acción) y Transparencia (secundaria, no naranja).
3. Una sección de Transparencia que **cumple el listado del Art. 42** y explica el acceso por Ley 27806.
4. Un diseño de Transparencia tipo gaceta (índice + fichas + lista de archivos), no un volcado gris.
5. Todos los documentos como **enlace**: PDF/página existente o 404.
6. Política de privacidad enlazada desde el footer.
7. Frontend sin “SUNEDU” en código de producto.

### 4.2 Verificación realizada en el navegador

Se comprobó en `http://localhost:4200/` (escritorio ~1440 px y móvil ~390 px):

| Prueba | Resultado |
|---|---|
| `/transparencia` carga con índice y 9 bloques | Correcto |
| Búsqueda “PEI” filtra documentos de gestión | Correcto |
| Clic en TUPA | Abre `/procedimientos` |
| Clic en Reglamento Institucional | Abre `/reglamentos` (visor de PDF) |
| Clic en PEI | Abre `/no-encontrado?recurso=Proyecto Educativo Institucional (PEI)` |
| Clic en mesa de partes (pasos Ley 27806) | Abre `/mesa-de-partes` |
| `/privacidad` | Placeholder Ley 29733 |
| `/esto-no-existe` | 404 genérico |
| Chips de índice en móvil | Permanecen en `/transparencia#...` (no saltan a Inicio) |
| Compilación `ng build --configuration=development` | Correcto |

### 4.3 Limitaciones conocidas

1. Los “PDF que sí existen” son las **páginas** `/reglamentos`, `/costos`, etc., que pintan PDF del API. No hay PDF sueltos en `frontend/public`.
2. PEI, PAT, PCI, MPI, R.M. y Reglamento de Investigación **aún no tienen archivo**: el 404 es el comportamiento pedido, no un documento oficial.
3. `/privacidad` no es el texto jurídico aprobado.
4. El pie puede mostrar Lima y “Instituto Superior Académico” si falla el API o en el copyright.
5. El chatbot del backend todavía puede reconocer la palabra “sunedu”.

### 4.4 Trabajo que queda (dirección / backend)

Detalle en `TAREAS-PENDIENTES.md`. Resumen:

- Entregar PDF oficiales y fecha de creación institucional.
- API `GET /api/transparencia` + admin de carga de archivos.
- Sustituir `transparencia.data.ts` por HTTP cuando exista el servicio.
- Aprobar política de privacidad.
- Quitar `sunedu` del helper del chatbot (backend).

### 4.5 Conclusión

Se puede **diseñar** Transparencia e Inicio sin dejar de cumplir lo que la norma pide publicar. En esta sesión se corrigió Inicio (móvil, agrupación, header), se implementó el portal del Art. 42, se mejoró su presentación, y se dejó un modelo simple para el usuario: **si el documento está, el enlace lo abre; si no está, ve un 404**. El contenido legal no se recortó; lo que faltaba de archivo dejó de fingirse como “pendiente publicado” y pasó a ser un enlace explícito a “no encontrado”.

---

**Elaborado para:** seguimiento de prácticas — I.E.S.P.P. Virgen del Carmen  
**Stack:** Angular 21, frontend público, sin cambios de backend  
**Estado del código:** cambios locales sin commit (salvo que se solicite después)
