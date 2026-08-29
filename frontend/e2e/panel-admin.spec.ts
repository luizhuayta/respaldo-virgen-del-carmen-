import { test, expect, Page } from '@playwright/test';
import { join } from 'node:path';

const USER = process.env.ADMIN_USER ?? 'joel perez';
const PASS = process.env.ADMIN_PASS ?? 'admin123';

const MODULOS = [
  { path: '/admin/dashboard', heading: 'Por atender' },
  { path: '/admin/mesa-de-partes', heading: 'Mesa de Partes' },
  { path: '/admin/admin-reclamaciones', heading: /Libro de Reclamaciones|Reclamaciones/ },
  { path: '/admin/noticias', heading: 'Noticias' },
  { path: '/admin/comunicados', heading: 'Comunicados' },
  { path: '/admin/documentos', heading: 'Documentos' },
  { path: '/admin/personal-academico', heading: 'Personal Académico' },
  { path: '/admin/investigaciones', heading: 'Investigaciones' },
  { path: '/admin/trayectoria', heading: 'Trayectoria' },
  { path: '/admin/contactos', heading: 'Contactos' },
  { path: '/admin/usuarios', heading: 'Usuarios' },
];

async function login(page: Page) {
  await page.goto('/admin/login');
  await page.getByPlaceholder('Usuario').fill(USER);
  await page.getByPlaceholder('Contraseña').fill(PASS);
  const [res] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/auth/login') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Iniciar Sesión' }).click(),
  ]);
  if (!res.ok()) {
    throw new Error(`login ${res.status()} ${await res.text()}`);
  }
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 20_000 });
}

test.describe('Panel admin', () => {
  test.describe.configure({ retries: 1 });
  test('login incorrecto muestra toast y no recarga a ciegas', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByPlaceholder('Usuario').fill('no-existe');
    await page.getByPlaceholder('Contraseña').fill('mala');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await expect(page.locator('.toast-err')).toContainText('Usuario o contraseña incorrectos');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('login correcto y los 12 módulos cargan', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await login(page);
    await expect(page.getByRole('heading', { name: 'Por atender' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Secciones del panel' })).toBeVisible();
    await expect(page.getByText('Bandeja', { exact: true })).toBeVisible();
    await expect(page.getByText('Portal', { exact: true })).toBeVisible();
    await expect(page.getByText('Instituto', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Libro de Reclamaciones' })).toBeVisible();

    for (const mod of MODULOS) {
      await page.goto(mod.path);
      await expect(page.getByRole('heading', { name: mod.heading }).first()).toBeVisible();
    }

    const graves = pageErrors.filter(m =>
      !m.includes('quill') && !m.includes('ResizeObserver') && !m.includes('ExpressionChanged')
    );
    expect(graves, pageErrors.join('\n')).toEqual([]);
  });

  test('noticia vacía no dispara POST y marca campos', async ({ page }) => {
    await login(page);
    await page.goto('/admin/noticias');
    await page.getByRole('button', { name: 'Agregar' }).click();
    await expect(page.getByRole('heading', { name: 'Agregar Noticia' })).toBeVisible();

    const posts: string[] = [];
    page.on('request', req => {
      if (req.method() === 'POST' && req.url().includes('/news/')) posts.push(req.url());
    });

    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.locator('.toast-err')).toContainText('Faltan campos obligatorios');
    await expect(page.locator('#nt-titulo')).toHaveClass(/campo-error/);
    expect(posts).toEqual([]);
  });

  test('subir imagen en noticias llama POST /images/upload', async ({ page }) => {
    await login(page);
    await page.goto('/admin/noticias');
    await page.getByRole('button', { name: 'Agregar' }).click();

    const jpg = join(process.cwd(), 'e2e', 'tiny.jpg');

    const upload = page.waitForResponse(
      res => res.url().includes('/images/upload') && res.request().method() === 'POST',
      { timeout: 20_000 },
    );
    await page.locator('app-selector-imagen input[type="file"]').setInputFiles(jpg);
    const res = await upload;
    expect(res.status(), await res.text()).toBe(201);
  });

  test('contactos con cambios pide Guardar / Descartar / Seguir aquí', async ({ page }) => {
    await login(page);
    await page.goto('/admin/contactos');
    await expect(page.getByRole('button', { name: 'Guardar' })).toBeDisabled();
    await page.locator('input').first().fill('999999999');
    await page.getByRole('link', { name: 'Noticias' }).click();
    await expect(page.getByRole('heading', { name: 'Hay cambios sin guardar' })).toBeVisible();
    await page.getByRole('button', { name: 'Seguir aquí' }).click();
    await expect(page).toHaveURL(/\/admin\/contactos/);
  });

  test('Mesa de Partes: Aceptar/Rechazar deshabilitados hasta escribir nombre y código', async ({ page }) => {
    await login(page);
    await page.goto('/admin/mesa-de-partes');
    await expect(page.getByRole('columnheader', { name: 'Código de seguimiento' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Detalle' })).toBeVisible();

    const ver = page.getByRole('button', { name: /Ver detalles/ }).first();
    if (!(await ver.count())) {
      test.info().annotations.push({ type: 'note', description: 'No hay trámites para abrir el modal' });
      return;
    }
    await ver.click();
    const aceptar = page.getByRole('button', { name: 'Aceptar Trámite' });
    if (await aceptar.count()) {
      await expect(aceptar).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Rechazar Trámite' })).toBeDisabled();
    } else {
      await expect(page.getByRole('button', { name: /Finalizar Trámite|Trámite Finalizado/ })).toBeVisible();
    }
  });
});
