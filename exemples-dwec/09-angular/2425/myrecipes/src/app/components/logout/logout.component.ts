import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent {
  constructor(private authService: AuthService) {}

  async logout() {
    try {
      await this.authService.signOut();
      alert('Sessió tancada correctament!');
    } catch (error) {
      console.error('Error en tancar sessió:', error);
      alert('Error en eixir de sessió.');
    }
  }
}
