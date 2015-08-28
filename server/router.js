// server/router.js

// Accepts both POST and GET requests
// I'm not entirely sure that both are needed but I guess
// It doesn't hurt to have both available for now.
Router.route('token', { where: 'server', path: '/token' })
.post(function() {
  var this_token    = this;
  this.response.statusCode = 200;
  this.response.setHeader("Content-Type", "application/json");
  this.response.setHeader("Access-Control-Allow-Origin", "*");
  this.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  var auth_code     = this.request.body.code;
  var client_secret = this.request.body.client_secret;
  var client_id     = this.request.body.client_id;

  if(Clients.findOne({_id: client_id, client_secret: client_secret}) &&  authCodes.findOne({auth_code: auth_code})) {
    var r = authCodes.findOne({auth_code: auth_code});

    accessTokens.insert({client_id: r.client_id, user_id: r.user_id}, function(error, result) {
      var access_token = accessTokens.findOne(result).access_token;
      this_token.response.end(JSON.stringify(
        {
          "access_token": access_token
        }
      ));
    });
    authCodes.remove({auth_code: auth_code});
  } else {
    this.response.end(JSON.stringify(
      {
        "error":"invalid_request"
      }
    ));
  }
})
.get(function() {
  var this_token = this;
  this.response.statusCode = 200;
  this.response.setHeader("Content-Type", "application/json");
  this.response.setHeader("Access-Control-Allow-Origin", "*");
  this.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  var auth_code = this.params.query.code;
  var client_secret = this.params.query.client_secret;
  var client_id = this.params.query.client_id;

  if(Clients.findOne({_id: client_id, client_secret: client_secret}) &&  authCodes.findOne({auth_code: auth_code})) {
    var r = authCodes.findOne({auth_code: auth_code});

    accessTokens.insert({client_id: r.client_id, user_id: r.user_id}, function(error, result) {
      var access_token = accessTokens.findOne(result).access_token;
      this_token.response.end(JSON.stringify(
        {
          "access_token": access_token
        }
      ));
    });
    authCodes.remove({auth_code: auth_code});
  } else {
    this.response.end(JSON.stringify(
      {
        "error":"invalid_request"
      }
    ));
  }
});
