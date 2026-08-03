/* ===========================================================
   GRADUATION INVITATION - MAIN SCRIPT
   Thiệp Mời Lễ Tốt Nghiệp
   =========================================================== */

// ====================== CONFIGURATION ======================
// Chỉnh sửa thông tin thiệp mời tại đây
const INVITATION_CONFIG = {
  // Tên người tốt nghiệp
  graduateName: "Việt Anh",

  // Thời gian
  time: "13H - 16H",

  // Ngày
  date: "07.08.2026",

  // Địa điểm
  location: "ĐH Công Nghệ Đông Á",

  // Địa chỉ
  address: "(Đường Phan Tây Nhạc, phường Xuân Phương, TP. Hà Nội)",

  // Tiêu đề trang
  pageTitle: "Thiệp Mời Lễ Tốt Nghiệp",

  // Nội dung chia sẻ
  shareText: "Bạn được mời đến dự lễ tốt nghiệp! Mở thư để xem thiệp mời nhé 💌",
};

// ====================== STATE MANAGEMENT ======================
const APP_STATE = {
  WELCOME: "welcome",
  OPENING: "opening",
  INVITATION: "invitation",
};

let currentState = APP_STATE.WELCOME;
let guestName = "";
let isMusicPlaying = false;

// ====================== DOM ELEMENTS ======================
const DOM = {
  // Screens
  welcomeScreen: document.getElementById("welcome-screen"),
  invitationScreen: document.getElementById("invitation-screen"),

  // Welcome
  nameInput: document.getElementById("guest-name-input"),
  validationMsg: document.getElementById("validation-msg"),
  openBtn: document.getElementById("open-btn"),
  envelope: document.getElementById("envelope"),

  // Poster
  poster: document.getElementById("poster"),
  guestNameDisplay: document.getElementById("guest-name-display"),
  graduateNameText: document.getElementById("graduate-name-text"),
  eventTime: document.getElementById("event-time"),
  eventDate: document.getElementById("event-date"),
  eventLocation: document.getElementById("event-location"),
  eventAddress: document.getElementById("event-address"),
  graduatePhoto: document.getElementById("graduate-photo"),
  actionButtons: document.getElementById("action-buttons"),

  // Buttons
  shareBtn: document.getElementById("share-btn"),
  musicToggle: document.getElementById("music-toggle"),
  musicIcon: document.querySelector(".music-icon"),

  // Audio & Canvas
  bgMusic: document.getElementById("bg-music"),
  confettiCanvas: document.getElementById("confetti-canvas"),
};

// ====================== INITIALIZATION ======================
document.addEventListener("DOMContentLoaded", init);

function init() {
  // Populate event info from config
  populateEventInfo();

  // Check URL parameter for name
  const urlName = getNameFromURL();

  // Check sessionStorage
  const savedName = sessionStorage.getItem("guestName");

  // Priority: URL > sessionStorage > manual input
  if (urlName) {
    guestName = urlName;
    DOM.nameInput.value = guestName;
  } else if (savedName) {
    guestName = savedName;
    DOM.nameInput.value = guestName;
  }

  // Bind events
  bindEvents();

  // Setup interactive 3D tilt on poster
  setupPosterTilt();

  // Set page title
  document.title = `${INVITATION_CONFIG.pageTitle} - ${INVITATION_CONFIG.graduateName}`;
}

// ====================== POPULATE EVENT INFO ======================
function populateEventInfo() {
  DOM.eventTime.textContent = INVITATION_CONFIG.time;
  DOM.eventDate.textContent = INVITATION_CONFIG.date;
  DOM.eventLocation.textContent = INVITATION_CONFIG.location;
  DOM.eventAddress.textContent = INVITATION_CONFIG.address;
  DOM.graduateNameText.textContent = INVITATION_CONFIG.graduateName;
}

// ====================== URL PARAMETER ======================
function getNameFromURL() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  if (name) {
    return sanitizeName(decodeURIComponent(name));
  }
  return null;
}

// ====================== SANITIZE NAME ======================
function sanitizeName(name) {
  let cleaned = name.trim();
  const div = document.createElement("div");
  div.textContent = cleaned;
  cleaned = div.textContent;
  if (cleaned.length > 50) {
    cleaned = cleaned.substring(0, 50);
  }
  return cleaned;
}

// ====================== EVENT BINDINGS ======================
function bindEvents() {
  // Open button click
  DOM.openBtn.addEventListener("click", handleOpenLetter);

  // Enter key on input
  DOM.nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleOpenLetter();
    }
  });

  // Clear validation on input
  DOM.nameInput.addEventListener("input", () => {
    hideValidation();
    DOM.nameInput.classList.remove("error");
  });

  // Share button
  DOM.shareBtn.addEventListener("click", handleShare);

  // Music toggle
  DOM.musicToggle.addEventListener("click", toggleMusic);
}

// ====================== POSTER 3D TILT EFFECT ======================
function setupPosterTilt() {
  const wrapper = document.querySelector(".poster-wrapper");
  if (!wrapper || !DOM.poster) return;

  let bounds;

  function rotateToMouse(e) {
    if (currentState !== APP_STATE.INVITATION) return;
    if (!bounds) bounds = wrapper.getBoundingClientRect();

    const mouseX = e.clientX || (e.touches && e.touches[0].clientX);
    const mouseY = e.clientY || (e.touches && e.touches[0].clientY);

    if (!mouseX || !mouseY) return;

    const leftX = mouseX - bounds.left;
    const topY = mouseY - bounds.top;

    const center = {
      x: leftX - bounds.width / 2,
      y: topY - bounds.height / 2,
    };

    DOM.poster.style.transform = `
      scale3d(1.02, 1.02, 1.02)
      rotateX(${center.y / -25}deg)
      rotateY(${center.x / 25}deg)
    `;
  }

  wrapper.addEventListener("mouseenter", () => {
    bounds = wrapper.getBoundingClientRect();
  });

  wrapper.addEventListener("mousemove", rotateToMouse);

  wrapper.addEventListener("mouseleave", () => {
    DOM.poster.style.transform = "";
  });
}

// ====================== VALIDATION ======================
function validateName() {
  const name = sanitizeName(DOM.nameInput.value);
  if (!name || name.length === 0) {
    showValidation("Bạn chưa cho mình biết tên nè 💌");
    DOM.nameInput.classList.add("error");
    DOM.nameInput.focus();
    return false;
  }
  return true;
}

function showValidation(message) {
  DOM.validationMsg.textContent = message;
  DOM.validationMsg.classList.add("show");
}

function hideValidation() {
  DOM.validationMsg.classList.remove("show");
}

// ====================== OPEN LETTER FLOW ======================
function handleOpenLetter() {
  if (currentState !== APP_STATE.WELCOME) return;

  if (!validateName()) return;

  guestName = sanitizeName(DOM.nameInput.value);
  sessionStorage.setItem("guestName", guestName);

  currentState = APP_STATE.OPENING;
  DOM.nameInput.blur();

  setTimeout(() => {
    startOpeningAnimation();
  }, 180);
}

// ====================== OPENING ANIMATION SEQUENCE ======================
function startOpeningAnimation() {
  const timeline = {
    0: () => {
      DOM.openBtn.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      DOM.openBtn.style.opacity = "0";
      DOM.openBtn.style.transform = "translateY(10px)";
      DOM.nameInput.parentElement.style.transition = "opacity 0.3s ease";
      DOM.nameInput.parentElement.style.opacity = "0";
      const subtitle = document.querySelector(".welcome-subtitle");
      if (subtitle) {
        subtitle.style.transition = "opacity 0.3s ease";
        subtitle.style.opacity = "0";
      }
    },

    350: () => {
      DOM.envelope.classList.add("shake");
    },

    850: () => {
      DOM.envelope.classList.remove("shake");
      DOM.envelope.classList.add("opening");
    },

    1550: () => {
      DOM.welcomeScreen.classList.add("welcome-fade-out");
    },

    2050: () => {
      setGuestName(guestName);
      DOM.welcomeScreen.classList.remove("active");
      DOM.invitationScreen.classList.add("active");
      DOM.poster.classList.add("animate-in");
      currentState = APP_STATE.INVITATION;
      window.scrollTo({ top: 0, behavior: "instant" });
    },

    2400: () => {
      startConfetti();
      tryPlayMusic();
      DOM.musicToggle.classList.remove("hidden");
    },
  };

  Object.entries(timeline).forEach(([delay, action]) => {
    setTimeout(action, parseInt(delay));
  });
}

// ====================== SET GUEST NAME ======================
function setGuestName(name) {
  DOM.guestNameDisplay.textContent = name;
  fitText(DOM.guestNameDisplay);
}

// ====================== FIT TEXT (SMART RESIZE WITH LARGE BASE) ======================
function fitText(element) {
  const note = element.closest(".invitation-note");
  if (!note) return;

  const noteContent = note.querySelector(".note-content");
  const maxWidth = (noteContent ? noteContent.clientWidth : note.clientWidth) * 0.95;

  // Reset to default CSS size first
  element.style.fontSize = "";

  requestAnimationFrame(() => {
    let currentFontSize = parseFloat(window.getComputedStyle(element).fontSize);
    
    // Only reduce size if text exceeds container width, keeping text as large as possible
    while (element.scrollWidth > maxWidth && currentFontSize > 14) {
      currentFontSize -= 1;
      element.style.fontSize = currentFontSize + "px";
    }
  });
}

// ====================== CONFETTI ENGINE ======================
class ConfettiEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.isRunning = false;
    this.animationId = null;

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles(count = 140) {
    const colors = [
      "#FF5252", "#FF4081", "#E040FB", "#7C4DFF",
      "#536DFE", "#448AFF", "#40C4FF", "#1DE9B6",
      "#64DD17", "#FFD700", "#FFAB00", "#FF6D00"
    ];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * -this.canvas.height,
        w: Math.random() * 11 + 4,
        h: Math.random() * 7 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3.5 + 1.8,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.18,
        drift: (Math.random() - 0.5) * 1.8,
        opacity: 1,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.06 + 0.02,
      });
    }
  }

  start(duration = 4500) {
    this.particles = [];
    this.createParticles();
    this.isRunning = true;
    this.animate();

    setTimeout(() => {
      this.isRunning = false;
    }, duration);
  }

  animate() {
    const allDone = !this.isRunning &&
      this.particles.every((p) => p.y > this.canvas.height || p.opacity <= 0);

    if (allDone) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles = [];
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p) => {
      p.y += p.speed;
      p.wobble += p.wobbleSpeed;
      p.x += Math.sin(p.wobble) * p.drift;
      p.angle += p.spin;

      if (!this.isRunning) {
        p.opacity -= 0.012;
      }

      if (p.opacity <= 0) return;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.angle);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      this.ctx.restore();
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

let confetti = null;

function startConfetti() {
  try {
    if (!confetti) {
      confetti = new ConfettiEngine(DOM.confettiCanvas);
    }
    confetti.start(4500);
  } catch (e) {
    console.warn("Confetti error:", e);
  }
}

// ====================== MUSIC CONTROL ======================
function tryPlayMusic() {
  try {
    DOM.bgMusic.volume = 0.3;
    const playPromise = DOM.bgMusic.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isMusicPlaying = true;
          updateMusicButton();
        })
        .catch(() => {
          isMusicPlaying = false;
          updateMusicButton();
        });
    }
  } catch (e) {
    console.warn("Audio error:", e);
  }
}

function toggleMusic() {
  if (isMusicPlaying) {
    DOM.bgMusic.pause();
    isMusicPlaying = false;
  } else {
    DOM.bgMusic.volume = 0.3;
    DOM.bgMusic.play()
      .then(() => {
        isMusicPlaying = true;
        updateMusicButton();
      })
      .catch(() => {
        console.warn("Music play blocked.");
      });
  }
  updateMusicButton();
}

function updateMusicButton() {
  DOM.musicIcon.textContent = isMusicPlaying ? "🔊" : "🔇";
  DOM.musicToggle.classList.toggle("playing", isMusicPlaying);
}

// ====================== SHARE ======================
function handleShare() {
  const url = new URL(window.location.href);
  if (guestName) {
    url.searchParams.set("name", guestName);
  }
  const shareUrl = url.toString();

  const shareData = {
    title: `${INVITATION_CONFIG.pageTitle} - ${INVITATION_CONFIG.graduateName}`,
    text: INVITATION_CONFIG.shareText,
    url: shareUrl,
  };

  if (navigator.share) {
    navigator.share(shareData).catch((err) => {
      if (err.name !== "AbortError") {
        copyToClipboard(shareUrl);
      }
    });
  } else {
    copyToClipboard(shareUrl);
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast("Đã sao chép link thiệp mời! 📋"))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    showToast("Đã sao chép link thiệp mời! 📋");
  } catch (e) {
    showToast("Không thể sao chép link 😔");
  }
  document.body.removeChild(textarea);
}

// ====================== TOAST NOTIFICATION ======================
function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ====================== WINDOW RESIZE HANDLER ======================
window.addEventListener("resize", () => {
  if (currentState === APP_STATE.INVITATION && DOM.guestNameDisplay.textContent) {
    fitText(DOM.guestNameDisplay);
  }
});
