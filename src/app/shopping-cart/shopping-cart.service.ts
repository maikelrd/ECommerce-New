import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, tap, throwError, of } from 'rxjs';
import { IShoppingCart } from './shopping-cart/shopping-cart';
import { IProduct } from '../products/products';


@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {
 private cartUrl = "https://localhost:44386/api/ShoppingCart";
 
  constructor(private http: HttpClient) { 
   
  }

  createCartItem(product:IProduct, userEmail: string): Observable<IShoppingCart>{
    const headers= new HttpHeaders({'Content-type': 'application/json'});
    const cartItem = this.InitializeCartItem(product, userEmail);
   return this.http.post<IShoppingCart>(this.cartUrl, cartItem,{headers})
              .pipe(
                tap(data => console.log('CreateShoppingCartItem' + JSON.stringify(data))),
                catchError(this.handleError)
              );

  }

  private handleError(err:HttpErrorResponse){
    //in a real world app, we may send the server to some remonte loggin infraestructure
    //instead of just logging it to the console
    let errorMessage='';
    if(err.error instanceof ErrorEvent){
      //A client-side or network error occurred. Handle it accordingly.
      errorMessage=`An error occurred: ${err.error.message};`
    }else{
      //The backend returned a unsuccessful responde code.
      //The reponse body may contain clues as to what went wrong,
      errorMessage=`Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return throwError(()=>errorMessage);
}

  private InitializeCartItem(product: IProduct, userEmail: string ): IShoppingCart{
    return{
      ShoppingCartItemId: 0,
      Product: product,
      ProductId: product.ProductId,
      Amount: 1,
      UserEmail: userEmail
    };

  }
}