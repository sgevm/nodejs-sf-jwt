const dotenv = require("dotenv").config();
const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');

const loginURI = process.env.LOGIN_URI;
const tokenURI = process.env.TOKEN_URI;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

router.get('/generatetoken', async (req, res) => {
    console.log('......./api/jwtauth/generatetoken', req.body);
    const sub = 'sudeep.ghag@msc.com.devsudeep';//req.body.sub;  
    const exp_ms = Math.floor(Date.now() / 1000) + 60 * 3;
    console.log('.......CLIENT_ID', process.env.CLIENT_ID);
    console.log('.......LOGIN_URI', process.env.LOGIN_URI);
    console.log('.......TOKEN_URI', process.env.TOKEN_URI);
    console.log('.......exp_ms', exp_ms);
  const payload = {
    iss: process.env.CLIENT_ID,
    sub,//dynamic users this must be the username
    aud: process.env.LOGIN_URI,
    exp: exp_ms,
  };
  console.log('.......payload', payload);

  let privateKey = fs.readFileSync('server.key');
  //console.log('.......privateKey', privateKey);

  let token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  //console.log('.......token:', token);

  let payloadString = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`;
  
  //console.log('.......payloadString:', payloadString);

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  // res.json({token, payloadString});

  //make sure the connected app is either a managed policy where the profile/permission set you are trying to use is authorized or login with the connected app using a different flow first other wise you will get - 	Remote Access 2.0	Failed: Not approved	JWT Test App	login.salesforce.com - in the login history and on the server     data: {error: 'invalid_grant', error_description: "user hasn't approved this consumer"} https://salesforce.stackexchange.com/questions/184363/salesforce-jwt-user-hasnt-approved-this-consumer-again

  try {
    grant = await axios.post(tokenURI, payloadString, axiosConfig);
    var accessToken = grant.data.access_token;
    var instanceUrl = grant.data.instance_url;
    console.log('access_token:', accessToken);
    console.log('instance_url:', instanceUrl);
    const axiosConfigGET = {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
    };
    const getURL = instanceUrl+'/services/data/v54.0/query/?q=SELECT+FirstName,LastName,Email+FROM+Contact+LIMIT+10';
    console.log('getURL:',getURL);
    const result = await axios.get(getURL, axiosConfigGET);
    res.json(result.data);
  } catch (err) {
    console.log('error');
    //console.log(err);
    res = err.data;
  }
}

);

module.exports = router;