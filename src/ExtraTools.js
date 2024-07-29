function dashedLine(x1, y1, x2, y2, dash, offset) {
    if (dash !== undefined) {
      drawingContext.setLineDash(dash);
    }
    if (offset !== undefined) {
      drawingContext.lineDashOffset = offset;
    }
    // draw the line (if no dash or offset values
    // are sent in, this will draw a line as usual)
    line(x1,y1, x2,y2);
    // reset dash values for next line
    drawingContext.setLineDash([]);
    drawingContext.lineDashOffset = 0;
  }

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function interpolateColor(color1, color2, factor) {
     if (factor === undefined) {
         factor = 0.5; 
    } 
    let rgb1 = hexToRgb(color1); 
    let rgb2 = hexToRgb(color2); 
    let r = Math.round(rgb1[0] + factor * (rgb2[0] - rgb1[0])); 
    let g = Math.round(rgb1[1] + factor * (rgb2[1] - rgb1[1])); 
    let b = Math.round(rgb1[2] + factor * (rgb2[2] - rgb1[2])); 
    return rgbToHex(r, g, b); 
}

function getRandom (list) {
  return list[Math.floor((Math.random()*list.length))];
}