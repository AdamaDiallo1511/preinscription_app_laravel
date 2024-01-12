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
        return response()->json(['success'=> true]);
    } else {
        return response()->json(['success'=> false]);
    }
});

Route::post('submit-feedback/{user}', function (App\Models\feedback $feedback, App\Http\Requests\FeedBackRequest $request) {
    $create_feedback =  $feedback->create($request -> validated());
    if ($create_feedback) {
        return response()->json(['success'=> true, 'id' => $create_feedback-> id]);
    } else {
        return response()->json(['success'=> false]);
    }
});
// routes/web.php

Route::post('upload-document/{user}', 'App\Http\Controllers\DocumentController@upload');

Route::get('/documents/{user}/download', 'App\Http\Controllers\DocumentController@download');

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

