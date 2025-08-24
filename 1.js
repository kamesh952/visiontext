      
      // Mobile menu toggle functionality
      const menuToggle = document.querySelector(".menu-toggle");
      const navLinks = document.querySelector(".nav-links");
      const navbar = document.querySelector(".navbar");

      menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        navLinks.classList.toggle("active");
      });

      // Close mobile menu when clicking on a link
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
          menuToggle.classList.remove("active");
          navLinks.classList.remove("active");
        });
      });

      // Navbar scroll effect
      window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      });

      // Image upload and processing functions
      function loadExample(src) {
        const previewImg = document.getElementById("previewImg");
        previewImg.src = src;

        const previewContainer = document.getElementById(
          "imagePreviewContainer"
        );
        previewContainer.style.display = "block";

        const removeBtn = document.getElementById("removeBtn");
        removeBtn.style.display = "flex";
        removeBtn.disabled = false;
        removeBtn.innerHTML = '<i class="fas fa-magic"></i> Remove Background';

        const downloadBtn = document.getElementById("downloadBtn");
        downloadBtn.disabled = true;

        // Scroll to preview
        setTimeout(() => {
          previewContainer.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }

      function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
          // Check file type
          const validTypes = ["image/jpeg", "image/png", "image/webp"];
          if (!validTypes.includes(file.type)) {
            alert("Please upload a valid image file (JPEG, PNG, or WEBP)");
            return;
          }

          // Check file size (5MB max)
          if (file.size > 5 * 1024 * 1024) {
            alert("File size should be less than 5MB");
            return;
          }

          const reader = new FileReader();
          reader.onload = function (e) {
            const previewImg = document.getElementById("previewImg");
            const previewContainer = document.getElementById(
              "imagePreviewContainer"
            );
            const removeBtn = document.getElementById("removeBtn");
            const downloadBtn = document.getElementById("downloadBtn");

            previewImg.src = e.target.result;
            previewContainer.style.display = "block";
            removeBtn.style.display = "flex";
            removeBtn.disabled = false;
            removeBtn.innerHTML =
              '<i class="fas fa-magic"></i> Remove Background';
            downloadBtn.disabled = true;

            // Scroll to preview
            setTimeout(() => {
              previewContainer.scrollIntoView({ behavior: "smooth" });
            }, 100);
          };
          reader.readAsDataURL(file);
        }
      }

      function closePreview() {
        const previewContainer = document.getElementById(
          "imagePreviewContainer"
        );
        const previewImg = document.getElementById("previewImg");
        const removeBtn = document.getElementById("removeBtn");
        const downloadBtn = document.getElementById("downloadBtn");
        const fileInput = document.getElementById("fileInput");

        previewImg.src = "";
        previewContainer.style.display = "none";
        removeBtn.style.display = "none";
        downloadBtn.style.display = "flex";

        if (fileInput) {
          fileInput.value = "";
        }
      }

     async function removeBackground() {
  const fileInput = document.getElementById("fileInput");
  const removeBtn = document.getElementById("removeBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const previewImg = document.getElementById("previewImg");

  if (!fileInput.files.length && !previewImg.src) {
    showAlert("Please upload an image first.");
    return;
  }

  removeBtn.innerHTML = '<span class="spinner"></span>Processing...';
  removeBtn.disabled = true;

  let imageBlob;
  if (!fileInput.files.length && previewImg.src) {
    try {
      const response = await fetch(previewImg.src);
      imageBlob = await response.blob();
    } catch (error) {
      console.error("Error loading example image:", error);
      showAlert("Error loading example image. Please try another one.");
      resetRemoveButton();
      return;
    }
  }

  const formData = new FormData();
  if (fileInput.files.length) {
    formData.append("image_file", fileInput.files[0]);
  } else {
    formData.append("image_file", imageBlob, "example.png");
  }
  formData.append("size", "auto");

  try {
    const imageURL = await tryRemoveBg(formData, "b4vs5t6qEaJM4znbDLq9ufRH");
    setResult(imageURL);
  } catch (error) {
    console.warn("First API key failed, trying second key...", error);
    try {
      const imageURL = await tryRemoveBg(formData, "wJNYz18MtPk7ZGnNoYXr5ZG9");
      setResult(imageURL);
    } catch (error2) {
      console.error("Both API keys failed:", error2);
      showAlert("Failed to remove background with both API keys.");
      resetRemoveButton();
    }
  }

  function setResult(imageURL) {
    previewImg.src = imageURL;
    downloadBtn.disabled = false;
    downloadBtn.setAttribute("data-image-url", imageURL);
    removeBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
    setTimeout(() => (removeBtn.style.display = "none"), 1500);
  }

  async function tryRemoveBg(formData, apiKey) {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: formData,
    });
    if (!response.ok) throw new Error(await response.text());
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}


      function resetRemoveButton() {
        const removeBtn = document.getElementById("removeBtn");
        removeBtn.innerHTML = '<i class="fas fa-magic"></i> Remove Background';
        removeBtn.disabled = false;
      }

      function downloadImage() {
        const downloadBtn = document.getElementById("downloadBtn");
        let imageURL = downloadBtn.getAttribute("data-image-url");

        if (!imageURL) {
          // Fallback to current preview image
          const img = document.getElementById("previewImg");
          if (img.src) {
            imageURL = img.src;
          } else {
            showAlert("No image available to download.");
            return;
          }
        }

        const link = document.createElement("a");
        link.href = imageURL;
        link.download = "erasex-background-removed.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show downloaded confirmation
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
        setTimeout(() => {
          downloadBtn.innerHTML = originalText;
        }, 2000);
      }

      // Initialize image comparison sliders
      function initializeSliders() {
        const sliders = document.querySelectorAll(".slider");

        sliders.forEach((slider) => {
          const comparison = slider.parentElement;
          const before = comparison.querySelector(".before");

          let isDragging = false;

          function updateSlider(position) {
            const rect = comparison.getBoundingClientRect();
            let offset = ((position - rect.left) / rect.width) * 100;
            offset = Math.max(0, Math.min(100, offset));
            before.style.clipPath = `inset(0 ${100 - offset}% 0 0)`;
            slider.style.left = `${offset}%`;
          }

          function startDragging(event) {
            isDragging = true;
            event.preventDefault(); // Prevent text selection
            updateSlider(event.pageX || event.touches[0].pageX);
          }

          function stopDragging() {
            isDragging = false;
          }

          function drag(event) {
            if (!isDragging) return;
            updateSlider(event.pageX || event.touches[0].pageX);
          }

          // Mouse events
          slider.addEventListener("mousedown", startDragging);
          document.addEventListener("mouseup", stopDragging);
          document.addEventListener("mousemove", drag);

          // Touch events (for mobile support)
          slider.addEventListener("touchstart", startDragging);
          document.addEventListener("touchend", stopDragging);
          document.addEventListener("touchmove", drag);

          // Handle window resize
          window.addEventListener("resize", () => {
            const rect = comparison.getBoundingClientRect();
            const sliderPos = parseFloat(slider.style.left || "50");
            updateSlider(rect.left + (rect.width * sliderPos) / 100);
          });
        });
      }

      // Show alert function
      function showAlert(message) {
        // In a real app, you might use a more sophisticated alert system
        alert(message);
      }

      // Modal functions
      function openModal() {
        const modal = document.getElementById("loginModal");
        if (modal) {
          const iframe = modal.querySelector("iframe");
          modal.classList.add("show");
          if (iframe) {
            iframe.style.display = "block";
          }
        }
      }

      function closeModal() {
        const modal = document.getElementById("loginModal");
        if (modal) {
          const iframe = modal.querySelector("iframe");
          modal.classList.remove("show");
          if (iframe) {
            iframe.style.display = "none";
          }
        }
      }

      // Smooth scrolling for anchor links
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          e.preventDefault();

          const targetId = this.getAttribute("href");
          if (targetId === "#") return;

          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
            });
          }
        });
      });

      // Initialize everything when the page loads
      window.addEventListener("DOMContentLoaded", function () {
        initializeSliders();
        closeModal();

        // Enable drag and drop for upload area
        const uploadArea = document.querySelector(".upload-area");
        if (uploadArea) {
          uploadArea.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = "var(--primary)";
            uploadArea.style.backgroundColor = "rgba(79, 70, 229, 0.05)";
          });

          uploadArea.addEventListener("dragleave", () => {
            uploadArea.style.borderColor = "var(--gray-light)";
            uploadArea.style.backgroundColor = "var(--white)";
          });

          uploadArea.addEventListener("drop", (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = "var(--gray-light)";
            uploadArea.style.backgroundColor = "var(--white)";

            if (e.dataTransfer.files.length) {
              const fileInput = document.getElementById("fileInput");

              // Check file type
              const file = e.dataTransfer.files[0];
              const validTypes = ["image/jpeg", "image/png", "image/webp"];
              if (!validTypes.includes(file.type)) {
                showAlert(
                  "Please upload a valid image file (JPEG, PNG, or WEBP)"
                );
                return;
              }

              // Check file size (5MB max)
              if (file.size > 5 * 1024 * 1024) {
                showAlert("File size should be less than 5MB");
                return;
              }

              // Create a new FileList (since we can't directly modify fileInput.files)
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              fileInput.files = dataTransfer.files;

              handleFileUpload({ target: fileInput });
            }
          });
        }

        // Handle paste from clipboard
        document.addEventListener("paste", (e) => {
          const items = e.clipboardData.items;
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
              const blob = items[i].getAsFile();
              const fileInput = document.getElementById("fileInput");

              // Create a new FileList (since we can't directly modify fileInput.files)
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(blob);
              fileInput.files = dataTransfer.files;

              handleFileUpload({ target: fileInput });
              break;
            }
          }
        });

        // Initialize navbar scroll state
        if (window.scrollY > 50) {
          navbar.classList.add("scrolled");
        }
      });
