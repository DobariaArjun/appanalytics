const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const express = require('express');
const isEmpty = require('is-empty');
const gcm = require('node-gcm');
const app = express();

const uri = "mongodb+srv://ArjunDobaria:Pravin143@mantratechnolog.bjxu8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
const sender = new gcm.Sender('AAAAVpFD8ww:APA91bE-k8H9mXHaf_ilc_dUHAKsQABeWwVhtJd_4D1NLOAxy8N04nqLoN8k-S2-YuJSutyjmTZsyhbKvU1gcpcex9iSWJktJn_4Yf5F3GPal-6k4TQX3B31lGHiUpidQuLC3nO9v9Ky');

var BadTokenArray = []

client.connect((err, db) => {
    if (err)
        console.log("Error while connecting to Mongo" + err);
    else {
        console.log("Connected to Mongo");

        let dbo = db.db("TritechTechnoPoint");

        app.post('/firstCall', (req, res) => {
            let tempratureChecker = req.body.appName;
            let dataCounter = dbo.collection(tempratureChecker).find({
                'DeviceToken': req.body.deviceToken
            }).toArray();
            dataCounter.then((data) => {
                if (isEmpty(data)) {
                    //Create New
                    let myObj = {
                        UserCountry: req.body.userCountry,
//                         DeviceBrand: req.body.brand,
                        DeviceToken: req.body.deviceToken,
                        AppVersion: req.body.appVersion,
//                         ScreenResolustion: req.body.screenResolution
                    };

                    dbo.collection(tempratureChecker).insertOne(myObj, (err, result) => {
                        if (err)
                            res.json({
                                status: "0",
                                message: "Inserting fail in " + tempratureChecker
                            });
                        else {
                            res.json({
                                status: "1",
                                message: "Data added successfully in " + tempratureChecker
                            });
                        }
                    });
                } else {
                    dbo.collection(tempratureChecker).updateOne(
                        {
                            'DeviceToken': req.body.deviceToken
                        },
                        {
                            $set: {
                                "UserCountry": req.body.userCountry,
//                                 "DeviceBrand": req.body.brand,
                                "AppVersion": req.body.appVersion,
//                                 "ScreenResolustion": req.body.screenResolution
                            }
                        }
                    ).then((result) => {

                        if (result['result']['n'] == 1)
                            res.json({
                                status: "1",
                                message: "Data updated successfully in " + tempratureChecker
                            });
                        else
                            res.json({
                                status: "0",
                                message: "Updating fail in " + tempratureChecker
                            });
                    }).catch((err) => {
                        res.json({
                            status: "0",
                            message: "Updating fail in " + tempratureChecker
                        });
                    });
                }
            });
        });

        app.post('/activityView', (req, res) => {
            let tempratureCheckerActivityView = req.body.appNameView;
            let dataCounter = dbo.collection(tempratureCheckerActivityView).find({
                'ActivityName': req.body.name
            }).toArray();
            dataCounter.then((data) => {
                if (isEmpty(data)) {
                    //Create New
                    let myObj = {
                        ActivityName: req.body.name,
                        ActivityView: 1
                    };

                    dbo.collection(tempratureCheckerActivityView).insertOne(myObj, (err, result) => {
                        if (err)
                            res.json({
                                status: "0",
                                message: "Inserting fail in " + tempratureCheckerActivityView
                            });
                        else {
                            res.json({
                                status: "1",
                                message: "Data added successfully in " + tempratureCheckerActivityView
                            });
                        }
                    });
                } else {
                    var ActivityView = data[0]['ActivityView'];
                    dbo.collection(tempratureCheckerActivityView).updateOne(
                        {
                            'ActivityName': req.body.name
                        },
                        {
                            $set: {
                                "ActivityView": ActivityView + 1
                            }
                        }
                    ).then((result) => {

                        if (result['result']['n'] == 1)
                            res.json({
                                status: "1",
                                message: "Data updated successfully in " + tempratureCheckerActivityView
                            });
                        else
                            res.json({
                                status: "0",
                                message: "Updating fail in " + tempratureCheckerActivityView
                            });
                    }).catch((err) => {
                        res.json({
                            status: "0",
                            message: "Updating fail in " + tempratureCheckerActivityView
                        });
                    });
                }
            });
        });

        app.post('/notification', (req, res) => {

            // BadTokenArray = []

            let tempratureChecker = req.body.appName;
            var DeviceTokenArray = []
            let dataCounter;

            var countryName = "";


            if (req.body.userCountry == "") {
                dataCounter = dbo.collection(tempratureChecker).find({}).toArray();

                dataCounter.then((data) => {
                    if (isEmpty(data)) {
                        res.json({
                            status: "0",
                            message: "No user available in this country"
                        });
                    } else {
                        var data1 = data.length

                        for (i = 0; i < data.length; i++) {

                            DeviceTokenArray.push(data[i]["DeviceToken"])
                            if (DeviceTokenArray.length == 1000) {
                                console.log("1000 Notification")
                                var message = new gcm.Message({
                                    priority: 'high',
                                    notification: {
                                        title: req.body.title,
                                        body: req.body.body
                                    }
                                });
                                sender.send(message, {registrationTokens: DeviceTokenArray}, function (err, response) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log(response)
                                    }
                                });
                                DeviceTokenArray = []
                            } else if (i + 1 == data1) {
                                console.log("last Notification")
                                console.log(DeviceTokenArray.length)
                                var message = new gcm.Message({
                                    priority: 'high',
                                    notification: {
                                        title: req.body.title,
                                        body: req.body.body
                                    }
                                });
                                sender.send(message, {registrationTokens: DeviceTokenArray}, function (err, response) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log(response)
                                    }
                                });
                            }

                        }
                        res.json({
                            status: "1",
                            message: "Notification sended successfully."
                        });
                    }
                });
            } else {

                var finalCountry = req.body.userCountry;

                dataCounter = dbo.collection(tempratureChecker).find({
                    'UserCountry': finalCountry
                }).toArray();

                dataCounter.then((data) => {
                    if (isEmpty(data)) {
                        res.json({
                            status: "0",
                            message: "No user available in this country"
                        });
                    } else {
                        var data1 = data.length

                        for (i = 0; i < data.length; i++) {

                            DeviceTokenArray.push(data[i]["DeviceToken"])
                            if (DeviceTokenArray.length == 1000) {
                                console.log("1000 Notification")
                                var message = new gcm.Message({
                                    priority: 'high',
                                    notification: {
                                        title: req.body.title,
                                        body: req.body.body
                                    }
                                });
                                sender.send(message, {registrationTokens: DeviceTokenArray}, function (err, response) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log(response)
                                    }
                                });
                                DeviceTokenArray = []
                            } else if (i + 1 == data1) {
                                console.log("last Notification")
                                console.log(DeviceTokenArray.length)
                                var message = new gcm.Message({
                                    priority: 'high',
                                    notification: {
                                        title: req.body.title,
                                        body: req.body.body
                                    }
                                });
                                sender.send(message, {registrationTokens: DeviceTokenArray}, function (err, response) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log(response)
                                    }
                                });
                            }

                        }
                        res.json({
                            status: "1",
                            message: "Notification sended successfully."
                        });
                    }
                });

            }
        });

        app.get('/', (req, res) => {

            // console.log(BadTokenArray.length)
            // for (w = 0; w < BadTokenArray.length; w++) {
            //     // dbo.collection(tempratureChecker).removeOne({'DeviceToken': BadTokenArray[w]})
            //
            //     dbo.collection("Temperature Checker").removeOne({DeviceToken: BadTokenArray[w]}).then((data) => {
            //         // res.json({status: "1", message: "success"});
            //         console.log(data)
            //     }).catch((dataerr) => {
            //         // res.json({status: "3", message: "Internal server error"});
            //         console.log(dataerr)
            //     })
            // }

            res.json({
                status: "1",
                message: "Server is running..!"
            });


        });

        app.get('/ads', (req, res) => {

            let tempratureChecker = "Ads";

            // let dataCounter = dbo.collection(tempratureChecker).find({
            //     'ActivityName': req.body.ActivityName
            // }).toArray();
            // dataCounter.then((data) => {

            let dataCounter = dbo.collection(tempratureChecker).find({}).toArray();
            var tempData = [];
            dataCounter.then((data) => {
                if(isEmpty(data)){
                    res.json({
                        status: "0",
                        message: "No data found"
                    });
                }else{

                    res.json({
                        status: "1",
                        message: data
                    });
                }
            });

            // });

        });

        app.post('/adsLayout',(req,res) => {

            let tempratureChecker = "Ads"

            let dataCounter = dbo.collection(tempratureChecker).find({
                'AppName': req.body.AppName,
                'ActivityName': req.body.ActivityName
            }).toArray();
            dataCounter.then((data) => {
                if (isEmpty(data)) {
                    //Create New
                    var ads={
                        "1":req.body.one,
                        "2":req.body.two,
                        "3":req.body.three,
                        "4":req.body.four,
                        "5":req.body.five,
                        "6":req.body.six
                    };

                    let myObj = {
                        AppName: req.body.AppName,
                        ActivityName: req.body.ActivityName,
                        Ads: ads
                    };

                    dbo.collection(tempratureChecker).insertOne(myObj, (err, result) => {
                        if (err)
                            res.json({
                                status: "0",
                                message: "Inserting fail in " + tempratureChecker
                            });
                        else {
                            res.json({
                                status: "1",
                                message: "Data added successfully in " + tempratureChecker
                            });
                        }
                    });
                } else {

                    var ads={
                        "1":req.body.one,
                        "2":req.body.two,
                        "3":req.body.three,
                        "4":req.body.four,
                        "5":req.body.five,
                        "6":req.body.six
                    };

                    dbo.collection(tempratureChecker).updateOne(
                        {
                            'AppName': req.body.AppName,
                            'ActivityName': req.body.ActivityName
                        },
                        {
                            $set: {
                                "Ads": ads
                            }
                        }
                    ).then((result) => {

                        if (result['result']['n'] == 1)
                            res.json({
                                status: "1",
                                message: "Data updated successfully in " + tempratureChecker
                            });
                        else
                            res.json({
                                status: "0",
                                message: "Updating fail in " + tempratureChecker
                            });
                    }).catch((err) => {
                        res.json({
                            status: "0",
                            message: "Updating fail in " + tempratureChecker
                        });
                    });
                }
            });

        })

    }
});

let port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});
