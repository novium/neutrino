// Publish code

Meteor.publish('Client', function(client_id) {
  return Clients.find(client_id, {fields: {client_secret: 0}});
});

Meteor.publish('authCodes', function() {
  user_id = this.userId;
  return authCodes.find({user_id: user_id});
});
