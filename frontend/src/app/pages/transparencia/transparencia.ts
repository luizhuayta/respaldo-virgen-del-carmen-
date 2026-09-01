import { Component, computed, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  CATEGORIAS_ART_42,
  DATOS_GENERALES,
  DOCUMENTOS_TRANSPARENCIA,
  LICENCIAMIENTO,
  RUTA_NO_ENCONTRADO,
  SOLICITUD_INFORMACION,
  type DocumentoTransparencia,
} from './transparencia.data';

@Component({
  selector: 'app-transparencia',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './transparencia.html',
  styleUrl: './transparencia.css',
})
export class Transparencia {
  query = signal('');

  readonly datosGenerales = DATOS_GENERALES;
  readonly licenciamiento = LICENCIAMIENTO;
  readonly solicitud = SOLICITUD_INFORMACION;
  readonly documentos: DocumentoTransparencia[] = DOCUMENTOS_TRANSPARENCIA;

  gruposVisibles = computed(() => {
    const q = this.query().trim().toLowerCase();
    const omitidas = new Set([
      'Datos generales de la institución',
      'Periodo de vigencia del licenciamiento (R.M. de MINEDU)',
      'Procedimiento para solicitar información pública (Ley 27806)',
    ]);
    return CATEGORIAS_ART_42.filter(categoria => !omitidas.has(categoria))
      .map(categoria => ({
        id: this.idCategoria(categoria),
        categoria,
        etiqueta: this.etiquetaIndice(categoria),
        items: this.documentos.filter(doc => {
          if (doc.categoria !== categoria) return false;
          if (!q) return true;
          return (
            doc.titulo.toLowerCase().includes(q) ||
            doc.descripcion.toLowerCase().includes(q) ||
            doc.categoria.toLowerCase().includes(q)
          );
        }),
      }))
      .filter(grupo => grupo.items.length > 0);
  });

  indice = computed(() => {
    const grupos = this.gruposVisibles().map(grupo => ({
      id: grupo.id,
      label: grupo.etiqueta,
    }));
    const items: { id: string; label: string }[] = [];
    if (this.mostrarDatosGenerales()) {
      items.push({ id: 'datos-generales', label: 'Datos generales' });
    }
    if (this.mostrarLicenciamiento()) {
      items.push({ id: 'licenciamiento', label: 'Licenciamiento' });
    }
    items.push(...grupos);
    if (this.mostrarSolicitud()) {
      items.push({ id: 'solicitud', label: 'Solicitud de información' });
    }
    return items;
  });

  docsLicenciamiento = DOCUMENTOS_TRANSPARENCIA.filter(
    doc => doc.categoria === 'Periodo de vigencia del licenciamiento (R.M. de MINEDU)',
  );

  docsSolicitud = DOCUMENTOS_TRANSPARENCIA.filter(
    doc => doc.categoria === 'Procedimiento para solicitar información pública (Ley 27806)',
  );

  bloqueVisible(...textos: string[]): boolean {
    const q = this.query().trim().toLowerCase();
    if (!q) return true;
    return textos.some(texto => texto.toLowerCase().includes(q));
  }

  mostrarDatosGenerales(): boolean {
    return this.bloqueVisible(
      'datos generales',
      ...this.datosGenerales.flatMap(dato => [dato.etiqueta, dato.valor]),
    );
  }

  mostrarLicenciamiento(): boolean {
    return this.bloqueVisible(
      'licenciamiento',
      'minedu',
      this.licenciamiento.entidad,
      this.licenciamiento.instrumento,
      ...this.docsLicenciamiento.flatMap(doc => [doc.titulo, doc.descripcion]),
    );
  }

  mostrarSolicitud(): boolean {
    return this.bloqueVisible(
      'información pública',
      '27806',
      'mesa de partes',
      this.solicitud.norma,
      this.solicitud.plazo,
      ...this.docsSolicitud.flatMap(doc => [doc.titulo, doc.descripcion]),
    );
  }

  sinResultados(): boolean {
    return (
      this.query().trim().length > 0 &&
      !this.mostrarDatosGenerales() &&
      !this.mostrarLicenciamiento() &&
      !this.mostrarSolicitud() &&
      this.gruposVisibles().length === 0
    );
  }

  onSearch(value: string): void {
    this.query.set(value);
  }

  irASeccion(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `/transparencia#${id}`);
  }

  esPdfExterno(url: string): boolean {
    return url.endsWith('.pdf') || url.startsWith('http://') || url.startsWith('https://');
  }

  paramsDoc(item: DocumentoTransparencia): Record<string, string> | undefined {
    return item.urlArchivo === RUTA_NO_ENCONTRADO ? { recurso: item.titulo } : undefined;
  }

  etiquetaEnlace(item: DocumentoTransparencia): string {
    if (item.urlArchivo === RUTA_NO_ENCONTRADO) return 'PDF';
    if (item.urlArchivo === '/mesa-de-partes') return 'Ir';
    return 'PDF';
  }

  idCategoria(categoria: string): string {
    const mapa: Record<string, string> = {
      'Estatuto o Reglamento Institucional (RI)': 'reglamento',
      'Relación de programas de estudio, horarios y proceso de matrícula': 'programas',
      'Becas y créditos educativos otorgados en el año en curso': 'becas',
      'Pensiones, tasas y derechos de pago': 'pensiones',
      'Proyectos de investigación y gastos que generan': 'investigacion',
      'Documentos de gestión: PEI, PAT, PCI, MPI, Reglamento de Investigación, TUPA': 'gestion',
    };
    return mapa[categoria] ?? 'seccion';
  }

  etiquetaIndice(categoria: string): string {
    const mapa: Record<string, string> = {
      'Estatuto o Reglamento Institucional (RI)': 'Reglamento institucional',
      'Relación de programas de estudio, horarios y proceso de matrícula': 'Programas y matrícula',
      'Becas y créditos educativos otorgados en el año en curso': 'Becas y créditos',
      'Pensiones, tasas y derechos de pago': 'Pensiones y tasas',
      'Proyectos de investigación y gastos que generan': 'Investigación',
      'Documentos de gestión: PEI, PAT, PCI, MPI, Reglamento de Investigación, TUPA': 'Documentos de gestión',
    };
    return mapa[categoria] ?? categoria;
  }
}
