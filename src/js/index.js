import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { elements } from './components.js';
import { renderPhotoCard } from './galleryFunctions.js';
import { BASE_URL, API_KEY, options } from './api.js';

const { galleryContainer, searchInput, searchForm, loaderContainer } = elements;

let totalResults = 0;
let isFetchingMore = false;
let hasReachedEnd = false;

const lightbox = new SimpleLightbox('.lightbox', {
  captionsData: 'alt',
  captionDelay: 250,
  enableKeyboard: true,
  showCounter: false,
  scrollZoom: false,
  close: false,
});

searchForm.addEventListener('submit', onFormSubmit);
window.addEventListener('scroll', onScrollHandler);
document.addEventListener('DOMContentLoaded', hideLoader);

function showLoader() {
  loaderContainer.style.display = 'block';
}

function hideLoader() {
  loaderContainer.style.display = 'none';
}

function renderGallery(hits) {
  const markup = hits.map(renderPhotoCard).join('');
  galleryContainer.insertAdjacentHTML('beforeend', markup);

  if (options.params.page * options.params.per_page >= totalResults) {
    if (hasReachedEnd) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      hasReachedEnd = true;
    }
  }
  lightbox.refresh();
}

async function loadMore() {
  if (isFetchingMore) return;

  isFetchingMore = true;
  options.params.page += 1;

  try {
    showLoader();
    const response = await axios.get(BASE_URL, options);
    const hits = response.data.hits;
    renderGallery(hits);
  } catch (err) {
    Notify.failure(err);
  } finally {
    hideLoader();
    isFetchingMore = false;
  }
}

function onScrollHandler() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const scrollThreshold = 300;

  if (
    scrollTop + clientHeight >= scrollHeight - scrollThreshold &&
    galleryContainer.innerHTML !== '' &&
    !isFetchingMore &&
    !hasReachedEnd
  ) {
    loadMore();
  }
}

async function onFormSubmit(e) {
  e.preventDefault();
  options.params.q = searchInput.value.trim();
  if (options.params.q === '') {
    return;
  }
  options.params.page = 1;
  galleryContainer.innerHTML = '';
  hasReachedEnd = false;

  try {
    showLoader();
    const response = await axios.get(BASE_URL, options);
    totalResults = response.data.totalResults;
    const hits = response.data.hits;

    if (hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notify.success(`Hooray! We found ${totalResults} images.`);
      renderGallery(hits);
    }

    searchInput.value = '';
  } catch (err) {
    Notify.failure(err);
  } finally {
    hideLoader();
  }
}
