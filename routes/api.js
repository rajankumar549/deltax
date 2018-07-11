var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://ublnwsksqhcwnw:0d1499a2a35e401634be5a748b86b8ded71cfa0520f87f46e204257fbeeb0dd3@ec2-54-83-3-101.compute-1.amazonaws.com:5432/d6kr93qtci8vou?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory')

/* GET home page. */
router.post('/query',function(req, res, next){
	console.log("started");
	var query = req.body.query
	console.log(query);
db.any(query)
  .then(function (data) {
    console.log(data);
    res.send({'data':data});
  })
  .catch(function (error) {
    console.log('ERROR:', error);
    res.send({'data':error});
  })

});
router.get('/v1/getMovieList',function(req, res, next){
	console.log("started");
	
query="insert into person(person_name,sex,dob,bio,role) values('Rajan','M','1997-09-29','qwertyuiopasdfghjklzxcvbnm','Actor');";
//query="drop table person;drop table movies ;"
//query="drop table person CASCADE;drop table movies CASCADE;"
//query="CREATE TABLE movies (   movie_id  SERIAL PRIMARY KEY,movie_name text,   yor DATE,   plot text,   poster text,   actor integer[],producer integer REFERENCES person,created_on TIMESTAMP default current_timestamp);";
//query="CREATE TABLE person (   person_id  SERIAL PRIMARY KEY, person_name text,   sex text,   dob DATE,  bio text,   role text,created_on TIMESTAMP default current_timestamp);";
query="select * from person;"
db.any(query)
  .then(function (data) {
    console.log(data);
    res.send({'data':data});
  })
  .catch(function (error) {
    console.log('ERROR:', error);
    res.send({'data':data});
  })

});


router.get('/get_movieList',function(req, res, next){
	query="select * , ARRAY(select person_name from person where person_id = any (movies.actor)) as actor_list from movies;"
	db.any(query)
	  .then(function (data) {
	    console.log(data);
	    res.render('index',{'data':data});
	  })
	  .catch(function (error) {
	    console.log('ERROR:', error);
	    res.send({'status':500,'data':''});
	  })

});

router.get('/get_movie',function(req, res, next){
	var m_id= req.query.movie_id;
	query="select * ,ARRAY(select person_name from person where person_id = any (movies.actor)) as actor_list from movies where movie_id= $1;"
	db.one(query,[m_id])
	  .then(function (data) {
	    console.log(data);
	    res.render('movie_form',{'data':data});
	  })
	  .catch(function (error) {
	    console.log('ERROR:', error);
	    res.send({'status':500,'data':''});
	  })

});
router.post('/update_movie',function(req, res, next){
	var m_id=req.body.movie_id;
    var m_name=req.body.movie_name;
    var m_yor=req.body.movie_yor;
    var m_plot = req.body.movie_plot;
    var m_poster = req.body.movie_poster;
    var m_actor = req.body.movie_actor;
    var m_producer = req.body.movie_producer;
    if(m_id && m_name && m_yor && m_plot && m_poster && m_actor && m_producer){

	query="update movies set movie_name=$1,yor=$2,plot=$3,poster=$4,actor=$5,producer=$6 where movie_id=$7"
	db.any(query,[m_name, m_yor, m_plot, m_poster, m_actor, m_producer, m_id])
	  .then(function (data) {
	    console.log(data);
	    res.send({'status':200,'msg':"Sucessfully updated"});
	  })
	  .catch(function (error) {
	    console.log('ERROR:', error);
	    res.send({'status':500,'msg':"failed"});
	  })
	}
	else{
		res.send({'status':500,'msg':"Not vaild Params",'data':req.params});
	}
});
router.post('/add_movie',function(req, res, next){
	console.log(req.body);
    var m_name=req.body.movie_name;
    var m_yor=req.body.movie_yor;
    var m_plot = req.body.movie_plot;
    var m_poster = req.body.movie_poster;
    var m_actor= req.body.movie_actor;
    var m_producer = req.body.movie_producer;
    if(m_actor){
    	if(typeof(m_actor) == 'object')
    		m_actor=m_actor.map(x => parseInt(x));
    	else
    		m_actor = [parseInt(m_actor)];
    }
    //console.log(m_name && m_yor && m_plot && m_poster && m_actor && m_producer);
    if(m_name && m_yor && m_plot && m_poster && m_actor && m_producer){

	query="insert into movies(movie_name, yor, plot,poster,actor,producer) values ($1,$2, $3, $4, $5, $6);";
	db.any(query,[m_name, m_yor, m_plot, m_poster, m_actor, m_producer])
	  .then(function (data) {
	    console.log(data);
	    res.send({'status':200,'msg':"Sucessfully updated"});
	  })
	  .catch(function (error) {
	    console.log('ERROR:', error);
	    res.send({'status':500,'msg':"failed"});
	  })
	}
	else{
		res.send({'status':500,'msg':"Not vaild Params",'data':req.params});
	}
});
router.post('/delete_movie',function(req, res, next){
	var m_id = req.body.movie_id;
	//console.log(req.body)
	var query = "delete from movies where movie_id=$1";
	if(m_id){
		db.any(query,[m_id])
			  .then(function (data) {
			    console.log(data);
			    res.send({'status':200,'msg':"movies Deleted"});
			  })
			  .catch(function (error) {
			    console.log('ERROR:', error);
			    res.send({'status':500,'data':'','msg':'query failed'});
			  })
			}
	else{
		console.log(req.query);
		res.send({'status':500,'msg':"Not vaild Params"});
	}
});


//Person CRUD
router.get('/get_person',function(req, res, next){
	var p_id = req.query.person_id;
	var query = "select * from person where person_id=$1";
	if(p_id){
		db.one(query,[p_id])
			  .then(function (data) {
			    console.log(data);
			    res.send({'status':200,'data':data});
			  })
			  .catch(function (error) {
			    console.log('ERROR:', error);
			    res.send({'status':500,'data':'','msg':'query failed'});
			  })
			}
	else{
		console.log(req.query);
		res.send({'status':500,'msg':"Not vaild Params"});
	}
});
router.post('/update_person',function(req, res, next){
	console.log(req.body);
	console.log(req.params);
	console.log(req.query);
	var p_id=req.body.person_id;
    var p_name=req.body.person_name;
    var p_sex=req.body.person_sex;
    var p_dob = req.body.person_dob;
    var p_bio = req.body.person_bio;
    var p_role = req.body.person_role;
    if(p_id && p_name && p_sex && p_dob && p_role && p_bio ){

	query="update person set person_name=$1,sex=$2,dob=$3,bio=$4,role=$5 where person_id=$6"
	db.any(query,[p_name, p_sex, p_dob, p_bio, p_role, p_id])
	  .then(function (data) {
	    console.log(data);
	    res.send({'status':200,'msg':"Sucessfully updated"});
	  })
	  .catch(function (error) {
	    console.log('ERROR:', error);
	    res.send({'status':500,'msg':"failed"});
	  })
	}
	else{
		res.send({'status':500,'msg':"Not vaild Params"});
	}
});
router.post('/add_person',function(req, res, next){
	console.log(req.body);
	console.log(req.params);
	console.log(req.query);
	var p_id=req.body.person_id;
    var p_name=req.body.person_name;
    var p_sex=req.body.person_sex;
    var p_dob = req.body.person_dob;
    var p_bio = req.body.person_bio;
    var p_role = req.body.person_role;
    if(p_id && p_name && p_sex && p_dob && p_role && p_bio ){

	query="insert into person(person_name,sex,dob,bio,role) values ($1,$2,$3,$4,$5)";
	db.any(query,[p_name, p_sex, p_dob, p_bio, p_role])
	  .then(function (data) {
	    console.log(data);
	    res.send({'status':200,'msg':"Sucessfully added"});
	  })
	  .catch(function (error) {
	    console.log('ERROR:', error);
	    res.send({'status':500,'msg':"failed"});
	  })
	}
	else{
		res.send({'status':500,'msg':"Not vaild Params"});
	}
});
router.post('/delete_person',function(req, res, next){
	var p_id = req.body.person_id;
	var query = "delete from person where person_id=$1";
	if(p_id){
		db.any(query,[p_id])
			  .then(function (data) {
			    console.log(data);
			    res.send({'status':200,'msg':"person Deleted"});
			  })
			  .catch(function (error) {
			    console.log('ERROR:', error);
			    res.send({'status':500,'data':'','msg':'query failed'});
			  })
			}
	else{
		console.log(req.query);
		res.send({'status':500,'msg':"Not vaild Params"});
	}
});

module.exports = router;
//CREATE TABLE person (   movie_id integer PRIMARY KEY,movie_name text,   yor DATE,   plot text,   poster text,   actor integer[] ELEMENT REFERENCES person,producer integer ELEMENT REFERENCES person,created_on TIMESTAMP default current_timestamp);
//CREATE TABLE person (   person_id integer PRIMARY KEY, person_name text,   sex text,   dob DATE,  bio text,   role text,created_on TIMESTAMP default current_timestamp);")