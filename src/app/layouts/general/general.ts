import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from 'src/app/components/shared/navbar.component/navbar.component';
import { Footer } from "src/app/components/shared/footer/footer";
@Component({
  selector: 'app-general-layout',
  standalone: true,               // 
  imports: [RouterModule, NavbarComponent, Footer], //
  templateUrl: './general.html',
  styleUrls: ['./general.css']    
})
export class GeneralLayoutComponent {}
