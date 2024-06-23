const request = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

var serviceAccount = require("./key.json");
initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/signin", (req, res) => {
    res.render('signin');
});

app.post("/signinsubmit", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    db.collection("consumers")
        .where("email", "==", email)
        .where("password", "==", password)
        .get()
        .then((docs) => {
            if (docs.size > 0) {
                res.render('home');
            } else {
                res.send("Login failed");
            }
        });
});

app.post("/signupsubmit", (req, res) => {
    const full_name = req.body.full_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const password = req.body.password;

    db.collection("consumers").add({
        name: `${full_name} ${last_name}`,
        email: email,
        password: password,
    }).then(() => {
        res.render("signin");
    });
});

app.get("/signup", (req, res) => {
    res.render('signup');
});

app.get('/weathersubmit', (req, res) => {
    const location = req.query.location;
    request(
        'https://api.weatherapi.com/v1/forecast.json?key=16652c68a5234c48a3193629241206&q=' + location + '&days=7', 
        function (error, response, body) {
            if ("error" in JSON.parse(body)) {
                if ((JSON.parse(body).error.code.toString()).length > 0) {
                    res.render("home");
                }
            } else {
                const data = JSON.parse(body);
                const country = data.location.country;
                const loctime = data.location.localtime;
                const temp_c = data.current.temp_c;
                const temp_f = data.current.temp_f;
                const wind_kph = data.current.wind_kph;
                const humi = data.current.humidity;

                res.render('location', { location, country, loctime, temp_c, temp_f, wind_kph, humi });
            }
        }
    );
});

app.get('/locsubmit', (req, res) => {
    res.render("weather");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
