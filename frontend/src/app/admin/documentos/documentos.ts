import { Component, OnInit, Type, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { A11yModule } from '@angular/cdk/a11y';
import { environment } from '../../../environments/environment';
import { ToastService } from '../compartido/toast';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [FormsModule, QuillModule, A11yModule],
  templateUrl: './documentos.html',
  styleUrl: './documentos.css',
})
export class AdminDocumentos implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private API = `${environment.apiUrl}/academic_papers`;
  private BASE = environment.baseUrl;

  investigaciones = signal<any[]>([]);

  showModal = signal(false);
  isEditMode = signal(false);

  selectedFile: File | null = null;

  formData: any = {
    id: null,
    type: 'Programas',
    title: '',
    year: '',
    description: '',
    pdf_url: ''
  };

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
            pdf_url: i.pdf_url
              ? this.sanitizer.bypassSecurityTrustResourceUrl(`${this.BASE}${i.pdf_url}`)
              : null,
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
    this.selectedFile = file;
    this.formData.pdf_url = this.sanitizer.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(file)
    );
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(i: any) {
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
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  resetForm() {
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

  save() {
    if (this.isEditMode()) {
      this.update();
    } else {
      this.create();
    }
  }

  create() {
    const fd = new FormData();
    Object.keys(this.formData).forEach(key => {
      if (key !== 'pdf_url') fd.append(key, this.formData[key] || '');
    });
    if (this.selectedFile) fd.append('file', this.selectedFile);
    this.http.post(`${this.API}/create`, fd).subscribe({
      next: () => { this.toast.success('Documento creado correctamente.'); this.loadData(); this.closeModal(); },
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
      next: () => { this.toast.success('Documento actualizado correctamente.'); this.loadData(); this.closeModal(); },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  delete(id: number) {
    if (!confirm('¿Desactivar documento?')) return;
    this.http.delete(`${this.API}/delete/${id}`).subscribe({
      next: () => this.loadData(),
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  editorTheme = signal<'dark' | 'light'>('light');

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  pdfViewer = signal<SafeResourceUrl | null>(null);

  openPdfViewer(event: Event, url: SafeResourceUrl) {
    event.stopPropagation();
    this.pdfViewer.set(url);
  }

  closePdfViewer() {
    this.pdfViewer.set(null);
  }

  toggleEditorTheme() {
    this.editorTheme.set(this.editorTheme() === 'dark' ? 'light' : 'dark');
  }

  deleteModal = signal(false);
  deleteTargetId = signal<number | null>(null);
  tooltipVisible = signal(false);

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

  showTooltip() {
    this.tooltipVisible.set(true);

    setTimeout(() => {
      this.tooltipVisible.set(false);
    }, 3000);
  }
}