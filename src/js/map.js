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


var node = string_split("LWSN_1_0");
var img_string="img/"+node.bldg+"_"+node.floor+".jpg";


document.getElementById('mapImg').src=img_string;



