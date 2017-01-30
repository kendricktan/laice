Legend:
# Comments #
> Local desktop actions
$ Global server actions
- External actions

- GIT FORK  https://github.com/kendricktan/laice.git
# Local Setup #
> git clone https://github.com/navnn/laice.git
> git checkout -b dev
> cd laice
> npm install -g bower
> npm install -g gulp
> npm install
> bower install
> gulp
> pip install -r requirements.txt
> python -m spacy.en.download --force all
> python manage.py migrate

# Local Run on http://127.0.0.1:8000 # 
> python manage.py runserver
> git push origin dev


# Global Setup #
$ git clone https://github.com/navnn/laice.git
$ git checkout -b dev
$ cd laice
$ npm install -g bower
$ bower install
$ pip3 install -r requirements.txt
$ python3 -m spacy.en.download --force all
$ python3 manage.py migrate

# Global Run #
$ python3 manage.py runserver
$ git pull origin dev
