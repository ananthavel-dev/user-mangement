import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { catchError, throwError } from 'rxjs';

class User {
  constructor(public id: number, public name: string, public email: string, public password: string) { };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'user-management';
  constructor(private http: HttpClient) { };
  userIdExists = false;
  users: Array<User> = [];
  idField = new FormControl<Number | null>(null);

  registerForm = new FormGroup({
    name: new FormControl(),
    email: new FormControl(),
    password: new FormControl('')
  });

  updateForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl('')
  });

  addUser() {
    this.http.post("http://localhost:3000/posts", this.registerForm.value)
      .subscribe((res) => {
        alert("Users added");
      });
  }

  getUser() {
    if (this.idField.value){
      this.http.get<User>(`http://localhost:3000/posts/${this.idField.value}`)
        .pipe(catchError(this.handleError.bind(this)))
        .subscribe((res) => {
          var {id, ...user} = res;
          this.updateForm.setValue(user);
          this.userIdExists = true;
        });
    }
  }

  handleError(error: HttpErrorResponse) {
    this.updateForm.reset();
    this.userIdExists = false;
    alert(`Invalid user id ${this.idField.value}`)
    return throwError(() => new Error("User not found"));
  }

  updateUser() {
    if(this.userIdExists){
      this.http.put(`http://localhost:3000/posts/${this.idField.value}`, this.updateForm.value)
        .pipe(catchError(this.handleError))
        .subscribe((res) => {
          alert("User details updated...");
        });
    }
  }

  deleteUser(){
    let areYouSure = confirm(`Are you sure to Delete ${this.idField.value} (aka ${this.updateForm.value.name})?`)
    if(this.userIdExists && areYouSure){
      this.http.delete(`http://localhost:3000/posts/${this.idField.value}`)
        .pipe(catchError(this.handleError))
        .subscribe((res) => {
          this.updateForm.reset();
          this.userIdExists = false;
          alert("User Deleted...");
        });
    }
  }

  displayUsers() {
    this.http.get<Array<User>>("http://localhost:3000/posts?_sort=id&_order=asc").subscribe((res)=>{
      this.users = res;
      console.log(this.users)
    })
  }

  putInEdit(res: User) {
    var {id, ...user} = res;
    this.idField.setValue(id);
    this.updateForm.setValue(user);
    this.userIdExists = true;
  }
}
