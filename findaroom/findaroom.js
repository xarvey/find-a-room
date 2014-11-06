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
          { bldg: "LWSN", floor: "B", room: "160", xpix: 399, ypix: 289, popular: true},
          { bldg: "LWSN", floor: "B", room: "158", xpix: 396, ypix: 349, popular: true},
          { bldg: "LWSN", floor: "B", room: "155", xpix: 308, ypix: 361, popular: false},
          { bldg: "LWSN", floor: "B", room: "153", xpix: 306, ypix: 490, popular: false},
          { bldg: "LWSN", floor: "B", room: "151", xpix: 312, ypix: 635, popular: true},
          { bldg: "LWSN", floor: "B", room: "148", xpix: 401, ypix: 666, popular: true},
          { bldg: "LWSN", floor: "B", room: "146", xpix: 401, ypix: 705, popular: true },
          { bldg: "LWSN", floor: "B", room: "138", xpix: 392, ypix: 924, popular: false},
          { bldg: "LWSN", floor: "B", room: "136", xpix: 398, ypix: 1000, popular: false},
          { bldg: "LWSN", floor: "B", room: "134", xpix: 428, ypix: 1030, popular: true},
          { bldg: "LWSN", floor: "B", room: "132", xpix: 434, ypix: 1080, popular: false},
          { bldg: "LWSN", floor: "B", room: "131", xpix: 304, ypix: 1153, popular: false},
          { bldg: "LWSN", floor: "B", room: "130", xpix: 397, ypix: 1110, popular: false},
          { bldg: "LWSN", floor: "B", room: "128", xpix: 397, ypix: 1235, popular: false},
          { bldg: "LWSN", floor: "B", room: "129", xpix: 303, ypix: 1200, popular: false},
          { bldg: "LWSN", floor: "B", room: "116", xpix: 395, ypix: 1520, popular: true},
          { bldg: "LWSN", floor: "B", room: "105", xpix: 219, ypix: 1457, popular: false},
          { bldg: "LWSN", floor: "B", room: "107", xpix: 250, ypix: 1458, popular: false}
        ])
    }
    if(Facilities.find().count() == 0) {
      Facilities.insert(
        [
          { bldg: "LWSN", floor: "B", xpix: 288, ypix: 70},   // restroom
          { bldg: "LWSN", floor: "B", xpix: 446, ypix: 1318},    // restroom
          { bldg: "LWSN", floor: "B", xpix: 88, ypix: 1452},   //exit
          { bldg: "LWSN", floor: "B", xpix: 492, ypix: 33}, //exit
          { bldg: "LWSN", floor: "B", xpix: 317, ypix: 800}    //elevator
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
 //               Rooms.find( { popular: true })    popular destination.
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
