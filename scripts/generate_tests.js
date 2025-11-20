import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, 'generated_tests');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

const TARGET_URL = 'http://localhost:5173';

async function generateTests() {
    console.log('Starting browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1920, height: 1080 }
    });
    const page = await browser.newPage();
    
    console.log(`Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0' });
    
    // Scroll to practice section
    await page.evaluate(() => {
        document.getElementById('practice').scrollIntoView();
    });
    
    let count2d = 0;
    let count3d = 0;
    const answers = [];

    // We loop until we have 25 of each
    while (count2d < 25 || count3d < 25) {
        // Wait for game container
        await page.waitForSelector('#game-container');
        
        // Get current mode and answer from data attributes
        const { mode, answer, round } = await page.$eval('#game-container', el => ({
            mode: el.getAttribute('data-mode'),
            answer: el.getAttribute('data-answer'),
            round: el.getAttribute('data-round')
        }));

        // Check if we need this type
        if ((mode === '2d' && count2d < 25) || (mode === '3d' && count3d < 25)) {
            // Take screenshot
            const index = mode === '2d' ? count2d + 1 : count3d + 1;
            const filename = `${mode}_test_${index}.png`;
            const filepath = path.join(OUTPUT_DIR, filename);
            
            // Screenshot only the game container area (which includes the question and options)
            const element = await page.$('#game-container');
            // Add some padding for the screenshot if possible, or just screenshot the element
            await element.screenshot({ path: filepath });
            
            console.log(`Saved ${filename} (Answer: ${answer})`);
            
            answers.push({
                mode,
                index,
                answer,
                filename
            });
            
            if (mode === '2d') count2d++;
            else count3d++;
        }
        
        // Click Next Challenge via evaluating click logic
        // Note: "Next Challenge" button only appears after a guess.
        // We need to simulate a "Correct" guess to advance, OR we can expose a hidden "Next" button,
        // OR we can just force a reload? No, that resets state.
        // Actually, the "Next Challenge" button only shows in 'result' state.
        // We need to FORCE generate a new level.
        // We can trigger the 'Next' logic by exposing a function on window or clicking a cheat button.
        // Or, simpler: we click one of the options to fail/pass, THEN click Next.
        
        // Let's try to find an option button and click it
        if (mode === '3d') {
            // Click the first option button
            const btn = await page.$('#game-container button');
            if (btn) await btn.click();
        } else {
            // 2D mode requires input. Fill '0' and submit.
            await page.type('#node-input', '0');
            const btn = await page.$('button[type="submit"]');
            if (btn) await btn.click();
        }
        
        // Now wait for "Next Challenge" button
        try {
            // Wait a moment for state transition
            await new Promise(r => setTimeout(r, 500));
            // Look for the "Next Challenge" button by text content
            const nextBtn = await page.waitForSelector('button ::-p-text(Next Challenge)', { timeout: 2000 });
            await nextBtn.click();
            
            // Wait for re-render (round change)
            await new Promise(r => setTimeout(r, 1000)); // Wait for Three.js to render
        } catch (e) {
            console.error("Error progressing to next round:", e);
        }
    }
    
    // Sort answers
    answers.sort((a, b) => {
        if (a.mode !== b.mode) return a.mode.localeCompare(b.mode);
        return a.index - b.index;
    });
    
    // Write answers.txt
    const answerText = answers.map(a => `${a.filename}: ${a.answer}`).join('\n');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'answers.txt'), answerText);
    console.log('Saved answers.txt');

    await browser.close();
}

generateTests();

