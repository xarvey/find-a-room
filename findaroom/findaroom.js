var IMAGE_KEY = "qrcode-img";

var gCtx = null;
var gCanvas = null;

var Rooms = new Meteor.Collection("rooms");
var Facilities = new Meteor.Collection("facilities");
var Buildings = new Meteor.Collection("buildings");

var current_bldg;
var current_bldg_img;

var mapcanvas = null;
    mapcontext = null;
    imageObj = null;

if (Meteor.isServer) {
  Meteor.startup(function (){
    if(Buildings.find().count == 0) {
      Buildings.insert( { bldg: "LWSN", lowLatitude: 40.428189, highLatitude: 40.427397, lowLongitude: -86.917201, highLongitude:  -86.916739 } )
      // 40.428189      40.427397           -86.916739,    -86.917201
      //say your GPS passes lat, log. The following should return the string. "LWSN"
//      Buildings.findOne( { highLatitude: { $gte: lat}, lowLatitude: { $lte: lat}, highLongitude: { $gte: log}, lowLongitude: { $lte: log} }, { _id: 0, bldg: 1} );
    }
    if(Rooms.find().count() == 0) {
      Rooms.insert( { bldg: "LWSN", floor: "B", room: "160", xpix: 399, ypix: 289, popular: true } );
      Rooms.insert( { bldg: "LWSN", floor: "B", room: "158", xpix: 396, ypix: 349, popular: true } );
      Rooms.insert( { bldg: "LWSN", floor: "B", room: "155", xpix: 308, ypix: 361, popular: false } );
      Rooms.insert( { bldg: "LWSN", floor: "B", room: "153", xpix: 306, ypix: 490, popular: false } );
      Rooms.insert( { bldg: "LWSN", floor: "B", room: "151", xpix: 312, ypix: 635, popular: true } );
      Rooms.insert( { bldg: "LWSN", floor: "B", room: "148", xpix: 401, ypix: 666, popular: true } );
      Rooms.insert( { bldg: "LWSN", floor: "B", room: "146", xpix: 401, ypix: 705, popular: true } );
      Rooms.insert( { bldg: "LWSN", floor: "B", room: "138", xpix: 392, ypix: 924, popular: false } );
      Rooms.insert( { bldg: "LWSN", floor: "B", room: "136", xpix: 398, ypix: 1000, popular: false } );
      Rooms.insert( { bldg: "LWSN", floor: "B", room: "134", xpix: 428, ypix: 1030, popular: true } );
      Rooms.insert( { bldg: "LWSN", floor: "B", room: "132", xpix: 434, ypix: 1080, popular: false } );
      Rooms.insert( { bldg: "LWSN", floor: "B", room: "131", xpix: 304, ypix: 1153, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "130", xpix: 397, ypix: 1110, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "128", xpix: 397, ypix: 1235, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "129", xpix: 303, ypix: 1200, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "116", xpix: 395, ypix: 1520, popular: true } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "105", xpix: 219, ypix: 1457, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "107", xpix: 250, ypix: 1458, popular: false } );

    }
    if(Facilities.find().count() == 0) {

         Facilities.insert( { bldg: "LWSN", floor: "B", xpix: 288, ypix: 70 }); // restroom
         Facilities.insert( { bldg: "LWSN", floor: "B", xpix: 446, ypix: 1318} );    // restroom
         Facilities.insert( { bldg: "LWSN", floor: "B",room:"2", xpix: 88, ypix: 1452 });   //exit
         Facilities.insert({ bldg: "LWSN", floor: "B",room:"0", xpix: 492, ypix: 33 }); //exit
         Facilities.insert({ bldg: "LWSN", floor: "B",room:"1", xpix: 317, ypix: 800 });    //elevator

    }
  })
}



function get_x_y(result)
{

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
  console.log("YEAH:)");
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
    ],
  });

  Meteor.startup(function () {
    load();
  });
  Meteor.setInterval(function() {
    navigator.geolocation.getCurrentPosition(function(position) {

        Session.set('lat', position.coords.latitude);
        Session.set('lon', position.coords.longitude);
    });
  }, 800);
/**  Template.location.helpers({
    lat: function() { return Session.get('lat'); },
    lon: function() { return Session.get('lon'); }
  }); **/

  Template.home.helpers({
    current_map: function(){
      return current_bldg_img;
    },
    current_building: function(){
      return current_bldg;
    },
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


                var split = result.split("_"); 
            
               //find the posx and posy from result
                alert(result);
                
              if(result.search("error")==-1){
                var split = result.split("_");
                var posx= Rooms.findOne( { bldg:  split[0] , floor:  split[1] , room:  split[2]},{_id:0,xpix:1});
                var posy= Rooms.findOne( { bldg:  split[0] , floor:  split[1] , room:  split[2]},{_id:0,ypix:1});

               //find the posx and posy from result
                alert(posx,posy);

              if(result.search("error")==-1)
                Session.set("scan", 1);
                
                var posx= Facilities.findOne( { bldg:  split[0] , floor:  split[1], room: split[2] },{_id:0,xpix:1}).xpix; 
                var posy= Facilities.findOne( { bldg:  split[0] , floor:  split[1], room: split[2] },{_id:0,ypix:1}).ypix; 
                
                current_bldg = split[0];
                current_bldg_img=split[0]+"_"+split[1]+".jpg";
                
              }
          };
          gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
          qrcode.decode(data);
        }
      });
    },
    'click .gps': function(){
      //alert("here");
        // return 0, 0 if the location isn't ready

      //Geolocation.latLng() || { lat: 0, lng: 0 };
      error: Geolocation.error
      alert( Session.get('lat'));
      alert( Session.get('lon'));
    },
    'submit .new-task': function(event) {
      Session.set("scan",1);
      alert(event.target.text.value);
        result=event.target.text.value;
        var f = result.charAt(0);
        var r = result.substring(1);
        //var split = result.split("_"); 
        var posx= Rooms.findOne( { room: r, floor: f },{_id:0,xpix:1}).xpix; 
        var posy= Rooms.findOne( { room: r, floor: f},{_id:0,ypix:1}).ypix; // only know the room and floor
                // Room.findOne( { bldg: b, fllor: f, room: r}, {_id:0,xpix:1}).xpix;
                // Room.findOne( { bldg: b, fllor: f, room: r}, {_id:0,ypix:1}).ypix;
             
        var split = result.split("_");
        var posx= Facilities.findOne( { bldg:  split[0] , floor:  split[1] , room:  split[2]},{_id:0,xpix:1}).xpix;
        var posy= Facilities.findOne( { bldg:  split[0] , floor:  split[1] , room:  split[2]},{_id:0,ypix:1}).ypix;


        alert(posx,posy);

      return false;
    },
  });

}

function drawStuff() {
    alert("CALLED");
    // do your drawing stuff here
    mapcanvas = document.getElementById('map_canvas');
    mapcontext = canvas.getContext('2d');
  
    mapcanvas.width = window.innerWidth;
    mapcanvas.height = window.innerHeight;

    imageObj = new Image();
    imageObj.onload = function() {
      mapcontext.drawImage(imageObj,0,0);
      mapcontext.beginPath();
      mapcontext.arc(posx, posy, 20, 0, 2 * Math.PI, false);
      mapcontext.fillStyle = 'green';
      mapcontext.fill();
    }
    imageObj.src = current_bldg_img;
    
}
