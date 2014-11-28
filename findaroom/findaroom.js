var IMAGE_KEY = "qrcode-img";

var gCtx = null;
var gCanvas = null;

var Rooms = new Meteor.Collection("rooms");
var Facilities = new Meteor.Collection("facilities");
var Buildings = new Meteor.Collection("buildings");

var current_bldg; // this varibale will be initailed with the GPS
var current_bldg_img;

//auto fill
//   let's say the string is called "result"
//   so it's


var mapcanvas = null;
    mapcontext = null;
    imageObj = null;

var posx,posy;

if (Meteor.isServer) {
  Meteor.startup(function (){
    if(Buildings.find().count == 0) {
      Buildings.insert( { bldg: "LWSN", lowLatitude: 40.428189, highLatitude: 40.427397, lowLongitude: -86.917201, highLongitude:  -86.916739 } )
      Buildings.insert( { bldg: "HICKS", lowLatitude: 40.428189, highLatitude: 40.427397, lowLongitude: -86.917201, highLongitude:  -86.916739 } )

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
      Rooms.insert( { bldg: "LWSN", floor : "B", room: "131", xpix: 304, ypix: 1183, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "130", xpix: 397, ypix: 1130, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "128", xpix: 397, ypix: 1275, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "129", xpix: 303, ypix: 1235, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "116", xpix: 395, ypix: 1520, popular: true } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "105", xpix: 219, ypix: 1457, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "107", xpix: 250, ypix: 1458, popular: false } );

    }
    if(Facilities.find().count() == 0) {

         Facilities.insert( { bldg: "LWSN", floor: "B",type:"Restroom" ,xpix: 288, ypix: 70 }); // restroom
         Facilities.insert( { bldg: "LWSN", floor: "B",type:"Restroom", xpix: 446, ypix: 1318} );    // restroom
         Facilities.insert( { bldg: "LWSN", floor: "B",type:"Exit",room:"2", xpix: 88, ypix: 1452 });   //exit
         Facilities.insert({ bldg: "LWSN", floor: "B",type:"Exit",room:"0", xpix: 492, ypix: 33 }); //exit
         Facilities.insert({ bldg: "LWSN", floor: "B",type:"Elevator",room:"1", xpix: 317, ypix: 800 });    //elevator

    }
  })
}



function restroom()
{

    var locations_coordinate=[];
    for (counter=0;;counter++)
    {

    var current=Facilities.findOne({bldg:"LWSN",type:"Restroom"},{skip:counter});

    if (current==null) break;
  //  alert(current.xpix);
//    alert(current.ypix);

    locations_coordinate.push(
        {"xpix":current.xpix*320/800+"px",
         "ypix":current.ypix*320/800+"px"
        })
    }
   // alert(locations_coordinate[0].xpix);
    return locations_coordinate;
}

function autofill_room(result)
{
  var rs;
  var auto = [];
    current_bldg=Session.get("bldg");
 for (counter=0;;counter++)
    {
  if(result.length == 1)
   rs = Rooms.findOne( { bldg: current_bldg, floor: result, popular: true }, {skip:counter, _id: 0, floor: 1, room: 1});
  else
   rs = Rooms.findOne( {bldg: current_bldg, floor: result.substring(0,1), room: { $regex : ".*" +result.substring(1) + ".*" }},       {skip:counter, _id: 0, floor: 1, room: 1});
        if (rs==null) break;
         var string=rs.floor+rs.room;
        auto.push(string);
    }
    console.log(auto);
    return auto;
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
  initCanvas(800,600);
  Session.set("navReady",0);
}

// simple-todos.js
if (Meteor.isClient) {
  // This code only runs on the client

  Template.home.created = function(){
    if(Session.get("scan")==1)
      drawStuff();

  };

  Meteor.startup(function () {
    Session.set("posX", 160);
    Session.set("posY", -100);
    load();
  });
  Meteor.setInterval(function() {
    navigator.geolocation.getCurrentPosition(function(position) {

        Session.set('lat', position.coords.latitude);
        Session.set('lon', position.coords.longitude);
    });
  }, 300);
/**  Template.location.helpers({
    lat: function() { return Session.get('lat'); },
    lon: function() { return Session.get('lon'); }
  }); **/

  Template.home.helpers({
    current_map: function(){
      return Session.get("mapimg");
    },
    current_building: function(){
      return Session.get("bldg");
    },
    scanned: function(){
      return Session.get("scan");
    },

    getPosX: function(){
      return posx*320/800+'px';
    },
    getPosY: function(){
      return posy*320/800+'px';
    },

    getRestRoom: function(){
      return restroom();
    },

    getDesX: function(){
      return Session.get("posX")*320/800+'px';
    },
    getDesY: function(){
      return Session.get("posY")*320/800+'px';
    },

    nameCur: function(){
      return Session.get("location");
    },
    nameDes: function(){
      return Session.get("destination");
    },
    navReady: function(){
      return Session.get("navReady"); 
    }
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

                Session.set("scan", 1);

                posx= Facilities.findOne( { bldg:  split[0] , floor:  split[1], room: split[2] },{_id:0,xpix:1}).xpix;
                posy= Facilities.findOne( { bldg:  split[0] , floor:  split[1], room: split[2] },{_id:0,ypix:1}).ypix;

                Session.set("bldg", split[0]);
                Session.set("mapimg", split[0]+"_"+split[1]+".jpg");
                Session.set("location", split[2] );

              }
          };
          gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
          qrcode.decode(data);
        }
      });
    },
    'click .gps': function(){
        // return 0, 0 if the location isn't ready

      //Geolocation.latLng() || { lat: 0, lng: 0 };
//      error: Geolocation.error
      var latitude = Session.get('lat');
      var longitude = Session.get('lon');
      //alert( latitude);
      //alert( longitude);
      /**Okey, hard coding starts ...**/
      current_bldg = Buildings.findOne( { highLatitude: { $gte: lat}, lowLatitude: { $lte: lat}, highLongitude: { $gte: log}, lowLongitude: { $lte: log} }, { _id: 0, bldg: 1} );
    },
    'submit .new-task': function(event) {
        
        result=event.target.text.value.replace(/\s+/g, '');
        var f = result.charAt(0);
        var r = result.substring(1);

        var response = Rooms.findOne( { room: r, floor: f },{_id:0,xpix:1});
      
        if(response==undefined){
          alert("Room not found");
          return false;
        }
      
        Session.set("scan",1);

        posx= response.xpix;
        posy= response.ypix; // only know the room and floor
                // Room.findOne( { bldg: b, fllor: f, room: r}, {_id:0,xpix:1}).xpix;
                // Room.findOne( { bldg: b, fllor: f, room: r}, {_id:0,ypix:1}).ypix;

        Session.set("bldg", response.bldg);
        Session.set("mapimg", response.bldg+"_"+response.floor+".jpg");
        Session.set("location", result );

        return false;
    },

    'click .backbtn': function(){
        Session.set("scan",0);
        Session.set("posX", 160);
        Session.set("posY", -100);
        Session.set("navReady",0);
    },
    'blur .search-dest': function(){
        $(".fa-search")
          .css("color","rgb(231, 231, 231)");
    }
    ,
    'focus .search-dest': function(){
        $("#search-main")
          .css("background-color","rgba(255,255,255,0.94)")
          .css("color","rgb(16,16,16)")
          .css("font-weight","normal")
          .css("font-size","13px");
        $(".fa-search")
          .css("color","rgb(208, 232, 149)")
          .removeClass("fa-check")
          .removeClass("fa-times");
        Session.set("navReady",0);
    },
    'click .fa-times': function(){
        $("#search-main").val("").focus(); 
    },
    'click .dest_desc': function(){
        if( Session.get("navReady")!=0)
          Session.set("navReady",0);
        else  
          Session.set("navReady",1);
    },
    'submit .search-dest': function(event, template) {
        Session.set("scan",1);
        var re = event.target.text.value.replace(/\s+/g, '');
      
        var f = re.charAt(0);
        var r = re.substring(1);

        var response = Rooms.findOne( { room: r, floor: f },{_id:0,xpix:1});

         if(response==undefined){
        
            template.find(".search-main").blur();
           
            $("#search-main")
              .css("background-color","rgb(232, 149, 149)")
              .css("color","rgb(136, 15, 15)")
              .css("font-weight","bold")
              .css("font-size","14px");
            $(".fa-search").css("color","rgb(174, 40, 40)")
              .addClass("fa-times");
            Session.set("navReady",0); 
            Session.set("posX", 160);
            Session.set("posY", -100);
           
            return false;
         }
      
        posx= response.xpix;
        posy= response.ypix;

        Session.set("posX", posx);
        Session.set("posY", posy);
        Session.set("destination", re );
        template.find(".search-main").blur();
        $("#search-main")
          .css("background-color","rgb(208, 232, 149)")
          .css("color","rgb(100, 136, 15)")
          .css("font-weight","bold")
          .css("font-size","14px");
        $(".fa-search").css("color","rgb(134, 174, 40)").addClass("fa-check");;
        Session.set("navReady",1);
        
        return false;
    },

    'keyup .search-dest': function(event) {

       // console.log( document.getElementById('search-main').value );

        autofill_room(document.getElementById('search-main').value);
    },

  });
  
}
