
function myFunction(str) {
    var split = str.split("_");
    var Node = {
        bldg : split[0],
        floor : split[1],
        num : split[2],
	};
	return Node;
}

