import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-reclamaciones',
  imports: [FormsModule],
  templateUrl: './admin-reclamaciones.html',
  styleUrl: './admin-reclamaciones.css',
})
export class AdminReclamaciones implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  reclamaciones: any[] = [];
  filtered: any[] = [];
  isLoading = false;
  loadError = '';

  filterText = '';
  filterStatus = '';
  filterType = '';

  selectedItem: any = null;
  showDetailModal = false;
  showRespondModal = false;

  respondForm = { admin_response: '', processing_status: '' };
  isSaving = false;
  saveError = '';
  saveSuccess = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.isLoading = true;
    this.loadError = '';
    this.http.get<any[]>(`${environment.apiUrl}/reclamaciones/list`)
      .pipe(timeout(12000))
      .subscribe({
        next: (list) => {
          this.zone.run(() => {
            this.isLoading = false;
            this.reclamaciones = list;
            this.applyFilters();
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.zone.run(() => {
            this.isLoading = false;
            this.loadError = 'Error al cargar las reclamaciones.';
            this.cdr.detectChanges();
          });
        }
      });
  }

  applyFilters(): void {
    this.filtered = this.reclamaciones.filter(r => {
      const text = this.filterText.toLowerCase();
      const matchText = !text ||
        `${r.nombres} ${r.apellido_paterno} ${r.apellido_materno}`.toLowerCase().includes(text) ||
        r.dni?.includes(text) ||
        r.tracking_code?.toLowerCase().includes(text);
      const matchStatus = !this.filterStatus || r.processing_status === this.filterStatus;
      const matchType = !this.filterType || r.claim_type === this.filterType;
      return matchText && matchStatus && matchType;
    });
  }

  openDetail(item: any): void {
    this.selectedItem = item;
    this.showDetailModal = true;
  }

  openRespond(item: any): void {
    this.selectedItem = item;
    this.respondForm = {
      admin_response: item.admin_response || '',
      processing_status: item.processing_status || 'En Proceso'
    };
    this.saveError = '';
    this.saveSuccess = '';
    this.showRespondModal = true;
  }

  closeModals(): void {
    this.showDetailModal = false;
    this.showRespondModal = false;
    this.selectedItem = null;
  }

  guardarRespuesta(): void {
    if (!this.respondForm.admin_response.trim() || !this.respondForm.processing_status) {
      this.saveError = 'Completa la respuesta y el estado.';
      return;
    }
    this.isSaving = true;
    this.saveError = '';
    this.saveSuccess = '';

    this.http.put<any>(`${environment.apiUrl}/reclamaciones/respond/${this.selectedItem.id}`, this.respondForm)
      .pipe(timeout(10000))
      .subscribe({
        next: (updated) => {
          this.zone.run(() => {
            this.isSaving = false;
            const idx = this.reclamaciones.findIndex(r => r.id === updated.id);
            if (idx >= 0) this.reclamaciones[idx] = updated;
            this.applyFilters();
            this.saveSuccess = 'Respuesta guardada correctamente.';
            setTimeout(() => this.closeModals(), 1200);
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.zone.run(() => {
            this.isSaving = false;
            this.saveError = 'Error al guardar. Intente nuevamente.';
            this.cdr.detectChanges();
          });
        }
      });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pendiente': 'badge-pendiente',
      'En Proceso': 'badge-proceso',
      'Respondido': 'badge-respondido',
      'Cerrado': 'badge-cerrado',
    };
    return map[status] || 'badge-pendiente';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatId(id: number): string {
    return String(id).padStart(8, '0');
  }

  get fullName(): string {
    if (!this.selectedItem) return '';
    return `${this.selectedItem.nombres} ${this.selectedItem.apellido_paterno} ${this.selectedItem.apellido_materno}`;
  }

  get serviceList(): string[] {
    if (!this.selectedItem?.service_type) return [];
    try {
      return Array.isArray(this.selectedItem.service_type)
        ? this.selectedItem.service_type
        : JSON.parse(this.selectedItem.service_type);
    } catch { return []; }
  }

  get counts() {
    return {
      total: this.reclamaciones.length,
      pendiente: this.reclamaciones.filter(r => r.processing_status === 'Pendiente').length,
      proceso: this.reclamaciones.filter(r => r.processing_status === 'En Proceso').length,
      respondido: this.reclamaciones.filter(r => r.processing_status === 'Respondido').length,
    };
  }
}
