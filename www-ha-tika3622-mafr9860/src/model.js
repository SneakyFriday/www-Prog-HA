import { debug as Debug } from "https://deno.land/x/debug/mod.ts";
import * as path from "https://deno.land/std@0.152.0/path/posix.ts";
import * as mediaTypes from "https://deno.land/std@0.151.0/media_types/mod.ts";

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
export async function getAll(db) {
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
export async function addTicket(db, newEntry) {
  const sql =
    "INSERT INTO ticketInfos (vorname, name, strasse, plz, stadt, mail, veranstaltungsID) VALUES (:vorname, :name, :street, :postcode, :city, :mail, :veranstaltungen)";
  console.log(newEntry);
  const result = await db.query(sql, newEntry);
  return db.lastInsertRowId;
}

/**
 * Add a note.
 * @param {DB} db – All notes.
 * @param {number} db – Note to add.
 */
export async function addEvent(db, newEntry) {
  const sql =
    "INSERT INTO veranstaltungen (name, datum, preis, beschreibung, uhrzeit) VALUES (:title, :date, :price, :description, :time)";
  console.log(newEntry);
  const result = await db.query(sql, newEntry);
  return db.lastInsertRowId;
}
