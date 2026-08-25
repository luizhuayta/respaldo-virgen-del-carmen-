import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class AdminUsuarios implements OnInit {

  private http = inject(HttpClient);
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
      error: err => console.error(err)
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
        this.loadData();
        this.closeModal();
      },
      error: err => console.error(err)
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
        this.loadData();
        this.closeModal();
      },
      error: err => console.error(err)
    });
  }

  delete(id: number) {
    if (!confirm('¿Desactivar usuario?')) return;

    this.http.delete(`${this.API}/delete/${id}`).subscribe({
      next: () => this.loadData(), // importante: NO eliminar del array
      error: err => console.error(err)
    });
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
        this.loadData();
        this.closeDeleteModal();
      },
      error: err => console.error(err)
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