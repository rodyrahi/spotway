const con = require('./database.js');
const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    secret: 'YourSecretKey',
    resave: false,
    saveUninitialized: false,
  })
);

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    con.query(query, (err, result, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

app.get('/', (req, res) => {
  res.render('home');
});

app.post('/home', async (req, res) => {
  console.log(req.body);


  const result = await executeQuery(`SELECT * FROM profile WHERE contact='${req.session.phoneNumber}'`)
 
  if (randomCode === req.body.otp && result<1) {
    res.render('createuser');
  }else{
    res.redirect('/dashboard')
  }
});


app.get('/dashboard', async (req, res) => {

  console.log(req.session.phoneNumber);
    if (req.session.phoneNumber) {
      const result = await executeQuery(`SELECT * FROM profile WHERE contact='${req.session.phoneNumber}'`)
      console.log(result);
      res.render('dashboard' , {user:result[0]});
  
    }
    else{
      res.send(500)

    }
  });



app.post('/dashboard', async (req, res) => {
  const { name, gender, city } = req.body;

  await executeQuery(
    `UPDATE profile SET name = '${name}', gender = '${gender}', city = '${city}' WHERE contact = '${req.session.phoneNumber}'`
  );

  res.redirect('/dashboard');
});




app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/profile', async (req, res) => {

  console.log(req.session.phoneNumber);
    if (req.session.phoneNumber) {
      const result = await executeQuery(`SELECT * FROM profile WHERE contact='${req.session.phoneNumber}'`)
      console.log(result);
      res.render('profile' , {user:result[0]});
  
    }
    else{
      res.send(500)

    }
  });





let randomCode;

app.post('/otp', async (req, res) => {
  try {
    console.log(req.body);
    req.session.phoneNumber = req.body.phone;

    const result = await executeQuery(`SELECT * FROM profile WHERE contact='${req.session.phoneNumber}'`)
    console.log(result , 'this');
    if (result.length ===0) {
      await executeQuery(`INSERT INTO profile (contact) VALUES ('${req.body.phone}')`);

    }

    const generateRandomCode = () => {
      const codeLength = 3;
      let code = '';
      for (let i = 0; i < codeLength; i++) {
        code += Math.floor(Math.random() * 10); // Generate a random digit (0-9)
      }
      return code;
    };

    randomCode = generateRandomCode();
    console.log(randomCode);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling OTP:', error);
    res.sendStatus(500);
  }
});

app.listen(6633, () => {
  console.log('Server is running on port 6663');
});
