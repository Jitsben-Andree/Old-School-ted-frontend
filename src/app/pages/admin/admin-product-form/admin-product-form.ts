import { Component, OnInit, inject, signal, computed, effect } from '@angular/core'; // Importar effect
import { CommonModule, CurrencyPipe } from '@angular/common'; // Importar CurrencyPipe
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Categoria } from '../../../models/categoria';
import { ProductService } from '../../../services/product';
import { PromocionService } from '../../../services/promocion'; // << Importar PromocionService
import { ProductoResponse, PromocionSimple } from '../../../models/producto'; // << Importar PromocionSimple
import { Promocion } from '../../../models/promocion'; // << Importar PromocionResponse (para la lista completa)
import { ProductoRequest } from '../../../models/producto-request';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Añadir CurrencyPipe
  templateUrl: './admin-product-form.html',
})
export class AdminProductFormComponent implements OnInit {

  // Servicios
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private promocionService = inject(PromocionService); // << Inyectar PromocionService

  // Estado del componente
  public productForm: FormGroup;
  public categorias = signal<Categoria[]>([]);
  public error = signal<string | null>(null);
  public loading = signal<boolean>(false);
  public loadingPromociones = signal<boolean>(false); // Loading específico para promociones

  // Estado para Edición, Subida de Archivos y Promociones
  public isEditMode = signal<boolean>(false);
  public currentProductId = signal<number | null>(null);
  public currentProduct = signal<ProductoResponse | null>(null); // Guardar producto actual
  public currentProductImageUrl = signal<string | null>(null);
  public selectedFile = signal<File | null>(null);
  public uploadError = signal<string | null>(null);
  public uploadSuccess = signal<string | null>(null);

  // --- NUEVO: Estado para Promociones ---
  public allPromociones = signal<Promocion[]>([]); // Todas las promociones
  public associatedPromocionIds = computed(() => // IDs de las asociadas
     this.currentProduct()?.promocionesAsociadas?.map(p => p.idPromocion) ?? []
  );
  public availablePromociones = computed(() => // Las que NO están asociadas
     this.allPromociones().filter(p => !this.associatedPromocionIds().includes(p.idPromocion))
  );
   // --- FIN NUEVO ---


  public URL = window.URL;

  constructor() {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      descripcion: ['', [Validators.maxLength(500)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      talla: ['M', Validators.required],
      categoriaId: ['', Validators.required],
      activo: [true, Validators.required]
      // Ya no necesitamos el control 'imagen' aquí
    });

     // Effect para cargar promociones cuando entramos en modo edición
     effect(() => {
        if (this.isEditMode() && this.currentProductId() !== null) {
            this.loadAllPromociones(); // Cargar todas las promociones
        } else {
             this.allPromociones.set([]); // Limpiar si salimos de modo edición
        }
     });
  }

  ngOnInit(): void {
    this.loadCategorias();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // --- MODO EDICIÓN ---
        const productId = +id;
        this.isEditMode.set(true);
        this.currentProductId.set(productId);
        this.loadProductData(productId);
        // Las promociones se cargarán por el effect
      } else {
        // --- MODO CREACIÓN ---
        this.isEditMode.set(false);
        this.currentProductId.set(null);
        this.currentProduct.set(null); // Limpiar producto actual
        this.productForm.reset({ talla: 'M', activo: true }); // Resetear formulario
      }
    });
  }

  loadCategorias(): void {
    // ... (sin cambios) ...
     this.productService.getAllCategorias().subscribe({
      next: (data) => this.categorias.set(data),
      error: (err) => this.error.set('Error al cargar categorías.')
    });
  }

   /**
   * Carga TODAS las promociones disponibles (para el dropdown o lista)
   */
  loadAllPromociones(): void {
      this.loadingPromociones.set(true);
      this.promocionService.getAllPromociones().pipe(take(1)).subscribe({
          next: (data) => {
              this.allPromociones.set(data.filter(p => p.activa)); // Solo mostrar activas para asociar
              this.loadingPromociones.set(false);
          },
          error: (err) => {
              console.error("Error al cargar todas las promociones", err);
              this.error.set('Error al cargar promociones disponibles.');
              this.loadingPromociones.set(false);
          }
      });
  }


  loadProductData(id: number): void {
    this.loading.set(true);
    this.productService.getProductoById(id).subscribe({
      next: (product) => {
        this.currentProduct.set(product); // Guardar producto actual
        const categoria = this.categorias().find(c => c.nombre === product.categoriaNombre);

        this.productForm.patchValue({
          nombre: product.nombre,
          descripcion: product.descripcion,
          precio: product.precioOriginal, // <<< Usar precio ORIGINAL para editar
          talla: product.talla,
          categoriaId: categoria ? categoria.idCategoria : '',
          activo: product.activo
        });

        this.currentProductImageUrl.set(product.imageUrl || null);
        this.loading.set(false);
        // El effect cargará las promociones
      },
      error: (err) => {
        this.error.set('Error al cargar el producto.');
        this.loading.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
     // ... (sin cambios) ...
      const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.uploadError.set(null);
      this.uploadSuccess.set(null);
      // Limpiar el valor del input para permitir seleccionar el mismo archivo de nuevo
      input.value = '';
    } else {
       this.selectedFile.set(null);
    }
  }


  onSubmit(): void {
    // ... (Validación inicial sin cambios) ...
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValues = this.productForm.value;
    // Asegurarse de enviar el precio base (original) al crear/actualizar
    const request: ProductoRequest = {
      nombre: formValues.nombre,
      descripcion: formValues.descripcion,
      precio: formValues.precio, // Este es el precio base que el usuario edita
      talla: formValues.talla,
      categoriaId: formValues.categoriaId,
      activo: formValues.activo
    };

    const file = this.selectedFile();

    if (this.isEditMode()) {
      // --- Lógica de ACTUALIZAR (EDITAR) ---
      const id = this.currentProductId();
      if (!id) return;

      this.productService.updateProducto(id, request).subscribe({
        next: (updatedProduct) => {
          this.loading.set(false);
          this.currentProduct.set(updatedProduct); // Actualizar producto actual
          // Si también seleccionó un archivo, lo subimos ahora
          if (file) {
            this.uploadImage(id, file);
          } else {
            alert('¡Producto actualizado con éxito!');
            // No redirigir, quedarse para gestionar promociones
            // this.router.navigate(['/admin/products']);
          }
        },
        error: (err: HttpErrorResponse | Error) => { // Tipado de error
          const message = err instanceof HttpErrorResponse ? err.error?.message || err.message : err.message;
          this.error.set(message || 'Error al actualizar el producto.');
          this.loading.set(false);
        }
      });

    } else {
      // --- Lógica de CREAR ---
      this.productService.createProducto(request).subscribe({
        next: (newProduct) => {
          // ¡Éxito! Ahora redirigimos al modo edición para subir imagen y asociar promos
          alert('Producto creado. Ahora puedes subir una imagen y asignar promociones.');
          this.router.navigate(['/admin/products/edit', newProduct.id]);
          // Ya no subimos la imagen aquí, se hará en modo edición
          // if (file) { this.uploadImage(newProduct.id, file, true); }
        },
        error: (err: HttpErrorResponse | Error) => { // Tipado de error
          const message = err instanceof HttpErrorResponse ? err.error?.message || err.message : err.message;
          this.error.set(message || 'Error al crear el producto.');
          this.loading.set(false);
        }
      });
    }
  }

  uploadImage(productId: number, file: File, isNewProduct: boolean = false): void {
    // ... (Lógica de upload sin cambios, pero quitamos la redirección final) ...
    this.loading.set(true); 
    this.uploadError.set(null);
    this.uploadSuccess.set(null);

    this.productService.uploadProductImage(productId, file).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.uploadSuccess.set(`Imagen subida: ${response.imageUrl}`);
        // Actualizar la URL de la imagen en el producto actual
        this.currentProductImageUrl.set(response.imageUrl);
        this.currentProduct.update(p => p ? {...p, imageUrl: response.imageUrl} : null);
        this.selectedFile.set(null); // Limpiar selección
         // No redirigir
      },
      error: (err: HttpErrorResponse | Error) => { // Tipado de error
        const message = err instanceof HttpErrorResponse ? err.error?.message || err.message : err.message;
        this.uploadError.set(`Error al subir imagen: ${message}`);
        this.loading.set(false);
        this.selectedFile.set(null); // Limpiar selección
         // No redirigir
      }
    });
  }

  // --- NUEVOS MÉTODOS PARA PROMOCIONES ---

  onAssociatePromocion(promocionId: number): void {
      const productId = this.currentProductId();
      if (!productId) return;

      this.loadingPromociones.set(true); // Usar loading específico
      this.error.set(null); // Limpiar error general

      this.productService.associatePromocionToProducto(productId, promocionId)
          .pipe(take(1))
          .subscribe({
              next: () => {
                  // Recargar los datos del producto para actualizar la lista de asociadas
                  this.loadProductData(productId);
                  this.loadingPromociones.set(false);
              },
              error: (err: Error) => {
                  this.error.set("Error al asociar promoción: " + err.message);
                   this.loadingPromociones.set(false);
              }
          });
  }

  onDisassociatePromocion(promocionId: number): void {
      const productId = this.currentProductId();
      if (!productId) return;
       if (!confirm(`¿Seguro que quieres quitar esta promoción del producto?`)) return;


      this.loadingPromociones.set(true);
      this.error.set(null);

      this.productService.disassociatePromocionFromProducto(productId, promocionId)
          .pipe(take(1))
          .subscribe({
              next: () => {
                  // Recargar los datos del producto
                  this.loadProductData(productId);
                   this.loadingPromociones.set(false);
              },
              error: (err: Error) => {
                  this.error.set("Error al desasociar promoción: " + err.message);
                   this.loadingPromociones.set(false);
              }
          });
  }
  // --- FIN NUEVOS MÉTODOS ---

}

