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

    console.log('Searching for download button...');

    // ננסה מספר אפשרויות נפוצות לאיתור כפתור ההורדה באתרים מסוג זה:
    let downloadLink = null;
    const possibleSelectors = [
      'a#downloadButton',
      'a.dl_link',
      'a:has-text("Download")',
      'button:has-text("Download")',
      'a[data-md-which="d"]'
    ];

    for (const selector of possibleSelectors) {
      try {
        console.log(`Trying selector: ${selector}`);
        await page.waitForSelector(selector, { timeout: 5000 });
        downloadLink = await page.$eval(selector, el => el.href || el.getAttribute('data-md-dl'));
        if (downloadLink) {
          console.log(`Found using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // ממשיך לנסות את הסלקטור הבא אם הנוכחי נכשל
      }
    }

    if (!downloadLink) {
      // אם לא נמצא לפי הסלקטורים, נחפש כל אלמנט שמכיל את המילה Download
      const foundElement = await page.$('text=/Download/i');
      if (foundElement) {
        downloadLink = await foundElement.evaluate(el => el.href || el.closest('a')?.href);
      }
    }

    if (downloadLink) {
      console.log('----------------------------------------');
      console.log(`SUCCESS_DOWNLOAD_LINK: ${downloadLink}`);
      console.log('----------------------------------------');
    } else {
      throw new Error('Could not find any download button or link on the page.');
    }

  } catch (error) {
    console.error('An error occurred during automation:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
