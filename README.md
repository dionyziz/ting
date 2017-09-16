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
4. Install node package manager and the dependencies required to run Django 
   installation by running `sudo apt-get install python-dev libmysqlclient-dev
   libffi-dev python-pip npm`.
5. Make a virtual python environment using `virtualenv venv` on the API/ folder.
   We recommend this because the API will use its own copies of python and of the
   required dependencies, so you can update your libraries in your system
   without worrying that you might "break" the API.
   In order to use the virtual environment you only have to run `source venv/bin/activate`
   when you want to run python or pip. To deactivate it you can just run `deactivate`
   or close the terminal.
6. Run `pip install MySQL-python`.
7. Go to API/  and run `pip install -r requirements.txt` to install all the dependencies of 
   Django server.
8. Run the Django server using `python manage.py runserver` inside the `API`
   folder. If it asks you to run migrations, do it.
9. Install bower by running `sudo npm install -g bower`.
   Install the required dependencies for the node server and the client by
   running `npm install` in client/ and realtime/. Then `bower install` in client/.
   (Please note that some dependencies like bower or gulp may not be working through 
   the absolute path so `PATH=$(npm bin):$PATH` should solve the problem.)
10. Run the node service using `node server.js` or `forever start server.js` inside the
   `realtime` folder.
11. Build the client-side bundle with `npm run build` inside the `client`
   folder. Or run `npm run watch` if you plan to edit the client-side source.
12. Set up nginx to statically serve the `client` folder.

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
