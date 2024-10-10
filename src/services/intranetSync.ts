import puppeteer from 'puppeteer';
import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { ingresarContrasenaTecladoVirtual } from '../utils/keyboardHandler';
import { puppeteerOptions } from '../config/puppeteerConfig';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const autenticar = async (codigo: string, contrasena: string) => {
    const browser = await puppeteer.launch({
        ...puppeteerOptions,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();

    const tempDir = './temp';
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    try {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

        const waitForPageStability = async () => {
            await page.waitForFunction(() => {
                return document.readyState === 'complete' && !document.querySelector('img[src*="loading"]');
            }, { timeout: 30000 });
        };

        await page.goto('https://net.upt.edu.pe/index2.php', { waitUntil: 'networkidle0' });
        await waitForPageStability();

        // Ingresar el código del usuario mediante teclado virtual
        await page.type('#t1', codigo);
        await page.click('#Submit');
        await page.waitForSelector('#t2:not([disabled])', { visible: true, timeout: 30000 });
        await waitForPageStability();

        const procesarCaptcha = async () => {
            await page.waitForSelector('img[src="imagen.php"]', { visible: true, timeout: 60000 });
            const captchaElement = await page.$('img[src="imagen.php"]');
            if (!captchaElement) throw new Error('Captcha no encontrado en la página.');

            const captchaPath = path.join(tempDir, 'captcha.png');
            await captchaElement.screenshot({ path: captchaPath });

            const { data: { text } } = await Tesseract.recognize(captchaPath, 'eng', { logger: m => console.log(m) });

            // Eliminar la imagen temporal
            fs.unlinkSync(captchaPath);
            return text.trim().replace(/\s/g, '');
        };

        const captcha = await procesarCaptcha();
        console.log(`Captcha reconocido: ${captcha}`);

        // Ingresar la contraseña mediante teclado virtual
        await ingresarContrasenaTecladoVirtual(page, contrasena);
        await wait(1000);

        // Ingresar el captcha en el campo correspondiente
        await page.evaluate((captchaText) => {
            const kamousagiInput = document.querySelector('#kamousagi') as HTMLInputElement;
            if (kamousagiInput) {
                kamousagiInput.value = captchaText;
            } else {
                console.error('No se encontró el elemento #kamousagi');
            }
        }, captcha);

        await wait(1000);

        // Verificar que todos los campos estén completos antes de enviar el formulario
        const camposCompletos = await page.evaluate(() => {
            const codigo = (document.querySelector('#t1') as HTMLInputElement)?.value;
            const contrasena = (document.querySelector('#t2') as HTMLInputElement)?.value;
            const captcha = (document.querySelector('#kamousagi') as HTMLInputElement)?.value;
            console.log(`Codigo: ${codigo}`, `Contraseña: ${contrasena}`, `Captcha: ${captcha}`);
            return codigo && contrasena && captcha;
        });

        if (!camposCompletos) {
            throw new Error('No todos los campos están completos antes de enviar el formulario.');
        }

        // Enviar el formulario
        await page.evaluate(() => {
            const form = document.querySelector('form') as HTMLFormElement;
            if (form) {
                form.submit();
            } else {
                console.error('No se encontró el formulario');
            }
        });

        // Esperar la primera navegación
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
        await waitForPageStability(); // Asegurarse de que la página esté estable

        // Verificar si hay un segundo redireccionamiento
        const secondForm = await page.$('form[name="frmloginb"]');
        if (secondForm) {
            console.log('Se encontró el formulario para redireccionamiento, esperando el redireccionamiento automático...');
            await page.evaluate(() => {
                document.forms['frmloginb'].submit();
            });

            // Esperar la segunda navegación
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
            await waitForPageStability(); // Asegurarse de que la página esté estable
        }

        const currentURL = page.url();
        console.log('URL después de enviar el formulario:', currentURL);

        if (!currentURL.includes('inicio.php')) {
            const content = await page.content();
            console.log('Contenido de la página de error:', content);
            throw new Error('Error durante la navegación, no se llegó a la página esperada.');
        }

        const cookies = await page.cookies();
        console.log('Cookies de sesión:', cookies);

        // Devolver datos mediante JSON
        return { cookies, currentURL };

    } catch (error) {
        console.error('Error durante autenticación:', error);
        return null;
    } finally {
        await browser.close();
    }
};

export const autenticarYExtraerHorario = async (codigo: string, contrasena: string) => {
    // Navegar a la página de horarios.
    // Extraer datos del horario en un formato estructurado.
    
    const horarios = []; 
    const cookies = [];  

    return { horarios, cookies };
};


export const autenticarYExtraerAsistencias = async (codigo: string, contrasena: string) => {
    // Navegar a la página de asistencias.
    // Extraer datos de asistencias en un formato estructurado.

    const asistencias = []; 
    const cookies = [];     

    return { asistencias, cookies };
};


export const autenticarYExtraerCreditos = async (codigo: string, contrasena: string) => {
    // Navegar a la página de créditos acumulados.
    // Extraer los datos de créditos en un formato estructurado.

    const creditos = 0; 
    const cookies = [];  

    return { creditos, cookies };
};

