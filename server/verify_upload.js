const http = require('http');
const fs = require('fs');
const path = require('path');

// Helper to make multipart request
function uploadFile(token, filePath) {
    return new Promise((resolve, reject) => {
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        const filename = path.basename(filePath);
        const fileContent = fs.readFileSync(filePath);

        const postDataHeader = [
            `--${boundary}`,
            `Content-Disposition: form-data; name="file"; filename="${filename}"`,
            `Content-Type: image/jpeg`, // Assuming JPEG for test
            '',
            ''
        ].join('\r\n');

        const postDataFooter = `\r\n--${boundary}--`;

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/upload',
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(postDataHeader) + fileContent.length + Buffer.byteLength(postDataFooter)
            }
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

// Helper to register/login for token
function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    try {
        console.log('--- Verifying Upload API ---');

        // 1. Get Token (Register generic user)
        const email = `upload_test_${Date.now()}@test.com`;
        const reg = await request('POST', '/auth/register', {
            full_name: 'Upload Tester',
            email: email,
            password: 'password123',
            role: 'entrepreneur'
        });
        const token = reg.token;
        console.log('User registered, token received.');

        // 2. Create Dummy Image
        const testFile = 'test_image.jpg';
        fs.writeFileSync(testFile, 'dummy image content'); // Not a real image, but content-type is set in header
        // Wait, backend checks mimetype via Multer? 
        // Multer checks magic numbers if using library, or just extension/mimetype header?
        // My implementation uses file.mimetype which comes from header, and extension from filename.
        // But some strict configurations verify content. 
        // My implementation: `const mimetype = allowedTypes.test(file.mimetype);` -> relies on header.

        console.log('Uploading file...');
        const uploadRes = await uploadFile(token, testFile);
        console.log('Upload Result:', uploadRes);

        // Cleanup
        fs.unlinkSync(testFile);

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
