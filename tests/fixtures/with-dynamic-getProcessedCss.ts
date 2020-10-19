import './styles.css';
import './styles2.css';

function dynamicallyLoaded() {
  return import('../../runtime').then(({getProcessedCss}) => {
    getProcessedCss();
  });
}
