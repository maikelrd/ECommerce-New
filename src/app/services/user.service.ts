import { Injectable } from '@angular/core';
import { HttpClient,HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable,throwError,  of, BehaviorSubject, catchError,tap, Subject} from 'rxjs';
import { } from 'rxjs/operators';
import { UserAuthBase } from '../Models/user-auth-base';
import { UserBase } from '../Models/user-base';
import { IProduct } from '../products/products';
import { User } from '../Models/user';
import { subscriptionLogsToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { Router } from '@angular/router';

import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';




@Injectable({
  providedIn: 'root'
})
export class UserService {
  securityObject:UserAuthBase=new UserAuthBase();
  private hasChanged= new BehaviorSubject<number>(0);
  private  url:string=""
  private refreshTokenUrl = "https://localhost:44386/api/Users/RefreshToken";

  private securityObject$: Subject<UserAuthBase|undefined>

  constructor(private http:HttpClient, private router: Router, private shoppingCartService: ShoppingCartService) {
    this.securityObject$ = new Subject();
  }



  public register(firstName:string|null,lastName:string|null,email:string|null, password:string|null, isAdmin: boolean|null): Observable<any>{
    const body={
      FirstName:firstName,
      LastName: lastName,
      Email:email,
      Password:password
    }
    const headers= new HttpHeaders({'Content-type': 'application/json'});
   // return this.httpClient.post("https://localhost:44305/api/user/RegisterUser",body).pipe(
    
   // return this.http.post("https://localhost:44386/api/users/RegisterUser",body,{headers}).pipe(
    if(!isAdmin){
     this.url= "https://localhost:44386/api/Users/RegisterUser"
    }else{
      this.url = "https://localhost:44386/api/Users/register-admin"
    }
    return this.http.post(this.url,body,{headers}).pipe(
      tap(resp=>{
       
          //Use object assign to update the current object
          //NOTE: Don't create a new AppUserAuth object
          //      because that destroys all reference to object
          console.log("user registered");  
         // this.hasChanged.next(0);
       
      },Error=>{
        console.log("Error", console.error);       
       
      })

    )
  }

  public login(email:string, password:string):Observable<any>{
    const body={
      Email:email,
      Password:password
    }
    const headers= new HttpHeaders({'Content-type': 'application/json'});
    //return this.http.post("https://localhost:44386/api/Security/Login",body).pipe(
      return this.http.post("https://localhost:44386/api/Users/Login",body).pipe(
      tap(resp=>{
       
          //Use object assign to update the current object
          //NOTE: Don't create a new AppUserAuth object
          //      because that destroys all reference to object
         
          Object.assign(this.securityObject,resp);
          //adding this below in order to show the user in appcomponent.html
          this.securityObject$.next(this.securityObject);
          //Inform everyone that a new login has occurred
          this.hasChanged.next(0);
       
      },Error=>{
        console.log("Error", console.error);       
       
      })
    )  
  }

  getSecurityObjetct(): Observable<UserAuthBase|undefined>{
    return this.securityObject$.asObservable();
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

 

  GenerateRefreshToken() {
    let input = {
      "Token": this.GetToken(),
      "RefreshToken": this.GetRefreshToken()
    }
    return this.http.post(this.refreshTokenUrl, input) .pipe(
      tap(resp=>{
          this.SaveTokens(resp);
          console.log(resp);
       
      },Error=>{
        console.log("Error", console.error);       
       
      })
    ) ; 
  }

  GetToken() {    
    return localStorage.getItem("token") || '';
  }
  GetRefreshToken() {
    return localStorage.getItem("refreshtoken") || '';
  }

  SaveTokens(tokendata: any) {
    localStorage.setItem('token', tokendata.Token);
    localStorage.setItem('refreshtoken', tokendata.RefreshToken);
  }

  logOut():void{
    this.securityObject.init(); 
  
      //Inform everyone the security object has changed
      this.hasChanged.next(0);
    
      let temp=this.GetToken();
      if(temp == ''){
        alert('Your session expired');
      }
      
     /*  localStorage.removeItem("AuthObject");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshtoken");*/
    localStorage.clear(); 
    this.shoppingCartService.totalCartItem(0);
    this.router.navigateByUrl('/login');
  }

}
