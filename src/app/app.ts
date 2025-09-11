import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgClass, ],
  template: `
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.8s ease-in-out;
      }
    </style>

    <div class="bg-gray-100 min-h-screen flex flex-col font-sans">
      <!-- Navegación -->
      <nav class="bg-[rgb(26,115,232)] shadow-lg p-4 sticky top-0 z-50">
        <div class="max-w-screen-xl mx-auto flex justify-between items-center">
          <a (click)="setView('inicio')" class="cursor-pointer flex items-center space-x-3 rtl:space-x-reverse">
            <h1 class="text-[rgb(173,240,199)]">MobilityPLUS</h1>
          </a>
          <nav>
            <ul class="font-medium flex space-x-4">
              <li>
                <button
                  (click)="setView('inicio')"
                  class="rounded-full px-4 py-2 transition-all duration-300 font-semibold"
                  [ngClass]="{
                     'bg-[rgb(173,240,199)] text-black shadow-lg transform scale-105': currentView() === 'inicio',
      'text-black hover:bg-[rgb(173,240,199)] hover:text-black': currentView() !== 'inicio'
    }"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  (click)="setView('registro-comprador')"
                  class="rounded-full px-4 py-2 transition-all duration-300 font-semibold"
                  [ngClass]="{
                      'bg-[rgb(173,240,199)] text-black shadow-lg transform scale-105': currentView() === 'inicio',
      'text-black hover:bg-[rgb(173,240,199)] hover:text-black': currentView() !== 'inicio'
    }"
                >
                  Paciente
                </button>
              </li>
              <li>
                <button
                  (click)="setView('registro-tienda')"
                  class="rounded-full px-4 py-2 transition-all duration-300 font-semibold"
                  [ngClass]="{
                      'bg-[rgb(173,240,199)] text-black shadow-lg transform scale-105': currentView() === 'inicio',
      'text-black hover:bg-[rgb(173,240,199)] hover:text-black': currentView() !== 'inicio'
    }"
                >
                  Profesional
                </button>
              </li>
              <li>
                <button
                  (click)="setView('contactos')"
                  class="rounded-full px-4 py-2 transition-all duration-300 font-semibold"
                  [ngClass]="{
                      'bg-[rgb(173,240,199)] text-black shadow-lg transform scale-105': currentView() === 'inicio',
      'text-black hover:bg-[rgb(173,240,199)] hover:text-black': currentView() !== 'inicio'
    }"
                >
                  Contactos
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </nav>

      <!-- Contenido Principal -->
      <main class="flex-grow">
        @if (currentView() === 'inicio') {
          <div class="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] bg-white">
            <!-- Sección Izquierda -->
            <div class="lg:w-1/2 p-8 flex flex-col justify-center items-center text-center animate-fadeIn">
              <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-gray-800">
                Encuentra el profesional de la salud que estás buscando
              </h1>
              <p class="text-lg text-gray-600">
                Porque nos preocupamos por tu bienestar, en MobilityPLUS te conectamos con los mejores profesionales de la salud para que recibas la atención que mereces.
              </p>
            </div>
            <!-- Sección Derecha: Icono de MobilityPLUS -->
            <div class="lg:w-1/2 flex items-center justify-center p-8">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" 
     class="size-96 text-[rgb(173,240,199)] drop-shadow-lg fill-current">
  <path d="M192 108.9C192 96.2 199.5 84.7 211.2 79.6L307.2 37.6C315.4 34 324.7 34 332.9 37.6L428.9 79.6C440.5 84.7 448 96.2 448 108.9L448 208C448 278.7 390.7 336 320 336C249.3 336 192 278.7 192 208L192 108.9zM400 192L288.4 192L288 192L240 192L240 208C240 252.2 275.8 288 320 288C364.2 288 400 252.2 400 208L400 192zM304 80L304 96L288 96C283.6 96 280 99.6 280 104L280 120C280 124.4 283.6 128 288 128L304 128L304 144C304 148.4 307.6 152 312 152L328 152C332.4 152 336 148.4 336 144L336 128L352 128C356.4 128 360 124.4 360 120L360 104C360 99.6 356.4 96 352 96L336 96L336 80C336 75.6 332.4 72 328 72L312 72C307.6 72 304 75.6 304 80zM238.6 387C232.1 382.1 223.4 380.8 216 384.2C154.6 412.4 111.9 474.4 111.9 546.3C111.9 562.7 125.2 576 141.6 576L498.2 576C514.6 576 527.9 562.7 527.9 546.3C527.9 474.3 485.2 412.3 423.8 384.2C416.4 380.8 407.7 382.1 401.2 387L334.2 437.2C325.7 443.6 313.9 443.6 305.4 437.2L238.4 387z"/>
</svg>

            </div>
          </div>
          <section class="bg-[rgb(173,240,199)] py-16">
            <div class="max-w-7xl mx-auto px-8">
              <h2 class="text-3xl font-bold text-gray-100 mb-8 text-center">¿Por qué unirse a MobilityPlus?</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Card 1 -->
                <div class="p-6 bg-white rounded-lg shadow-lg transform transition duration-300 hover:scale-105 animate-fadeIn">
                  <div class="mb-4 text-blue-400 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-4 text-center">Aumenta tu visibilidad</h3>
                  <p class="text-gray-600 text-center">Enlistate junto a nuestros profesionales para tener un mayor alcance.</p>
                </div>
                <!-- Card 2 -->
                <div class="p-6 bg-white rounded-lg shadow-lg transform transition duration-300 hover:scale-105 animate-fadeIn">
                  <div class="mb-4 text-blue-400 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-4 text-center">Cuidados a distancia</h3>
                  <p class="text-gray-600 text-center">Contrata el servicio de un profesional de la salud para que cuide a tu familia por ti</p>
                </div>
                <!-- Card 3 -->
                <div class="p-6 bg-white rounded-lg shadow-lg transform transition duration-300 hover:scale-105 animate-fadeIn">
                  <div class="mb-4 text-blue-400 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-4 text-center">Deliverys</h3>
                  <p class="text-gray-600 text-center">Comunicate en tiempo real con nuestros profesionales y registra en tiempo real tus avances y los cuidados de quienes más amas.</p>
                </div>
              </div>
            </div>
          </section>
        } @else if (currentView() === 'registro-comprador') {
          <div class="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] items-center justify-center p-8 bg-gray-50">
            <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 animate-fadeIn">
              <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
                  Regístrate como paciente
                </h1>
                <form class="space-y-4 md:space-y-6" action="#">
                  <div>
                    <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Correo electrónico</label>
                    <input type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500" placeholder="nombre@empresa.com" required>
                  </div>
                  <div>
                    <label for="direccion" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tu dirección</label>
                    <input type="text" name="direccion" id="direccion" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500" placeholder="Ej: tu dirección pasaje 123" required>
                  </div>
                  <div>
                    <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
                    <input type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500" required>
                  </div>
                  <div>
                    <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirmar contraseña</label>
                    <input type="password" name="confirm-password" id="confirm-password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500" required>
                  </div>
                  <div>
                    <label for="phone-number" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Número de teléfono</label>
                    <div class="flex">
                      <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                        +56
                      </span>
                      <input type="tel" name="phone-number" id="phone-number" placeholder="9XXXXXXXX" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500" pattern="[0-9]{9}" required>
                    </div>
                  </div>
                  <div class="grid gap-4 mb-4 sm:grid-cols-2">
                    <div>
                      <label for="nombre" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre</label>
                      <input type="text" name="nombre" id="nombre" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500" placeholder="Escribe tu nombre" required>
                    </div>
                    <div>
                      <label for="apellido" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Apellido</label>
                      <input type="text" name="apellido" id="apellido" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500" placeholder="Escribe tu apellido" required>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input id="terms" aria-describedby="terms" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-red-600 dark:ring-offset-gray-800" required>
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="terms" class="font-light text-gray-500 dark:text-gray-300">Acepto los <a class="font-medium text-red-600 hover:underline dark:text-green-500" href="#">Términos y Condiciones</a></label>
                    </div>
                  </div>
                  <button type="submit"   class="w-full text-black bg-[rgb(173,240,199)] hover:bg-[rgb(153,220,179)] focus:ring-4 focus:outline-none focus:ring-[rgb(133,200,159)] font-medium rounded-lg text-sm px-5 py-2.5 text-center">Crea tu cuenta</button>
                  <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                    ¿Ya tienes una cuenta? <a href="#" class="font-medium text-green-500 hover:underline dark:text-green-400">Inicia sesión aquí</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        } @else if (currentView() === 'registro-tienda') {
          <div class="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] items-center justify-center p-8 bg-gray-50">
            <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 animate-fadeIn">
              <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
                  Regístrate como tienda
                </h1>
                <form class="space-y-4 md:space-y-6" action="#">
                  <div>
                    <label for="store-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre de la Tienda</label>
                    <input type="text" name="store-name" id="store-name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500" placeholder="Ej: Mi Tienda Feliz" required>
                  </div>
                  <div>
                    <label for="store-email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Correo electrónico</label>
                    <input type="email" name="store-email" id="store-email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500" placeholder="nombre@tienda.com" required>
                  </div>
                  <div>
                    <label for="store-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
                    <input type="password" name="store-password" id="store-password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500" required>
                  </div>
                  <button type="submit" class="w-full text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">Crea tu cuenta de tienda</button>
                  <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                    ¿Ya tienes una cuenta? <a href="#" class="font-medium text-red-600 hover:underline dark:text-red-500">Inicia sesión aquí</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        } @else if (currentView() === 'contactos') {
          <div class="min-h-[calc(100vh-6rem)] flex items-center justify-center p-8 bg-gray-50">
            <div class="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl text-center animate-fadeIn">
              <h2 class="text-4xl font-bold text-red-800 mb-4">Página de Contacto</h2>
              <p class="text-lg text-gray-700">Puedes contactarnos a través de los siguientes canales:</p>
              <ul class="mt-4 space-y-2 text-gray-600">
                <li><strong class="text-red-600">Correo:</strong> contacto@MobilityPLUS.cl</li>
                <li><strong class="text-red-600">Teléfono:</strong> +56 9 1234 5678</li>
                <li><strong class="text-red-600">Redes sociales:</strong> @DMobilityPLUSOficial</li>
              </ul>
            </div>
          </div>
        }
      </main>

      <!-- Footer -->
      <footer class="p-4 bg-gray-800 md:p-8 lg:p-10 text-green-300">
        <div class="mx-auto max-w-screen-xl text-center">
            <a href="#" class="flex justify-center items-center text-2xl font-semibold text-white">
                MobilityPLUS
            </a>
            <p class="my-6 text-gray-400">
              Una plataforma de código abierto con elementos interactivos para una mejor experiencia web.
            </p>
            <ul class="flex flex-wrap justify-center items-center mb-6 text-white">
                <li>
                    <a href="#" class="mr-4 hover:underline md:mr-6">Sobre nosotros</a>
                </li>
                <li>
                    <a href="#" class="mr-4 hover:underline md:mr-6">Blog</a>
                </li>
                <li>
                    <a href="#" class="mr-4 hover:underline md:mr-6">Contactos</a>
                </li>
            </ul>
            <span class="text-sm text-gray-400 sm:text-center">© 2024 <a href="#" class="hover:underline">DeliveRed</a>. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  currentView = signal<string>('inicio');

  setView(viewName: string): void {
    this.currentView.set(viewName);
  }
}
