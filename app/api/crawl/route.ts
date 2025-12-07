import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import puppeteer from 'puppeteer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for many server environments
    });
    
    const page = await browser.newPage();
    
    // Set User Agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');

    try {
      // Go to URL and wait for network to be idle
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // 1. Expand all details/summary elements
      await page.evaluate(() => {
        document.querySelectorAll('details').forEach(el => el.setAttribute('open', 'true'));
      });

      // 2. Click all buttons that might reveal content (simple heuristic)
      // Be careful: clicking navigation or forms might be bad. We target specific aria-expanded=false or accordions.
      // For now, just the details/summary expansion above is the safest "low-risk" expansion.
      
      // 3. Auto-scroll to bottom to trigger lazy loading
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });
      
    } catch (error) {
       console.error("Puppeteer navigation error", error);
       await browser.close();
       return NextResponse.json({ error: 'Failed to load page' }, { status: 500 });
    }

    // Get the fully rendered HTML
    const html = await page.content();
    
    await browser.close();

    const $ = cheerio.load(html);

    // Extract title
    const title = $('title').text().trim() || url;

    // Try to find the main content
    let contentSelector = 'body';
    if ($('main').length) contentSelector = 'main';
    else if ($('article').length) contentSelector = 'article';
    else if ($('#content').length) contentSelector = '#content';
    else if ($('.content').length) contentSelector = '.content';

    const bodyContent = $(contentSelector).html() || $('body').html() || '';

    // Convert to Markdown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    // Remove links but keep text
    turndownService.addRule('removeLinks', {
        filter: 'a',
        replacement: function (content) {
          return content;
        }
    });

    const markdown = turndownService.turndown(bodyContent);

    // Basic cleaning
    const rawMarkdown = markdown
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .trim();

    // --- LLM CLEANING STEP ---
    // We use Gemini to extract only useful information, filtering out navs, ads, and boilerplate.
    const { GoogleGenAI } = require("@google/genai");
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    let finalContent = rawMarkdown;

    if (apiKey && rawMarkdown.length > 100) {
        try {
            const genAI = new GoogleGenAI({ apiKey });
            
            const response = await genAI.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [{
                role: "user",
                parts: [{
                  text: `You are a web scraper helper. Your job is to clean up the following text extracted from a webpage.
                  
                  Instructions:
                  1. Preserve all useful information (product details, pricing, FAQs, documentation, blog content).
                  2. REMOVE navigation menus, website footers (copyright, links), advertisements, cookie notices, and sidebar links.
                  3. Keep the structure (headings, lists) intact.
                  4. Output ONLY the cleaned markdown.

                  --- RAW CONTENT ---
                  ${rawMarkdown.slice(0, 30000)} // Limit context to avoid token limits if huge
                  --- END RAW CONTENT ---`
                }]
              }]
            });

            // Correct access for Gemini 2.5 SDK response
            const llmCleaned = response.candidates?.[0]?.content?.parts?.[0]?.text;
            if (llmCleaned) {
                finalContent = llmCleaned;
            }
        } catch (e) {
            console.error("LLM Cleaning failed, using raw markdown:", e);
        }
    }

    return NextResponse.json({
      title,
      content: finalContent,
      originalUrl: url,
    });
  } catch (error) {
    console.error('Crawl error:', error);
    return NextResponse.json(
      { error: 'Internal server error during crawling' },
      { status: 500 }
    );
  }
}
