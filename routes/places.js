var express = require('express');
var router = express.Router();

const Place = require('../models/places');
const { checkBody } = require('../modules/checkbody');

router.post('/', (req, res) => {
    if (!checkBody(req.body, ['nickname', 'name', 'latitude', 'longitude'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }

    const { nickname, name } = req.body;

    Place.findOne({
        nickname: { $regex: new RegExp(nickname, 'i') },
        name: { $regex: new RegExp(name, 'i') },
        latitude: req.body.latitude,
        longitude: req.body.longitude,
    }).then(data => {
        if (data === null) {
            const newPlace = new Place({
                nickname: req.body.nickname,
                name: req.body.name,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
            });

            newPlace.save().then(newPlace => {
                console.log("new place:", newPlace)
                res.json({ result: true });
            });
        }
        else {
            res.json({ result: false, error: 'Place already exists' });
        }
    });
});

router.get('/:nickname', (req, res) => {
    Place.find({ nickname: req.params.nickname })
        .then(data => {
            res.json({ result: true, places: data });
        });
});

router.delete('/', (req, res) => {
    if (!checkBody(req.body, ['nickname', 'name'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }
    
    const { nickname, name } = req.body;

    Place.deleteOne({ nickname: { $regex: new RegExp(nickname, 'i') }, name: { $regex: new RegExp(name, 'i') }})
        .then(data => {
            if (data.deletedCount>0) {
            console.log("place deleted", data)
            res.json({ result: true });
            } else res.json({ result: false, error:"can't delete" });

        });
});

module.exports = router;
