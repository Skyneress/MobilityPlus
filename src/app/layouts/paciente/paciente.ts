import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from 'src/app/components/shared/sidebar/sidebar';



@Component({
  selector: 'app-paciente',
  standalone: true,
  imports: [RouterModule, SidebarComponent],
  templateUrl: './paciente.html',
  styleUrl: './paciente.css'
})
export class Paciente {

}
