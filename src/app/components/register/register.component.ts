import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registrationForm = new FormGroup({
      email: new FormControl(
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ),
      firstName: new FormControl(
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ),
      lastName: new FormControl(
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ),
      login: new FormControl(
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'),
        ],
      ),
      password: new FormControl(
        '',
        Validators.required,
      ),
      passwordConfirmation: new FormControl(
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(255),
        ],
      ),
    },
    RegisterComponent.passwordsMatch,
  );

  constructor(private authService: AuthService) {
  }

  private static passwordsMatch(registrationForm: FormGroup): { [error: string]: boolean } {
    if (registrationForm.value.password !== registrationForm.value.passwordConfirmation) {
      return {'passwords-does-not-match': true};
    }
    return null;
  }

  ngOnInit(): void {
  }

  onRegister(): void {
    if (this.registrationForm.valid) {
      this.authService.register(this.registrationForm.value);
    }
  }
}
