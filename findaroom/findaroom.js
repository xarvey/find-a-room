var IMAGE_KEY = "qrcode-img";

var gCtx = null;
var gCanvas = null;

function initCanvas(w,h)
{
    gCanvas = document.getElementById("qr-canvas");
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
    console.log("done");
}

function load()
{
  console.log("YEAH:)");
  initCanvas(800,600);
}


// simple-todos.js
if (Meteor.isClient) {
  // This code only runs on the client
  console.log("Client");

    /** Since my laptop can't get the current location,
    latLng() returns null)**/
    alert(Geolocation.latLng());
    console.log("GPS");


  Template.body.helpers({
    tasks: [
      { text: "This is task 1" },
      { text: "This is task 2" },
      { text: "This is task 3" }
    ],

  });

  Meteor.startup(function () {
    load();
  });

  Template.home.helpers({
    current_map: "LWSN_1.jpg",
    current_building: "Lawson B",
    scanned: function(){
      return Session.get("scan");
    },
  });


  Template.home.events({
    'click .scan-qr': function() {

      MeteorCamera.getPicture({width: 320}, function(error, data) {
        if (error)
          alert(error.reason);
        else{
          qrcode.callback = function(result){
              alert(result);
              if(result.search("error")==-1)
                Session.set("scan", 1);
          };
          gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
          qrcode.decode(data);
        }
      });
    },
    'submit .new-task': function(event) {
      Session.set("scan",1);
      alert(event.target.text.value);
      return false;
    },
  });

}
