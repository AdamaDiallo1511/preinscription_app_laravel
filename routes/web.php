<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use app\Models\feedback;
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


Route::put('fill-user-information/{user}', function (User $user, App\Http\Requests\UserDataRequest $request) {
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