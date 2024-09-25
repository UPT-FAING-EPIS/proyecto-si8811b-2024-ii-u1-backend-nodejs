import * as puppeteer from 'puppeteer';

export const ingresarContrasenaTecladoVirtual = async (page: puppeteer.Page, contrasena: string) => {
    for (const digito of contrasena) {
        console.log(`Ingresando dígito: ${digito}`);
        await page.evaluate((d) => {
            const botones: HTMLElement[] = Array.from(document.querySelectorAll('.btn_cuerpo_login_number'));
            const boton = botones.find(b => b.getAttribute('onclick')?.includes(`setChar('${d}')`));
            if (boton) {
                (boton as HTMLElement).click();
            }
        }, digito);

        // Pausa entre los clics
        await new Promise(resolve => setTimeout(resolve, 500));
    }
};
