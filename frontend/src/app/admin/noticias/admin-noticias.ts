import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { QuillModule } from 'ngx-quill';
import { DatePipe } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { environment } from '../../../environments/environment';
import { ToastService } from '../compartido/toast';
import { SelectorImagen } from '../compartido/selector-imagen';
import { AvisoCambios } from '../compartido/aviso-cambios';

@Component({
  selector: 'app-admin-noticias',
  standalone: true,
  imports: [FormsModule, QuillModule, DatePipe, A11yModule, SelectorImagen, AvisoCambios],
  templateUrl: './admin-noticias.html',
  styleUrl: './admin-noticias.css',
})
export class AdminNoticias implements OnInit {

  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private API = `${environment.apiUrl}/news`;

  noticias = signal<any[]>([]);

  showModal = signal(false);
  isEditMode = signal(false);
  imageViewer = signal(false);

  editorTheme = signal<'dark' | 'light'>('light');

  formData: any = {
    id: null,
    title: '',
    content: '',
    img_url: '',
    description: ''
  };

  snapshot = '';
  mostrarErrores = signal(false);
  showAviso = signal(false);

  ngOnInit() {
    this.loadData();
  }

  // DATA
  loadData() {
    this.http.get<any[]>(`${this.API}/list`).subscribe({
      next: (data) => {
        this.noticias.set(
          data.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            img_url: n.img_url,
            description: n.description,
            status: n.status,
            fecha: n.updatedAt
          }))
        );
      }
    });
  }

  // MODAL
  openCreateModal() {
    this.isEditMode.set(false);
    this.resetForm();
    this.snapshot = JSON.stringify(this.formData);
    this.mostrarErrores.set(false);
    this.showModal.set(true);
  }

  openEditModal(n: any) {
    this.isEditMode.set(true);

    this.formData = {
      id: n.id,
      title: n.title,
      content: n.content,
      img_url: n.img_url,
      description: n.description
    };

    this.snapshot = JSON.stringify(this.formData);
    this.mostrarErrores.set(false);
    this.showModal.set(true);
  }

  closeModal() {
    if (JSON.stringify(this.formData) !== this.snapshot) {
      this.showAviso.set(true);
      return;
    }
    this.cerrarModal();
  }

  cerrarModal() {
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
    this.formData = {
      id: null,
      title: '',
      content: '',
      img_url: '',
      description: ''
    };
  }

  // CRUD
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
    this.http.post(`${this.API}/create`, this.formData).subscribe({
      next: () => {
        this.toast.success('Noticia creada correctamente.');
        this.loadData();
        this.cerrarModal();
      },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  update() {
    this.http.put(`${this.API}/update/${this.formData.id}`, this.formData).subscribe({
      next: () => {
        this.toast.success('Noticia actualizada correctamente.');
        this.loadData();
        this.cerrarModal();
      },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  // Image Viewer
  openImageViewer(event: Event) {
    event.stopPropagation();
    this.imageViewer.set(true);
  }

  closeImageViewer() {
    this.imageViewer.set(false);
  }

  // THEME
  toggleEditorTheme() {
    this.editorTheme.set(
      this.editorTheme() === 'dark' ? 'light' : 'dark'
    );
  }

  // QUILL
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