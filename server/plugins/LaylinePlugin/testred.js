//testred




var mycanvas_storeKeys={
      course: 'nav.gps.course',
      myValue: 'nav.gps.test', //stored at the server side with gps.test
		AWA:'nav.gps.AWA',
		AWD:'nav.gps.AWD',
		TWA:'nav.gps.TWA',
		TWD:'nav.gps.TWD',
		TSS:'nav.gps.TSS',
		LLSB:'nav.gps.LLSB',
		LLBB:'nav.gps.LLBB',
		valid:'nav.gps.valid',
		boatposition: 'nav.gps.position',
		WPposition:'nav.wp.position',
		sailsteerrefresh:'properties.sailsteerrefresh',
        sailsteeroverlap: 'properties.sailsteeroverlap',
		sailsteerlength:'properties.sailsteerlength',
		sailsteerboot: 'properties.sailsteerboot',
		sailsteermarke: 'properties.sailsteermarke',
		TWD_filt:	'properties.sailsteerTWDfilt',
		
		}

let drawpointcross=function(cc,coordinates, color){
	cc.beginPath();
	cc.moveTo(coordinates[0]-100,coordinates[1]);
	cc.lineTo(coordinates[0]+100,coordinates[1]);

	cc.moveTo(coordinates[0],coordinates[1]-100);
	cc.lineTo(coordinates[0],coordinates[1]+100);

	cc.stroke();	
	cc.lineWidth = 5;//0.02*Math.min(x,y)
	cc.fillStyle = color;
	cc.strokeStyle = color;
	cc.stroke();

}

mycanvasFunction = function(extent, resolution, pixelRatio, size, projection) 
{
//testred
	console.log("testredcanvas:");

	canvas = document.createElement('canvas');
	canvas.setAttribute("width", size[0]);
	canvas.setAttribute("height", size[1]);

	var mapExtent = this.mapholder.olmap.getView().calculateExtent(this.mapholder.olmap.getSize())

	const mapCenter = [mapExtent[0]+(mapExtent[2]-mapExtent[0])/2,mapExtent[1]+(mapExtent[3]-mapExtent[1])/2];
	const mapCenterPixel = this.mapholder.olmap.getPixelFromCoordinate(mapCenter);


	ctx = canvas.getContext('2d');

	ctx.save();
	ctx.clearRect(0, 0, canvas.getAttribute("width"), canvas.getAttribute("height"));
	// Draw relative to the center of the canvas
	ctx.translate(canvas.getAttribute("width") / 2, canvas.getAttribute("height") / 2);
	// Cancel the rotation of the map.
	ctx.rotate(-this.mapholder.olmap.getView().getRotation());

		// NOW Position everything relative to the center of the map
	ctx.translate(-mapCenterPixel[0], -mapCenterPixel[1]);
	// for debuggingconsole.log("boatposition:"+boatPosition)
	let coordinate=[];
	coordinate[0]=coordinate[1]=0;
	let point=this.mapholder.transformToMap(coordinate)
	let Position = this.mapholder.olmap.getPixelFromCoordinate(point);

	mapCenterPixel[0]+=10;
	mapCenterPixel[1]+=10;
drawpointcross(ctx,Position, "red")
	ctx.restore();
	return canvas;
}
