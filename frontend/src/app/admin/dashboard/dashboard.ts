import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private http = inject(HttpClient);
  private api = environment.apiUrl;

  totalNoticias = signal(0);
  totalComunicados = signal(0);
  totalPersonal = signal(0);

  recentNoticias = signal<any[]>([]);
  recentComunicados = signal<any[]>([]);
  recentPersonal = signal<any[]>([]);

  ngOnInit(): void {
    this.http.get<any[]>(`${this.api}/news/list`).subscribe({
      next: data => {
        const activos = data.filter(d => d.status);
        this.totalNoticias.set(activos.length);
        this.recentNoticias.set(activos.slice(-3).reverse());
      }
    });

    this.http.get<any[]>(`${this.api}/press_releases/list`).subscribe({
      next: data => {
        const activos = data.filter(d => d.status);
        this.totalComunicados.set(activos.length);
        this.recentComunicados.set(activos.slice(-3).reverse());
      }
    });

    this.http.get<any[]>(`${this.api}/academic_personal/list`).subscribe({
      next: data => {
        const activos = data.filter(d => d.status);
        this.totalPersonal.set(activos.length);
        this.recentPersonal.set(activos.slice(-3).reverse());
      }
    });
  }
}
