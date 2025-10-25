import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // 1. Importar ReactiveForms
import { ProductService } from '../../../services/product';
import { Categoria } from '../../../models/categoria';
import { ProductoRequest } from '../../../models/producto-request';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  // 2. Añadir ReactiveFormsModule y RouterLink
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './admin-product-form.html',
  styleUrls: ['./admin-product-form.css']
})
export class AdminProductFormComponent implements OnInit {

  // --- Inyecciones ---
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // --- Estado (Signals) ---
  public categories = signal<Categoria[]>([]);
  public currentProductId = signal<number | null>(null);
  public isEditMode = computed(() => !!this.currentProductId());
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  // --- Formulario Reactivo ---
  public productForm: FormGroup;

  constructor() {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      talla: ['M', Validators.required], // Valor por defecto 'M'
      activo: [true, Validators.required],
      categoriaId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const categories$ = this.productService.getAllCategorias();

    if (idParam) {
      // --- MODO EDICIÓN ---
      this.currentProductId.set(Number(idParam));
      const product$ = this.productService.getProductoById(Number(idParam));

      // Cargamos categorías y producto en paralelo
      forkJoin({ categories: categories$, product: product$ }).subscribe({
        next: ({ categories, product }) => {
          this.categories.set(categories);
          
          // Encontramos el ID de la categoría basado en el nombre
          const matchingCategory = categories.find(c => c.nombre === product.categoriaNombre);
          
          // Llenamos el formulario con los datos del producto
          this.productForm.patchValue({
            nombre: product.nombre,
            descripcion: product.descripcion,
            precio: product.precio,
            talla: product.talla,
            activo: product.activo,
            categoriaId: matchingCategory?.idCategoria ?? null
          });
          this.isLoading.set(false);
        },
        error: (err) => this.handleError(err)
      });
    } else {
      // --- MODO CREACIÓN ---
      categories$.subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.isLoading.set(false);
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched(); // Marcar todos los campos si hay error
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    const formValue: ProductoRequest = this.productForm.value;

    if (this.isEditMode()) {
      // --- Lógica de Actualización ---
      this.productService.updateProducto(this.currentProductId()!, formValue).subscribe({
        next: () => this.router.navigate(['/admin/products']),
        error: (err) => this.handleError(err)
      });
    } else {
      // --- Lógica de Creación ---
      this.productService.createProducto(formValue).subscribe({
        next: () => this.router.navigate(['/admin/products']),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    this.error.set(err.message || 'Ocurrió un error desconocido.');
    this.isLoading.set(false);
  }
}
