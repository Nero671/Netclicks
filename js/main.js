const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = '3ffe4700dddc339a5af4a96aa344da12';
const SERVER = 'https://api.themoviedb.org/3';

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvCardImg = document.querySelector('.tv-card__img');
const tvShowsList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const tvShows = document.querySelector('.tv-shows');
const modalTitle = document.querySelector('.modal__title'); 
const genresList = document.querySelector('.genres-list')
const rating = document.querySelector('.rating')
const modalLink = document.querySelector('.modal__link')
const description = document.querySelector('.description');
const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');
const preloader = document.querySelector('.preloader');
const dropdown = document.querySelectorAll('.dropdown');
const tvShowsHead = document.querySelector('.tv-shows__head');
const posterWrapper = document.querySelector('.poster__wrapper');


const loading = document.createElement('div');
loading.className = 'loading';


const DBService = class {
  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Не удалось получить данные по адресу ${url}`);
    }
  }

  getTestData = () => {
    return this.getData('test.json');
  }

  getTestCard = () => {
    return this.getData('card.json'); 
  }

  getSearchResult = query => {
    return this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`);
  }

  getTvShow = id => {
    return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
  }

  getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`);
  
  getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`);

  getToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`);

  getWeek = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`);
};

new DBService().getSearchResult('Няня')

const renderCard = (response, target) => {
  console.log(response);
  tvShowsList.textContent = '';

  if(!response.total_results) {
    loading.remove();
    tvShowsHead.textContent = 'К сожалению по вашему запросу ничего не найдено...';
    tvShowsHead.style.cssText = 'color: red;'
    return;
  }

  tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';
  tvShowsHead.style.cssText = 'color: green;'

  response.results.forEach(item => {

    const {
          backdrop_path: backdrop, 
          name: title, 
          poster_path: poster, 
          vote_average: vote, id
          } = item
    
    const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
    const backdropIMG = backdrop ? IMG_URL + backdrop : 'img/no-poster.jpg';
    const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';
      

    const card = document.createElement('li');
    card.classList.add('tv-shows__item');
    card.innerHTML = `
      <a href="#" id="${id}" class="tv-card">
        ${voteElem}
        <img class="tv-card__img"
              src="${posterIMG}"
              data-backdrop="${backdropIMG}"
              alt="${title}">
        <h4 class="tv-card__head">${title}</h4>
      </a>
    `;
    loading.remove();
    tvShowsList.append(card);
  });
};

searchForm.addEventListener('submit', event => {
  event.preventDefault();

  const value = searchFormInput.value.trim();

  if (value) {
    tvShows.append(loading);
    new DBService().getSearchResult(value).then(renderCard);
  }

  searchFormInput.value = '';
});

const closeDropdown = () => {
  dropdown.forEach(item => {
    item.classList.remove('active');
  });
};

hamburger.addEventListener('click', () => {
  leftMenu.classList.toggle('openMenu');
  hamburger.classList.toggle('open');
  closeDropdown();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.left-menu')) {
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
    closeDropdown();
  }
});

leftMenu.addEventListener('click', event => {
  const target = event.target;
  const dropdown = target.closest('.dropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
    leftMenu.classList.add('openMenu')
    hamburger.classList.add('open')
  }
  if (target.closest('#top-rated')) {
    new DBService().getTopRated().then((response) => renderCard(response, target));
  }
  if (target.closest('#popular')) {
    new DBService().getPopular().then((response) => renderCard(response, target));
  }
  if (target.closest('#week')) {
    new DBService().getToday().then((response) => renderCard(response, target));
  }
  if (target.closest('#today')) {
    new DBService().getWeek().then((response) => renderCard(response, target));
  }

  if(target.closest('#search')) {
    tvShowsList.textContent = '';
    tvShowsHead.textContent = '';
  }

});

tvShowsList.addEventListener('click', event => {

  event.preventDefault();

  const target = event.target;
  const card = target.closest('.tv-card');

  if(card) {

    preloader.style.display = 'block';
    
    new DBService().getTvShow(card.id)
      .then(data => {
        tvCardImg.src = IMG_URL + data.poster_path;
        modalTitle.textContent = data.name;
        genresList.textContent = '';
        data.genres.forEach(item => {
          genresList.innerHTML += `<li>${item.name}</li>`;
        })
        rating.textContent = data.vote_average;
        modalLink.href = data.homepage;
        description.textContent = data.overview;
      })
      .then(() => {
        document.body.style.overflow = 'hidden';
        modal.classList.remove('hide');
      })
      .then(() => {
        preloader.style.display = '';
      })
    
  }
});

modal.addEventListener('click', event => {

  if(event.target.closest('.cross') ||
    event.target.classList.contains('modal')) {
    document.body.style.overflow = '';
    modal.classList.add('hide');
  }
});

const changeImage = event => {
  const card = event.target.closest('.tv-shows__item');

  if (card) {
    const img = card.querySelector('.tv-card__img');

    if (img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]; //способ поменять местами 2 переменные(деструкторизация)
    }
  }
};

tvShowsList.addEventListener('mouseover', changeImage)
tvShowsList.addEventListener('mouseout', changeImage)

