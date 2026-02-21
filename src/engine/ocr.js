import Tesseract from 'tesseract.js';
import { ARTIFACT_SLOTS, STAT_LABELS } from '../utils/constants';

let worker = null;

/**
 * Initialize the Tesseract worker
 */
export async function initOcrWorker() {
    if (worker) return worker;

    worker = await Tesseract.createWorker('eng', 1, {
        logger: m => console.log(m)
    });

    // Optimize settings for faster, single-block reading (since we'll give it pre-cropped images)
    await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
    });

    return worker;
}

/**
 * Destroy worker to free memory
 */
export async function destroyOcrWorker() {
    if (worker) {
        await worker.terminate();
        worker = null;
    }
}

/**
 * Converts a File/Blob to an HTML Image element to draw onto canvas
 */
function fileToImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Preprocesses the image (grayscale & thresholding) and returns a data URL for a specific cropped region
 */
function cropAndPreprocess(img, cropBox) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas to the size of the crop box
    canvas.width = cropBox.width;
    canvas.height = cropBox.height;

    // Draw only the cropped portion of the image onto the canvas
    ctx.drawImage(img, cropBox.x, cropBox.y, cropBox.width, cropBox.height, 0, 0, cropBox.width, cropBox.height);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply grayscale and high-contrast threshold
    // Genshin UI usually has white/gold text on a dark background. 
    // We want black text on a white background for best OCR.
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Simple luminance calculation
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        // Thresholding: if bright (text), make black. If dark (bg), make white.
        const threshold = 180;
        const isText = brightness > threshold;

        const finalColor = isText ? 0 : 255;

        data[i] = finalColor;     // red
        data[i + 1] = finalColor; // green
        data[i + 2] = finalColor; // blue
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
}

/**
 * Given a recognized word, find the closest matching stat key using Levenshtein distance
 */
function fuzzyMatchStat(recognizedText) {
    const cleanText = recognizedText.toLowerCase().replace(/[^a-z%]/g, '').trim();

    const validStats = [
        { key: 'hp', string: 'hp' },
        { key: 'hp_', string: 'hp%' },
        { key: 'atk', string: 'atk' },
        { key: 'atk_', string: 'atk%' },
        { key: 'def', string: 'def' },
        { key: 'def_', string: 'def%' },
        { key: 'critRate_', string: 'critrate' },
        { key: 'critRate_', string: 'critrate%' },
        { key: 'critDMG_', string: 'critdmg' },
        { key: 'critDMG_', string: 'critdmg%' },
        { key: 'enerRech_', string: 'energyrecharge' },
        { key: 'enerRech_', string: 'energyrecharge%' },
        { key: 'eleMas', string: 'elementalmastery' },
        { key: 'heal_', string: 'healingbonus' },
        { key: 'heal_', string: 'healingbonus%' },
        { key: 'pyro_dmg_', string: 'pyrodmgbonus' },
        { key: 'pyro_dmg_', string: 'pyrodmgbonus%' },
        { key: 'hydro_dmg_', string: 'hydrodmgbonus' },
        { key: 'electro_dmg_', string: 'electrodmgbonus' },
        { key: 'anemo_dmg_', string: 'anemodmgbonus' },
        { key: 'dendro_dmg_', string: 'dendrodmgbonus' },
        { key: 'cryo_dmg_', string: 'cryodmgbonus' },
        { key: 'geo_dmg_', string: 'geodmgbonus' },
        { key: 'physical_dmg_', string: 'physicaldmgbonus' },
        { key: 'physical_dmg_', string: 'physicaldmgbonus%' }
    ];

    let bestMatch = null;
    let maxSimilarity = 0;

    for (const stat of validStats) {
        const similarity = compareStrings(cleanText, stat.string);
        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            bestMatch = stat.key;
        }
    }

    // Require at least 50% match to avoid hallucinating stats from garbage data
    return maxSimilarity > 0.5 ? bestMatch : null;
}

/**
 * Simple string overlap comparison between 0.0 and 1.0
 */
function compareStrings(s1, s2) {
    let matches = 0;
    const len = Math.max(s1.length, s2.length);
    if (len === 0) return 0;

    for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
        if (s1[i] === s2[i]) matches++;
    }
    return matches / len;
}

/**
 * Extracts numeric value from OCR string
 */
function extractValue(text) {
    // Replace common OCR mistakes
    let cleaned = text.replace(/O/g, '0').replace(/o/g, '0').replace(/I/g, '1').replace(/l/g, '1');
    const match = cleaned.match(/[\d,.]+/);
    if (!match) return 0;

    // Convert e.g., "1,234.5" to "1234.5" and float
    return parseFloat(match[0].replace(/,/g, ''));
}

/**
 * Main export: Processes a screenshot file and attempts to extract Genshin Artifact data
 */
export async function parseArtifactScreenshot(file) {
    const w = await initOcrWorker();
    const img = await fileToImage(file);

    const results = {
        setKey: '',
        slotKey: '',
        level: 0,
        mainStatKey: '',
        mainStatVal: 0,
        substats: [],
        debug: {}
    };

    // Note: These crop boxes assume a 16:9 standard 1080p inventory screenshot. 
    // In a real app we would want auto-detection of the artifact window, 
    // but this serves as a baseline proof-of-concept.
    const regions = {
        mainStatType: { x: 1350, y: 350, width: 300, height: 40 },
        mainStatValue: { x: 1350, y: 390, width: 300, height: 60 },
        level: { x: 1350, y: 480, width: 100, height: 40 },
        substats: { x: 1380, y: 550, width: 450, height: 200 } // Captures all 4 substats
    };

    try {
        // Main Stat Key
        const mainStatImg = cropAndPreprocess(img, regions.mainStatType);
        const mainStatOcr = await w.recognize(mainStatImg);
        results.debug.mainStatType = mainStatOcr.data.text;
        results.mainStatKey = fuzzyMatchStat(mainStatOcr.data.text) || 'hp';

        // Main Stat Value
        const mainValImg = cropAndPreprocess(img, regions.mainStatValue);
        const mainValOcr = await w.recognize(mainValImg);
        results.debug.mainStatValue = mainValOcr.data.text;
        results.mainStatVal = extractValue(mainValOcr.data.text);

        // Level
        const levelImg = cropAndPreprocess(img, regions.level);
        const levelOcr = await w.recognize(levelImg);
        results.debug.levelText = levelOcr.data.text;
        const levelMatch = levelOcr.data.text.match(/\d+/);
        results.level = levelMatch ? Math.min(20, parseInt(levelMatch[0], 10)) : 0;

        // Substats
        await w.setParameters({ tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK }); // Substats are block text
        const subImg = cropAndPreprocess(img, regions.substats);
        const subOcr = await w.recognize(subImg);
        results.debug.substatsText = subOcr.data.text;

        // Parse the block text line-by-line
        const lines = subOcr.data.text.split('\n').filter(l => l.trim().length > 3);

        for (const line of lines) {
            if (results.substats.length >= 4) break;

            // Typical line: "CRIT DMG+ 21.0%" or "ATK+ 14"
            const parts = line.split('+');
            if (parts.length >= 2) {
                const statName = parts[0].trim();
                const statValue = parts[1].trim();

                // Determine if it's a percent stat based on the text string or value containing '%'
                const isPercent = statName.includes('%') || statValue.includes('%') ||
                    statName.toLowerCase().includes('rate') ||
                    statName.toLowerCase().includes('dmg') ||
                    statName.toLowerCase().includes('recharge');

                let key = fuzzyMatchStat(statName);
                if (key) {
                    // Force percent key if matching base stat but string contains percent indicator
                    if (isPercent && !key.endsWith('_') && ['hp', 'atk', 'def'].includes(key)) {
                        key = key + '_';
                    }

                    results.substats.push({
                        key: key,
                        value: extractValue(statValue)
                    });
                }
            }
        }

        // Infer Slot Key based on Main Stat if possible
        if (results.mainStatKey.includes('dmg_') || results.mainStatKey.includes('physical')) {
            results.slotKey = 'goblet';
        } else if (results.mainStatKey === 'heal_') {
            results.slotKey = 'circlet';
        } else if (results.mainStatKey === 'enerRech_') {
            results.slotKey = 'sands';
        } else {
            results.slotKey = 'flower'; // Default fallback
        }

        // Set Key would require more complex logic linking to gamedata icon hashes
        // For OCR proof-of-concept, default to a common set
        results.setKey = 'GladiatorsFinale';

    } catch (e) {
        console.error("OCR Error:", e);
    }

    return results;
}
