const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// exports.signup = (req, res) => {
//   // console.log("REQ BODY ON SIGNUP", req.body);
//   const { name, email, password } = req.body;

//   User.findOne({ email }).exec((err, user) => {
//     if (user) {
//       return res.status(400).json({
//         error: "Email is taken",
//       });
//     }
//   });

//   let newUser = new user({ name, email, password });
//   newUser.save((err, success) => {
//     if (err) {
//       console.log("Sign Up Error", err);
//       return res.status(400).json({
//         error: err,
//       });
//     }

//     res.json({
//       message: "Signup success! Please Signin!",
//     });
//   });
// };

exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is taken",
      });
    }

    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "10m" }
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: "sagarkhot95722@gmail.com",
      subject: "Account Activation Link",
      html: `
            <h1>Please use the following link to activate your account</h1>
            <p> ${process.env.CLIENT_URL}/auth/activate/${token}</p>
            <hr />
            <p>This email may contain sesitive information</p>
            <p>${process.env.CLIENT_URL}</p>
        `,
    };

    sgMail
      .send(emailData)
      .then((sent) => {
        console.log("Sign up email sent: ", sent);
        return res.json({
          message: `Email has been sent to ${email}. Follow the instructions to activate your account.`,
        });
      })
      .catch((err) => {
        return res.json({
          message: err.message,
        });
      });
  });
};

exports.accountActivation = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (
      err,
      decoded
    ) {
      if (err) {
        console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERROR: ", err);
        return res.status(401).json({
          error: "Expired Link. Signup again",
        });
      }

      const { name, email, password } = jwt.decode(token);

      const user = new User({ name, email, password });

      user.save((err, user) => {
        if (err) {
          console.log("Save User in Account Activation Error: ", err);
          return res.status(401).json({
            error: "Error saving user in database. Try signup again.",
          });
        }

        return res.json({
          message: "Signup success. Please Sign in",
        });
      });
    });
  } else {
    return res.json({
      message: "Something went wrong. Try again.",
    });
  }
};

exports.signin = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exists. Please Signup",
      });
    }

    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and Password do not match",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const { _id, name, email, role } = user;

    return res.json({
      token,
      user: { _id, name, email, role },
    });
  });
};

exports.requireSignin = expressJWT({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

exports.adminMiddleware = (req, res, next) => {
  User.findById({ _id: req.user._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(400).json({
        error: "Admin Resource. Access Denied.",
      });
    }

    req.profile = user;
    next();
  });
};
