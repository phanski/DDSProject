
const currentUserID=prompt("Enter User ID: ");
document.addEventListener("DOMContentLoaded",()=>{
    loadSetting();
});

async function loadSetting(){
    let volumeData=await fetchSettings(`SELECT volume FROM Users WHERE UserID= ${currentUserID} `);
    if (volumeData){
        setVolume(volumeData.volume);
    }
    let fontSize=await fetchSettings(`SELECT fontSize FROM Users WHERE UserID= ${currentUserID} `);
    if (fontSize){
        setFontSize(fontSize.fontSize);
    }
    let fontFamily=await fetchSettings(`SELECT fontFamily FROM Users WHERE UserID= ${currentUserID} `);
    if (fontFamily){
        setFontFamily(fontFamily.fontFamily);
    }
}

function setVolume(value){
    value/=100;
    let audioElements=document.getElementsByTagName("audio");
    if (audioElements.length!=0){
        for (let i=0;i<audioElements.length;i++){
            audioElements[i].volume=value;
        }
    }
    else{
        return;
    }
}

function setFontSize(value){
    let elements=document.querySelectorAll("*:not(i)");
    let size;
    if (value==="Small"){
        size=1;
    }else if (value==="Medium"){
        size=1.5;
    }else if (value==="Large"){
        size=1.75;
    }else if (value==="Extra Large"){
        size=2;
    }else{
        console.error("Error Raised when fetching data");
        return;
    }
    for (let i=0;i<elements.length;i++){
        try{
            elements[i].style.fontSize=(size+"vw");
        }catch{
            continue;
        }
    }
}

function setFontFamily(value){
    let elements=document.querySelectorAll("*:not(i)");
    for (let i=0;i<elements.length;i++){
        try{
            elements[i].style.fontFamily=value;
        }catch{
            continue;
        }
    }
}

async function fetchSettings(dbQuery){
    try{
        let response = await fetch("https://jmurray65.webhosting1.eeecs.qub.ac.uk/dbConnector.php", {
            method: 'POST',
            body: new URLSearchParams({
                hostname: 'localhost',
                username: 'jmurray65',
                password: '9BtNTkGhcczgCzJQ',
                database: 'jmurray65',
                query: dbQuery
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