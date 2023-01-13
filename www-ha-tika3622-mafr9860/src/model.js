import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:model");

/**
 * TODO:
 * - Methoden implementieren, welche Ticket-Bestell-Daten in DB speichern und ggf. abrufbar machen (z. B. für eine Bestellbestätigung als Popup oder so)
 * - Alle Events laden implementieren
*/

/**
 * Loads all Tickets.
 * @param {DB} dbData
 * @returns {Object[]}
 */
export async function getAllTickets(db) {
  const sql = `
      SELECT * FROM ticketInfos
    `;
  const allItems = await db.queryEntries(sql);
  return allItems;
}

/**
 * Loads all Events
 * @param {DB} dbData
 * @returns {Object[]}
 */
export async function getAllEvents(db) {
  const sql = `
      SELECT * FROM veranstaltungen
    `;
  const allItems = await db.queryEntries(sql);
  return allItems;
}

/**
 * 
 * @param {*} db 
 * @param {*} newEntry 
 * @returns 
 */
export async function addEvent(db, newEntry) {
  const sql =
    "INSERT INTO veranstaltungen (name, datum, preis, beschreibung, uhrzeit, bild) VALUES (:title, :date, :price, :description, :time, :img)";
  console.log(newEntry);
  const result = await db.query(sql, newEntry);
  return db.lastInsertRowId;
}

/**
 * 
 * @param {*} db 
 * @param {*} newEntry 
 * @returns 
 */
export async function deleteEvent(db, data) {
  const sql =
    "DELETE FROM veranstaltungen WHERE name=:name";
  const result = await db.query(sql, {name: data.title});
  return db.lastInsertRowId;
}

/**
 * 
 * @param {*} db 
 * @param {*} newEntry 
 * @returns 
 */
export async function updateEvent(db, newEntry) {
  const sql =
    `
    UPDATE veranstaltungen
    SET 
        datum = :date,
        preis = :price,
        beschreibung = :description,
        uhrzeit = :time,
        bild = :img
    WHERE
        name = :title
    `;
  //console.log(newEntry);
  const result = await db.query(sql, {
    date: newEntry.date,
    price: newEntry.price,
    description: newEntry.description,
    time: newEntry.time,
    title: newEntry.title,
    img: newEntry.img
  });
  return db.lastInsertRowId;
}


/**
 * 
 * @param {DB} db 
 * @returns {Object[]} – All Comments.
 */
export async function getAllComments(db) {
  const sql = `
    SELECT * FROM userComments
  `;
  const allItems = await db.queryEntries(sql);
  return allItems;
}

/**
 * 
 * @param {*} db 
 * @param {*} newEntry 
 * @returns 
 */
export async function addTicket(db, newEntry) {
  const sql =
    "INSERT INTO ticketInfos (salutation, vorname, name, strasse, nr, plz, stadt, mail, veranstaltungsID, newsletter) VALUES (:salutation, :vorname, :name, :street, :nr, :postcode, :city, :mail, :veranstaltungen, :newsletter)";
  //console.log(newEntry);
  const result = await db.query(sql, newEntry);
  return db.lastInsertRowId;
}


/**
 * 
 * @param {DB} db 
 * @param {*} newEntry 
 * @returns
 */
export async function addComment(db, newEntry) {
  const sql =
  "INSERT INTO userComments (username, comment) VALUES (:username, :comment)";
  console.log(newEntry.comment);
  const profanity = profanityFilter(newEntry.comment);
  console.log(profanity);
  if(!profanity){
    const result = await db.query(sql, newEntry);    
  }
  return db.lastInsertRowId;
}

export function profanityFilter(input) {
  const inputData = input.toLowerCase();
  const inputDataSplitted = inputData.split(' ');
  console.log(inputDataSplitted);
  const profanityArray = ['penis', 'scheiße', 'profanity'];
  return profanityArray.some((element) => inputDataSplitted.includes(element));
}

/**
 * 
 * @param {DB} db 
 * @param {String} username 
 * @returns {String} 
 */
export async function getCredentials(db, username) {
  //console.log("Username for DB: " + username);
  const sql =
    `
    SELECT password FROM userLoginData WHERE
    EXISTS (SELECT 1 FROM userLoginData WHERE username=:username);
    `;
  const result = await db.query(sql, {username: username});
  //console.log("Result in Model: " + result + " Type: " + typeof(result));
  if(result[0] == null) {
    console.log(`Keinen Eintrag unter ${username} gefunden`);
    
  } else {
    return result[0][0];
  }
}

export async function getUserById(db, id) {
  const sql = `
  SELECT username FROM userSession
  WHERE sessionId=:id
  `;
  const result = await db.query(sql, {id: id});
  console.log(`
  Session ID: ${id}
  Session Username: ${result}
  `);
  return result;
}
