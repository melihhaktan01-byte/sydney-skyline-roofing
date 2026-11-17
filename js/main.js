// Sydney Skyline Roofing: menu, photo lightbox, project filter, quote form.
(function () {
  // Set this to a FormSubmit (or similar) endpoint once the business has an inbox,
  // e.g. "https://formsubmit.co/ajax/quotes@yourdomain.com.au". While it is empty the
  // form builds a text message to the business mobile instead.
  var FORM_ENDPOINT = "";
  var PHONE_INTL = "+61405876410";
  var PHONE_LOCAL = "0405 876 410";

  // Mobile menu
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Lightbox
  var shots = [].slice.call(document.querySelectorAll("[data-full]"));
  if (shots.length) {
    var lb = document.createElement("div");
    lb.className = "lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML =
      '<button class="x" aria-label="Close">&times;</button>' +
      '<button class="prev" aria-label="Previous photo">&#8249;</button>' +
      '<img alt="">' +
      '<button class="next" aria-label="Next photo">&#8250;</button>' +
      '<div class="lb-cap"></div>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector(".lb-cap");
    var group = [];
    var idx = 0;
    var last = null;
    var show = function (i) {
      idx = (i + group.length) % group.length;
      var el = group[idx];
      lbImg.src = el.getAttribute("data-full");
      lbImg.alt = el.getAttribute("data-cap") || "";
      lbCap.textContent = el.getAttribute("data-cap") || "";
    };
    var close = function () {
      lb.classList.remove("open");
      lbImg.removeAttribute("src");
      if (last) last.focus();
    };
    shots.forEach(function (el) {
      el.addEventListener("click", function () {
        var g = el.getAttribute("data-group");
        group = shots.filter(function (s) {
          return s.getAttribute("data-group") === g && s.offsetParent !== null;
        });
        last = el;
        show(group.indexOf(el));
        lb.classList.add("open");
        lb.querySelector(".x").focus();
      });
    });
    lb.querySelector(".x").addEventListener("click", close);
    lb.querySelector(".prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  // Project filter
  var filters = [].slice.call(document.querySelectorAll(".filter button"));
  filters.forEach(function (b) {
    b.addEventListener("click", function () {
      var kind = b.getAttribute("data-kind");
      filters.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      [].forEach.call(document.querySelectorAll(".project"), function (p) {
        p.hidden = !(kind === "all" || p.getAttribute("data-kind").split(" ").indexOf(kind) > -1);
      });
    });
  });

  // Quote forms
  [].forEach.call(document.querySelectorAll("form.quote"), function (form) {
    var done = form.parentNode.querySelector(".form-done");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements.company && form.elements.company.value) return; // bot trap
      var v = function (n) { return form.elements[n] ? form.elements[n].value.trim() : ""; };
      var lines = [
        "Quote request from the website",
        "Name: " + v("name"),
        "Phone: " + v("phone"),
        "Suburb: " + v("suburb"),
        "Job: " + v("job")
      ];
      if (v("message")) lines.push("Details: " + v("message"));
      var body = lines.join("\n");

      var finish = function (sent) {
        form.hidden = true;
        done.classList.add("show");
        done.querySelector("h3").textContent = sent ? "Thanks, we have your details" : "One more step: send it to us";
        done.querySelector(".msg").textContent = sent
          ? "We will call you back on the number you gave us. If it is urgent, call " + PHONE_LOCAL + "."
          : "Tap the button and your details open as a text message to " + PHONE_LOCAL + ". You can add photos of the roof before you send it.";
        done.querySelector("pre").textContent = body;
        done.querySelector(".sms").hidden = sent;
        done.querySelector(".sms").href = "sms:" + PHONE_INTL + "?&body=" + encodeURIComponent(body);
        done.querySelector("h3").focus();
      };

      if (!FORM_ENDPOINT) return finish(false);
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: v("name"), phone: v("phone"), suburb: v("suburb"), job: v("job"), message: v("message"), _subject: "Website quote request: " + v("suburb") })
      }).then(function (r) { finish(r.ok); }).catch(function () { finish(false); });
    });
  });
})();
