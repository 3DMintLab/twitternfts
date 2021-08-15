import Twitter from 'twitter-lite';
import env from 'dotenv';
import axios from 'axios'


if (process.env.NODE_ENV !== 'production') {
    env.config();
    console.log('dot env config');
}

const client = new Twitter({
    subdomain: "api", // "api" is the default (change for other subdomains)
    version: "1.1", // version "1.1" is the default (change for other subdomains)
    consumer_key: process.env.API_KEY, // from Twitter.
    consumer_secret: process.env.API_SECRET, // from Twitter.
});

export const authenticate = (request, response) => {
    if (process.env.NODE_ENV !== 'production') {
        response.redirect('/callback_mockup');
        return;
    }
    client
    .getRequestToken("https://twitternfts.herokuapp.com/callback")
    .then(res =>
        {
            console.log({
                reqTkn: res.oauth_token,
                reqTknSecret: res.oauth_token_secret
            ***REMOVED***
            response.redirect('https://api.twitter.com/oauth/authenticate?oauth_token='+res.oauth_token);
        }
    )
    .catch(console.error);
}

export const callback = (request, response) => {
    const oauthToken = request.query.oauth_token
    const oauthVerifier = request.query.oauth_verifier
    client
    .getAccessToken({
        oauth_verifier: oauthVerifier,
        oauth_token: oauthToken
***REMOVED***
    .then(res => {
        const callbackresponse = {
                    accTkn: res.oauth_token,
                    accTknSecret: res.oauth_token_secret,
                    userId: res.user_id,
                    screenName: res.screen_name
        }            
        response.redirect('/callback.html?accTkn='+callbackresponse.accTkn+'&accTknSecret='+callbackresponse.accTknSecret+'&userId='+callbackresponse.userId+'&screenName='+callbackresponse.screenName);
    }
       
  )
  .catch(console.error);
}

export const callback_mockup = (request, response) => {
     var callback = {
        accTkn:"999999999-RQDZZCVCVXCVXCVXCV",
        accTknSecret:"XXXXXXXX.....XXXXXXXX",
        userId:"99999999999",
        screenName:"CheffWallets"
    };
    response.redirect('/callback.html?accTkn='+callback.accTkn+'&accTknSecret=XXXXXXXX.....XXXXXXXX&userId='+callback.userId+'&screenName='+callback.screenName);
}

export const tweets = (request, response) => {
    const userid = request.query.userid
    axios.get(`https://api.twitter.com/2/users/${userid}/tweets`, { headers: {
        'Content-Type': 'application/json',
        'Authorization':  'Bearer '+process.env.BEARER
      }}).then(function (res) {
        response.status(200).send(res.data);
  ***REMOVED***.catch(function (error) {
        var data = error.response.data;
        response.status(500).send(data);
***REMOVED***
}

export const verify = (request, response) => {
    const tweetid = request.query.tweetid
    axios.get(`https://api.twitter.com/2/tweets?ids=${tweetid}&tweet.fields=author_id`, { headers: {
        'Content-Type': 'application/json',
        'Authorization':  'Bearer '+process.env.BEARER
      }}).then(function (res) {
        response.status(200).send(res.data);
  ***REMOVED***.catch(function (error) {
        var data = error.response.data;
        response.status(500).send(data);
***REMOVED***
}