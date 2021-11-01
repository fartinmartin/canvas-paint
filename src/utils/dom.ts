export const isTouch = () => "ontouchstart" in window.document;

export const getInputCoords = (event, canvas) => {
  let x, y;
  if (isTouch()) {
    x = event.touches[0].pageX;
    y = event.touches[0].pageY;
  } else {
    x = event.pageX;
    y = event.pageY;
  }

  // check this every time for real-time resizing
  const elBCRect = canvas.getBoundingClientRect();

  // need to consider scrolled positions
  const elRect = {
    left: elBCRect.left + window.pageXOffset,
    top: elBCRect.top + window.pageYOffset,
  };

  // if canvas has styled
  const elScale = {
    x: canvas.width / elBCRect.width,
    y: canvas.height / elBCRect.height,
  };

  return {
    x: (x - elRect.left) * elScale.x,
    y: (y - elRect.top) * elScale.y,
  };
};
