async function run() {
    const res = await fetch('https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json');
    const data = await res.json();
    const mapping = {};
    for (const [id, info] of Object.entries(data)) {
        if (info.SideIconName) {
            const nameMatch = info.SideIconName.match(/UI_AvatarIcon_Side_([a-zA-Z0-9_]+)/);
            if (nameMatch) {
                let name = nameMatch[1].toLowerCase();
                // Fix up names to match typical genshin.dev slugs
                if (name === 'playerboy') name = 'traveler-anemo';
                if (name === 'playergirl') name = 'traveler-geo';
                if (name === 'alhatham') name = 'alhaitham';
                if (name === 'qin') name = 'jean';
                if (name === 'shougun') name = 'raiden';
                if (name === 'linet') name = 'lynette';
                if (name === 'linn') name = 'lyney';
                if (name === 'hero') name = 'traveler-anemo';
                if (name === 'heroine') name = 'traveler-anemo';

                const idNum = parseInt(id, 10);
                // Only regular avatar ids (ignore traveler specifics for this dump)
                if (idNum >= 10000002 && idNum < 11000000 && !id.includes('-')) {
                    mapping[idNum] = name;
                }
            }
        }
    }

    // Custom manual mappings for standard genshin.dev keys
    const entries = Object.entries(mapping).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    for (const [id, name] of entries) {
        if (parseInt(id) > 10000050) {
            console.log(`  ${id}: '${name}',`);
        }
    }
}
run();
