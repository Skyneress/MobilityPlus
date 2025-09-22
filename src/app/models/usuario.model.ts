export interface Usuario {
  Apellido: string;
  Correo: string;
  ID?: string; // Firestore genera este ID automáticamente, por lo que puede ser opcional al crear
  Nombre: string;
  "Numero Celular": string; 
  Rol: 'paciente' | 'profesional';
  Direccion?: string; 
  Edad?: string;
}