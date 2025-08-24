      // DOM Elements
      const uploadArea = document.getElementById('uploadArea');
      const imageUpload = document.getElementById('imageUpload');
      const textInput = document.getElementById('textInput');
      const textColor = document.getElementById('textColor');
      const textOpacity = document.getElementById('textOpacity');
      const textSize = document.getElementById('textSize');
      const fontFamily = document.getElementById('fontFamily');
      const textX = document.getElementById('textX');
      const textY = document.getElementById('textY');
      const backgroundText = document.getElementById('backgroundText');
      const backgroundImage = document.getElementById('backgroundImage');
      const objectImage = document.getElementById('objectImage');
      const processBtn = document.getElementById('processBtn');
      const downloadBtn = document.getElementById('downloadBtn');
      const uploadStatus = document.getElementById('uploadStatus');
      const sizeValue = document.getElementById('sizeValue');
      const opacityValue = document.getElementById('opacityValue');
      const xValue = document.getElementById('xValue');
      const yValue = document.getElementById('yValue');
      const previewControlsContainer = document.getElementById('previewControlsContainer');
      
      // API Configuration
      const API_KEY = 'MHMRtQPinV8ux9nk1EcN8oCG';
      const API_URL = 'https://api.remove.bg/v1.0/removebg';
      
      // State
      let originalImageUrl = null;
      let processedImageUrl = null;
      let uploadedFile = null;
      let isProcessed = false;
      
      // Upload area drag and drop
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      });

      uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          handleFile(files[0]);
        }
      });

      uploadArea.addEventListener('click', () => {
        imageUpload.click();
      });

      // Event Listeners
      imageUpload.addEventListener('change', (e) => {
        if (e.target.files[0]) {
          handleFile(e.target.files[0]);
        }
      });

      textInput.addEventListener('input', updateText);
      textColor.addEventListener('input', updateText);
      textOpacity.addEventListener('input', updateText);
      textSize.addEventListener('input', updateText);
      fontFamily.addEventListener('change', updateText);
      textX.addEventListener('input', updateTextPosition);
      textY.addEventListener('input', updateTextPosition);
      processBtn.addEventListener('click', processImage);
      downloadBtn.addEventListener('click', downloadComposition);

      // Range value updates
      textSize.addEventListener('input', () => {
        sizeValue.textContent = textSize.value + 'px';
      });

      textOpacity.addEventListener('input', () => {
        opacityValue.textContent = textOpacity.value + '%';
      });

      textX.addEventListener('input', () => {
        xValue.textContent = textX.value + '%';
      });

      textY.addEventListener('input', () => {
        yValue.textContent = textY.value + '%';
      });
      
      // Functions
      function handleFile(file) {
        if (!file.type.startsWith('image/')) {
          showStatus('Please select a valid image file.', 'error');
          return;
        }

        uploadedFile = file;
        isProcessed = false;
        
        const reader = new FileReader();
        reader.onload = function(event) {
          originalImageUrl = event.target.result;
          
          // Set original image as background
          backgroundImage.src = originalImageUrl;
          backgroundImage.classList.remove('hidden');
          
          // Hide foreground object until processed
          objectImage.classList.add('hidden');
          processedImageUrl = null;
          
          // Enable processing but disable download until processed
          processBtn.disabled = false;
          downloadBtn.disabled = true;
          
          // Update upload area
          uploadArea.innerHTML = `
            <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success);"></i>
            <h3>Image loaded successfully!</h3>
            <p>Click to change image</p>
          `;
          
          // Show preview and controls
          previewControlsContainer.classList.add('active');
          showStatus('Image loaded! Click "Create Text-Behind Effect" to process.', 'info');
        };
        reader.readAsDataURL(file);
      }
      
      function loadExample(imageUrl) {
        // Create a file object from the example image URL
        fetch(imageUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'example-image.jpg', { type: 'image/jpeg' });
            handleFile(file);
          })
          .catch(err => {
            console.error('Error loading example:', err);
            showStatus('Failed to load example image.', 'error');
          });
      }
      
      function updateText() {
        backgroundText.textContent = textInput.value;
        const opacityHex = Math.floor(textOpacity.value * 2.55).toString(16).padStart(2, '0');
        backgroundText.style.color = `${textColor.value}${opacityHex}`;
        backgroundText.style.fontSize = `${textSize.value}px`;
        backgroundText.style.fontFamily = fontFamily.value;
      }
      
      function updateTextPosition() {
        backgroundText.style.left = `${textX.value}%`;
        backgroundText.style.top = `${textY.value}%`;
        backgroundText.style.transform = 'translate(-50%, -50%)';
        backgroundText.style.position = 'absolute';
      }
      
      async function processImage() {
        if (!uploadedFile) {
          showStatus('Please upload an image first', 'error');
          return;
        }
        
        processBtn.classList.add('loading');
        processBtn.innerHTML = '<span class="spinner"></span>Processing...';
        processBtn.disabled = true;
        
        showStatus('Creating text-behind effect... This may take a few seconds.', 'info');
        
        try {
          const formData = new FormData();
          formData.append('image_file', uploadedFile);
          formData.append('size', 'auto');
          
          const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'X-Api-Key': API_KEY
            },
            body: formData
          });
          
          if (!apiResponse.ok) {
            throw new Error(`API Error: ${apiResponse.status}`);
          }
          
          const blob = await apiResponse.blob();
          processedImageUrl = URL.createObjectURL(blob);
          
          // Now show the processed image as foreground object
          objectImage.src = processedImageUrl;
          objectImage.classList.remove('hidden');
          
          isProcessed = true;
          downloadBtn.disabled = false;
          
          showStatus('Text-behind effect created successfully! Background shows behind text, subject appears in front.', 'success');
          
          // Change process button to success state briefly
          processBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
          setTimeout(() => {
            processBtn.innerHTML = '<i class="fas fa-magic"></i> Create Text-Behind Effect';
            processBtn.disabled = false;
            processBtn.classList.remove('loading');
          }, 1500);
        } catch (error) {
          console.error('Error:', error);
          showStatus('Background removal failed. Please check your API key or try again.', 'error');
          objectImage.classList.add('hidden');
          isProcessed = false;
          downloadBtn.disabled = true;
          processBtn.innerHTML = '<i class="fas fa-magic"></i> Create Text-Behind Effect';
          processBtn.disabled = false;
          processBtn.classList.remove('loading');
        }
      }
      
      function showStatus(message, type) {
        uploadStatus.textContent = message;
        uploadStatus.className = `status ${type}`;
        uploadStatus.classList.remove('hidden');
        
        if (type === 'success') {
          setTimeout(() => {
            uploadStatus.classList.add('hidden');
          }, 5000);
        }
      }
      
      function downloadComposition() {
        if (!originalImageUrl) {
          showStatus('No image to download', 'error');
          return;
        }
        
        const canvas = document.createElement('canvas');
        const preview = document.querySelector('.preview-container');
        canvas.width = preview.offsetWidth * 2;
        canvas.height = preview.offsetHeight * 2;
        const ctx = canvas.getContext('2d');
        
        ctx.scale(2, 2);
        
        // Fill with white background first
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw background image (original)
        const bgImg = new Image();
        bgImg.onload = function() {
          const scale = Math.min(
            (canvas.width/2) / bgImg.width,
            (canvas.height/2) / bgImg.height
          );
          const width = bgImg.width * scale;
          const height = bgImg.height * scale;
          const x = ((canvas.width/2) - width) / 2;
          const y = ((canvas.height/2) - height) / 2;
          
          ctx.drawImage(bgImg, x, y, width, height);
          drawTextOnCanvas(ctx, canvas);
        };
        bgImg.src = originalImageUrl;
      }
      
      function drawTextOnCanvas(ctx, canvas) {
        // Draw text layer
        const opacity = parseInt(textOpacity.value) / 100;
        ctx.fillStyle = textColor.value;
        ctx.globalAlpha = opacity;
        ctx.font = `bold ${textSize.value}px ${fontFamily.value}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        const lines = textInput.value.split('\n');
        const lineHeight = parseInt(textSize.value) * 1.2;
        
        // Calculate position based on sliders
        const xPos = (textX.value / 100) * (canvas.width/2);
        const yPos = (textY.value / 100) * (canvas.height/2);
        
        // Adjust for multiple lines
        const startY = yPos - ((lines.length - 1) * lineHeight) / 2;
        
        lines.forEach((line, i) => {
          ctx.fillText(line, xPos, startY + (i * lineHeight));
        });
        
        // Reset context
        ctx.globalAlpha = 1.0;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw foreground object (processed image) if available
        if (isProcessed && processedImageUrl && !objectImage.classList.contains('hidden')) {
          const objImg = new Image();
          objImg.onload = function() {
            const scale = Math.min(
              (canvas.width/2) / objImg.width,
              (canvas.height/2) / objImg.height
            );
            const width = objImg.width * scale;
            const height = objImg.height * scale;
            const x = ((canvas.width/2) - width) / 2;
            const y = ((canvas.height/2) - height) / 2;
            
            ctx.drawImage(objImg, x, y, width, height);
            triggerDownload(canvas);
          };
          objImg.src = processedImageUrl;
        } else {
          triggerDownload(canvas);
        }
      }
      
      function triggerDownload(canvas) {
        const link = document.createElement('a');
        link.download = 'text-behind-image-composition.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      function closePreview() {
        previewControlsContainer.classList.remove('active');
      }
      
      // Initialize
      updateText();
      updateTextPosition();

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

      // Initialize navbar scroll state
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      }
      function closePreview() {
    const previewControlsContainer = document.getElementById('previewControlsContainer');
    previewControlsContainer.classList.remove('active');
    
    // Reset upload area
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <h3>Upload Your Image</h3>
        <p>Drag & drop your image here or click to browse</p>
    `;
    
    // Hide status message
    const uploadStatus = document.getElementById('uploadStatus');
    uploadStatus.classList.add('hidden');
}
