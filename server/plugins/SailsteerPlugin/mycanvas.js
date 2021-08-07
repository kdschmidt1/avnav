  var numPieCharts = 5, coordinates=[], data=[], colors=[];
   var i, p;
   for(i=0; i< numPieCharts; i++) {
       coordinates.push([-180+360*Math.random(), -90+180*Math.random()]);
       p = 100*Math.random();
       data.push([p, 100-p]);
       colors.push([
           '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6), 
           '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)]);
   }

   var mycanvasFunction = function(canvas, map, extent, resolution, pixelRatio, size, projection) {
       var context = canvas.getContext('2d');
       var canvasWidth = size[0], canvasHeight = size[1];
       canvas.setAttribute('width', canvasWidth);
       canvas.setAttribute('height', canvasHeight);

       // Canvas extent is different than map extent, so compute delta between 
       // left-top of map and canvas extent.
       var mapExtent = map.getView().calculateExtent(map.getSize())
       var canvasOrigin = map.getPixelFromCoordinate([extent[0], extent[3]]);
       var mapOrigin = map.getPixelFromCoordinate([mapExtent[0], mapExtent[3]]);
       var delta = [mapOrigin[0]-canvasOrigin[0], mapOrigin[1]-canvasOrigin[1]]

       var radius = 50;

       // Track the accumulated arcs drawn
       var totalArc = -90*Math.PI / 180;
       var percentToRadians = 1 / 100*360 *Math.PI / 180;
       var wedgeRadians;

       function drawWedge(coordinate, percent, color) {

           var point = [0,0]
           var pixel = map.getPixelFromCoordinate(point);
           var cX = pixel[0] + delta[0], cY = pixel[1] + delta[1];
cX=canvasWidth/2;
cY=canvasHeight/2;
           // Compute size of the wedge in radians
           wedgeRadians = percent * percentToRadians;

           // Draw
           context.save();
           context.beginPath();
           context.moveTo(cX, cY);
           context.arc(cX, cY, radius, totalArc, totalArc + wedgeRadians, false);
           context.closePath();
           context.fillStyle = color;
           context.fill();
           context.lineWidth = 1;
           context.strokeStyle = '#666666';
           context.stroke();
           context.restore();

           // Accumulate the size of wedges
           totalArc += wedgeRadians;
       }

       var drawPie = function(coordinate, data, colors) {
           for(var i=0;i<data.length;i++){
               drawWedge(coordinate, data[i],colors[i]);
           }
       }

       for(var i=0; i<coordinates.length;i++){
           drawPie(coordinates[i], data[i], colors[i]);
       }

       return canvas;
   };
export {mycanvasFunction}