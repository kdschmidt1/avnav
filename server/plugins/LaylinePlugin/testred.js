//testgreen




userCanvasFunction = function(ctx){
	 /**
     * mandatory - Called to draw user defined canvas elements
     * @param ctx - the Canvas drawing context, the origin is set 
	 *				to the center of the map
     * @returns nothing
	 * "this" (the current context) is a ImageCanvasSource object (see: https://openlayers.org/en/latest/apidoc/module-ol_source_ImageCanvas-ImageCanvasSource.html) 
	 *  and contains a self declared function "lonlat_to_Canvas([lon,lat])"
	 *  to calculate the canvas-coordinates of a specific map position
     */

	let coordinates=this.lonlat_to_Canvas([10,0]);
	ctx.beginPath();
	ctx.moveTo(coordinates[0]-100,coordinates[1]);
	ctx.lineTo(coordinates[0]+100,coordinates[1]);

	ctx.moveTo(coordinates[0],coordinates[1]-100);
	ctx.lineTo(coordinates[0],coordinates[1]+100);

	ctx.stroke();	
	ctx.lineWidth = 5;//0.02*Math.min(x,y)
	ctx.fillStyle = "red";
	ctx.strokeStyle = "red";
	ctx.stroke();

} 
