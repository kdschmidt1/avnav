var TWD_Abweichung = [0,0]
var old_time=performance.now()
var ln0_1=Math.log(0.1)

function getTransformedCoords(coords) {
	var angle = -sailsteermapholder.drawing.rotation;
	var x2 = coords[0];
	var y2 = coords[1];
	var cos = Math.cos(angle);
	var sin = Math.sin(angle);

	var newx = Math.floor(x2 * cos - y2 * sin);
	var newy = Math.floor(x2 * sin + y2 * cos);

	return [newx, newy]
}

//  coordinate[0]=lon;
//  coordinate[1]=lat;
latloncoordinatetodevice=function(coordinate){

  let point=sailsteermapholder.transformToMap(coordinate)
  let Position = sailsteermapholder.olmap.getPixelFromCoordinate(point);
return(Position);


/*
	// to map coordinates
	let point=sailsteermapholder.transformToMap(coordinate)
			let rt=sailsteermapholder.drawing.pointToCssPixel(point);
	let xy=sailsteermapholder.drawing.pixelToDevice(rt);
	xy[0]+=canvasdelta[0];
	xy[1]+=canvasdelta[1];
	var xy2=getTransformedCoords(xy);

	return(xy);	

	/*	
	//let rt=this.pointToCssPixel(point);->
	pixel=sailsteermapholder.olmap.getPixelFromCoordinate(pos);
	//pixelToDevice(rt); ->    
	let rt=[];
	rt[0]=(pixel[0]+canvasdelta[0])*window.window.devicePixelRatio;
	rt[1]=(pixel[1]+canvasdelta[1])*window.window.devicePixelRatio;
	return(rt);
	*/
	
}

drawcross=function(cc,left,top,right,bottom, color){
	cc.beginPath();
	cc.moveTo(left, top);
	cc.lineTo(right, bottom);
	cc.moveTo(right, top);
	cc.lineTo(left, bottom);
	cc.stroke();	
	cc.lineWidth = 5;//0.02*Math.min(x,y)
	cc.fillStyle = color;
	cc.strokeStyle = color;
	cc.stroke();

}

drawpointcross=function(cc,coordinates, color){
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



mycanvasFunction = function(canvas, mapholder, delta, extent, ImageCanvasSource, resolution, pixelRatio, size, projection, props,mapCenterPixel) {
	//sailsteercanvas = canvas;
	sailsteermapholder=mapholder;
	sailsteerImageCanvasSource=ImageCanvasSource; // WIRD BENNÖTIGT IM SAILSTEER PLUGIN
	canvasdelta = delta;
	sailsteermapCenterPixel=mapCenterPixel;

	renderCanvas(canvas,mapholder.center,props);
}
var first=true;


renderCanvas = function(canvas, center, props) {
	load();

	ctx = canvas.getContext('2d');

  ctx.save();
// Reset current transformation matrix to the identity matrix
//ctx.setTransform(1, 0, 0, 1, 0, 0);

  ctx.clearRect(0, 0, canvas.getAttribute("width"), canvas.getAttribute("height"));
  ctx.fillStyle = "rgba(255, 0, 0, 1)";

  // Draw relative to the center of the canvas
  ctx.translate(canvas.getAttribute("width") / 2, canvas.getAttribute("height") / 2);
  // Cancel the rotation of the map.
  ctx.rotate(-sailsteermapholder.olmap.getView().getRotation());
	  // Position everything relative to the center of the map
  //ctx.translate(-sailsteermapCenterPixel[0], -sailsteermapCenterPixel[1]);


	maprotationdeg = sailsteermapholder.olmap.getView().getRotation()/Math.PI*180
	boatrotationdeg = props.course;
	nordrotion = maprotationdeg;
	// d.h. Direction (TWD, AWD) bezoghen auf maprotation
	// und Angle (TWA, AWA) bezoghen auf (maprotationdeg+boatrotationdeg)
	// winkel immer in neg richtung wg. Unterschied Kompassrotation zu Canvasrotation
	
	 
  var angle = 0;
  var radius = 120;
  calc_LaylineAreas(props)
  DrawOuterRing(canvas, radius, maprotationdeg+boatrotationdeg);
  DrawKompassring(canvas, radius, maprotationdeg);
  DrawLaylineArea(canvas, radius, props.LLBB, TWD_Abweichung, "red")
  DrawLaylineArea(canvas, radius, props.LLSB, TWD_Abweichung, "rgb(0,255,0)")
  DrawWindpfeilIcon(canvas, radius, maprotationdeg+props.AWD, "rgb(0,255,0)", 'A')
  DrawWindpfeilIcon(canvas, radius, maprotationdeg+props.TWD , "blue", 'T')
  //	if(globalStore.getData(keys.properties.sailsteerTWDfilt))	 
	  DrawWindpfeilIcon(canvas, radius, + maprotationdeg+props.TSS, "yellow", '~')

ctx.translate(-sailsteermapCenterPixel[0], -sailsteermapCenterPixel[1]);

  let coordinate=[];
  coordinate[0]=props.boatposition.lon;
  coordinate[1]=props.boatposition.lat;
	let point=sailsteermapholder.transformToMap(coordinate)
boatPosition = sailsteermapholder.olmap.getPixelFromCoordinate(point);
// for debuggingconsole.log("boatposition:"+boatPosition)
  // for debugging drawpointcross(ctx,boatPosition, "blue")

			//Laylines vom Boot zeichnen BB
  let draw_distance = props.sailsteeroverlap ? props.sailsteerlength : Math.min(this.dist_BB, props.sailsteerlength);
  /*	let targetboat = this.computeTarget(props.LLBB * 180 / Math.PI, draw_distance)
							if (props.sailsteerboot) // laylinbes vom boot aus zeichnen
  drawing.drawLineToContext([boatPosition, targetboat], { color: "red", width: 5, dashed: true });
  */
  if(this.MapLayline)
	  DrawMapLaylines(canvas, radius, props); 
  coordinate=[];
  coordinate[0]=props.boatposition.lon;
  coordinate[1]=props.boatposition.lat;
	point=sailsteermapholder.transformToMap(coordinate)

  //boatPosition = sailsteermapholder.olmap.getPixelFromCoordinate(point);
  boatPosition=latloncoordinatetodevice(coordinate)
//boatPosition[0]+=canvasdelta[0]
//boatPosition[1]+=canvasdelta[1]
  // for debugging drawpointcross(ctx,boatPosition, "green")
  ctx.restore();
};



calc_LaylineAreas = function(props) {
	try{

		this.dist_SB = this.dist_BB = props.sailsteerlength
		b_pos = new LatLon(props.boatposition.lat, props.boatposition.lon);
		if (props.WPposition) {
			WP_pos = new LatLon(props.WPposition.lat, props.WPposition.lon);

			// Schnittpunkte berechnen
			var is_SB = LatLon.intersection(b_pos, props.LLSB, WP_pos, props.LLBB + 180)
					var is_BB = LatLon.intersection(b_pos, props.LLBB, WP_pos, props.LLSB + 180)
					/*
					* @param   {Number} brng: Initial bearing in degrees
					* @param   {Number} dist: Distance in km
					* @returns {LatLon} Destination point

					LatLon.prototype.destinationPoint = function(brng, dist) {
						*/
						calc_endpoint = function(intersection, pos) {
							let is_xx;
							let dist_xx = pos.rhumbDistanceTo(intersection);	// in km
							if(dist_xx > props.sailsteerlength/1000) // wenn abstand gösser gewünschte LL-Länge, neuen endpunkt der LL berechnen
							is_xx = b_pos.rhumbDestinationPoint(b_pos.rhumbBearingTo(intersection), props.sailsteerlength/1000)
									else if(dist_xx< props.sailsteerlength/1000 && props.sailsteeroverlap)// wenn abstand kleiner gewünschte LL-Länge und Verlängerung über schnittpunkt gewollt, neuen endpunkt der LL berechnen
							is_xx = b_pos.rhumbDestinationPoint(b_pos.rhumbBearingTo(intersection), props.sailsteerlength/1000)
									else	// sonst: endpunkt der der LL ist Schnittpunkt
							is_xx= intersection;
							return(is_xx)
						};


						if(is_BB)
						{
							is_BB_boat=calc_endpoint(is_BB, b_pos);
							is_BB_WP = calc_endpoint(is_BB, WP_pos);
						}

						if(is_SB)
						{
							is_SB_boat=calc_endpoint(is_SB, b_pos);
							is_SB_WP = calc_endpoint(is_SB, WP_pos);
						}
							var dist_SB = b_pos.distanceTo(is_SB);

						if(is_SB && is_BB){	// es gibt schnittpunkte
							this.ep_BB_boat = is_BB_boat;
							this.ep_BB_WP = is_BB_WP;
							this.ep_SB_boat = is_SB_boat;
							this.ep_SB_WP = is_SB_WP;

							this.MapLayline = { Boat: { SB: { P1: b_pos, P2: is_SB_boat, color: 'rgb(0,255,0)' }, BB: { P1: b_pos, P2: is_BB_boat, color: 'red' } }, WP: { SB: { P1: WP_pos, P2: is_SB_WP, color: 'red' }, BB: { P1: WP_pos, P2: is_BB_WP, color: 'rgb(0,255,0)' } } }
						}
						else
							this.MapLayline = null; // wenn abstand zu gross, endpunkte der LL berechnen
					}
		}
		catch (e) {
			// Anweisungen für jeden Fehler
			console.log(e); // Fehler-Objekt an die Error-Funktion geben
		}





		// Berechnungen für die Laylineareas
		// Die Breite der Areas (Winkelbereich) wird über die Refreshzeit abgebaut


		let reduktionszeit = props.sailsteerrefresh * 60

		let difftime = (performance.now() - old_time) / 1000 // sec
		old_time = performance.now()

									let k = ln0_1 / reduktionszeit
		for (var i = 0; i < 2; i++)
			TWD_Abweichung[i] *= Math.exp(k * difftime)


			let winkelabweichung = 0;
		winkelabweichung = props.TWD - props.TSS
		winkelabweichung %= 360
		if (Math.abs(winkelabweichung) > 180)
			winkelabweichung = winkelabweichung < -180 ? winkelabweichung % 180 + 180 : winkelabweichung
		winkelabweichung = winkelabweichung > 180 ? winkelabweichung % 180 - 180 : winkelabweichung
		TWD_Abweichung[0] = winkelabweichung < TWD_Abweichung[0] ? winkelabweichung : TWD_Abweichung[0];
		TWD_Abweichung[1] = winkelabweichung > TWD_Abweichung[1] ? winkelabweichung : TWD_Abweichung[1];
		//console.log("TWD_PT1: " + this.gps.TSS.toFixed(2) + " TWD " + this.TWD.toFixed(2) + " delta ", + winkelabweichung.toFixed(2) + " Abw: " + this.TWD_Abweichung[0].toFixed(2) + ":" + this.TWD_Abweichung[1].toFixed(2) + " DT " + this.deltat.toFixed(0))
	};


DrawMapLaylines=function(canvas, radius, props) {
	DrawLine=function(p1,p2,color){	
		ctx.beginPath();
		ctx.moveTo(p1[0],p1[1]);   // Move pen to center
		ctx.lineTo(p2[0],p2[1]);
		ctx.closePath();


		ctx.lineWidth = 5;//0.02*Math.min(x,y)
		ctx.fillStyle = color
		ctx.strokeStyle = color;// !!!
		let dashes=radius/4
		ctx.setLineDash([Math.floor(0.5*dashes), Math.floor(0.5*dashes)])	//0.1*Math.min(x,y), 0.1*Math.min(x,y)]);
		ctx.stroke();
	} 
	var ctx = canvas.getContext('2d');
	ctx.save();
	if(props.sailsteerboot)
	{
		// Layline vom Boot:
		// BBis
		p1=latloncoordinatetodevice([this.MapLayline.Boat.BB.P1._lon,this.MapLayline.Boat.BB.P1._lat]);
		p2=latloncoordinatetodevice([this.MapLayline.Boat.BB.P2._lon,this.MapLayline.Boat.BB.P2._lat]);
		this.DrawLine(p1,p2,this.MapLayline.Boat.BB.color);
		// SB
		p1=latloncoordinatetodevice([this.MapLayline.Boat.SB.P1._lon,this.MapLayline.Boat.SB.P1._lat]);
		p2=latloncoordinatetodevice([this.MapLayline.Boat.SB.P2._lon,this.MapLayline.Boat.SB.P2._lat]);
		this.DrawLine(p1,p2,this.MapLayline.Boat.SB.color);
	}
	if(props.sailsteermarke)
	{
		ctx.save();
		// Layline vom Wegpunkt:
		// BB
		p1=latloncoordinatetodevice([this.MapLayline.WP.BB.P1._lon,this.MapLayline.WP.BB.P1._lat]);
		p2=latloncoordinatetodevice([this.MapLayline.WP.BB.P2._lon,this.MapLayline.WP.BB.P2._lat]);
		this.DrawLine(p1,p2,this.MapLayline.WP.BB.color);
		// SB
		p1=latloncoordinatetodevice([this.MapLayline.WP.SB.P1._lon,this.MapLayline.WP.SB.P1._lat]);
		p2=latloncoordinatetodevice([this.MapLayline.WP.SB.P2._lon,this.MapLayline.WP.SB.P2._lat]);
		this.DrawLine(p1,p2,this.MapLayline.WP.SB.color);

	}
	ctx.restore()
}


DrawLaylineArea=function(canvas, radius, angle,TWD_Abweichung, color) {
	/*
	if (opt_options && opt_options.fixX !== undefined) {
		center[0]=opt_options.fixX*this.devPixelRatio;
	}
	if (opt_options &&  opt_options.fixY !== undefined) {
		center[1]=opt_options.fixY*this.devPixelRatio;
	}
	*/
	var ctx = canvas.getContext('2d');
	ctx.save();

	var x = 0;
	var y = 0;

	var radius = 0.9*radius	//0.45*Math.min(x,y)

					ctx.rotate((angle / 180) * Math.PI)

					// Laylines
	ctx.beginPath();
	ctx.moveTo(0, 0);   // Move pen to center
	ctx.lineTo(0, -radius);
	ctx.closePath();


	ctx.lineWidth = 5;//0.02*Math.min(x,y)
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	let dashes=radius/4
	ctx.setLineDash([Math.floor(0.5*dashes), Math.floor(0.5*dashes)])	//0.1*Math.min(x,y), 0.1*Math.min(x,y)]);
	ctx.stroke();

	ctx.lineWidth = 0.01*Math.min(x,y)
					// Areas	
	ctx.globalAlpha *= 0.3;
	ctx.beginPath();
	ctx.moveTo(0, 0);   // Move pen to center
	ctx.arc(0, 0, radius, Math.PI * (TWD_Abweichung[0] - 90) / 180, Math.PI * (TWD_Abweichung[1] - 90) / 180)
					ctx.closePath();

	ctx.fillStyle = color;
	//ctx.setLineDash([]);
	ctx.fill()
					//ctx.stroke();
	ctx.restore()
},




		DrawWindpfeilIcon=function(canvas, radius,angle, color, Text) {
	if (!canvas) return undefined;
	var ctx = canvas.getContext('2d');
	ctx.save();

	var radius_kompassring = radius	//0.525*Math.min(x,y);
	var radius_outer_ring = radius *1.3//= 0.65*Math.min(x,y);
	var thickness = 0.1*Math.min(400,400)
					thickness = 25;

	ctx.rotate((angle / 180) * Math.PI)

					ctx.beginPath();
	if (Text == 'A')
		ctx.moveTo(0, -radius_kompassring + 0.75*thickness); // Move pen to bottom-center corner
	else
		ctx.moveTo(0, -radius_kompassring - 0.5*thickness); // Move pen to bottom-center corner
	ctx.lineTo(-0.75*thickness, -radius_outer_ring-thickness); // Line to top left corner
		ctx.lineTo(+0.75*thickness, -radius_outer_ring-thickness); // Line to top-right corner
	ctx.closePath(); // Line to bottom-center corner
		ctx.fillStyle = color;
	ctx.lineWidth = 0.05*thickness;
	ctx.strokeStyle = color;
	ctx.fill();
	ctx.strokeStyle = "rgb(0,0,0)";
	ctx.stroke(); // Render the path				ctx.fillStyle='rgb(255,255,255)';

	ctx.fillStyle = "rgb(255,255,255)";
	ctx.textAlign = "center";
	ctx.font = "bold 20px Arial";
	ctx.fillText(Text, 0, -radius_outer_ring);
	ctx.restore();

},




		DrawOuterRing=function(canvas,radius, angle){
	if (!canvas) return undefined;

	var ctx = canvas.getContext('2d');
	ctx.save();

	var x = 0;
	var y = 0;
	ctx.rotate((angle / 180) * Math.PI)

					var thickness = 0.2*radius
	radius*=1.25
	var someColors = [];
	someColors.push("#F00");
	someColors.push("#000");
	someColors.push("#0F0");

	drawMultiRadiantCircle(x, y, radius, thickness, someColors);

	function drawMultiRadiantCircle(xc, yc, r, thickness, radientColors) 
	{
		var partLength = (2 * Math.PI) / 2;
		var start = -Math.PI / 2;
		var gradient = null;
		var startColor = null,
				endColor = null;

		for (var i = 0; i < 2; i++) {
			startColor = radientColors[i];
			endColor = radientColors[(i + 1) % radientColors.length];

			// x start / end of the next arc to draw
			var xStart = xc + Math.cos(start) * r;
			var xEnd = xc + Math.cos(start + partLength) * r;
			// y start / end of the next arc to draw
			var yStart = yc + Math.sin(start) * r;
			var yEnd = yc + Math.sin(start + partLength) * r;

			ctx.beginPath();

			gradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
			gradient.addColorStop(0, startColor);
			gradient.addColorStop(1.0, endColor);

			ctx.strokeStyle = gradient;
			ctx.arc(xc, yc, r, start, start + partLength);
			ctx.lineWidth = thickness;
			ctx.stroke();
			ctx.closePath();

			start += partLength;
		}
	}
	for (var i = 0; i < 360; i += 10) {
		ctx.save();
		ctx.rotate((i / 180) * Math.PI);
		if (i % 30 == 0) {
			ctx.beginPath(); // Start a new path
			ctx.moveTo(0, -radius+0.9*thickness/2); // Move the pen to (30, 50)
			ctx.lineTo(0, -radius-0.9*thickness/2); // Draw a line to (150, 100)
			ctx.lineWidth = 0.1*thickness;
			ctx.strokeStyle = "rgb(255,255,255)";
			ctx.stroke(); // Render the path				ctx.fillStyle='rgb(255,255,255)';
		} else {
			ctx.beginPath();
			ctx.fillStyle = "rgb(190,190,190)";
			ctx.arc(0, -radius, 0.1*thickness, 0, 2 * Math.PI, false);
			ctx.fill();
			ctx.lineWidth = 0.05*thickness;
			ctx.strokeStyle = "rgb(190,190,190)";
			ctx.stroke();
		}
		ctx.restore();
	}
	ctx.restore();
}, //Ende OuterRing

DrawKompassring=function(canvas,radius, angle) {
	if (!canvas) return undefined;

	var ctx = canvas.getContext('2d');
	ctx.save();

	ctx.rotate((angle / 180) * Math.PI)
	var thickness = 0.2*radius//1*Math.min(x,y)
					ctx.beginPath();
	ctx.arc(0, 0, radius, 0, 2 * Math.PI, false);
	ctx.lineWidth = thickness;
	ctx.strokeStyle = "rgb(255,255,255)";
	ctx.stroke();
	for (var i = 0; i < 360; i += 10) {
		ctx.save();
		ctx.rotate((i / 180) * Math.PI);
		if (i % 30 == 0) {
			ctx.fillStyle = "rgb(00,00,00)";
			ctx.textAlign = "center";
			ctx.font = "bold 12px Arial";
			ctx.fillText(i.toString().padStart(3, "0"), 0, -radius + thickness/4);
		} else {
			ctx.beginPath();
			ctx.fillStyle = "rgb(100,100,100)";
			ctx.arc(0, -radius, 0.1*thickness, 0, 2 * Math.PI, false);
			ctx.fill();
			ctx.lineWidth = 0.05*thickness;
			ctx.strokeStyle = "rgb(100,100,100)";
			ctx.stroke();
		}
		ctx.restore();
	}
	ctx.restore();
} // Ende Kompassring


let modulePath = "/viewer/libraries/latlon.js";
async function load() {
	let latlon = await import(modulePath);
}
