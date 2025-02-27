import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm: FormGroup;

  constructor(private supaService: SupabaseService, private formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('.*@.*')]],
      passwords: this.formBuilder.group({
        password: ['', [Validators.required, Validators.pattern('.*[0-9].*'), this.passwordValidator(8)]],
        password2: ['', [Validators.required, Validators.pattern('.*[0-9].*'), this.passwordValidator(8)]],
      }, {
        validators:
          this.passwordCrossValidator
      })
    }
    );
  }

  get password1NotValid() {
    if (this.registerForm.get('password')?.invalid && this.registerForm.get('password')?.touched)
      return 'is-invalid';
    else if (this.registerForm.get('password')?.touched && this.registerForm.get('password')?.valid) {
      return 'is-valid'
    }
    return ''
  }

  get password2NotValid() {
    if (this.registerForm.get('password2')?.invalid && this.registerForm.get('password2')?.touched)
      return 'is-invalid';
    else if (this.registerForm.get('password2')?.touched) {
      return 'is-valid'
    }
    else return ''
  }


  get crossPasswordsNotValid() {

    if (this.registerForm.get('passwords')?.invalid) return true
    return false
  }

  get emailNotValid() {
    return this.registerForm.get('email')?.invalid && this.registerForm.get('email')?.touched
  }




  passwordValidator(minlength: number): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null => {
      if (c.value) {
        let valid = c.value.length >= minlength && c.value.includes('5')
        return valid ? null : { password: 'no valida' }
      }
      return null;
    };
  }


  passwordCrossValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const ps = control.get('password');
    const ps2 = control.get('password2');
    console.log(ps?.value, ps2?.value);
    return ps && ps2 && ps.value === ps2.value ? null : { passwordCrossValidator: true };
  };


  email: string = '';
  password: string = '';
  error: string | undefined;

  /*
    sendRegister(){
      this.supaService./TODO register/(this.email,this.password).subscribe(
        {next: logindata => console.log(logindata),
          complete: ()=> console.log("complete"),
          error: error =>  this.error = error
         }
      )
    }*/

    sendRegister() {
      console.log("Intentant registrar...");
    
      if (this.registerForm.invalid) {
        console.warn("El formulari no és vàlid!", this.registerForm.value);
        alert("Revisa els camps i torna-ho a intentar!");
        return;
      }
    
      const email = this.registerForm.get('email')?.value;
      const password = this.registerForm.get('passwords.password')?.value;
    
      console.log("Correu electrònic enviat:", email);
      console.log("Contrasenya enviada:", password);
    
      if (!email || !password) {
        console.warn("Falta el correu electrònic o la contrasenya!");
        return;
      }
    
      this.supaService.client.auth.signUp({ email, password })
        .then(({ data, error }) => {
          console.log("Resposta de Supabase:", { data, error });
    
          if (error) {
            console.error("Error en el registre:", error);
            this.error = error.message;
            alert("Error: " + error.message);
          } else {
            console.log("Usuari registrat correctament:", data);
            alert("Registre realitzat amb èxit!");
          }
        })
        .catch(err => {
          console.error("Error inesperat:", err);
          this.error = err.message;
          alert("Error inesperat: " + err.message);
        });
    }
      
}
