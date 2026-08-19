// ==========================================================================
// POOJITHA MEDISPHERE - ADVANCED INTERACTIVE & ANIMATION ENGINE
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {

    // --------------------------------------------------------------------------
    // 1. TOP SCROLL PROGRESS BAR
    // --------------------------------------------------------------------------
    let progressBar = document.getElementById("scrollProgressBar");
    if (!progressBar) {
        progressBar = document.createElement("div");
        progressBar.id = "scrollProgressBar";
        progressBar.className = "scroll-progress-bar";
        document.body.prepend(progressBar);
    }

    // --------------------------------------------------------------------------
    // 2. SCROLL TO TOP BUTTON
    // --------------------------------------------------------------------------
    let scrollTopBtn = document.getElementById("scrollTopBtn");
    if (!scrollTopBtn) {
        scrollTopBtn = document.createElement("button");
        scrollTopBtn.id = "scrollTopBtn";
        scrollTopBtn.className = "scroll-top-btn";
        scrollTopBtn.setAttribute("aria-label", "Scroll to top");
        scrollTopBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        `;
        document.body.appendChild(scrollTopBtn);

        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // Scroll listener for progress bar, header styling, and back-to-top button
    const header = document.querySelector("header");
    window.addEventListener("scroll", function () {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        
        if (progressBar) {
            progressBar.style.width = scrolled + "%";
        }

        if (header) {
            if (winScroll > 30) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }

        if (scrollTopBtn) {
            if (winScroll > 320) {
                scrollTopBtn.classList.add("visible");
            } else {
                scrollTopBtn.classList.remove("visible");
            }
        }
    }, { passive: true });

    // --------------------------------------------------------------------------
    // 3. MOBILE MENU TOGGLE WITH SMOOTH DRAWER ANIMATION
    // --------------------------------------------------------------------------
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mainNav = document.getElementById("mainNav");

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            mainNav.classList.toggle("open");
            const isOpen = mainNav.classList.contains("open");
            mobileMenuBtn.innerHTML = isOpen ? "✕" : "☰";
            mobileMenuBtn.setAttribute("aria-expanded", isOpen);
        });

        // Close mobile menu on outside click
        document.addEventListener("click", function (e) {
            if (mainNav.classList.contains("open") && !mainNav.contains(e.target) && e.target !== mobileMenuBtn) {
                mainNav.classList.remove("open");
                mobileMenuBtn.innerHTML = "☰";
                mobileMenuBtn.setAttribute("aria-expanded", "false");
            }
        });
    }

    // --------------------------------------------------------------------------
    // 4. SCROLL REVEAL (INTERSECTION OBSERVER)
    // --------------------------------------------------------------------------
    const revealElements = document.querySelectorAll(
        ".doctor-card, .service-card, .facility-card, .highlight-card, .service-feature-box, .stat-item, .about-content, .about-image-wrapper, .doctor-section, .doctor-message, .doctor-philosophy, .contact-card, .contact-form-container, .reveal, .reveal-left, .reveal-right, .reveal-scale"
    );

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        });

        revealElements.forEach((el, index) => {
            if (!el.classList.contains("reveal") && !el.classList.contains("reveal-left") && !el.classList.contains("reveal-right") && !el.classList.contains("reveal-scale")) {
                el.classList.add("reveal");
            }
            // Add subtle stagger delay to grid siblings
            const parentGrid = el.closest(".doctors-section, .service-container, .facility-container, .highlights-grid, .stats-grid, .all-services");
            if (parentGrid) {
                const siblings = Array.from(parentGrid.children);
                const siblingIndex = siblings.indexOf(el);
                if (siblingIndex > 0) {
                    el.style.transitionDelay = `${(siblingIndex % 4) * 0.12}s`;
                }
            }
            revealObserver.observe(el);
        });
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add("is-visible"));
    }

    // --------------------------------------------------------------------------
    // 5. ANIMATED STATISTICAL NUMBER COUNTER
    // --------------------------------------------------------------------------
    const statElements = document.querySelectorAll(".stat-number");
    
    function animateCounters() {
        statElements.forEach(el => {
            const rawText = el.textContent.trim();
            const match = rawText.match(/^([0-9]+)(k|\+|%|\/7)?/i);
            
            if (match && !el.dataset.counted) {
                el.dataset.counted = "true";
                const targetNumber = parseInt(match[1], 10);
                const suffix = rawText.replace(match[1], "");
                const duration = 1800; // ms
                const startTime = performance.now();

                function updateCount(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Ease out expo curve
                    const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                    const currentVal = Math.floor(easeOutProgress * targetNumber);

                    el.innerHTML = `${currentVal}<span>${suffix}</span>`;

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        el.innerHTML = `${targetNumber}<span>${suffix}</span>`;
                    }
                }

                requestAnimationFrame(updateCount);
            }
        });
    }

    const statsStrip = document.querySelector(".stats-strip");
    if (statsStrip && "IntersectionObserver" in window) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        statsObserver.observe(statsStrip);
    } else if (statElements.length > 0) {
        animateCounters();
    }

    // --------------------------------------------------------------------------
    // 6. 3D PERSPECTIVE TILT & INTERACTIVE GLARE (FOR CARDS)
    // --------------------------------------------------------------------------
    const interactiveCards = document.querySelectorAll(
        ".doctor-card, .service-card, .facility-card, .highlight-card, .service-feature-box"
    );

    // Only activate 3D tilt on devices that support fine pointer (desktop mouse)
    if (window.matchMedia("(pointer: fine)").matches) {
        interactiveCards.forEach(card => {
            // Create dynamic sheen/glare element
            let glare = card.querySelector(".card-glare");
            if (!glare) {
                glare = document.createElement("div");
                glare.className = "card-glare";
                card.appendChild(glare);
            }

            card.addEventListener("mousemove", function (e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
                const rotateY = ((x - centerX) / centerX) * 6;  // max 6 deg

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
                
                // Position glare light reflection
                const glareX = (x / rect.width) * 100;
                const glareY = (y / rect.height) * 100;
                glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 70%)`;
                glare.style.opacity = "1";
            });

            card.addEventListener("mouseleave", function () {
                card.style.transform = "";
                if (glare) {
                    glare.style.opacity = "0";
                }
            });
        });
    }

    // --------------------------------------------------------------------------
    // 7. DOCTOR SPECIALTY FILTER (on doctors.html)
    // --------------------------------------------------------------------------
    const filterButtons = document.querySelectorAll(".filter-btn");
    const doctorCards = document.querySelectorAll(".doctor-card");

    if (filterButtons.length > 0 && doctorCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener("click", function () {
                filterButtons.forEach(btn => btn.classList.remove("active"));
                this.classList.add("active");

                const filterValue = this.getAttribute("data-filter");

                let delayIndex = 0;
                doctorCards.forEach(card => {
                    const cardCategory = card.getAttribute("data-category");
                    
                    if (filterValue === "all" || cardCategory === filterValue) {
                        card.style.display = "flex";
                        card.style.opacity = "0";
                        card.style.transform = "translateY(20px) scale(0.96)";
                        
                        setTimeout(() => {
                            card.style.transition = "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
                            card.style.opacity = "1";
                            card.style.transform = "translateY(0) scale(1)";
                        }, delayIndex * 70);
                        delayIndex++;
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }

    // --------------------------------------------------------------------------
    // 8. BUTTON RIPPLE EFFECT
    // --------------------------------------------------------------------------
    const rippleButtons = document.querySelectorAll(".btn, .doctor-btn, .filter-btn");
    rippleButtons.forEach(btn => {
        btn.addEventListener("click", function (e) {
            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement("span");
            ripple.className = "btn-ripple";
            
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            btn.appendChild(ripple);
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // --------------------------------------------------------------------------
    // 9. PRE-SELECT DEPARTMENT FROM QUERY PARAMS (on contact.html)
    // --------------------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDept = urlParams.get("dept");
    const departmentSelect = document.getElementById("department");

    if (selectedDept && departmentSelect) {
        for (let i = 0; i < departmentSelect.options.length; i++) {
            if (departmentSelect.options[i].value.toLowerCase() === selectedDept.toLowerCase()) {
                departmentSelect.selectedIndex = i;
                break;
            }
        }
    }

    // --------------------------------------------------------------------------
    // 10. DATE PICKER DEFAULTS & MINIMUM
    // --------------------------------------------------------------------------
    const dateInput = document.getElementById("date");
    if (dateInput) {
        const today = new Date().toISOString().split("T")[0];
        dateInput.setAttribute("min", today);
        if (!dateInput.value) {
            dateInput.value = today;
        }
    }

    // --------------------------------------------------------------------------
    // 11. TOAST NOTIFICATION
    // --------------------------------------------------------------------------
    function showToast(message, type = "success") {
        let toast = document.getElementById("toast");
        let toastText = document.getElementById("toastText");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            toast.className = "toast-msg";
            toast.innerHTML = `<span class="toast-icon">✨</span><span id="toastText"></span>`;
            document.body.appendChild(toast);
            toastText = document.getElementById("toastText");
        }

        if (toast && toastText) {
            toastText.textContent = message;
            toast.classList.remove("error", "success");
            toast.classList.add(type);
            toast.classList.add("show");

            setTimeout(() => {
                toast.classList.remove("show");
            }, 4800);
        }
    }

    // --------------------------------------------------------------------------
    // 12. APPOINTMENT FORM HANDLER WITH FEEDBACK
    // --------------------------------------------------------------------------
    const appointmentForm = document.getElementById("appointmentForm");
    if (appointmentForm) {
        appointmentForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const submitBtn = appointmentForm.querySelector("button[type='submit']");
            const originalBtnText = submitBtn ? submitBtn.innerHTML : "Book Appointment";

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>⏳</span> Confirming Appointment...`;
            }

            setTimeout(() => {
                const name = document.getElementById("name") ? document.getElementById("name").value.trim() : "Patient";
                const department = document.getElementById("department") ? document.getElementById("department").value : "Consultation";
                const date = document.getElementById("date") ? document.getElementById("date").value : "scheduled date";
                const doctor = document.getElementById("doctor") ? document.getElementById("doctor").value : "";

                let doctorSnippet = doctor ? ` with ${doctor}` : "";
                const successMessage = `Thank you, ${name}! Your appointment${doctorSnippet} for ${department} on ${date} is confirmed. We will reach out shortly.`;
                
                showToast(successMessage, "success");
                appointmentForm.reset();

                if (dateInput) {
                    const today = new Date().toISOString().split("T")[0];
                    dateInput.value = today;
                }

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }, 800);
        });
    }

});