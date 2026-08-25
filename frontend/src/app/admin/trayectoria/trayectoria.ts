import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-trayectoria',
  standalone: true,
  imports: [FormsModule, QuillModule],
  templateUrl: './trayectoria.html',
  styleUrl: './trayectoria.css',
})
export class AdminTrayectoria implements OnInit {

  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/career`;

  career = signal<any>(null);
  isEditMode = signal(false);
  isNew = signal(false);

  formData = signal<any>({
    id: null,
    history: '',
    mision: '',
    vision: '',
    values: '',
    description: ''
  });

  ngOnInit(): void {
    this.loadCareer();
  }

  // datos
  loadCareer() {
    this.http.get<any[]>(`${this.API}/list`)
      .subscribe({
        next: (data) => {

          if (data.length > 0) {
            const c = data[0];

            this.career.set(c);

            this.formData.set({
              id: c.id,
              history: c.history,
              mision: c.mision,
              vision: c.vision,
              values: c.values,
              description: c.description
            });

            this.isEditMode.set(false);
            this.isNew.set(false);

          } else {
            this.isEditMode.set(true);
            this.isNew.set(true);
          }

        },
        error: err => console.error(err)
      });
  }

  // acciones
  enableEdit() {
    this.isEditMode.set(true);
  }

  cancelEdit() {
    if (this.career()) {
      this.formData.set({
        id: this.career().id,
        history: this.career().history,
        mision: this.career().mision,
        vision: this.career().vision,
        values: this.career().values,
        description: this.career().description
      });
    }

    this.isEditMode.set(false);
  }

  save() {
    if (this.isNew()) {
      this.create();
    } else {
      this.update();
    }
  }

  create() {
    this.http.post(`${this.API}/create`, this.formData())
      .subscribe({
        next: () => this.loadCareer(),
        error: err => console.error(err)
      });
  }

  update() {
    this.http.put(`${this.API}/update/${this.formData().id}`, this.formData())
      .subscribe({
        next: () => this.loadCareer(),
        error: err => console.error(err)
      });
  }

  // configuración Quill
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
}