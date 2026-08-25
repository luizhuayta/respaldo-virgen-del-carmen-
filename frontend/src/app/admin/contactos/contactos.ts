import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contactos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contactos.html',
  styleUrl: './contactos.css',
})
export class AdminContactos implements OnInit {

  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/contacts`;

  contact = signal<any>(null);

  isEditMode = signal(false);
  isNew = signal(false);

  formData = signal<any>({
    id: null,
    phone: '',
    email: '',
    location: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    description: ''
  });

  ngOnInit(): void {
    this.loadContact();
  }

  // LOAD
  loadContact() {
    this.http.get<any[]>(`${this.API}/list`)
      .subscribe({
        next: (data) => {

          if (data.length > 0) {
            const c = data[0];

            this.contact.set(c);

            this.formData.set({
              id: c.id,
              phone: c.phone,
              email: c.email,
              location: c.location,
              facebook: c.facebook,
              instagram: c.instagram,
              tiktok: c.tiktok,
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

  // ACTIONS
  enableEdit() {
    this.isEditMode.set(true);
  }

  cancelEdit() {
    if (this.contact()) {
      this.formData.set({
        id: this.contact().id,
        phone: this.contact().phone,
        email: this.contact().email,
        location: this.contact().location,
        facebook: this.contact().facebook,
        instagram: this.contact().instagram,
        tiktok: this.contact().tiktok,
        description: this.contact().description
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
        next: () => this.loadContact(),
        error: err => console.error(err)
      });
  }

  update() {
    this.http.put(`${this.API}/update/${this.formData().id}`, this.formData())
      .subscribe({
        next: () => this.loadContact(),
        error: err => console.error(err)
      });
  }
}