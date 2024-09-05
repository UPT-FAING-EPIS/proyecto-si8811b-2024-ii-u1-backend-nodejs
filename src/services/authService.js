import puppeteer from 'puppeteer';
import { puppeteerOptions } from '../config/puppeteerConfig.js';
import { ingresarContrasenaTecladoVirtual } from '../utils/keyboardHandler.js';
import { capturarCaptcha } from '../utils/captchaHandler.js';

/**
 * Función para autenticar al usuario en el sistema UPT y verificar dónde está el token de sesión.
 * @param {string} codigo - Código del estudiante.
 * @param {string} contrasena - Contraseña numérica.
 * @param {string} captcha
 */
export async function autenticar(codigo, contrasena, captcha) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // 1. Navegar a la página de login
        await page.goto('https://net.upt.edu.pe/index2.php', { waitUntil: 'networkidle2' });

        // 2. Ingresar el código del estudiante
        await page.waitForSelector('#t1', { visible: true });
        await page.type('#t1', codigo);

        // 3. Habilitar el campo de contraseña haciendo clic en el botón Submit
        await page.click('#Submit');

        // 4. Verificar si el campo de contraseña está habilitado
        await page.waitForSelector('#t2:not([disabled])', { visible: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        // 5. Simular clics en los botones del teclado virtual para la contraseña
        await ingresarContrasenaTecladoVirtual(page, contrasena);

        // 6. Ingresar el CAPTCHA manualmente
        await page.waitForSelector('#kamousagi', { visible: true });
        await page.type('#kamousagi', captcha);

        // 7. Enviar el formulario
        await page.click('#Submit');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // 8. Capturar la URL actual y el contenido de la página
        const currentURL = page.url();
        const pageContent = await page.content();  // Extraer el contenido HTML de la página

        // 9. Obtener cookies de sesión
        const cookies = await page.cookies();
        console.log('Cookies de sesión obtenidas:', cookies);
        console.log('URL actual después de login:', currentURL);
        console.log('Contenido de la página:', pageContent);

    } catch (error) {
        console.error('Error durante la autenticación:', error);
        return null;
    } finally {
        await browser.close();
    }
}