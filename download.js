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

    console.log('Searching for download button or link...');

    let directLink = null;

    // נסה לאתר את הקישור בכמה דרכים שונות
    const possibleSelectors = [
      'a#downloadButton',
      'a.dl_link',
      'a.md-btn--go',
      'a[data-md-which="d"]',
      'a:has-text("Download")'
    ];

    for (const selector of possibleSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 5000 });
        if (element) {
          directLink = await element.evaluate(el => el.href || el.getAttribute('data-md-dl'));
          if (directLink) {
            console.log(`Found using selector: ${selector}`);
            break;
          }
        }
      } catch (e) {
        // ממשיך לנסות סלקטור הבא
      }
    }

    // אם עדיין לא נמצא, נחפש כל קישור שמכיל את המילה dl או דורש הורדה
    if (!directLink) {
      const links = await page.$$eval('a', elList => el.map(el => ({ href: el.href, text: el.innerText, id: el.id, className: el.className })));
      console.log('Available links on page:', JSON.stringify(links, null, 2));
      
      // ננסה לאתר קישור שנראה כמו הורדה ישירה
      const found = links.find(l => l.id === 'downloadButton' || l.className.includes('dl_link') || l.text.toLowerCase().includes('download'));
      if (found) {
        directLink = found.href;
      }
    }

    if (directLink) {
      console.log('----------------------------------------');
      console.log(`SUCCESS_DOWNLOAD_LINK: ${directLink}`);
      console.log('----------------------------------------');
    } else {
      throw new Error('Could not find the download link on the page.');
    }

  } catch (error) {
    console.error('An error occurred during automation:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
