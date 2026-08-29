import { CanDeactivateFn } from '@angular/router';

export interface PuedeSalirConCambios {
  dirty: () => boolean;
  confirmarSalida: () => Promise<boolean>;
}

export const salirConCambios: CanDeactivateFn<PuedeSalirConCambios> = (component) => {
  if (!component.dirty()) return true;
  return component.confirmarSalida();
};
