'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map;
let mapEvent;
let workouts = [];

function init() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(loadMap, function () {
      alert('Could not get your position');
    });
  }
  loadWorkouts();
}

function loadMap(position) {
  const { latitude, longitude } = position.coords;
  const coords = [latitude, longitude];

  map = L.map('map').setView(coords, 13);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  map.on('click', function (mapE) {
    mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  });

  workouts.forEach(workout => {
    renderWorkoutMarker(workout);
    renderWorkout(workout);
  });
}

function renderWorkoutMarker(workout) {
  const { lat, lng } = workout.coords;

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`,
      })
    )
    .setPopupContent(
      `${workout.type === 'running' ? '🏃‍♂️ Running' : '🚴‍♀️ Cycling'} <br>
      Distance: ${workout.distance} km <br>
      Duration: ${workout.duration} min`
    )
    .openPopup();
}

function renderWorkout(workout) {
  const html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${
        workout.type.charAt(0).toUpperCase() + workout.type.slice(1)
      } on ${new Date(workout.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
      ${
        workout.type === 'running'
          ? `<div class="workout__details">
               <span class="workout__icon">🦶🏼</span>
               <span class="workout__value">${workout.cadence}</span>
               <span class="workout__unit">spm</span>
             </div>`
          : `<div class="workout__details">
               <span class="workout__icon">⛰</span>
               <span class="workout__value">${workout.elevationGain}</span>
               <span class="workout__unit">m</span>
             </div>`
      }
    </li>
  `;
  form.insertAdjacentHTML('afterend', html);
}

//store locally
function saveWorkouts() {
  localStorage.setItem('workouts', JSON.stringify(workouts));
}
//load from locally
function loadWorkouts() {
  const data = JSON.parse(localStorage.getItem('workouts'));
  if (!data) return;
  workouts = data;
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const type = inputType.value;
  const distance = +inputDistance.value;
  const duration = +inputDuration.value;
  const cadence = +inputCadence.value;
  const elevation = +inputElevation.value;
  const { lat, lng } = mapEvent.latlng;
  const date = new Date().toISOString();
  const id = (Date.now() + '').slice(-10);

  let workout;

  if (type === 'running') {
    if (!distance || !duration || !cadence)
      return alert('All fields are required!');
    workout = {
      id,
      type,
      distance,
      duration,
      coords: { lat, lng },
      cadence,
      date,
    };
  }

  if (type === 'cycling') {
    if (!distance || !duration || !elevation)
      return alert('All fields are required!');
    workout = {
      id,
      type,
      distance,
      duration,
      coords: { lat, lng },
      elevationGain: elevation,
      date,
    };
  }

  workouts.push(workout);
  saveWorkouts();

  renderWorkoutMarker(workout);
  renderWorkout(workout);

  form.classList.add('hidden');
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';
});

inputType.addEventListener('change', function () {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});

init();
