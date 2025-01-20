import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { Product } from '../interfaces/product.interface';

export interface SuccessResponse<T> {
  message: string;
  data: T;
}

export interface ErrorResponse {
  name: string;
  message: string;
  stack: string;
}

export interface ValidationErrorResponse {
  name: string;
  message: string;
  stack: string;
  errors: Array<ValidationErrorDetail>;
}

export interface ValidationErrorDetail {
  target: Record<string, any>;
  property: string;
  children: any[];
  constraints: Record<string, string>;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly API_URL = '/api/products';

  constructor(private http: HttpClient) {}

  private productSubject: BehaviorSubject<Product | null> =
    new BehaviorSubject<Product | null>(null);

  get product(): Observable<Product | null> {
    return this.productSubject.asObservable();
  }

  set productNextValue(product: Product | null) {
    this.productSubject.next(product);
  }

  getAll(): Observable<SuccessResponse<Product[]> | ErrorResponse> {
    return this.http.get<any>(this.API_URL).pipe(catchError(this.handleError));
  }

  verify(
    id: string
  ): Observable<
    SuccessResponse<Product> | ErrorResponse | ValidationErrorResponse
  > {
    return this.http
      .get<any>(`${this.API_URL}/verification/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(
    product: Product
  ): Observable<
    SuccessResponse<Product> | ErrorResponse | ValidationErrorResponse
  > {
    return this.http
      .post<any>(this.API_URL, product)
      .pipe(catchError(this.handleError));
  }

  update(
    id: string,
    product: Product
  ): Observable<
    SuccessResponse<Product> | ErrorResponse | ValidationErrorResponse
  > {
    return this.http
      .put<any>(`${this.API_URL}/${id}`, product)
      .pipe(catchError(this.handleError));
  }

  delete(
    id: string
  ): Observable<SuccessResponse<{ id: string }> | ErrorResponse> {
    return this.http
      .delete<any>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
