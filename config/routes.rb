Blippity::Application.routes.draw do
  devise_for :users, :controllers => { :omniauth_callbacks => "users/omniauth_callbacks" }

  resources :question_answers

  resources :levels do 
    resources :question_answers
  end

  
  match '/play', :to => 'games#play'

  match '/about', :to => 'pages#about'
  root :to => 'pages#index'
end
