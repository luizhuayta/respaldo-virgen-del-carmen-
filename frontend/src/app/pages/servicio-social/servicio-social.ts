import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Imagen {
  src: string;
  alt: string;
}

interface YearDataSS {
  intro: string;
  funciones: string[];
  ambitoImagenes: Imagen[];
  talleresImagenes: Imagen[];
}

@Component({
  selector: 'app-servicio-social',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicio-social.html',
  styleUrl: './servicio-social.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicioSocial {
  selectedYear = 2024;

  readonly years = [2026, 2025, 2024, 2023, 2022, 2021];

  private readonly dataByYear: Record<number, YearDataSS> = {
    2021: { intro: '', funciones: [], ambitoImagenes: [], talleresImagenes: [] },
    2022: { intro: '', funciones: [], ambitoImagenes: [], talleresImagenes: [] },
    2023: { intro: '', funciones: [], ambitoImagenes: [], talleresImagenes: [] },
    2024: {
      intro:
        'El área de servicio social brinda atención directa y personalizada, orientada a mejorar el ' +
        'bienestar personal, familiar, social y de salud de los estudiantes, docentes y ' +
        'administrativos, así como organizar, dirigir y ejecutar actividades relacionadas con el ' +
        'bienestar de la comunidad educativa y propiciar condiciones en el ambiente de trabajo que ' +
        'favorezcan el desarrollo de la creatividad, la identidad, la integración, la motivación ' +
        'y la participación.',
      funciones: [
        'Atención de casos sociales.',
        'Orientación y asistencia a estudiantes que se encuentren en una situación problemática.',
        'Apoyo en la ejecución de campañas preventivas de índole social.',
        'Prevención de casos de riesgos.',
        'Seguimientos de casos sociales.',
        'Visitas domiciliarias.',
        'Evaluación de condición socioeconómica, entre otros.',
      ],
      ambitoImagenes: [
        { src: 'images/img1-SS.png', alt: 'Ámbito Académico' },
        { src: 'images/img2-SS.png', alt: 'Ámbito Social' },
        { src: 'images/img3-SS.png', alt: 'Ámbito Familiar' },
      ],
      talleresImagenes: [
        { src: 'images/img4-SS.jpeg', alt: 'Taller 1' },
        { src: 'images/img5-SS.jpeg', alt: 'Taller 2' },
        { src: 'images/img7-SS.jpeg', alt: 'Taller 3' },
        { src: 'images/img6-SS.jpeg', alt: 'Taller 4' },
      ],
    },
    2025: { intro: '', funciones: [], ambitoImagenes: [], talleresImagenes: [] },
    2026: { intro: '', funciones: [], ambitoImagenes: [], talleresImagenes: [] },
  };

  get currentData(): YearDataSS {
    return this.dataByYear[this.selectedYear];
  }

  get hasContent(): boolean {
    const d = this.currentData;
    return d.intro !== '' || d.funciones.length > 0;
  }

  selectYear(year: number): void {
    this.selectedYear = year;
  }
}
