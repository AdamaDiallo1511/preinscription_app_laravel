'use strict';
import { increment, decrement } from './create-slice';
import { selectCount, store } from './store';
import { fetchData, btnClicked,document_id,userDetailSubmission, feedbackSubmission, documentSubmission, formationSelected, formationSelectedcount, listFormationsSelected, ableBtnCandidate,submitPreinscription, appendResponseCandidature } from './btn-slice';
import { adminData } from './admin-slice';


/*export let userSubmission = store.getState().btn.userDetailSubmission;
export let feedbackSubmission = store.getState().btn.feedbackSubmission;
export let documentSubmission = store.getState().btn.documentSubmission;
export let submitted = store.getState().btn.submitted;
*/
//////////////////////////////////////////////////////////////////////////////////////// Store ///////////////////////////////////////////////////////////////////////////////////////////////////////
store.subscribe(() => {
    console.log(store.getState());
}); 


//initialisation des variables

////////////////////////////////////////////////////////////////////////////////////// Functions ///////////////////////////////////////////////////////////////////////////////////////////////////////
export async function getData() {
    const userID = $('#user-data-information').attr("data-userID")
    const isAdmin = $('#home-blade-file').attr("data-isAdmin")
    if (isAdmin) {
        adminData()
    } else {
        await fetchData(userID);
        store.dispatch(await formationSelectedcount());
        const candidated = store.getState().btn.submitted
        if (candidated) {
            displayResponsePage();
            appendResponseCandidature()
        } else {
            $('#preinscription-candidature-section').removeClass('d-none');
            spinner(false);
            const counter = () => selectCount(store.getState());
            const formationCandidaureID = listFormationsSelected()
            btnClicked()
            //disables default form submit action
            $('.form-submit').each( function () { 
                $(this).on('submit', function (e) {
                    e.preventDefault();
                });
            });
            validateUserInformation();
            submitFeedback();
            submitDocument();
            submitPreinscriptionCandidated();
            ( async function(){return selectCount(store.getState()) > 0 ? await ablesAddingFormationIntoTable(formationCandidaureID) : ''})();
            (function(){return selectCount(store.getState()) >= 5 ? disablesAddingFormationButton() : ''})();
            candidateBtn();
        }
    }
}

export async function submitData(url, data, type) {
    try {
        const response = await  $.ajax(url, {
            type: type,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                'Content-Type':'application/json'
            },
            data: JSON.stringify(data),
        })
        return response
    } catch (error) {
        throw error
    } 
}


////////////////////////////////////////////////////////// function pour envoyer les informations de l utilisqteur
export async function validateUserInformation() {
    const userID = $('#user-data-information').attr("data-userID")
    $('#btn-submit-personnal-informations').on('click', async function() {
       const data = {
        surname:$('#surname').val(),
        phone_number:$('#phone_number').val(),
        country:$('#country').val(),
        province:$('#province').val(),
        city_of_birth:$('#city_of_birth').val(),
        sex :$('#sex').val(),
        }
        console.log(data)
       return await submitData(`submit-user-information/${userID}`, data, 'PUT').then(response => {
        console.log(response);
        if (response.success) {
            store.dispatch(userDetailSubmission());
            disableUserInformationForm();
            candidateBtn();
        } else {
            throw new Error('Failed to submit user information');
        }
    }).catch(error => console.error(error));
      
    })
}

export function disableUserInformationForm() {
$('#surname').attr('disabled', 'disabled');
$('#phone_number').attr('disabled', 'disabled');
$('#country').attr('disabled', 'disabled');
$('#province').attr('disabled', 'disabled');
$('#city_of_birth').attr('disabled', 'disabled');
$('#sex').attr('disabled', 'disabled');    
$('#btn-submit-personnal-informations').attr('disabled', 'disabled');    
}

//////////////////////////////////////////////////////////////////////////// function pour soumettre les feedbacks
export async function submitFeedback(){
    $('#btn-submit-feedback').on('click', async function() {
    const userID = $('#user-data-information').attr("data-userID");
    const data = {
        feedback:$('#user-feedback').val(),
        user : userID,
        created_at : new Date()
    }
    return await submitData(`submit-feedback/${userID}`, data, 'POST')
    .then(response => {
        console.log(response)
        if (response.success) {
            store.dispatch(feedbackSubmission());
            disableFeedbackForm();
            candidateBtn();
        } else {
            throw new Error('Failed to submit feedback');
        }
    })
    .catch(error => console.error(error));
})
}

export function disableFeedbackForm(){
    $('#user-feedback').attr('disabled', 'disabled');
    $('#btn-submit-feedback').attr('disabled', 'disabled');
}

//////////////////////////////////////////////////////////////////////////// function pour soumettre les documents
export async function submitDocument(){
    $('#user-documents').on('submit', async function(e){
        e.preventDefault();
        const userID = $('#user-data-information').attr("data-userID");
        let formData = new FormData();
        formData.append('last_diploma', $('#last_diploma')[0].files[0]);
        formData.append('passport_pdf_or_img', $('#passport_pdf_or_img')[0].files[0]);
        formData.append('two_last_bulletin', $('#two_last_bulletin')[0].files[0]);
        return await $.ajax(`upload-document/${userID}`, {
            type: 'POST',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log(response);
                if (response.success) {
                    store.dispatch(documentSubmission());
                    store.dispatch(document_id(response.document_id))
                    disabledDocumentAccordion();
                    candidateBtn();
                } else {
                    throw new Error('Failed to submit documents');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    });
}

const disabledDocumentAccordion = () => {
    return $('#document-accordion').addClass('d-none');
}


//////////////////////////////////////////////////////////////////////////affichage des formations proposees par l institut
export async function getFormationList(){
    try {
        const response = $.ajax(`get-list-formation/`,{
            type: 'GET',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                'Content-Type':'application/json'
            }
        })
        return response
    } catch (error) {
        throw error
    }
}



/////////////////////////////////////////////////////////////////////////////// affichage des formations selectiones
export async function appendFormation(data) {
    const formationList = data;
    const listLink = (accordionID, formationID, nom_formation, cycle, cout_formation, departement) => {
        return $(`#${accordionID}`).append(`<a href="#" class="list-group-item list-group-item-action list-group-item-light formation-list-group" id="formation-${formationID}" data-formationID="${formationID}" data-coutFormation="${cout_formation}" data-nomFormation="${nom_formation}" data-cycle="${cycle}" data-departement="${departement}">${cycle} ${nom_formation}</a>`)
    }
    
   async function appendFormationListGroup(data) {
        const regexLicence = /licence/i;
        const regexMaster = /master/i;
        const regexIngenieur = /ingenieur/i;
        const regexDepartementGenieInformatique = /Genie-Informatique/i;
        const regexDepartementReseauxSystemes = /Reseaux & systemes/i;
        data.forEach(el => {
            if (regexLicence.test(el.cycle) && regexDepartementGenieInformatique.test(el.departement)) {
                listLink('accordion-Genie-Informatique-licence', el.id, el.nom_formation, el.cycle, el.cout_formation, el.departement);
            } else if (regexLicence.test(el.cycle) && regexDepartementReseauxSystemes.test(el.departement)) {
                listLink('accordion-Reseaux-systemes-licence', el.id, el.nom_formation, el.cycle, el.cout_formation, el.departement);
            } else if (regexMaster.test(el.cycle) && regexDepartementGenieInformatique.test(el.departement)) {
                listLink('accordion-Genie-Informatique-master', el.id, el.nom_formation, el.cycle, el.cout_formation, el.departement);
            } else if (regexMaster.test(el.cycle) && regexDepartementReseauxSystemes.test(el.departement)) {
                listLink('accordion-Reseaux-systemes-master', el.id, el.nom_formation, el.cycle, el.cout_formation, el.departement);
            } else if (regexIngenieur.test(el.cycle) && regexDepartementGenieInformatique.test(el.departement)) {
                listLink('accordion-Genie-Informatique-ingenieur', el.id, el.nom_formation, el.cycle, el.cout_formation, el.departement);
            } else if (regexIngenieur.test(el.cycle) && regexDepartementReseauxSystemes.test(el.departement)) {
                listLink('accordion-Reseaux-systemes-ingenieur', el.id, el.nom_formation, el.cycle, el.cout_formation, el.departement);
            }
        });
    }
    return await appendFormationListGroup(formationList);
}
async function appendFormationIntoTable(params, candidatureID) {
    return $('#table-body-formation-selected').append(
        `<tr class='formation-selected-list-table-row' id="candidature-id-${candidatureID}" data-candidatureID="${candidatureID} data-formationID="${params.attr('data-formationID')}">
                                                    <th scope="row">${params.attr('data-formationID')}</th>
                                                    <td>${params.attr('data-cycle')}</td>
                                                    <td>${params.attr('data-nomFormation')}</td>
                                                    <td>${params.attr('data-departement')}</td>
                                                    <td>${params.attr('data-coutFormation')}</td>
                                                    <td>
                                                    <button
                                                        type="button"
                                                        class="btn btn-outline-danger"
                                                        id="delete-formation-selected-${params.attr('data-formationID')}"
                                                        data-candidatureID="${candidatureID}">
                                                    <i class="bi bi-trash3"></i>
                                                    </button>
                                                    </td>
                                                </tr>`
    )
}

async function deleteFormationAdded(formationID, candidatureID) {
        return await $.ajax(`delete-formation/${candidatureID}`, {
            type: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                console.log(response);
                store.dispatch(decrement());
                $(`#formation-${formationID}`).removeClass('disabled');
                $(`#formation-${formationID}`).removeAttr('aria-disabled');
                $(`#candidature-id-${candidatureID}`).remove();
                !(selectCount(store.getState()) > 5 || selectCount(store.getState()) == 5) ? ablesAddingFormationButton() : '';
                candidateBtn();
            },
            error: function (error, jqXHR, textStatus, errorThrown) {
                console.error(error,textStatus, errorThrown);
            }
        })
}
//////////////////////////////////////////////////////////////////////// Append the selected formation to the table
async function ablesAddingFormationIntoTable(formationCandidaureID) {
    return formationCandidaureID.forEach( async function (el){
        $(`#formation-${el.id}`).addClass('disabled');
        $(`#formation-${el.id}`).attr('aria-disabled', true);
        selectCount(store.getState()) > 5 || selectCount(store.getState()) == 5 ? disablesAddingFormationButton() : '';
        $('#table-body-formation-selected').append(
            `<tr class='formation-selected-list-table-row' id="candidature-id-${el.candidatureID}" data-candidatureID="${el.candidatureID}" data-formationID="${el.id}">
                                                        <th scope="row">${el.id}</th>
                                                        <td>${el.nom_formation}</td>
                                                        <td>${el.cycle}</td>
                                                        <td>${el.departement}</td>
                                                        <td>${el.cout_formation}</td>
                                                        <td>
                                                        <button
                                                            type="button"
                                                            class="btn btn-outline-danger"
                                                            id="delete-formation-selected-${el.id}"
                                                            data-candidatureID="${el.candidatureID}">
                                                        <i class="bi bi-trash3"></i>
                                                        </button>
                                                        </td>
                                                    </tr>` )
            $(`#candidature-id-${el.candidatureID}`).on('click', 'button[id^="delete-formation-selected-"]', async function () {
                let elId = $(this).data('candidatureid');
                console.log('deleted');
                await deleteFormationAdded(el.id, el.candidatureID);
            });           
    })
}
export async function displaySelectedFormation() {
    $('a').filter('.formation-list-group').each(function () {
        $(this).on('click', async function (e) {
            e.preventDefault();
            const formationID = $(this).attr("data-formationid");
            const userID = $('#user-data-information').attr("data-userID")
            const data = {
                user: userID,
                formation: formationID,
                created_at: new Date(),
            }
             submitData(`add-formation/${userID}/`, data, 'POST').then(async function (response) {
                store.dispatch(increment());
                store.dispatch(formationSelected(formationID))
                $(`#formation-${formationID}`).addClass('disabled');
                $(`#formation-${formationID}`).attr('aria-disabled', true);
                selectCount(store.getState()) > 5 || selectCount(store.getState()) == 5 ? disablesAddingFormationButton() : '';
                candidateBtn();
                await appendFormationIntoTable($(`#formation-${formationID}`), response.id); 
                $(`#delete-formation-selected-${formationID}`).on('click', async function () {
                    console.log('deleted');
                    const candidatureID= $(`#delete-formation-selected-${formationID}`).attr('data-candidatureID');
                     await deleteFormationAdded(formationID, candidatureID);
                })             
            }
            )
            
        })
    })

}


/////////////////////////////////////////////////////////// Disable adding formation button

const disablesAddingFormationButton = () => {
    return $('#add-formation-button').attr('disabled', 'disabled');
}
const ablesAddingFormationButton = () => {
    return $('#add-formation-button').prop('disabled') != undefined ? $('#add-formation-button').removeAttr('disabled') : '';
}


//////////////////////////////////////////////////////////////////////////////////////////////////Able candidate button 
function candidateBtn() {
    const formation_lenght = $('.formation-selected-list-table-row').length + 1
    const submissions = ableBtnCandidate();
    console.log(formation_lenght, submissions);
    return (formation_lenght == 0 &&  $('#candidate').prop('disabled') == undefined ) || (submissions == false &&  $('#candidate').prop('disabled') == undefined ) ? $('#candidate').attr('disabled', 'disabled') : formation_lenght > 0 && submissions ? $('#candidate').removeAttr('disabled') : '';
}

////////////////////////////////////////////////////////////////////////////////////////submissions of preinscription
async function submitPreinscriptionCandidated() {
    return $('#candidate').on('click', async function () {
        await submitPreinscription().then(
            function (res) {
                $('#preinscription-candidature-section').addClass('d-none');
                spinner(false);
                displayResponsePage();
            }
            )
        .catch(err => console.log(err))
    })
}

const display = (bool) => {
    const userID = $('#user-data-information').attr("data-userID");

    $('#admission-nav').on('click', function (e) {
        e.preventDefault();
        if(!$(this).hasClass('d-none')) {
            $('#preinscription-response-section').removeClass('d-none');
            $('#preinscription-candidature-section').addClass('d-none');
            $('#se-preinscrire-nav').removeClass('active');
            $(this).addClass('active');
            bool ? $('#se-preinscrire-nav').addClass('disabled').attr('aria-disabled', true) : '';
            history.pushState({}, null, `response-candidature/${userID}`);
        }
    });

    $('#se-preinscrire-nav').on('click', function (e) {
        e.preventDefault();
        if(!$(this).hasClass('d-none')) {
            $('#preinscription-response-section').addClass('d-none');
            $('#preinscription-candidature-section').removeClass('d-none');
            $('#admission-nav').removeClass('active');
            $(this).addClass('active');
            history.replaceState({}, null, `home`);
        }
    });

    window.addEventListener('popstate', function () {
        const path = location.pathname;
        if(path.includes('response-candidature')) {
            $('#preinscription-response-section').removeClass('d-none');
            $('#preinscription-candidature-section').addClass('d-none');
            $('#se-preinscrire-nav').removeClass('active');
            $('#admission-nav').addClass('active');
        } else {
            $('#preinscription-response-section').addClass('d-none');
            $('#preinscription-candidature-section').removeClass('d-none');
            $('#admission-nav').removeClass('active');
            $('#se-preinscrire-nav').addClass('active');
        }
    });
}

const displayResponsePage = () => {
    const userID = $('#user-data-information').attr("data-userID");
    $('#preinscription-response-section').removeClass('d-none');
    !$('#preinscription-candidature-section').hasClass('d-none') ? $('#preinscription-candidature-section').addClass('d-none') : '';
    $('#se-preinscrire-nav').removeClass('active');
    $('#admission-nav').addClass('active');
    $('#se-preinscrire-nav').addClass('disabled').attr('aria-disabled', true);
    history.pushState({}, null, `response-candidature/${userID}`);
    spinner(false)
}

const spinner = (bool) => {
    if(bool) {
        $('#spinner').removeClass('d-none');
    } else {
        $('#spinner').addClass('d-none');
    }
}