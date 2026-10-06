// CONFIGURATION
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlHOnh3HEyT7WgUvT0i8hrykL8dQY39LrsBjqrNtI2wvq-svFYXyqDmwe_ofGYyM-V/exec";
const WEDDING_DATE = new Date("September 11, 2026 09:00:00").getTime();

const VENUE_NAME = "Nama Gedung / Hotel, Alamat Lengkap";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE_NAME)}`;

const CAL_TITLE = encodeURIComponent("The Wedding of Groom & Bride");
const CAL_DETAILS = encodeURIComponent("We are excited to celebrate our special day with you!");
const CAL_LOCATION = encodeURIComponent(VENUE_NAME);
const CAL_DATES = "20260911T020000Z/20260911T070000Z"; 
const CALENDAR_URL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${CAL_TITLE}&dates=${CAL_DATES}&details=${CAL_DETAILS}&location=${CAL_LOCATION}`;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("mapBtn").href = MAPS_URL;
  document.getElementById("saveTheDateBtn").href = CALENDAR_URL;

  startCountdown();
  setupMusic();
  setupForm();
});

// FUNGSI YANG DICARI OLEH TOMBOL (openInvitation)
function openInvitation() {
  document.getElementById("mainContent").classList.remove("hidden");
  document.getElementById("mainContent").scrollIntoView({ behavior: "smooth" });
  
  const music = document.getElementById("bgMusic");
  music.play().catch(() => console.log("Autoplay blocked by browser."));
  
  fetchWishes();
}

function setupMusic() {
  const music = document.getElementById("bgMusic");
  const btn = document.getElementById("musicToggle");

  btn.addEventListener("click", () => {
    if (music.paused) {
      music.play();
      btn.innerHTML = '★ Tap to Pause Music';
    } else {
      music.pause();
      btn.innerHTML = '★ Tap to Play Music';
    }
  });
}

function startCountdown() {
  const updateTimer = () => {
    const now = new Date().getTime();
    const distance = WEDDING_DATE - now;

    if (distance < 0) {
      document.getElementById("timer").innerHTML = "<p class='white-text'>The Wedding Day is Here!</p>";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days < 10 ? '0' + days : days;
    document.getElementById("hours").innerText = hours < 10 ? '0' + hours : hours;
    document.getElementById("minutes").innerText = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById("seconds").innerText = seconds < 10 ? '0' + seconds : seconds;
  };

  updateTimer();
  setInterval(updateTimer, 1000);
}

function setupForm() {
  const form = document.getElementById("rsvpForm");
  const status = document.getElementById("formStatus");

  if(!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.innerText = "Mengirim RSVP...";
    status.style.color = "#ccc";

    const payload = {
      fullName: document.getElementById("fullName").value,
      attendance: document.getElementById("attendance").value,
      guestCount: document.getElementById("guestCount").value,
      message: document.getElementById("message").value
    };

    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(res => res.json())
    .then(data => {
      if (data.result === "success") {
        status.innerText = "Terima kasih! RSVP Anda telah terkirim.";
        status.style.color = "#a3e635";
        form.reset();
        fetchWishes(); 
      } else {
        throw new Error(data.error);
      }
    })
    .catch(err => {
      status.innerText = "Gagal mengirim. Silakan coba lagi.";
      status.style.color = "#f87171";
      console.error(err);
    });
  });
}

function fetchWishes() {
  const container = document.getElementById("wishesContainer");
  if(!container) return;

  fetch(SCRIPT_URL)
    .then(res => res.json())
    .then(data => {
      if (data.result === "success" && data.wishes.length > 0) {
        container.innerHTML = "";
        data.wishes.forEach(item => {
          const card = document.createElement("div");
          card.className = "wish-card";

          card.innerHTML = `
            <div>
              <span class="guest-name">${escapeHtml(item.name)}</span>
            </div>
            <p class="wish-message">"${escapeHtml(item.message)}"</p>
          `;
          container.appendChild(card);
        });
      }
    })
    .catch(err => console.error(err));
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Efek Scroll Reveal pada Frame Ponsel
const phoneFrame = document.querySelector('.desktop-phone-frame');
if (phoneFrame) {
  phoneFrame.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.desktop-phone-frame .section');
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      const windowHeight = window.innerHeight * 0.85;
      if (top < windowHeight) {
        sec.classList.add('active');
      }
    });
  });
}