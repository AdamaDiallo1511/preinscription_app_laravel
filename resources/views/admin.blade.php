@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Dashboard</div>
                <div class="card-body">
                    @if(auth()->user()->is_admin == 1)
                        @include('admin-template')
                    @else
                    <div class=”panel-heading”>Normal User</div>
                    @include('preinscription-reponse')
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection