var express = require("express");
var Usuario = require("./models/usuario");
var Cita = require("./models/citas");
var Pdf= require("./models/pdf");

var passport = require("passport");
var acl = require("express-acl");

var multer=require("multer");
/*const upload=multer({
    dest:'expedientes/'
});*/
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, 'expedientes/');
    },
    filename: function (req, file, callback) {
      callback(null, file.fieldname + '.pdf');
    }
  });
  var upload = multer({ storage : storage });
var router = express.Router();

acl.config({
    baseUrl:'/',
    defaultRole:'usuario',
    decodedObjectName:'usuario',
    roleSearchPath: 'usuario.role'
  
});

router.use((req, res, next) =>{
    res.locals.currentUsuario = req.usuario;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    if(req.session.passport){
        if(req.usuario){
            req.session.role = req.usuario.role;
        } else {
            req.session.role = "usuario";
        }
    }
    console.log(req.session);
    next();
});

router.use(acl.authorize);

router.get("/", (req, res, next) =>{
    Usuario.find()
        .sort({ createdAt: "descending"})
        .exec((err, usuarios) => {
            if(err){
                return next(err);
            }
            res.render("index", {usuarios: usuarios});
        });
});

router.get("/usuarios/:username",(req,res,next) =>{
    Usuario.findOne({ username: req.params.username } , (err,usuario) => {
        if(err){
            return next(err);
        }
        if(!usuario){
            return next(404);
        }
        res.render("profile",{ usuario:usuario });
    });
});

router.get("/signup", (req, res) =>{
    res.render("signup");
});

router.post("/signup",(req, res, next)=>{
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;

    Usuario.findOne({ username: username}, (err, usuario) =>{
        if(err){
            return next(err);
        }
        if(usuario){
            req.flash("error", "El nombre de usuario ya esta ocupado");
            return res.redirect("/signup");
        }
        var newUsuario = new Usuario({
            username: username,
            password: password,
            role: role
        });
        newUsuario.save(next);
        return res.redirect("/");
    });
});



router.get("/addCitas", (req, res) =>{
    res.render("addCitas");
});

router.post("/addCitas",(req, res, next)=>{
    var paciente_nombre = req.body.paciente_nombre;
    var paciente_apellidoP = req.body.paciente_apellidoP;
    var paciente_apellidoM = req.body.paciente_apellidoM;
    var telefono = req.body.telefono;
    var fecha=req.body.fecha;

    Cita.findOne({ paciente_nombre: paciente_nombre }, (err, cita) =>{
        if(err){
            return next(err);
        }
        var newCita = new Cita({
            paciente_nombre: paciente_nombre,
            paciente_apellidoP: paciente_apellidoP,
            paciente_apellidoM: paciente_apellidoM,
            telefono: telefono,
            fecha: fecha
        });
        newCita.save(next);
        return res.redirect("/citas");
    });
});

router.get("/citas", (req, res, next) =>{
    Cita.find()
        .exec((err, citas) => {
            if(err){
                return next(err);
            }
            res.render("citas", {citas: citas});
        });
});


router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", passport.authenticate("login",{
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});
/*router.get("/addExp",(req,res)=>{
    res.sendFile(__dirname+"/expedientes/archivo.txt");
});*/
router.get("/addExp", (req, res) => {
    res.render("addExp");
});

router.post("/addExp",upload.single('Archivo'),(req, res)=>
{
    return res.redirect("/");

});
router.get("/edit", ensureAuthenticated,(req,res) => {
    res.render("edit");
});

router.post("/edit", ensureAuthenticated, (req, res, next) => {
    req.usuario.username = req.body.username;
    req.usuario.telefono = req.body.telefono;
    req.usuario.save((err) => {
        if(err){
            next(err);
            return;
        }
        req.flash("info", "Perfil actualizado!");
        res.redirect("/edit");
    });
});


function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        next();
    } else{
        req.flash("info", "Necesitas iniciar sesión para poder ver esta sección");
        res.redirect("/login");
    }
}


module.exports = router;