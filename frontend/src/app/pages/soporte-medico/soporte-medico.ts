import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Imagen {
  src: string;
  alt: string;
}

interface Parrafo {
  texto: string;
  esTitulo: boolean;
}

interface YearDataSM {
  presentacionImg: string;
  descripcion: Parrafo[];
  campanasImagenes: Imagen[];
  talleresImagenes: Imagen[];
}

@Component({
  selector: 'app-soporte-medico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './soporte-medico.html',
  styleUrl: './soporte-medico.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoporteMedico {
  selectedYear = 2024;

  readonly years = [2026, 2025, 2024, 2023, 2022, 2021];

  private readonly dataByYear: Record<number, YearDataSM> = {
    2021: { presentacionImg: '', descripcion: [], campanasImagenes: [], talleresImagenes: [] },
    2022: { presentacionImg: '', descripcion: [], campanasImagenes: [], talleresImagenes: [] },
    2023: { presentacionImg: '', descripcion: [], campanasImagenes: [], talleresImagenes: [] },
    2024: {
      presentacionImg: 'images/img1-SM.jpeg',
      descripcion: [
        { texto: 'La unidad de Soporte Medico de nuestra institución', esTitulo: true },
        {
          texto:
            'Están a cargo de un profesional de la salud que lideran y realizan el nexo entre ' +
            'el sistema de salud y de educación.',
          esTitulo: false,
        },
        {
          texto:
            'Su formación posee las competencias necesarias para brindar cuidados a lo largo ' +
            'de todo el curso de vida, permitiéndoles resolver la mayor parte de los problemas ' +
            'de salud que presenten los estudiantes en el colegio, desde la etapa preescolar, ' +
            'escolar y adolescente, pudiendo también incluir la atención de la comunidad escolar.',
          esTitulo: false,
        },
        { texto: 'Su Rol', esTitulo: true },
        {
          texto:
            'Velar por el bienestar físico, psíquico y social de los estudiantes y de la ' +
            'comunidad educativa del IESPP VC, a través de la asistencia en situaciones de ' +
            'urgencia, seguimiento de salud, propendiendo a fortalecer conductas de autocuidado ' +
            'y hábitos saludables mediante acciones educativas orientadas a la promoción y ' +
            'prevención e investigación en salud.',
          esTitulo: false,
        },
      ],
      campanasImagenes: [
        { src: 'images/img2-SM.jpeg', alt: 'Campaña de salud 1' },
        { src: 'images/img3-SM.jpeg', alt: 'Campaña de salud 2' },
        { src: 'images/img4-SM.jpeg', alt: 'Campaña de salud 3' },
        { src: 'images/img5-SM.jpeg', alt: 'Campaña de salud 4' },
      ],
      talleresImagenes: [
        { src: 'images/img6-SM.jpeg', alt: 'Taller de salud 1' },
        { src: 'images/img7-SM.jpeg', alt: 'Taller de salud 2' },
      ],
    },
    2025: { presentacionImg: '', descripcion: [], campanasImagenes: [], talleresImagenes: [] },
    2026: { presentacionImg: '', descripcion: [], campanasImagenes: [], talleresImagenes: [] },
  };

  get currentData(): YearDataSM {
    return this.dataByYear[this.selectedYear];
  }

  get hasContent(): boolean {
    const d = this.currentData;
    return d.descripcion.length > 0 || d.campanasImagenes.length > 0 || d.talleresImagenes.length > 0;
  }

  selectYear(year: number): void {
    this.selectedYear = year;
  }
}
