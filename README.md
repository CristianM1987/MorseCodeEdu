# Traductor de Código Morse

Una aplicación web moderna e interactiva para aprender, practicar y traducir código Morse utilizando únicamente los clics del ratón.

## 🚀 Características

- **Traductor en tiempo real:** Haz clic en cualquier parte de la pantalla. Los clics cortos se interpretan como puntos (`.`) y los largos como rayas (`-`).
- **Feedback Auditivo:** Un tono constante te indicará la duración de tu pulsación.
- **Diccionario Visual:** Una guía rápida con el abecedario y los números junto a sus representaciones en código Morse.
- **Modo Ejercicios:** Un modo de juego para poner a prueba tus habilidades escribiendo caracteres aleatorios.
- **Acciones Rápidas:** Botones para deshacer el último carácter y para limpiar toda la pantalla rápidamente.
- **Diseño Moderno:** Interfaz estilizada usando el patrón *Glassmorphism* y un tema oscuro.

## 🖱️ Cómo usar los tiempos

El programa analiza la duración de tus clics para saber qué estás escribiendo:

*   **Punto (`.`):** Clic muy rápido (menos de 250ms).
*   **Raya (`-`):** Mantener el clic un instante (más de 250ms).
*   **Nueva letra:** Dejar de hacer clic durante más de 600ms.
*   **Nueva palabra (espacio):** Dejar de hacer clic durante más de 1.4 segundos.

## 🛠️ Tecnologías

- **HTML5:** Estructura de la aplicación.
- **CSS3:** Estilos, grid, flexbox y animaciones.
- **JavaScript (ES6):** Lógica de traducción, control de eventos del ratón y la *Web Audio API*.
- **Electron:** Empaquetado para escritorio (Windows).

## 📦 Ejecución Local

### Versión Web
No requieres instalación. Simplemente abre el archivo `index.html` en cualquier navegador web moderno.

### Versión Escritorio (Desarrollo)
Si quieres compilar o ejecutar el código como aplicación de escritorio, necesitas tener [Node.js](https://nodejs.org/) instalado.

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia la aplicación en modo desarrollo:
   ```bash
   npm start
   ```
3. Compila el ejecutable `.exe` para Windows:
   ```bash
   npm run build
   ```
   *El ejecutable generado se ubicará en la carpeta `dist/`.*
