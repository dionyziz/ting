Ting is a chat platform.

* To learn what the vision for ting is, see /etc/spec/SPECIFICATION.md.
* For the technical architecture, see /etc/spec/ARCHITECTURE.md.
* We have a bug database. Ask for access to our trello board. Pick a bug and
  fix it.
* We use [ting.gr/dev](http://ting.gr/dev) and a Facebook chat for development
  team discussions. Ask for access.

Running Ting
============
1. git clone
2. Set up a MySQL database
3. Make a copy of `config/common.json` into `config/local.json` and add your
   settings.
4. Install the dependencies required to run Django requirements installation
   by running `sudo apt-get install python-dev libmysqlclient-dev libffi-dev` and 
   `pip install MySQL-python`
5. Go to API/  and run `pip install -r requirements.txt` to install all the dependencies of 
   Django server.
6. Run the Django server using `python manage.py runserver` inside the `API`
   folder. If it asks you to run migrations, do it.
7. Install the required dependencies for the node server and the client by running
   `npm install` in client/ and realtime/. Then `bower install` in client/.
   (Please note that some dependencies like bower or gulp may not be working through 
   the absolute path so `PATH=$(npm bin):$PATH` should solve the problem.)
8. Run the node service using `node server.js` or `forever start server.js` inside the
   `realtime` folder.
9. Build the client-side bundle with `gulp browserify` inside the `client`
   folder. Or run `gulp watchify` if you plan to edit the client-side source.
10. Set up nginx to statically serve the `client` folder.

Contributing
============
* Work on your own fork.
* Never push to the main repo. Always create a feature branch and pull request.
* You need an LGTM to merge. All review comments must be resolved even if you
  have an LGTM.
* A pull request can be merged by the author or by the reviewer giving the
  LGTM.
* Make sure your commits are clean and atomic. Commit messages must be
  descriptive. Rebase if you have to.

Authors
=======
Alphabetically.

* Aleksis Brezas
* Carolina Alexiou
* Dimitris Lamprinos
* Dionysis Zindros
* Eleni Lixourioti
* Kostis Karantias
* Petros Angelatos
* Vitalis Salis
