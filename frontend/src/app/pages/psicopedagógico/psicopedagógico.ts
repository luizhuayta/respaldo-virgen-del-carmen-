import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Taller {
  numero: number;
  titulo: string;
  descripcion: string;
  imagen: string;
}

interface Campana {
  numero: number;
  titulo: string;
  descripcion: string;
  imagenes: string[];
  activeIndex: number;
}

interface ReporteInfo {
  titulo: string;
  url: string;
}

interface YearData {
  presentacion: string;
  talleres: Taller[];
  campanas: Campana[];
  reporte: ReporteInfo | null;
}

@Component({
  selector: 'app-psicopedagogico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './psicopedagógico.html',
  styleUrl: './psicopedagógico.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Psicopedagogico {
  activeTab: 'presentacion' | 'talleres' | 'campanas' | 'reporte' = 'presentacion';
  selectedYear = 2024;

  readonly years = [2026, 2025, 2024, 2023, 2022, 2021];

  private sanitizer = inject(DomSanitizer);

  private readonly dataByYear: Record<number, YearData> = {
    2021: { presentacion: '', talleres: [], campanas: [], reporte: null },
    2022: { presentacion: '', talleres: [], campanas: [], reporte: null },
    2023: { presentacion: '', talleres: [], campanas: [], reporte: null },
    2024: {
      presentacion:
        'El área de Soporte Psicopedagógico del Instituto de Educación Superior Pedagógico Público ' +
        'Virgen del Carmen se dedica a brindar apoyo integral a los estudiantes, enfocándose en su ' +
        'desarrollo personal, académico y emocional. Este equipo multidisciplinario trabaja para ' +
        'identificar y atender las necesidades psicológicas y educativas de los estudiantes, ' +
        'proporcionando orientación, asesoramiento y herramientas para mejorar su bienestar general ' +
        'y su rendimiento académico. Además, se encarga de realizar intervenciones preventivas y ' +
        'correctivas, talleres formativos, y ofrecer un acompañamiento continuo para asegurar un ' +
        'entorno educativo saludable y propicio para el aprendizaje.',
      talleres: [
        {
          numero: 1,
          titulo: 'Taller de comunicación asertiva',
          descripcion:
            'con el objetivo de desarrollar habilidades y técnicas que permitan a los participantes, ' +
            'donde se logró mejorar la capacidad para comunicar pensamientos y sentimientos de manera ' +
            'honesta y directa.',
          imagen: 'images/img1-psicope.jpeg',
        },
        {
          numero: 2,
          titulo: 'Taller de Trata de Personas',
          descripcion:
            'objetivo de prevenir y concientizar a la población estudiantil en temas de trata de ' +
            'personas, con este taller se logró concientizar y sensibilizar a los estudiantes, aumentar ' +
            'el conocimiento y la comprensión de la trata de personas, sus formas de operar y sus ' +
            'consecuencias tanto para las víctimas como para la sociedad en general.',
          imagen: 'images/img2-psicope.jpeg',
        },
        {
          numero: 3,
          titulo: 'Taller de Violencia de Género',
          descripcion:
            'objetivo comprender las violencias basadas en género a partir del reconocimiento de sus ' +
            'elementos, mitos de la violencia y la identificación de acciones para su prevención. Se ' +
            'logró tomar conciencia de la violencia de género en la desigualdad social que existe entre ' +
            'mujeres y hombres.',
          imagen: 'images/img3-psicope.jpeg',
        },
      ],
      campanas: [
        {
          numero: 1,
          titulo: 'Campaña 101% buen ciudadano',
          descripcion:
            'Promover, fortalecer y revalorar la importancia del civismo, la ética de la ciudadanía, ' +
            'los derechos humanos y la convivencia en democracia. Sensibilizar a la comunidad educativa ' +
            'en la importancia de ser un buen ciudadano, logrando el respeto y buen trato a sus pares, ' +
            'así como a la población en general.',
          imagenes: [
            'images/img4-psicope.jpeg',
            'images/img5-psicope.jpeg',
            'images/img6-psicope.jpeg',
            'images/img7-psicope.jpeg',
          ],
          activeIndex: 0,
        },
      ],
      reporte: {
        titulo: 'Reporte de Atenciones de Mayo – Agosto del 2024',
        url: 'images/psicopedagogico.pdf',
      },
    },
    2025: { presentacion: '', talleres: [], campanas: [], reporte: null },
    2026: { presentacion: '', talleres: [], campanas: [], reporte: null },
  };

  get currentData(): YearData {
    return this.dataByYear[this.selectedYear];
  }

  selectYear(year: number): void {
    this.selectedYear = year;
    this.activeTab = 'presentacion';
  }

  setTab(tab: 'presentacion' | 'talleres' | 'campanas' | 'reporte'): void {
    this.activeTab = tab;
  }

  safeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  nextSlide(campana: Campana): void {
    campana.activeIndex = (campana.activeIndex + 1) % campana.imagenes.length;
  }

  prevSlide(campana: Campana): void {
    campana.activeIndex =
      (campana.activeIndex - 1 + campana.imagenes.length) % campana.imagenes.length;
  }

  goToSlide(campana: Campana, index: number): void {
    campana.activeIndex = index;
  }
}
