//GLOBAL
var currentUserID=2;

let fontTypes={
    "0":"Arial",
    "1":"Courier New",
    "2":"Times New Roman"
}

let fontSizes={
    "0":"Small",
    "1":"Medium",
    "2":"Large",
    "3":"Extra Large"
}

//DEFAULT SETTINGS VALUES
const defaultVolume=50;
const defaultFont=1;

var volumeControl=document.getElementById("volume-slide");
var volumeValue=document.getElementById("volume-value");

volumeValue.innerHTML=volumeControl.value;

volumeControl.oninput=function(){
    volumeValue.innerHTML=this.value;
    try{
        setAllAudio();
    }catch{
        return;
    }
}

//Functions to run when window loads
window.onload=async ()=>{

    let volumeData=await fetchData(`SELECT volume FROM Users WHERE UserID= ${currentUserID} `);
    if (volumeData){
        dbVolume(volumeData.volume);
    }
    let fontSize=await fetchData(`SELECT fontSize FROM Users WHERE UserID= ${currentUserID} `);
    if (fontSize){
        dbFontSize(fontSize.fontSize);
    } 
    let fontFamily=await fetchData(`SELECT fontFamily FROM Users WHERE UserID= ${currentUserID} `);
    if (fontFamily){
        dbFontFamily(fontFamily.fontFamily);
    }
};


function setAllAudio(){
    let audioElements=document.getElementsByTagName("audio");
    for (let i=0;i<audioElements.length;i++){
        audioElements[i].volume=setVolume();
    }
}

function setVolume(){
    let value=document.getElementById("volume-slide").value;
    value/=100;
    return value;
}

function dbVolume(dbValue){
    document.getElementById("volume-slide").value=dbValue;
    document.getElementById("volume-value").innerHTML=dbValue;
    setVolume();
}

var fontControl=document.getElementById("font-slide");

fontControl.oninput=function(){
    changeFontSize();
}

var fontFamilyControl=document.getElementById("font-type");

fontFamilyControl.oninput=function(){
    changeFontFamily()
}

function restoreDefaultSettings(){
    //Volume
    volumeControl.value=defaultVolume;
    volumeValue.innerHTML=defaultVolume;

    //Font Size
    fontControl.selectedIndex=1
    changeFontSize();

    //Font Family
    fontFamilyControl.selectedIndex=0;
    changeFontFamily();
}

function changeFontSize(){
    let select=document.getElementById("font-slide");
    let size=select[select.selectedIndex].value;
    let body=document.querySelectorAll("*");
    for (let i=0;i<body.length;i++){
        try{
            body[i].style.fontSize=(size+"vw");
        }catch{
            continue;
        }
    }
}

function dbFontSize(dbValue){
    let select=document.getElementById("font-slide");
    if (dbValue==="Small"){
        select.selectedIndex=0;
        changeFontSize();
    }else if( dbValue==="Medium"){
        select.selectedIndex=1;
        changeFontSize();
    }else if(dbValue==="Large"){
        select.selectedIndex=2;
        changeFontSize();
    }else if(dbValue==="Extra Large"){
        select.selectedIndex=3;
        changeFontSize();
    }else{
        console.log(dbValue);
    }
}

function changeFontFamily(){
    let select=document.getElementById("font-type");
    let font=select[select.selectedIndex].value;
    let body=document.querySelectorAll("*");
    for (let i=0;i<body.length;i++){
        try{
            body[i].style.fontFamily=font;
        }catch{
            continue;
        }
    }
}

function dbFontFamily(dbValue){
    let select=document.getElementById("font-type");
    if(dbValue==="Arial"){
        select.selectedIndex=0;
        changeFontFamily();
    }else if(dbValue==="Courier New"){
        select.selectedIndex=1;
        changeFontFamily();
    }else if(dbValue==="Times New Roman"){
        select.selectedIndex=2;
        changeFontFamily();
    }else{
        console.log(dbValue);
    }
    
}

function saveSettings(){
    let volumeValue=document.getElementById("volume-slide").value;
    let fontSizeValue=fontSizes[document.getElementById("font-slide").selectedIndex];
    let fontFamilyValue=document.getElementById("font-type").value;

    saveData([volumeValue,fontSizeValue,fontFamilyValue]);
}

//Database and SQL
async function fetchData(sqlQuery){
    try{
        let response = await fetch("https://jmurray65.webhosting1.eeecs.qub.ac.uk/dbConnector.php", {
            method: 'POST',
            body: new URLSearchParams({
                hostname: 'localhost',
                username: 'jmurray65',
                password: '9BtNTkGhcczgCzJQ',
                database: 'jmurray65',
                query: sqlQuery
            })
        });
        let result= await response.json();
        if (result.error){
            console.log(result.error.toString());
        }else if(result.data){
            return result.data[0];
        }else{
            console.log("Query Reached Else")
        }
    }catch(error){
        console.error(error);
    }
}

async function saveData(values){
    try{
        let response = await fetch("https://jmurray65.webhosting1.eeecs.qub.ac.uk/dbConnector.php", {
            method: 'POST',
            body: new URLSearchParams({
                hostname: 'localhost',
                username: 'jmurray65',
                password: '9BtNTkGhcczgCzJQ',
                database: 'jmurray65',
                query: `UPDATE Users SET volume=${values[0]}, fontSize="${values[1]}", fontFamily="${values[2]}" WHERE UserId=${currentUserID} `
            })
        });
        let result= await response.json();
        if (result.success){
            console.log("Update successful");
        }else{
            console.error("Error raised from update", result);
        }
    }catch(error){
        console.error(error);
    }
}