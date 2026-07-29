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

    var ROTATE_SENSITIVITY = 0.3; // deg per px dragged
    var AUTO_SPEED = 0.008; // deg per ms, idle auto-rotate speed
    var FRICTION = 0.97; // per ~16ms frame, momentum decay back toward AUTO_SPEED

    var rotation = 0;
    var velocity = AUTO_SPEED; // deg per ms
    var dragging = false;
    var lastPointerX = 0;
    var lastPointerT = 0;
    var lastDragVelocity = 0;
    var lastFrameT = null;

    function applyRotation() {
      track.style.transform = "rotateZ(-20deg) rotateX(-8deg) rotateY(" + rotation + "deg)";
    }

    if (prefersReducedMotion) {
      applyRotation();
    } else {
      requestAnimationFrame(function frame(t) {
        if (lastFrameT === null) lastFrameT = t;
        var dt = t - lastFrameT;
        lastFrameT = t;

        if (!dragging) {
          rotation += velocity * dt;
          var decay = Math.pow(FRICTION, dt / 16);
          velocity = AUTO_SPEED + (velocity - AUTO_SPEED) * decay;
          applyRotation();
        }
        requestAnimationFrame(frame);
      });
    }

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

  document.addEventListener("DOMContentLoaded", function () {
    handleHeroVideoMotion();
    initAllCarousels();
    initForyouSwiper();
    initIceconCarousel();
    document.addEventListener("click", handlePlaceholderLinkClick);
  });
})();
