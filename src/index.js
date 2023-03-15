const http = require('http');
const { URL } = require('url')
const bodyParser = require('./helpers/bodyParser')

const routes = require('./routes')
const port = 3001

const server = http.createServer((request, response) => {
    const parsedUrl = new URL (`http://localhost:${port}${request.url}`)
    let {pathname} = parsedUrl

    console.log(`Request method: ${request.method} | Endpoint : ${pathname} `)
    
   
    let id = null;

    const splitEndpoint = pathname.split('/').filter(Boolean)

    if (splitEndpoint.length > 1) {    
        pathname = `/${splitEndpoint[0]}/:id`;
        id = splitEndpoint[1];
    }

    const route = routes.find((routeObj) => 
         (routeObj.endpoint === pathname && routeObj.method === request.method)
    );

    if (route) { 
        request.query = Object.fromEntries(parsedUrl.searchParams)
        request.params = { id }

        response.send = (statusCode, body) => {
            response.writeHead(statusCode, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(body))
        }

        if (request.method === 'POST' || request.method === 'PUT') {
         bodyParser(request, () => route.handler(request, response))
        } else {
            route.handler(request,response)
        }
        }
   else {
        response.writeHead(404, {'Content-Type': 'text/html'})
        response.end(`Cannot ${request.method} ${pathname}`)}
    
});


server.listen(port, () => console.log(`Server started at http://localhost:${port}`));