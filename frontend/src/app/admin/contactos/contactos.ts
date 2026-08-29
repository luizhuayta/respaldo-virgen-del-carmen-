import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ToastService } from '../compartido/toast';
import { AvisoCambios } from '../compartido/aviso-cambios';
import { PuedeSalirConCambios } from '../compartido/salir-con-cambios';

@Component({
  selector: 'app-contactos',
  standalone: true,
  imports: [FormsModule, AvisoCambios],
  templateUrl: './contactos.html',
  styleUrl: './contactos.css',
})
export class AdminContactos implements OnInit, PuedeSalirConCambios {

  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private API = `${environment.apiUrl}/contacts`;

  contact = signal<any>(null);
  isNew = signal(false);
  showAviso = signal(false);

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

  original = signal<any>({
    id: null,
    phone: '',
    email: '',
    location: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    description: ''
  });

  dirty = computed(() => JSON.stringify(this.original()) !== JSON.stringify(this.formData()));

  private resolver: ((ok: boolean) => void) | null = null;

  ngOnInit(): void {
    this.loadContact();
  }

  @HostListener('window:beforeunload', ['$event'])
  avisar(e: BeforeUnloadEvent) { if (this.dirty()) e.preventDefault(); }

  confirmarSalida(): Promise<boolean> {
    this.showAviso.set(true);
    return new Promise(resolve => { this.resolver = resolve; });
  }

  onAvisoGuardar() {
    this.save(true);
  }

  onAvisoDescartar() {
    this.showAviso.set(false);
    this.resolver?.(true);
    this.resolver = null;
  }

  onAvisoSeguir() {
    this.showAviso.set(false);
    this.resolver?.(false);
    this.resolver = null;
  }

  loadContact() {
    this.http.get<any[]>(`${this.API}/list`)
      .subscribe({
        next: (data) => {

          if (data.length > 0) {
            const c = data[0];

            this.contact.set(c);

            const copy = {
              id: c.id,
              phone: c.phone,
              email: c.email,
              location: c.location,
              facebook: c.facebook,
              instagram: c.instagram,
              tiktok: c.tiktok,
              description: c.description
            };

            this.formData.set({ ...copy });
            this.original.set({ ...copy });
            this.isNew.set(false);

          } else {
            this.isNew.set(true);
            this.original.set({ ...this.formData() });
          }

        },
        error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
      });
  }

  save(alSalir = false) {
    if (this.isNew()) {
      this.create(alSalir);
    } else {
      this.update(alSalir);
    }
  }

  create(alSalir = false) {
    this.http.post(`${this.API}/create`, this.formData())
      .subscribe({
        next: () => this.trasGuardar(alSalir),
        error: () => this.falloGuardar(alSalir)
      });
  }

  update(alSalir = false) {
    this.http.put(`${this.API}/update/${this.formData().id}`, this.formData())
      .subscribe({
        next: () => this.trasGuardar(alSalir),
        error: () => this.falloGuardar(alSalir)
      });
  }

  private trasGuardar(alSalir: boolean) {
    this.toast.success('Contactos guardados correctamente.');
    this.original.set({ ...this.formData() });
    this.isNew.set(false);
    if (alSalir) {
      this.showAviso.set(false);
      this.resolver?.(true);
      this.resolver = null;
    }
  }

  private falloGuardar(alSalir: boolean) {
    this.toast.error('No se pudo guardar. Inténtelo de nuevo.');
    if (alSalir) {
      this.showAviso.set(false);
      this.resolver?.(false);
      this.resolver = null;
    }
  }
}
