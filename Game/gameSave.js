// This function creates a new save file in your database.
async function createNewSave(gameState) {
    // Build an SQL INSERT query for the SaveFile table.
    // IMPORTANT: In a real game, sanitize these values to avoid SQL injection.
    const query = `INSERT INTO SaveFile (Name, Score, Slot, UserID, RoomID)
                   VALUES ('${gameState.saveName}', ${gameState.score}, '${gameState.slot}', ${gameState.userID}, ${gameState.roomID})`;
  
    // Create URL-encoded parameters to send to dbConnector.php.
    const params = new URLSearchParams();
    params.append("hostname", "localhost"); // Usually 'localhost' on your hosting account.
    params.append("username", "bmooney07");    // Your DB username.
    params.append("password", "rf8DJtRFn47Ywyjg");    // Your DB password.
    params.append("database", "bmooney07");    // Your database name.
    params.append("query", query);
  
    try {
      // Send a POST request to your dbConnector.php.
      const response = await fetch('https://bmooney07.webhosting1.eeecs.qub.ac.uk/dbConnector.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
  
      const result = await response.json();
      console.log("New Save Response:", result);
      
      // If your gameState includes inventory data, save it as well.
      if (gameState.inventory && gameState.inventory.length > 0) {
        // Assume the inserted SaveFile record ID is returned as result.insert_id.
        const saveID = result.insert_id;
        await saveInventory(saveID, gameState.inventory);
      }
    } catch (error) {
      console.error("Error creating new save:", error);
    }
}
  
// This function saves inventory items into the InventoryPart table.
async function saveInventory(saveID, inventoryArray) {
    // Build a VALUES string for inserting multiple rows.
    // Each row consists of the SaveID and an ItemID.
    const values = inventoryArray.map(itemID => `(${saveID}, ${itemID})`).join(", ");
    const query = `INSERT INTO InventoryPart (SaveID, ItemID) VALUES ${values}`;
  
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
