const express = require('express');
const router = express.Router();
const fs = require('fs');

const userlist = fs.readFileSync("userlist.txt").toString().split("\n")

function memorability(suffix) {
  let score = 0;
  score -= suffix.length;
  score -= 3*(new Set(suffix)).size;

  let ascending = true;
  let descending = true;
  let maxgap = 0;
  for(let i = 1; i < suffix.length; i++) {
    ascending &&= (suffix.charCodeAt(i-1) <= suffix.charCodeAt(i));
    descending &&= (suffix.charCodeAt(i-1) >= suffix.charCodeAt(i));
    maxgap = Math.max(Math.abs(suffix.charCodeAt(i-1) - suffix.charCodeAt(i)))
  }

  score += ascending * 0.5 + descending * 0.1 + (maxgap<=1);
  return score;
}

function randpermut(names, x) {
  if(names.length > 1 && Math.random() > 0.25) {
    n1 = Math.floor(Math.random()*names.length);
    n2 = Math.floor(Math.random()*(names.length-1));
    j = Math.random();
    if(n2 >= n1) {
      n2 += 1
    }
    m = Math.random();
    let s1 = names[n1];
    if(names[n1].length > 4) {
      s1 = names[n1].slice(0,1+Math.floor(Math.random()*5));
    } else if(Math.random() < 0.1) {
      s1 = names[n1][0];
    } else if(Math.random() < 0.1) {
      s1 = names[n1].slice(0, 3);
    }
    let s2 = names[n2];
    if(names[n2].length > 4) {
      s2 = names[n2].slice(0, Math.floor(Math.random()*5));
    } else if(Math.random() < 0.1) {
      s2 = names[n2][0];
    } else if(Math.random() < 0.1) {
      s2 = names[n2].slice(0, 3);
    }
    return s1 + (j < 0.333 ? "_" : (j < 0.667 ? "." : "")) + s2 + (Math.random() < 0.6 ? "" : x);
  } else {
    return names[0].slice(0, 15-x.length) + x;
  }
}

function sugerencias(username, name, n) {
  let names = name
              .replace("á", "a")
              .replace("é", "e")
              .replace("í", "i")
              .replace("ó", "o")
              .replace("ú", "u")
              .replace("ñ", "n")
              .replace("ü", "u")
              .split(" ");

  let addUsername = true;
  for(let name of names) {
    if(username.indexOf(name) != -1) {
      addUsername = false;
      break;
    }
  }
  if(addUsername) {
    let uns = [];
    for(let s of username.match("[a-z]+")) {
      uns.push(s);
    }
    names = [...uns, ...names];
  }

  let recs = Array(n);
  for(let i = 0; i < recs.length; i++) {
    recs[i] = ""+ Math.floor(Math.random()*10);
    for(let j = 0; j < 2; j++) {
      if(Math.random() < 0.5) {
        recs[i] += Math.floor(Math.random()*10);
      }
    }
  }
	recs = [...new Set(recs)];
  return recs.sort((a, b) => memorability(b) - memorability(a)).map(
    x => randpermut(names, x)
  );
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('nuevoUsuario', { title: 'Crear usuario', error: undefined , suggestions: null});
});

router.post('/', function(req, res, next) {
  const username = req.body.username.toLowerCase()
  const name = req.body.name.toLowerCase()

  if(username.match(/^[a-z0-9_][a-z0-9._]{5,13}[a-z0-9_]$/g) == null) {
    res.render('nuevoUsuario', { title: 'Crear usuario', error: "Nombre de usuario no válido" , suggestions: null});
  } else {
    if(userlist.indexOf(username) === -1) {
      userlist.push(username);
      res.redirect('/');
    } else {
      let sug = sugerencias(username, name, 20);
      sug = sug.filter((x) => userlist.indexOf(x) == -1);
      sug = sug.filter((x) => x.match(/^[a-z0-9_][a-z0-9._]{5,13}[a-z0-9_]$/g) != null);
      res.render('nuevoUsuario', { title: 'Crear usuario', error: "Nombre de usuario no disponible" , suggestions: sug.slice(0,6)});
    }
  }
})

module.exports = router;
