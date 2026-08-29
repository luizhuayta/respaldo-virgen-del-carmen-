import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { DatePipe } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { environment } from '../../../environments/environment';
import { ToastService } from '../compartido/toast';

@Component({
  selector: 'app-admin-comunicados',
  standalone: true,
  imports: [FormsModule, QuillModule, DatePipe, A11yModule],
  templateUrl: './admin-comunicados.html',
  styleUrl: './admin-comunicados.css',
})
export class AdminComunicados implements OnInit {

  private http = inject(HttpClient);
  private toast = inject(ToastService);
  apiUrl = `${environment.apiUrl}/press_releases`;

  comunicados = signal<any[]>([]);

  deleteModal = signal(false);
  deleteTargetId = signal<number | null>(null);
  tooltipVisible = signal(false);

  showModal = signal(false);
  isEditMode = signal(false);

  formData: any = {
    id: null,
    title: '',
    press_release: '',
    img_url: '',
    description: ''
  };

  ngOnInit(): void {
    this.loadData();
  }

  // Datos
  loadData() {
    this.http.get<any[]>(`${this.apiUrl}/list`).subscribe({
      next: (data) => {
        this.comunicados.set(
          data.map(item => ({
            id: item.id,
            title: item.title,
            content: item.press_release,
            img_url: item.img_url,
            description: item.description,
            status: item.status,
            fecha: item.updatedAt
          }))
        );
      }
    });
  }

  // Modal Creación/Actualización
  openCreateModal() {
    this.isEditMode.set(false);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(com: any) {
    this.isEditMode.set(true);

    this.formData = {
      id: com.id,
      title: com.title,
      press_release: com.content,
      img_url: com.img_url,
      description: com.description
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
      press_release: '',
      img_url: '',
      description: ''
    };
  }

  // Creación, Lectura y Actualización
  save() {
    if (this.isEditMode()) {
      this.update();
    } else {
      this.create();
    }
  }

  create() {
    this.http.post(`${this.apiUrl}/create`, this.formData).subscribe({
      next: () => {
        this.toast.success('Comunicado creado correctamente.');
        this.loadData();
        this.closeModal();
      },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  update() {
    this.http.put(`${this.apiUrl}/update/${this.formData.id}`, this.formData).subscribe({
      next: () => {
        this.toast.success('Comunicado actualizado correctamente.');
        this.loadData();
        this.closeModal();
      },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  // Visualizador de Imagen
  imageViewer = signal(false);

  openImageViewer(event: Event) {
    event.stopPropagation();
    this.imageViewer.set(true);
  }

  closeImageViewer() {
    this.imageViewer.set(false);
  }

  // Editor Quill
  editorTheme = signal<'dark' | 'light'>('light');

  toggleEditorTheme() {
    this.editorTheme.set(
      this.editorTheme() === 'dark' ? 'light' : 'dark'
    );
  }

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

  // Modal de Eliminación
  openDeleteModal(id: number) {
    this.deleteTargetId.set(id);
    this.deleteModal.set(true);
  }

  deleteAction(del: '0' | '1') {
    const id = this.deleteTargetId();

    if (!id) return;

    this.http.delete(`${this.apiUrl}/delete/${id}/${del}`).subscribe({
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