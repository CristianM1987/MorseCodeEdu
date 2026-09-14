const crypto = require('crypto');

/**
 * Generador de Licencias para el Traductor de Código Morse
 * 
 * Uso: node license_generator.js
 */

function generateLicense() {
    // Generar 10 caracteres aleatorios en formato base36
    const randomStr1 = Math.random().toString(36).substring(2, 7).toUpperCase();
    const randomStr2 = Math.random().toString(36).substring(2, 7).toUpperCase();
    
    // Formato MORSE-XXXXX-XXXXX
    // Coincide con la validación Regex en script.js: /^MORSE-[A-Z0-9]{5}-[A-Z0-9]{5}$/
    const licenseKey = `MORSE-${randomStr1}-${randomStr2}`;
    
    console.log('====================================');
    console.log('¡NUEVA LICENCIA COMERCIAL GENERADA!');
    console.log('====================================');
    console.log(`Clave a entregar: ${licenseKey}`);
    console.log('====================================');
    console.log('Puedes enviarle este código a la persona o institución');
    console.log('que colaboró en tu Cafecito para que desbloquee la app.');
}

generateLicense();
