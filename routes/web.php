<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\feedback;
use App\Models\formations;
use App\Models\validate_formations;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');
Route::get('admin/home', [HomeController::class, 'adminHome'])->name('admin.home')->middleware('is_admin');


Route::put('submit-user-information/{user}', function (User $user, App\Http\Requests\UserDataRequest $request) {
    $updateSuccess = $user->update($request->validated());
    if ($updateSuccess) {
        App\Models\validate_users_informations::where('user', $user->id)->update(['validate_users_information' => 1]);
        return response()->json(['success'=> true]);
    } else {
        return response()->json(['success'=> false]);
    }
});

Route::post('submit-feedback/{user}', function ($user ,App\Models\feedback $feedback, App\Http\Requests\FeedBackRequest $request) {
    $create_feedback =  $feedback->create($request -> validated());
    if ($create_feedback) {
        App\Models\validate_feedback::where('user', $user)->update(['validate_feedback' => 1]);
        return response()->json(['success'=> true, 'id' => $create_feedback-> id]);
    } else {
        return response()->json(['success'=> false]);
    }
});
// routes/web.php

Route::post('upload-document/{user}', 'App\Http\Controllers\DocumentController@upload');

Route::get('documents-download/{user}', 'App\Http\Controllers\DocumentController@download');

Route::get('get-list-formation/', function () {
    $records = formations::select(
        'id',
        'nom_formation',
        'cout_formation',
        DB::raw("
            (CASE 
                WHEN periode_cycles_id = 7 THEN 'Licence 1'
                WHEN periode_cycles_id = 8 THEN 'Licence 2'
                WHEN periode_cycles_id = 9 THEN 'Licence 3'
                WHEN periode_cycles_id = 10 THEN 'Master 1'
                WHEN periode_cycles_id = 11 THEN 'Master 2'
                WHEN periode_cycles_id = 12 THEN 'Ingenieur'
            END) AS cycle
        "),
        DB::raw("
            (CASE 
                WHEN departements_id = 1 THEN 'Genie-Informatique'
                WHEN departements_id = 2 THEN 'Reseaux & systemes'
            END) AS departement
        ")
    )->orderBy('cycle', 'asc')->orderBy('departement', 'asc')->get();
    return  response()->json($records, JSON_UNESCAPED_UNICODE);
});

Route::post('add-formation/{user}/', function (App\Models\validate_formations $validate_formations, App\Http\Requests\ValidateFormationRequest $request) {
    $validate_formations->fill($request->validated());
    $formation_validated =  $validate_formations->save();
    if ($formation_validated) {
        return response()->json(['success'=> true, 'id' => $validate_formations->id]);
    } else {
        return response()->json(['success'=> false]);
    }
});

Route::delete('delete-formation/{id}/', function (App\Models\validate_formations $deleted_validate_formations, $id) {
    $deleted_success = $deleted_validate_formations->where('id', $id)->delete();
    if ($deleted_success) {
        return response()->json(['success'=> true]);
    } else {
        return response()->json(['success'=> false]);
    }
});

Route::get('user-submission-detail/{user}', function ($user) {
    $validate_users_informations = App\Models\validate_users_informations::select('validate_users_information')->where('user', $user)->distinct()->get();
    $formations_selected = App\Models\validate_formations::select('id as candidatureID' ,'formation as formation_id')->where('user', $user)->distinct()->get();
    $validate_users_documents = App\Models\validate_documents::select('document')->where('user', $user)->distinct()->get();
    $validate_feedback = App\Models\validate_feedback::select('validate_feedback')->where('user', $user)->distinct()->get();
    $candidatez_preinscriptions = App\Models\candidatez_preinscription::select('candidated')->where('user', $user)->distinct()->get();
    $user_information = App\Models\User::select('id as user_id' , 
                                                'name',
                                                'surname',
                                                'country',
                                                'province',
                                                'city_of_birth',
                                                'sex')->where('id', $user)->get();
    $feedback = App\Models\feedback::select('id as feedback_id' ,'feedback')->where('user', $user)->distinct()->get();
    $document_id = App\Models\documents::select('id as document_id')->where('user', $user)->distinct()->get();
    $preinscription_statut = DB::table('statut_preinscriptions')
    ->join('preinscriptions', 'statut_preinscriptions.preinscription', '=', 'preinscriptions.id')
    ->join('formations', 'formations.id', '=', 'preinscriptions.formation')
    ->select('statut_preinscriptions.*', 'preinscriptions.*')
    ->whereIn('statut_preinscriptions.preinscription', function($query) use ($user) {
        $query->select('id')->from('preinscriptions')->where('user', $user);
    })
    ->get();


    return  response()->json([
        'validate_users_informations' => empty($validate_users_informations[0]) ? 0 : $validate_users_informations[0],
    'validate_users_documents' => empty($validate_users_documents[0]) ? 0 : $validate_users_documents[0],
    'validate_feedback' => empty($validate_feedback[0]) ? 0 : $validate_feedback[0],
    'candidatez_preinscriptions' => empty($candidatez_preinscriptions[0]) ? 0 : $candidatez_preinscriptions[0],
    'user_information' => empty($user_information[0]) ? 0 : $user_information[0],
'feedback' => empty($feedback[0]) ? null : $feedback[0],

        'formations_selected' => $formations_selected,
        'document_id' => $document_id,
        'preinscription_statut' => $preinscription_statut
    ], 200);
});

Route::post('submit-candidature/', function (App\Http\Requests\MakePreincriptionRequest $request) {
    $validated = $request->validated();
    $validated['document'] = json_encode($validated['document']);

    // Create a new Preinscription record and get its id
    $create_preinscription = App\Models\Preinscription::create($validated);

    if ($create_preinscription) {
        // Use the id of the newly created Preinscription record to create a new StatutPreinscription record
        App\Models\statut_preinscription::create(['preinscription' => $create_preinscription->id]);

        return response()->json(['success'=> true, 'id' => $create_preinscription->id]);
    } else {
        return response()->json(['success'=> false]);
    }
});

Route::get('response-candidature/{user}', function ($user) {
    $preinscription_statut = DB::table('statut_preinscriptions')
    ->join('preinscriptions', 'statut_preinscriptions.preinscription', '=', 'preinscriptions.id')
    ->join('formations', 'formations.id', '=', 'preinscriptions.formation')
    ->select('statut_preinscriptions.*', 'preinscriptions.*')
    ->whereIn('statut_preinscriptions.preinscription', function($query) use ($user) {
        $query->select('id')->from('preinscriptions')->where('user', $user);
    })
    ->get();
    return  response()->json($preinscription_statut, 200);
});

Route::put('validate-candidature/{user}', function ($user, App\Http\Requests\MakeConfirmeCandidatureRequest $request) {
    $candidatez_preinscription = App\Models\candidatez_preinscription::where('user', $user)->first();

    if ($candidatez_preinscription) {
        $updateSuccess = $candidatez_preinscription->update($request->validated());
        if ($updateSuccess) {
            return response()->json(['success'=> true]);
        } else {
            return response()->json(['success'=> false]);
        }
    } else {
        return response()->json(['error'=> 'Model not found']);
    }
});

Route::get('preinscriptions-list/', function () {
    $data = DB::table('statut_preinscriptions')
    ->join('preinscriptions', 'statut_preinscriptions.preinscription', '=', 'preinscriptions.id')
    ->join('formations', 'formations.id', '=', 'preinscriptions.formation')
    ->select('statut_preinscriptions.*', 'preinscriptions.*', 'formations.id', 'statut_preinscriptions.id as statut_preinscriptions_id')
    ->get();
    return  response()->json($data, 200);
});

Route::put('confirme-preinscription/{preinscription}', function ($preinscriptionId, App\Http\Requests\MakePreincriptionStatutRequest $request) {
    $statut_preinscription = \App\Models\statut_preinscription::find($preinscriptionId);
    if ($statut_preinscription) {
        $updateSuccess = $statut_preinscription->update($request->validated());
        if ($updateSuccess) {
            return response()->json(['success'=> true]);
        } else {
            return response()->json(['success'=> false]);
        }
    } else {
        return response()->json(['success'=> false, 'message' => 'Preinscription status not found']);
    }
});



