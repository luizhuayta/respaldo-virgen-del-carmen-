import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { environment } from '../../../environments/environment';
import { ToastService } from '../compartido/toast';
import { AvisoCambios } from '../compartido/aviso-cambios';
import { LectorPdf } from '../../components/lector-pdf/lector-pdf';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [FormsModule, A11yModule, AvisoCambios, LectorPdf],
  templateUrl: './documentos.html',
  styleUrl: './documentos.css',
})
export class AdminDocumentos implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private API = `${environment.apiUrl}/academic_papers`;
  private BASE = environment.baseUrl;

  investigaciones = signal<any[]>([]);

  showModal = signal(false);
  isEditMode = signal(false);

  selectedFile: File | null = null;
  private previewObjectUrl: string | null = null;

  formData: any = {
    id: null,
    type: 'Programas',
    title: '',
    year: '',
    description: '',
    pdf_url: ''
  };

  snapshot = '';
  mostrarErrores = signal(false);
  showAviso = signal(false);

  // ===== SECCIONES DESPLEGABLES =====
  readonly sectionTypes = [
    'Admisión', 'Becas y Créditos', 'Costos', 'Estadísticas', 'Horarios',
    'Reglamentos', 'Inversiones', 'Procedimientos', 'Programas'
  ];

  openSections = signal<Record<string, boolean>>({});

  toggleSection(type: string) {
    this.openSections.update(prev => ({ ...prev, [type]: !prev[type] }));
  }

  isSectionOpen(type: string): boolean {
    return !!this.openSections()[type];
  }

  groupedDocs = computed(() => {
    const all = this.investigaciones();
    const result: Record<string, any[]> = {};
    for (const type of this.sectionTypes) {
      result[type] = all.filter(i => i.type === type);
    }
    return result;
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<any[]>(`${this.API}/list`).subscribe({
      next: (data) => {
        this.investigaciones.set(
          data.map(i => ({
            id: i.id,
            title: i.title,
            type: i.type,
            year: i.year,
            description: i.description,
            pdf_url: i.pdf_url ? `${this.BASE}${i.pdf_url}` : null,
            status: i.status,
            fecha: i.updatedAt
          }))
        );
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.revokePreview();
    this.selectedFile = file;
    this.previewObjectUrl = URL.createObjectURL(file);
    this.formData.pdf_url = this.previewObjectUrl;
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.resetForm();
    this.snapshot = JSON.stringify({ ...this.formData, pdf_url: '' });
    this.mostrarErrores.set(false);
    this.showModal.set(true);
  }

  openEditModal(i: any) {
    this.revokePreview();
    this.isEditMode.set(true);
    this.formData = {
      id: i.id,
      title: i.title,
      type: i.type,
      year: i.year,
      description: i.description,
      pdf_url: i.pdf_url
    };
    this.selectedFile = null;
    this.snapshot = JSON.stringify({ ...this.formData, pdf_url: '' });
    this.mostrarErrores.set(false);
    this.showModal.set(true);
  }

  closeModal() {
    const actual = JSON.stringify({ ...this.formData, pdf_url: '' });
    if (actual !== this.snapshot || this.selectedFile) {
      this.showAviso.set(true);
      return;
    }
    this.cerrarModal();
  }

  cerrarModal() {
    this.revokePreview();
    this.showAviso.set(false);
    this.showModal.set(false);
    this.mostrarErrores.set(false);
  }

  onAvisoGuardar() {
    this.showAviso.set(false);
    this.save();
  }

  onAvisoDescartar() {
    this.cerrarModal();
  }

  onAvisoSeguir() {
    this.showAviso.set(false);
  }

  resetForm() {
    this.revokePreview();
    this.formData = {
      id: null,
      title: '',
      type: '',
      year: '',
      description: '',
      pdf_url: ''
    };
    this.selectedFile = null;
  }

  camposFaltantes(): string[] {
    const f: string[] = [];
    if (!this.formData.title?.trim()) f.push('Título');
    if (!this.formData.description?.trim()) f.push('Descripción');
    return f;
  }

  save() {
    const faltan = this.camposFaltantes();
    if (faltan.length) {
      this.mostrarErrores.set(true);
      this.toast.error(`Faltan campos obligatorios: ${faltan.join(', ')}`);
      return;
    }
    this.isEditMode() ? this.update() : this.create();
  }

  create() {
    const fd = new FormData();
    Object.keys(this.formData).forEach(key => {
      if (key !== 'pdf_url') fd.append(key, this.formData[key] || '');
    });
    if (this.selectedFile) fd.append('file', this.selectedFile);
    this.http.post(`${this.API}/create`, fd).subscribe({
      next: () => { this.toast.success('Documento creado correctamente.'); this.loadData(); this.cerrarModal(); },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  update() {
    const fd = new FormData();
    Object.keys(this.formData).forEach(key => {
      if (key !== 'pdf_url') fd.append(key, this.formData[key] || '');
    });
    if (this.selectedFile) fd.append('file', this.selectedFile);
    this.http.put(`${this.API}/update/${this.formData.id}`, fd).subscribe({
      next: () => { this.toast.success('Documento actualizado correctamente.'); this.loadData(); this.cerrarModal(); },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  pdfViewer = signal<string | null>(null);

  openPdfViewer(event: Event, url: string) {
    event.stopPropagation();
    this.pdfViewer.set(url);
  }

  closePdfViewer() {
    this.pdfViewer.set(null);
  }

  private revokePreview() {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
  }

  deleteModal = signal(false);
  deleteTargetId = signal<number | null>(null);

  openDeleteModal(id: number) {
    this.deleteTargetId.set(id);
    this.deleteModal.set(true);
  }

  deleteAction(del: '0' | '1') {
    const id = this.deleteTargetId();

    if (!id) return;

    this.http.delete(`${this.API}/delete/${id}/${del}`).subscribe({
      next: () => {
        this.toast.success('Acción realizada correctamente.');
        this.loadData();
        this.closeDeleteModal();
      },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  closeDeleteModal() {
    this.deleteModal.set(false);
    this.deleteTargetId.set(null);
  }
}