@extends('layouts.app')

@section('content')
<div class="container">
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

                    {{ __('You are logged in!') }}
                    @if(auth()->user()->is_admin == 1)
                    <a href="{{url('admin/routes')}}">Admin</a>
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

@section('navbar')
<li class="nav-item">
    <a class="nav-link active" aria-current="page" href="#" id="se-preinscrire-nav">Se preinscrire</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#" id="admission-nav">Admission</a>
  </li>
@endsection
