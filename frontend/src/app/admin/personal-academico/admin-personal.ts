import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { A11yModule } from '@angular/cdk/a11y';
import { environment } from '../../../environments/environment';
import { ToastService } from '../compartido/toast';
import { SelectorImagen } from '../compartido/selector-imagen';
import { AvisoCambios } from '../compartido/aviso-cambios';

@Component({
  selector: 'app-admin-personal',
  standalone: true,
  imports: [FormsModule, A11yModule, SelectorImagen, AvisoCambios],
  templateUrl: './admin-personal.html',
  styleUrl: './admin-personal.css',
})
export class AdminPersonal implements OnInit, OnDestroy {

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private toast = inject(ToastService);

  apiUrl = `${environment.apiUrl}/academic_personal`;
  apiBase = environment.baseUrl;

  personal = signal<any[]>([]);

  readonly sectionTypes = ['Autoridad', 'Docente', 'Administrativo', 'Complementario'];
  openSections = signal<Record<string, boolean>>({});

  toggleSection(type: string) {
    this.openSections.update(prev => ({ ...prev, [type]: !prev[type] }));
  }

  isSectionOpen(type: string): boolean {
    return !!this.openSections()[type];
  }

  groupedPersonal = computed(() => {
    const all = this.personal();
    const result: Record<string, any[]> = {};
    for (const type of this.sectionTypes) {
      result[type] = all.filter(p => p.type === type);
    }
    return result;
  });

  showModal = signal(false);
  isEditMode = signal(false);

  selectedPdfFile = signal<File | null>(null);
  selectedPdfName = signal<string>('');
  pdfPreviewUrl = signal<SafeResourceUrl | null>(null);
  pdfViewerUrl = signal<SafeResourceUrl | null>(null);

  formData: any = {
    id: null,
    type: 'Autoridad',
    names: '',
    last_names: '',
    institucional_email: '',
    position: '',
    area: '',
    grade: '',
    year: '',
    img_url: '',
    pdf_url: '',
    description: ''
  };

  snapshot = '';
  mostrarErrores = signal(false);
  showAviso = signal(false);
  private pdfObjectUrl: string | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.http.get<any[]>(`${this.apiUrl}/list`).subscribe({
      next: (data) => {
        this.personal.set(
          data.map(item => ({
            id: item.id,
            names: item.names,
            last_names: item.last_names,
            full_name: `${item.names} ${item.last_names}`,
            institucional_email: item.institucional_email ?? '',
            type: item.type,
            position: item.position,
            area: item.area ?? '',
            grade: item.grade,
            year: item.year,
            img_url: item.img_url,
            pdf_url: item.pdf_url ?? '',
            status: item.status,
            fecha: item.updatedAt
          }))
        );
      }
    });
  }

  // PDF upload handlers
  onPdfSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) this.setPdf(input.files[0]);
  }

  onPdfDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type === 'application/pdf') this.setPdf(file);
  }

  setPdf(file: File) {
    this.revokePdfUrl();
    this.selectedPdfFile.set(file);
    this.selectedPdfName.set(file.name);
    this.pdfObjectUrl = URL.createObjectURL(file);
    this.pdfPreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfObjectUrl));
  }

  removePdf(event: Event) {
    event.stopPropagation();
    this.revokePdfUrl();
    this.selectedPdfFile.set(null);
    this.selectedPdfName.set('');
    this.pdfPreviewUrl.set(null);
  }

  private revokePdfUrl() {
    if (this.pdfObjectUrl) {
      URL.revokeObjectURL(this.pdfObjectUrl);
      this.pdfObjectUrl = null;
    }
  }

  ngOnDestroy() {
    this.revokePdfUrl();
  }

  // PDF viewer
  openPdfViewer(url: string) {
    this.pdfViewerUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  closePdfViewer() {
    this.pdfViewerUrl.set(null);
  }

  // Modal
  openCreateModal() {
    this.isEditMode.set(false);
    this.resetForm();
    this.snapshot = JSON.stringify(this.formData);
    this.mostrarErrores.set(false);
    this.showModal.set(true);
  }

  openEditModal(p: any) {
    this.isEditMode.set(true);
    this.formData = {
      id: p.id,
      type: p.type,
      names: p.names,
      last_names: p.last_names,
      institucional_email: p.institucional_email,
      position: p.position,
      area: p.area,
      grade: p.grade,
      year: p.year,
      img_url: p.img_url,
      pdf_url: p.pdf_url,
      description: ''
    };
    this.selectedPdfFile.set(null);
    this.selectedPdfName.set('');
    this.pdfPreviewUrl.set(null);
    this.snapshot = JSON.stringify(this.formData);
    this.mostrarErrores.set(false);
    this.showModal.set(true);
  }

  closeModal() {
    if (JSON.stringify(this.formData) !== this.snapshot || this.selectedPdfFile()) {
      this.showAviso.set(true);
      return;
    }
    this.cerrarModal();
  }

  cerrarModal() {
    this.showAviso.set(false);
    this.showModal.set(false);
    this.mostrarErrores.set(false);
    this.removePdf(new Event(''));
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
    this.formData = {
      id: null,
      type: 'Autoridad',
      names: '',
      last_names: '',
      institucional_email: '',
      position: '',
      area: '',
      grade: '',
      year: '',
      img_url: '',
      pdf_url: '',
      description: ''
    };
    this.selectedPdfFile.set(null);
    this.selectedPdfName.set('');
    this.pdfPreviewUrl.set(null);
  }

  camposFaltantes(): string[] {
    const f: string[] = [];
    if (!this.formData.names?.trim()) f.push('Nombres');
    if (!this.formData.last_names?.trim()) f.push('Apellidos');
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

  buildFormData(): FormData {
    const fd = new FormData();
    fd.append('type', this.formData.type);
    fd.append('names', this.formData.names);
    fd.append('last_names', this.formData.last_names);
    fd.append('institucional_email', this.formData.institucional_email);
    fd.append('position', this.formData.position);
    fd.append('area', this.formData.area);
    fd.append('grade', this.formData.grade);
    fd.append('year', this.formData.year);
    fd.append('img_url', this.formData.img_url);
    fd.append('description', this.formData.description ?? '');
    const file = this.selectedPdfFile();
    if (file) fd.append('file', file);
    return fd;
  }

  create() {
    this.http.post(`${this.apiUrl}/create`, this.buildFormData()).subscribe({
      next: () => { this.toast.success('Personal creado correctamente.'); this.loadData(); this.cerrarModal(); },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  update() {
    this.http.put(`${this.apiUrl}/update/${this.formData.id}`, this.buildFormData()).subscribe({
      next: () => { this.toast.success('Personal actualizado correctamente.'); this.loadData(); this.cerrarModal(); },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
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
    this.http.delete(`${this.apiUrl}/delete/${id}/${del}`).subscribe({
      next: () => { this.toast.success('Acción realizada correctamente.'); this.loadData(); this.closeDeleteModal(); },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  closeDeleteModal() {
    this.deleteModal.set(false);
    this.deleteTargetId.set(null);
  }
}