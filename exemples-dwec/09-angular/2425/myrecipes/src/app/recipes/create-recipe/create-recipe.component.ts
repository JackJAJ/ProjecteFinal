import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-create-recipe',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-recipe.component.html',
  styleUrl: './create-recipe.component.css',
})
export class CreateRecipeComponent implements OnInit {
[x: string]: any;
  @Input('id') recipeID?: string;
  mealForm: FormGroup;

  constructor(
    private supaService: SupabaseService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router 
  ) {
    this.mealForm = this.formBuilder.group({
      strMeal: ['', [Validators.required]],
      strInstructions: ['', [Validators.required]],
      ingredients: this.formBuilder.array([]),
    });
  }

  get strMealValid() {
    return (
      this.mealForm.get('strMeal')?.valid &&
      this.mealForm.get('strMeal')?.touched
    );
  }

  ngOnInit(): void {

    if (!this.recipeID) {
      const idFromRoute = this.route.snapshot.paramMap.get('id');
      this.recipeID = idFromRoute ? idFromRoute : undefined;
    }

    if (this.recipeID) {
      // falta demanar tots els ingredients (id, nom)
      this.supaService.getMeals(this.recipeID).subscribe({
        next: (meals) => {
          this.mealForm.reset(meals[0]);
          meals[0].idIngredients.forEach(i=>{
            if(i){
              (<FormArray>this.mealForm.get('ingredients')).push(
                this.generateIngredientControl(i)
             )
            }
          })
     
        },
        error: (err) => console.log(err),
        complete: () => console.log('Received'),
      });
    }
    

  }

  getIngredientControl(): FormControl {
    const control = this.formBuilder.control('');
    control.setValidators(Validators.required);
    return control;
  }

  generateIngredientControl(id: string): FormControl {
    const control = this.formBuilder.control(id);
    control.setValidators(Validators.required);
    return control;
  }

  get IngredientsArray(): FormArray {
    return <FormArray>this.mealForm.get('ingredients');
  }

  addIngredient() {
    (<FormArray>this.mealForm.get('ingredients')).push(
      this.getIngredientControl()
    );
  }
  delIngredient(i: number) {   
    (<FormArray>this.mealForm.get('ingredients')).removeAt(i);
  }

  async submitRecipe() {
    if (this.mealForm.invalid) {
      alert("Please fill in all fields.");
      return;
    }
  
    const recipeData: any = {
      idMeal: this.recipeID || undefined,
      strMeal: this.mealForm.value.strMeal,
      strInstructions: this.mealForm.value.strInstructions,
      idIngredients: this.mealForm.value.ingredients
    };
  
    try {
      if (this.recipeID) {
        await this.supaService.deleteRemovedIngredients(this.recipeID, recipeData.idIngredients);

        await this.supaService.updateRecipe(this.recipeID, recipeData);
        alert("Recipe updated successfully!");
      } else {
        await this.supaService.addRecipe(recipeData);
        alert("Recipe created successfully!");
        this.mealForm.reset();
      }
  
      this.router.navigate(['/table']);
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Error saving recipe.");
    }
  }
  
}
