const http = require('http');
const fs = require('fs');
const path = require('path');

// Read the contents of db.json
const dbPath = path.join(__dirname, 'db.json');
let dbData = [];
try {
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    dbData = JSON.parse(dbContent);
} catch (error) {
    console.error('Error reading db.json:', error);
}

// Create a server
const server = http.createServer((req, res) => {
    // Set CORS headers to allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Serve the db.json data
    if (req.url === '/actors' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(dbData.actors));
    } else if (req.url === '/actors' && req.method === 'POST') {
        handlePostRequest(req, res, 'actors');
    } else if (req.url.startsWith('/actors/') && req.method === 'DELETE') {
        handleDeleteRequest(req, res, 'actors');
    } else if (req.url === '/requirements' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(dbData.requirements));
    } else if (req.url === '/requirements' && req.method === 'POST') {
        handlePostRequest(req, res, 'requirements');
    } else if (req.url.startsWith('/requirements/') && req.method === 'DELETE') {
        handleDeleteRequest(req, res, 'requirements');
    } else {
        // Handle invalid requests
        res.statusCode = 404;
        res.end('Not Found');
    }
});

// Handle POST requests
function handlePostRequest(req, res, collection) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const data = JSON.parse(body);
        dbData[collection].push(data);
        fs.writeFile(dbPath, JSON.stringify(dbData), (error) => {
            if (error) {
                console.error('Error writing to db.json:', error);
                res.statusCode = 500;
                res.end('Internal Server Error');
            } else {
                res.statusCode = 201;
                res.end();
            }
        });
    });
}

// Handle DELETE requests
function handleDeleteRequest(req, res, collection) {
    const itemId = req.url.split('/')[2];
    const index = dbData[collection].findIndex((item) => item.id === itemId);
    if (index !== -1) {
        dbData[collection].splice(index, 1);
        fs.writeFile(dbPath, JSON.stringify(dbData), (error) => {
            if (error) {
                console.error('Error writing to db.json:', error);
                res.statusCode = 500;
                res.end('Internal Server Error');
            } else {
                res.statusCode = 204;
                res.end();
            }
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
}

// Start the server
const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});