const { chromium } = require('playwright');

(async () => {
  // מקבל את כתובת האתר כארגומנט בעת הפעלת הסקריפט
  const targetUrl = process.argv[2];
  
  if (!targetUrl) {
    console.error('Error: Please provide a target URL.');
    process.exit(1);
  }

  console.log(`Navigating to: ${targetUrl}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // מעבר לאתר והמתנה לטעינה מלאה
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    // סלקטור מדויק המבוסס על מבנה הכפתור באתר שצירפת
    const downloadBtnSelector = 'a#downloadButton';
    
    console.log('Waiting for download button...');
    await page.waitForSelector(downloadBtnSelector, { timeout: 15000 });

    // שליפת הקישור הישיר מתוך המאפיין href של הכפתור
    const directLink = await page.$eval(downloadBtnSelector, el => el.href);
    
    console.log('----------------------------------------');
    console.log(`SUCCESS_DOWNLOAD_LINK: ${directLink}`);
    console.log('----------------------------------------');

  } catch (error) {
    console.error('An error occurred during automation:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
