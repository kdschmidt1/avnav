var TWD_Abweichung = [0,0]
var old_time=performance.now()
var ln0_1=Math.log(0.1)


latloncoordinatetodevice=function(coordinate){
	// to map coordinates
	let pos=sailsteermapholder.transformToMap(coordinate)
    //let rt=this.pointToCssPixel(point);->
	pixel=sailsteermapholder.olmap.getPixelFromCoordinate(pos);
	//pixelToDevice(rt); ->    
	let rt=[];
	rt[0]=(pixel[0]+canvasdelta[0])*window.window.devicePixelRatio;
	rt[1]=(pixel[1]+canvasdelta[1])*window.window.devicePixelRatio;
	return(rt);
	}

drawcross=function(cc,left,top,right,bottom, color)
	{
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
		
	},


/*
		drawing.drawImageToContext(center, this.symbolStyles[symbol].image, style);

		//		NOW THE DYNAMIC CONTENT TO BE DIRECTLY DRAWN ONTO CANVAS;
		if (symbol == "LaylineBB" || symbol == "LaylineSB") 
		{
			drawing.context.save()
			this.DrawLaylineArea(drawing, center, symbol == "LaylineBB" ? "red" : "green", style)
			drawing.context.restore()

			if (this.gps.waypoint.position) {
				//Laylines vom Wegpunkt zeichnen
				let draw_distance = globalStore.getData(keys.properties.sailsteeroverlap) ? globalStore.getData(keys.properties.sailsteerlength) : Math.min(symbol == "LaylineBB" ? this.dist_BB : this.dist_SB, globalStore.getData(keys.properties.sailsteerlength))
				let targetWP = this.computeTarget(this.WP_Map, style.rotation * 180 / Math.PI + 180, draw_distance)
				if (globalStore.getData(keys.properties.sailsteermarke))
					drawing.drawLineToContext([this.WP_Map, targetWP], { color: symbol == "LaylineBB" ? "red" : "green", width: 5, dashed: true });
				// Only for testing purposes
				//if (is_SB != null && is_BB != null)
				//drawing.drawLineToContext([pos_SB, pos_BB], { color: "blue", width: 5 });
			}

			//Laylines vom Boot zeichnen
			let draw_distance = globalStore.getData(keys.properties.sailsteeroverlap) ? globalStore.getData(keys.properties.sailsteerlength) : Math.min(symbol == "LaylineBB" ? this.dist_BB : this.dist_SB, globalStore.getData(keys.properties.sailsteerlength))
			let targetboat = this.computeTarget(boatPosition, style.rotation * 180 / Math.PI, draw_distance)
			if (globalStore.getData(keys.properties.sailsteerboot))
				drawing.drawLineToContext([boatPosition, targetboat], { color: symbol == "LaylineBB" ? "red" : "green", width: 5, dashed: true });
			drawing.drawImageToContext(center, this.symbolStyles[symbol].image, style);
		}
*/


mycanvasFunction = function(canvas, mapholder, delta, extent, ImageCanvasSource, resolution, pixelRatio, size, projection, props) {
       var ctx = canvas.getContext('2d');
       canvas.setAttribute('width', size[0]);
       canvas.setAttribute('height', size[1]);

	//sailsteercanvas = canvas;
	sailsteermapholder=mapholder;
	sailsteerImageCanvasSource=ImageCanvasSource; // WIRD BENNÖTIGT IM SAILSTEER PLUGIN
	canvasdelta = delta;
	//canvasOrigin = mapholder.olmap.getPixelFromCoordinate([extent[0], extent[3]]);
	
	drawcross(ctx,0,0,canvas.getAttribute('width'),canvas.getAttribute('height'), "red");
	renderCanvas(canvas,mapholder.center,props);
     return canvas;
   };
/*
var fileref=document.createElement('script');
fileref.setAttribute("type","text/javascript");
fileref.setAttribute("src", './util/globalstore.jsx');
document.getElementsByTagName("headsailsteermapholder")[0].appendChild(fileref)
*/
var first=true;

toCoord=function(a){
    let rt=[a.longitude,a.latitude];
    return rt;
};





renderCanvas = function(canvas, center, props) {
	load();
	let coordinate=[];
	coordinate[0]=props.boatposition.longitude;
	coordinate[1]=props.boatposition.latitude;
	boatPosition = sailsteermapholder.transformToMap(coordinate);

	cc = canvas.getContext('2d');
	cc.save();
	cc.setTransform(1, 0, 0, 1, 0, 0);
	cc.clearRect(0, 0, canvas.width, canvas.height);
	//cc.rotate(sailsteermapholder.drawing.rotation)
	canvasWidth = canvas.getAttribute('width');
	canvasHeight = canvas.getAttribute('height');


	let center_canvas_coordinates = latloncoordinatetodevice(center);
	//center_canvas_coordinates = [canvas.width / 2, canvas.height / 2];
	first = false;

	cc.translate(center_canvas_coordinates[0], center_canvas_coordinates[1]); // Nullpunkt auf den center (in canvaskoordinaten) setzen
	cc.rotate(sailsteermapholder.drawing.rotation)

	var angle = props.course
	var radius = 120;

	calc_LaylineAreas(props)
	DrawOuterRing(canvas, radius, -angle);
	DrawKompassring(canvas, radius, -angle);
	DrawLaylineArea(canvas, radius, props.LLBB, TWD_Abweichung, "red")
	DrawLaylineArea(canvas, radius, props.LLSB, TWD_Abweichung, "rgb(0,255,0)")
	DrawWindpfeilIcon(canvas, radius, props.AWA + props.course, "rgb(0,255,0)", 'A')
	DrawWindpfeilIcon(canvas, radius, props.TWA + props.course, "blue", 'T')
	//	if(globalStore.getData(keys.properties.sailsteerTWDfilt))	 
	DrawWindpfeilIcon(canvas, radius, props.TSS, "yellow", '~')

	//Laylines vom Boot zeichnen BB
	let draw_distance = props.sailsteeroverlap ? props.sailsteerlength : Math.min(this.dist_BB, props.sailsteerlength);
/*	let targetboat = this.computeTarget(props.LLBB * 180 / Math.PI, draw_distance)
	if (props.sailsteerboot) // laylinbes vom boot aus zeichnen
		drawing.drawLineToContext([boatPosition, targetboat], { color: "red", width: 5, dashed: true });
*/


	cc.restore();
	//cc.setTransform(1, 0, 0, 1, 0, 0);

	DrawMapLaylines(canvas) 


};



calc_LaylineAreas = function(props) {

	this.dist_SB = this.dist_BB = props.sailsteerlength
	b_pos = new LatLon(props.boatposition.lat, props.boatposition.lon);
	if (props.WPposition) {
		WP_pos = new LatLon(props.WPposition.lat, props.WPposition.lon);

		// Schnittpunkte berechnen
		let is_SB = LatLon.intersection(b_pos, props.LLSB, WP_pos, props.LLBB + 180)
		let is_BB = LatLon.intersection(b_pos, props.LLBB, WP_pos, props.LLSB + 180)
		let dist_BB = b_pos.distanceTo(is_BB);
		let dist_SB = b_pos.distanceTo(is_SB);


		this.ep_BB_boat = is_BB; // wenn abstand zu gross, endpunkte der LL berechnen
		this.ep_BB_WP = is_BB;
		this.ep_SB_boat = is_SB;
		this.ep_SB_WP = is_SB;

		this.MapLayline = { Boat: { SB: { P1: b_pos, P2: is_SB, color: 'rgb(0,255,0)' }, BB: { P1: b_pos, P2: is_BB, color: 'red' } }, WP: { SB: { P1: WP_pos, P2: is_SB, color: 'red' }, BB: { P1: WP_pos, P2: is_BB, color: 'rgb(0,255,0)' } } }
		this.ep_BB_boat = is_BB; // wenn abstand zu gross, endpunkte der LL berechnen

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


DrawMapLaylines=function(canvas) 
	{
	DrawLine=function(p1,p2,color)
	{	ctx.beginPath();
	ctx.moveTo(p1[0],p1[1]);   // Move pen to center
	ctx.lineTo(p2[0],p2[1]);
	ctx.closePath();
	

	ctx.lineWidth = 5;//0.02*Math.min(x,y)
	ctx.fillStyle = color
	ctx.strokeStyle = color;// !!!
	ctx.stroke();
} 
	var ctx = canvas.getContext('2d');
	ctx.save();
// Layline vom Boot:
// BB
p1=latloncoordinatetodevice([this.MapLayline.Boat.BB.P1._lon,this.MapLayline.Boat.BB.P1._lat]);
p2=latloncoordinatetodevice([this.MapLayline.Boat.BB.P2._lon,this.MapLayline.Boat.BB.P2._lat]);
	this.DrawLine(p1,p2,this.MapLayline.Boat.BB.color);
// SB
p1=latloncoordinatetodevice([this.MapLayline.Boat.SB.P1._lon,this.MapLayline.Boat.SB.P1._lat]);
p2=latloncoordinatetodevice([this.MapLayline.Boat.SB.P2._lon,this.MapLayline.Boat.SB.P2._lat]);
	this.DrawLine(p1,p2,this.MapLayline.Boat.SB.color);
	ctx.restore()
// Layline vom Wegpunkt:
// BB
p1=latloncoordinatetodevice([this.MapLayline.WP.BB.P1._lon,this.MapLayline.WP.BB.P1._lat]);
p2=latloncoordinatetodevice([this.MapLayline.WP.BB.P2._lon,this.MapLayline.WP.BB.P2._lat]);
	this.DrawLine(p1,p2,this.MapLayline.WP.BB.color);
// SB
p1=latloncoordinatetodevice([this.MapLayline.WP.SB.P1._lon,this.MapLayline.WP.SB.P1._lat]);
p2=latloncoordinatetodevice([this.MapLayline.WP.SB.P2._lon,this.MapLayline.WP.SB.P2._lat]);
	this.DrawLine(p1,p2,this.MapLayline.WP.SB.color);
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
	ctx.rotate((-angle / 180) * Math.PI)

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
