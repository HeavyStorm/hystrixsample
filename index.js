// IMPORTS /////////////////////////////////////////////////////////////////////
const { commandFactory, hystrixSSEStream } = require("hystrixjs");
const restify = require("restify");
const request = require("request-promise");
const ConfigurationManager = require("./configuration-manager");

// IMPLEMENTATION //////////////////////////////////////////////////////////////
const configurationManager = new ConfigurationManager();
const config = configurationManager.getConfiguration();

const server = restify.createServer({ name: config.this.name });

const otherUrl = `${config.other.procotocol}://${config.other.hostname}:${config.other.port}/${config.other.name}`
var callOtherService = commandFactory.getOrCreate(`${config.this.name}→${config.other.name}`)
	.run(async () => await request(otherUrl))
	.fallbackTo(async () => await `Service "${config.other.name}" Unavailable`)
	.build();

server.get(`/${config.this.name}`, async (req, res, next) => {
	res.send(200, "Hello from service A");
});

server.get(`/${config.other.name}`, async (req, res, next) => {
	try {
		let result = await callOtherService.execute();
		res.send(200, result);
		next();
	} catch (error) {
		res.send(500, error.message);
		next();
	} 
});

server.get("/hystrix.stream", (request, response) => {
	response.header('Content-Type', 'text/event-stream;charset=UTF-8');
	response.header('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
	response.header('Pragma', 'no-cache');
	return hystrixSSEStream
		.toObservable()
		.subscribe(function onNext(sseData) {
			response.write('data: ' + sseData + '\n\n');
		},
		function onError(error) {
			console.log(error);
		},
		function onComplete() {
			return response.end();
		});
});

server.listen(config.this.port, () => console.log(`${config.this.name} is listening on port ${config.this.port}.`));
