import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ContactInfo {
  id?: number;
  phone?: string;
  email?: string;
  location?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  status?: boolean;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  contacto = signal<ContactInfo | null>(null);

  ngOnInit(): void {
    this.http.get<ContactInfo[]>(`${environment.apiUrl}/contacts/list`).pipe(
      catchError(error => {
        console.warn('No se pudo cargar la información de contacto del footer:', error);
        return of([]);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: data => {
        const activo = data.find(c => c.status);
        if (activo) {
          this.contacto.set(activo);
        }
      }
    });
  }
}
