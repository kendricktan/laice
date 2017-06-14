<p align="center">
  <a href="#">
    <img alt="laice" src="https://i.imgur.com/HmvI1JP.png" width="128"><br/>    
  </a>
  <sub>Icon by <a href="http://www.flaticon.com/authors/simpleicon">simpleicons</a></sub>
</p>

<p align="center">
    Train your own Natural Language Processor straight from your browser!
</p>


---

## What?
Laice allows you to build, train, and classify your own sentences via a Web UI. 
Laice can also communicate with your applications through a RESTful API.

In other words, laice aims to be a free, open sourced alternative to  <a href="http://api.ai">api.ai</a>, <a href="http://luis.ai">luis.ai</a>, and <a href="http://wit.ai">wit.ai</a>

Laice turns words into meanings (with enough training data), for example:

- `Jack lives in Berlin` -> `{'person': 'Jack', 'location': 'Berlin'}`
- `Tutu really likes bananas` -> `{'person': 'Tutu', 'food': 'bananas'}`
- `Close the door` -> `{'action': 'close', 'object': 'door'}`

---
 
## Getting started

```
git clone https://github.com/kendricktan/laice.git
cd laice

npm install -g bower
bower install

pip3 install -r requirements.txt

# Optional, doing this will yeild more accurate
# predictions, however will have a slower startup
# time. Its downloading pre-processed data.
python3 -m spacy.en.download --force all 
python3 manage.py migrate
python3 manage.py runserver
```

Then navigate to `http://127.0.0.1:8000` to view your own Natural Language Processor!

---

## Contributing

Currently we're using `React` frontend coupled with a `django` backend. JavaScript files are written in `jsx` and then compiled to `js` using gulp.

### Frontend
To get started with frontend development, make sure you have `npm`, `bower`, `gulp` installed globally.

```
npm install -g bower
npm install -g gulp
npm install
bower install
gulp
```

### Backend
To get started with backend development, make sure you have installed everything in the requirements installed
```
pip install -r requirements
```

---

