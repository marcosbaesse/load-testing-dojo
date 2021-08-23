// basic run: k6 run script.js
// run with more vus and set duration: k6 run --vus 10 --duration 30s script.js

import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  http.get('https://test.k6.io');
  sleep(1);
}
