import React,{useEffect, useState} from 'react';
import Pagination from './Pagination';
import {Link} from 'react-router-dom';
import {paginate} from './paginate';
import '../style/table.css';
import {db,firebaseApp, firebase} from "../firebase.js"
import { useScrollTrigger } from '@material-ui/core';


const MoviesPage = (props) =>{
    var mygroup=props.location.state.group;
    var user=props.location.state.user;

    async function getch(){
        var groups=[];
        var challenges=[];
        var state=[];
        var mileages=[];
        await db.collection("Groups").get().then((querySnapshot)=>{
            querySnapshot.forEach((doc)=>{
                groups.push(doc.id);
                challenges.push([doc.data().challenge]);
                mileages.push([doc.data().mileage]);
            });
        });
        var mychallenge=[];
        var mymileage=0;
        for (var i=0;i<groups.length;i++){
            if(groups[i]==mygroup) {
                mychallenge=challenges[i];
                mymileage=mileages[i];
            }
        }
        
        return [mychallenge,mymileage];
    }
    
    const [mychallenges,setChallenge]=useState([]);
    const [mymileage,setMileages]=useState([]);
    useEffect(()=>{
        async function fetchAndSetUser(){
            const data=await getch();
            await setChallenge(data[0][0]);
            await setMileages(data[1][0]);
        } 
        fetchAndSetUser();
    })
    //console.log(mychallenges)
    //console.log(mymileage)
    
    var state=[];
    var mystate=[];
    for (var idx=0;idx<mychallenges.length;idx++){
        state.push([mychallenges[idx].send,mychallenges[idx].accept])
    }
    ////console.log(state);
    for (var i=0;i<state.length;i++){
        var check="";
        if(state[i][0]==1 && state[i][1]==1) check="accepted";
        else if(state[i][0]==1 && state[i][1]==0) check="wait";
        else if(state[i][0]==0) check="receive";
        else if(state[i][1]==2) check="win";
        else if(state[i][1]==3) check="lose";
        else if(state[i][1]==4) check="tie";
        mystate.push(check);
    }
    //console.log(mystate);

    var gg=[];
    for (var k=0;k<mychallenges.length;k++){
        const ele={
            date: mychallenges[k].date,
            withgroup:mychallenges[k].withgroup,
            bet: mychallenges[k].bet,
            state:mystate[k]
        }
        gg.push(ele);
    }
    function lose_button(index){
        var docRef=db.collection("Groups").doc(mygroup);
        
        mychallenges[index].accept=3; //3->lose

        const store=mychallenges;

        docRef.update({
            challenge: firebase.firestore.FieldValue.delete()
        });
        for (var i=0;i<store.length;i++){
            var new_challenge={
                accept:store[i].accept,
                bet:store[i].bet,
                contents:store[i].contents,
                date:store[i].date,
                send:store[i].send,
                withgroup:store[i].withgroup
            }
            docRef.update({
                challenge:firebase.firestore.FieldValue.arrayUnion(new_challenge)
            });
        }
        docRef.update({
            mileage: mymileage-mychallenges[index].bet
        });
    }
    function win_button(index){
        var docRef=db.collection("Groups").doc(mygroup);
        
        mychallenges[index].accept=2; //2->win

        const store=mychallenges;

        docRef.update({
            challenge: firebase.firestore.FieldValue.delete()
        });
        for (var i=0;i<store.length;i++){
            var new_challenge={
                accept:store[i].accept,
                bet:store[i].bet,
                contents:store[i].contents,
                date:store[i].date,
                send:store[i].send,
                withgroup:store[i].withgroup
            }
            docRef.update({
                challenge:firebase.firestore.FieldValue.arrayUnion(new_challenge)
            });
        }
        docRef.update({
            mileage: mymileage+mychallenges[index].bet
        });
    }
    function tie_button(index){
        var docRef=db.collection("Groups").doc(mygroup);
        
        mychallenges[index].accept=4; //4->tie

        const store=mychallenges;

        docRef.update({
            challenge: firebase.firestore.FieldValue.delete()
        });
        for (var i=0;i<store.length;i++){
            var new_challenge={
                accept:store[i].accept,
                bet:store[i].bet,
                contents:store[i].contents,
                date:store[i].date,
                send:store[i].send,
                withgroup:store[i].withgroup
            }
            docRef.update({
                challenge:firebase.firestore.FieldValue.arrayUnion(new_challenge)
            });
        }
    }

    for (var l=0;l<mystate.length;l++){
        if(mystate[l]=="accepted"){
            const index=l;
            gg[l].state=<div><Link to={{pathname :'./win', state : {group: props.location.state.group, user:props.location.state.user}}}><button className = "win" onClick={(e)=>win_button(index)}>WIN!</button></Link>&nbsp;&nbsp;<button className = "lose" onClick={(e)=>lose_button(index)}>LOSE</button>&nbsp;&nbsp;<button className = "tie" onClick={(e)=>tie_button(index)}>TIE</button></div>
        }
        else if(mystate[l]=="wait") gg[l].state=<div className="wait">Challenge Sent!</div>
        else if(mystate[l]=="receive") gg[l].state=<div><button className = "win">WIN!</button>&nbsp;&nbsp;<button className = "lose">LOSE</button>&nbsp;&nbsp;<button className = "tie">TIE</button></div>
        else if(mystate[l]=="win") gg[l].state=<div>win</div>
        else if(mystate[l]=="lose") gg[l].state=<div>lose</div>
        else if(mystate[l]=="tie") gg[l].state=<div>tie</div>
    }

    const getMovies = () => {
        const movies = mychallenges;
        return movies;
    }
    
    const [movies, setMovies] = useState({
        data: getMovies(),
        pageSize: 5,
        currentPage: 1
    });

    const handlePageChange = (page) => {
        setMovies({...movies, currentPage: page});
    }
    const{ data, pageSize, currentPage } = movies;
    const pageMovies = paginate(data, currentPage, pageSize);

    const {length: count } = movies.data;


    return (
        <>
            <header className = "App-header">
            <div className="menu-bar"></div>
            <div className="team-name"> HELLO BADMINTON </div>
            <div className="mileage"> {mymileage} </div>
            <div className="m">mileage</div>
            <Link to={{pathname :'./mileage', state : {group: props.location.state.group, user:props.location.state.user}}}><button className="mm1">MILEAGE</button></Link>
            <Link to={{pathname :'./challenge', state : {group: props.location.state.group, user:props.location.state.user}}}><button className="mm2">CHALLENGE</button></Link>
            <Link to={{pathname :'./management', state : {group: props.location.state.group, user:props.location.state.user}}}> <button className="mm3">MANAGEMENT</button> </Link>             
            {/* <div className = "table_shape"></div> */}
            <div className = "table_shape"></div>
            <div className = "table_line"></div>
            <table className="table">
                <thread>
                    <tr>
                        <th width = "230">DATE</th>
                        <th width = "300">Group Name</th>
                        <th width = "220">Betting Mileage</th>
                        <th width = "300">State</th>
                    </tr>
                
                <tbody>
                    {gg.map(movie =>
                        <tr key={movie.id} width = "600">
                            <td width = "230" text-align = 'center'>{movie.date}</td>
                            <td width = "300" text-align = 'center'>{movie.withgroup}</td>
                            <td width = "220" text-align = 'center'>{movie.bet}</td>
                            <td width = "300" text-align = 'center'> {movie.state}</td>
                        </tr>
                    )}
                </tbody>
                </thread>
            </table>
            <Pagination
                pageSize = {pageSize}
                itemsCount = {count}
                currentPage = {currentPage}
                onPageChange = {handlePageChange}                
            />
          </header>
  
        </>
    );
};

export default MoviesPage;