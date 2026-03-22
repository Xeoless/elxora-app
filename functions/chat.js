const https = require('https');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    const API_KEY = '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';

    try {
        const { messages } = JSON.parse(event.body);

        const payload = JSON.stringify({
            model: 'openai/gpt-oss-120b:free',
            messages,
            temperature: 0.7,
            max_tokens: 2048,
            stream: true
        });

        // Use native https module — no fetch needed
        const result = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'openrouter.ai',
                path: '/api/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://magical-conkies-ff9e37.netlify.app',
                    'X-Title': 'ElXora Chat',
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, body: data }));
            });

            req.on('error', reject);
            req.write(payload);
            req.end();
        });

        return {
            statusCode: result.status,
            headers: { ...headers, 'Content-Type': 'text/event-stream' },
            body: result.body
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};
