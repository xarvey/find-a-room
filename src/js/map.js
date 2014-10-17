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

var Map = makeStruct("Map_Id Building MapImg");


var lawson_0 = new Map(0,'Lawson','img/lawson_0.jpg');
var lawson_1 = new Map(0,'Lawson','img/lawson_1.jpg');


document.getElementById('mapImg').src=lawson_0.MapImg;



