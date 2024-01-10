import { data, error } from "jquery";

const userID = $('#user-data-information').attr("data-userID")
export function getData() {
    $('.form-submit').each( function () { 
        $(this).on('submit', function (e) {
            e.preventDefault();
        });
    });
    
}

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
       return await submitData(`fill-user-information/${userID}`, data, 'PUT').then(response => console.log(response)).catch(error => console.error(error));
      
    })
}

export async function submitData(url, data, type) {
    try {
        const response = await  $.ajax(url, {
            type: type,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                //'Content-Type':'JSON.stringify'
                'Content-Type':'application/json'
            },
            data: JSON.stringify(data),
        })
        return response
    } catch (error) {
        throw error
    } 
}

export async function submitFeedback(){
    $('#btn-submit-feedback').on('click', async function() {

    const userID = $('#user-data-information').attr("data-userID")
    const data = {
        feedback:$('#user-feedback').val(),
        create_at : new Date()
    }
    return await submitData(`submit-feedback/${userID}`, data, 'POST').then(response => console.log(response)).catch(error => console.error(error));
})
}