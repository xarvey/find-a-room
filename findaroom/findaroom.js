var IMAGE_KEY = "qrcode-img";

var gCtx = null;
var gCanvas = null;
var dCanvas = null;

var Userstatus = new Meteor.Collection("userstatus");
var Chatbox = new Meteor.Collection("chatbox");
var Rooms = new Meteor.Collection("rooms");
var Facilities = new Meteor.Collection("facilities");
var Buildings = new Meteor.Collection("buildings");
var Lines = new Meteor.Collection("lines"); // for navigation.
var Messages = new Meteor.Collection("messages"); // for public messages.
var current_bldg; // this varibale will be initailed with the GPS
var current_bldg_img;
var zoominout = 1;
var helper = [];
var toBeHelped = [];
var Sugg = [];
var setLineWidth = 1;

var mapcanvas = null;
    mapcontext = null;
    imageObj = null;

var posx,posy;

var instructions = [];

function setUserStatus(usr, stat) {  // change the user status. if the username wasn't found then adds the username to database.
  Session.set("entername",1);
  if(Userstatus.findOne({user: usr}) == null) {
    Userstatus.insert({ user: usr, status: stat });
  }
  else {
    Userstatus.update({_id: Userstatus.findOne({user: usr})._id}, {user: usr, status: stat});
  }
}

function insertUser(usr) { // adds the user to database, default status off.
  Userstatus.insert({ user: usr, status: 'off' });
}

function getAvailableUser() { // returns an array of current user.
  var user_collection=[];
  for(counter = 0;; counter++) {
    var current=Chatbox.findOne({status: on},{skip:counter});
    if(current==null) break;
    msg_collection.push(
      {'user': current.user});
  }
  return user_collection;
}

function insertMessage(usr, msg) { // returns an array of {user: xxx message: xxx}
  Chatbox.insert({user: usr, message: msg}) ;
}

function getMessage() {
  var msg_collection=[];
  var counter = 0;
  while(1) {
    var current=Chatbox.findOne({},{skip:counter});
    if(current==null) break;
    counter++;
  }

  if(counter < 20){
    counter = 0;
  }
  else
    counter = counter - 20;
  for(;;counter++) {
    var current=Chatbox.findOne({},{skip:counter});
    if(current==null) break;
    msg_collection.push({'user': current.user, 'message': current.message});
  }
  return msg_collection;
}

function remove_user(user_name)
{
    Chatbox.remove({user:user_name});
}

function request_help(user_name,xpix,ypix,message)
{
    Chatbox.insert({user:user_name,xpix:xpix,ypix:ypix,message:message});
}


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
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "105", xpix: 215, ypix: 1488, popular: false } );
      Rooms.insert({ bldg: "LWSN", floor: "B", room: "107", xpix: 250, ypix: 1488, popular: false } );

    }
    if(Facilities.find().count() == 0) {

         Facilities.insert( { bldg: "LWSN", floor: "B",type:"Restroom" ,xpix: 288, ypix: 70 }); // restroom
         Facilities.insert( { bldg: "LWSN", floor: "B",type:"Restroom", xpix: 446, ypix: 1318} );    // restroom
         Facilities.insert( { bldg: "LWSN", floor: "B",type:"Exit",room:"2", xpix: 88, ypix: 1452 });   //exit
         Facilities.insert({ bldg: "LWSN", floor: "B",type:"Exit",room:"0", xpix: 492, ypix: 33 }); //exit
         Facilities.insert({ bldg: "LWSN", floor: "B",type:"Elevator",room:"1", xpix: 317, ypix: 800 });    //elevator
         Facilities.insert({ bldg: "LWSN", floor: "B",type:"Corner",room:"3", xpix: 330, ypix: 1525 }); // bottom wall
         Facilities.insert({ bldg: "LWSN", floor: "B",type:"Corner",room:"4", xpix: 341, ypix: 14 }); // top wall

    }
    if(Lines.find().count() == 0) {
        Lines.insert( { bldg: "LWSN", floor: "B", xpix: 88, ypix: 1535, description: "You should see the exit" });
        Lines.insert( { bldg: "LWSN", floor: "B", xpix: 374, ypix: 1535, description: "You should see Room 116" });
        Lines.insert( { bldg: "LWSN", floor: "B", xpix: 374, ypix: 37, description: "You should see a vending machine" });
        Lines.insert( { bldg: "LWSN", floor: "B", xpix: 487, ypix: 37, description: "You should see the exit" });
    }
  })
}




function getNearRoom(p)
{

  var l;
  var distance = new Array(18);
  for(i=0; i<18; i++) {
      l = Rooms.findOne( { bldg: "LWSN", floor: "B"}, {skip:i});
      if (l == null)  break;
      distance[i] = (Math.sqrt((l.xpix-p.xpix)*(l.xpix-p.xpix)+(l.ypix - p.ypix)*(l.ypix - p.ypix)));
    }
    var closest = 0;
    for(i = 1; i < 18; i++) {
      if(distance[i] < distance[closest])
          closest = i;
    }

    l = Rooms.findOne( { bldg: "LWSN", floor: "B"},{skip:closest});
    //alert(l.xpix);
    //alert(l.ypix);
    var node = {room:l.floor+l.room,xpix:l.xpix, ypix:l.ypix};
    return node;
}

function getNearRestroom(p)
{
    var l;
    var distance = new Array(2);
    //alert(p.xpix);
    //alert(p.ypix);
    for(i=0; i < 2; i++) {
      l = Facilities.findOne( { bldg: "LWSN", type:"Restroom"}, {skip:i});
      if (l == null)  break;
      distance[i] = (Math.sqrt((l.xpix-p.xpix)*(l.xpix-p.xpix)+(l.ypix - p.ypix)*(l.ypix - p.ypix)));
    }
    var closest = 0;
    for(i = 1; i < 2; i++) {
      if(distance[i] < distance[closest])
          closest = i;
    }

    l = Facilities.findOne( { bldg: "LWSN", floor: "B", type:"Restroom"},{skip:closest});
    //alert(l.xpix);
    //alert(l.ypix);
    var node = {xpix:l.xpix, ypix:l.ypix};
    return node;
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
        {"xpix":current.xpix*window.innerWidth/(800/(parseInt(Session.get("width"))/100))+'px',
         "ypix":current.ypix*window.innerWidth/(800/(parseInt(Session.get("width"))/100))+'px'
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

function on_the_line(x1,y1,x2,y2,x3,y3) //check if (x3,y3) is on segment (x1,y1), (x2,y2) ..now only for straight line
{
    console.log(x1,y1,x2,y2,x3,y3);
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
    queue.push({xpix:startx,ypix:starty,prev:-1,distance:0});

    nowx=startx;
    nowy=starty;
    head=0;
    tail=0;
    flags=0;

    if ((startx==endx) && (starty==endy))
    {
        queue.push({xpix:startx,ypix:starty,prev:0,distance:0});
        tail=1;
    }
    else
    //console.log(endx,endy);
    while (1)
    {


        for (counter=0;;counter++)
        {
            var current=Lines.findOne({'$or': [ {'xpix':nowx ,'ypix' : {$ne : nowy} }, { 'ypix': nowy, 'xpix' : {$ne : nowx}}]} ,{skip:counter});  // nowx==xpix xor nowy==ypix

                                    //make sure the x and y is the same in the future
            if (current==null) break;
            tail+=1;
            queue.push({xpix:current.xpix,ypix:current.ypix,prev:head,distance:queue[head].distance+1});
            console.log(current.xpix,current.ypix);
            if (current.xpix==endx && current.ypix==endy)
            {
                console.log("yes find it!!");
                flags=1;
                break;
            }

        }
        console.log(queue);
        if (flags==1) break;
        head+=1;
        nowx=queue[head].xpix;
        nowy=queue[head].ypix;
    }

    now=tail;
    point_list=[];
    for (counter=0;;counter++)
    {
  //      alert("now "+now+" "+"xpix "+queue[now].xpix+"ypix "+queue[now].ypix);

        if (now==-1)
            break;
        point_list.unshift({xpix:queue[now].xpix,ypix:queue[now].ypix});
        now=queue[now].prev;

        //alert(now);
    }


    length=point_list.length;
    flag=0;
    console.log(point_list,length);
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

/**
    Smoothly scroll element to the given target (element.scrollTop)
    for the given duration

    Returns a promise that's fulfilled when done, or rejected if
    interrupted
 */
  var smooth_scroll_top = function(target) {
      var element = document.body;
      target = Math.round(target);
      duration = 400;
      if (duration < 0) {
          return Promise.reject("bad duration");
      }
      if (duration === 0) {
          element.scrollTop = target;
          return Promise.resolve();
      }

      var start_time = Date.now();
      var end_time = start_time + duration;

      var start_top = element.scrollTop;
      var distance = target - start_top;

      // based on http://en.wikipedia.org/wiki/Smoothstep
      var smooth_step = function(start, end, point) {
          if(point <= start) { return 0; }
          if(point >= end) { return 1; }
          var x = (point - start) / (end - start); // interpolation
          return x*x*(3 - 2*x);
      }

      return new Promise(function(resolve, reject) {
          // This is to keep track of where the element's scrollTop is
          // supposed to be, based on what we're doing
          var previous_top = element.scrollTop;

          // This is like a think function from a game loop
          var scroll_frame = function() {
              if(element.scrollTop != previous_top) {
                  reject("interrupted..");
                  return;
              }

              // set the scrollTop for this frame
              var now = Date.now();
              var point = smooth_step(start_time, end_time, now);
              var frameTop = Math.round(start_top + (distance * point));
              element.scrollTop = frameTop;

              // check if we're done!
              if(now >= end_time) {
                  resolve();
                  return;
              }

              // If we were supposed to scroll but didn't, then we
              // probably hit the limit, so consider it done; not
              // interrupted.
              if(element.scrollTop === previous_top
                  && element.scrollTop !== frameTop) {
                  resolve();
                  return;
              }
              previous_top = element.scrollTop;

              // schedule next frame for execution
              setTimeout(scroll_frame, 0);
          }

          // boostrap the animation process
          setTimeout(scroll_frame, 0);
      });
  }

  var smooth_scroll_left = function(target) {
      var element = document.body;
      target = Math.round(target);
      duration = 400;
      if (duration < 0) {
          return Promise.reject("bad duration..");
      }
      if (duration === 0) {
          element.scrollLeft = target;
          return Promise.resolve();
      }

      var start_time = Date.now();
      var end_time = start_time + duration;

      var start_left = element.scrollLeft;
      var distance = target - start_left;

      // based on http://en.wikipedia.org/wiki/Smoothstep
      var smooth_step = function(start, end, point) {
          if(point <= start) { return 0; }
          if(point >= end) { return 1; }
          var x = (point - start) / (end - start); // interpolation
          return x*x*(3 - 2*x);
      }

      return new Promise(function(resolve, reject) {
          // This is to keep track of where the element's scrollTop is
          // supposed to be, based on what we're doing
          var previous_left = element.scrollLeft;

          // This is like a think function from a game loop
          var scroll_frame = function() {
              if(element.scrollLeft != previous_left) {
                  reject("interrupted");
                  return;
              }

              // set the scrollTop for this frame
              var now = Date.now();
              var point = smooth_step(start_time, end_time, now);
              var frameLeft = Math.round(start_left + (distance * point));
              element.scrollLeft = frameLeft;

              // check if we're done!
              if(now >= end_time) {
                  resolve();
                  return;
              }

              // If we were supposed to scroll but didn't, then we
              // probably hit the limit, so consider it done; not
              // interrupted.
              if(element.scrollLeft === previous_left
                  && element.scrollLeft !== frameLeft) {
                  resolve();
                  return;
              }
              previous_left = element.scrollLeft;

              // schedule next frame for execution
              setTimeout(scroll_frame, 0);
          }

          // boostrap the animation process
          setTimeout(scroll_frame, 0);
      });
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
  var ctx = document.getElementById("draw-line").getContext("2d");
  console.log("draw a line");
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  if(Math.abs(y2-y1) <= 7){
    setLineWidth = 2;
    ctx.strokeStyle = '#08088A';
  }
  if(Math.abs(y2-y1) >7){
    setLineWidth = 0.25;
    ctx.strokeStyle = '#9F81F7';
  }
  ctx.lineWidth = 1/setLineWidth;
  console.log("x1: "+x1+", y1: "+y1+", x2: "+x2+" y2: "+y2);
  ctx.stroke();
  setLineWidth = 1;
}

// simple-todos.js
if (Meteor.isClient) {
  // This code only runs on the client
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
    Session.set("width", 100+"%");
    Session.set("height", 100+"%");
    Session.set("posX", 160);
    Session.set("posY", -100);
    Session.set("curY", -100);
    Session.set("curX", 0);
    Session.set("navTop",-200+"px");
    Session.set("scanned", 0);
    Session.set("navReady",0);
    Session.set("offScreen", -200+"px");
    Session.set("enteredName",0);
    load();

  });

  /*
  Meteor.setInterval(function() {
    navigator.geolocation.getCurrentPosition(function(position) {

        Session.set('lat', position.coords.latitude);
        Session.set('lon', position.coords.longitude);
    });
  }, 300);*/

/**  Template.location.helpers({
    lat: function() { return Session.get('lat'); },
    lon: function() { return Session.get('lon'); }
  }); **/

  Template.home.helpers({

    current_map: function(){
      return Session.get("mapimg");
    },

    current_width: function(){
      return Session.get("width");
    },

    current_height: function(){
      return Session.get("height");
    },
    current_building: function(){
      return Session.get("bldg");
    },
    scanned: function(){
      return Session.get("scan");
    },
    getCurX: function() {
      return Session.get("curX")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))+'px';
    },
    getCurY: function() {
      return Session.get("curY")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))+'px';
    },
    getPosX: function(){
      return Session.get("curX")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))+'px';
    },
    getPosY: function(){
      return Session.get("curY")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))+'px';
    },

    getRestRoom: function(){
      if( Session.get("scan") )
        return restroom();

    },

    getDesX: function(){
      return Session.get("posX")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))+'px';
    },
    getDesY: function(){
      return Session.get("posY")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))+'px';
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
    },
    getScreen: function(){
      return Session.get("offScreen");
    },
    instruction: function(){

      return Session.get("current_ins");
    }
  });
  Template.mainchatbox.helpers({
    enteredName: function(){
      return Session.get("entername");
    },
    getUserMsg: function(){
      return getMessage();
    }
  });

  Template.mainchatbox.events({
    'submit .new-task2': function(event) {
      console.log("GO TO task2:)");
      result=event.target.text.value.replace(/\s+/g, '');
      Session.set("entername",1);
      Session.set("username",result);
      setUserStatus(result, 'on');
      console.log("user:"+result);
      event.preventDefault();
      insertUser(result);
      $("#new-task2").blur();
      return false;
    }
  });

Template.chatBox.events({
  'click #send': function(){
    console.log("send chat!");
    var message = $('textarea#chat-message').val();
    console.log(Session.get("username")+": "+message);
    insertMessage(Session.get("username"), message);
    var stream = getMessage();
    console.log(stream);
  }
});

  Template.home.events({
    'click .scan-qr': function() {
      MeteorCamera.getPicture({width: window.innerWidth}, function(error, data) {
        if (error)
          alert(error.reason);
        else{
          qrcode.callback = function(result){


                var split = result.split("_");

               //find the posx and posy from result

              if(result.search("error")==-1){

                Session.set("scan", 1);

                posx= Facilities.findOne( { bldg:  split[0] , floor:  split[1], room: split[2] },{_id:0,xpix:1}).xpix;
                posy= Facilities.findOne( { bldg:  split[0] , floor:  split[1], room: split[2] },{_id:0,ypix:1}).ypix;

                Session.set("bldg", split[0]);
                Session.set("mapimg", split[0]+"_"+split[1]+".jpg");
                Session.set("location", split[2] );
                Session.set("curX",posx);
                Session.set("curY",posy);

              }

              else
                alert(result);

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

        event.preventDefault();

        result=event.target.text.value.replace(/\s+/g, '');
        var f = result.charAt(0);
        var r = result.substring(1);

        var response = Rooms.findOne( { room: r, floor: f },{_id:0,xpix:1});

        if(response==undefined){
          alert("Room not found");
          return false;
        }

        $("#new-task").blur();

        Session.set("scan",1);

        posx= response.xpix;
        posy= response.ypix; // only know the room and floor
                // Room.findOne( { bldg: b, fllor: f, room: r}, {_id:0,xpix:1}).xpix;
                // Room.findOne( { bldg: b, fllor: f, room: r}, {_id:0,ypix:1}).ypix;

        Session.set("curX", posx);
        Session.set("curY", posy);
        Session.set("bldg", response.bldg);
        Session.set("mapimg", response.bldg+"_"+response.floor+".jpg");
        Session.set("location", result );


        smooth_scroll_top( (posy*window.innerWidth/800-50) );





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
        var ctx = document.getElementById("draw-line").getContext("2d");
        ctx.clearRect(0, 0, 320, 743);
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

        posx2= response.xpix;
        posy2= response.ypix;

        Session.set("posX", posx2);
        Session.set("posY", posy2);
        Session.set("destination", re );
        template.find(".search-main").blur();
        $("#search-main")
          .css("font-weight","bold")
          .css("font-size","14px");
        $(".fa-search").css("color","rgb(195, 219, 137)").addClass("fa-check");;
        Session.set("navReady",1);
        smooth_scroll_top( (posy2*window.innerWidth/800-50) );
        //drawLine(posx/2.5, posy/8, posx2/2.5, posy2/8
        return false;
    },

    'keyup .search-dest': function(event) {

       // console.log( document.getElementById('search-main').value );

        autofill_room(document.getElementById('search-main').value);
    },

    'click .startnav': function(event){
        event.preventDefault();
        //Session.set("width", 100+"%");
        //document.body.scrollTop = (Session.get("curY")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))-300);
        smooth_scroll_top( (Session.get("curY")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))-300));
        //smooth_scroll_left( (Session.get("curX")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))-150) );

        if( Session.get("location")=="BATH" ){
            node={xpix:instructions[i].xpix,ypix:instructions[i].ypix};
            p=getNearRoom(node);
            Session.set("location",p.room );
            Session.set("curX",p.xpix);
            Session.set("curY",p.ypix);
        }

        start=Session.get("location");
        dest=Session.get("destination");
        var f = start .charAt(0);
        var r = start.substring(1);


        var start_document;
        if( start.length == 1 )
            start_document = Facilities.findOne({room:start});
        else
            start_document = Rooms.findOne( { room: r, floor: f });
        var f = dest .charAt(0);
        var r = dest.substring(1);

        var dest_document = Rooms.findOne( { room: r, floor: f });

        Session.set("step", -1);


        instructions = find_destination(start_document.xpix,start_document.ypix,dest_document.xpix,dest_document.ypix);

        Session.set("navTop",0);
        Session.set("navReady",0);
        Sugg = [];
        Session.set("sugg", Sugg);

        $(".next-btn").html("Next");

        Session.set("current_ins", "Start Navigating!");

        var listLen = instruction_list.length;

        drawLine(Session.get("curX")/2.67*zoominout,Session.get("curY")/12.17*zoominout,(instruction_list[0].xpix)/2.67*zoominout,(instruction_list[0].ypix)/12.17*zoominout);
        for(var pdots=0; pdots < listLen-1; pdots++){
          console.log((instruction_list[pdots].xpix) +" "+(instruction_list[pdots].ypix));
          console.log(pdots);
          drawLine((instruction_list[pdots].xpix)/2.67*zoominout,(instruction_list[pdots].ypix)/12.17*zoominout,(instruction_list[pdots+1].xpix)/2.67*zoominout,(instruction_list[pdots+1].ypix)/12.17*zoominout);
        }
        drawLine((instruction_list[listLen-1].xpix)/2.67*zoominout,(instruction_list[listLen-1].ypix)/12.17*zoominout,Session.get("posX")/2.67*zoominout, Session.get("posY")/12.17*zoominout);



        return false;
    },

    'click .closebtn': function(event){
        Session.set("navTop",-200+"px");
        node={xpix:instructions[i].xpix,ypix:instructions[i].ypix};
        p=getNearRoom(node);
        Session.set("location",p.room );
        Session.set("curX",p.xpix);
        Session.set("curY",p.ypix);
    },
    'click .next-btn': function(event){
        event.preventDefault();
        i = Session.get("step");
        Session.set("step",i+1);

        if( i+2 >= instructions.length ){
          $(".next-btn").html("Done");
        }

        if( i+1 >= instructions.length ){

          var ctx = document.getElementById("draw-line").getContext("2d");
          ctx.clearRect(0, 0, 320, 743);

          Session.set("navTop",-200+"px");

          zoominout =1;

          Session.set("location", Session.get("destination"));
          Session.set("curX", Session.get("posX"));
          Session.set("curY", Session.get("posY"));
          /*
          node={xpix:instructions[i].xpix,ypix:instructions[i].ypix};
          p=getNearRoom(node);
          Session.set("location",p.room );
          Session.set("curX",p.xpix);
          Session.set("curY",p.ypix);
          */

          console.log(p);
          return ;
        }
        Session.set("current_ins", instructions[i+1].instruction);
        Session.set("curX", instructions[i+1].xpix);
        Session.set("curY", instructions[i+1].ypix);

        smooth_scroll_top( (Session.get("curY")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))-300) );

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
        $("#search-main")
          .css("background-color","white")
          .css("font-weight","bold")
          .css("font-size","14px")
          .val(re).blur();
        $(".fa-search").css("color","rgb(195, 219, 137)").removeClass("fa-times").addClass("fa-check");;
        Session.set("navReady",1);


        smooth_scroll_top(psy*window.innerWidth/800-50);

    },



    'click .plus' : function()
    {
        var zoom = parseInt(Session.get("width"));
        console.log("Minus");
        console.log(zoom);
        Session.set("width", (zoom+10)+"%");
        zoominout+=0.1;
        Session.set("height", (zoom+10)+"%");
    },

    'click .minus' : function()
    {
        var zoom = parseInt(Session.get("width"));
        console.log("Minus");
        console.log(zoom);
        zoominout-=0.1;
        Session.set("width", (zoom-10)+"%");
        Session.set("height", (zoom-10)+"%");
    },

    'click .bafroom' : function()
    {
        var point = make_point(Session.get("curX"), Session.get("curY"));
        var bathroom = getNearRestroom(point);
        Session.set("posX", 1000);
        Session.set("destination", "BATH");
        console.log(bathroom);
        console.log("Getting nearest Bathroom");
        Session.set("step", -1);
        instructions = find_destination(Session.get("curX"), Session.get("curY"), bathroom.xpix, bathroom.ypix);

        Session.set("navTop",0);
        Session.set("navReady",0);
        Sugg = [];
        Session.set("sugg", Sugg);

        Session.set("posX", bathroom.xpix);
        Session.set("posY", bathroom.ypix);

         Session.set("current_ins", "GO GO BEFORE IT'S TOO LATE!");

         var shitLen = instructions.length;
         console.log(shitLen);
         drawLine(Session.get("curX")/2.67*zoominout,Session.get("curY")/12.17*zoominout,(instructions[0].xpix)/2.67*zoominout,(instructions[0].ypix)/12.17*zoominout);
         for(var pdots=0; pdots < shitLen-1; pdots++){
           drawLine((instructions[pdots].xpix)/2.67*zoominout,(instructions[pdots].ypix)/12.17*zoominout,(instructions[pdots+1].xpix)/2.67*zoominout,(instructions[pdots+1].ypix)/12.17*zoominout);
         }
         drawLine((instructions[shitLen-1].xpix)/2.67*zoominout,(instructions[shitLen-1].ypix)/12.17*zoominout,bathroom.xpix/2.67*zoominout, bathroom.ypix/12.17*zoominout);
        smooth_scroll_top((Session.get("curY")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))-300));

    },
    
    'click .lost' : function()
    {
      console.log("HELLO " + Session.get("offScreen"));
      console.log(parseInt(Session.get("offScreen"), 10));
      if(parseInt(Session.get("offScreen")) > 0)
      {
        Session.set("offScreen", -200+"px");
      }
      else
      {
        Session.set("offScreen", 89+"px");
      }
    },
    
    'submit .newRoom' : function()
    {
        event.preventDefault();

        result=event.target.text.value.replace(/\s+/g, '');
        var f = result.charAt(0);
        var r = result.substring(1);

        var response = Rooms.findOne( { room: r, floor: f },{_id:0,xpix:1});

        if(response==undefined){
          alert("Room not found");
          return false;
        }

        $("#new-task").blur();

        Session.set("scan",1);

        posx= response.xpix;
        posy= response.ypix; // only know the room and floor
                // Room.findOne( { bldg: b, fllor: f, room: r}, {_id:0,xpix:1}).xpix;
                // Room.findOne( { bldg: b, fllor: f, room: r}, {_id:0,ypix:1}).ypix;

        Session.set("curX", posx);
        Session.set("curY", posy);
        Session.set("bldg", response.bldg);
        Session.set("mapimg", response.bldg+"_"+response.floor+".jpg");
        Session.set("location", result );
        

        smooth_scroll_top( (posy*window.innerWidth/800-50) );
        Session.set("offScreen", -200+"px");

       var ctx = document.getElementById("draw-line").getContext("2d");
          ctx.clearRect(0, 0, 320, 743);
        
        event.preventDefault();
        //Session.set("width", 100+"%");
        //document.body.scrollTop = (Session.get("curY")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))-300);
        smooth_scroll_top( (Session.get("curY")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))-300));
        //smooth_scroll_left( (Session.get("curX")*window.innerWidth/(800/(parseInt(Session.get("width"))/100))-150) );

        if( Session.get("location")=="BATH" ){
            node={xpix:instructions[i].xpix,ypix:instructions[i].ypix};
            p=getNearRoom(node);
            Session.set("location",p.room );
            Session.set("curX",p.xpix);
            Session.set("curY",p.ypix);
        }
      
        start=Session.get("location");
        dest=Session.get("destination");
        var f = start .charAt(0);
        var r = start.substring(1);

      
        var start_document;
        if( start.length == 1 )
            start_document = Facilities.findOne({room:start});
        else 
            start_document = Rooms.findOne( { room: r, floor: f });
        var f = dest .charAt(0);
        var r = dest.substring(1);

        var dest_document = Rooms.findOne( { room: r, floor: f });

        Session.set("step", -1);


        instructions = find_destination(start_document.xpix,start_document.ypix,dest_document.xpix,dest_document.ypix);

        Session.set("navTop",0);
        Session.set("navReady",0);
        Sugg = [];
        Session.set("sugg", Sugg);

        $(".next-btn").html("Next");

        Session.set("current_ins", "Start Navigating!");
      
        var listLen = instruction_list.length;

        drawLine(Session.get("curX")/2.67*zoominout,Session.get("curY")/12.17*zoominout,(instruction_list[0].xpix)/2.67*zoominout,(instruction_list[0].ypix)/12.17*zoominout);
        for(var pdots=0; pdots < listLen-1; pdots++){
          console.log((instruction_list[pdots].xpix) +" "+(instruction_list[pdots].ypix));
          console.log(pdots);
          drawLine((instruction_list[pdots].xpix)/2.67*zoominout,(instruction_list[pdots].ypix)/12.17*zoominout,(instruction_list[pdots+1].xpix)/2.67*zoominout,(instruction_list[pdots+1].ypix)/12.17*zoominout);
        }
        drawLine((instruction_list[listLen-1].xpix)/2.67*zoominout,(instruction_list[listLen-1].ypix)/12.17*zoominout,Session.get("posX")/2.67*zoominout, Session.get("posY")/12.17*zoominout);

        

        return false;
    }
  });

}
