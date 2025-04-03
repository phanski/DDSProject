
async function OpenInventory() {
    try {
        let GameWindow = document.getElementById("GameWindow")
        let inventoryPartNames = []; 
        let inventoryPartIDs = []; 

        let response = await fetch(DatabaseConnectionData.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                hostname: DatabaseConnectionData.hostname,
                username: DatabaseConnectionData.username,
                password: DatabaseConnectionData.password,
                database: DatabaseConnectionData.database,

                //

                
                // query: `SELECT i.Name, i.ItemID FROM InventoryPart ip JOIN Item i ON ip.ItemID = i.ItemID WHERE ip.SaveID = 1` // // change to saveid when login finished
                
                query: `SELECT i.Name, i.ItemID FROM SaveFile sf JOIN InventoryPart ip ON sf.SaveID = ip.SaveID JOIN Item i ON ip.ItemID = i.ItemID WHERE sf.UserName = "${sessionStorage.getItem('LoggedInUser')}"`
                //
            
            })

        })

        const data = await response.json();
        for (let i = 0; i < data.data.length; i++) {
            
            inventoryPartNames.push(data.data[i].Name);
            inventoryPartIDs.push(data.data[i].ItemID);
            
        
        }
        

        const InventoryPopUp = 
    `<div id="Overlay">
        <div id="OverlayMessage">
            <h1>Inventory</h1>
            <div id="InventoryGrid">
                ${generateInventoryGrid(inventoryPartNames, inventoryPartIDs)}
            </div>
            <div style="display: flex; justify-content: space-around; max-width: 500px; width: 100%;">
                <button class="OverlayButton" id="ExitInventory">Resume</button>
            </div>
        </div>
    </div>`
        GameWindow.insertAdjacentHTML('beforeend', InventoryPopUp)
        
        let exitInv = document.getElementById('ExitInventory')
        exitInv.addEventListener('click', ExitInventory)
        // return InventoryPopUp;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function ExitInventory() {
    let GameWindow = document.getElementById("GameWindow")
    let Overlay = GameWindow.lastChild
    
    GameWindow.removeChild(Overlay)
}


//________________________________________________________________________________________________________________________________________________________________________

/**
 * Generates the HTML for the inventory grid
 * @param {Array} inventory - Array of item names
 */
function generateInventoryGrid(inventory, ids) {
    const gridSize = 8; // 4x4 grid
    let gridHTML = `<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: 400px; height: 200px; margin: 0 auto; border: 2px solid #ccc; padding: 10px;">`;
    
    for (let i = 0; i < gridSize; i++) {
        const item = inventory[i] || null;
        const id = ids[i] || null; // get the id of the item

        //change "i" to item id 

        gridHTML += ` 
            <div id=${item} class="item" onclick="itemAction(${id})">
                ${item ? `<span style="color: #AAAAAA; text-align: center;">${item}</span>` : ''}
            </div>
        `;
    }
    
    gridHTML += '</div>';
    return gridHTML;
}



function itemAction(id) {
    ExitInventory();
    //TO DO: query the database for the function of the item using the item name - can be a function that exists e.g. when EnergyPack is pressed, its function field has AddEnergy(5) in it, so AddEnergy(5) is called, simultaneously EnergyPack is removed from the inventory
    if (id==1||id==2||id==3) { // id of energy pack
        AddEnergy(5);
        executeDatabaseQuery(`DELETE FROM InventoryPart WHERE ItemID = ${id} AND SaveID = (SELECT SaveID FROM SaveFile WHERE UserName = "${sessionStorage.getItem('LoggedInUser')}")`) // sql only required for consumable items - change hardcoded to saveid when login finished
        console.log("here")
        // executeDatabaseQuery(`DELETE FROM InventoryPart WHERE ItemID = ${id} AND ${saveID} = 1`)
        // SavePlayerData()



        let message = document.getElementById("Message")
        let oldMessage = message.children[0].textContent



        ShowMessage("You have gained 5 energy from the Energy Pack!");
        DisplayMessageAfterDelay(oldMessage);
    } 
    // else if (id==8) {
        // note with answers
    // }

    // to add more items, just add an else if statement with the id of the item and the function you want to call when it is clicked.

}

/**
 * Checks if item is in inventory
 * @param {integer} id - ID of the item to check
 * @returns {boolean} present - True if item is present, false otherwise
 */
function checkInventory(id) {
    // console.log(GameState.inventory)
    // executeDatabaseQuery(`SELECT * FROM InventoryPart WHERE ItemID = ${id} AND SaveID = (SELECT SaveID FROM SaveFile WHERE UserName = "${sessionStorage.getItem('LoggedInUser')}")`).then((result) => { // change saveid
    //     console.log(result.data)
    console.log(id.toString())
    console.log(`Index of id in inventory: ${GameState.inventory.indexOf(id.toString())}`)
    console.log(`Inventory (checkInventory): ${GameState.inventory}`)
    if (GameState.inventory.indexOf(id.toString()) != -1) { // check if the item id is in the inventory array
        console.log("Item is in inventory")
        return true;
    } else {
        console.log("Item is not in inventory")
        return false;
    }
    // }

    // ).catch((error) => {
    //     console.error('Error checking inventory:', error);
    //     return false; // Error occurred, assume item is not present
    // });
}