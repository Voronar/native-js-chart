import { createApplication } from './components/Application';


document.body.onload = () => {
  try {
    createApplication();
  } catch (e) {
    alert('Что-то пошло не так.');
  }
};
