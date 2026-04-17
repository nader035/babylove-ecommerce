import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../models/iorder';
import { environment } from '../../../environments/environment';

export interface PlaceOrderPayload {
  userId: number | string;
  addressId: number | string;
  items: { skuId: number | string; quantity: number }[];
  paymentMethod: string;
  shippingInfo: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  placeOrder(payload: PlaceOrderPayload): Observable<Order> {
    const order: Partial<Order> = {
      status: 'pending',
      trackingCode: null,
      addressId: payload.addressId,
      userId: payload.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.http.post<Order>(environment.ordersApi, order);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(environment.ordersApi);
  }

  getOrderById(id: number | string): Observable<Order> {
    return this.http.get<Order>(`${environment.ordersApi}/${encodeURIComponent(String(id))}`);
  }
}
