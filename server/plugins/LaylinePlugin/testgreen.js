//testgreen
userCanvasFunction = function(ctx)
{
	let coordinates=this.latlon_to_Canvas([0,0]);
	ctx.beginPath();
	ctx.moveTo(coordinates[0]-100,coordinates[1]);
	ctx.lineTo(coordinates[0]+100,coordinates[1]);

	ctx.moveTo(coordinates[0],coordinates[1]-100);
	ctx.lineTo(coordinates[0],coordinates[1]+100);

	ctx.stroke();	
	ctx.lineWidth = 5;//0.02*Math.min(x,y)
	ctx.fillStyle = "green";
	ctx.strokeStyle = "green";
	ctx.stroke();

} 
