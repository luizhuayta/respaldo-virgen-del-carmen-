import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { A11yModule } from '@angular/cdk/a11y';
import { environment } from '../../../environments/environment';
import { ToastService } from '../compartido/toast';

@Component({
  selector: 'app-investigaciones',
  standalone: true,
  imports: [FormsModule, QuillModule, A11yModule],
  templateUrl: './investigaciones.html',
  styleUrl: './investigaciones.css',
})
export class AdminInvestigaciones implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private API = `${environment.apiUrl}/investigations`;
  private BASE = environment.baseUrl;

  investigaciones = signal<any[]>([]);

  // ===== FILTROS =====
  selectedYear = signal<string>('');
  selectedMonth = signal<string>('');
  searchQuery = signal<string>('');

  readonly mesesNombre: Record<string, string> = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo',
    '04': 'Abril', '05': 'Mayo', '06': 'Junio',
    '07': 'Julio', '08': 'Agosto', '09': 'Septiembre',
    '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };

  availableYears = computed(() => {
    const years = this.investigaciones()
      .map(i => i.publication_date?.substring(0, 4))
      .filter(Boolean);
    return [...new Set(years)].sort((a, b) => b.localeCompare(a));
  });

  availableMonths = computed(() => {
    const year = this.selectedYear();
    if (!year) return [];
    const months = this.investigaciones()
      .filter(i => i.publication_date?.startsWith(year))
      .map(i => i.publication_date?.substring(5, 7))
      .filter(Boolean);
    return [...new Set(months)].sort();
  });

  filteredInvestigaciones = computed(() => {
    const year = this.selectedYear();
    const month = this.selectedMonth();
    const query = this.searchQuery().toLowerCase().trim();

    return this.investigaciones().filter(i => {
      const matchYear = !year || i.publication_date?.startsWith(year);
      const matchMonth = !month || i.publication_date?.substring(5, 7) === month;
      const matchQuery = !query ||
        i.title?.toLowerCase().includes(query) ||
        i.author?.toLowerCase().includes(query);
      return matchYear && matchMonth && matchQuery;
    });
  });

  onYearChange() {
    this.selectedMonth.set('');
  }
  // ===================

  showModal = signal(false);
  isEditMode = signal(false);
  selectedFile: File | null = null;

  formData: any = {
    id: null,
    title: '',
    author: '',
    content: '',
    publication_date: '',
    description: '',
    pdf_url: ''
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<any[]>(`${this.API}/list`).subscribe({
      next: (data) => {
        this.investigaciones.set(
          data.map(i => ({
            id: i.id,
            title: i.title,
            author: i.author,
            content: i.content,
            publication_date: i.publication_date,
            description: i.description,
            pdf_url: i.pdf_url
              ? this.sanitizer.bypassSecurityTrustResourceUrl(`${this.BASE}${i.pdf_url}`)
              : null,
            status: i.status,
            fecha: i.updatedAt
          }))
        );
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    this.formData.pdf_url = this.sanitizer.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(file)
    );
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(i: any) {
    this.isEditMode.set(true);
    this.formData = {
      id: i.id,
      title: i.title,
      author: i.author,
      content: i.content,
      publication_date: i.publication_date,
      description: i.description,
      pdf_url: i.pdf_url
    };
    this.selectedFile = null;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  resetForm() {
    this.formData = {
      id: null, title: '', author: '', content: '',
      publication_date: '', description: '', pdf_url: ''
    };
    this.selectedFile = null;
  }

  save() {
    this.isEditMode() ? this.update() : this.create();
  }

  create() {
    const fd = new FormData();
    Object.keys(this.formData).forEach(key => {
      if (key !== 'pdf_url') fd.append(key, this.formData[key] || '');
    });
    if (this.selectedFile) fd.append('file', this.selectedFile);
    this.http.post(`${this.API}/create`, fd).subscribe({
      next: () => { this.toast.success('Investigación creada correctamente.'); this.loadData(); this.closeModal(); },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  update() {
    const fd = new FormData();
    Object.keys(this.formData).forEach(key => {
      if (key !== 'pdf_url') fd.append(key, this.formData[key] || '');
    });
    if (this.selectedFile) fd.append('file', this.selectedFile);
    this.http.put(`${this.API}/update/${this.formData.id}`, fd).subscribe({
      next: () => { this.toast.success('Investigación actualizada correctamente.'); this.loadData(); this.closeModal(); },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  editorTheme = signal<'dark' | 'light'>('light');

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  pdfViewer = signal<SafeResourceUrl | null>(null);

  openPdfViewer(event: Event, url: SafeResourceUrl) {
    event.stopPropagation();
    this.pdfViewer.set(url);
  }

  closePdfViewer() {
    this.pdfViewer.set(null);
  }

  toggleEditorTheme() {
    this.editorTheme.set(this.editorTheme() === 'dark' ? 'light' : 'dark');
  }

  deleteModal = signal(false);
  deleteTargetId = signal<number | null>(null);

  openDeleteModal(id: number) {
    this.deleteTargetId.set(id);
    this.deleteModal.set(true);
  }

  deleteAction(del: '0' | '1') {
    const id = this.deleteTargetId();
    if (!id) return;
    this.http.delete(`${this.API}/delete/${id}/${del}`).subscribe({
      next: () => { this.toast.success('Acción realizada correctamente.'); this.loadData(); this.closeDeleteModal(); },
      error: () => this.toast.error('No se pudo guardar. Inténtelo de nuevo.')
    });
  }

  closeDeleteModal() {
    this.deleteModal.set(false);
    this.deleteTargetId.set(null);
  }
}