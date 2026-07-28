(function () {
  "use strict";

  var RECENT_MOVIES_KEY = "recent_movies";
  var RECENT_MOVIES_LIMIT = 10;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function handleHeroVideoMotion() {
    var video = document.querySelector(".hero_video");
    if (!video) return;

    if (prefersReducedMotion) {
      video.removeAttribute("autoplay");
      video.pause();
      video.currentTime = 0;
    }
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

  document.addEventListener("DOMContentLoaded", function () {
    handleHeroVideoMotion();
    initAllCarousels();
    document.addEventListener("click", handlePlaceholderLinkClick);
  });
})();
