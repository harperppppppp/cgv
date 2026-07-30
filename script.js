(function () {
  "use strict";

  var RECENT_MOVIES_KEY = "recent_movies";
  var RECENT_MOVIES_LIMIT = 10;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var HERO_VIDEO_INTRO_SKIP = 1.5;

  function handleHeroVideoMotion() {
    var video = document.querySelector(".hero_video");
    if (!video) return;

    if (prefersReducedMotion) {
      video.removeAttribute("autoplay");
      video.pause();
      video.currentTime = 0;
      return;
    }

    function skipIntro() {
      if (video.duration && video.duration > HERO_VIDEO_INTRO_SKIP + 1) {
        video.currentTime = HERO_VIDEO_INTRO_SKIP;
      }
    }

    if (video.readyState >= 1) {
      skipIntro();
    } else {
      video.addEventListener("loadedmetadata", skipIntro, { once: true });
    }

    video.addEventListener("ended", function () {
      video.currentTime = HERO_VIDEO_INTRO_SKIP;
      video.play();
    });
  }

  function readRecentMovies() {
    try {
      var raw = window.localStorage.getItem(RECENT_MOVIES_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  }

  function handleRecordRecentMovie(title) {
    if (!title) return;
    try {
      var list = readRecentMovies().filter(function (item) {
        return item !== title;
      });
      list.unshift(title);
      if (list.length > RECENT_MOVIES_LIMIT) {
        list = list.slice(0, RECENT_MOVIES_LIMIT);
      }
      window.localStorage.setItem(RECENT_MOVIES_KEY, JSON.stringify(list));
    } catch (error) {
      /* localStorage 사용 불가 환경(프라이빗 모드 등)에서는 조용히 무시 */
    }
  }

  function handlePlaceholderLinkClick(event) {
    var link = event.target.closest("a[href='#']");
    if (!link) return;

    event.preventDefault();

    var movieTitle = link.getAttribute("data-movie-title");
    if (movieTitle) {
      handleRecordRecentMovie(movieTitle);
    }
  }

  function getSlideStep(track) {
    var firstChild = track.children[0];
    return firstChild ? firstChild.getBoundingClientRect().width : track.clientWidth;
  }

  function initCarousel(root) {
    var track = root.querySelector("[data-carousel-track]");
    var prevBtn = root.querySelector("[data-carousel-prev]");
    var nextBtn = root.querySelector("[data-carousel-next]");
    if (!track) return;

    function scrollByStep(direction) {
      var step = getSlideStep(track) * direction;
      var atEnd = direction > 0 && track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
      var atStart = direction < 0 && track.scrollLeft <= 0;

      if (atEnd) {
        track.scrollTo({ left: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
        return;
      }
      if (atStart) {
        track.scrollTo({ left: track.scrollWidth, behavior: prefersReducedMotion ? "auto" : "smooth" });
        return;
      }
      track.scrollBy({ left: step, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        scrollByStep(-1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        scrollByStep(1);
      });
    }
  }

  function initAllCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(initCarousel);
  }

  function initArchiveDirectorSwap() {
    var director = document.querySelector(".archive_card_director");
    var directorImg = director && director.querySelector("img");
    if (!director || !directorImg) return;

    var defaultSrc = directorImg.getAttribute("src");
    var altSrc = "assets/archive01_2.png";

    document.querySelectorAll(".archive_card:not(.archive_card_director)").forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        directorImg.setAttribute("src", altSrc);
        director.classList.add("is_collapsed");
      });
      card.addEventListener("mouseleave", function () {
        directorImg.setAttribute("src", defaultSrc);
        director.classList.remove("is_collapsed");
      });
    });
  }

  function initCinetalkCoverflow() {
    var track = document.querySelector(".cinetalk_track");
    if (!track) return;

    var cards = Array.prototype.slice.call(track.querySelectorAll(".cinetalk_card"));
    if (!cards.length) return;

    var currentCenter = null;

    function triggerFlutter(card) {
      if (prefersReducedMotion) return;
      card.classList.add("is_flutter");
      window.setTimeout(function () {
        card.classList.remove("is_flutter");
      }, 650);
    }

    function applyCenter(card) {
      if (card === currentCenter) return;
      if (currentCenter) currentCenter.classList.remove("is_center");
      if (card) {
        card.classList.add("is_center");
        triggerFlutter(card);
      }
      currentCenter = card;
    }

    function findClosest() {
      var trackRect = track.getBoundingClientRect();
      var viewportCenter = trackRect.left + trackRect.width / 2;

      var closest = null;
      var closestDist = Infinity;
      cards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        var cardCenter = rect.left + rect.width / 2;
        var dist = Math.abs(cardCenter - viewportCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = card;
        }
      });
      return closest;
    }

    // Resizing the centered card mid-scroll (via width transitions) fights the
    // browser's native scroll if it re-triggers on every scroll tick, so only
    // resolve the center card once scrolling has actually settled.
    var settleTimer = null;
    function onScroll() {
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(function () {
        applyCenter(findClosest());
      }, 120);
    }

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    if (cards[0]) {
      track.scrollLeft = cards[0].offsetLeft + cards[0].offsetWidth / 2 - track.clientWidth / 2;
    }
    applyCenter(findClosest());
  }

  function initForyouGoodsImageScrollReveal() {
    var img = document.querySelector(".foryou_goods_img");
    var section = document.querySelector(".section_foryou");
    if (!img || !section) return;

    var MAX_OFFSET = 60; // px, matches the CSS resting transform

    if (prefersReducedMotion) {
      img.style.transform = "translateY(0)";
      return;
    }

    /* .section_foryou is position:sticky, so it snaps to the top of the viewport
       and stays there almost as soon as it arrives — there's very little normal
       scroll travel left over for a viewport-relative reveal to play out in.
       Anchor the window to the section's own absolute document top (captured once,
       before any sticky pinning skews getBoundingClientRect) and drive progress
       off raw page scroll across a fixed px window straddling that arrival point,
       so the rise is visible right as the section comes in and settles. */
    var sectionDocTop = section.getBoundingClientRect().top + window.pageYOffset;
    var start = sectionDocTop - 400;
    var end = sectionDocTop + 150;
    var ticking = false;

    function update() {
      ticking = false;
      var raw = (window.pageYOffset - start) / (end - start);
      var progress = Math.min(1, Math.max(0, raw));
      img.style.transform = "translateY(" + (1 - progress) * MAX_OFFSET + "px)";
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  function initForyouConfettiBounce() {
    if (prefersReducedMotion) return;

    var container = document.querySelector(".foryou_ticket_visual");
    if (!container) return;

    var pieces = Array.prototype.slice.call(container.querySelectorAll(".confetti"));
    if (!pieces.length) return;

    var DECAY = 0.985;
    var started = false;

    var state = pieces.map(function (el) {
      var w = el.offsetWidth;
      var h = el.offsetHeight;
      var containerW = container.clientWidth;
      var containerH = container.clientHeight;
      var angle = Math.random() * Math.PI * 2; // fully random direction, not just "upward"
      var speed = 3 + Math.random() * 7; // wide speed spread so pieces don't move in lockstep
      return {
        el: el,
        x: Math.random() * Math.max(0, containerW - w),
        y: Math.max(0, containerH - h),
        w: w,
        h: h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        minSpeed: 0.3 + Math.random() * 0.6
      };
    });

    function frame() {
      var containerW = container.clientWidth;
      var containerH = container.clientHeight;

      state.forEach(function (p) {
        var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > p.minSpeed) {
          var newSpeed = Math.max(p.minSpeed, speed * DECAY);
          var scale = newSpeed / speed;
          p.vx *= scale;
          p.vy *= scale;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0) {
          p.x = 0;
          p.vx = Math.abs(p.vx);
        } else if (p.x + p.w >= containerW) {
          p.x = containerW - p.w;
          p.vx = -Math.abs(p.vx);
        }

        if (p.y <= 0) {
          p.y = 0;
          p.vy = Math.abs(p.vy);
        } else if (p.y + p.h >= containerH) {
          p.y = containerH - p.h;
          p.vy = -Math.abs(p.vy);
        }

        p.el.style.transform = "translate(" + p.x + "px, " + p.y + "px) rotate(" + (p.x + p.y) % 360 + "deg)";
      });

      requestAnimationFrame(frame);
    }

    function start() {
      if (started) return;
      started = true;
      requestAnimationFrame(frame);
    }

    if (typeof IntersectionObserver === "undefined") {
      start();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            start();
            observer.unobserve(container);
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(container);
  }

  function handleDuplicateSlidesForLoop(wrapper) {
    /* Swiper의 loop 모드는 슬라이드 수가 너무 적으면(3개) 순환 시 깨진다.
       공식 권장대로 원본 슬라이드를 반복 복제해 개수를 늘린다. */
    var originalSlides = Array.prototype.slice.call(wrapper.children);
    for (var i = 0; i < 3; i++) {
      originalSlides.forEach(function (slide) {
        wrapper.appendChild(slide.cloneNode(true));
      });
    }
  }

  function initForyouSwiper() {
    var el = document.querySelector(".foryou_swiper");
    if (!el || typeof Swiper === "undefined") return;

    var wrapper = el.querySelector(".swiper-wrapper");
    if (wrapper) {
      handleDuplicateSlidesForLoop(wrapper);
    }

    new Swiper(el, {
      slidesPerView: "auto",
      centeredSlides: true,
      loop: true,
      loopAdditionalSlides: 8,
      observer: true,
      observeParents: true,
      initialSlide: 1,
      speed: prefersReducedMotion ? 0 : 500,
      grabCursor: true,
      autoplay: prefersReducedMotion
        ? false
        : {
            delay: 2500,
            disableOnInteraction: false,
          },
      navigation: {
        prevEl: "[data-foryou-prev]",
        nextEl: "[data-foryou-next]",
      },
    });
  }

  function initIceconCarousel() {
    var track = document.querySelector("[data-icecon-track]");
    if (!track) return;

    var ROTATE_SENSITIVITY = 0.12; // deg per px dragged
    var AUTO_SPEED = 0.008; // deg per ms, idle auto-rotate speed
    var FRICTION = 0.97; // per ~16ms frame, momentum decay back toward AUTO_SPEED

    var rotation = 0;
    var velocity = AUTO_SPEED; // deg per ms
    var dragging = false;
    var hovering = false;
    var lastPointerX = 0;
    var lastPointerT = 0;
    var lastDragVelocity = 0;
    var lastFrameT = null;

    function applyRotation() {
      track.style.transform = "rotateZ(-20deg) rotateX(-13deg) rotateY(" + rotation + "deg)";
    }

    if (prefersReducedMotion) {
      applyRotation();
    } else {
      requestAnimationFrame(function frame(t) {
        if (lastFrameT === null) lastFrameT = t;
        var dt = t - lastFrameT;
        lastFrameT = t;

        if (!dragging && !hovering) {
          rotation += velocity * dt;
          var decay = Math.pow(FRICTION, dt / 16);
          velocity = AUTO_SPEED + (velocity - AUTO_SPEED) * decay;
          applyRotation();
        }
        requestAnimationFrame(frame);
      });
    }

    track.addEventListener("mouseenter", function () {
      hovering = true;
    });
    track.addEventListener("mouseleave", function () {
      hovering = false;
    });

    function onPointerDown(event) {
      dragging = true;
      lastPointerX = event.clientX;
      lastPointerT = performance.now();
      lastDragVelocity = 0;
      track.classList.add("is_dragging");
      track.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event) {
      if (!dragging) return;
      var now = performance.now();
      var dx = event.clientX - lastPointerX;
      var dt = now - lastPointerT || 16;
      var deltaDeg = dx * ROTATE_SENSITIVITY;
      rotation += deltaDeg;
      lastDragVelocity = deltaDeg / dt;
      lastPointerX = event.clientX;
      lastPointerT = now;
      applyRotation();
    }

    function onPointerUp(event) {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is_dragging");
      track.releasePointerCapture(event.pointerId);
      velocity = lastDragVelocity || AUTO_SPEED;
    }

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);
  }

  function initIceconHoverVideos() {
    if (prefersReducedMotion) return;

    var section = document.querySelector(".section_icecon");
    if (!section) return;

    var overlay = section.querySelector("[data-icecon-bg-overlay]");

    var bgVideos = {};
    section.querySelectorAll("[data-icecon-bg-video]").forEach(function (video) {
      bgVideos[video.getAttribute("data-icecon-bg-video")] = video;
    });

    Object.keys(bgVideos).forEach(function (childIndex) {
      var item = section.querySelector(".icecon_carousel_item:nth-child(" + childIndex + ")");
      var video = bgVideos[childIndex];
      if (!item || !video) return;

      item.addEventListener("mouseenter", function () {
        video.currentTime = 0;
        video.play();
        video.classList.add("is_active");
        if (overlay) overlay.classList.add("is_active");
      });
      item.addEventListener("mouseleave", function () {
        video.pause();
        video.classList.remove("is_active");
        if (overlay) overlay.classList.remove("is_active");
      });
    });
  }

  function initHeroHeaderAutoHide() {
    var header = document.querySelector("[data-hero-header]");
    if (!header) return;

    var lastScrollY = window.pageYOffset;
    var ticking = false;

    function update() {
      ticking = false;
      var currentY = window.pageYOffset;
      var scrolledPastHeader = currentY > header.offsetHeight;
      var scrollingDown = currentY > lastScrollY;

      if (scrollingDown && scrolledPastHeader) {
        header.classList.add("is_hidden");
      } else {
        header.classList.remove("is_hidden");
      }
      lastScrollY = currentY;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", function () {
    handleHeroVideoMotion();
    initAllCarousels();
    initArchiveDirectorSwap();
    initCinetalkCoverflow();
    initForyouGoodsImageScrollReveal();
    initForyouConfettiBounce();
    initForyouSwiper();
    initIceconCarousel();
    initIceconHoverVideos();
    initHeroHeaderAutoHide();
    document.addEventListener("click", handlePlaceholderLinkClick);
  });
})();
