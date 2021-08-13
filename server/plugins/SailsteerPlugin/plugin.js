console.log("sailsteer plugin loaded");

sailsteercanvas = {};
sailsteermapholder={}
sailsteerImageCanvasSource={};

/**
 * @param {olCoordinate} point the position in map coordinates
 */
latloncoordinatetodevice=function(coordinate){
	// to map coordinates
	let pos=sailsteermapholder.transformToMap(coordinate)
    //let rt=this.pointToCssPixel(point);->
	pixel=sailsteermapholder.olmap.getPixelFromCoordinate(pos);
	//pixelToDevice(rt); ->    
	let mapExtent=sailsteermapholder.olmap.getView().calculateExtent(sailsteermapholder.olmap.getSize())
	let ce=sailsteerImageCanvasSource.canvas_.getExtent();
	let mapOrigin = sailsteermapholder.olmap.getPixelFromCoordinate([mapExtent[0], mapExtent[3]]);
	let canvasOrigin=sailsteermapholder.olmap.getPixelFromCoordinate([ce[0], ce[3]]);
	let delta = [mapOrigin[0]-canvasOrigin[0], mapOrigin[1]-canvasOrigin[1]]
	let rt=[];
	rt[0]=(pixel[0]+delta[0])*window.window.devicePixelRatio;
	rt[1]=(pixel[1]+delta[1])*window.window.devicePixelRatio;
	return(rt);
	}
	
coordinatetocanvas=function(coordinate){
	let ret=[0,0];		
	let v2=sailsteermapholder.coordToPixel(sailsteermapholder.pointToMap(coordinate))
	let mapExtent=sailsteermapholder.olmap.getView().calculateExtent(sailsteermapholder.olmap.getSize())
	let mapOrigin = sailsteermapholder.olmap.getPixelFromCoordinate([mapExtent[0], mapExtent[3]]);
	let ce=sailsteerImageCanvasSource.canvas_.getExtent();
	let canvasOrigin=sailsteermapholder.olmap.getPixelFromCoordinate([ce[0], ce[3]]);
	let delta = [mapOrigin[0]-canvasOrigin[0], mapOrigin[1]-canvasOrigin[1]]
	ret[0]=v2[0]+delta[0]	
	ret[1]=v2[1]+delta[1]
	return ret;	
/*
	// to map coordinates
	let pos=sailsteermapholder.transformToMap(coordinate)
    //let rt=this.pointToCssPixel(point);->
	pixel=sailsteermapholder.olmap.getPixelFromCoordinate(pos);
	//pixelToDevice(rt); ->    
	rt[0]=pixel[0]*window.devPixelRatio;
	rt[1]=pixel[1]*window.devPixelRatio;

*/
+delta[1]
	}

 /*
mycanvasXFunction = function(canvas, mapholder, delta, extent, ImageCanvasSource, resolution, pixelRatio, size, projection) {
       var context = canvas.getContext('2d');
       var canvasWidth = size[0], canvasHeight = size[1];
       canvas.setAttribute('width', canvasWidth);
       canvas.setAttribute('height', canvasHeight);
	sailsteercanvas = canvas;
	sailsteermapholder=mapholder;
	sailsteerImageCanvasSource=ImageCanvasSource;
	canvasdelta = delta;
	canvasOrigin = mapholder.olmap.getPixelFromCoordinate([extent[0], extent[3]]);
     return canvas;
   };
*/

//       		window.localStorage.setItem('kds',mycanvasFunction)
            let widgetParameters = {
				formatterParameters: true,
				sailsteerrefresh: {type: 'NUMBER', default: 5},
				sailsteerPT1frequenz: {type: 'NUMBER', default: 0.2},
            };

var TWD_Abweichung = [0,0]
var old_time=performance.now()
var ln0_1=Math.log(0.1)
var widget={

    name:"SailsteerWidget",
    /**
     * a function that will render the HTML content of the widget
     * normally it should return a div with the class widgetData
     * but basically you are free
     * If you return null, the widget will not be visible any more.
     * @param props
     * @returns {string}
     */

	initFunction:function(a,b)
	{
		var t=0;
		
	},


	drawcross:function(left,top,right,bottom, color)
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


    /**
     * optional render some graphics to a canvas object
     * you should style the canvas dimensions in the plugin.css
     * be sure to potentially resize and empty the canvas before drawing
     * @param canvas
     * @param props - the properties you have provided here + the properties you
     *                defined with the storeKeys
     */




    renderCanvas:function(canvas,props){
	sailsteerImageCanvasSource.refresh();
	return;
	canvas=sailsteercanvas;
	console.log(window.localStorage.getItem('avnav.center'));
	cc=canvas.getContext('2d');
	cc.save();
	cc.setTransform(1, 0, 0, 1, 0, 0);
	cc.clearRect(0, 0, canvas.width, canvas.height);
	//cc.rotate(sailsteermapholder.drawing.rotation)
    canvasWidth=canvas.getAttribute('width');
    canvasHeight=canvas.getAttribute('height');

	props.drawcross(0,0,canvas.getAttribute('width'),canvas.getAttribute('height'), "red");
	
	center=sailsteermapholder.center;
/*	let v1=sailsteermapholder.pointToMap(center)
	let v2=sailsteermapholddraer.coordToPixel(v1)
	let mapExtent=sailsteermapholder.olmap.getView().calculateExtent(sailsteermapholder.olmap.getSize())
	let mapOrigin = sailsteermapholder.olmap.getPixelFromCoordinate([mapExtent[0], mapExtent[3]]);
	let ce=sailsteerImageCanvasSource.canvas_.getExtent();
	canvasOrigin=sailsteermapholder.olmap.getPixelFromCoordinate([ce[0], ce[3]]);
	let delta = [mapOrigin[0]-canvasOrigin[0], mapOrigin[1]-canvasOrigin[1]]
*/
	let testcenter=coordinatetocanvas(center);
	//cc.rotate(sailsteermapholder.drawing.rotation)
	let center_canvas_coordinates=latloncoordinatetodevice(center);

//	let point=[v2[0]+delta[0], v2[1]+delta[1]];
	cc.translate(center_canvas_coordinates[0], center_canvas_coordinates[1]); // Nullpunkt auf den center (in canvaskoordinaten) setzen
	cc.rotate(sailsteermapholder.drawing.rotation)




//	cc.translate(point); // Nullpunkt auf den center (in canvaskoordinaten) setzen

	var angle=props.course
	var radius=120
	//globalStore.getData(keys.properties.sailsteerrefresh)

	props.calc_LaylineAreas(props)
	props.DrawOuterRing(canvas, radius, -angle);
	props.DrawKompassring(canvas, radius, -angle);
	props.DrawLaylineArea(canvas, radius, props.LLBB,TWD_Abweichung, "red")
	props.DrawLaylineArea(canvas, radius, props.LLSB,TWD_Abweichung, "rgb(0,255,0)")
	props.DrawWindpfeilIcon(canvas,radius,props.AWA+props.course, "rgb(0,255,0)", 'A')
	props.DrawWindpfeilIcon(canvas,radius,props.TWA+props.course, "blue", 'T')
 //	if(globalStore.getData(keys.properties.sailsteerTWDfilt))	 
		props.DrawWindpfeilIcon(canvas,radius,props.TSS, "yellow", '~')
cc.restore();

  },
    /**
     * the access to the internal store
     * this should be an object where the keys are the names you would like to
     * see as properties when your render functions are called
     * whenever one of the values in the store is changing, your render functions will be called
     */
    storeKeys:{
      course: 'nav.gps.course',
      myValue: 'nav.gps.test', //stored at the server side with gps.test
		AWA:'nav.gps.AWA',
		TWA:'nav.gps.TWA',
		TWD:'nav.gps.TWD',
		TSS:'nav.gps.TSS',
		LLSB:'nav.gps.LLSB',
		LLBB:'nav.gps.LLBB',
 //       centerPosition: keys.map.centerPosition,


    },
    caption: "Sailsteer",
    unit: "",


calc_LaylineAreas:function(props) {

// Berechnungen für die Laylineareas
// Die Breite der Areas (Winkelbereich) wird über die Refreshzeit abgebaut


	let reduktionszeit = props.sailsteerrefresh * 60

	let difftime = (performance.now()-old_time)/1000 // sec
	old_time=performance.now()

	let k=ln0_1/reduktionszeit
	for (var i = 0; i < 2; i++)
		TWD_Abweichung[i] *= Math.exp(k*difftime)


	let winkelabweichung = 0;
	winkelabweichung = props.TWD - props.TSS
	winkelabweichung %=360
	if (Math.abs(winkelabweichung) > 180)
	winkelabweichung = winkelabweichung < -180 ? winkelabweichung % 180 + 180 : winkelabweichung
	winkelabweichung = winkelabweichung > 180 ? winkelabweichung % 180 - 180 : winkelabweichung

	TWD_Abweichung[0] = winkelabweichung < TWD_Abweichung[0] ? winkelabweichung : TWD_Abweichung[0];
	TWD_Abweichung[1] = winkelabweichung > TWD_Abweichung[1] ? winkelabweichung : TWD_Abweichung[1];
	//console.log("TWD_PT1: " + this.gps.TSS.toFixed(2) + " TWD " + this.TWD.toFixed(2) + " delta ", + winkelabweichung.toFixed(2) + " Abw: " + this.TWD_Abweichung[0].toFixed(2) + ":" + this.TWD_Abweichung[1].toFixed(2) + " DT " + this.deltat.toFixed(0))
},



DrawLaylineArea: function(canvas, radius, angle,TWD_Abweichung, color) {
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




DrawWindpfeilIcon:function(canvas, radius,angle, color, Text) {
	if (!canvas) return undefined;
	var ctx = canvas.getContext('2d');
	ctx.save();

	var x = 0;
	var y = 0;
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




DrawOuterRing:function(canvas,radius, angle){
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

DrawKompassring:function(canvas,radius, angle) {
	if (!canvas) return undefined;

	var ctx = canvas.getContext('2d');
	ctx.save();

	var x = 0;
	var y = 0;
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

};
avnav.api.registerWidget(widget, widgetParameters);

/**
 * a widget that demonstrates how a widget from a plugin can interact with the python part
 * the widget will display the number of received nmea records
 * with a reset button the counter in the plugin at the python side can be reset
 *
 */
var widgetServer={
    name:"testPlugin_ServerWidget",
    /**
     * if our plugin would like to use event handlers (like button click)
     * we need to register handler functions
     * this can be done at any time - but for performance reasons this should be done
     * inside an init function
     * @param context - the context - this is an object being the "this" for all other function calls
     *                  there is an empty eventHandler object in this context.
     *                  we need to register a function for every event handler we would like to use
     *                  later in renderHtml
     */
    initFunction:function(context){
        /**
         * each event handler we register will get the event as parameter
         * when being called, this is pointing to the context (not the event target - this can be obtained by ev.target)
         * in this example we issue a request to the python side of the plugin using the
         * global variable AVNAV_BASE_URL+"/api" and appending a further url
         * We expect the response to be json
         * @param ev
         */
        context.eventHandler.buttonClick=function(ev){
            //when the event handle ris called, this points to the context
            var self=this;
            var id=(new Date()).getTime();
            //we remember this request as the currently last request being run
            //we could also prevent a new request if we want
            self.requestRunning=id;
            //as we add a differnt class to our display (color...) when a request is running
            //we must redraw now
            self.triggerRedraw();
            fetch(AVNAV_BASE_URL+"/api/reset")
                .then(function(data){
                    return data.json();
                })
                .then(function(json)
                {
                    if (self.requestRunning==id) {
                        //if this is the answer to the last running request - switch of
                        //the request running - and redraw
                        self.requestRunning=undefined;
                        self.triggerRedraw();
                    }
                    //alert("STATUS:"+json.status);
                })
                .catch(function(error){
                    if (self.requestRunning==id) {
                        //if this is the answer to the last running request - switch of
                        //the request running - and redraw
                        self.requestRunning=undefined;
                        self.triggerRedraw();
                    }
                    avnav.api.showToast("ERROR: "+error)}
            );
        };
        context.requestRunning=undefined;
    },
    /**
     * a function that will render the HTML content of the widget
     * normally it should return a div with the class widgetData
     * but basically you are free
     * If you return null, the widget will not be visible any more.
     * @param props
     * @returns {string}
     */
    renderHtml:function(props){
        /**
         * in our html below we assign an event handler to the button
         * just be careful: this is not a strict W3C conforming HTML syntax:
         * the event handler is not directly js code but only the name(!) of the registered event handler.
         * it must be one of the names we have registered at the context.eventHandler in our init function
         * Unknown handlers or pure java script code will be silently ignored!
         */
        var buttonClass="reset";
        //as we are not sure if the browser supports template strings we use the AvNav helper for that...
        var replacements={
            myValue:props.myValue,
            buttonClass: buttonClass,
            disabled: this.requestRunning?"disabled":""
        };
        var template='<div class="widgetData">' +
            '<button class="${buttonClass}" ${disabled}  onclick="buttonClick">Reset</button>' +
            '<div class="server">${myValue}</div></div>';
        return avnav.api.templateReplace(template,replacements);
    },
    /**
     * the access to the internal store
     * this should be an object where the keys are the names you would like to
     * see as properties when your render functions are called
     * whenever one of the values in the store is changing, your render functions will be called
     */
    storeKeys:{
        myValue: 'nav.gps.test' //stored at the server side with gps.test

    },
    caption: "Server Nmea Requests",
    unit: ""
};

//avnav.api.registerWidget(widgetServer);
//avnav.api.log("testPlugin widgets registered");
