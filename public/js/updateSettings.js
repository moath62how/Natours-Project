import axios from 'axios';
import { showAlert } from './alert.js';

export const UpdateData = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updatePassword/'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';
    const res = await axios.request({
      method: 'patch',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', type.toUpperCase() + ' was updated successfully');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1000);
      console.log(res);
    }
  } catch (e) {
    showAlert('error', 'There was an error updating data : ' + e.message);
  }
};
