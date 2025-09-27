import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from 'src/app/components/shared/navbar.component/navbar.component';
@Component({
  selector: 'app-general-layout',
  standalone: true,               // 🔹 Es standalone
  imports: [RouterModule, NavbarComponent], // 🔹 importa lo que uses en el HTML
  templateUrl: './general.html',
  styleUrls: ['./general.css']     // 🔹 plural y array
})
export class GeneralLayoutComponent {}
