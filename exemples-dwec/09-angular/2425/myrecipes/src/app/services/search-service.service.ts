import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchServiceService {
  searchSubject = new BehaviorSubject<string>('');
  searchResults = new BehaviorSubject<any[]>([]); 

  constructor(private supaService: SupabaseService) {
    this.searchSubject.subscribe((searchTerm) => {
      if (searchTerm.trim().length > 0) {
        this.fetchSearchResults(searchTerm).then((results) => {
          this.searchResults.next(results);
        });
      } else {
        this.searchResults.next([]); 
      }
    });
  }

  get searchResults$(): Observable<any[]> {
    return this.searchResults.asObservable();
  }

  setSearchTerm(term: string) {
    this.searchSubject.next(term);
  }

  private async fetchSearchResults(searchTerm: string): Promise<any[]> {
    try {
      return await this.supaService.searchMeals(searchTerm);
    } catch (error) {
      console.error('Error fetching search results:', error);
      return [];
    }
  }
}