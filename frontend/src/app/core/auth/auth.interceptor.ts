import {
  HttpInterceptorFn
} from '@angular/common/http';

import {
  catchError
} from 'rxjs/operators';

import {
  throwError
} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = sessionStorage.getItem('token');

  // agregar token
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((err) => {

      // token expirado o inválido
      if (err.status === 401 || err.status === 403) {

        sessionStorage.removeItem('token');

        window.location.href = '/admin/login';
      }

      return throwError(() => err);
    })
  );
};