const http = require('http');
const fs = require('fs');
const path = require('path');

// Helper to make multipart request
function uploadFile(token, filePath) {
    return new Promise((resolve, reject) => {
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        const filename = path.basename(filePath);
        const fileContent = fs.readFileSync(filePath);

        // Ensure token is safe string
        if (!token || typeof token !== 'string') {
            reject(new Error('Invalid token for upload'));
            return;
        }

        const postDataHeader = [
            `--${boundary}`,
            `Content-Disposition: form-data; name="file"; filename="${filename}"`,
            `Content-Type: application/pdf`,
            '',
            ''
        ].join('\r\n');

        const postDataFooter = `\r\n--${boundary}--`;

        // Construct valid header object
        const headers = {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Authorization': `Bearer ${token}` // Ensure no newlines or invalid chars here
        };

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/upload',
            method: 'POST',
            headers: headers
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', e => reject(e));

        req.write(postDataHeader);
        req.write(fileContent);
        req.write(postDataFooter);
        req.end();
    });
}

// Helper for JSON requests
function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : undefined
            }
        };
        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });
        req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    try {
        console.log('--- Verifying Upload & Save Document API ---');

        // 1. Get Token
        const email = `doc_test_${Date.now()}@test.com`;
        const reg = await request('POST', '/auth/register', {
            full_name: 'Doc Tester',
            email: email,
            password: 'password123',
            role: 'entrepreneur'
        });

        if (!reg.body.token) {
            console.error('Failed to register:', reg.body);
            return;
        }

        const token = reg.body.token;
        console.log('User registered.');

        // 2. Create Listing
        const listingRes = await request('POST', '/listings', {
            title: `Doc Test Listing ${Date.now()}`,
            type: 'Startup',
            category: 'Tech',
            description: 'Test',
            short_description: 'Test',
            asking_price: 5000,
            minimum_investment: 100,
            location: 'Kigali',
            rdb_registration_number: '123',
            rra_tin: '123'
        }, token);

        if (!listingRes.body.id) {
            console.error('Failed to create listing:', listingRes.body);
            return;
        }

        const listingId = listingRes.body.id;
        console.log('Listing created:', listingId);

        // 3. Create Dummy PDF
        const testFile = 'test_doc.pdf';
        fs.writeFileSync(testFile, 'dummy pdf content');

        // 4. Upload File
        console.log('Uploading file...');
        try {
            const uploadRes = await uploadFile(token, testFile);
            console.log('Upload Result:', uploadRes.body);

            if (uploadRes.status !== 201) {
                console.error('Upload failed');
                fs.unlinkSync(testFile);
                return;
            }

            const fileUrl = uploadRes.body.url;

            // 5. Save Document Metadata
            console.log('Saving document metadata...');
            const docRes = await request('POST', '/documents', {
                listing_id: listingId,
                document_type: 'pitch_deck',
                document_url: fileUrl,
                metadata: { size: '1kb' }
            }, token);
            console.log('Save Document Result:', docRes.body);

            if (docRes.status === 201 && docRes.body.id) {
                console.log('SUCCESS: Document uploaded and saved to DB.');
            } else {
                console.log('FAILURE: Copuld not save document.');
            }
        } catch (err) {
            console.error("Upload/Save failed:", err);
        }

        // Cleanup
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
