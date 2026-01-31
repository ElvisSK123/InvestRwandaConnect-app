const http = require('http');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        console.log('--- Verifying Upload (Simple) ---');

        // 1. Get Token
        const regData = JSON.stringify({
            full_name: 'Doc Tester',
            email: `doc_test_simple_${Date.now()}@test.com`,
            password: 'password123',
            role: 'entrepreneur'
        });

        const regOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': regData.length
            }
        };

        const regReq = http.request(regOptions);
        const regRes = await new Promise((resolve, reject) => {
            regReq.on('response', res => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ body: JSON.parse(data), headers: res.headers }));
            });
            regReq.on('error', reject);
            regReq.write(regData);
            regReq.end();
        });

        const token = regRes.body.token;
        if (!token) throw new Error('No token');
        console.log('Token received');

        // 2. Upload
        const boundary = '----WebKitFormBoundarySimple';
        const fileContent = 'dummy content';
        const body = [
            `--${boundary}`,
            `Content-Disposition: form-data; name="file"; filename="test.txt"`,
            `Content-Type: text/plain`,
            '',
            fileContent,
            `--${boundary}--`
        ].join('\r\n');

        const uploadOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/upload',
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const uploadReq = http.request(uploadOptions);
        const uploadRes = await new Promise((resolve, reject) => {
            uploadReq.on('response', res => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
            });
            uploadReq.on('error', reject);
            uploadReq.write(body);
            uploadReq.end();
        });

        console.log('Upload status:', uploadRes.statusCode);
        console.log('Upload body:', uploadRes.body);

    } catch (e) {
        console.error('Error:', e);
    }
}
run();
