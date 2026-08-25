import { Component, OnInit, inject, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timeout } from 'rxjs';
import { DocumentValidationService } from '../../core/services/document-validation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-validar-documento',
  imports: [CommonModule],
  templateUrl: './validar-documento.html',
  styleUrl: './validar-documento.css',
})
export class ValidarDocumento implements OnInit {
  private documentValidationService = inject(DocumentValidationService);
  private route = inject(ActivatedRoute);
  private zone = inject(NgZone);

  uuid: string = '';
  isValid: boolean = false;
  isLoading: boolean = true;
  documentData: any = null;
  errorMessage: string = '';

  ngOnInit(): void {
    this.uuid = this.route.snapshot.paramMap.get('uuid') || '';
    if (this.uuid) {
      this.validateDocument();
    } else {
      this.isLoading = false;
      this.errorMessage = 'UUID no proporcionado';
    }
  }

  validateDocument(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.documentValidationService.validateDocument(this.uuid).pipe(
      timeout(10000)
    ).subscribe({
      next: (response) => {
        this.zone.run(() => {
          this.isLoading = false;
          this.isValid = response.valid;
          if (response.valid) {
            this.documentData = response.document;
          } else {
            this.errorMessage = response.message || 'Documento no encontrado';
          }
        });
      },
      error: (error) => {
        this.zone.run(() => {
          this.isLoading = false;
          this.isValid = false;
          if (error.name === 'TimeoutError') {
            this.errorMessage = 'El servidor tardó demasiado en responder. Intente nuevamente.';
          } else {
            this.errorMessage = 'Error al validar el documento. Intente nuevamente.';
          }
        });
      }
    });
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

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pendiente': 'status-pendiente',
      'Aceptado': 'status-aceptado',
      'Rechazado': 'status-rechazado',
      'Finalizado': 'status-finalizado',
    };
    return map[status] || 'status-pendiente';
  }
}