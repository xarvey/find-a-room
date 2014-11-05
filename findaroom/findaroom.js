var IMAGE_KEY = "qrcode-img";

// simple-todos.js
if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    tasks: [
      { text: "This is task 1" },
      { text: "This is task 2" },
      { text: "This is task 3" }
    ]
  });

  Template.home.events({
    'click .scan-qr': function() {
      qrcode.callback = function(result){
          alert(result);
      };
      MeteorCamera.getPicture({width: 320}, function(error, data) {
        if (error)
          alert(error.reason);
        else{
          Session.set(IMAGE_KEY, data);
          qrcode.decode(data);
        }
      });
    },
  });

}
