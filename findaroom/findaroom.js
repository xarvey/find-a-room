var IMAGE_KEY = "qrcode-img";

var gCtx = null;
var gCanvas = null;
var dCanvas = null;

var Rooms = new Meteor.Collection("rooms");
var Facilities = new Meteor.Collection("facilities");
var Buildings = new Meteor.Collection("buildings");
var Lines = new Meteor.Collection("lines"); // for navigation.
var Messages = new Meteor.Collection("messages"); // for public messages.
var current_bldg; // this varibale will be initailed with the GPS
var current_bldg_img;
<<<<<<< HEAD

var helper = [];
var toBeHelped = [];
=======
var Sugg = [];
>>>>>>> 4b8979ddaae41124b93c2b96a93731b5b39d7da5

var mapcanvas = null;
    mapcontext = null;
    imageObj = null;

var posx,posy;


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
      Rooms.insert( { bldg: "LWSN", floor : "B", room: "131", xpix: 304, ypix: 1183, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "130", xpix: 397, ypix: 1130, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "128", xpix: 397, ypix: 1275, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "129", xpix: 303, ypix: 1235, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "116", xpix: 395, ypix: 1420, popular: true } );
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
    if(Lines.find().count() == 0) {
        Lines.insert( { bldg: "LWSN", floor: "B", xpix: 88, ypix: 1486, description: "You should see the exit" });
        Lines.insert( { bldg: "LWSN", floor: "B", xpix: 354, ypix: 1486, description: "You should see Room 116" });
        Lines.insert( { bldg: "LWSN", floor: "B", xpix: 354, ypix: 37, description: "You should see a vending machine" });
        Lines.insert( { bldg: "LWSN", floor: "B", xpix: 487, ypix: 37, description: "You should see the exit" });
    }
  })
}


function getPointPercent(p) //get a point and return the percentage.
{
    var x = p.xpix/761;
    var y = p.ypix/1761;
    var pointPer={xper:x, yper:y};
    return pointPer;
}

// function finding a point () say given a point p {int xpix, int ypix}

function closestNode(p)
{
    var l;
    var distance = new Array(4);
    for(i = 0; i < 4; i++) {
      l = Lines.findOne( { bldg: "LWSN", floor: "B"}, {skip:i});
      if (l == null)  break;
      distance[i] = Math.sqrt((l.xpix-p.xpix)*(l.xpix-p.xpix)+(l.ypix - p.ypix)*(l.ypix - p.ypix));
    }
    var closest = 0;
    for(i = 1; i < 4; i++) {
      if(distance[i] < distance[closest])
          closest = i;
    }
    l = Lines.findOne( { bldg: "LWSN", floor: "B"},{skip:closest});
    var node = {xpix:l.xpix, ypix:l.ypix};
    var pclose = {xpix:p.xpix, ypix:p.ypix};
    if(Math.abs(pclose.xpix-node.xpix) < Math.abs(pclose.ypix-node.ypix))
      pclose.xpix = node.xpix;
    else if(Math.abs(pclose.xpix-node.xpix) == Math.abs(pclose.ypix-node.ypix))
      pclose.xpix = -1;
    else
      pclose.ypix = node.ypix;
    var closePoints= [node,pclose];
    return closePoints; // closest node is [0], the corresponding room pixels is [1];
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

function make_point(x,y)
{

    var coordinate;
    coordinate=(
        {"xpix":x,
         "ypix":y
        });
    return coordinate;
}

function on_the_line(x1,y1,x2,y2,x3,y3) //check if (x3,y3) is on segment (x1,y1), (x2,y2) now only for straight line
{
    if ((x3==x1) && (x3==x2))
    {
        yhat1=y3-y1;
        yhat2=y3-y2;
        
//        alert(yhat1*yhat2);
        if (yhat1*yhat2<0)
            return true;
    }
    
    if ((y3==y1) && (y3==y2))
    {
        xhat1=x3-x1;
        xhat2=x3-x2;
      //  alert(xhat1*xhat2);
        if (xhat1*xhat2<0)
            return true;
    }
    if (x1==x2 && y1==y2)
        return true;
    return false;
}

function check_the_turn(x0,y0,x1,y1,x2,y2) //1 left -1  right
{
    ans=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0);   
    if (ans>0) return 1;
    if (ans==0) return 0;
    if (ans<0) return -1;
}
function find_destination(startx,starty,endx,endy)
{
    start_point=make_point(startx,starty);
    end_point=make_point(endx,endy);
    
    console.log(start_point.xpix);
    
    startx=closestNode(start_point)[0].xpix;
    starty=closestNode(start_point)[0].ypix;
    
    endx=closestNode(end_point)[0].xpix;
    endy=closestNode(end_point)[0].ypix;
    
    
    
    var queue=[];
    queue.push({coordinate:make_point(startx,starty),prev:0,distance:0});
    
    nowx=startx;
    nowy=starty;
    head=0;
    tail=0;
    while (nowx!=endx && nowy!=endy)
    {
        for (counter=0;;counter++)
        {
            var current=Lines.findOne({'$or': [ {'xpix':nowx ,'ypix' : {$ne : nowy} }, { 'ypix': nowy, 'xpix' : {$ne : nowx}}]} ,{skip:counter});  // nowx==xpix xor nowy==ypix
                                               
                                    //make sure the x and y is the same in the future
            if (current==null) break;
            tail+=1;
            queue.push({xpix:current.xpix,ypix:current.ypix,prev:head,distance:queue[head].distance+1});
        }
        head+=1;
        nowx=queue[head].xpix;
        nowy=queue[tail].ypix;
    }
    
    now=tail;
    point_list=[];
    point_list.push({xpix:endx,ypix:endy});
    for (counter=0;;counter++)
    {
  //      alert("now "+now+" "+"xpix "+queue[now].xpix+"ypix "+queue[now].ypix);
     
        if (now==0)
            break;
        point_list.unshift({xpix:queue[now].xpix,ypix:queue[now].ypix});
        now=queue[now].prev;
        
        //alert(now);
    }
    point_list.unshift({xpix:startx,ypix:starty});
    

    
    length=point_list.length;
    flag=0;
    
    if ((length==2) && (point_list[0].xpix==point_list[1].xpix) && (point_list[0].ypix==point_list[1].ypix))
        flag=1;
                                                                   
    if (on_the_line(point_list[0].xpix,point_list[0].ypix,point_list[1].xpix,point_list[1].ypix,closestNode(start_point)[1].xpix,closestNode(start_point)[1].ypix)==true || flag==1)
    {
        point_list[0].xpix=closestNode(start_point)[1].xpix;
        point_list[0].ypix=closestNode(start_point)[1].ypix;
        
    }
    else
    {
        point_list.unshift({xpix:closestNode(start_point)[1].xpix,ypix:closestNode(start_point)[1].ypix});
    }
    
    if (on_the_line(point_list[length-1].xpix,point_list[length-1].ypix,point_list[length-2].xpix,point_list[length-2].ypix,closestNode(end_point)[1].xpix,closestNode(end_point)[1].ypix)==true || flag==1)
    {
        point_list[length-1].xpix=closestNode(end_point)[1].xpix;
        point_list[length-1].ypix=closestNode(end_point)[1].ypix;
    }
    else
    {
        point_list.push({xpix:closestNode(end_point)[1].xpix,ypix:closestNode(end_point)[1].ypix});
    }
    
    //alert("nearest node"+closestNode(start_point)[1].xpix+"y: "+closestNode(start_point)[1].ypix);
    
    point_list.unshift({xpix:start_point.xpix,ypix:start_point.ypix});
    point_list.push({xpix:end_point.xpix,ypix:end_point.ypix});
    
    instruction_list=[]
    for (i=1; i<point_list.length-1; i++)
    {
       //alert(point_list[i].xpix+"  "+point_list[i].ypix); //alert(check_the_turn(point_list[0].xpix,point_list[0].ypix,point_list[1].xpix,point_list[1].ypix,point_list[2].xpix,point_list[2].ypix));
        string=""
       if (Lines.findOne({xpix:point_list[i].xpix,ypix:point_list[i].ypix})!=null)
         string=Lines.findOne({xpix:point_list[i].xpix,ypix:point_list[i].ypix}).description+"then turn";
        else
            if (i==1)
                string="Go to the hall way, go straight while make sure the room is on your ";
            else string="The destination is on your " ;
        
     if (check_the_turn(point_list[i-1].xpix,point_list[i-1].ypix,point_list[i].xpix,point_list[i].ypix,point_list[i+1].xpix,point_list[i+1].ypix)==-1)
            string=string+"left";
        else
            string=string+"right";
        instruction_list.push({xpix:point_list[i].xpix,ypix:point_list[i].ypix,instruction:string})
        
    }
    console.log(instruction_list);
    return instruction_list;
    
    
}

function autofill_room(result)
{
  Sugg = [];
  var rs;
  var auto = [];
    current_bldg=Session.get("bldg");
 for (counter=0;counter < 5;counter++)
    {
  if(result.length == 1)
   rs = Rooms.findOne( { bldg: current_bldg, floor: result, popular: true }, {skip:counter, _id: 0, floor: 1, room: 1});
  else
   rs = Rooms.findOne( {bldg: current_bldg, floor: result.substring(0,1), room: { $regex : ".*" +result.substring(1) + ".*" }},       {skip:counter, _id: 0, floor: 1, room: 1});
        if (rs==null) break;
         var string=rs.floor+rs.room;
        auto.push(string);
        Sugg.push(string);
    }
    if(Sugg.length == 0)
    {
        Sugg[0] = "No Match Found";
    }
    Session.set("sugg", Sugg);
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

function drawLine(x1, y1, x2, y2)
{
  gCanvas = document.getElementById("draw-line");
  console.log("draw a line");
  var ctx = gCanvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#4780A6';
  ctx.stroke();
}

// simple-todos.js
if (Meteor.isClient) {
  // This code only runs on the client
  //find_destination(308,361,396,349);
  Template.home.created = function(){
    if(Session.get("scan")==1)
      drawStuff();
    $(function() {
    $(window).on('resize', function resize()  {
        $(window).off('resize', resize);
        setTimeout(function () {
            var content = $('#mid-window');
            console.log("center");
            var top = (window.innerHeight - content.height()) / 2;
            content.css('top', Math.max(0, top) + 'px');
            $(window).on('resize', resize);
        }, 50);
    }).resize();
   });
  };

  Meteor.startup(function () {
    Session.set("posX", 160);
    Session.set("posY", -100);
    Session.set("navTop",-200+"px");
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
    },
    navTop: function(){
      return Session.get("navTop"); 
    },
    getSugg: function(){
      if(Session.get("navReady") !== 1)
      return Session.get("sugg");
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
        $( document ).ready(function() {
          console.log( "ready!" );
          $('html, body').animate({
            scrollTop: (posy*320/800-50)+"px"
          }, 800);
        });
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

        psx= response.xpix;
        psy= response.ypix;

        Session.set("posX", psx);
        Session.set("posY", psy);
        Session.set("destination", re );
        template.find(".search-main").blur();
        $("#search-main")
          .css("font-weight","bold")
          .css("font-size","14px");
        $(".fa-search").css("color","rgb(195, 219, 137)").addClass("fa-check");;
        Session.set("navReady",1);
        $( document ).ready(function() {
          console.log( "ready!" );
          $('html, body').animate({
            scrollTop: (psy*320/800-50)+"px"
          }, 800);
        });
        //drawLine(posx*320/800+'px', posy*320/800+'px', Session.get("posX")*320/800+'px', Session.get("posY")*320/800+'px')
        return false;
    },

    'keyup .search-dest': function(event) {

       // console.log( document.getElementById('search-main').value );

        autofill_room(document.getElementById('search-main').value);
    },
    
    'click .startnav': function(event){
        
        
        start=Session.get("location");
        dest=Session.get("destination");
        var f = start .charAt(0);
        var r = start.substring(1);

        var start_document = Rooms.findOne( { room: r, floor: f });
        var f = dest .charAt(0);
        var r = dest.substring(1);

        var dest_document = Rooms.findOne( { room: r, floor: f });
        find_destination(start_document.xpix,start_document.ypix,dest_document.xpix,dest_document.ypix);
        
        Session.set("navTop",0); 
        Session.set("navReady",0);
        
    },
    
    'click .closebtn': function(event){
        Session.set("navTop",-200+"px"); 
    },
    
    'click .setDestination': function(event){
      
      
        var re = event.target.textContent;
        
        var f = re.charAt(0);
        var r = re.substring(1);

        var response = Rooms.findOne( { room: r, floor: f },{_id:0,xpix:1});

        psx= response.xpix;
        psy= response.ypix;

        Session.set("posX", psx);
        Session.set("posY", psy);
        Session.set("destination", re );
        Sugg = [];
        Session.set("sugg",Sugg);
        $("#search-main").blur();
        $("#search-main")
          .css("font-weight","bold")
          .css("font-size","14px");
        $(".fa-search").css("color","rgb(195, 219, 137)").addClass("fa-check");;
        $("#search-main").val(re);
        Session.set("navReady",1);
        
         $( document ).ready(function() {
          console.log( "ready!" );
          $('html, body').animate({
            scrollTop: (psy*320/800-50)+"px"
          }, 800);
        });
      
    } 

  });

}
