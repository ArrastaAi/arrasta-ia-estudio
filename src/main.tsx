import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './integrations/firebase/client'; // Inicializa o Firebase

import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics({name, delta, id}) {
  // These parameters are consistent with Google Analytics' event parameters.
  console.log({
    'event_category': 'Web Vitals',
    'event_action': name,
    'event_value': Math.round(name === 'CLS' ? delta * 1000 : delta), // values must be integers
    'event_label': id, // id unique to current page load
    'non_interaction': true, // avoids affecting bounce rate.
  });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);

createRoot(document.getElementById("root")!).render(<App />);
