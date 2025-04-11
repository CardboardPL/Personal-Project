'use strict';

import { setUpFunctions } from './controllers/setup.js';

(async () => {
    await setUpFunctions.get('/taskmanager')();
})();