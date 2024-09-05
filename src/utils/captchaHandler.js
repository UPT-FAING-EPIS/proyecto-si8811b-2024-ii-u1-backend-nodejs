import fs from 'fs';

/**
 * Función para manejar la imagen del CAPTCHA, toma una captura de pantalla del CAPTCHA.
 * Puede extenderse para usar servicios como 2Captcha.
 * @param {object} page - Instancia de Puppeteer page
 */
export async function capturarCaptcha(page) {
    const captchaImage = await page.$('img[src="imagen.php"]');  // Selecciona la imagen del CAPTCHA
    await captchaImage.screenshot({ path: 'captcha.png' });  // Guarda la imagen del CAPTCHA
    console.log('CAPTCHA guardado como captcha.png');
}
