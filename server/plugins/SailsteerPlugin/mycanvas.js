mycanvasFunction = function(canvas, mapholder, delta, extent, ImageCanvasSource, resolution, pixelRatio, size, projection) {
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
