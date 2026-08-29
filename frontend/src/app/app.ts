import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Chatbot } from './components/chatbot/chatbot';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Chatbot],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private router = inject(Router);

  // Signal para controlar la visibilidad de la paleta de comandos
  commandPaletteOpen = signal(false);

  get isAdmin(): boolean {
    return this.router.url.startsWith('/admin');
  }

  ngOnInit(): void {
    // Listener global para Paleta de Comandos (Ctrl+K / Cmd+K)
    document.addEventListener('keydown', this.handleCommandPalette.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.handleCommandPalette.bind(this));
  }

  private handleCommandPalette(event: KeyboardEvent): void {
    // Ctrl+K o Cmd+K para abrir/cerrar paleta de comandos
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggleCommandPalette();
    }

    // ESC para cerrar paleta de comandos
    if (event.key === 'Escape' && this.commandPaletteOpen()) {
      this.commandPaletteOpen.set(false);
    }
  }

  toggleCommandPalette(): void {
    this.commandPaletteOpen.set(!this.commandPaletteOpen());
  }

  closeCommandPalette(): void {
    this.commandPaletteOpen.set(false);
  }
}
