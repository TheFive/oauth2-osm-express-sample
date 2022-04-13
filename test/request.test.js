const assert = require('assert');


const axios = require('axios');
const { wrapper } = require( 'axios-cookiejar-support');
const { CookieJar } = require( 'tough-cookie');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const nock = require("nock");


function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

require("../server.js");


describe('request server', function () {
    let cookieJar;
    before(function (done){
        cookieJar = new CookieJar();
        async function callCallback() {
            let result = await axios.get("http://127.0.0.1:3000/auth/openstreetmap/callback?code=this-is-the-code");
            console.dir("passport liefert");
            console.dir(result.data);

        }
        
        nock("https://www.openstreetmap.org:443")
          .get("/oauth2/authorize")
          .twice()
          .query({
              redirect_uri:"http://127.0.0.1:3000/auth/openstreetmap/callback",
              scope: "read_prefs",
              response_type:"code",
              client_id:"6o7KbMAXK6wbkNhQfdymPDWsGuEPWVoyLAVJhdK6wq0"
            })
          .reply(200,(uri,requestBody) => {
              console.log("starting callback");
              setTimeout(callCallback,200,"Login Callback") 
              return "this is the login page, answer is started";
          });
        return done();
    });
    it("should get the main page with user name",async function(){
        this.timeout(10000);
        console.log(" First Request started");
        let result = await axios("http://localhost:3000",{cookieJar});
        assert(result.data == "this is the login page, answer is started");
        console.log("Second request started")
        // Zweiter Versuch
        await sleep(3000);

        result = await axios("http://localhost:3000",{cookieJar});
        console.dir(result.data);

    });
});