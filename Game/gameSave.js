// creates a new save file in database using dynamic game state variables.
async function saveGame(gameState) {
    const deletequery = `DELETE FROM SaveFile WHERE Username = "${gameState.userName}";`
    const insertquery = `INSERT INTO SaveFile (Energy, UserName, RoomID, Time)
                   VALUES (${gameState.energy}, '${gameState.userName}', ${gameState.roomID}, ${gameState.time})`;
    
    const query = deletequery + insertquery

    const params = new URLSearchParams();
    params.append("hostname", "localhost"); 
    params.append("username", "bmooney07");   
    params.append("password", "rf8DJtRFn47Ywyjg");    
    params.append("database", "bmooney07"); 
    params.append("query", query);
  
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
    const values = inventoryArray.map((itemID, slot) => `(${saveID}, ${itemID}, ${slot})`).join(", ");
    const deletequery = `DELETE FROM InventoryPart WHERE SaveID= ${saveID};`;
    const insertquery = `INSERT INTO InventoryPart (SaveID, ItemID, InventorySlot) VALUES ${values}`;
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
