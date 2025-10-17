let index = 0;
let slides = [];

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const container = document.getElementById('slideshow-container');
const apiSearchUrl =
  'https://collectionapi.metmuseum.org/public/collection/v1/search?q=painting&hasImages=true';
let objectIDs = []; // Stores object IDs
let loadedItems = []; // Stores loaded artwork data

// Step 1: Fetch list of object IDs
async function fetchObjectIDs() {
  try {
    const res = await fetch(apiSearchUrl);
    const data = await res.json();
    objectIDs = data.objectIDs.slice(0, 50);
    shuffle(objectIDs);
  } catch (err) {
    console.error('Error fetching object IDs:', err);
  }
}

// Step 2: Fetch artwork by object ID
async function fetchArtwork(id) {
  try {
    const res = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching artwork:', err);
    return null;
  }
}

// Step 3: Create slide element
function createSlide(item) {
  const slideDiv = document.createElement('div');
  slideDiv.className = 'slide';

  const imgUrl = item.primaryImageSmall || item.primaryImage;
  if (imgUrl) {
    const imgEl = document.createElement('img');
    imgEl.src = imgUrl;
    imgEl.alt = item.title || '';
    slideDiv.appendChild(imgEl);
  }

  const captionDiv = document.createElement('div');
  captionDiv.className = 'caption';
  const titleText = item.title || 'Untitled';
  const artist = item.artistDisplayName || 'Unknown Artist';

  captionDiv.innerHTML = `<strong>${titleText}</strong><br/>${artist}`;
  slideDiv.appendChild(captionDiv);

  return slideDiv;
}

// Step 4: Show slide by index
function showSlide(i) {
  slides.forEach((slide) => (slide.style.display = 'none'));
  if (slides[i]) slides[i].style.display = 'block';
}

// Step 5: Load next slide if needed
async function nextSlide() {
  if (index + 1 < slides.length) {
    slides[index].style.display = 'none';
    index++;
    showSlide(index);
  } else {
    // Load next artwork if not preloaded
    while (objectIDs.length > 0) {
      const nextID = objectIDs.shift();
      const artwork = await fetchArtwork(nextID);

      if (artwork && artwork.primaryImage) {
        if (slides.length > 0) slides[index].style.display = 'none';

        const slide = createSlide(artwork);
        container.insertBefore(slide, document.getElementById('nextBtn'));
        slides.push(slide);

        index = slides.length - 1;
        showSlide(index);
        break;
      }
    }
  }
}

// Step 6: Go back to previous slide
function prevSlide() {
  if (index > 0) {
    slides[index].style.display = 'none';
    index--;
    showSlide(index);
  }
}

// Initialize slideshow
async function initSlideshow() {
  await fetchObjectIDs();
  nextSlide(); // Load the first slide
}

document.getElementById('nextBtn').addEventListener('click', nextSlide);
document.getElementById('prevBtn').addEventListener('click', prevSlide);

initSlideshow();
