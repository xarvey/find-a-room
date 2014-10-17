function makeStruct(names) {
  var names = names.split(' ');
  var count = names.length;
  function constructor() {
    for (var i = 0; i < count; i++) {
      this[names[i]] = arguments[i];
    }
  }
  return constructor;
}


var Map = makeStruct("Map_Id Building Floor MapImg");
var Node = makeStruct("Node_id Isroom Building Floor Posx Posy");
//Create Map struct


function string_split(str) {
    var split = str.split("_");
    var Node = {
        bldg : split[0],
        floor : split[1],
        num : split[2],
	};
	return Node;
}

//spint the string from QR code to building/floor/position


var node = string_split("LWSN_B_0");
//node---->img

var img_string="img/"+node.bldg+"_"+node.floor+".jpg";

//Create map class
Current_Map=new Map(0,node.bldg,node.floor,img_string);

var positionX=[11,46,60]; //by percentage of the img
var positionY=[85,45,2];


Node_from_img=new Node(0,0,node.bldg,node.floor,positionX[node.num],positionY[node.num]);


var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var imageObj = new Image();

imageObj.onload = function() {
        
        var centerX = canvas.width/2;
        var centerY = canvas.height/2;
        var radius = canvas.width/80;
        var pointx = imageObj.width*Node_from_img.Posx/100;
        var pointy = imageObj.height*Node_from_img.Posy/100;
        

        distX=-(pointx-centerX);
        if (distX>0) 
          {
            distX=0;
            centerX=imageObj.width*Node_from_img.Posx/100;
          }
        distY=-(pointy-centerY);
        if (distY>0) 
          {
            distY=0;
            centerY=imageObj.height*Node_from_img.Posy/100;
          }

        context.drawImage(imageObj,distX,distY);
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'red';
        context.fill();


      };

imageObj.src = img_string;


