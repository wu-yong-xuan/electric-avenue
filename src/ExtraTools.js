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