import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ConsultaResult {
  id?: number;
  tracking_code: string;
  processing_status: string;
  full_name: string;
  DNI_RUC: string;
  email: string;
  phone_number: string;
  c_condition: string;
  document_type: string;
  v_subject: string;
  v_message: string;
  number_of_pages: number;
  createdAt: string;
  attached_file_url?: string;
  document_url?: string;
}

@Component({
  selector: 'app-mesa-de-partes',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './mesa-de-partes.html',
  styleUrl: './mesa-de-partes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesaDePartes implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  isSubmitting = signal(false);
  captchaCode = signal('');
  captchaInput = signal('');
  trackingCode = signal('');
  showTracking = signal(false);
  showSuccessModal = signal(false);

  isConsulting = signal(false);
  consultaResult = signal<ConsultaResult | null>(null);
  showConsultaModal = signal(false);
  consultaError = signal('');

  selectedFile: File | null = null;

  form = {
    nombres: '',
    dni: '',
    correo: '',
    telefono: '',
    condicion: '',
    tipoDoc: '',
    asunto: '',
    mensaje: '',
    folios: 1,
    linkDocumento: '',
  };

  ngOnInit(): void {
    this.generarCaptcha();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.showSuccessModal()) {
      this.closeModal();
    }
    if (this.showConsultaModal()) {
      this.closeConsultaModal();
    }
  }

  generarCaptcha(): void {
    this.captchaCode.set(Math.floor(10000 + Math.random() * 90000).toString());
  }

  enviar(): void {
    if (this.isSubmitting()) return;

    if (this.captchaInput() !== this.captchaCode()) {
      alert('Código de verificación incorrecto. Inténtelo de nuevo.');
      this.generarCaptcha();
      this.captchaInput.set('');
      return;
    }

    this.isSubmitting.set(true);

    const formData = new FormData();
    formData.append('full_name', this.form.nombres);
    formData.append('DNI_RUC', this.form.dni);
    formData.append('email', this.form.correo);
    formData.append('phone_number', this.form.telefono);
    formData.append('c_condition', this.form.condicion);
    formData.append('verification_code', this.captchaInput());
    formData.append('document_type', this.form.tipoDoc);
    formData.append('v_subject', this.form.asunto);
    formData.append('v_message', this.form.mensaje);
    formData.append('number_of_pages', this.form.folios.toString());
    formData.append('document_url', this.form.linkDocumento);

    if (this.selectedFile) {
      formData.append('attached_file', this.selectedFile);
    }

    this.http
      .post<{ tracking_code: string }>(`${environment.apiUrl}/digital_intake_office/create`, formData)
      .pipe(timeout(10000), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.trackingCode.set(response.tracking_code);
          this.showSuccessModal.set(true);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          if (error.name === 'TimeoutError') {
            alert('El servidor tardó demasiado en responder. Verifique su conexión o intente nuevamente.');
          } else {
            alert(error.error?.error || 'Error al registrar el documento en Mesa de Partes.');
          }
        },
      });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    this.selectedFile = file;
  }

  toggleTracking(): void {
    this.showTracking.update((v) => !v);
  }

  closeModal(): void {
    this.showSuccessModal.set(false);
    this.nuevoEnvio();
  }

  nuevoEnvio(): void {
    this.captchaInput.set('');
    this.generarCaptcha();
    this.selectedFile = null;
    this.trackingCode.set('');
    this.form = {
      nombres: '',
      dni: '',
      correo: '',
      telefono: '',
      condicion: '',
      tipoDoc: '',
      asunto: '',
      mensaje: '',
      folios: 1,
      linkDocumento: '',
    };
  }

  consultar(): void {
    const code = this.trackingCode().trim();
    if (!code || this.isConsulting()) return;

    this.isConsulting.set(true);
    this.consultaError.set('');
    this.consultaResult.set(null);

    this.http
      .get<ConsultaResult[]>(`${environment.apiUrl}/digital_intake_office/list`)
      .pipe(timeout(15000), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.isConsulting.set(false);
          const found = (list || []).find((item) => item.tracking_code === code);
          if (found) {
            this.consultaResult.set(found);
            this.showConsultaModal.set(true);
            this.consultaError.set('');
          } else {
            this.consultaError.set('No se encontró ningún trámite con ese código de seguimiento.');
          }
        },
        error: (error) => {
          this.isConsulting.set(false);
          this.consultaError.set(
            error.name === 'TimeoutError'
              ? 'El servidor tardó demasiado en responder. Intente nuevamente.'
              : 'Error al consultar el trámite. Intente nuevamente.'
          );
        },
      });
  }

  closeConsultaModal(): void {
    this.showConsultaModal.set(false);
    this.consultaResult.set(null);
  }

  getFileUrl(relativePath: string): string {
    return `${environment.baseUrl}${relativePath}`;
  }

  getFileType(url: string): string {
    const ext = url.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
    return 'link';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pendiente: 'status-pendiente',
      Aceptado: 'status-aceptado',
      Rechazado: 'status-rechazado',
      Finalizado: 'status-finalizado',
    };
    return map[status] || 'status-pendiente';
  }

  getFileName(url: string): string {
    return url.split('/').pop() ?? 'archivo';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  abrirArchivo(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      Pendiente:
        'Su trámite ha sido recibido formalmente y se encuentra en proceso de calificación por Mesa de Partes. Conserve su código de seguimiento para consultas posteriores.',
      Aceptado:
        'Su trámite ha sido admitido satisfactoriamente. Se remitió notificación al correo electrónico registrado con las indicaciones para su seguimiento.',
      Rechazado:
        'Su trámite presenta observaciones o no cumple con los requisitos del TUPA. Revise su correo electrónico para subsanar.',
      Finalizado:
        'La atención de su trámite institucional ha concluido. Puede verificar el pronunciamiento oficial en su correo electrónico registrado.',
    };
    return messages[status] || messages['Pendiente'];
  }
}