import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:model");

/**
 * TODO:
 * - Methoden implementieren, welche Ticket-Bestell-Daten in DB speichern und ggf. abrufbar machen (z. B. für eine Bestellbestätigung als Popup oder so)
 * - Alle Events laden implementieren
*/

/**
 * Loads all Events.
 * @param {DB} dbData
 * @returns {Object[]} – All Events.
 */
export async function getAllEvents(db) {
  const sql = `
      SELECT * FROM ticketInfos
    `;
  const allItems = await db.queryEntries(sql);
  return allItems;
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
    "INSERT INTO ticketInfos (vorname, name, strasse, plz, stadt, mail, veranstaltungsID) VALUES (:vorname, :name, :street, :postcode, :city, :mail, :veranstaltungen)";
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
export async function addEvent(db, newEntry) {
  const sql =
    "INSERT INTO veranstaltungen (name, datum, preis, beschreibung, uhrzeit) VALUES (:title, :date, :price, :description, :time)";
  console.log(newEntry);
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
  console.log(newEntry);
  const result = await db.query(sql, newEntry);
  return db.lastInsertRowId;
}

/**
 * 
 * @param {DB} db 
 * @param {String} username 
 * @returns {String} 
 */
export async function getCredentials(db, username) {
  console.log("Username for DB: " + username);
  const sql =
    `
    SELECT password FROM userLoginData WHERE
    EXISTS (SELECT 1 FROM userLoginData WHERE username=:username);
    `;
  const result = await db.query(sql, {username: username});
  console.log("Result" + result + "Type: " + typeof(result));
  if(result[0] == null) {
    console.log(`Keinen Eintrag unter ${username} gefunden`);
    
  } else {
    return result[0][0];
  }
}
