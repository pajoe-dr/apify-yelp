const Apify = require('apify');
const { FingerprintGenerator } = require('@apify/fingerprint');
const { puppeteerUtils } = Apify.utils;

Apify.main(async () => {
    const input = await Apify.getInput();
    // Proxy configuration (replace with your setup if necessary)
    const proxyConfiguration = await Apify.createProxyConfiguration({
        groups: ['SHADER'], // Replace with your subscribed proxy group
        country: 'US',      // Optional: Set a preferred proxy country
    });

    // Initialize the fingerprint generator
    const fingerprintGenerator = new FingerprintGenerator({
        browsers: ['chrome', 'firefox'], // You can specify the browsers to emulate
        devices: ['desktop', 'mobile'], // Mimic both desktop and mobile
    });

    const requestQueue = await Apify.openRequestQueue();

    // Add your requests (this is an example for one URL)
    await requestQueue.addRequest({
        url: 'https://www.yelp.com/search?find_desc=Pizza&find_loc=New+York',
        userData: { label: 'SEARCH' },
    });

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        proxyConfiguration,
        maxConcurrency: 10,
        maxRequestRetries: 5,
        requestTimeoutSecs: 60,
        handlePageTimeoutSecs: 180,
        launchContext: {
            launchOptions: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
        },
        preNavigationHooks: [
            async ({ page, request }) => {
                // Generate and inject a fingerprint
                const fingerprint = fingerprintGenerator.getFingerprint();
                await puppeteerUtils.injectFingerprint(page, fingerprint);

                // Set User-Agent and additional headers
                await page.setUserAgent(fingerprint.fingerprint.navigator.userAgent);
                await page.setExtraHTTPHeaders({
                    'Accept-Language': 'en-US,en;q=0.9',
                });

                // Optional: Add random delays to mimic real user behavior
                await page.waitForTimeout(Math.random() * 2000 + 1000);
            },
        ],
        handlePageFunction: async ({ request, page }) => {
            const content = await page.content();
            console.log(`Processing ${request.url}`);
            // Your scraping logic here
        },
    });

    await crawler.run();
});
