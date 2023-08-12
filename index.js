const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv").config()
const bcrypt = require("bcrypt")
const bcryptSalt = bcrypt.genSalt(10)

const app = express()
app.use(cors())
app.use(express.json({limit : "10mb"}))

//mongo db connection
console.log(process.env.MONGODB_URL)
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URL)
.then(()=>console.log("Connected to Database"))
.catch((err)=>console.log(err))

const PORT = process.env.PORT || 5000 
app.get("/",(req,res)=>{
    res.send("Server is running")
}) 
const userSchema = mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  Gnumber: String,
  guardian: String,
  password: String,
  degree: String,
  course: String,
  altcourse: String,
  agent: String,
  nationality: String,
  stream: String,
})
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};
const plaintextPassword = 'password123';
const hashedPassword = '$2b$10$S5i9BhZNMw5q4YXK7I2hbejiU4o/1l0h3pAJ3FVcz/8GOELgCQf7W';

bcrypt.compare(plaintextPassword, hashedPassword, (err, result) => {
if (err) {
  console.error(err);
} else {
  if (result) {
    console.log('Password matches');
  } else {
    console.log('Password does not match');
  }
}
});
const userModel = mongoose.model("user",userSchema)
module.exports = userModel;

//register api
app.post("/register",(req,res)=>{
  console.log(req.body)
  const {email} = req.body
  userModel.findOne({email : email},(err,result)=>
  {
      console.log(result)
      console.log(err)
      if(result){
          res.send({message: "Email already registered",alert : false})
      }
      else{
          const data = userModel(req.body)
          const save = data.save()
          res.send({message: "Registration is Successful",alert : true})
      }
  })
})

// Login api
app.post("/login", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email: email }).exec();
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (passwordMatch) {
        const dataSend = {
          name: user.name,
          email: user.email,
        };
        res.status(200).send({ message: "Login is Successful", alert: true, data: dataSend });
      } else {
        res.status(500).send({ message: "Invalid email or password", alert: false });
      }
    } else {
      res.send({ message: "Email is not Registered, Please SignUp", alert: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error", alert: false });
  }
});
const schemaProduct = mongoose.Schema({
  title : String,
  address : String,
  category2: String,
  photos : [String],
  perks : [String],
  category : String,
  description : String,
  price: String,
  Videolink:String,
})
const PlaceModel = mongoose.model("university",schemaProduct)
//upload product in db
app.post("/upload",async(req,res)=>{ 
  console.log(req.body)
  const data = await PlaceModel(req.body)
  const datasave = await data.save()
   res.send({message : "University details uploaded"})
}) 
 //displaying the product on frontend
 app.get("/universities",async(req,res)=>{
  const data = await PlaceModel.find({})
  res.send(JSON.stringify(data))
})
const bookingSchema = new mongoose.Schema({
  email : String,
  phone : String,
  name : String,
 })
 const bookingModel = mongoose.model('AgentRegistration',bookingSchema)
 //------------------------------------------------booking api--------------------------------------------------
 app.post("/apply",async(req,res)=>{
  console.log(req.body)
  const data = await bookingModel(req.body)
    const datasave = await data.save()
     res.send({message : "Registration was succesful"})
 })

app.listen(PORT,()=> console.log("Server is running at :" + PORT))