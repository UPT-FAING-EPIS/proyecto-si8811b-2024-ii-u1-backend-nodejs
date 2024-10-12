import * as puppeteer from 'puppeteer';

export const ingresarContrasenaTecladoVirtual = async (page: puppeteer.Page, contrasena: string) => {
    for (const digito of contrasena) {
        console.log('Ingresando dígito: ${digito}');

        // Evaluar el dígito en la página
        const resultado = await page.evaluate((d) => {
            // Buscar todos los botones que contienen números
            const botones = Array.from(document.querySelectorAll('.btn_cuerpo_login_number'));
            const boton = botones.find(b => b.textContent?.trim() === d);

            // Verifica si encontró el botón correspondiente al texto
            if (boton) {
                (boton as HTMLElement).click();
                return 'Clic en el botón para el dígito ${d} fue exitoso.';
            } else {
                return 'No se encontró el botón para el dígito ${d}.';
            }
        }, digito);

        // Mostrar el resultado del intento de clic
        console.log(resultado);

        // Pausa entre los clics (1 segundo para asegurar que se registre el clic)
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};