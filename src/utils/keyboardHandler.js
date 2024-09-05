/**
 * Función para interactuar con el teclado virtual en la página de login.
 * @param {object} page - Instancia de Puppeteer page
 * @param {string} contrasena - Contraseña numérica del usuario
 */
export async function ingresarContrasenaTecladoVirtual(page, contrasena) {
    for (const digito of contrasena) {
        console.log(`Ingresando dígito: ${digito}`);
        await page.evaluate((d) => {
            const botones = Array.from(document.querySelectorAll('.btn_cuerpo_login_number'));
            const boton = botones.find(b => b.getAttribute('onclick').includes(`setChar('${d}')`));
            if (boton) {
                boton.click();
            }
        }, digito);
        await new Promise(resolve => setTimeout(resolve, 500));  // Pausa de 500 ms entre clics
    }
}