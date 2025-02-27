import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchServiceService } from '../../services/search-service.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterModule, RouterLink, RouterLinkActive, ReactiveFormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  logged: boolean = false;

  searchForm : FormGroup;

  constructor(
    private supaService: SupabaseService,
    private formBuilder: FormBuilder,
    private searchService: SearchServiceService,
    private router: Router
  ){
    this.searchForm = this.formBuilder.group({
      searchInput: [''],
    });
  }


  ngOnInit(): void {
   // this.logged =  this.supaService.loggedSubject.getValue();
    this.supaService.loggedSubject.subscribe(logged => this.logged = logged);
    this.supaService.isLogged();

    this.searchForm.get('searchInput')?.valueChanges.
    pipe(
      debounceTime(1000)
    )
    .subscribe(this.searchService.searchSubject)

  }

  async logout() {
    this.supaService.logout().subscribe({
      next: () => {
        this.logged = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error("Logout error:", err.message);
        alert("Error logging out.");
      }
    });
  }
  

}
