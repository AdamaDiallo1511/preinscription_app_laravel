@extends('layouts.app')

@section('content')
<div class="spinner-border position-absolute top-50 start-50" role="status" id="spinner">
    <span class="visually-hidden">Loading...</span>
  </div>
     <div class="container" id="home-blade-file" data-isAdmin="{{$is_admin}}">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">{{ __('Dashboard') }}</div>

                <div class="card-body">
                    @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endif
                    @if(auth()->user()->is_admin == 1)
                    @include('admin-template')
                    @else
                    <div class=”panel-heading”>Normal User</div>
                    @section('content')
                    @include('preinscription-reponse')
                    @endsection
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@if(auth()->user()->is_admin == 0)
@section('navbar')
<li class="nav-item">
    <a class="nav-link active" aria-current="page" href="#" id="se-preinscrire-nav">Se preinscrire</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#" id="admission-nav">Admission</a>
  </li>
@endsection
@endif
