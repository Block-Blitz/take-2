# Block Blitz

Block Blitz a puzzle game allowing you to play competitively or solo. Rearrange the puzzle pieces to complete the images. When playing competitlively winning against your opponent will increase your stats.

## Contributors
- Mark Zsombor
- Kelsey Cooper
- Catherine Hrynuik
- Reid Naaykens

## Getting Started

  These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. Visit [blockblitz.live](http:blockblitz.live) to see the deployed app.

  ## *Clone or download project*

  ### *Download*


   click `Clone or Download` at the top of this page

  #### *Via SSH*


   In your command line run `git clone git@github.com:Block-Blitz/take-2.git <dir_name>`
   
  ### *Install Dependancies*
  
   In the program directory run `npm install` 
   
  ### *Set up database*

   Create a `.env` file by using `.env.example` as a reference: `cp .env.example .env`
   
   Create a Postgres database `createdb <db_name>`
   
   Update the `.env` file with database name.

   Run migrations `knex migrate:latest`
   
  ### *Start server*
  
   Type `npm start` in your command line.

  ### *Open application in your browser*


   `localhost:8080`





## Dependencies

  - bcrypt
  - body-parser
  - concurrently
  - connect-flash
  - cookie-session
  - dotenv
  - draggabilly
  - ejs
  - express
  - jquery
  - knex
  - knex-logger
  - morgan
  - node-sass
  - node-sass-middleware
  - packery
  - pg
  - socket.io
  - socket.io-client
  - uuid
  - swearjar


## Images from the Application

Homepage
!["Screenshot of homepage"](https://github.com/Block-Blitz/take-2/blob/master/public/images/read%20me%20screenshots/homepage.png?raw=true)

Login page
!["Screenshot of login_page"](https://github.com/Block-Blitz/take-2/blob/master/public/images/read%20me%20screenshots/login_page.png?raw=true)

Register page
!["Screenshot of register_page"](https://github.com/Block-Blitz/take-2/blob/master/public/images/read%20me%20screenshots/register_page.png?raw=true)

User dashboard
!["Screenshot of user_dashboard"](https://github.com/Block-Blitz/take-2/blob/master/public/images/read%20me%20screenshots/user_dashboard.png?raw=true)

Game play view
!["Screenshot of game_play_view"](https://github.com/Block-Blitz/take-2/blob/master/public/images/read%20me%20screenshots/game_play_view.png?raw=true)

Game winner view
!["Screenshot of game_winner_view"](https://github.com/Block-Blitz/take-2/blob/master/public/images/read%20me%20screenshots/game_winner_view.png?raw=true)

Game loser view
!["Screenshot of game_loser"](https://github.com/Block-Blitz/take-2/blob/master/public/images/read%20me%20screenshots/game_loser_view.png?raw=true)
