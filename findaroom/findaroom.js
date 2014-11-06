var IMAGE_KEY = "qrcode-img";

var gCtx = null;
var gCanvas = null;

Rooms = new Meteor.Collection("rooms");
Facilities = new Meteor.Collection("facilities");

if (Meteor.isServer) {
  Meteor.startup(function (){
    if(Rooms.find().count() == 0) {
      Rooms.insert(
        [
          { bldg: "LWSN", floor: "1", room: "1106", xpix: 11, ypix: 85, popular: true},
          { bldg: "LWSN", floor: "1", room: "1114", xpix: 11, ypix: 85, popular: false},
          { bldg: "LWSN", floor: "1", room: "1123", xpix: 11, ypix: 85, popular: false}
        ])
    }
    if(Facilities.find().count() == 0) {
      Facilities.insert(
        [
          { bldg: "LWSN", floor: "1", xpix: 11, ypix: 85},
          { bldg: "LWSN", floor: "1", xpix: 11, ypix: 85},
          { bldg: "LWSN", floor: "1", xpix: 11, ypix: 85},
          { bldg: "LWSN", floor: "1", xpix: 11, ypix: 85}
        ])
    }
  })
}





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
  console.log("YEAH");
  initCanvas(800,600);
}


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
//              var split = result.split("_"); 
 //             Rooms.find( { bldg: { split[0] }, floor: { split[1] }, room: { split[2] } }); // this is just finding the room
 //               Rooms.find( { bldg: })
//              Facilities.find( { bldg: { split[0] }, floor: { split[1] } }); // finding the facilities.



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
