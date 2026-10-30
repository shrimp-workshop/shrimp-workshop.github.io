(() => {
  const scenes = [...document.querySelectorAll('.rov-scene canvas')];
  if (!scenes.length) return;
  const root = document.documentElement;
  let dark = root.dataset.theme === 'dark';
  const ease = (a, b, p) => a + (b - a) * (p * p * (3 - 2 * p));
  const duration = 14;

  function render(canvas, elapsed) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const wide = canvas.closest('.challenge-playground');
    const night = dark || !!wide;
    const colors = night
      ? {floor:'#163a48', sand:'#2a5660', rock:'#3e6b73', weed:'#3a8f82', speck:'#6faaa9'}
      : {floor:'#e1eeea', sand:'#b2cfc8', rock:'#7eaaa6', weed:'#448d78', speck:'#8dbab4'};
    const offset = (canvas.width - 320) / 2;
    const cycle = Math.floor(elapsed / duration);
    const t = elapsed % duration;
    const dir = cycle % 2 ? -1 : 1;
    const targetX = 176;
    const dockX = targetX - dir * 78;
    const startX = dir > 0 ? -100 - offset : 420 + offset;
    const exitX = dir > 0 ? 420 + offset : -100 - offset;
    let x = dockX, y = 62, armX = 68, armY = 32, open = 1;
    let carrying = false;

    if (t < 3.8) {
      x = ease(startX, dockX, t / 3.8);
      y += Math.sin(t * 2) * 1.5;
    } else if (t < 5.6) {
      const p = (t - 3.8) / 1.8;
      y = ease(62, 83, p); armX = ease(68, 78, p); armY = ease(32, 46, p);
    } else if (t < 6.8) {
      y = 83; armX = 78; armY = 46; open = 1 - (t - 5.6) / 1.2;
    } else if (t < 8.4) {
      const p = (t - 6.8) / 1.6;
      carrying = true; open = 0;
      y = ease(83, 52, p); armX = ease(78, 68, p); armY = ease(46, 32, p);
    } else {
      const p = Math.min(1, (t - 8.4) / 4.1);
      carrying = true; open = 0;
      x = ease(dockX, exitX, p); y = ease(52, 44, p);
    }

    ctx.clearRect(0, 0, canvas.width, 160);
    ctx.save();ctx.translate(offset, 0);
    ctx.imageSmoothingEnabled = false;
    const rect = (px, py, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(px), Math.round(py), w, h);
    };
    // Integer pixels keep the illustration crisp at every display scale.
    const line = (x0, y0, x1, y1, color, width = 1) => {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let error = dx + dy;
      while (true) {
        rect(x0 - Math.floor(width / 2), y0 - Math.floor(width / 2), width, width, color);
        if (x0 === x1 && y0 === y1) break;
        const e = 2 * error;
        if (e >= dy) { error += dy; x0 += sx; }
        if (e <= dx) { error += dx; y0 += sy; }
      }
    };
    const object = (px, py) => {
      if (cycle % 3 === 0) {
        rect(px - 4, py - 5, 8, 10, '#b8733f');
        rect(px - 3, py - 6, 6, 10, '#edba73');
        rect(px - 2, py - 4, 2, 5, '#ffe1a0');
        rect(px - 4, py - 6, 8, 2, '#7a6455');
      } else if (cycle % 3 === 1) {
        rect(px - 3, py - 6, 7, 11, '#739ca4');
        rect(px - 2, py - 5, 3, 8, '#bbdbd7');
        rect(px - 3, py - 7, 7, 2, '#41656d');
        rect(px - 3, py + 3, 7, 2, '#41656d');
      } else {
        rect(px - 5, py - 5, 10, 10, '#b67a4a');
        rect(px - 4, py - 4, 8, 2, '#f0c38a');
        rect(px - 4, py, 8, 1, '#724e37');
        rect(px - 1, py - 4, 2, 8, '#e5ad68');
      }
    };

    // Seabed, rocks and small plants stay quiet behind the pickup action.
    rect(-offset, 143, canvas.width, 17, colors.floor);
    for (let i = 0; i < Math.ceil(canvas.width / 20); i++) {
      rect(i * 23 - 4 - offset, 141 + (i % 3), 15, 2, colors.sand);
      rect((i * 41 + 12) % canvas.width - offset, 148 + (i % 5), 2 + i % 3, 1, colors.sand);
    }
    [[33,142,14],[72,143,9],[253,143,18],[285,142,7]].forEach(([px,py,w]) => {
      rect(px,py-3,w,3,colors.rock);rect(px+3,py-5,w-5,2,colors.sand);
    });
    [20, 45, 271, 298].forEach((px, i) => {
      const sway = Math.round(Math.sin(elapsed * .9 + i) * 2);
      const height = 11 + (i % 3) * 5;
      line(px,143,px-1,143-height/2,colors.weed,2);
      line(px-1,143-height/2,px+sway,143-height,colors.weed,2);
      line(px,138,px+5,133-i,colors.weed,2);
      line(px-1,135,px-5,130-i,colors.weed,1);
    });
    ctx.globalAlpha = .5;
    for (let i = 0; i < 15; i++) {
      rect((i * 67 + elapsed * (i % 2 ? 1 : -1) + 640) % 320, 22 + (i * 23) % 101, i % 4 ? 1 : 2, 1, colors.speck);
    }
    ctx.globalAlpha = 1;
    if (!carrying) {
      const fall = Math.min(1, t / 3.4);
      const drift = Math.sin(fall * Math.PI * 3) * 6 * (1 - fall);
      let objectY = ease(-12, 135, fall);
      if (t > 3.4 && t < 3.9) objectY -= Math.sin((t - 3.4) / .5 * Math.PI) * 2;
      // The shadow appears gradually as the object approaches the seabed.
      ctx.globalAlpha = .22 * fall * fall;
      rect(targetX - 5, 141, 11, 1, colors.rock);
      ctx.globalAlpha = 1;
      object(targetX + drift, objectY);
      if (t >= 3.4 && t < 4.2) {
        const settle = (t - 3.4) / .8;
        ctx.globalAlpha = (1 - settle) * .65;
        for (const side of [-1, 1]) {
          rect(targetX + side * (6 + settle * 13), 140 - Math.sin(settle * Math.PI) * 4, 2, 1, colors.sand);
          rect(targetX + side * (4 + settle * 8), 140 - Math.sin(settle * Math.PI) * 2, 1, 1, colors.sand);
        }
        ctx.globalAlpha = 1;
      }
    }

    // Soft, stepped shadow beneath the vehicle.
    ctx.globalAlpha = .18;
    rect(x + dir * 5 - (dir < 0 ? 53 : 0), 139, 54, 2, colors.rock);
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(dir, 1);

    // A short yellow tether, blue buoyancy fairings and an open dark frame.
    line(-20,-10,-11,-2,'#c6a64e');line(-11,-2,-8,5,'#c6a64e');line(-8,5,4,10,'#c6a64e');
    rect(6,9,47,28,'#192f3b');rect(10,12,39,20,'#36515a');
    rect(12,14,35,16,night ? '#11313f' : '#b4d1cf');
    rect(8,5,43,5,'#24577c');rect(5,8,49,3,'#122d40');
    // Rear pontoon, separated from the front blue fairing.
    rect(15,0,35,8,'#1769a0');rect(18,-2,28,3,'#3194c6');rect(17,1,31,2,'#73c4de');
    // Transparent electronics enclosure and its forward camera.
    rect(15,15,35,11,'#648b95');rect(18,16,29,2,'#b1d2d2');
    rect(16,24,31,3,'#345564');rect(19,18,24,4,'#426675');
    rect(44,16,8,10,'#192e3d');rect(49,18,5,6,'#0b1f2e');
    rect(51,19,2,3,'#95e0dc');rect(15,17,3,8,'#1d3444');
    // Foreground blue buoyancy fairing has a squared pixel silhouette.
    rect(1,5,39,9,'#1673b3');rect(4,3,33,4,'#3198d0');
    rect(4,4,31,2,'#80d2ea');rect(0,8,3,4,'#24578c');rect(3,12,34,3,'#174f83');
    rect(9,35,43,3,'#223e4b');rect(6,12,3,24,'#1c3341');rect(49,12,3,25,'#1c3341');
    rect(10,34,38,1,'#66868d');rect(9,36,7,2,'#5d747a');rect(43,36,8,2,'#5d747a');

    function thruster(px,py) {
      rect(px+2,py,10,2,'#183441');rect(px,py+2,14,10,'#183441');rect(px+2,py+12,10,2,'#183441');
      rect(px+3,py+2,8,10,'#537984');rect(px+2,py+3,10,8,'#537984');
      rect(px+4,py+3,6,8,'#0c2534');rect(px+3,py+4,8,6,'#0c2534');
      if (Math.floor(elapsed * 9) % 2) {
        line(px+4,py+4,px+9,py+9,'#a0c2c3',2);line(px+9,py+4,px+4,py+9,'#729da6',2);
      } else {
        rect(px+6,py+3,2,8,'#a0c2c3');rect(px+3,py+6,8,2,'#729da6');
      }
      rect(px+6,py+6,2,2,'#e2eee2');
    }
    thruster(0,18);thruster(36,19);
    rect(49,9,5,5,'#d3c787');rect(51,10,4,3,'#fff3ba');

    // The wrist and fingers move before the object becomes attached.
    const elbowX = 55, elbowY = armY - 6;
    line(40,29,elbowX,elbowY,'#172f40',5);
    line(elbowX,elbowY,armX,armY,'#172f40',5);
    line(41,28,elbowX,elbowY-1,'#829b9f',2);
    line(elbowX,elbowY-1,armX,armY-1,'#aec7c5',2);
    rect(38,27,6,6,'#2e5360');rect(elbowX-2,elbowY-2,5,5,'#527580');
    rect(armX-3,armY-2,6,4,'#192f40');
    if (carrying) object(armX, armY+6);
    const spread = Math.round(4 + open * 4);
    line(armX-2,armY,armX-spread,armY+5,'#233e49',2);
    line(armX+2,armY,armX+spread,armY+5,'#233e49',2);
    line(armX-spread,armY+5,armX-spread+2,armY+10,'#849da0',2);
    line(armX+spread,armY+5,armX+spread-2,armY+10,'#849da0',2);

    // Small bubbles make the travel direction legible without a status label.
    ctx.globalAlpha = .55;
    for (let i = 0; i < 5; i++) {
      const drift = (elapsed * 12 + i * 7) % 32;
      rect(-4-drift,20-i*3-drift/5,2,2,colors.speck);
    }
    ctx.restore();ctx.globalAlpha = 1;ctx.restore();
  }

  scenes.forEach((canvas) => {
    let last = null, elapsed = 0;
    canvas.closest('.rov-scene').classList.add('is-ready');
    const wideScreen = matchMedia('(min-width: 701px)');
    const draw = () => render(canvas, elapsed);
    const resize = () => { canvas.width = canvas.closest('.challenge-playground') && wideScreen.matches ? 480 : 320;draw(); };
    function tick(now) {
      if (last !== null) elapsed += Math.min((now-last)/1000, .1);
      last = now;draw();requestAnimationFrame(tick);
    }
    wideScreen.addEventListener('change',resize);
    new MutationObserver(() => { dark = root.dataset.theme === 'dark';draw(); }).observe(root,{attributes:true,attributeFilter:['data-theme']});
    resize();
    requestAnimationFrame(tick);
  });
})();
