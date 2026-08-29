import { Component, OnInit, inject, ChangeDetectorRef, NgZone, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mesa-de-partes',
  imports: [FormsModule],
  templateUrl: './mesa-de-partes.html',
  styleUrl: './mesa-de-partes.css',
})
export class MesaDePartes implements OnInit {
  isSubmitting = false;
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  captchaCode = '';
  captchaInput = '';

  trackingCode = '';

  showTracking = false;

  showSuccessModal = false;

  isConsulting = false;
  consultaResult: any = null;
  showConsultaModal = false;
  consultaError = '';

  // Signals para estados reactivos
  loadingTracking = signal(false);
  errorTracking = signal<string | null>(null);
  trackingResult = signal<any | null>(null);

  // Stepper reactivo de seguimiento
  trackingSteps = computed(() => {
    const result = this.trackingResult();
    if (!result) return [];
    
    const status = result.processing_status || 'Pendiente';
    const steps = [
      { label: 'Recibido', completed: true, current: status === 'Pendiente' },
      { label: 'En Proceso', completed: status === 'En Progreso' || status === 'Aceptado' || status === 'Finalizado', current: status === 'En Progreso' },
      { label: 'Resuelto', completed: status === 'Finalizado' || status === 'Resuelto', current: status === 'Finalizado' || status === 'Resuelto' }
    ];
    
    return steps;
  });

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

  generarCaptcha(): void {

    this.captchaCode =
      Math.floor(
        10000 + Math.random() * 90000
      ).toString();
  }

  enviar(): void {

    if (this.isSubmitting) return;

    if (this.captchaInput !== this.captchaCode) {

      alert(
        'Código de verificación incorrecto'
      );

      this.generarCaptcha();

      this.captchaInput = '';

      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    formData.append(
      'full_name',
      this.form.nombres
    );

    formData.append(
      'DNI_RUC',
      this.form.dni
    );

    formData.append(
      'email',
      this.form.correo
    );

    formData.append(
      'phone_number',
      this.form.telefono
    );

    formData.append(
      'c_condition',
      this.form.condicion
    );

    formData.append(
      'verification_code',
      this.captchaInput
    );

    formData.append(
      'document_type',
      this.form.tipoDoc
    );

    formData.append(
      'v_subject',
      this.form.asunto
    );

    formData.append(
      'v_message',
      this.form.mensaje
    );

    formData.append(
      'number_of_pages',
      this.form.folios.toString()
    );

    formData.append(
      'document_url',
      this.form.linkDocumento
    );

    if (this.selectedFile) {

      formData.append(
        'attached_file',
        this.selectedFile
      );
    }

    this.http.post(
      `${environment.apiUrl}/digital_intake_office/create`,
      formData
    ).pipe(
      timeout(8000)
    ).subscribe({

      next: (response: any) => {
        this.zone.run(() => {
          this.isSubmitting = false;
          this.trackingCode = response.tracking_code;
          this.showSuccessModal = true;
          this.cdr.detectChanges();
        });
      },

      error: (error) => {
        this.zone.run(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();

          if (error.name === 'TimeoutError') {
            alert('El servidor tardó demasiado en responder. Verifique que el servidor esté activo e intente nuevamente.');
          } else {
            alert(
              error.error?.error ||
              'Error al enviar el documento'
            );
          }
        });
      }
    });
  }

  onFileSelected(event: any): void {

    const file = event.target.files[0];

    if (!file) return;

    this.selectedFile = file;
  }

  toggleTracking(): void {

    this.showTracking =
      !this.showTracking;
  }

  closeModal(): void {

    this.showSuccessModal = false;

    this.nuevoEnvio();
  }

  nuevoEnvio(): void {

    this.captchaInput = '';

    this.generarCaptcha();

    this.selectedFile = null;

    this.trackingCode = '';

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
    if (!this.trackingCode.trim() || this.isConsulting) return;

    this.loadingTracking.set(true);
    this.errorTracking.set(null);
    this.trackingResult.set(null);

    this.http.get<any[]>(
      `${environment.apiUrl}/digital_intake_office/list`
    ).pipe(
      timeout(15000)
    ).subscribe({
      next: (list) => {
        this.zone.run(() => {
          this.loadingTracking.set(false);

          const found = list.find(
            (item) => item.tracking_code === this.trackingCode.trim()
          );

          if (found) {
            this.trackingResult.set(found);
            this.consultaResult = found;
            this.showConsultaModal = true;
            this.errorTracking.set(null);
          } else {
            this.errorTracking.set('No se encontró ningún trámite con ese código.');
          }
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.zone.run(() => {
          this.loadingTracking.set(false);
          this.errorTracking.set(error.name === 'TimeoutError'
            ? 'El servidor tardó demasiado. Verifique que esté activo e intente nuevamente.'
            : 'Error al consultar el trámite. Intente nuevamente.');
          this.cdr.detectChanges();
        });
      }
    });
  }

  // Método de reintento para consulta
  retryTracking(): void {
    this.consultar();
  }

  closeConsultaModal(): void {
    this.showConsultaModal = false;
    this.consultaResult = null;
    this.trackingResult.set(null);
    this.errorTracking.set(null);
  }

  getFileUrl(relativePath: string): string {
    return `${environment.baseUrl}${relativePath}`;
  }

  getFileType(url: string): string {

    const ext =
      url.split('.').pop()?.toLowerCase() ?? '';

    if (ext === 'pdf') return 'pdf';

    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'image';

    return 'link';
  }

  getStatusClass(status: string): string {

    const map: Record<string, string> = {
      'Pendiente': 'status-pendiente',
      'Aceptado': 'status-aceptado',
      'Rechazado': 'status-rechazado',
      'Finalizado': 'status-finalizado',
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
      minute: '2-digit'
    });
  }

  abrirArchivo(url: string): void {
    window.open(url, '_blank');
  }

  getStatusMessage(status: string): string {

    const messages: Record<string, string> = {

      Pendiente:
        'Su trámite ha sido recibido correctamente y se encuentra en proceso de evaluación por parte de la institución. Le recomendamos conservar su código de seguimiento y consultar periódicamente el estado de su solicitud.\nEn el caso de no encontrar el correo de confirmación en su bandeja principal revise el correo no deseado.',

      Aceptado:
        'Su trámite ha sido aceptado satisfactoriamente. Se ha enviado una notificación al correo electrónico registrado con información adicional. Por favor, revise su bandeja de entrada y también la carpeta de spam o correo no deseado.',

      Rechazado:
        'Su trámite ha sido observado o rechazado. Se ha enviado una notificación al correo electrónico registrado indicando los motivos correspondientes. Por favor, revise su correo electrónico para conocer los detalles.',

      Finalizado:
        'La atención de su trámite ha concluido. Revise el correo electrónico registrado para verificar la respuesta final o las indicaciones proporcionadas por la institución.'
    };

    return messages[status] || messages['Pendiente'];
  }
}