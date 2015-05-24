// Admin template code

Template.admin.helpers({
  clients: function() {
    return Clients.find();
  }
});
