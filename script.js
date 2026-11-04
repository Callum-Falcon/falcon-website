/* Falcon Reports — site behaviour
   1. Mobile menu and the "Schools" dropdown
   2. Home page data-flow diagram (lines and moving dots)
   3. Expandable panels (AI-ready data page)
*/

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     1. Navigation
     --------------------------------------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    var button = dropdown.querySelector('.nav-dropdown-toggle');
    if (!button) return;
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = dropdown.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.nav-dropdown.is-open').forEach(function (dropdown) {
      dropdown.classList.remove('is-open');
      var button = dropdown.querySelector('.nav-dropdown-toggle');
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------------------------------------------------------------
     2. Data-flow diagram
     Each pill is a <button> with data-id and data-text. Every source feeds
     every output, so all lines stay lit; clicking a pill makes its own
     line bolder and shows its description underneath. Lines are drawn
     from the real positions of the pills, so the layout can change freely
     in CSS.
     --------------------------------------------------------------------- */
  var flow = document.querySelector('[data-flow]');

  if (flow) {
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var SPEED = 2.2; // seconds for one dot to travel a line
    var svg = flow.querySelector('.flow-svg');
    var sources = Array.prototype.slice.call(flow.querySelectorAll('[data-source]'));
    var outputs = Array.prototype.slice.call(flow.querySelectorAll('[data-output]'));
    var platform = flow.querySelector('.flow-platform');
    var gapIn = flow.querySelector('[data-gap="in"]');
    var gapOut = flow.querySelector('[data-gap="out"]');
    var detailTitle = document.querySelector('[data-flow-title]');
    var detailText = document.querySelector('[data-flow-text]');
    var mobileQuery = window.matchMedia('(max-width: 980px)');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var selected = flow.getAttribute('data-selected') || sources[0].getAttribute('data-id');
    var lines = [];

    var findById = function (list, id) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].getAttribute('data-id') === id) return list[i];
      }
      return null;
    };

    var box = function (el, origin) {
      var r = el.getBoundingClientRect();
      return {
        left: r.left - origin.left,
        right: r.right - origin.left,
        top: r.top - origin.top,
        bottom: r.bottom - origin.top,
        cx: r.left - origin.left + r.width / 2,
        cy: r.top - origin.top + r.height / 2
      };
    };

    var addLine = function (d, kind, index, pill) {
      var path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'flow-line' + (kind === 'out' ? ' flow-line--out' : ''));
      svg.appendChild(path);

      var dot = null;
      if (!reduceMotion) {
        dot = document.createElementNS(SVG_NS, 'circle');
        dot.setAttribute('r', mobileQuery.matches ? '4.5' : '3.5');
        dot.setAttribute('class', 'flow-dot' + (kind === 'out' ? ' flow-dot--out' : ''));
        var motion = document.createElementNS(SVG_NS, 'animateMotion');
        motion.setAttribute('dur', SPEED + 's');
        motion.setAttribute('repeatCount', 'indefinite');
        motion.setAttribute('path', d);
        var delay = kind === 'out' ? index * 0.2 : (index * 0.37) % SPEED;
        motion.setAttribute('begin', '-' + delay.toFixed(2) + 's');
        dot.appendChild(motion);
        svg.appendChild(dot);
      }
      lines.push({ path: path, dot: dot, pill: pill, kind: kind });
    };

    var draw = function () {
      svg.innerHTML = '';
      lines = [];
      var origin = flow.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + origin.width + ' ' + origin.height);
      var p = box(platform, origin);
      var mobile = mobileQuery.matches;

      // Many sources converge into the platform
      sources.forEach(function (pill, i) {
        var d;
        if (!mobile) {
          var s = box(pill, origin);
          var join = p.left - 20;
          var mid = (s.right + join) / 2;
          d = 'M ' + s.right + ' ' + s.cy + ' C ' + mid + ' ' + s.cy + ', ' + mid + ' ' + p.cy + ', ' + join + ' ' + p.cy + ' L ' + p.left + ' ' + p.cy;
        } else {
          var g = box(gapIn, origin);
          var width = Math.min(g.right - g.left, 340);
          var start = g.cx - width / 2;
          var x = start + 6 + i * ((width - 12) / (sources.length - 1));
          d = 'M ' + x + ' ' + g.top + ' C ' + x + ' ' + (g.top + 44) + ', ' + g.cx + ' ' + (g.top + 38) + ', ' + g.cx + ' ' + (g.bottom - 16) + ' L ' + g.cx + ' ' + g.bottom;
        }
        addLine(d, 'in', i, pill);
      });

      // One trunk out of the platform, branching to every output
      outputs.forEach(function (pill, k) {
        var d;
        if (!mobile) {
          var o = box(pill, origin);
          var trunk = p.right + 22;
          var mid = (trunk + o.left) / 2;
          d = 'M ' + p.right + ' ' + p.cy + ' L ' + trunk + ' ' + p.cy + ' C ' + mid + ' ' + p.cy + ', ' + mid + ' ' + o.cy + ', ' + o.left + ' ' + o.cy;
        } else {
          var g = box(gapOut, origin);
          var width = Math.min(g.right - g.left, 340);
          var start = g.cx - width / 2;
          var x = start + 14 + k * ((width - 28) / (outputs.length - 1));
          d = 'M ' + g.cx + ' ' + g.top + ' L ' + g.cx + ' ' + (g.top + 20) + ' C ' + g.cx + ' ' + (g.top + 56) + ', ' + x + ' ' + (g.top + 44) + ', ' + x + ' ' + g.bottom;
        }
        addLine(d, 'out', k, pill);
      });

      update();
    };

    var update = function () {
      var current = findById(sources, selected) || findById(outputs, selected);
      var baseRadius = mobileQuery.matches ? 4.5 : 3.5;

      sources.concat(outputs).forEach(function (pill) {
        pill.classList.toggle('is-selected', pill === current);
        pill.setAttribute('aria-pressed', pill === current ? 'true' : 'false');
      });

      lines.forEach(function (line) {
        var active = line.pill === current;
        line.path.classList.toggle('is-active', active);
        if (line.dot) line.dot.setAttribute('r', String(active ? baseRadius + 1.5 : baseRadius));
        if (active) {
          // draw the selected line (and its dot) on top of the others
          svg.appendChild(line.path);
          if (line.dot) svg.appendChild(line.dot);
        }
      });

      if (current && detailTitle && detailText) {
        detailTitle.textContent = current.getAttribute('data-label') || current.textContent.trim();
        detailText.textContent = current.getAttribute('data-text');
      }
    };

    sources.concat(outputs).forEach(function (pill) {
      pill.addEventListener('click', function () {
        selected = pill.getAttribute('data-id');
        update();
      });
    });

    var scheduled = false;
    var redraw = function () {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        draw();
      });
    };

    if ('ResizeObserver' in window) {
      new ResizeObserver(redraw).observe(flow);
    } else {
      window.addEventListener('resize', redraw);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(redraw);
    }
    draw();
  }

  /* ---------------------------------------------------------------------
     3. Expandable panels: one open at a time within each [data-accordion]
     --------------------------------------------------------------------- */
  document.querySelectorAll('[data-accordion]').forEach(function (accordion) {
    var items = Array.prototype.slice.call(accordion.querySelectorAll('.accordion-item'));

    var setOpen = function (item, open) {
      var button = item.querySelector('button');
      var panel = item.querySelector('.accordion-panel');
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
    };

    items.forEach(function (item) {
      item.querySelector('button').addEventListener('click', function () {
        var opening = !item.classList.contains('is-open');
        items.forEach(function (other) {
          setOpen(other, false);
        });
        if (opening) setOpen(item, true);
      });
    });
  });
})();
