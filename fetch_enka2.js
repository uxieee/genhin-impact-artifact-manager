async function run() {
    try {
        const res = await fetch('https://enka.network/api/uid/700687446/', {
            headers: {
                'User-Agent': 'GenshinArtifactManager/1.0',
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            console.error('HTTP Error:', res.status);
            const text = await res.text();
            console.log(text.substring(0, 100));
            return;
        }

        const data = await res.json();
        const ids = (data.avatarInfoList || []).map(a => a.avatarId);
        console.log('Avatar IDs:', ids);

        if (data.avatarInfoList && data.avatarInfoList.length > 0) {
            console.log('First Avatar ID:', data.avatarInfoList[0].avatarId);
        } else {
            console.log('No avatarInfoList found. Keys:', Object.keys(data));
        }
    } catch (e) {
        console.error('Parse error:', e);
    }
}

run();
