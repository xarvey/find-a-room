var QRCodeID;


function QRCode(id)
{
	this.QRCodeID = id;
}

function getQRCode(code)
{
	return code.QRCodeID;
}

function print()
{
	document.write(QRCodeID+'<BR>');
}
