import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // 1. Importar RouterOutlet
import { Navbar } from './components/navbar/navbar';
import { FooterComponent } from "./components/footer/footer"; // 2. Importar Navbar

@Component({
  selector: 'app-root',
  standalone: true,
  // 3. Añadirlos a los 'imports'
  imports: [RouterOutlet, Navbar, Navbar, FooterComponent], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'oldschool-tees-frontend';
}
