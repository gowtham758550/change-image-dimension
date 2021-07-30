const fastify = require("fastify")({
    logging: true
})
const sharp = require("sharp")
const fileUpload = require("fastify-file-upload")
const fs = require('fs')
const util = require('util')
const paht = require('path')
const {pipeline} = require('stream')
const path = require("path")
const pump = util.promisify(pipeline)
var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
var server_host = process.env.YOUR_HOST || '0.0.0.0';

async function convert (inputFile) {
    sharp(inputFile).resize({width: 189,height: 264}).toFile("converted.jpg").then(function(newFileInfo) {
        console.log("Success")
    })
}

fastify.register(require('fastify-multipart'))
fastify.register(require('fastify-static'), {
    root: __dirname
})


// fastify.post('/upload', function (req, reply) {
//     // console.log('working');
//     const files = req.raw.files
//     console.log(files)
//     let fileArr = []
//     for(let key in files){
//         fileArr.push({
//         name: files[key].name,
//         mimetype: files[key].mimetype
//         })
//     }
//     convert(files[0])
//     reply.send({
//         status: "unknown"
//     })
// })

fastify.post('/uploads', async function (req, reply) {
    const data = await req.file()
    console.log(data.filename);
    await pump(data.file, fs.createWriteStream(data.filename))
    await convert(data.filename)
    // reply.send({
    //     status: "success"
    // })
    reply.type('text/html').send(fs.readFileSync('converted.jpg'))
})

fastify.get('/download', function (req, reply) {
    return reply.sendFile('converted.jpg')
})

app.listen(server_port, server_host)
