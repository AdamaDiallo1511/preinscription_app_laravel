'use strict'
import './bootstrap';
import { getData, getFormationList, appendFormation, displaySelectedFormation } from './functions';

(async function () {
    await getFormationList().then(async function (response) {
        await appendFormation(response);
        await displaySelectedFormation();
    }).catch(error => console.error(error));
})();

$(async function () {
    await getData();
});

