const request = require("request");
const express = require("express");
const app =express();
const port = 3000;

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

var serviceAccount = require("./key.json");
initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

app.set("view engine", "ejs");



app.get("/signin",(req,res)=> {
    res.render('signin');
});
app.get("/signinsubmit", (req,res)=>{
    const email=req.query.email;
    const password=req.query.password;

    db.collection("consumers")
        .where("email","==",email)
        .where("password","==",password)
        .get()
        .then((docs)=>{
            if (docs.size > 0){
                res.render('home.ejs');
            }
            else{
                res.send("login failed");
            }
        });
    });


app.get("/signupsubmit", (req,res)=>{
    const full_name=req.query.full_name;
    const last_name=req.query.last_name;
    const email=req.query.email;
    const password=req.query.password;

    db.collection("consumers").add({
        name: full_name + last_name,
        email: email,
        password: password,
    }).then(()=>{
        res.render("signin.ejs");
    });
});
app.get("/signup",(req,res)=> {
    res.render('signup');
});

app.get('/weathersubmit',(req,res) =>{
    const location = req.query.location;
    request(
      'https://api.weatherapi.com/v1/forecast.json?key=16652c68a5234c48a3193629241206&q='+location+'&days=7', function (error, response, body){
        if("error" in JSON.parse(body))
        {
          if((JSON.parse(body).error.code.toString()).length > 0)
          {
            res.render("home.ejs");
          }
        }
        else
        {
          
          const country= JSON.parse(body).location.country;
          const loctime = JSON.parse(body).location.localtime;
          const temp_c = JSON.parse(body).current.temp_c;
          const temp_f = JSON.parse(body).current.temp_f;
          const wind_kph = JSON.parse(body).current.wind_kph;
          const humi = JSON.parse(body).current.humidity;
         
          res.render('location',{location:location,country:country,loctime:loctime,temp_c:temp_c,temp_f:temp_f,wind_kph:wind_kph,humi:humi});
        } 
      }
      );
  });

  app.get('/locsubmit', (req, res) => {
    res.render("weather");
  });
app.listen(port, ()=>{
    console.log(`listening on port ${port}`);
});