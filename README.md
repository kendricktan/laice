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

In other words, laice aims to be a free, open sourced alternative to  <a href="http://wit.ai">api.ai</a>, <a href="http://wit.ai">luis.ai</a>, and <a href="http://wit.ai">wit.ai</a>

---
 
## Getting started

```
git clone https://github.com/kendricktan/laice.git
cd laice

npm install -g bower
bower install

pip3 install -r requirements.txt
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

