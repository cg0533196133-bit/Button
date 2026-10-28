const { chromium } = require('playwright');

(async () => {
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
    // טעינת הדף
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const downloadBtnSelector = 'a#downloadButton';
    
    console.log('Waiting for download button to appear...');
    
    // המתנה אקטיבית עד שהכפתור מופיע ויש לו href או מאפיין תקין
    let directLink = null;
    for (let i = 0; i < 15; i++) {
      try {
        await page.waitForSelector(downloadBtnSelector, { timeout: 2000 });
        directLink = await page.$eval(downloadBtnSelector, el => el.href);
        if (directLink && directLink.startsWith('http')) {
          break;
        }
      } catch (e) {
        // ממשיך לנסות אם הכפתור עדיין לא נטען במלואו
      }
      await page.waitForTimeout(1000);
    }

    if (!directLink) {
      // אם ה-href ריק או לא נמצא, ננסה ללחוץ עליו כדי לגרום לקישור להופיע
      console.log('Clicking the button to trigger download link...');
      await page.click(downloadBtnSelector);
      await page.waitForTimeout(3000);
      directLink = await page.$eval(downloadBtnSelector, el => el.href).catch(() => null);
    }

    if (directLink) {
      console.log('----------------------------------------');
      console.log(`SUCCESS_DOWNLOAD_LINK: ${directLink}`);
      console.log('----------------------------------------');
    } else {
      throw new Error('Could not extract the direct download link.');
    }

  } catch (error) {
    console.error('An error occurred during automation:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
