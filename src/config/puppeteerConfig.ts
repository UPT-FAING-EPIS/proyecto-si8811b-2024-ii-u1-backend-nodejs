export const puppeteerOptions = {
    headless: false,
    defaultViewport: null,  
    args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',  
        '--start-maximized',  
    ],
};