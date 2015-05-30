// Auth template code

Template.auth.events({
  'click #accept': function(event) {
    event.preventDefault();
    $(event.target).button('loading');
    var client_id = Session.get('auth').client_id;
    authCodes.insert({client_id: client_id}, function(error, result) {
      if(!error) {
        sAlert.success('authorized.', {position: 'bottom', timeout: 700});
        var auth_code = authCodes.findOne(result).auth_code;
        setTimeout(function(){
          window.location.replace(Clients.findOne(Session.get('auth').client_id).redirect_uri + '?code=' + auth_code);

          // meh.
          setTimeout(function() {
            sAlert.error('this seems to take some time, click <a href="' + Clients.findOne(Session.get('auth').client_id).redirect_uri + '?code=' + auth_code + '">this link</a> to continue.', {position: 'bottom', timeout: 0});
          }, 2000);
        }, 500);
      } else {
        sAlert.error('error', {position: 'bottom'});
        $(event.target).button('reset');
      }
    });
  },

  'click #deny': function(event) {
    event.preventDefault();
    $(event.target).button('loading');
    window.location.replace(Clients.findOne(Session.get('auth').client_id).redirect_uri + '?error=' + "denied");
  },

  'click #logout': function() {
    event.preventDefault();
    Meteor.logout();
  }
});
