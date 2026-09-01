import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-no-encontrado',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './no-encontrado.html',
  styleUrl: './no-encontrado.css',
})
export class NoEncontrado {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private queryRecurso = toSignal(
    this.route.queryParamMap.pipe(map(params => params.get('recurso')?.trim() ?? '')),
    { initialValue: this.route.snapshot.queryParamMap.get('recurso')?.trim() ?? '' },
  );

  recurso = computed(() => this.queryRecurso() || this.recursoDesdeUrl());

  desdeDocumento = computed(() => this.queryRecurso().length > 0);

  private recursoDesdeUrl(): string {
    const path = this.router.url.split('?')[0];
    if (!path || path === '/no-encontrado') return '';
    return decodeURIComponent(path.replace(/^\//, '').replace(/-/g, ' '));
  }
}
