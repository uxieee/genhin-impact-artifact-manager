export default async function handler(req, res) {
    const { uid } = req.query;

    if (!uid) {
        return res.status(400).json({ error: 'UID is required' });
    }

    const url = `https://enka.network/api/uid/${uid}/`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'GenshinArtifactManager/1.0',
                'Accept': 'application/json'
            },
        });

        const data = await response.json();

        // Add CORS headers so we don't have issues if accessed directly or preflighted
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Enka Proxy Error:', error);
        return res.status(500).json({ error: 'Failed to fetch from Enka.Network' });
    }
}
