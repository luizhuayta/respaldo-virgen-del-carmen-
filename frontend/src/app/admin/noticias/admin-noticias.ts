import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { QuillModule } from 'ngx-quill';
import { DatePipe } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { environment } from '../../../environments/environment';
import { ToastService } from '../compartido/toast';

@Component({
  selector: 'app-admin-noticias',
  standalone: true,
  imports: [FormsModule, QuillModule, DatePipe, A11yModule],
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

    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
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
  save() {
    if (this.isEditMode()) {
      this.update();
    } else {
      this.create();
    }
  }

  create() {
    this.http.post(`${this.API}/create`, this.formData).subscribe({
      next: () => {
        this.toast.success('Noticia creada correctamente.');
        this.loadData();
        this.closeModal();
      },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  update() {
    this.http.put(`${this.API}/update/${this.formData.id}`, this.formData).subscribe({
      next: () => {
        this.toast.success('Noticia actualizada correctamente.');
        this.loadData();
        this.closeModal();
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