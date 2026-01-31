const http = require('http');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        console.log('--- Verifying Upload (Correct Mime) ---');

        // 1. Get Token
        const regData = JSON.stringify({
            full_name: 'Doc Tester 2',
            email: `doc_test_correct_${Date.now()}@test.com`,
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

        // 2. Upload
        const boundary = '----WebKitFormBoundaryCorrect';
        const fileContent = 'dummy pdf content';
        const body = [
            `--${boundary}`,
            `Content-Disposition: form-data; name="file"; filename="test.pdf"`,
            `Content-Type: application/pdf`,
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

        // 3. Save Document (if upload success)
        if (uploadRes.statusCode === 201) {
            const uploadJson = JSON.parse(uploadRes.body);

            // Need Listing First? Or just save to generic?
            // User requirement: "uploading image and pdf for listing and to be saved in the database"
            // I'll create a listing first to be clean.

            // Create Listing
            const listData = JSON.stringify({
                title: 'Doc Listing', type: 'Tech', category: 'IT', description: 'test',
                asking_price: 100, location: 'Kigali', short_description: 'short', minimum_investment: 10
            });

            const listOptions = {
                hostname: 'localhost', port: 5000, path: '/listings', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': listData.length }
            };
            const listReq = http.request(listOptions);
            const listRes = await new Promise(r => {
                listReq.on('response', res => { let d = ''; res.on('data', c => d += c); res.on('end', () => r({ body: JSON.parse(d) })); });
                listReq.write(listData); listReq.end();
            });
            const listingId = listRes.body.id;

            // Save Metadata
            const docData = JSON.stringify({
                listing_id: listingId,
                document_type: 'pitch_deck',
                document_url: uploadJson.url,
                metadata: { test: true }
            });

            const docOptions = {
                hostname: 'localhost', port: 5000, path: '/documents', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': docData.length }
            };
            const docReq = http.request(docOptions);
            const docRes = await new Promise(r => {
                docReq.on('response', res => { let d = ''; res.on('data', c => d += c); res.on('end', () => r({ status: res.statusCode, body: d })); });
                docReq.write(docData); docReq.end();
            });
            console.log('Save Doc Status:', docRes.status);
            console.log('Save Doc Body:', docRes.body);
        }

    } catch (e) {
        console.error('Error:', e);
    }
}
run();
