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

        const sessionMatch = currentURL.match(/sesion=([^&]+)/);
        const sessionToken = sessionMatch ? sessionMatch[1] : null;

        if (!sessionToken) {
            throw new Error('No se encontró el parámetro de sesión en la URL');
        }

        const cookies = await page.cookies();
        console.log('Cookies de sesión:', cookies);

        // Devolver datos mediante JSON
        return { cookies, sessionToken, page };

    } catch (error) {
        console.error('Error durante autenticación:', error);
        await browser.close();
        return null;
    }
};

export const autenticarYExtraerHorario = async (codigo: string, contrasena: string) => {
    const authResult = await autenticar(codigo, contrasena);
    if (!authResult) return null;

    const { page, cookies, sessionToken } = authResult;

    try {
        const horarioURL = `https://net.upt.edu.pe/alumno.php?mihorario=1&sesion=${sessionToken}`;
        await page.setCookie(...cookies);
        await page.goto(horarioURL, { waitUntil: 'networkidle2' });
        console.log('Navegación a la página de horarios completada');

        if (!page.url().includes(`mihorario=1&sesion=${sessionToken}`)) {
            throw new Error('No se llegó a la URL de la página de horarios con sesión.');
        }

        await page.waitForSelector('table[border="1"][align="center"]', { timeout: 20000 });
        console.log('Tabla de horarios encontrada, extrayendo datos');

        // Extraer datos de horarios
        const horarios = await page.evaluate(() => {
            const table = document.querySelector('table[border="1"][align="center"]');
            if (!table) return [];

            const rows = Array.from(table.querySelectorAll('tbody tr'));
            return rows.map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length === 0) return null;

                const courseData = {
                    code: cells[0]?.textContent?.trim() || '',
                    name: cells[1]?.textContent?.trim() || '',
                    section: cells[2]?.textContent?.trim() || '',
                    schedule: {}
                };

                const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
                for (let i = 3; i < cells.length; i++) {
                    const timeSlot = cells[i]?.textContent?.trim();
                    if (timeSlot !== '') {
                        courseData.schedule[days[i-3]] = timeSlot.split('\n');
                    }
                }

                return courseData;
            }).filter(Boolean);
        });

        await page.close();
        await page.browser().close();

        return { horarios, cookies };

    } catch (error) {
        console.error('Error durante la extracción de horarios:', error);

        if (!page.isClosed()) {
            await page.close();
        }
        await page.browser().close();

        return null;
    }
};


// Extraer Asistencias de Cursos
export const autenticarYExtraerAsistencias = async (codigo: string, contrasena: string) => {
    const authResult = await autenticar(codigo, contrasena);
    if (!authResult) return null;

    const { page, cookies, sessionToken } = authResult;

    try {
        const asistenciaURL = `https://net.upt.edu.pe/alumno.php?asistencias=1&sesion=${sessionToken}`;
        await page.setCookie(...cookies);
        await page.goto(asistenciaURL, { waitUntil: 'networkidle2' });
        console.log('Navegación a la página de asistencias completada');

        if (!page.url().includes(`asistencias=1&sesion=${sessionToken}`)) {
            throw new Error('No se llegó a la URL de la página de asistencias con sesión.');
        }

        await page.waitForSelector('#div_h2c', { timeout: 20000 });
        console.log('Selector #div_h2c encontrado, extrayendo datos de asistencias');

        // Extraer datos de asistencias
        const asistencias = await page.evaluate(() => {
            const contenedorAsistencias = document.querySelector('#div_h2c');
            if (!contenedorAsistencias) return [];

            const cursos = Array.from(contenedorAsistencias.querySelectorAll('li'));
            return cursos.map(curso => {
                const nombreCurso = curso.querySelector('strong')?.innerText || '';

                // Búsqueda de la tabla correspondiente
                let tabla = curso.nextElementSibling;
                while (tabla && !tabla.querySelector('table')) {
                    tabla = tabla.nextElementSibling;
                }
                
                if (!tabla || !tabla.querySelector('table')) {
                    console.log(`No se encontró una tabla para el curso: ${nombreCurso}`);
                    return { curso: nombreCurso, asistencias: [] };
                }

                const filas = Array.from(tabla.querySelectorAll('tr'));
                if (filas.length < 3) {
                    console.log(`Estructura de tabla inesperada en el curso: ${nombreCurso}`);
                    return { curso: nombreCurso, asistencias: [] };
                }

                const fechas = Array.from(filas[0].querySelectorAll('th')).slice(1).map(th => th.innerText.trim());
                const dias = Array.from(filas[1].querySelectorAll('td')).slice(1).map(td => td.innerText.trim());
                const estados = Array.from(filas[2].querySelectorAll('td')).slice(1).map(td => td.innerText.trim());

                const registros = fechas.map((fecha, index) => ({
                    fecha,
                    dia: dias[index] || '',
                    estado: estados[index] || ''
                })).filter(reg => reg.fecha && reg.dia && reg.estado); 

                return {
                    curso: nombreCurso,
                    asistencias: registros
                };
            });
        });

        await page.close();
        await page.browser().close();

        return { asistencias, cookies };

    } catch (error) {
        console.error('Error durante la extracción de asistencias:', error);

        if (!page.isClosed()) {
            await page.close();
        }
        await page.browser().close();

        return null;
    }
};
