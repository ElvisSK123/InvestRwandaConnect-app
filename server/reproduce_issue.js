const http = require('http');

// Utils to make HTTP requests
function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const json = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, body: json });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    try {
        console.log('--- Starting Reproduction Script ---');

        const timestamp = Date.now();
        const entrepEmail = `entrep_${timestamp}@test.com`;
        const investEmail = `invest_${timestamp}@test.com`;
        const adminEmail = `admin_${timestamp}@test.com`;

        // 1. Register Entrepreneur
        console.log(`\n1. Registering Entrepreneur (${entrepEmail})...`);
        const regEntrep = await request('POST', '/auth/register', {
            full_name: 'Entrep User',
            email: entrepEmail,
            password: 'password123',
            role: 'entrepreneur' // This should default to seller/entrepreneur depending on logic
        });
        console.log(`Status: ${regEntrep.status}`, regEntrep.body.user ? 'Success' : 'Failed');
        const entrepToken = regEntrep.body.token;

        // 2. Create Listing
        console.log('\n2. Creating Listing as Entrepreneur...');
        const listingData = {
            title: `Test Listing ${timestamp}`,
            type: 'Startup',
            category: 'Technology',
            description: 'Test Description',
            short_description: 'Short Desc',
            asking_price: 10000,
            minimum_investment: 1000,
            location: 'Kigali',
            district: 'Gasabo',
            images: [],
            rdb_registration_number: '123',
            rra_tin: '123',
            land_title_number: '',
            projected_roi: 10,
            year_established: 2020,
            employees: 5,
            annual_revenue: 50000,
            highlights: []
        };

        const createListing = await request('POST', '/listings', listingData, entrepToken);
        console.log(`Status: ${createListing.status}`, createListing.body.title ? 'Success' : JSON.stringify(createListing.body));
        const listingId = createListing.body.id;

        if (!listingId) {
            console.error("Failed to create listing, stopping.");
            return;
        }

        // 3. Register Investor
        console.log(`\n3. Registering Investor (${investEmail})...`);
        const regInvest = await request('POST', '/auth/register', {
            full_name: 'Invest User',
            email: investEmail,
            password: 'password123',
            role: 'investor'
        });
        console.log(`Status: ${regInvest.status}`, regInvest.body.user ? 'Success' : 'Failed');
        const investToken = regInvest.body.token;

        // 4. Investor List Listings (BEFORE Approval)
        console.log('\n4. Investor fetching listings (Expectation: Listing NOT visible)...');
        const listingsBefore = await request('GET', '/listings', null, investToken);
        const foundBefore = listingsBefore.body.find(l => l.id === listingId);
        console.log(`Listing visible? ${!!foundBefore}`);
        if (foundBefore) console.log('UNEXPECTED: Listing is visible before approval!');
        else console.log('EXPECTED: Listing is hidden.');

        // 5. Register/Login Admin and Approve
        console.log(`\n5. Registering Admin (${adminEmail})...`);
        // Note: register endpoint might default to 'investor' unless code allows 'admin'
        // server.js allows 'admin' in register if passed
        const regAdmin = await request('POST', '/auth/register', {
            full_name: 'Admin User',
            email: adminEmail,
            password: 'password123',
            role: 'admin'
        });
        console.log(`Status: ${regAdmin.status}`, regAdmin.body.user ? 'Success' : 'Failed');
        const adminToken = regAdmin.body.token;

        console.log(`\n6. Approving Listing ${listingId} as Admin...`);
        const approve = await request('PUT', `/listings/${listingId}/status`, {
            status: 'approved'
        }, adminToken);
        console.log(`Status: ${approve.status}`, approve.body.status === 'approved' ? 'Success' : JSON.stringify(approve.body));

        // 7. Investor List Listings (AFTER Approval)
        console.log('\n7. Investor fetching listings (Expectation: Listing VISIBLE)...');
        const listingsAfter = await request('GET', '/listings', null, investToken);
        const foundAfter = listingsAfter.body.find(l => l.id === listingId);
        console.log(`Listing visible? ${!!foundAfter}`);
        if (foundAfter) console.log('SUCCESS: Listing is now visible.');
        else console.log('FAILURE: Listing is still hidden!');

    } catch (err) {
        console.error('Error running script:', err);
    }
}

run();
