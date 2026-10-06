// ===== CONFIGURATION =====
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlHOnh3HEyT7WgUvT0i8hrykL8dQY39LrsBjqrNtI2wvq-svFYXyqDmwe_ofGYyM-V/exec";
// +07:00 = WIB, supaya countdown sama untuk semua tamu di zona waktu mana pun
const WEDDING_DATE = new Date("2027-01-10T09:00:00+07:00").getTime();

const VENUE_NAME = "Ruang serba guna masjid mujahidin, Jalan Palapa VI Jakarta Barat";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE_NAME)}`;
const CAL_TITLE = encodeURIComponent("The Wedding of Asri & Arif");
const CAL_DETAILS = encodeURIComponent("We are excited to celebrate our special day with you!");
const CAL_LOCATION = encodeURIComponent(VENUE_NAME);
const CAL_DATES = "20260911T020000Z/20260911T070000Z"; // 09.00-14.00 WIB
const CALENDAR_URL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${CAL_TITLE}&dates=${CAL_DATES}&details=${CAL_DETAILS}&location=${CAL_LOCATION}`;

const $ = (s, r = document) => r.querySelector(s);
const frame = $(".desktop-phone-frame");
let observer;

document.addEventListener("DOMContentLoaded", () => {
  $("#mapBtn").href = MAPS_URL;
  $("#saveTheDateBtn").href = CALENDAR_URL;

// 1. Update tombol link Google Maps
  const mapBtn = document.getElementById("mapBtn");
  if (mapBtn) mapBtn.href = MAPS_URL;

  // 2. Update teks alamat di bawah peta secara otomatis
  const addressEl = document.getElementById("venueAddressText");
  if (addressEl) {
    addressEl.innerHTML = VENUE_NAME.replace(/, /g, "<br>");
  }

  // 3. Update Iframe Google Maps secara otomatis sesuai VENUE_NAME
  const mapIframe = document.getElementById("mapIframe");
  if (mapIframe) {
    mapIframe.src = `https://www.google.com/maps?q=${encodeURIComponent(VENUE_NAME)}&output=embed`;
  }

  showGuestName();
  setupReveal();
  startCountdown();
  setupMusic();
  setupForm();
  setupCopy();
  generateCalendar();
});

// ===== KALENDER OTOMATIS =====
function generateCalendar() {
  const weddingDateObj = new Date(WEDDING_DATE);
  const year = weddingDateObj.getFullYear();
  const month = weddingDateObj.getMonth(); // 0 = Januari, 8 = September
  const weddingDay = weddingDateObj.getDate(); // Tanggal 11

  // Daftar nama bulan
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Set judul bulan dan tahun
  const monthYearEl = $("#calMonthYear");
  if (monthYearEl) {
    monthYearEl.innerText = `${monthNames[month]} ${year}`;
  }

  const tbody = $("#calendarBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  // Hitung hari pertama di bulan tersebut dan total hari dalam bulan tersebut
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  let dateCounter = 1;
  let html = "";

  // Buat maksimal 6 baris minggu
  for (let i = 0; i < 6; i++) {
    let row = "<tr>";
    
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDayIndex) {
        // Kotak kosong sebelum tanggal 1 di bulan itu
        row += "<td></td>";
      } else if (dateCounter > totalDays) {
        // Kotak kosong setelah tanggal terakhir bulan itu
        row += "<td></td>";
      } else {
        // Format angka dengan dua digit (01, 02, dst)
        let formattedDay = String(dateCounter).padStart(2, "0");
        
        if (dateCounter === weddingDay) {
          // Beri tanda bintang/highlight pada tanggal pernikahan
          row += `<td><span class="highlight-star">${formattedDay}</span></td>`;
        } else {
          row += `<td>${formattedDay}</td>`;
        }
        dateCounter++;
      }
    }
    row += "</tr>";
    html += row;

    // Hentikan looping jika tanggal sudah habis
    if (dateCounter > totalDays) break;
  }

  tbody.innerHTML = html;
}

// Nama tamu dari link: ...index.html?to=Budi
function showGuestName() {
  const to = new URLSearchParams(location.search).get("to");
  if (!to) return;
  $("#guestName").textContent = to;
  $("#guestLine").classList.remove("hidden");
}

// ===== SCROLL REVEAL PER ELEMEN =====
function setupReveal() {
  // Desktop: frame yang di-scroll. HP: window yang di-scroll.
  const scrollable = getComputedStyle(frame).overflowY !== "visible";

  observer = new IntersectionObserver((entries) => {
    entries
      .filter((e) => e.isIntersecting)
      .forEach((e, i) => {
        const el = e.target;
        el.style.transitionDelay = `${i * 110}ms`; // stagger untuk elemen yang muncul bersamaan
        el.classList.add("in");
        observer.unobserve(el);
        setTimeout(() => (el.style.transitionDelay = ""), 1600);
      });
  }, { root: scrollable ? frame : null, threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  [...$("#cover").children].forEach((el, i) => el.style.setProperty("--i", i));

  addReveal($("#mainContent").querySelectorAll(
    ".section > *:not(.couple-cards):not(.couple-illustrations):not(.button-group)," +
    ".couple-cards > *, .couple-illustrations > *, .button-group > *," +
    ".countdown-section > :not([class^='pearl']), .timeline-item, .footer-maroon > *"
  ));
}

function addReveal(els) {
  els.forEach((el) => {
    if (el.classList.contains("reveal")) return;
    el.classList.add("reveal");
    observer.observe(el);
  });
}

// ===== BUKA UNDANGAN =====
function openInvitation() {
  if (document.body.classList.contains("opened")) return;
  document.body.classList.add("opened");

  const cover = $("#cover");
  const main = $("#mainContent");

  burstStars($(".btn-open").getBoundingClientRect());
  $("#bgMusic").play().catch(() => console.log("Autoplay blocked by browser."));
  fetchWishes();

  cover.classList.add("leaving"); // elemen cover terbang keluar satu per satu

  setTimeout(() => {
    cover.classList.add("hidden");
    main.classList.remove("hidden");
    frame.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, 950);
}

function burstStars(rect) {
  const colors = ["#5C161D", "#6F7D44", "#C9A24B"];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 170;
    s.className = "burst";
    s.textContent = "★";
    s.style.left = rect.left + rect.width / 2 + "px";
    s.style.top = rect.top + rect.height / 2 + "px";
    s.style.color = colors[i % colors.length];
    s.style.setProperty("--x", Math.cos(angle) * dist + "px");
    s.style.setProperty("--y", Math.sin(angle) * dist + "px");
    s.style.setProperty("--r", Math.random() * 360 + "deg");
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  }
}

// ===== MUSIK =====
function setupMusic() {
  const music = $("#bgMusic");
  const btn = $("#musicToggle");

  btn.addEventListener("click", () => {
    if (music.paused) music.play().catch(() => {});
    else music.pause();
  });
  // Label selalu sinkron dengan kondisi musik sebenarnya
  music.addEventListener("play", () => (btn.innerHTML = "★ Pause Music"));
  music.addEventListener("pause", () => (btn.innerHTML = "★ Play Music"));
}

// ===== COUNTDOWN =====
function startCountdown() {
  const pad = (n) => String(n).padStart(2, "0");
  let timerId;

  const update = () => {
    const distance = WEDDING_DATE - Date.now();

    if (distance < 0) {
      clearInterval(timerId);
      $("#timer").innerHTML = "<p class='white-text'>The Wedding Day is Here!</p>";
      return;
    }

    $("#days").innerText = pad(Math.floor(distance / 86400000));
    $("#hours").innerText = pad(Math.floor((distance % 86400000) / 3600000));
    $("#minutes").innerText = pad(Math.floor((distance % 3600000) / 60000));
    $("#seconds").innerText = pad(Math.floor((distance % 60000) / 1000));
  };

  update();
  timerId = setInterval(update, 1000);
}

// ===== RSVP =====
function setupForm() {
  const form = $("#rsvpForm");
  const status = $("#formStatus");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    status.innerText = "Mengirim RSVP...";
    status.style.color = "#ccc";

    const payload = {
      fullName: $("#fullName").value,
      attendance: $("#attendance").value,
      guestCount: $("#guestCount").value,
      message: $("#message").value,
    };

    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result !== "success") throw new Error(data.error);
        status.innerText = "Terima kasih! RSVP Anda telah terkirim.";
        status.style.color = "#a3e635";
        form.reset();
        fetchWishes();
      })
      .catch((err) => {
        status.innerText = "Gagal mengirim. Silakan coba lagi.";
        status.style.color = "#f87171";
        console.error(err);
      })
      .finally(() => (submitBtn.disabled = false));
  });
}

function fetchWishes() {
  const container = $("#wishesContainer");
  if (!container) return;

  fetch(SCRIPT_URL)
    .then((res) => res.json())
    .then((data) => {
      if (data.result !== "success" || !data.wishes.length) return;
      container.innerHTML = "";
      data.wishes.forEach((item) => {
        const card = document.createElement("div");
        card.className = "wish-card";
        card.innerHTML = `
          <div><span class="guest-name">${escapeHtml(item.name)}</span></div>
          <p class="wish-message">"${escapeHtml(item.message)}"</p>`;
        container.appendChild(card);
      });
      addReveal(container.children); // kartu ucapan ikut animasi muncul
    })
    .catch((err) => console.error(err));
}

// ===== SALIN NOMOR REKENING =====
function setupCopy() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Tersalin ✓";
      } catch {
        btn.textContent = "Salin manual";
      }
      setTimeout(() => (btn.textContent = "Salin"), 1600);
    });
  });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


// ===== LIGHTBOX GALERI FOTO =====
function openLightbox(element) {
  const modal = document.getElementById("photoLightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const img = element.querySelector("img");
  
  if (modal && lightboxImg && img) {
    lightboxImg.src = img.src;
    modal.classList.add("active");
  }
}

function closeLightbox() {
  const modal = document.getElementById("photoLightbox");
  if (modal) {
    modal.classList.remove("active");
  }
}