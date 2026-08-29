import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { environment } from '../../../environments/environment';
import { ToastService } from '../compartido/toast';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, DatePipe, A11yModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class AdminUsuarios implements OnInit {

  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private API = `${environment.apiUrl}/users`;

  usuarios = signal<any[]>([]);

  showModal = signal(false);
  isEditMode = signal(false);

  formData: any = {
    id: null,
    names: '',
    last_names: '',
    username: '',
    password: '',
    description: ''
  };

  ngOnInit(): void {
    this.loadData();
  }

  // =========================
  // DATA
  // =========================
  loadData() {
    this.http.get<any[]>(`${this.API}/list`).subscribe({
      next: (data) => {
        this.usuarios.set(
          data.map(u => ({
            id: u.id,
            names: u.names,
            last_names: u.last_names,
            username: u.username,
            description: u.description,
            status: u.status,
            fecha: u.createdAt
          }))
        );
      },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  // =========================
  // MODAL
  // =========================
  openCreateModal() {
    this.isEditMode.set(false);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(u: any) {
    this.isEditMode.set(true);

    this.formData = {
      id: u.id,
      names: u.names,
      last_names: u.last_names,
      username: u.username,
      password: '', // no se muestra ni edita
      description: u.description
    };

    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  resetForm() {
    this.formData = {
      id: null,
      names: '',
      last_names: '',
      username: '',
      password: '',
      description: ''
    };
  }

  // =========================
  // CRUD
  // =========================
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
        this.toast.success('Usuario creado correctamente.');
        this.loadData();
        this.closeModal();
      },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  update() {
    const body = {
      names: this.formData.names,
      last_names: this.formData.last_names,
      username: this.formData.username,
      description: this.formData.description
    };

    this.http.put(`${this.API}/update/${this.formData.id}`, body).subscribe({
      next: () => {
        this.toast.success('Usuario actualizado correctamente.');
        this.loadData();
        this.closeModal();
      },
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