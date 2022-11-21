import { debug as Debug } from "https://deno.land/x/debug/mod.ts";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:model");

/**
 * TODO: Methoden implementieren, welche Ticket-Bestell-Daten in DB speichern und ggf. abrufbar machen (z. B. für eine Bestellbestätigung als Popup oder so)
 */

/**
 * Loads all notes.
 * @param {DB} dbData – All notes.
 * @returns {Object[]} – All notes.
 */
 export async function getAll (db) {
    const sql = `
      SELECT * FROM ticketInfos
    `;
    const newItems = await db.queryEntries(sql);
    return newItems;
  }

  /**
 * Add a note.
 * @param {DB} db – All notes.
 * @param {number} db – Note to add.
 */
export async function add (db, newNote) {
    const sql = "INSERT INTO ticketInfos (vorname, name, strasse, plz, stadt, mail, veranstlatungsID) VALUES (:vorname, :name, :strasse, :plz, :stadt, :mail, :veranstlatungsID)";
    console.log(newNote);
    const result = await db.query(sql, newNote);
    return db.lastInsertRowId;
  }