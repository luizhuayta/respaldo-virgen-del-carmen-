import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { A11yModule } from '@angular/cdk/a11y';
import { environment } from '../../../environments/environment';
import { ToastService } from '../compartido/toast';

@Component({
  selector: 'app-admin-mesa-de-partes',
  standalone: true,
  imports: [CommonModule, FormsModule, A11yModule],
  templateUrl: './mesa-de-partes.html',
  styleUrl: './mesa-de-partes.css'
})
export class MesaDePartesAdmin implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private cdRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  private BASE = environment.baseUrl;
  tramites = signal<any[]>([]);

  showModal = false;
  tramiteSeleccionado: any = null;
  pdfSafeUrl: SafeResourceUrl | null = null;
  isLoading = false;

  mostrarPdfFlotante = signal<boolean>(false);
  confirmNombre = '';
  confirmCodigo = '';

  ngOnInit(): void {
    this.obtenerTramites();
  }

  obtenerTramites(): void {
    this.http.get<any[]>(`${environment.apiUrl}/digital_intake_office/list`).subscribe({
      next: (data) => {
        this.tramites.set(
          data.map(tramite => {
            return {
              ...tramite,
              fechaFormateada:
                tramite.created_at ||
                tramite.fecha ||
                tramite.createdAt ||
                new Date(),

              statusNormalized:
                tramite.processing_status || 'Pendiente'
            };
          })
        );
      },
      error: () => {
        this.toast.error('No se pudo guardar. Inténtelo de nuevo.');
      }
    });
  }

  abrirEvaluacion(tramite: any): void {
    this.tramiteSeleccionado = tramite;
    this.showModal = true;
    this.mostrarPdfFlotante.set(false);
    this.confirmNombre = '';
    this.confirmCodigo = '';

    const rutaRelativa = tramite.attached_file_url || tramite.archivo || tramite.document_url || tramite.link_documento;
    if (rutaRelativa) {
      const urlCompleta = rutaRelativa.startsWith('http')
        ? rutaRelativa
        : `${this.BASE}${rutaRelativa}`;

      this.pdfSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlCompleta);
    } else {
      this.pdfSafeUrl = null;
    }
  }

  abrirPdfFlotante(): void {
    this.mostrarPdfFlotante.set(true);
  }

  cerrarPdfFlotante(): void {
    this.mostrarPdfFlotante.set(false);
  }

  cerrarModal(): void {
    this.showModal = false;
    this.tramiteSeleccionado = null;
    this.pdfSafeUrl = null;
    this.mostrarPdfFlotante.set(false);
    this.confirmNombre = '';
    this.confirmCodigo = '';
  }

  confirmacionValida(): boolean {
    const t = this.tramiteSeleccionado;
    if (!t) return false;
    const nombre = (t.full_name || '').trim();
    const codigo = (t.tracking_code || '').trim();
    return !!nombre && !!codigo
      && this.confirmNombre.trim() === nombre
      && this.confirmCodigo.trim() === codigo;
  }

  actualizarEstado(nuevoEstado: 'Aceptado' | 'Rechazado' | 'Finalizado'): void {
    if (!this.tramiteSeleccionado || this.isLoading) return;
    if (nuevoEstado !== 'Finalizado' && !this.confirmacionValida()) return;

    const id = this.tramiteSeleccionado.id;
    const payload = { processing_status: nuevoEstado };

    this.isLoading = true;

    this.http.put(
      `${environment.apiUrl}/digital_intake_office/update/${id}`,
      payload
    ).subscribe({
      next: () => {
        this.tramites.update(listaActual =>
          listaActual.map(t => {
            if (t.id === id) {
              return {
                ...t,
                processing_status: nuevoEstado,
                statusNormalized: nuevoEstado
              };
            }
            return t;
          })
        );

        this.tramiteSeleccionado = {
          ...this.tramiteSeleccionado,
          processing_status: nuevoEstado,
          statusNormalized: nuevoEstado
        }

        this.isLoading = false;

        this.toast.success('Estado actualizado correctamente.');
        this.cdRef.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.toast.error('Ocurrió un error al intentar cambiar el estado de este trámite.');
      }
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
    this.http.delete(`${this.BASE}/api/digital_intake_office/delete/${id}/${del}`).subscribe({
      next: () => { this.toast.success('Acción realizada correctamente.'); this.obtenerTramites(); this.closeDeleteModal(); },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  closeDeleteModal() {
    this.deleteModal.set(false);
    this.deleteTargetId.set(null);
  }
}