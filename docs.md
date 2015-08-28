# bitauth docs

## introduction
Thank you for choosing to use bitauth, that means everything to me. Here you will find the API documentation etc. I hastily wrote so that it is easier to implement it in your own projects. I have tried to follow the oauth2 specs as closely as possible but to make development faster I have also done some minor changes that you can find here. It will be divided into two main parts, first one is the tl;dr implementation guide, second is more or less the exact API endpoints.

## semi-current spec
Currently only the code > token exchange part of the oauth2 spec is implemented in a semi-secure fashion. That's why I still currently do not recommend using the code in any project that needs a secure oauth2 implementation.

* code > token exchange (only secure for client + server implementations) 
* nicely designed UI for the oauth2 process

## // todo
* Improve security
* Improve login/registration UI
* Implement rest of the oauth2 spec like server-less auth
* Fix admin UI
* Remove setTimeouts...bad practice... \o/

## api

### /oauth/auth   // get code 
#### Input:
* [GET]           str respnse_type
* [GET]           str client_id

#### Response:
* [QUERY]         str code
* [QUERY]         str error // if error //


### /token        // code > token exchange
#### Input:
* [GET/POST]      str code
* [GET/POST]      str client_id
* [GET/POST]      str client_secret

#### Response:
* [JSON]          str access_token