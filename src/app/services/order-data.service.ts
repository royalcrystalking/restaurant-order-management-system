import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { environment } from 'src/environments/environment';
import { OrderDetails } from '../models/order-details.model';
import { Order } from '../models/order.model';
import { HandleLocalStorageService } from './handle-local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class OrderDataService {
  uid: string;

  constructor(
    private http: HttpClient,
    private handleLocalStorageService: HandleLocalStorageService,
    private afdb: AngularFireDatabase
  ) {
    this.uid = this.handleLocalStorageService.getUser();
  }

  // adds item data to Firebase DB
  addOrderData(orderData: any) {
    const orderObj: Order = this.formatOrderData(orderData);

    console.log(orderObj);

    const path =
      environment.firebase.databaseURL + '/orders/' + this.uid + '.json';

    return this.http.post<Order>(path, orderObj);
  }

  formatOrderData(od: any): Order {
    let orderDetailsObj = {};

    for (let key in od) {
      const _obj: OrderDetails = {
        [od[key].id]: {
          itemId: od[key].id,
          name: od[key].name,
          price: od[key].price,
          quantity: od[key].quantity,
        },
      };

      orderDetailsObj = {
        ...orderDetailsObj,
        [od[key].id]: _obj[od[key].id],
      };
    }

    const orderObj: Order = {
      orderId: '',
      orderedItems: orderDetailsObj,
      addedOn: new Date().toLocaleString(),
    };

    return orderObj;
  }

  setOrderId(idParam: string) {
    let orderId = 'order' + idParam;

    const orderRef = this.afdb.object('orders/' + this.uid + '/' + idParam);
    orderRef.update({ orderId: orderId });
  }

  /* async getOrderData() {

  } */
}
