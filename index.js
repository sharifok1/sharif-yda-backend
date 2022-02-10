const express = require('express');
const { MongoClient } = require("mongodb");
const cors = require('cors');
const { query } = require('express');
const app = express();
require('dotenv').config();
const  ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000
app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.he93e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.he93e.mongodb.net:27017,cluster0-shard-00-01.he93e.mongodb.net:27017,cluster0-shard-00-02.he93e.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-zjbd4y-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
  try {
    await client.connect();
    const database = client.db('hostelManagment');
    const studentsDataCollection = database.collection('students');
    const foodDataCollection = database.collection('foods');
    const servedStudentDataCollection = database.collection('servedStudent');

   //Post method for students Method (single document)-----------API--Post
   app.post('/students', async(req,res)=>{
    const students = req.body;
    const result = await studentsDataCollection.insertOne(students);
    res.send(result);
   
  })
  //Get Metod  get all students---------------------API--get all
  app.get('/students', async(req, res)=>{
    const roll = req.query.roll;
    const query = {roll:roll};
    let students
    if(query){
       students = studentsDataCollection.find(query);
    }
    
       students = studentsDataCollection.find({});
    
    
    const currentPage = req.query.currentPage;
    const size = parseInt(req.query.size);
    let result;
    if(currentPage){
      result =await students.skip(currentPage*size).limit(size).toArray();
    }
    else{
      result = await students.toArray();
    }
    
    const count = await students.count()
    res.send({
      count,
      result
    })
  })
   //Post method for food -------------Post--food
   app.post('/foods', async(req,res)=>{
    const foods = req.body;
    const result = await foodDataCollection.insertOne(foods);
    res.send(result);
    
  })
  
  //Get Metod  get all foods---------------------API--get all
 app.get('/foods', async(req, res)=>{
  const foods = foodDataCollection.find({});
  const currentPage = req.query.currentPage;
  const size = parseInt(req.query.size);
  let result;
  if(currentPage){
    result =await foods.skip(currentPage*size).limit(size).toArray();
  }
  else{
    result = await foods.toArray();
  }
  const count = await foods.count()
  res.send({
    count,
    result
  })
})

// student food served data///
app.post('/servedStudent', async(req,res)=>{
  const servedStudent = req.body;
  const result = await servedStudentDataCollection.insertOne(servedStudent);
  res.send(result);
  console.log(result);
})
//served api search----------------------------------search
app.get('/findServed',async(req,res)=>{
  const roll = req.query.roll;
  const query = {roll:roll};
  const student = servedStudentDataCollection.find(query);
  const result = await student.toArray();
  res.send(result);
  console.log(result);
})

// get all serve and --------------------------------------server--none serve students//
app.get('/servedStudent', async(req, res)=>{
  const date = req.query.addDate;
  const shift = req.query.shift;
  const roll = req.query.roll;
  const query = {roll:roll};
  const servedStudent = servedStudentDataCollection.find(query);
  const currentPage = req.query.currentPage;
  const size = parseInt(req.query.size);
  let result;
  if(currentPage){
    result =await servedStudent.skip(currentPage*size).limit(size).toArray();
  }
  else{
    result = await servedStudent.toArray();
  } 
  const count = await servedStudent.count()
  res.send({
    count,
    result
  })
})

  //Delete Method  delete a doc---------------------------API--Delete---food
  app.delete('/foods/:id', async(req, res)=>{
    const id = req.params.id;
    const query = {_id:ObjectId(id)};
    const result = await foodDataCollection.deleteOne(query);
    res.json(result); 
  })
  //Delete Method  delete a doc---------------------------API--Delete---student
  app.delete('/students/:id', async(req, res)=>{
    const id = req.params.id;
    const query = {_id:ObjectId(id)};
    const result = await studentsDataCollection.deleteOne(query);
    res.json(result); 
  })
  //put method Update a document -----------------------------update served
  app.put('/servedStudent/served', async(req,res)=>{
    const id = req.body.id;
    const served = req.body.served;
    const date = req.body.date;
    const shift = req.body.shift;
    const foodCode = req.body.foodCode;
    const updateStatus = await servedStudentDataCollection.updateOne({
      _id:ObjectId(id)},
      {$set:{
        served:served,
        date:date,
        shift:shift,
        foodCode:foodCode,
      }},
      {upsert: true});
    res.json(updateStatus);
   
  })
    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/' , (req, res)=>{
  res.json('hostel server is running');
})

app.listen(port, ()=> {
  console.log('hostel server is running and listing from',port)
})
