const fastify = require("fastify")({
    logging: true
})
const sharp = require("sharp")
const fs = require('fs')
const util = require('util')
const {pipeline} = require('stream')
const pump = util.promisify(pipeline)
var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
var server_host = process.env.YOUR_HOST || '0.0.0.0';

async function convert (inputFile, width, height) {
    sharp(inputFile).resize({width: Number(width),height: Number(height)}).toFile("converted.jpg").then(function(newFileInfo) {
        console.log("Success")
    })
}

fastify.register(require('fastify-multipart'))
fastify.register(require('fastify-static'), {
    root: __dirname
})


fastify.post('/upload/:width/:height', async function (req, reply) {
    const width = req.params.width
    const height = req.params.height
    const data = await req.file()
    console.log(data.filename);
    await pump(data.file, fs.createWriteStream(data.filename))
    await convert(data.filename, height, width)
    reply.send({
        status: "success"
    })
    // reply.type('text/html').send(fs.readFileSync('converted.jpg'))
})

fastify.get('/download', function (req, reply) {
    return reply.sendFile('converted.jpg')
})

fastify.listen(server_port, server_host)
