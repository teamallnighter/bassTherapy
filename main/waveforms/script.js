let canvas = document.getElementById("myCanvas"),
  ctx = canvas.getContext("2d"),
  width = (canvas.width = window.innerWidth),
  height = (canvas.height = window.innerHeight),
  centerY = height / 2,
  segNum = 200,
  lineWidth = centerY,
  lineNum = 100;

drawContent();

function drawContent() {
  ctx.clearRect(0, 0, width, height);
  let time = Date.now() / 5000;
  for (var j = 0; j < lineNum; j++) {
    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#00f";
    for (var i = 0; i < segNum; i++) {
      const x = (i / (segNum - 1)) * width;
      const px = i / 50;
      const py = j / 50 + time;
      const y = lineWidth * noise.perlin2(px, py) + centerY;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  requestAnimationFrame(drawContent);
}