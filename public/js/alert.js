/* eslint-disable */
export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentNode.removeChild(el);
  }
};
export const showAlert = (type, msg) => {
  hideAlert();
  const markUp = `
    <div class="alert alert--${type}">
    ${msg}
    </div>`;
  document.querySelector('body').insertAdjacentHTML('afterBegin', markUp);
  window.setTimeout(hideAlert, 5000);
};
