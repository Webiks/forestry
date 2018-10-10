var express = require("express");
var router = express.Router();
var session = require('express-session');
var fs = require("fs");
var path = require("path");
var exec = require('child_process').exec;
var rmdirSync = require('rmdir-sync');
var busboy = require('connect-busboy');
var request = require('request');

router.use(session({secret: guid()}));


router.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var token = req.body.token;

    if(session.secret && token == session.secret) {
        res.status(200).send({message: "success", token: token});
    } else if (email == process.env["DEMO_EMAIL"] && password == process.env["DEMO_PASSWORD"]) {
        session.secret = guid();
        res.status(200).send({message: "Success", token: session.secret });
    } else {
        res.status(401).send({message: "Invalid email or password"});
    }
});

router.post('/split_to_tiles', function (req, res) {
    var zoom = req.body.zoom ? `-z ${req.body.zoom} `: "";
    var command = `gdal2tiles.py -w none ${zoom}files/${req.body.filename} DATA/TMS/${req.body.filename}`;
    exec(command, function (error, stdout, stderr) {
        rmdirSync("files");

        if (error) {
            res.send({error: error});
        } else if(stderr) {
            res.send({stderr: stderr});
        } else {
            res.send({exec: command, stderr: stderr, filename: req.body.filename});
        }
    })
});

router.get('/list_of_vectors_polygons.json', function (req, res) {
    let dir_array = getDirViaHost(req.get('host')).map(dir => `${dir}/GEOJSON`);
    res.json(dir_array.reduce( (acc, path_to_dir) => acc.concat(getVectorsDataViaPath(`${path_to_dir}/polygons`)), []))
});

router.get('/list_of_vectors_points.json', function (req, res) {
    let dir_array = getDirViaHost(req.get('host')).map(dir => `${dir}/GEOJSON`);
    res.json(dir_array.reduce( (acc, path_to_dir) => acc.concat(getVectorsDataViaPath(`${path_to_dir}/points`)), []))
});

router.get('/list_of_rasters.json', function (req, res) {
    let dir_array = getDirViaHost(req.get('host')).map(dir => `${dir}/TMS`);
    res.json(dir_array.reduce( (acc, path_to_dir) => acc.concat(getTMSDataViaPath(path_to_dir)), []));
});


router.get('/getCoordinates', function (req, res) {
    var options = {
        url:req.query.url,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    request(options, function (error, response, body) {
        res.send(body);
    });
});


let getDirViaHost = (host) => {
    var files = fs.readdirSync(`${__dirname}/DATA`);
    files = files.map(file => `DATA/${file}`);
    if(host.includes('upm')) {
        files = files.filter(file => file.includes("UPM"));
    } else if(host.includes('fi')) {
        files = files.filter(file => file.includes("FI"));
    }
    return files;
};

let getVectorsDataViaPath = (path_to_dir) => {
    let files = fs.readdirSync(path_to_dir);
    return files.map(filename => new Object({name: filename.split(".geojson")[0], url: `${path_to_dir}/${filename}`, type:'vector'}))
};

let getTMSDataViaPath = (path_to_dir) => {
    let tms_dir_only = fs.readdirSync(path_to_dir).filter((file) => fs.statSync(path.join(path_to_dir, file)).isDirectory());
    return tms_dir_only.map((tms_d) => new Object({name: tms_d.split(".tif")[0], url: `${path_to_dir}/${tms_d}`, type:'tms'}));
};


function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

module.exports = router;



// var wms_array = [
//     // {name: 'Area of Interest', url: `Demo/wms`, layers: 'Demo:Area_of_Interest', bounds: [101.38876578607312, 3.22219159688689, 101.39027350807808,3.22370725985027], type:'wms'}
// ];

//
// router.post('/add_vector_from_geojson_file',  (request, response) => {
//     request.pipe(request.busboy);
//
//     request.busboy.on('file', function (type, file, filename) {
//         let chunks = "";
//         let bytes = 0;
//         file.on('data', chunk => {
//             bytes += chunk.length;
//             chunks += chunk;
//         });
//         file.on('end', () => {
//             console.log(` bytes ${bytes}`);
//
//             Vector.find({Name: filename}, (err, find_res) => {
//
//                 console.log(`filename = ${filename}`);
//                 console.log("find_res.length > 0    =>  ",find_res.length );
//
//                 if (find_res.length > 0) {
//                     response.send({error: "Name already used by an existing object"})
//                 } else {
//                     let vector = {
//                         Name: filename,
//                         Geojson: JSON.parse(chunks)
//                     };
//                     Vector.create(vector, (err, create_res) => {
//                         console.log(`err = ${err}`);
//                         response.send(create_res);
//                     });
//                 }
//             });
//         });
//     });
// });

// router.get('/list_db_vectors.json',  (req, res) => {
//     Vector.find({}, (err, result) => {
//         res.send(result);
//     });
// });