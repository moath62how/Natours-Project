/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapBox.js';
import { login, logout } from './login.js';
import { UpdateData } from './updateSettings.js';
import { bookTour } from './stripe.js';

const logoutBtn = document.querySelector('.nav__el--logout');
const updateDataForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
if (document.getElementById('map')) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations,
  );

  displayMap(locations);
}

if (document.querySelector('.form--login')) {
  document.querySelector('.form--login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email, password);
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (updateDataForm) {
  updateDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();

    form.append('Name', updateDataForm.querySelector('#name').value);
    form.append('Email', updateDataForm.querySelector('#email').value);
    form.append('photo', updateDataForm.querySelector('#photo').files[0]);
    console.log(form);
    UpdateData(form, 'DATA');
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const CurrentPassword =
      updatePasswordForm.querySelector('#password-current').value;
    const newPassword = updatePasswordForm.querySelector('#password').value;
    const newPasswordConfirm =
      updatePasswordForm.querySelector('#password-confirm').value;
    UpdateData(
      { CurrentPassword, newPassword, newPasswordConfirm },
      'password',
    );
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Proccessing...';
    const { tourid } = e.target.dataset;
    bookTour(tourid);
  });
}
