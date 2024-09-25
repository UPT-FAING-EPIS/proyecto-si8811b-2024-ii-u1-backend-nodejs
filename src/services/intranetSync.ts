import puppeteer from 'puppeteer';
import Tesseract from 'tesseract.js';
import fs from 'fs';
import { ingresarContrasenaTecladoVirtual } from '../utils/keyboardHandler';
import { puppeteerOptions } from '../config/puppeteerConfig'; // Config opcional para puppeteer


export const autenticar = async (codigo: string, contrasena: string) => {
    const browser = await puppeteer.launch(puppeteerOptions); // O headless: false si deseas ver el proceso
    const page = await browser.newPage();
    try {
        // Navegar al login de la Intranet
        await page.goto('https://net.upt.edu.pe/index2.php', { waitUntil: 'networkidle2' });

        // Ingresar el código del usuario
        await page.type('#t1', codigo);
        await page.click('#Submit');
        await page.waitForSelector('#t2:not([disabled])', { visible: true });

        // Esperar a que la imagen del captcha esté visible
        await page.waitForSelector('img[src="imagen.php"]', { visible: true, timeout: 60000 });

        // Seleccionar la imagen del captcha
        const captchaImage = await page.$('img[src="imagen.php"]');

        if (captchaImage) {
            const captchaSrc = await captchaImage.getProperty('src');
            const captchaURL = await captchaSrc.jsonValue();

            if (captchaURL) {
                const captchaPath = './captcha.png';
                const captchaURL = await captchaSrc.jsonValue();

                // Si la URL ya contiene "https://", no concatenamos el dominio
                const captchaFullURL = captchaURL.startsWith('http') ? captchaURL : `https://net.upt.edu.pe/${captchaURL}`;

                console.log(`Captcha URL: ${captchaFullURL}`);

                // Descargar la imagen del captcha
                const viewSource = await page.goto(captchaFullURL, { waitUntil: 'networkidle2' });

                if (viewSource && viewSource.ok()) {
                    const buffer = await viewSource.buffer();
                    fs.writeFileSync(captchaPath, buffer);

                    // Usar OCR para leer el captcha
                    const { data: { text } } = await Tesseract.recognize(captchaPath, 'eng', { logger: m => console.log(m) });

                    // Limpiar el texto del captcha
                    const captcha = text.trim().replace(/\s/g, '');
                    console.log(`Captcha reconocido: ${captcha}`);

                    // Ingresar la contraseña usando el teclado virtual
                    await ingresarContrasenaTecladoVirtual(page, contrasena);

                    // Pausa antes de ingresar el captcha para simular comportamiento humano
                    await new Promise(resolve => setTimeout(resolve, 2000));  // Espera 2 segundos  // Espera 2 segundos

                    // Ingresar el captcha reconocido automáticamente
                    await page.type('#kamousagi', captcha);

                    // Pausa antes de enviar el formulario
                    await new Promise(resolve => setTimeout(resolve, 2000));  // Espera 2 segundos

                    // Enviar el formulario usando JavaScript directamente
                    await page.evaluate(() => {
                        document.querySelector('form').submit();
                    });

                    // Espera la navegación después del envío
                    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

                    // Verificar si se navega a la página correcta
                    const currentURL = page.url();
                    console.log('URL después de enviar el formulario:', currentURL);

                    if (!currentURL.includes('inicio.php')) {  // Ajusta según la URL esperada después del login exitoso
                        console.error('Error durante la navegación, no se llegó a la página esperada.');
                        return null;
                    }

                    // Capturar la URL y las cookies de sesión
                    const cookies = await page.cookies();
                    console.log('Cookies de sesión:', cookies);
                    return { cookies, currentURL };
                } else {
                    console.error('Error al descargar la imagen del captcha.');
                    return null;
                }
            } else {
                console.error('No se pudo obtener la URL del captcha.');
                return null;
            }
        } else {
            console.error('Captcha no encontrado en la página.');
            return null;
        }
    } catch (error) {
        console.error('Error durante autenticación:', error);
        return null;
    } finally {
        await browser.close();
    }
};
