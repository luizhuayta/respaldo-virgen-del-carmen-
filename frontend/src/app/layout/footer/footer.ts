import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit {

  private http = inject(HttpClient);

  contacto = signal<any>(null);
  qrCodeUrl = signal<string>('');

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/contacts/list`).subscribe({
      next: data => {
        const activo = data.find(c => c.status);
        if (activo) this.contacto.set(activo);
      }
    });

    // Generate QR code URL for document validation
    const frontendUrl = environment.baseUrl || 'http://localhost:4200';
    this.qrCodeUrl.set(`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(frontendUrl + '/validar-documento')}`);
  }
}
