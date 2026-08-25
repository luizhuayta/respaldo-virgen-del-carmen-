import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Chatbot } from './components/chatbot/chatbot';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Chatbot],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router);

  get isAdmin(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
