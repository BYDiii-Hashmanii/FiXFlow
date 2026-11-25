import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../config/environment';
import { ApiResponse } from './api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  /**
   * Performs an HTTP GET request and unwraps data from ApiResponse<T>
   */
  get<T>(path: string, params?: Record<string, string | number | boolean | null | undefined>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`, { params: httpParams }).pipe(
      map(res => res.data)
    );
  }

  /**
   * Performs an HTTP POST request and unwraps data from ApiResponse<T>
   */
  post<T>(path: string, body: object): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body).pipe(
      map(res => res.data)
    );
  }

  /**
   * Performs an HTTP PUT request and unwraps data from ApiResponse<T>
   */
  put<T>(path: string, body: object): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${path}`, body).pipe(
      map(res => res.data)
    );
  }

  /**
   * Performs an HTTP PATCH request and unwraps data from ApiResponse<T>
   */
  patch<T>(path: string, body: object): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${path}`, body).pipe(
      map(res => res.data)
    );
  }

  /**
   * Performs an HTTP DELETE request and unwraps data from ApiResponse<T>
   */
  delete<T>(path: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${path}`).pipe(
      map(res => res.data)
    );
  }

  /**
   * Performs a multipart/form-data POST request for image/file uploads
   */
  upload<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, formData).pipe(
      map(res => res.data)
    );
  }
}
