var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var fs = require("fs");
var busboy = require('connect-busboy');
var ogr2ogr = require('ogr2ogr');
var zipFolder = require('zip-folder');
var compression = require('compression');

app.use(compression({
    filter: () => {
        return true;
    }
}));

app.use(function(req, res, next) {
    allowCross(res);
    next();
});

app.use('/client',  express.static(__dirname + '/client'));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use('/DATA',  express.static(__dirname + '/DATA'));

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(busboy());
app.use("/api", require("./api"));

app.get("/", function (req, res) {
    res.sendFile(`${__dirname}/client/index.html`);
});

app.post('/uploading_file', function (req, res) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        try{
            fs.mkdirSync("files");
        } catch (e) {
            if ( e.code != 'EEXIST' ) throw e;
        }
        fstream = fs.createWriteStream(__dirname + '/files/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.send({filename: filename});
        });
    });
});

app.get('/download_zip/:which', function (req, res) {
    res.set({
        "Set-Cookie": "fileDownload=true; path=/"
    });
    zipFolder("DATA/TMS/" + req.params.which, req.params.which, function () {
        res.download(req.params.which, function () {
            fs.unlinkSync(req.params.which);
        });
    });
});

app.listen(8007, function () {
    console.log("listen on 8007");
});

function allowCross(iRes) {
    iRes.header('Access-Control-Allow-Origin', '*');
    iRes.header('Access-Control-Allow-Credentials', true);
    iRes.header('Access-Control-Allow-Methods', '*');
    iRes.header('Access-Control-Allow-Headers', 'Content-Type');
}



// app.get("/DATA/TMS/:dir/source", function (req, res) {
//     fs.readFile("DATA/TMS/" + req.params.dir + "/tilemapresource.xml", function (err, xml) {
//         res.send(xml);
//         // res.send(xml2json.toJson(xml));
//
//     })
// });
