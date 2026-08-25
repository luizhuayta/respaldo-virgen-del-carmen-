import {
  Component, signal, ViewChild, ElementRef,
  AfterViewChecked, HostListener, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  id: number;
  text: string;
  type: 'bot' | 'user';
  time: string;
  links?: { label: string; path: string }[];
  quickReplies?: string[];
}

interface ChatApiResponse {
  ok: boolean;
  text: string;
  links: { label: string; path: string }[];
  quickReplies: string[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot implements AfterViewChecked {
  @ViewChild('messagesContainer') private msgContainer!: ElementRef;

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/chat`;

  isOpen = signal(false);
  isTyping = signal(false);
  userInput = '';
  private msgIdCounter = 0;

  messages = signal<ChatMessage[]>([
    {
      id: this.nextId(),
      type: 'bot',
      text: '¡Hola! 👋 Soy el asistente virtual del **IESPP Virgen del Carmen**. Estoy aquí para ayudarte con cualquier consulta sobre nuestra institución.',
      time: this.nowTime(),
      quickReplies: ['¿Qué programas ofrecen?', 'Proceso de admisión', 'Contacto', 'Servicios'],
    },
  ]);

  toggle() { this.isOpen.update(v => !v); }
  close()  { this.isOpen.set(false); }

  sendQuickReply(text: string) {
    this.userInput = text;
    this.sendMessage();
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    this.addMessage({ type: 'user', text, time: this.nowTime() });
    this.userInput = '';
    this.isTyping.set(true);

    this.http.post<ChatApiResponse>(this.API_URL, { message: text }).subscribe({
      next: (res) => {
        this.isTyping.set(false);
        this.addMessage({
          type: 'bot',
          text: res.text,
          links: res.links ?? [],
          quickReplies: res.quickReplies ?? [],
          time: this.nowTime(),
        });
      },
      error: () => {
        this.isTyping.set(false);
        this.addMessage({
          type: 'bot',
          text: 'Lo siento, hubo un problema al conectar con el servidor. Por favor intenta nuevamente.',
          quickReplies: ['Programas', 'Admisión', 'Contacto'],
          time: this.nowTime(),
        });
      },
    });
  }

  private addMessage(msg: Omit<ChatMessage, 'id'>) {
    this.messages.update(msgs => [...msgs, { id: this.nextId(), ...msg }]);
    setTimeout(() => this.scrollToBottom(), 60);
  }

  formatText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  ngAfterViewChecked() {}

  private scrollToBottom() {
    try {
      const el = this.msgContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private nextId(): number { return ++this.msgIdCounter; }

  private nowTime(): string {
    return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.isOpen.set(false); }
}