// creates a new save file in database using dynamic game state variables.
async function saveGame(gameState) {
    const params = new URLSearchParams();
    params.append("hostname", "localhost"); 
    params.append("username", "bmooney07");   
    params.append("password", "rf8DJtRFn47Ywyjg");    
    params.append("database", "CSC1034_CW_17"); 
    
    const CheckExitingSaveQuery = `SELECT SaveID FROM SaveFile WHERE Username = "${gameState.userName}"`
    params.append("query", CheckExitingSaveQuery);

    try {
      // Send a POST request to dbConnector.php.
      const response = await fetch('https://bmooney07.webhosting1.eeecs.qub.ac.uk/dbConnector.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
      const result = await response.json();

      if (result.data.length > 0) {
        //Update Save
        const updateQuery = `UPDATE SaveFile SET Energy = ${gameState.energy}, RoomID = ${gameState.roomID}, Time = ${gameState.time} WHERE UserName = "${gameState.userName}"`;
        params.set("query", updateQuery)

      } else {
        // Create New Save
        const insertquery = `INSERT INTO SaveFile (Energy, UserName, RoomID, Time) VALUES (${gameState.energy}, "${gameState.userName}", ${gameState.roomID}, ${gameState.time})`;
        console.log(insertquery)
        params.set("query", insertquery)
      }
      
    } catch (error) {
      console.error("Error checking save:", error);
    }

    try {
      // Send a POST request to dbConnector.php.
      const response = await fetch('https://bmooney07.webhosting1.eeecs.qub.ac.uk/dbConnector.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
  
      const result = await response.json();
      console.log("New Save Response:", result);
      
      // Include inventory data when ryan is done
      if (gameState.inventory && gameState.inventory.length > 0) {
        // Assume the inserted SaveFile record ID is returned as result.insert_id.
        const saveID = result.insert_id;
        await saveInventory(saveID, gameState.inventory);
      }
    } catch (error) {
      console.error("Error creating new save:", error);
    }


}

// save inventory items into the InventoryPart table.
async function saveInventory(saveID, inventoryArray) {
    const values = inventoryArray.map((itemID, slot) => `(${saveID}, ${itemID})`).join(", ");
    const deletequery = `DELETE FROM InventoryPart WHERE SaveID= ${saveID};`;
    const insertquery = `INSERT INTO InventoryPart (SaveID, ItemID) VALUES ${values}`;
    const query =   deletequery + insertquery

    const params = new URLSearchParams();
    params.append("hostname", "localhost");
    params.append("username", "bmooney07");
    params.append("password", "rf8DJtRFn47Ywyjg");
    params.append("database", "bmooney07");
    params.append("query", query);
  
    try {
      const response = await fetch('https://bmooney07.webhosting1.eeecs.qub.ac.uk/dbConnector.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
      const result = await response.json();
      console.log("Save Inventory Response:", result);
    } catch (error) {
      console.error("Error saving inventory:", error);
    }
}
